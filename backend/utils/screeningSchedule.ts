import {
  addDays, isWeekend, parseDateString, WEEKDAY_EVENT_SLOTS, WEEKEND_EVENT_SLOTS,
  type EventPeriodDraft, type ShowingSlot,
} from "./eventSchedule.js";
import { checkShowingOverlap } from "./validateShowing.js";
import type { ExistingShowing } from "../interface/types.js";

export const WEEKS_AHEAD = 4;
export const FAMILY_MAX_AGE_RATING = 7;
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
  date: string;
  time: string;
};

export function isClosedDay(date: string): boolean {
  return CLOSED_DAYS.includes(date.slice(5));
}

export function isInPeriod(date: string, periods: EventPeriodDraft[]): boolean {
  return periods.some((p) => p.startDate <= date && date <= p.endDate);
}

export function slotsForDay(
  date: string,
  inEventPeriod: boolean,
): ScreeningSlot[] {
  if (inEventPeriod)
    return isWeekend(date) ? EVENT_WEEKEND_SLOTS : EVENT_WEEKDAY_SLOTS;
  return isWeekend(date) ? WEEKEND_SLOTS : WEEKDAY_SLOTS;
}

function dayNumber(date: string): number {
  return Math.round(parseDateString(date).getTime() / 86_400_000);
}

export function pickFilm<T>(
  pool: T[],
  date: string,
  slotIndex: number,
  slotsPerDay: number,
): T {
  const step = slotsPerDay % pool.length === 0 ? slotsPerDay + 1 : slotsPerDay;
  const index = (dayNumber(date) * step + slotIndex) % pool.length;
  return pool[index];
}

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
    const familySlots =
      familyPool.length > 0 ? slots.filter((s) => s.family) : [];
    const otherSlots = slots.filter((s) => !familySlots.includes(s));

    const nonFamilyPool = regularPool.filter((f) => !familyPool.includes(f));
    const otherPool =
      familySlots.length > 0 && nonFamilyPool.length > 0
        ? nonFamilyPool
        : regularPool;

    for (const slot of slots) {
      const useFamily = familySlots.includes(slot);
      const film = useFamily
        ? pickFilm(
            familyPool,
            date,
            familySlots.indexOf(slot),
            familySlots.length,
          )
        : pickFilm(
            otherPool,
            date,
            otherSlots.indexOf(slot),
            otherSlots.length,
          );

      const alreadyHasShowing = taken.some(
        (s) =>
          s.auditoriumId === slot.auditoriumId &&
          s.date === date &&
          s.time === slot.time,
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
      });
      taken.push({
        showingId: -planned.length,
        auditoriumId: slot.auditoriumId,
        date,
        time: slot.time,
        movieDurationMinutes: film.length,
      });
    }
  }

  return planned;
}
