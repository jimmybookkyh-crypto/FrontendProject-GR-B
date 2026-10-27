import { Router } from "express";
import { pool } from "../db/pool.js";
import { parseId } from "../utils/parseId.js";
import { parsePagination } from "../utils/parsePagination.js";
import { requireAuth, requireAdmin } from '../utils/requireAuth.js';
import { pgErrorCode, pgInputErrorMessage } from "../utils/pgError.js";
import { validateShowingInput } from "../utils/validateShowing.js";
import { validateDate } from "../utils/validateDate.js";

/* Så här ser en rad i svaret från GET /showings ut.
   Id som är bigint i databasen kommer som text från pg. */
type ShowingListItem = {
  showingId: string;
  date: string; // "2026-10-19"
  time: string; // "18:00"
  movieId: number;
  movieTitle: string;
  auditoriumId: string;
  auditoriumName: string;
  eventId: number | null;
};

const showingsRouter: Router = Router();

showingsRouter.get("/", async (req, res) => {
  const pagination = parsePagination(req.query);

  if (pagination === null) {
    return res.status(400).json({
      error: { message: "Ogiltig limit eller offset" },
    });
  }

  const { limit, offset } = pagination;

  /* Filtren är valfria: /showings?date=2026-10-19&movieId=3
     Vi kollar dem innan vi frågar databasen, så ett fel värde ger 400 och inte 500. */
  const { date } = req.query;

  if (date !== undefined && !validateDate(date)) {
    return res.status(400).json({
      error: { message: "Ogiltigt datum. Använd formatet ÅÅÅÅ-MM-DD, till exempel 2026-10-19" },
    });
  }

  let movieId: number | null = null;

  if (req.query.movieId !== undefined) {
    movieId = typeof req.query.movieId === "string" ? parseId(req.query.movieId) : null;

    if (movieId === null) {
      return res.status(400).json({
        error: { message: "Ogiltigt movieId" },
      });
    }
  }

  /* Bygger WHERE av de filter som skickats med.
     Värdena läggs i values och skickas som $1, $2 ... och aldrig in i SQL-texten,
     så ingen kan smuggla in egen SQL (SQL injection). */
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (date !== undefined) {
    values.push(date);
    conditions.push(`s.date = $${values.length}`);
  }

  if (movieId !== null) {
    values.push(movieId);
    conditions.push(`s."movieId" = $${values.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    /* JOIN hämtar filmtitel och salongsnamn, så frontend slipper extra anrop.
       date::text skickar datumet som "2026-10-19" i stället för ett JavaScript-datum
       (som kan hamna en dag fel).
       left(time::text, 5) klipper "18:00:00+01" till "18:00". */
    const { rows } = await pool.query<ShowingListItem>(
      `SELECT s."showingId",
              s.date::text AS date,
              left(s."time"::text, 5) AS "time",
              s."movieId",
              m.title AS "movieTitle",
              s."auditoriumId",
              a.name AS "auditoriumName",
              s."eventId"
       FROM showings s
       JOIN movies m ON m."movieId" = s."movieId"
       JOIN auditoriums a ON a."auditoriumId" = s."auditoriumId"
       ${where}
       ORDER BY s.date, s."time", s."showingId"
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, limit, offset]
    );

    return res.status(200).json({ data: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("GET /showings failed", { message });

    return res.status(500).json({
      error: { message: "Fel vid hämtning av visningar" },
    });
  }
});

showingsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id as string);


    if (id === null) {
      return res.status(400).json({
        error: { message: "Ogiltigt showing id" },
      });
    }

    const { rows } = await pool.query(
      `SELECT * FROM showings WHERE "showingId" = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: { message: "Visningen finns inte" },
      });
    }

    return res.status(200).json({ data: rows[0] });
  } catch (error) {
    console.error("GET /showings/:id failed", error);
    return res.status(500).json({
      error: { message: "Fel vid hämtning av visning" },
    });
  }
});

/* GET /showings/:id/seats - Hämtar alla upptagna stolar för en specifik visning via view */
showingsRouter.get("/:id/seats", async (req, res) => {
  try {
    const showingId = parseInt(req.params.id, 10);

    if (isNaN(showingId)) {
      return res.status(400).json({ error: "Ogiltigt showingId" });
    }

    // Hämtar alla seatId direkt från din nyskapade booked_seats_view
    const { rows } = await pool.query(
      `SELECT "seatId" FROM public.booked_seats_view WHERE "showingId" = $1`,
      [showingId]
    );

    // Mappar om resultatet till en ren array av nummer, t.ex. [12, 13, 14, 15]
    const occupiedSeatIds = rows.map((row) => Number(row.seatId));

    return res.status(200).json({ data: occupiedSeatIds });
  } catch (error) {
    console.error("Fel vid hämtning av upptagna stolar från view:", error);
    return res.status(500).json({ error: "Kunde inte hämta upptagna stolar" });
  }
});

showingsRouter.post("/", requireAuth, requireAdmin, async (req, res) => {
  const body = req.body ?? {};

  const errorMessage = validateShowingInput(body);
  if (errorMessage) {
    return res.status(400).json({ error: { message: errorMessage } });
  }

  const { movieId, auditoriumId, date, time, eventId } = body;

  try {
    const { rows } = await pool.query(
      `INSERT INTO showings ("movieId", "auditoriumId", date, "time", "eventId") VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [movieId, auditoriumId, date, time, eventId]
    );

    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error("POST /showings failed", error);

    const inputMessage = pgInputErrorMessage(error);
    if (inputMessage !== null) {
      return res.status(400).json({ error: { message: inputMessage } });
    }

    if (pgErrorCode(error) === "23503") {
      return res.status(404).json({ error: { message: "Resursen finns inte" } });
    }

    return res.status(500).json({ error: { message: "Internt serverfel" } });
  }
});

showingsRouter.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = parseId(req.params.id as string);

  if (id === null) {
    return res.status(400).json({ error: { message: "Ogiltigt showing id" } });
  }
  const body = req.body ?? {};

  const errorMessage = validateShowingInput(body);
  if (errorMessage) {
    return res.status(400).json({ error: { message: errorMessage } });
  }
  const { movieId, auditoriumId, date, time, eventId } = body;

  try {
    const { rows } = await pool.query(
      `UPDATE showings
       SET "movieId" = COALESCE($2, "movieId"),
           "auditoriumId" = COALESCE($3, "auditoriumId"),
           date = COALESCE($4, date),
           "time" = COALESCE($5, "time"),
           "eventId" = COALESCE($6, "eventId")
       WHERE "showingId" = $1
       RETURNING *`,
      [id, movieId, auditoriumId, date, time, eventId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: { message: "Visningen finns inte" },
      });
    }

    return res.status(200).json({ data: rows[0] });
  } catch (error) {
    console.error("PATCH /showings/:id failed", error);

    const inputMessage = pgInputErrorMessage(error);
    if (inputMessage !== null) {
      return res.status(400).json({ error: { message: inputMessage } });
    }

    if (pgErrorCode(error) === "23503") {
      return res.status(404).json({ error: { message: "Resursen finns inte" } });
    }

    return res.status(500).json({ error: { message: "Internt serverfel" } });
  }
});

showingsRouter.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = parseId(req.params.id as string);

  if (id === null) {
    return res.status(400).json({
      error: { message: "Ogiltigt showing id" },
    });
  }

  try {
    const { rows } = await pool.query(
      `DELETE FROM showings WHERE "showingId" = $1 RETURNING "showingId"`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: { message: "Visningen finns inte" },
      });
    }

    return res.status(200).json({
      message: "Visningen är borttagen",
      data: rows[0]
    });

  } catch (error) {
    console.error("DELETE /showings/:id failed", error);

    const inputMessage = pgInputErrorMessage(error);
    if (inputMessage !== null) {
      return res.status(400).json({ error: { message: inputMessage } });
    }

    if (pgErrorCode(error) === "23503") {
      return res.status(404).json({ error: { message: "Resursen finns inte" } });
    }

    return res.status(500).json({ error: { message: "Internt serverfel" } });
  }
});
export default showingsRouter;