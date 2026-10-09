import { Router, Request, Response } from 'express';
import { pool } from '../db/pool.js';

const moviesRouter = Router();

const MOVIE_COLUMNS = `
  movieId,
  title,
  year,
  genre,
  current
`;

type Movie = {
  movieId: number;
  title: string;
  year: number;
  genre: string;
  current: boolean;
};

function parseMovieId(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) return null;

  const id = Number(value);
  if (!Number.isSafeInteger(id)) return null;

  return id;
}


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
    res.json({ data: rows }
    );
    return res.status(200).json({ data: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("GET /movies failed", { message });

    return res.status(500).json({
      error: { message: "Fel vid hämtning av data" },
      });
}
})

export default moviesRouter;