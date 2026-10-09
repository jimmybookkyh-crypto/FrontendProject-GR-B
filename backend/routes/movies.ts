import { Router } from 'express';
import { pool } from '../db/pool.js';

const moviesRouter = Router();

/*
const MOVIE_COLUMNS = `
  movieId,
  title,
  productionYear,
  genre,
  current
`;
*/

type Movie = {
  movieId: number;
  title: string;
  productionYear: number;
  genre: string;
  current: boolean;
};


function parseMovieId(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) return null;

  const id = Number(value);
  if (!Number.isSafeInteger(id)) return null;

  return id;
}

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
      `select "movieId", title, current
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
      `SELECT "movieId", title, current
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
      `SELECT "movieId", title, current
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
      `select "movieId", title, current
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

moviesRouter.post("/", async (req,res) => {
  const {title, productionYear, genre, current} = req.body;

  if (
    typeof title !== "string" ||
    title.trim() === "" ||
    !Number.isInteger(productionYear) ||
    typeof genre !== "string" ||
    typeof current !== "boolean"
  ) {
    return res.status(400).json({
      error: { message: "Ogitlig filinformation"},
    });
  }

  try {
    const { rows } = await pool.query<Movie>(
      `INSERT INTO movies (title, productionYear, genre, current)
      VALUES ($1, $2, $3, $4)
      RETURNING "movieId", title, productionYear, genre, current`,
      [title.trim(), productionYear, genre, current]
    );
    return res.status(201).json({data: rows[0]});
  } catch (error) {
    const message = error instanceof Error ? error.message : "okänt fel";
    console.error("POST /movies failed", { message });
    
      return res.status(500).json({
        error: { message: "Fel vid skapande av film"},
      });
  }
})

//uppdaterar en film
moviesRouter.patch("/:id", async (req, res) => {
  const id = parseMovieId(req.params.id);

  if (id === null) {
    return res.status(400).json({
      error: { message: "Ogiltigt film-id" },
    });
  }

  const allowedFields = ["title", "productionYear", "genre", "current"] as const;
  const updates: string[] = [];
  const values: unknown[] = [];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      const value: unknown = req.body[field];

      if (
        (field === "title" && (typeof value !== "string" || value.trim() === "")) ||
        (field === "genre" && typeof value !== "string") ||
        (field === "productionYear" && !Number.isInteger(value)) ||
        (field === "current" && typeof value !== "boolean")
      ) {
        return res.status(400).json({
          error: { message: `Ogiltigt värde för ${field}` },
        });
      }

      values.push(field === "title" ? (value as string).trim() : value);

      updates.push(`"${field}" = $${values.length}`);
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({
      error: { message: "Inga giltiga fält att uppdatera" },
    });
  }

  try {
    values.push(id);

    const { rows } = await pool.query<Movie>(
      `UPDATE movies
       SET ${updates.join(", ")}
       WHERE "movieId" = $${values.length}
       RETURNING "movieId", title, productionYear, genre, current`,
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


export default moviesRouter;