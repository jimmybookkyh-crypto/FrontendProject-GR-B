import { Router } from "express";
import { randomBytes } from "crypto";
import { pool } from "../db/pool.js";
import { parseId, isPositiveInt } from "../utils/parseId.js";
import { parsePagination } from "../utils/parsePagination.js"
import { validateEmail } from "../utils/validateEmail.js";
import { Booking, CreateBookingInput, TicketInput } from "../interface/types.js";
import { createBooking } from "../services/createBooking.js";

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
  }

  try {
    const result = await createBooking({
      email,
      showingId,
      userId: userId ?? null,
      tickets,
    });

    return res.status(201).json({ data: result });
  } catch (error: any) {
    if (error.status) {
      return res.status(error.status).json({
        error: {
          message: error.message,
          ...(error.seatIds && { seatIds: error.seatIds }),
        },
      });
    }

    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("POST /bookings failed", { message });

    return res.status(500).json({
      error: { message: "Fel vid skapande av bokning" },
    });
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