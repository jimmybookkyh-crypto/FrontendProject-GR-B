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

//GET------------------------------------------------------------------------------------------------------

//hämtar alla salonger
auditoriumRouter.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query<Auditorium>(
      `select ${AUDITORIUM_COLUMNS}
       from auditoriums
       order by "auditoriumId"`
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

export default auditoriumRouter;