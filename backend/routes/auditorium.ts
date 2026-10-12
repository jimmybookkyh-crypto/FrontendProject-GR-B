import { Router } from 'express';
import { pool } from '../db/pool.js';
import { parseId } from '../utils/parseId.js';

const auditoriumRouter: Router = Router();

/* Kolumnerna vi skickar tillbaka (tabellen auditoriums har bara dessa två) */
const AUDITORIUM_COLUMNS = `"auditoriumId", name`;

type Auditorium = {
  auditoriumId: string; // bigint kommer som text från pg
  name: string;
};

/* 23503 = foreign key violation i Postgres (salongen används av visningar eller platser) */
function isForeignKeyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23503';
}

/* Returnerar felmeddelande eller null om namnet är okej */
function validateName(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim() === '' || value.trim().length > 100) {
    return 'name måste vara en text (1-100 tecken)';
  }
  return null;
}

//GET------------------------------------------------------------------------------------------------------

//hämtar alla salonger
auditoriumRouter.get('/', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const offset = Math.max(Number(req.query.offset) || 0, 0);

  if (!Number.isInteger(limit) || !Number.isInteger(offset)) {
    return res.status(400).json({ error: { message: 'Ogiltig limit eller offset' } });
  }

  try {
    const { rows } = await pool.query<Auditorium>(
      `select ${AUDITORIUM_COLUMNS}
       from auditoriums
       order by "auditoriumId" limit $1 offset $2`,
      [limit, offset]
    );

    return res.status(200).json({ data: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Okänt fel';
    console.error('GET /auditorium failed', { message });

    return res.status(500).json({ error: { message: 'Fel vid hämtning av data' } });
  }
});

//hämtar info för en salong
auditoriumRouter.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(400).json({ error: { message: 'Ogiltigt salongs-id' } });
  }

  try {
    const { rows } = await pool.query<Auditorium>(
      `select ${AUDITORIUM_COLUMNS}
       from auditoriums
       where "auditoriumId" = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: { message: 'Salongen finns inte' } });
    }

    return res.status(200).json({ data: rows[0] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Okänt fel';
    console.error('GET /auditorium/:id failed', { auditoriumId: id, message });

    return res.status(500).json({ error: { message: 'Fel vid hämtning av vald salong' } });
  }
});

//POST------------------------------------------------------------------------------------------------------

//skapar en salong
auditoriumRouter.post('/', async (req, res) => {
  const body: Record<string, unknown> = req.body ?? {};
  const problem = validateName(body.name);

  if (problem) {
    return res.status(400).json({ error: { message: problem } });
  }

  try {
    const { rows } = await pool.query<Auditorium>(
      `insert into auditoriums (name)
       values ($1)
       returning ${AUDITORIUM_COLUMNS}`,
      [(body.name as string).trim()]
    );

    return res.status(201).json({ data: rows[0] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Okänt fel';
    console.error('POST /auditorium failed', { message });

    return res.status(500).json({ error: { message: 'Fel vid skapande av salong' } });
  }
});

//PATCH------------------------------------------------------------------------------------------------------

//uppdaterar en salong (namnet är det enda som kan ändras)
auditoriumRouter.patch('/:id', async (req, res) => {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(400).json({ error: { message: 'Ogiltigt salongs-id' } });
  }

  const body: Record<string, unknown> = req.body ?? {};

  if (body.name === undefined) {
    return res.status(400).json({ error: { message: 'Inget att uppdatera. Skicka name' } });
  }

  const problem = validateName(body.name);

  if (problem) {
    return res.status(400).json({ error: { message: problem } });
  }

  try {
    const { rows } = await pool.query<Auditorium>(
      `update auditoriums
       set name = $1
       where "auditoriumId" = $2
       returning ${AUDITORIUM_COLUMNS}`,
      [(body.name as string).trim(), id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: { message: 'Salongen finns inte' } });
    }

    return res.status(200).json({ data: rows[0] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Okänt fel';
    console.error('PATCH /auditorium/:id failed', { auditoriumId: id, message });

    return res.status(500).json({ error: { message: 'Fel vid uppdatering av salong' } });
  }
});

//DELETE------------------------------------------------------------------------------------------------------

//tar bort en salong
auditoriumRouter.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(400).json({ error: { message: 'Ogiltigt salongs-id' } });
  }

  try {
    const { rows } = await pool.query<{ auditoriumId: string }>(
      `delete from auditoriums
       where "auditoriumId" = $1
       returning "auditoriumId"`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: { message: 'Salongen finns inte' } });
    }

    return res.status(200).json({ data: rows[0] });
  } catch (error) {
    if (isForeignKeyError(error)) {
      return res.status(409).json({
        error: { message: 'Salongen används av visningar eller platser och kan inte tas bort' },
      });
    }

    const message = error instanceof Error ? error.message : 'Okänt fel';
    console.error('DELETE /auditorium/:id failed', { auditoriumId: id, message });

    return res.status(500).json({ error: { message: 'Fel vid borttagning av salong' } });
  }
});

export default auditoriumRouter;
