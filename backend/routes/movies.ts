import { Router } from 'express';
import { pool } from '../db/pool.js';
import { isPositiveInt } from '../utils/parseId.js';

const moviesRouter = Router();

// Alla kolumner i tabellen movies (samma ordning som i Supabase)
const MOVIE_COLUMNS = `"movieId", title, productioncountries, productionyear, "length", genre,
  distributor, language, subtitles, director, actors, description, images,
  youtubetrailers, current, "ageRating"`;

// OBS: pg returnerar bigint (movieId) som text, därför string här.
// De fyra json-kolumnerna kommer tillbaka som riktiga arrayer.
type Movie = {
  movieId: string;
  title: string;
  productioncountries: string[] | null;
  productionyear: number | null;
  length: number | null;
  genre: string | null;
  distributor: string | null;
  language: string | null;
  subtitles: string | null;
  director: string | null;
  actors: string[] | null;
  description: string | null;
  images: string[] | null;
  youtubetrailers: string[] | null;
  current: boolean;
  ageRating: number | null;
};

// Regler per fält. Används av både POST och PATCH så att de alltid är lika.
type FieldSpec = {
  isValid: (value: unknown) => boolean;
  hint: string;
  json?: boolean; // json-kolumner måste skickas som JSON-text till databasen
};

const textOrNull = (max: number) => (value: unknown) =>
  value === null || (typeof value === "string" && value.length <= max);

const intOrNull = (min: number, max: number) => (value: unknown) =>
  value === null || (Number.isInteger(value) && (value as number) >= min && (value as number) <= max);

const stringListOrNull = (value: unknown) =>
  value === null || (Array.isArray(value) && value.every((item) => typeof item === "string"));

const MOVIE_FIELDS: Record<string, FieldSpec> = {
  title: {
    isValid: (v) => typeof v === "string" && v.trim().length >= 1 && v.trim().length <= 255,
    hint: "text, 1-255 tecken",
  },
  productioncountries: { isValid: stringListOrNull, hint: "lista med texter eller null", json: true },
  productionyear: { isValid: intOrNull(1888, 2100), hint: "heltal (1888-2100) eller null" },
  length: { isValid: intOrNull(1, 1000), hint: "heltal i minuter (1-1000) eller null" },
  genre: { isValid: textOrNull(100), hint: "text, max 100 tecken, eller null" },
  distributor: { isValid: textOrNull(100), hint: "text, max 100 tecken, eller null" },
  language: { isValid: textOrNull(100), hint: "text, max 100 tecken, eller null" },
  subtitles: { isValid: textOrNull(100), hint: "text, max 100 tecken, eller null" },
  director: { isValid: textOrNull(255), hint: "text, max 255 tecken, eller null" },
  actors: { isValid: stringListOrNull, hint: "lista med texter eller null", json: true },
  description: { isValid: (v) => v === null || typeof v === "string", hint: "text eller null" },
  images: { isValid: stringListOrNull, hint: "lista med texter eller null", json: true },
  youtubetrailers: { isValid: stringListOrNull, hint: "lista med texter eller null", json: true },
  current: { isValid: (v) => typeof v === "boolean", hint: "true eller false" },
  ageRating: { isValid: intOrNull(0, 99), hint: "heltal (0-99) eller null" },
};

type FieldEntry = { column: string; value: unknown; json: boolean };

// Läser och validerar fälten i body. Returnerar antingen en lista med
// kolumn/värde, eller ett felmeddelande. Kolumnnamnen kommer alltid från
// MOVIE_FIELDS ovan, aldrig direkt från användaren.
function readMovieFields(
  body: Record<string, unknown>,
  isCreate: boolean
): { entries: FieldEntry[] } | { error: string } {
  const entries: FieldEntry[] = [];

  if (isCreate) {
    if (body.title === undefined) return { error: "title krävs" };

    // movieId är valfritt vid POST. Skickas det inte med används databasens eget id.
    if (body.movieId !== undefined) {
      if (!isPositiveInt(body.movieId)) {
        return { error: "movieId måste vara ett heltal större än 0" };
      }
      entries.push({ column: "movieId", value: body.movieId, json: false });
    }
  }

  for (const [field, spec] of Object.entries(MOVIE_FIELDS)) {
    const value = body[field];
    if (value === undefined) continue;

    if (!spec.isValid(value)) {
      return { error: `Ogiltigt värde för ${field}: ${spec.hint}` };
    }

    entries.push({
      column: field,
      value: field === "title" ? (value as string).trim() : value,
      json: spec.json === true,
    });
  }

  return { entries };
}

// json-kolumner skickas som text, annars gör pg om en array till en Postgres-array
function toDbValue(entry: FieldEntry): unknown {
  return entry.json && entry.value !== null ? JSON.stringify(entry.value) : entry.value;
}

function pgErrorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    return String((error as { code: unknown }).code);
  }
  return undefined;
}


function parseMovieId(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) return null;

  const id = Number(value);
  if (!Number.isSafeInteger(id)) return null;

  return id;
}

//GET------------------------------------------------------------------------------------------------------

//hämtar alla filmer
moviesRouter.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const offset = Math.max(Number(req.query.offset) || 0, 0);

  if (!Number.isInteger(limit) || !Number.isInteger(offset)) {
    return res.status(400).json({
      error: { message: "Ogilitg limit eller offset" },
    });
  }

  try {
    const { rows } = await pool.query(
      `select ${MOVIE_COLUMNS}
        from movies
        order by "movieId" limit $1 offset $2`, [limit, offset]);

    return res.status(200).json({ data: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("GET /movies failed", { message });

    return res.status(500).json({
      error: { message: "Fel vid hämtning av data" },
      });
}
})

//hämtar all filmer som är current = true
moviesRouter.get("/current", async (req, res) => {

  try {
    const { rows } = await pool.query(
      `SELECT ${MOVIE_COLUMNS}
       FROM movies
       WHERE current = TRUE
       ORDER BY "movieId"`);

    return res.status(200).json({ data: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("GET /movies/current failed", { message });

    return res.status(500).json({
      error: { message: "Fel vid hämtning av aktuella filmer" },
      });
}
})

//hämtar all filmer som är current = false
moviesRouter.get("/not-current", async (req, res) => {

  try {
    const { rows } = await pool.query(
      `SELECT ${MOVIE_COLUMNS}
       FROM movies
       WHERE current = FALSE
       ORDER BY "movieId"`);

    return res.status(200).json({ data: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("GET /movies/not-current failed", { message });

    return res.status(500).json({
      error: { message: "Fel vid hämtning av icke-aktuella filmer" },
      });
}
})

//hämtar en film
moviesRouter.get("/:id", async (req, res) => {

  const id = parseMovieId(req.params.id);

  if (id === null) {
    return res.status(400).json({
      error: { message: "Ogilitg film id" },
    });
  }

  try {
    const { rows } = await pool.query<Movie>(
      `select ${MOVIE_COLUMNS}
        from movies
        where "movieId" = $1`, [id]);
    if (rows.length === 0) {
      return res.status(400).json({
      error: { message: "Filmen finns ej" },
    });
    }

    return res.status(200).json({ data: rows });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("GET /movies/:id failed", { movieId: id, message});

    return res.status(500).json({
      error: { message: "Fel vid hämtning av vald data" },
      });
}
})

// Hämtar filmer med en viss åldersgräns
moviesRouter.get("/age-rating/:ageRating", async (req, res) => {
  const { ageRating } = req.params;

  try {
    const { rows } = await pool.query<Movie>(
      `SELECT ${MOVIE_COLUMNS}
       FROM movies
       WHERE "ageRating" = $1
       ORDER BY title`,
      [ageRating]
    );

    return res.status(200).json({ data: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";

    console.error("GET /movies/age-rating/:ageRating failed", {
      ageRating,
      message,
    });

    return res.status(500).json({
      error: { message: "Fel vid hämtning av filmer efter åldersgräns" },
    });
  }
});

// Hämtar aktuella filmer med en viss åldersgräns
moviesRouter.get("/age-rating/:ageRating/current", async (req, res) => {
  const { ageRating } = req.params;

  try {
    const { rows } = await pool.query<Movie>(
      `SELECT ${MOVIE_COLUMNS}
       FROM movies
       WHERE "ageRating" = $1
         AND current = TRUE
       ORDER BY title`,
      [ageRating]
    );

    return res.status(200).json({ data: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";

    console.error("GET /movies/age-rating/:ageRating/current failed", {
      ageRating,
      message,
    });

    return res.status(500).json({
      error: { message: "Fel vid hämtning av aktuella filmer efter åldersgräns" },
    });
  }
});

//POST------------------------------------------------------------------------------------------------------ 

//skapar en film (title krävs, övriga fält är valfria)
moviesRouter.post("/", async (req, res) => {
  const result = readMovieFields(req.body ?? {}, true);

  if ("error" in result) {
    return res.status(400).json({ error: { message: result.error } });
  }

  const { entries } = result;
  const columns = entries.map((e) => `"${e.column}"`).join(", ");
  const placeholders = entries
    .map((e, i) => (e.json ? `$${i + 1}::json` : `$${i + 1}`))
    .join(", ");

  try {
    const { rows } = await pool.query<Movie>(
      `INSERT INTO movies (${columns})
       VALUES (${placeholders})
       RETURNING ${MOVIE_COLUMNS}`,
      entries.map(toDbValue)
    );

    return res.status(201).json({ data: rows[0] });
  } catch (error) {
    const code = pgErrorCode(error);

    if (code === "23505") {
      return res.status(409).json({
        error: { message: "En film med det movieId finns redan" },
      });
    }

    if (code === "23502") {
      return res.status(400).json({
        error: { message: "Databasen skapar inget movieId automatiskt. Skicka med movieId" },
      });
    }

    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("POST /movies failed", { message });

    return res.status(500).json({
      error: { message: "Fel vid skapande av film" },
    });
  }
});


//PATCH------------------------------------------------------------------------------------------------------

//uppdaterar en film (bara de fält som skickas med ändras)
moviesRouter.patch("/:id", async (req, res) => {
  const id = parseMovieId(req.params.id);

  if (id === null) {
    return res.status(400).json({
      error: { message: "Ogiltigt film-id" },
    });
  }

  const result = readMovieFields(req.body ?? {}, false);

  if ("error" in result) {
    return res.status(400).json({ error: { message: result.error } });
  }

  const { entries } = result;

  if (entries.length === 0) {
    return res.status(400).json({
      error: { message: "Inga giltiga fält att uppdatera" },
    });
  }

  const updates = entries.map(
    (e, i) => `"${e.column}" = $${i + 1}${e.json ? "::json" : ""}`
  );
  const values = [...entries.map(toDbValue), id];

  try {
    const { rows } = await pool.query<Movie>(
      `UPDATE movies
       SET ${updates.join(", ")}
       WHERE "movieId" = $${values.length}
       RETURNING ${MOVIE_COLUMNS}`,
      values
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: { message: "Filmen finns inte" },
      });
    }

    return res.status(200).json({ data: rows[0] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("PATCH /movies/:id failed", { movieId: id, message });

    return res.status(500).json({
      error: { message: "Fel vid uppdatering av film" },
    });
  }
});


//DELETE------------------------------------------------------------------------------------------------------

//ta bort en film
moviesRouter.delete("/:id", async (req, res) => {
  const id = parseMovieId(req.params.id);

  if (id === null) {
    return res.status(400).json({
      error: { message: "Ogiltigt film-id" },
    });
  }

  try {
    const { rows } = await pool.query<{ movieId: number }>(
      `DELETE FROM movies
       WHERE "movieId" = $1
       RETURNING "movieId"`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: { message: "Filmen finns inte" },
      });
    }

    return res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("DELETE /movies/:id failed", { movieId: id, message });

    return res.status(500).json({
      error: { message: "Fel vid borttagning av film" },
    });
  }
});


export default moviesRouter;