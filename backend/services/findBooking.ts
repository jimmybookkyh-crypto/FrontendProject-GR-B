import { pool } from "../db/pool.js";
import type { Booking } from "../interface/types.js";

/* En biljett i en bokning, med stolens rad och nummer samt biljettypens namn och pris */
export type BookingTicket = {
  ticketId: string; // bigint kommer som text från pg
  seatId: string;
  seatsRow: number;
  seatsNumber: number;
  ticketTypeId: string;
  ticketType: string; // t.ex. "Vuxen"
  price: number;
};

export type BookingWithTickets = Booking & { tickets: BookingTicket[] };

/* Bokningsnummer skapas i createBooking.ts som 8 tecken 0-9 och A-F, t.ex. "3F9A0C1B" */
const BOOKING_NUMBER_PATTERN = /^[0-9A-F]{8}$/;

/* Tar bort mellanslag, gör om till versaler och kollar formatet.
   Så fungerar även "3f9a0c1b". Returnerar null om numret är ogiltigt. */
export function parseBookingNumber(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const bookingNumber = value.trim().toUpperCase();
  return BOOKING_NUMBER_PATTERN.test(bookingNumber) ? bookingNumber : null;
}

/* Hämtar biljetterna i en bokning, sorterade på rad och stolsnummer.
   Används av både GET /bookings/:id och GET /bookings/number/:bookingNumber */
export async function getBookingTickets(
  bookingId: number | string,
): Promise<BookingTicket[]> {
  const { rows } = await pool.query<BookingTicket>(
    `select t."ticketId", t."seatId", s."seatsRow", s."seatsNumber",
        t."ticketTypeId", tt.name as "ticketType", tt.price
      from tickets t
      join seats s on s."seatId" = t."seatId"
      join "ticketTypes" tt on tt."ticketTypeId" = t."ticketTypeId"
      where t."bookingId" = $1
      order by s."seatsRow", s."seatsNumber"`,
    [bookingId],
  );

  return rows;
}

/* Slår upp en bokning via bokningsnumret.
   Returnerar bokningen med biljetter, eller null om den inte finns. */
export async function findBookingByNumber(
  bookingNumber: string,
): Promise<BookingWithTickets | null> {
  const { rows } = await pool.query<Booking>(
    `select "bookingId", "bookingNumber", email, "showingId", "userId", created_at
      from bookings
      where "bookingNumber" = $1`,
    [bookingNumber],
  );

  if (rows.length === 0) return null;

  const tickets = await getBookingTickets(rows[0].bookingId);
  return { ...rows[0], tickets };
}
