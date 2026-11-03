import { ExistingShowing, NewShowingCheck } from "../interface/types";
export function isPositiveInt(value: unknown): boolean {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

export function isNullableInt(value: unknown): boolean {
  return value === null || (typeof value === "number" && Number.isInteger(value));
}

export function isValidDate(value: unknown): boolean {
  if (typeof value !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(value);
  return !isNaN(date.getTime());
}

export function isValidTime(value: unknown): boolean {
  if (typeof value !== "string") return false;
  if (!/^\d{2}:\d{2}$/.test(value)) return false;

  const [h, m] = value.split(":").map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

export function validateShowingInput(input: {
  movieId?: unknown;
  auditoriumId?: unknown;
  date?: unknown;
  time?: unknown;
  eventId?: unknown;
}): string | null {

  if (input.movieId !== undefined && !isPositiveInt(input.movieId)) {
    return "Ogiltigt movieId";
  }

  if (input.auditoriumId !== undefined && !isPositiveInt(input.auditoriumId)) {
    return "Ogiltigt auditoriumId";
  }

  if (input.eventId !== undefined && !isNullableInt(input.eventId)) {
    return "Ogiltigt eventId";
  }

  if (input.date !== undefined && !isValidDate(input.date)) {
    return "Ogiltigt datum";
  }

  if (input.time !== undefined && !isValidTime(input.time)) {
    return "Ogiltig tid";
  }

  return null;
}
 
export function parseShowingDateTime(dateStr: string, timeStr: string): Date {
  const cleanTime = timeStr.split("+")[0].split("Z")[0]; // Remove timezone if present
 return new Date(`${dateStr}T${cleanTime}`);
}

export function checkShowingOverlap(
  newShowing: NewShowingCheck,
  existingShowings: ExistingShowing[]
):
  boolean {
  const DEFAULT_CLEANING_TIME = 20;
  const cleaning = newShowing.cleaningTimeMinutes ?? DEFAULT_CLEANING_TIME;

  // start and end time of the new showing 
  const newStart = parseShowingDateTime(newShowing.date, newShowing.time).getTime();
  const totalDurationMinutes = newShowing.movieDurationMinutes + cleaning;
  const newEnd = newStart + totalDurationMinutes * 60 * 1000;

  // check against excisting showings in the same auditorium and date
  return existingShowings.some((existing) => { ;
    // Ignorera den egna visningen vid PATCH/UPDATE
    if (
      newShowing.showingIdToExclude &&
      existing.showingId === newShowing.showingIdToExclude
    ) {
      return false;
    }
    if (existing.auditoriumId !== newShowing.auditoriumId) {
      return false;
    }
    // count start and end time of the existing showing with cleaning time
    const existingStart = parseShowingDateTime(existing.date, existing.time).getTime();
    const existingTotalMinutes = existing.movieDurationMinutes + DEFAULT_CLEANING_TIME;
    const existingEnd = existingStart + existingTotalMinutes * 60 * 1000;

    // Check for overlap start end time
    return newStart < existingEnd && newEnd > existingStart;
  });
}