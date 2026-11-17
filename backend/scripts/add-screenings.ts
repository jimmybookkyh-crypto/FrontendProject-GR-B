/* T193: Fyller på vanliga visningar så att kalendern alltid har visningar några veckor framåt.

   Kör från kommandoraden:  npm run add-screenings
   Körs också automatiskt från backend/scheduler.ts, efter eventjobben (T197).

   - Fyller från i morgon och WEEKS_AHEAD veckor framåt (utils/screeningSchedule.ts)
   - Kollar verkligt tillstånd: varje tid som redan har en visning hoppas över,
     så det spelar ingen roll när eller hur ofta skriptet körs
   - Bara filmer i den vanliga repertoaren (movies.current = true)
   - Säkert att köra flera gånger: inga dubbletter och inga krockar i samma salong
   - Tiden sparas med svensk tidszon, +01 på vintern och +02 på sommaren */

import { pathToFileURL } from "url";
import { pool } from "../db/pool.js";
import { addDays, EVENT_ORDER, type EventPeriodDraft } from "../utils/eventSchedule.js";
import {
  planScreenings,
  WEEKS_AHEAD,
  type RepertoireFilm,
  type ScreeningDraft,
} from "../utils/screeningSchedule.js";
import type { ExistingShowing } from "../interface/types.js";

export async function refillScreenings(): Promise<ScreeningDraft[]> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Svensk tid i hela transaktionen, så att "15:00" sparas som 15:00+01 / 15:00+02
    await client.query(`SET LOCAL TIME ZONE 'Europe/Stockholm'`);

    // Låset gör att två körningar inte kan lägga in samma visning samtidigt.
    // Det släpps när transaktionen är klar.
    await client.query(`LOCK TABLE showings IN SHARE ROW EXCLUSIVE MODE`);

    const { rows: todayRows } = await client.query<{ today: string }>(
      `select (now() at time zone 'Europe/Stockholm')::date::text as today`,
    );
    const today = todayRows[0].today;
    const fromDate = addDays(today, 1);
    const toDate = addDays(today, WEEKS_AHEAD * 7);

    const { rows: filmRows } = await client.query(
      `select "movieId", length, "ageRating"
         from movies
        where current = true
          and length is not null
        order by "movieId"`,
    );
    const films: RepertoireFilm[] = filmRows.map((r) => ({
      movieId: Number(r.movieId),
      length: Number(r.length),
      ageRating: r.ageRating === null ? null : Number(r.ageRating),
    }));

    const { rows: existingRows } = await client.query(
      `select "showingId", "auditoriumId", date, "time", "movieDurationMinutes"
         from auditorium_schedule_view
        where date between $1 and $2`,
      [fromDate, toDate],
    );
    const existing: ExistingShowing[] = existingRows.map((r) => ({
      showingId: Number(r.showingId),
      auditoriumId: Number(r.auditoriumId),
      date: r.date,
      time: r.time,
      movieDurationMinutes: Number(r.movieDurationMinutes),
    }));

    const { rows: eventPeriods } = await client.query<EventPeriodDraft>(
      `select "eventId",
              "startDate"::text as "startDate",
              "endDate"::text as "endDate"
         from "eventPeriods"
        where "eventId" = any($1::bigint[])
          and "startDate" <= $3
          and "endDate" >= $2`,
      [[...EVENT_ORDER], fromDate, toDate],
    );

    const planned = planScreenings(fromDate, toDate, films, existing, eventPeriods);

    for (const showing of planned) {
      await client.query(
        `insert into showings ("movieId", "auditoriumId", date, "time")
         values ($1, $2, $3::date, ($3::date + $4::time)::timestamptz::timetz)`,
        [showing.movieId, showing.auditoriumId, showing.date, showing.time],
      );
    }

    await client.query("COMMIT");
    return planned;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Körs bara när filen startas direkt, inte när den importeras
const isRunDirectly =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isRunDirectly) {
  try {
    const added = await refillScreenings();

    if (added.length === 0) {
      console.log(`Visningar: inget att lägga till, kalendern är fylld ${WEEKS_AHEAD} veckor framåt.`);
    } else {
      console.log(`Visningar: lade till ${added.length} st.`);
      console.table(added);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("Visningar: kunde inte läggas till.", message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
