import { Router } from "express";
import type { Response } from "express";
import { pool } from "../db/pool.js";
import { parseId } from "../utils/parseId.js";
import { parsePagination } from "../utils/parsePagination.js";
import { pgErrorCode, pgInputErrorMessage } from "../utils/pgError.js";
import type { Movie } from "../interface/types.js";

const moviesRouter = Router();

/* Alla kolumner i tabellen movies */
const MOVIE_COLUMNS = `"movieId", title, productioncountries, productionyear, "length", genre,
  distributor, language, subtitles, director, actors, description, images,
  youtubetrailers, current, "ageRating"`;

/* "11" -> 11. Åldersgräns är ett heltal 0-99. */
function parseAgeRating(value: string): number | null {
  return /^\d{1,2}$/.test(value) ? Number(value) : null;
}

/* Fälten i movies som får skickas in vid POST/PATCH.
   Kolumnnamnen kommer härifrån, aldrig direkt från användaren.
   Typer, längder och not null kontrolleras av databasen. */
const MOVIE_FIELDS = [
  "title", "productioncountries", "productionyear", "length", "genre", "distributor",
  "language", "subtitles", "director", "actors", "description", "images",
  "youtubetrailers", "current", "ageRating",
];

/* json-kolumner måste skickas som JSON-text, annars gör pg om en array till en Postgres-array */
const JSON_FIELDS = ["productioncountries", "actors", "images", "youtubetrailers"];

type FieldEntry = { column: string; value: unknown; json: boolean };

/* Plockar ut fälten som finns i body. movieId skapas av databasen och kan inte skickas in. */
function pickMovieFields(body: Record<string, unknown>): FieldEntry[] {
  return MOVIE_FIELDS
    .filter((column) => body[column] !== undefined)
    .map((column) => ({ column, value: body[column], json: JSON_FIELDS.includes(column) }));
}

function toDbValue(entry: FieldEntry): unknown {
  return entry.json && entry.value !== null ? JSON.stringify(entry.value) : entry.value;
}

/* Hämtar en lista med filmer och skickar svaret.
   where/params = valfritt filter, page = valfri limit/offset. */
async function sendMovies(
  res: Response,
  label: string,
  errorMessage: string,
  where = "",
  params: unknown[] = [],
  page?: { limit: number; offset: number },
) {
  const paging = page ? `limit $${params.length + 1} offset $${params.length + 2}` : "";
  const values = page ? [...params, page.limit, page.offset] : params;

  try {
    const { rows } = await pool.query<Movie>(
      `select ${MOVIE_COLUMNS}
        from movies
        ${where}
        order by "movieId"
        ${paging}`,
      values,
    );

    return res.status(200).json({ data: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error(`${label} failed`, { message });

    return res.status(500).json({ error: { message: errorMessage } });
  }
}

//GET------------------------------------------------------------------------------------------------------

// GET /movies  (alla filmer)
moviesRouter.get("/", (req, res) => {
  const pagination = parsePagination(req.query);

  if (pagination === null) {
    return res.status(400).json({ error: { message: "Ogiltig limit eller offset" } });
  }

  return sendMovies(res, "GET /movies", "Fel vid hämtning av filmer", "", [], pagination);
});

// GET /movies/current  (current = true)
moviesRouter.get("/current", (_req, res) =>
  sendMovies(res, "GET /movies/current", "Fel vid hämtning av aktuella filmer", "where current = true"),
);

// GET /movies/not-current  (current = false)
moviesRouter.get("/not-current", (_req, res) =>
  sendMovies(res, "GET /movies/not-current", "Fel vid hämtning av icke-aktuella filmer", "where current = false"),
);

// GET /movies/age-rating/:ageRating  (filmer med en viss åldersgräns)
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

// GET /movies/age-rating/:ageRating/current  (aktuella filmer med en viss åldersgräns)
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

// GET /movies/:id  (en film)
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

    return res.status(500).json({ error: { message: "Fel vid hämtning av vald film" } });
  }
});

//POST------------------------------------------------------------------------------------------------------

// POST /movies  (movieId skapas av databasen; fält som inte får vara null kontrolleras av databasen)
moviesRouter.post("/", async (req, res) => {
  const entries = pickMovieFields(req.body ?? {});

  if (entries.length === 0) {
    return res.status(400).json({ error: { message: "Skicka minst title" } });
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

    if (badInput) {
      return res.status(400).json({ error: { message: badInput } });
    }

    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("POST /movies failed", { message });

    return res.status(500).json({ error: { message: "Fel vid skapande av film" } });
  }
});

//PATCH------------------------------------------------------------------------------------------------------

// PATCH /movies/:id  (bara de fält som skickas med ändras)
moviesRouter.patch("/:id", async (req, res) => {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(400).json({ error: { message: "Ogiltigt film-id" } });
  }

  const entries = pickMovieFields(req.body ?? {});

  if (entries.length === 0) {
    return res.status(400).json({ error: { message: "Inga giltiga fält att uppdatera" } });
  }

  const updates = entries.map((e, i) => `"${e.column}" = $${i + 1}${e.json ? "::json" : ""}`);
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

    return res.status(500).json({ error: { message: "Fel vid uppdatering av film" } });
  }
});

//DELETE------------------------------------------------------------------------------------------------------

// DELETE /movies/:id
moviesRouter.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id);

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

    return res.status(200).json({ data: rows[0] });
  } catch (error) {
    // 23503 = foreign key: filmen används av visningar
    if (pgErrorCode(error) === "23503") {
      return res.status(409).json({
        error: { message: "Filmen används av visningar och kan inte tas bort" },
      });
    }

    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("DELETE /movies/:id failed", { movieId: id, message });

    return res.status(500).json({ error: { message: "Fel vid borttagning av film" } });
  }
});

export default moviesRouter;
