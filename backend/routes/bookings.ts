import { Router } from "express";
import { pool } from "../db/pool.js";
import { parseId, isPositiveInt } from "../utils/parseId.js";
import { parsePagination } from "../utils/parsePagination.js";
import { validateEmail } from "../utils/validateEmail.js";
import {
  Booking,
  CreateBookingInput,
  TicketInput,
} from "../interface/types.js";
import { createBooking } from "../services/createBooking.js";
import {
  findBookingByNumber,
  getBookingTickets,
  parseBookingNumber,
} from "../services/findBooking.js";
import {
  requireAuth,
  requireAdmin,
  type AuthUser,
} from "../utils/requireAuth.js";
import { optionalAuth } from "../utils/optionalAuth.js";
import { getMyBookings } from "../services/myBookings.js";

const bookingsRouter = Router();

/* Inloggad användare från token, satt av requireAuth/optionalAuth.
   Läses alltid härifrån, aldrig från ett id i URL:en eller i body. */
function currentUser(locals: Record<string, unknown>): AuthUser | undefined {
  return locals.user as AuthUser | undefined;
}

// GET /bookings
// ADMIN: se alla bokningar
bookingsRouter.get("/", requireAuth, requireAdmin, async (req, res) => {
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

// GET /bookings/number/:bookingNumber  (bokningen + dess biljetter)
// ADMIN: personalen slår upp en bokning via bokningsnumret, t.ex. /bookings/number/3F9A0C1B
bookingsRouter.get(
  "/number/:bookingNumber",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const bookingNumber = parseBookingNumber(req.params.bookingNumber);

    if (bookingNumber === null) {
      return res.status(400).json({
        error: {
          message: "Ogiltigt bokningsnummer. Det ska vara 8 tecken (0-9, A-F)",
        },
      });
    }

    try {
      const booking = await findBookingByNumber(bookingNumber);

      if (booking === null) {
        return res.status(404).json({
          error: { message: "Bokningen finns ej" },
        });
      }

      return res.status(200).json({ data: booking });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Okänt fel";
      console.error("GET /bookings/number/:bookingNumber failed", {
        bookingNumber,
        message,
      });

      return res.status(500).json({
        error: { message: "Fel vid hämtning av bokning" },
      });
    }
  },
);

//----------------------------------------------------
bookingsRouter.get("/me", requireAuth, async (req, res) => {
  const user = currentUser(res.locals)!;
  const userId = parseId(user.userId);

  if (userId === null) {
    return res.status(401).json({
      error: { message: "Ogiltig inloggning, logga in igen" },
    });
  }

  try {
    const bookings = await getMyBookings(userId);
    return res.status(200).json({ data: bookings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("GET /bookings/me failed", { userId, message });

    return res.status(500).json({
      error: { message: "Fel vid hämtning av dina bokningar" },
    });
  }
});

// GET /bookings/confirmation/:bookingNumber  (T077)
// Bekräftelsesidan: öppen för gäster. Bokningsnumret är slumpat och fungerar som nyckel.
// Returnerar bokningen med film, visning, salong och biljetter.
bookingsRouter.get("/confirmation/:bookingNumber", async (req, res) => {
  const bookingNumber = parseBookingNumber(req.params.bookingNumber);

  if (bookingNumber === null) {
    return res.status(400).json({
      error: { message: "Ogiltigt bokningsnummer" },
    });
  }

  try {
    const bookingResult = await pool.query(
      `select b."bookingId", b."bookingNumber", b.email, b."showingId", b."userId", b.created_at,
              s.date::text as date,
              left(s."time"::text, 5) as "time",
              m."movieId", m.title as "movieTitle", m.images, m."ageRating",
              a.name as "auditoriumName"
       from bookings b
       left join showings s on s."showingId" = b."showingId"
       left join movies m on m."movieId" = s."movieId"
       left join auditoriums a on a."auditoriumId" = s."auditoriumId"
       where b."bookingNumber" = $1`,
      [bookingNumber],
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        error: { message: "Bokningen finns ej" },
      });
    }

    const booking = bookingResult.rows[0];

    const ticketsResult = await pool.query(
      `select tt.name as "ticketTypeName", tt.price::float as price,
              se."seatsRow", se."seatsNumber"
       from tickets t
       join seats se on se."seatId" = t."seatId"
       join "ticketTypes" tt on tt."ticketTypeId" = t."ticketTypeId"
       where t."bookingId" = $1
       order by se."seatsRow", se."seatsNumber"`,
      [booking.bookingId],
    );

    return res.status(200).json({
      data: { ...booking, tickets: ticketsResult.rows },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("GET /bookings/confirmation/:bookingNumber failed", {
      bookingNumber,
      message,
    });

    return res.status(500).json({
      error: { message: "Fel vid hämtning av bokning" },
    });
  }
});

// GET /bookings/:id  (bokningen + dess biljetter)
// Ägaren eller admin (T126d)
bookingsRouter.get("/:id", requireAuth, async (req, res) => {
  const id = parseId(req.params.id as string);

  if (id === null) {
    return res.status(400).json({
      error: { message: "Ogiltigt boknings-id" },
    });
  }

  // Ägarkontroll: admin ser alla, övriga bara sina egna.
  // Någon annans bokning ger 404 (inte 403), så att man inte kan lista ut vilka som finns.
  const user = currentUser(res.locals)!;
  const isAdmin = user.role === "admin";

  try {
    const booking = await pool.query<Booking>(
      `select "bookingId", "bookingNumber", email, "showingId", "userId", created_at
        from bookings
        where "bookingId" = $1
          and ($2::boolean or "userId" = $3::bigint)`,
      [id, isAdmin, user.userId],
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({
        error: { message: "Bokningen finns ej" },
      });
    }

    const tickets = await getBookingTickets(id);

    return res.status(200).json({
      data: { ...booking.rows[0], tickets },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("GET /bookings/:id failed", { bookingId: id, message });

    return res.status(500).json({
      error: { message: "Fel vid hämtning av vald bokning" },
    });
  }
});


/*
//Testning-----------------------------------------------------------------------------------------
// GET /bookings/:id Hämtar bokning via bokningsnummer siffer-id
// requireAuth borttaget
bookingsRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
// GET /bookings/me  (T126c)
// Inloggad användare: sina egna bokningar, uppdelade i kommande och tidigare.
// OBS: måste ligga före /:id, annars tolkas "me" som ett id och ger 400.
bookingsRouter.get("/me", requireAuth, async (req, res) => {
  const user = currentUser(res.locals)!;
  const userId = parseId(user.userId);

  if (userId === null) {
    return res.status(401).json({
      error: { message: "Ogiltig inloggning, logga in igen" },
    });
  }

  try {
    const bookings = await getMyBookings(userId);
    return res.status(200).json({ data: bookings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("GET /bookings/me failed", { userId, message });

    return res.status(500).json({
      error: { message: "Fel vid hämtning av dina bokningar" },
    });
  }
});

// GET /bookings/:id  (bokningen + dess biljetter)
// Ägaren eller admin (T126d)
bookingsRouter.get("/:id", requireAuth, async (req, res) => {
  const id = parseId(req.params.id as string);

  if (id === null) {
    return res.status(400).json({
      error: { message: "Ogiltigt boknings-id" },
    });
  }

  // Ägarkontroll: admin ser alla, övriga bara sina egna.
  // Någon annans bokning ger 404 (inte 403), så att man inte kan lista ut vilka som finns.
  const user = currentUser(res.locals)!;
  const isAdmin = user.role === "admin";

  try {
    //  Kontrollera parametern ett siffer-ID eller bokningsnummer
    const isNumeric = /^\d+$/.test(id);

    //  Hämta bokningsdata film- och salongsinformation
    const bookingResult = await pool.query(
      `select b."bookingId", b."bookingNumber", b.email, b."showingId", b."userId", b.created_at,
              s.date::text as date,
              left(s."time"::text, 5) as "time",
              m."movieId", m.title as "movieTitle", m.images, m."ageRating",
              a.name as "auditoriumName"
       from bookings b
       left join showings s on s."showingId" = b."showingId"
       left join movies m on m."movieId" = s."movieId"
       left join auditoriums a on a."auditoriumId" = s."auditoriumId"
       where ${isNumeric ? `b."bookingId" = $1` : `b."bookingNumber" = $1`}`,
      [isNumeric ? parseInt(id, 10) : id],
    const booking = await pool.query<Booking>(
      `select "bookingId", "bookingNumber", email, "showingId", "userId", created_at
        from bookings
        where "bookingId" = $1
          and ($2::boolean or "userId" = $3::bigint)`,
      [id, isAdmin, user.userId],
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        error: { message: "Bokningen finns ej" },
      });
    }

    const booking = bookingResult.rows[0];

    //  Hämta kopplad biljett med stolstyp pris, rad och stolnummer
    const ticketsResult = await pool.query(
      `select tt.name as "ticketTypeName", tt.price::float as price,
              se."seatsRow", se."seatsNumber"
       from tickets t
       join seats se on se."seatId" = t."seatId"
       join "ticketTypes" tt on tt."ticketTypeId" = t."ticketTypeId"
       where t."bookingId" = $1
       order by se."seatsRow", se."seatsNumber"`,
      [booking.bookingId],
    );

    //  Returnera allt under data
    return res.status(200).json({
      data: {
        ...booking,
        tickets: ticketsResult.rows,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("GET /bookings/:id failed", { id, message });

    return res.status(500).json({
      error: { message: "Fel vid hämtning av bokning" },
    });
  }
});
*/

// POST /bookings
// Gäst eller inloggad (T126b). userId i body ignoreras, det läses från token.
bookingsRouter.post("/", optionalAuth, async (req, res) => {
  const body = (req.body ?? {}) as Partial<CreateBookingInput>;
  const { email, showingId, tickets } = body;

  //Varför parseId(user.userId)? I token är id:t text ("3"),
  // men kolumnen userId i databasen är ett heltal. parseId gör om det
  // och kontrollerar samtidigt att det är ett giltigt id.
  const user = currentUser(res.locals);
  const userId = user ? parseId(user.userId) : null;

  if (user && userId === null) {
    return res.status(401).json({
      error: { message: "Ogiltig inloggning, logga in igen" },
    });
  }

  if (!validateEmail(email) || !isPositiveInt(showingId)) {
    return res.status(400).json({
      error: { message: "Ogiltig e-post eller visning" },
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
    const result = await createBooking({ email, showingId, tickets }, userId);

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
bookingsRouter.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = parseId(req.params.id as string);

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
// Ägaren (om visningen inte har börjat) eller admin (T126d)
bookingsRouter.delete("/:id", requireAuth, async (req, res) => {
  const id = parseId(req.params.id as string);

  if (id === null) {
    return res.status(400).json({
      error: { message: "Ogiltigt boknings-id" },
    });
  }

  // Ägarkontroll: admin får avboka alla, övriga bara sina egna.
  const user = currentUser(res.locals)!;
  const isAdmin = user.role === "admin";

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Låser bokningen och kollar ägare och om visningen redan har börjat
    const found = await client.query<{ hasStarted: boolean }>(
      `select ((sh.date + sh."time") <= now()) as "hasStarted"
        from bookings b
        join showings sh on sh."showingId" = b."showingId"
        where b."bookingId" = $1
          and ($2::boolean or b."userId" = $3::bigint)
        for update of b`,
      [id, isAdmin, user.userId],
    );

    if (found.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        error: { message: "Bokningen finns ej" },
      });
    }

    if (found.rows[0].hasStarted && !isAdmin) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: { message: "Visningen har redan börjat och kan inte avbokas" },
      });
    }

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
