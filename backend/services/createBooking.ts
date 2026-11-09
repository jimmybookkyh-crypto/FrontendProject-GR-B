import { randomBytes } from "crypto";
import { pool } from "../db/pool.js";
import {
  Booking,
  BookedTicket,
  CreatedBooking,
  CreateBookingInput,
} from "../interface/types.js";
import { sendConfirmationEmail } from "./sendConfirmationEmail.js";

/* Hämtar det mejlet behöver och skickar bekräftelsen.
   Körs efter COMMIT utan await, så ett fel här kan aldrig stoppa eller ångra bokningen.
   Fel loggas i terminalen. */
async function sendMailForBooking(args: {
  bookingNumber: string;
  showingId: number;
  guestEmail: string; // adressen från bokningsmodalen
  userId: number | null; // null = gäst
  tickets: BookedTicket[];
  totalPrice: number;
}): Promise<void> {
  try {
    // Samma format som GET /showings: date::text och klockslaget som "18:30"
    const showing = await pool.query<{
      title: string;
      date: string;
      time: string;
      auditoriumName: string;
    }>(
      `select m.title, s.date::text as date, left(s."time"::text, 5) as "time",
              a.name as "auditoriumName"
        from showings s
        join movies m on m."movieId" = s."movieId"
        join auditoriums a on a."auditoriumId" = s."auditoriumId"
        where s."showingId" = $1`,
      [args.showingId],
    );

    if (showing.rows.length === 0) {
      throw new Error("Visningen hittades inte");
    }

    // Inloggad: mejlet går till kontots adress. Gäst: till adressen från modalen.
    let to = args.guestEmail;

    if (args.userId !== null) {
      const account = await pool.query<{ email: string }>(
        `select email from users where "userId" = $1`,
        [args.userId],
      );

      if (account.rows.length > 0) to = account.rows[0].email;
    }

    await sendConfirmationEmail({
      to,
      bookingNumber: args.bookingNumber,
      movieTitle: showing.rows[0].title,
      date: showing.rows[0].date,
      time: showing.rows[0].time,
      auditoriumName: showing.rows[0].auditoriumName,
      tickets: args.tickets,
      totalPrice: args.totalPrice,
      isMember: args.userId !== null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("Bekräftelsemejl misslyckades", {
      bookingNumber: args.bookingNumber,
      message,
    });
  }
}

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

    // Låser visningen och frågar databasen om den redan har börjat.
    // Jämförelsen görs i SQL med now(), samma som avbokningen, så det blir inga tidszonsfel.
    const showing = await client.query<{
      auditoriumId: string;
      hasStarted: boolean;
    }>(
      `select "showingId", "auditoriumId",
              ((date + "time") <= now()) as "hasStarted"
        from showings
        where "showingId" = $1
        for update`,
      [showingId],
    );

    if (showing.rows.length === 0) {
      throw Object.assign(new Error("Den önskad visning finns inte"), {
        status: 404,
      });
    }

    // Passerade visningar går inte att boka
    if (showing.rows[0].hasStarted) {
      throw Object.assign(
        new Error("Visningen har redan börjat och kan därför inte bokas"),
        { status: 400 },
      );
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
        where b."showingId" = $1
          and b.status = 'confirmed'
          and t."seatId" = any($2::bigint[])`,
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

    // Bekräftelsemejlet skickas efter COMMIT och väntas inte in.
    // Misslyckas det är bokningen sparad ändå, och felet loggas i terminalen.
    void sendMailForBooking({
      bookingNumber: row.bookingNumber,
      showingId,
      guestEmail: email,
      userId,
      tickets: bookedTickets,
      totalPrice,
    });

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
