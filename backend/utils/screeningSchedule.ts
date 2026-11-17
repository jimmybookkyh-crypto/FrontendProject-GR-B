/* Regler för vanliga visningar (T193)
   Rena funktioner utan databas, så att de går att testa fristående.

   Visningsmall (samma som visningarna för nov–dec 2026):
   - Vardag (mån–fre): 15:00 salong 1, 16:00 salong 2, 19:00 salong 1, 20:00 salong 2
   - Helg (lör–sön):   12:00 salong 1 och 13:00 salong 2 är familjefilmer,
                       sedan 15:30/16:30 och 19:00/20:00
   - Eventhelg:        11:30/12:30, 15:00/16:00 och 19:00/20:00
                       (eventvisningarna läggs in av T197, här fylls bara lediga tider)
   - Salong 2 startar alltid en timme efter salong 1
   - Stängt julafton (24/12) och nyårsafton (31/12) */

import {
  addDays,
  isWeekend,
  parseDateString,
  WEEKDAY_EVENT_SLOTS,
  WEEKEND_EVENT_SLOTS,
  type EventPeriodDraft,
  type ShowingSlot,
} from "./eventSchedule.js";
import { checkShowingOverlap } from "./validateShowing.js";
import type { ExistingShowing } from "../interface/types.js";

/* Hur långt framåt kalendern ska vara fylld */
export const WEEKS_AHEAD = 4;

/* Familjefilmer = åldersgräns 7 eller lägre
   (The Incredibles, Incredibles 2, Spider-Verse-filmerna, The Lego Batman Movie) */
export const FAMILY_MAX_AGE_RATING = 7;

/* Stängda dagar, "MM-DD" */
export const CLOSED_DAYS = ["12-24", "12-31"];

export type ScreeningSlot = ShowingSlot & { family?: boolean };

export const WEEKDAY_SLOTS: ScreeningSlot[] = [
  { auditoriumId: 1, time: "15:00" },
  { auditoriumId: 2, time: "16:00" },
  { auditoriumId: 1, time: "19:00" },
  { auditoriumId: 2, time: "20:00" },
];

export const WEEKEND_SLOTS: ScreeningSlot[] = [
  { auditoriumId: 1, time: "12:00", family: true },
  { auditoriumId: 2, time: "13:00", family: true },
  { auditoriumId: 1, time: "15:30" },
  { auditoriumId: 2, time: "16:30" },
  { auditoriumId: 1, time: "19:00" },
  { auditoriumId: 2, time: "20:00" },
];

/* Under en eventvecka används eventets tider, så att vanliga visningar
   aldrig krockar med eventvisningarna */
export const EVENT_WEEKDAY_SLOTS: ScreeningSlot[] = WEEKDAY_EVENT_SLOTS;
export const EVENT_WEEKEND_SLOTS: ScreeningSlot[] = WEEKEND_EVENT_SLOTS;

export type RepertoireFilm = {
  movieId: number;
  length: number;
  ageRating: number | null;
};

export type ScreeningDraft = {
  movieId: number;
  auditoriumId: number;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM", lokal svensk tid
};

export function isClosedDay(date: string): boolean {
  return CLOSED_DAYS.includes(date.slice(5));
}

export function isInPeriod(date: string, periods: EventPeriodDraft[]): boolean {
  return periods.some((p) => p.startDate <= date && date <= p.endDate);
}

/* Vilka tider som gäller en viss dag */
export function slotsForDay(date: string, inEventPeriod: boolean): ScreeningSlot[] {
  if (inEventPeriod) return isWeekend(date) ? EVENT_WEEKEND_SLOTS : EVENT_WEEKDAY_SLOTS;
  return isWeekend(date) ? WEEKEND_SLOTS : WEEKDAY_SLOTS;
}

/* Dagnummer räknat från 1970-01-01, används för rotationen */
function dayNumber(date: string): number {
  return Math.round(parseDateString(date).getTime() / 86_400_000);
}

/* Väljer film för en tid. Varje tid får nästa film i listan varje dag,
   så samma film hamnar aldrig på samma tid två dagar i rad.
   Samma datum och tid ger alltid samma film, oavsett hur ofta skriptet körs. */
export function pickFilm<T>(pool: T[], date: string, slotIndex: number, slotsPerDay: number): T {
  // Om antalet filmer går jämnt upp i antalet tider skulle samma film
  // hamna på samma tid varje dag. Då flyttas steget ett extra snäpp.
  const step = slotsPerDay % pool.length === 0 ? slotsPerDay + 1 : slotsPerDay;
  const index = (dayNumber(date) * step + slotIndex) % pool.length;
  return pool[index];
}

/* Räknar ut vilka vanliga visningar som ska läggas in.
   fromDate–toDate: datumen som ska vara fyllda
   films:           filmer i den vanliga repertoaren (movies.current = true)
   existing:        alla visningar under datumen, i båda salongerna
   eventPeriods:    eventperioder som överlappar datumen

   Säkert att köra flera gånger: tider som redan har en visning hoppas över,
   och krockar med städtid kontrolleras med checkShowingOverlap. */
export function planScreenings(
  fromDate: string,
  toDate: string,
  films: RepertoireFilm[],
  existing: ExistingShowing[],
  eventPeriods: EventPeriodDraft[],
): ScreeningDraft[] {
  const regularPool = [...films].sort((a, b) => a.movieId - b.movieId);
  if (regularPool.length === 0) return [];

  const familyPool = regularPool.filter(
    (f) => f.ageRating !== null && f.ageRating <= FAMILY_MAX_AGE_RATING,
  );

  const taken = [...existing];
  const planned: ScreeningDraft[] = [];

  for (let date = fromDate; date <= toDate; date = addDays(date, 1)) {
    if (isClosedDay(date)) continue;

    const slots = slotsForDay(date, isInPeriod(date, eventPeriods));
    // Finns inga familjefilmer används vanliga filmer även på familjetiderna
    const familySlots = familyPool.length > 0 ? slots.filter((s) => s.family) : [];
    const otherSlots = slots.filter((s) => !familySlots.includes(s));

    // Dagar med familjetider: övriga tider får andra filmer än familjefilmerna,
    // så samma film inte visas två gånger samma dag
    const nonFamilyPool = regularPool.filter((f) => !familyPool.includes(f));
    const otherPool =
      familySlots.length > 0 && nonFamilyPool.length > 0 ? nonFamilyPool : regularPool;

    for (const slot of slots) {
      const useFamily = familySlots.includes(slot);
      const film = useFamily
        ? pickFilm(familyPool, date, familySlots.indexOf(slot), familySlots.length)
        : pickFilm(otherPool, date, otherSlots.indexOf(slot), otherSlots.length);

      const alreadyHasShowing = taken.some(
        (s) => s.auditoriumId === slot.auditoriumId && s.date === date && s.time === slot.time,
      );
      if (alreadyHasShowing) continue;

      const overlaps = checkShowingOverlap(
        {
          auditoriumId: slot.auditoriumId,
          date,
          time: slot.time,
          movieDurationMinutes: film.length,
        },
        taken.filter((s) => s.date === date),
      );
      if (overlaps) continue;

      planned.push({ movieId: film.movieId, auditoriumId: slot.auditoriumId, date, time: slot.time });
      taken.push({
        showingId: -planned.length, // tillfälligt id, finns inte i databasen än
        auditoriumId: slot.auditoriumId,
        date,
        time: slot.time,
        movieDurationMinutes: film.length,
      });
    }
  }

  return planned;
}
