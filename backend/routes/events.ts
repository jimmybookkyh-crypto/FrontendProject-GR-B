import { Router } from 'express';
import { pool } from '../db/pool.js';
import { parseId } from '../utils/parseId.js';
import { parsePagination } from '../utils/parsePagination.js';
import { requireAuth, requireAdmin } from '../utils/requireAuth.ts';
import type { EventRow } from '../interface/types.js';
import { isForeignKeyError } from '../utils/pgError.js';
import { validateDate } from '../utils/validateDate.js';

const eventsRouter = Router();

const EVENT_COLUMNS = `"eventId", created_at, name, date::text as date, current, info`;


/* Kollar fälten i en POST/PATCH. Returnerar felmeddelande eller null.
   partial = true (PATCH): fält som saknas är okej. */
function validateEventBody(body: Record<string, unknown>, partial: boolean): string | null {
  if (!partial || 'name' in body) {
    if (typeof body.name !== 'string' || body.name.trim() === '' || body.name.length > 255) {
      return 'name måste vara en text (1-255 tecken)';
    }
  }
  if ('date' in body && body.date !== null && !validateDate(body.date)) {
    return 'date måste vara ett datum på formen YYYY-MM-DD, eller null';
  }
  if ('current' in body && typeof body.current !== 'boolean') {
    return 'current måste vara true eller false';
  }
  if ('info' in body && body.info !== null && typeof body.info !== 'string') {
    return 'info måste vara en text, eller null';
  }
  return null;
}

/* GET /events */
eventsRouter.get('/', async (req, res) => {
  const pagination = parsePagination(req.query);

  if (pagination === null) {
    return res.status(400).json({
      error: { message: 'Ogiltig limit eller offset' },
    });
  }

  const { limit, offset } = pagination;

  try {
    const { rows } = await pool.query<EventRow>(
      `select ${EVENT_COLUMNS}
        from events
        order by "eventId" limit $1 offset $2`, [limit, offset]);

    return res.status(200).json({ data: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Okänt fel';
    console.error('GET /events failed', { message });

    return res.status(500).json({
      error: { message: 'Fel vid hämtning av data' },
    });
  }
});

/* GET /events/:id */
eventsRouter.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(400).json({
      error: { message: 'Ogiltigt event id' },
    });
  }

  try {
    const { rows } = await pool.query<EventRow>(
      `select ${EVENT_COLUMNS}
        from events
        where "eventId" = $1`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: { message: 'Eventet finns inte' },
      });
    }

    return res.status(200).json({ data: rows[0] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Okänt fel';
    console.error('GET /events/:id failed', { eventId: id, message });

    return res.status(500).json({
      error: { message: 'Fel vid hämtning av vald data' },
    });
  }
});

/* GET /events/:id/showings */
eventsRouter.get('/:id/showings', async (req, res) => {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(400).json({
      error: { message: 'Ogiltigt event id' },
    });
  }

  try {
    const { rows } = await pool.query(
      `select v."showingId", v.date::text as date, v."time",
              v."movieId", v."movieTitle", m.productionyear
        from event_showings_view v
        join movies m on m."movieId" = v."movieId"
        where v."eventId" = $1
        order by v.date, v."time"`, [id]);

    return res.status(200).json({ data: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Okänt fel';
    console.error('GET /events/:id/showings failed', { eventId: id, message });

    return res.status(500).json({
      error: { message: 'Fel vid hämtning av visningar' },
    });
  }
});

/* POST /events  –  body: { name, date?, current?, info? } */
eventsRouter.post('/', requireAuth, requireAdmin, async (req, res) => {
  const body = req.body ?? {};

  const validationError = validateEventBody(body, false);
  if (validationError) {
    return res.status(400).json({ error: { message: validationError } });
  }

  const { name, date = null, current = null, info = null } = body;

  try {
    const { rows } = await pool.query<EventRow>(
      `insert into events (name, date, current, info)
        values ($1, $2, coalesce($3::boolean, true), $4)
        returning ${EVENT_COLUMNS}`,
      [name.trim(), date, current, info]);

    return res.status(201).json({ data: rows[0] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Okänt fel';
    console.error('POST /events failed', { message });

    return res.status(500).json({
      error: { message: 'Fel vid skapande av event' },
    });
  }
});

/* PATCH /events/:id  –  body: valfria fält av { name, date, current, info } */
eventsRouter.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = parseId(req.params.id as string);

  if (id === null) {
    return res.status(400).json({
      error: { message: 'Ogiltigt event id' },
    });
  }

  const body = req.body ?? {};

  const validationError = validateEventBody(body, true);
  if (validationError) {
    return res.status(400).json({ error: { message: validationError } });
  }

  const sets: string[] = [];
  const values: unknown[] = [];

  if ('name' in body) {
    values.push(body.name.trim());
    sets.push(`name = $${values.length}`);
  }
  if ('date' in body) {
    values.push(body.date);
    sets.push(`date = $${values.length}`);
  }
  if ('current' in body) {
    values.push(body.current);
    sets.push(`current = $${values.length}`);
  }
  if ('info' in body) {
    values.push(body.info);
    sets.push(`info = $${values.length}`);
  }

  if (sets.length === 0) {
    return res.status(400).json({
      error: { message: 'Inget att uppdatera. Skicka minst ett av name, date, current, info' },
    });
  }

  values.push(id);

  try {
    const { rows } = await pool.query<EventRow>(
      `update events
        set ${sets.join(', ')}
        where "eventId" = $${values.length}
        returning ${EVENT_COLUMNS}`, values);

    if (rows.length === 0) {
      return res.status(404).json({
        error: { message: 'Eventet finns inte' },
      });
    }

    return res.status(200).json({ data: rows[0] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Okänt fel';
    console.error('PATCH /events/:id failed', { eventId: id, message });

    return res.status(500).json({
      error: { message: 'Fel vid uppdatering av event' },
    });
  }
});

/* DELETE /events/:id */
eventsRouter.delete('/:id', requireAuth , requireAdmin, async (req, res) => {
  const id = parseId(req.params.id as string);

  if (id === null) {
    return res.status(400).json({
      error: { message: 'Ogiltigt event id' },
    });
  }

  try {
    const { rows } = await pool.query<{ eventId: string }>(
      `delete from events
        where "eventId" = $1
        returning "eventId"`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: { message: 'Eventet finns inte' },
      });
    }

    return res.status(200).json({ data: rows[0] });
  } catch (error) {
    if (isForeignKeyError(error)) {
      return res.status(409).json({
        error: { message: 'Eventet används av visningar och kan inte tas bort' },
      });
    }

    const message = error instanceof Error ? error.message : 'Okänt fel';
    console.error('DELETE /events/:id failed', { eventId: id, message });

    return res.status(500).json({
      error: { message: 'Fel vid borttagning av event' },
    });
  }
});

export default eventsRouter;
