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

/* P13 (#417): det personalen ser i Adminportalen när de söker på bokningsnummer */
export type AdminBooking = BookingWithTickets & {
  status: "confirmed" | "cancelled";
  cancelledAt: string | null;
  movieId: string;
  movieTitle: string;
  images: string[] | string | null;
  date: string; // "2026-11-08"
  time: string; // "18:30"
  auditoriumName: string;
  hasStarted: boolean; // visningen har börjat, då går den inte att avboka
  totalPrice: number;
};

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

/* Slår upp en bokning via bokningsnumret (T076, P13 #417).
   Returnerar bokningen med film, visning, salong, status, totalpris och biljetter,
   eller null om den inte finns. */
export async function findBookingByNumber(
  bookingNumber: string,
): Promise<AdminBooking | null> {
  const { rows } = await pool.query<Omit<AdminBooking, "tickets" | "totalPrice">>(
    `select b."bookingId", b."bookingNumber", b.email, b."showingId", b."userId",
        b.created_at, b.status, b."cancelledAt",
        m."movieId", m.title as "movieTitle", m.images,
        sh.date::text as date,
        left(sh."time"::time::text, 5) as "time",
        a.name as "auditoriumName",
        ((sh.date + sh."time") <= now()) as "hasStarted"
      from bookings b
      join showings sh on sh."showingId" = b."showingId"
      join movies m on m."movieId" = sh."movieId"
      join auditoriums a on a."auditoriumId" = sh."auditoriumId"
      where b."bookingNumber" = $1`,
    [bookingNumber],
  );

  if (rows.length === 0) return null;

  const tickets = await getBookingTickets(rows[0].bookingId);
  const totalPrice = tickets.reduce((sum, ticket) => sum + Number(ticket.price), 0);
  return { ...rows[0], tickets, totalPrice };
}
