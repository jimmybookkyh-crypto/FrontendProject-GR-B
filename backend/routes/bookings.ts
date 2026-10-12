import { Router } from "express";
import { randomBytes } from "crypto";
import { pool } from "../db/pool.js";
import { parseId, isPositiveInt } from "../utils/parseId.js";
import { parsePagination } from "../utils/parsePagination.js"
import { validateEmail } from "../utils/validateEmail.js";
import { Booking, CreateBookingInput, TicketInput } from "../interface/types.js";

const bookingsRouter = Router();

// GET /bookings
// TODO: skydda med requireAdmin när inloggning finns
bookingsRouter.get("/", async (req, res) => {
  const pagination = parsePagination(req.query);

  if (pagination === null) {
    return res.status(400).json({
      error: { message: "Ogiltig limit eller offset" },
    });
  }

  const { limit, offset } = pagination;

  try {
    const { rows } = await pool.query(
      `select b."bookingId", b."bookingNumber", b.email, b."showingId", b."userId", b.created_at,
          (select count(*) from tickets t where t."bookingId" = b."bookingId")::int as "ticketCount"
        from bookings b
        order by b."bookingId" desc
        limit $1 offset $2`,
      [limit, offset],
    );

    return res.status(200).json({ data: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("GET /bookings failed", { message });

    return res.status(500).json({
      error: { message: "Fel vid hämtning av bokningar" },
    });
  }
});

// GET /bookings/:id  (bokningen + dess biljetter)
bookingsRouter.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(400).json({
      error: { message: "Ogiltigt boknings-id" },
    });
  }

  try {
    const booking = await pool.query<Booking>(
      `select "bookingId", "bookingNumber", email, "showingId", "userId", created_at
        from bookings
        where "bookingId" = $1`,
      [id],
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({
        error: { message: "Bokningen finns ej" },
      });
    }

    const tickets = await pool.query(
      `select t."ticketId", t."seatId", s."seatsRow", s."seatsNumber",
          t."ticketTypeId", tt.name as "ticketType", tt.price
        from tickets t
        join seats s on s."seatId" = t."seatId"
        join "ticketTypes" tt on tt."ticketTypeId" = t."ticketTypeId"
        where t."bookingId" = $1
        order by s."seatsRow", s."seatsNumber"`,
      [id],
    );

    return res.status(200).json({
      data: { ...booking.rows[0], tickets: tickets.rows },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("GET /bookings/:id failed", { bookingId: id, message });

    return res.status(500).json({
      error: { message: "Fel vid hämtning av vald bokning" },
    });
  }
});

// POST /bookings
bookingsRouter.post("/", async (req, res) => {
  const body = (req.body ?? {}) as Partial<CreateBookingInput>;
  const { email, showingId, userId, tickets } = body;

  if (
    !validateEmail(email) ||
    !isPositiveInt(showingId) ||
    (userId !== undefined && userId !== null && !isPositiveInt(userId))
  ) {
    return res.status(400).json({
      error: { message: "Ogiltig e-post, visning eller användare" },
    });
  }

  if (!Array.isArray(tickets) || tickets.length === 0 || tickets.length > 10) {
    return res.status(400).json({
      error: { message: "Boka mellan 1 och 10 biljetter" },
    });
  }

  const seatIds: number[] = [];
  const ticketTypeIds: number[] = [];

  for (const ticket of tickets as TicketInput[]) {
    if (
      !ticket ||
      !isPositiveInt(ticket.seatId) ||
      !isPositiveInt(ticket.ticketTypeId)
    ) {
      return res.status(400).json({
        error: { message: "Varje biljett måste ha seatId och ticketTypeId" },
      });
    }
    seatIds.push(ticket.seatId);
    ticketTypeIds.push(ticket.ticketTypeId);
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    // Lås visningen, så att två bokningar för samma visning körs efter varandra
    const showing = await client.query(
      `select "showingId", "auditoriumId"
        from showings
        where "showingId" = $1
        for update`,
      [showingId],
    );

    if (showing.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        error: { message: "Visningen finns ej" },
      });
    }

    const auditoriumId = showing.rows[0].auditoriumId;
    // Alla säten måste finnas i visningens salong
    const seats = await client.query(
      `select "seatId" from seats
        where "auditoriumId" = $1 and "seatId" = any($2::bigint[])`,
      [auditoriumId, seatIds],
    );

    if (seats.rows.length !== seatIds.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: {
          message: "Ett eller flera säten finns inte i visningens salong",
        },
      });
    }

    // Alla biljettyper måste finnas
    const types = await client.query(
      `select "ticketTypeId" from "ticketTypes"
        where "ticketTypeId" = any($1::bigint[])`,
      [ticketTypeIds],
    );

    if (types.rows.length !== new Set(ticketTypeIds).size) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: { message: "Ogiltig biljettyp" },
      });
    }

    // Är något säte redan bokat på den här visningen?
    const taken = await client.query(
      `select t."seatId"
        from tickets t
        join bookings b on b."bookingId" = t."bookingId"
        where b."showingId" = $1 and t."seatId" = any($2::bigint[])`,
      [showingId, seatIds],
    );

    if (taken.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        error: {
          message: "Ett eller flera säten är redan bokade",
          seatIds: taken.rows.map((row) => row.seatId),
        },
      });
    }

    const bookingNumber = randomBytes(4).toString("hex").toUpperCase();

    const booking = await client.query<Booking>(
      `insert into bookings ("bookingNumber", email, "showingId", "userId")
        values ($1, $2, $3, $4)
        returning "bookingId", "bookingNumber", email, "showingId", "userId", created_at`,
      [bookingNumber, email, showingId, userId ?? null],
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

    return res.status(201).json({
      data: { ...booking.rows[0], tickets },
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});

    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("POST /bookings failed", { message });

    return res.status(500).json({
      error: { message: "Fel vid skapande av bokning" },
    });
  } finally {
    client.release();
  }
});

// ADMIN: PATCH /bookings/:id   body: { "email": "ny@adress.se" }
// TODO: skydda med requireAdmin när inloggning finns
bookingsRouter.patch("/:id", async (req, res) => {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(400).json({
      error: { message: "Ogiltigt boknings-id" },
    });
  }

  const { email } = req.body ?? {};

  if (!validateEmail(email)) {
    return res.status(400).json({
      error: { message: "Ogiltig e-postadress" },
    });
  }

  try {
    const { rows } = await pool.query<Booking>(
      `update bookings
        set email = $1
        where "bookingId" = $2
        returning "bookingId", "bookingNumber", email, "showingId", "userId", created_at`,
      [email, id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: { message: "Bokningen finns ej" },
      });
    }

    return res.status(200).json({ data: rows[0] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("PATCH /bookings/:id failed", { bookingId: id, message });

    return res.status(500).json({
      error: { message: "Fel vid uppdatering av bokning" },
    });
  }
});

// DELETE /bookings/:id  (avboka: tar bort biljetterna och bokningen)
bookingsRouter.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(400).json({
      error: { message: "Ogiltigt boknings-id" },
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(`delete from tickets where "bookingId" = $1`, [id]);

    const result = await client.query(
      `delete from bookings where "bookingId" = $1 returning "bookingId"`,
      [id],
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        error: { message: "Bokningen finns ej" },
      });
    }

    await client.query("COMMIT");

    return res.status(200).json({ data: { bookingId: id } });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});

    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("DELETE /bookings/:id failed", { bookingId: id, message });

    return res.status(500).json({
      error: { message: "Fel vid borttagning av bokning" },
    });
  } finally {
    client.release();
  }
});

export default bookingsRouter;