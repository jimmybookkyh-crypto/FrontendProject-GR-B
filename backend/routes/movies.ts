import { Router } from "express";
import { pool } from "../db/pool.js";
import { parseId } from "../utils/parseId.js";
import { parsePagination } from "../utils/parsePagination.js";
import { pgErrorCode, pgInputErrorMessage } from "../utils/pgError.js";
import type { Movie } from "../interface/types.js";
import { requireAuth, requireAdmin } from '../utils/requireAuth.ts';
import { sendMovies, MOVIE_COLUMNS } from "../services/sendMovies.js";
import { validateMovieData } from "../utils/validateMovie.js";

const moviesRouter = Router();

const SHOWING_SOON_DAYS = 14;

const IS_SHOWING_SOON = `exists (
  select 1
    from showings s
   where s."movieId" = movies."movieId"
     and s.date >= (now() at time zone 'Europe/Stockholm')::date
     and s.date < (now() at time zone 'Europe/Stockholm')::date + ${SHOWING_SOON_DAYS}
)`;

function parseAgeRating(value: string): number | null {
  return /^\d{1,2}$/.test(value) ? Number(value) : null;
}

const MOVIE_FIELDS = [
  "title",
  "productioncountries",
  "productionyear",
  "length",
  "genre",
  "distributor",
  "language",
  "subtitles",
  "director",
  "actors",
  "description",
  "images",
  "youtubetrailers",
  "current",
  "ageRating",
];

const JSON_FIELDS = [
  "productioncountries",
  "actors",
  "images",
  "youtubetrailers",
];

type FieldEntry = { column: string; value: unknown; json: boolean };

function pickMovieFields(body: Record<string, unknown>): FieldEntry[] {
  return MOVIE_FIELDS.filter((column) => body[column] !== undefined).map(
    (column) => ({
      column,
      value: body[column],
      json: JSON_FIELDS.includes(column),
    }),
  );
}

function toDbValue(entry: FieldEntry): unknown {
  return entry.json && entry.value !== null
    ? JSON.stringify(entry.value)
    : entry.value;
}

moviesRouter.get("/", (req, res) => {
  const pagination = parsePagination(req.query);

  if (pagination === null) {
    return res
      .status(400)
      .json({ error: { message: "Ogiltig gräns eller förskjutning" } });
  }

  return sendMovies(
    res,
    "GET /movies",
    "Fel vid hämtning av filmer",
    "",
    [],
    pagination,
  );
});

moviesRouter.get("/current", (_req, res) =>
  sendMovies(
    res,
    "GET /movies/current",
    "Fel vid hämtning av aktuella filmer",
    "where current = true",
  ),
);

moviesRouter.get("/not-current", (_req, res) =>
  sendMovies(
    res,
    "GET /movies/not-current",
    "Fel vid hämtning av icke-aktuella filmer",
    "where current = false",
  ),
);

moviesRouter.get("/age-rating/:ageRating", (req, res) => {
  const ageRating = parseAgeRating(req.params.ageRating);

  if (ageRating === null) {
    return res.status(400).json({ error: { message: "Ogiltig åldersgräns" } });
  }

  return sendMovies(
    res,
    "GET /movies/age-rating/:ageRating",
    "Fel vid hämtning av filmer efter åldersgräns",
    `where "ageRating" = $1`,
    [ageRating],
  );
});

moviesRouter.get("/age-rating/:ageRating/current", (req, res) => {
  const ageRating = parseAgeRating(req.params.ageRating);

  if (ageRating === null) {
    return res.status(400).json({ error: { message: "Ogiltig åldersgräns" } });
  }

  return sendMovies(
    res,
    "GET /movies/age-rating/:ageRating/current",
    "Fel vid hämtning av aktuella filmer efter åldersgräns",
    `where "ageRating" = $1 and current = true`,
    [ageRating],
  );
});

moviesRouter.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(400).json({ error: { message: "Ogiltigt film-id" } });
  }

  try {
    const { rows } = await pool.query<Movie>(
      `select ${MOVIE_COLUMNS}
        from movies
        where "movieId" = $1`,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: { message: "Filmen finns inte" } });
    }

    return res.status(200).json({ data: rows[0] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("GET /movies/:id failed", { movieId: id, message });

    return res
      .status(500)
      .json({ error: { message: "Fel vid hämtning av vald film" } });
  }
});

moviesRouter.post("/", requireAuth, requireAdmin, async (req, res) => {
  const validationError = validateMovieData(req.body ?? {});

  if (validationError) {
    return res.status(400).json({
      error: { message: validationError },
    });
  }
  const entries = pickMovieFields(req.body ?? {});

  if (entries.length === 0) {
    return res.status(400).json({ error: { message: "Ange minst en titel" } });
  }

  const columns = entries.map((e) => `"${e.column}"`).join(", ");
  const placeholders = entries
    .map((e, i) => (e.json ? `$${i + 1}::json` : `$${i + 1}`))
    .join(", ");

  try {
    const { rows } = await pool.query<Movie>(
      `insert into movies (${columns})
        values (${placeholders})
        returning ${MOVIE_COLUMNS}`,
      entries.map(toDbValue),
    );

    return res.status(201).json({ data: rows[0] });
  } catch (error) {
    const badInput = pgInputErrorMessage(error);

    if (error && typeof error === "object" && "detail" in error) {
      console.error("POST /movies failed:", {
        message: "message" in error ? error.message : undefined,
        detail: error.detail,
        code: "code" in error ? error.code : undefined,
        constraint: "constraint" in error ? error.constraint : undefined,
      });
    }

    if (badInput) {
      return res.status(400).json({ error: { message: badInput } });
    }

    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("POST /movies failed", { message });

    return res
      .status(500)
      .json({ error: { message: "Fel vid skapande av film" } });
  }
});

moviesRouter.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = parseId(req.params.id as string);

  if (id === null) {
    return res.status(400).json({ error: { message: "Ogiltigt film-id" } });
  }

  const validationError = validateMovieData(req.body ?? {}, true);

  if (validationError) {
    return res.status(400).json({
      error: { message: validationError },
    });
  }
  const entries = pickMovieFields(req.body ?? {});

  if (entries.length === 0) {
    return res
      .status(400)
      .json({ error: { message: "Inga giltiga fält att uppdatera" } });
  }

  const updates = entries.map(
    (e, i) => `"${e.column}" = $${i + 1}${e.json ? "::json" : ""}`,
  );
  const values = [...entries.map(toDbValue), id];

  try {
    const { rows } = await pool.query<Movie>(
      `update movies
        set ${updates.join(", ")}
        where "movieId" = $${values.length}
        returning ${MOVIE_COLUMNS}`,
      values,
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: { message: "Filmen finns inte" } });
    }

    return res.status(200).json({ data: rows[0] });
  } catch (error) {
    const badInput = pgInputErrorMessage(error);

    if (badInput) {
      return res.status(400).json({ error: { message: badInput } });
    }

    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("PATCH /movies/:id failed", { movieId: id, message });

    return res
      .status(500)
      .json({ error: { message: "Fel vid uppdatering av film" } });
  }
});

moviesRouter.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = parseId(req.params.id as string);

  if (id === null) {
    return res.status(400).json({ error: { message: "Ogiltigt film-id" } });
  }

  try {
    const { rows } = await pool.query<{ movieId: string }>(
      `delete from movies
        where "movieId" = $1
        returning "movieId"`,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: { message: "Filmen finns inte" } });
    }

    return res.status(204).send();
  } catch (error) {
    // 23503 = foreign key: filmen används av visningar
    if (pgErrorCode(error) === "23503") {
      return res.status(409).json({
        error: { message: "Filmen används av visningar och kan inte tas bort" },
      });
    }

    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("DELETE /movies/:id failed", { movieId: id, message });

    return res
      .status(500)
      .json({ error: { message: "Fel vid borttagning av film" } });
  }
});

export default moviesRouter;
