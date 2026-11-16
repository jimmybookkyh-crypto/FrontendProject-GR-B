/* Gemensam formatering med svenska inställningar.
   Använd samma funktioner på Mina sidor och bekräftelsesidan, så ser det likadant ut. */
import { formatShortDate } from "./date.ts";

const priceFormat = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

/* 360 -> "360 kr", 1240 -> "1 240 kr" */
export function formatPrice(amount: number): string {
  return priceFormat.format(amount);
}

/* "2026-10-26" + "18:30" -> "mån 26 okt kl. 18:30" */
export function formatShowing(date: string, time: string): string {
  return `${formatShortDate(date)} kl. ${time.slice(0, 5)}`;
}

/* Grupperar stolar per rad: [{rad 5, stol 7}, {rad 5, stol 8}] -> "Rad 5: stol 7, 8" */
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

/* Antal biljetter per typ: ["Vuxen", "Vuxen", "Barn"] -> "2 vuxen, 1 barn" */
export function formatTicketTypes(types: string[]): string {
  const counts = new Map<string, number>();
  for (const ticketType of types)
    counts.set(ticketType, (counts.get(ticketType) ?? 0) + 1);

  return [...counts.entries()]
    .map(([ticketType, n]) => `${n} ${ticketType.toLowerCase()}`)
    .join(", ");
}

// Omvandlar "2026-10-23T22:00:00.000Z" eller "2026-10-24" till "2026-10-24".
// Ett datum med tid (ISO) räknas om till svensk tid. Backend skickar midnatt
// svensk tid som 22:00 dagen innan i UTC, så att bara klippa vid "T" ger en dag fel.
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

// Omvandlar "15:00:00+01" eller "15:00:00" till "15:00"
export const formatTime = (timeString?: string): string => {
  if (!timeString) return "";

  const cleanTime = timeString.split("+")[0].split("-")[0];
  const parts = cleanTime.split(":");

  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }

  return timeString;
};

// Datumintervall med långt eller kort månadsnamn
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
  // Kort format ger "okt." - ta bort punkten
  const format = (date: Date) =>
    periodFormats[month].format(date).replace(/\./g, "");
  const endText = format(endDate);

  if (start === end) return endText;
  if (startDate.getMonth() === endDate.getMonth()) {
    return `${startDate.getDate()}–${endText}`;
  }
  return `${format(startDate)}–${endText}`;
}
