/* T197: Lägger in eventvisningar för kommande eventperioder.

   Kör från kommandoraden:  npm run add-event-showings
   Körs också automatiskt från backend/scheduler.ts, efter add-event-periods.

   - Gäller perioder för event 10, 11 och 12 som inte har börjat än
   - Eventets filmer hämtas från tidigare visningar med samma eventId
     (oavsett movies.current)
   - Tider och fördelning: se planEventShowings i utils/eventSchedule.ts
   - Säkert att köra flera gånger: tider som redan har en visning hoppas över
   - Tiden sparas med svensk tidszon, +01 på vintern och +02 på sommaren */

import { pathToFileURL } from "url";
import { pool } from "../db/pool.js";
import {
  EVENT_ORDER,
  planEventShowings,
  type EventFilm,
  type EventPeriodDraft,
  type EventShowingDraft,
} from "../utils/eventSchedule.js";
import type { ExistingShowing } from "../interface/types.js";

export async function addEventShowings(): Promise<EventShowingDraft[]> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Svensk tid i hela transaktionen, så att "15:00" sparas som 15:00+01 / 15:00+02
    await client.query(`SET LOCAL TIME ZONE 'Europe/Stockholm'`);

    // Låset gör att två körningar inte kan lägga in samma visning samtidigt.
    // Det släpps när transaktionen är klar.
    await client.query(`LOCK TABLE showings IN SHARE ROW EXCLUSIVE MODE`);

    const { rows: periods } = await client.query<EventPeriodDraft>(
      `select "eventId",
              "startDate"::text as "startDate",
              "endDate"::text as "endDate"
         from "eventPeriods"
        where "eventId" = any($1::bigint[])
          and "startDate" > (now() at time zone 'Europe/Stockholm')::date
        order by "startDate"`,
      [[...EVENT_ORDER]],
    );

    const added: EventShowingDraft[] = [];

    for (const period of periods) {
      const { rows: films } = await client.query<EventFilm>(
        `select distinct m."movieId", m.length
           from showings s
           join movies m on m."movieId" = s."movieId"
          where s."eventId" = $1
          order by m."movieId"`,
        [period.eventId],
      );

      if (films.length === 0) {
        console.warn(
          `Eventvisningar: event ${period.eventId} har inga tidigare visningar att hämta filmer från.`,
        );
        continue;
      }

      const { rows: existingRows } = await client.query(
        `select "showingId", "auditoriumId", date, "time", "movieDurationMinutes"
           from auditorium_schedule_view
          where date between $1 and $2`,
        [period.startDate, period.endDate],
      );

      const existing: ExistingShowing[] = existingRows.map((r) => ({
        showingId: Number(r.showingId),
        auditoriumId: Number(r.auditoriumId),
        date: r.date,
        time: r.time,
        movieDurationMinutes: Number(r.movieDurationMinutes),
      }));

      const planned = planEventShowings(period, films, existing);

      for (const showing of planned) {
        await client.query(
          `insert into showings ("movieId", "auditoriumId", date, "time", "eventId")
           values ($1, $2, $3::date, ($3::date + $4::time)::timestamptz::timetz, $5)`,
          [showing.movieId, showing.auditoriumId, showing.date, showing.time, showing.eventId],
        );
      }

      added.push(...planned);
    }

    await client.query("COMMIT");
    return added;
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
    const added = await addEventShowings();

    if (added.length === 0) {
      console.log("Eventvisningar: inget att lägga till.");
    } else {
      console.log(`Eventvisningar: lade till ${added.length} st.`);
      console.table(added);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("Eventvisningar: kunde inte läggas till.", message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
