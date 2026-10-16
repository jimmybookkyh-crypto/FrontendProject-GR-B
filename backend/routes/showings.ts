import { Router } from "express";
import { pool } from "../db/pool.js";
import { parseId } from "../utils/parseId.js";
import { parsePagination } from "../utils/parsePagination.js";
import { requireAuth, requireAdmin } from '../utils/requireAuth.js';
import { pgErrorCode, pgInputErrorMessage } from "../utils/pgError.js";
import { validateShowingInput } from "../utils/validateShowing.js";

const showingsRouter: Router = Router();

showingsRouter.get("/", async (req, res) => {
  const pagination = parsePagination(req.query);

  if (pagination === null) {
    return res.status(400).json({
      error: { message: "Ogiltig limit eller offset" },
    });
  }

  const { limit, offset } = pagination;

  try {
    const { rows } = await pool.query(
      `SELECT * FROM showings
       ORDER BY "showingId"
       LIMIT $1 OFFSET $2`,
      [limit, offset]
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