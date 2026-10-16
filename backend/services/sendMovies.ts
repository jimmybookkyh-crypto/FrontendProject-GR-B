import { Response } from "express";
import { Movie } from "../interface/types.js";
import { pool } from "../db/pool.js";

export const MOVIE_COLUMNS = `"movieId", title, productioncountries, productionyear, "length", genre,
  distributor, language, subtitles, director, actors, description, images,
  youtubetrailers, current, "ageRating"`;

/* Hämtar en lista med filmer och skickar svaret.
   where/params = valfritt filter, page = valfri limit/offset. */
export async function sendMovies(
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

