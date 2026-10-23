import { randomBytes } from "crypto";
import { pool } from "../db/pool.js";
import { Booking, CreateBookingInput } from "../interface/types.js";

/* userId kommer från token (res.locals.user), aldrig från anropets body.
   null = gästbokning. */
export async function createBooking(
  input: CreateBookingInput,
  userId: number | null,
): Promise<Booking & { tickets: CreateBookingInput["tickets"] }> {
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
      `select "seatId" from seats
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
      `select "ticketTypeId" from "ticketTypes"
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
      (err as any).seatIds = taken.rows.map((row: any) => row.seatId);
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

    await client.query("COMMIT");

    return { ...booking.rows[0], tickets };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
