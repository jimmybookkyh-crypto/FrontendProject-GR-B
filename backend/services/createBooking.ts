import { randomBytes } from "crypto";
import { pool } from "../db/pool.js";
import {
  Booking,
  BookedTicket,
  CreatedBooking,
  CreateBookingInput,
} from "../interface/types.js";

/* userId kommer från token (res.locals.user), aldrig från anropets body.
   null = gästbokning. */
export async function createBooking(
  input: CreateBookingInput,
  userId: number | null,
): Promise<CreatedBooking> {
  const { email, showingId, tickets } = input;

  // Kolla dubbletter av säten
  const seatIds = tickets.map((t) => t.seatId);
  if (new Set(seatIds).size !== seatIds.length) {
    throw Object.assign(new Error("Samma säte kan inte bokas två gånger"), {
      status: 400,
    });
  }

  const ticketTypeIds = tickets.map((t) => t.ticketTypeId);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const showing = await client.query(
      `select "showingId", "auditoriumId"
        from showings
        where "showingId" = $1
        for update`,
      [showingId],
    );

    if (showing.rows.length === 0) {
      throw Object.assign(new Error("Visningen finns ej"), { status: 404 });
    }

    const auditoriumId = showing.rows[0].auditoriumId;

    const seats = await client.query(
      `select "seatId", "seatsRow", "seatsNumber" from seats
        where "auditoriumId" = $1 and "seatId" = any($2::bigint[])`,
      [auditoriumId, seatIds],
    );

    if (seats.rows.length !== seatIds.length) {
      throw Object.assign(
        new Error("Ett eller flera säten finns inte i visningens salong"),
        { status: 400 },
      );
    }

    const types = await client.query(
      `select "ticketTypeId", name, price::float as price from "ticketTypes"
        where "ticketTypeId" = any($1::bigint[])`,
      [ticketTypeIds],
    );

    if (types.rows.length !== new Set(ticketTypeIds).size) {
      throw Object.assign(new Error("Ogiltig biljettyp"), { status: 400 });
    }

    const taken = await client.query(
      `select t."seatId"
        from tickets t
        join bookings b on b."bookingId" = t."bookingId"
        where b."showingId" = $1 and t."seatId" = any($2::bigint[])`,
      [showingId, seatIds],
    );

    if (taken.rows.length > 0) {
      const err = Object.assign(
        new Error("Ett eller flera säten är redan bokade"),
        { status: 409 },
      );
      // pg ger bigint som text ("99"), men vi vill ha tal
      (err as any).seatIds = taken.rows.map((row: any) => Number(row.seatId));
      throw err;
    }

    const bookingNumber = randomBytes(4).toString("hex").toUpperCase();

    const booking = await client.query<Booking>(
      `insert into bookings ("bookingNumber", email, "showingId", "userId")
        values ($1, $2, $3, $4)
        returning "bookingId", "bookingNumber", email, "showingId", "userId", created_at`,
      [bookingNumber, email, showingId, userId],
    );

    const bookingId = booking.rows[0].bookingId;

    for (const ticket of tickets) {
      await client.query(
        `insert into tickets ("ticketTypeId", "bookingId", "seatId")
          values ($1, $2, $3)`,
        [ticket.ticketTypeId, bookingId, ticket.seatId],
      );
    }

    // Bygger svaret av det vi redan har läst ovan:
    // rad och stol från seats, typens namn och pris från ticketTypes.
    // Allt är kontrollerat ovan, därför kan vi lita på att varje stol och typ finns (!).
    const seatById = new Map(seats.rows.map((s) => [Number(s.seatId), s]));
    const typeById = new Map(
      types.rows.map((t) => [Number(t.ticketTypeId), t]),
    );

    const bookedTickets: BookedTicket[] = tickets.map((t) => {
      const seat = seatById.get(t.seatId)!;
      const type = typeById.get(t.ticketTypeId)!;

      return {
        seatId: t.seatId,
        seatsRow: Number(seat.seatsRow),
        seatsNumber: Number(seat.seatsNumber),
        ticketTypeId: t.ticketTypeId,
        ticketType: type.name,
        price: type.price,
      };
    });

    const totalPrice = bookedTickets.reduce((sum, t) => sum + t.price, 0);

    await client.query("COMMIT");

    // pg ger bigint som text ("42"), men typen säger tal. Därför Number().
    const row = booking.rows[0];

    return {
      ...row,
      bookingId: Number(row.bookingId),
      showingId: Number(row.showingId),
      tickets: bookedTickets,
      totalPrice,
    };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
