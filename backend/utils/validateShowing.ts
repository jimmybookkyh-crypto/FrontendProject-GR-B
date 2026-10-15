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
