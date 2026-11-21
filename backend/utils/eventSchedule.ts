import { checkShowingOverlap } from "./validateShowing.js";
import type { ExistingShowing } from "../interface/types.js";

export const EVENT_ORDER = [10, 11, 12] as const;
export const MIN_UPCOMING_PERIODS = 2;

export type EventPeriodDraft = {
  eventId: number;
  startDate: string; 
  endDate: string;
};

export function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function parseDateString(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function addDays(value: string, days: number): string {
  const date = parseDateString(value);
  date.setUTCDate(date.getUTCDate() + days);
  return toDateString(date);
}

export function secondMonday(year: number, month: number): string {
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const weekday = firstOfMonth.getUTCDay(); 
  const daysToFirstMonday = (8 - weekday) % 7;
  return toDateString(new Date(Date.UTC(year, month - 1, 1 + daysToFirstMonday + 7)));
}

export function periodForMonth(
  eventId: number,
  year: number,
  month: number,
): EventPeriodDraft {
  const startDate = secondMonday(year, month);
  return { eventId, startDate, endDate: addDays(startDate, 6) };
}

export function nextEventId(eventId: number): number {
  const index = EVENT_ORDER.indexOf(eventId as (typeof EVENT_ORDER)[number]);
  if (index === -1) return EVENT_ORDER[0];
  return EVENT_ORDER[(index + 1) % EVENT_ORDER.length];
}

export function monthAfter(value: string): { year: number; month: number } {
  const [year, month] = value.split("-").map(Number);
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

export function periodsOverlap(
  a: { startDate: string; endDate: string },
  b: { startDate: string; endDate: string },
): boolean {
  return a.startDate <= b.endDate && b.startDate <= a.endDate;
}

export const ROLLING_SCHEDULE_START = "2027-01-01";

const MAX_MONTHS_TO_TRY = 24;

export function planEventPeriods(
  existing: EventPeriodDraft[],
  today: string,
): EventPeriodDraft[] {
  const isRolling = (p: EventPeriodDraft) =>
    (EVENT_ORDER as readonly number[]).includes(p.eventId);

  const latest = existing
    .filter(isRolling)
    .reduce<EventPeriodDraft | null>(
      (latestSoFar, p) =>
        latestSoFar === null || p.startDate > latestSoFar.startDate ? p : latestSoFar,
      null,
    );

  let upcoming = existing.filter(
    (p) =>
      isRolling(p) && p.startDate > today && p.startDate >= ROLLING_SCHEDULE_START,
  ).length;

  let eventId = latest ? nextEventId(latest.eventId) : EVENT_ORDER[0];
  let { year, month } = latest
    ? monthAfter(latest.startDate)
    : { year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) };

  const [rollingYear, rollingMonth] = ROLLING_SCHEDULE_START.split("-").map(Number);
  if (year < rollingYear || (year === rollingYear && month < rollingMonth)) {
    year = rollingYear;
    month = rollingMonth;
  }

  const taken = [...existing];
  const planned: EventPeriodDraft[] = [];

  for (let i = 0; i < MAX_MONTHS_TO_TRY && upcoming < MIN_UPCOMING_PERIODS; i++) {
    const period = periodForMonth(eventId, year, month);

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
  date: string; 
  time: string; 
  eventId: number;
};

export function isWeekend(value: string): boolean {
  const weekday = parseDateString(value).getUTCDay();
  return weekday === 0 || weekday === 6;
}

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
