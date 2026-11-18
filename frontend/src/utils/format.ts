import { formatShortDate } from "./date.ts";

const priceFormat = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number): string {
  return priceFormat.format(amount);
}

export function formatShowing(date: string, time: string): string {
  return `${formatShortDate(date)}, kl. ${time.slice(0, 5)}`;
}

export function formatSeats(
  seats: { seatsRow: number; seatsNumber: number }[],
): string[] {
  const seatsByRow = new Map<number, number[]>();

  for (const seat of seats) {
    const seatNumbers = seatsByRow.get(seat.seatsRow) ?? [];
    seatNumbers.push(seat.seatsNumber);
    seatsByRow.set(seat.seatsRow, seatNumbers);
  }

  return [...seatsByRow.entries()]
    .sort(([a], [b]) => a - b)
    .map(
      ([row, seatNumbers]) =>
        `Rad ${row}: stol ${seatNumbers.sort((a, b) => a - b).join(", ")}`,
    );
}

export function formatTicketTypes(types: string[]): string {
  const counts = new Map<string, number>();
  for (const ticketType of types)
    counts.set(ticketType, (counts.get(ticketType) ?? 0) + 1);

  return [...counts.entries()]
    .map(([ticketType, n]) => `${n} ${ticketType.toLowerCase()}`)
    .join(", ");
}

export const formatDate = (dateString?: string): string => {
  if (!dateString) return "";

  if (dateString.includes("T")) {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      // sv-SE ger formatet ÅÅÅÅ-MM-DD
      return date.toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" });
    }
  }
  return dateString;
};

export const formatTime = (timeString?: string): string => {
  if (!timeString) return "";

  const cleanTime = timeString.split("+")[0].split("-")[0];
  const parts = cleanTime.split(":");

  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }

  return timeString;
};

const periodFormats = {
  long: new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "long" }),
  short: new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "short" }),
};

export function formatPeriod(
  start: string,
  end: string,
  month: "long" | "short" = "long",
): string {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);

  const format = (date: Date) =>
    periodFormats[month].format(date).replace(/\./g, "");
  const endText = format(endDate);

  if (start === end) return endText;
  if (startDate.getMonth() === endDate.getMonth()) {
    return `${startDate.getDate()}–${endText}`;
  }
  return `${format(startDate)}–${endText}`;
}

const weekdayDateFormat = new Intl.DateTimeFormat("sv-SE", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

export function formatWeekdayDate(date: string): string {
  return weekdayDateFormat
    .format(new Date(`${date}T00:00:00`))
    .replace(/\./g, "");
}

export function formatFullDate(date: string): string {
  return new Date(date).toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
