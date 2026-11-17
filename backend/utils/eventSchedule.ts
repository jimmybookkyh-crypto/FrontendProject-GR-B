/* Regler för det rullande eventschemat (T197, beslutat 16/11)
   Rena funktioner utan databas, så att de går att testa fristående.

   - En eventperiod per månad
   - Andra veckan i månaden: måndag–söndag, med start på månadens andra måndag
   - Turordning: 10 Spindelveckan → 11 Mörkrets riddare → 12 Avengers Assemble → 10 …
   - Alltid minst två kommande perioder

   Alla datum hanteras som strängar "YYYY-MM-DD" och räknas i UTC,
   så att svensk tidszon och sommartid aldrig flyttar ett datum en dag. */

import { checkShowingOverlap } from "./validateShowing.js";
import type { ExistingShowing } from "../interface/types.js";

export const EVENT_ORDER = [10, 11, 12] as const;
export const MIN_UPCOMING_PERIODS = 2;

export type EventPeriodDraft = {
  eventId: number;
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
};

/* Date (UTC) -> "YYYY-MM-DD" */
export function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/* "YYYY-MM-DD" -> Date (UTC midnatt) */
export function parseDateString(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function addDays(value: string, days: number): string {
  const date = parseDateString(value);
  date.setUTCDate(date.getUTCDate() + days);
  return toDateString(date);
}

/* Månadens andra måndag. month är 1–12.
   secondMonday(2027, 1) -> "2027-01-11" */
export function secondMonday(year: number, month: number): string {
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const weekday = firstOfMonth.getUTCDay(); // 0 = söndag, 1 = måndag …
  const daysToFirstMonday = (8 - weekday) % 7;
  return toDateString(new Date(Date.UTC(year, month - 1, 1 + daysToFirstMonday + 7)));
}

/* Perioden (måndag–söndag) för en viss månad */
export function periodForMonth(
  eventId: number,
  year: number,
  month: number,
): EventPeriodDraft {
  const startDate = secondMonday(year, month);
  return { eventId, startDate, endDate: addDays(startDate, 6) };
}

/* Nästa event i turordningen: 10 -> 11 -> 12 -> 10.
   Okänt eventId ger första eventet i listan. */
export function nextEventId(eventId: number): number {
  const index = EVENT_ORDER.indexOf(eventId as (typeof EVENT_ORDER)[number]);
  if (index === -1) return EVENT_ORDER[0];
  return EVENT_ORDER[(index + 1) % EVENT_ORDER.length];
}

/* Året och månaden efter datumets månad.
   "2026-12-07" -> { year: 2027, month: 1 } */
export function monthAfter(value: string): { year: number; month: number } {
  const [year, month] = value.split("-").map(Number);
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

/* Två perioder överlappar om ingen av dem slutar innan den andra börjar */
export function periodsOverlap(
  a: { startDate: string; endDate: string },
  b: { startDate: string; endDate: string },
): boolean {
  return a.startDate <= b.endDate && b.startDate <= a.endDate;
}

/* Det rullande schemat börjar i januari 2027. Befintliga perioder före dess
   (t.ex. Avengers Assemble 7–20 dec 2026) ändras inte och räknas inte. */
export const ROLLING_SCHEDULE_START = "2027-01-01";

/* Säkerhetsgräns så att loopen aldrig kan snurra för evigt */
const MAX_MONTHS_TO_TRY = 24;

/* Räknar ut vilka perioder som ska läggas in.
   existing: alla rader i eventPeriods (alla event, även test-event)
   today:    dagens datum i Stockholm, "YYYY-MM-DD"

   Säkert att köra flera gånger: finns redan två kommande perioder
   blir resultatet en tom lista. */
export function planEventPeriods(
  existing: EventPeriodDraft[],
  today: string,
): EventPeriodDraft[] {
  const isRolling = (p: EventPeriodDraft) =>
    (EVENT_ORDER as readonly number[]).includes(p.eventId);

  // Senaste perioden för något av de tre eventen styr turordningen
  const latest = existing
    .filter(isRolling)
    .reduce<EventPeriodDraft | null>(
      (latestSoFar, p) =>
        latestSoFar === null || p.startDate > latestSoFar.startDate ? p : latestSoFar,
      null,
    );

  // Kommande = har inte börjat än och ingår i det rullande schemat
  let upcoming = existing.filter(
    (p) =>
      isRolling(p) && p.startDate > today && p.startDate >= ROLLING_SCHEDULE_START,
  ).length;

  let eventId = latest ? nextEventId(latest.eventId) : EVENT_ORDER[0];
  let { year, month } = latest
    ? monthAfter(latest.startDate)
    : { year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) };

  // Börja aldrig före januari 2027
  const [rollingYear, rollingMonth] = ROLLING_SCHEDULE_START.split("-").map(Number);
  if (year < rollingYear || (year === rollingYear && month < rollingMonth)) {
    year = rollingYear;
    month = rollingMonth;
  }

  const taken = [...existing];
  const planned: EventPeriodDraft[] = [];

  for (let i = 0; i < MAX_MONTHS_TO_TRY && upcoming < MIN_UPCOMING_PERIODS; i++) {
    const period = periodForMonth(eventId, year, month);

    // Hoppa över månader som redan har börjat eller som krockar med en befintlig
    // period. Samma event provas då nästa månad, så turordningen hålls.
    const isInFuture = period.startDate > today;
    const isFree = !taken.some((p) => periodsOverlap(p, period));

    if (isInFuture && isFree) {
      planned.push(period);
      taken.push(period);
      upcoming++;
      eventId = nextEventId(eventId);
    }

    ({ year, month } = monthAfter(period.startDate));
  }

  return planned;
}

/* ---------- Eventvisningar under en period (T197) ----------
   Hela eventveckan är event (beslutat 17/11, som Avengers 7–13 dec):
   - Måndag–fredag: salong 1 kl. 15:00 och 19:00, salong 2 kl. 16:00 och 20:00
   - Lördag–söndag: salong 1 kl. 11:30, 15:00, 19:00, salong 2 kl. 12:30, 16:00, 20:00 */

export type ShowingSlot = { auditoriumId: number; time: string };

export const WEEKDAY_EVENT_SLOTS: ShowingSlot[] = [
  { auditoriumId: 1, time: "15:00" },
  { auditoriumId: 2, time: "16:00" },
  { auditoriumId: 1, time: "19:00" },
  { auditoriumId: 2, time: "20:00" },
];

export const WEEKEND_EVENT_SLOTS: ShowingSlot[] = [
  { auditoriumId: 1, time: "11:30" },
  { auditoriumId: 2, time: "12:30" },
  ...WEEKDAY_EVENT_SLOTS,
];

export type EventFilm = { movieId: number; length: number };

export type EventShowingDraft = {
  movieId: number;
  auditoriumId: number;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM", lokal svensk tid
  eventId: number;
};

/* Lördag och söndag */
export function isWeekend(value: string): boolean {
  const weekday = parseDateString(value).getUTCDay();
  return weekday === 0 || weekday === 6;
}

/* Räknar ut vilka eventvisningar som ska läggas in för en period.
   films:    eventets filmer (från tidigare visningar med samma eventId)
   existing: alla visningar under periodens datum, i båda salongerna

   - Filmerna fördelas i turordning över alla tider i perioden,
     så samma film visas aldrig två gånger i rad i samma salong
   - En tid som redan har en visning hoppas över (säkert att köra flera gånger)
   - Krockkontroll med städtid via checkShowingOverlap, samma som i showings.ts */
export function planEventShowings(
  period: EventPeriodDraft,
  films: EventFilm[],
  existing: ExistingShowing[],
): EventShowingDraft[] {
  if (films.length === 0) return [];

  const sortedFilms = [...films].sort((a, b) => a.movieId - b.movieId);
  const taken = [...existing];
  const planned: EventShowingDraft[] = [];
  let slotIndex = 0;

  for (let date = period.startDate; date <= period.endDate; date = addDays(date, 1)) {
    const slots = isWeekend(date) ? WEEKEND_EVENT_SLOTS : WEEKDAY_EVENT_SLOTS;

    for (const slot of slots) {
      const film = sortedFilms[slotIndex % sortedFilms.length];
      slotIndex++;

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

      planned.push({
        movieId: film.movieId,
        auditoriumId: slot.auditoriumId,
        date,
        time: slot.time,
        eventId: period.eventId,
      });
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
