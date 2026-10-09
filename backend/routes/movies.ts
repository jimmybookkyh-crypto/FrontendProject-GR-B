import { Router } from 'express';
import { pool } from '../db/pool.js';

const moviesRouter = Router();

/*
const MOVIE_COLUMNS = `
  movieId,
  title,
  productionyear,
  genre,
  current
`;
*/

type Movie = {
  movieId: number;
  title: string;
  productionyear: number;
  genre: string;
  current: boolean;
  ageRating: number;
};


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

// Hämtar filmer med en viss åldersgräns
moviesRouter.get("/age-rating/:ageRating", async (req, res) => {
  const { ageRating } = req.params;

  try {
    const { rows } = await pool.query<Movie>(
      `SELECT "movieId", title, "productionyear", genre, "ageRating", current
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
      `SELECT "movieId", title, "productionyear", genre, "ageRating", current
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

//skapar en film
moviesRouter.post("/", async (req,res) => {
  const {title, productionyear, genre, current, ageRating} = req.body;

  if (
    typeof title !== "string" ||
    title.trim() === "" ||
    !Number.isInteger(productionyear) ||
    typeof genre !== "string" ||
    typeof current !== "boolean" ||
    !Number.isInteger(ageRating)
  ) {
    return res.status(400).json({
      error: { message: "Ogitlig filinformation"},
    });
  }

  try {
    const { rows } = await pool.query<Movie>(
      `INSERT INTO movies (title, productionyear, genre, current, ageRating)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING "movieId", title, productionyear, genre, current, ageRating`,
      [title.trim(), productionyear, genre, current, ageRating]
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


//PATCH------------------------------------------------------------------------------------------------------

//uppdaterar en film
moviesRouter.patch("/:id", async (req, res) => {
  const id = parseMovieId(req.params.id);

  if (id === null) {
    return res.status(400).json({
      error: { message: "Ogiltigt film-id" },
    });
  }

  const allowedFields = ["title", "productionyear", "genre", "current", "ageRating"] as const;
  const updates: string[] = [];
  const values: unknown[] = [];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      const value: unknown = req.body[field];

      if (
        (field === "title" && (typeof value !== "string" || value.trim() === "")) ||
        (field === "genre" && typeof value !== "string") ||
        (field === "productionyear" && !Number.isInteger(value)) ||
        (field === "current" && typeof value !== "boolean") ||
        (field === "ageRating" && !Number.isInteger(value))
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
       RETURNING "movieId", title, productionyear, genre, current, ageRating`,
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