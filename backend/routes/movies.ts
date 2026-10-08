import { Router } from 'express';
import { pool } from '../db/pool.js';

export const moviesRouter = Router();

moviesRouter.get('/', async(req, res) => {
    try {
        const {rows} = await pool.query('select "movieId", title, current from movies');
        res.json({ data: rows });
    }  catch (error) {
  console.error(error);
  const message = error instanceof Error ? error.message : "Okänt fel";
  res.status(500).json({ error: { message } });
  }
})
