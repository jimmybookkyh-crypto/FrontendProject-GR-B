/* T197: Lägger in nästa eventperiod(er) i det rullande schemat.

   Kör från kommandoraden:  npm run add-event-periods
   Körs också automatiskt från backend/scheduler.ts.

   - Läser alla perioder i eventPeriods och räknar ut vad som saknas
     (reglerna finns i utils/eventSchedule.ts)
   - Skriver bara till eventPeriods, events.date ändras inte
   - Säkert att köra flera gånger: inga dubbletter och inga överlapp
   - Tabellen låses under körningen, så två körningar samtidigt
     kan inte lägga in samma period */

import { pathToFileURL } from "url";
import { pool } from "../db/pool.js";
import {
  planEventPeriods,
  type EventPeriodDraft,
} from "../utils/eventSchedule.js";

export async function addEventPeriods(): Promise<EventPeriodDraft[]> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Låset krockar med sig självt: en annan körning väntar tills vi är klara
    await client.query(`LOCK TABLE "eventPeriods" IN SHARE ROW EXCLUSIVE MODE`);

    const { rows: todayRows } = await client.query<{ today: string }>(
      `select (now() at time zone 'Europe/Stockholm')::date::text as today`,
    );
    const today = todayRows[0].today;

    const { rows: existing } = await client.query<EventPeriodDraft>(
      `select "eventId",
              "startDate"::text as "startDate",
              "endDate"::text as "endDate"
         from "eventPeriods"
        order by "startDate"`,
    );

    const planned = planEventPeriods(existing, today);

    for (const period of planned) {
      await client.query(
        `insert into "eventPeriods" ("eventId", "startDate", "endDate")
         values ($1, $2, $3)`,
        [period.eventId, period.startDate, period.endDate],
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
    const added = await addEventPeriods();

    if (added.length === 0) {
      console.log("Eventperioder: inget att lägga till, schemat är redan fyllt.");
    } else {
      console.log(`Eventperioder: lade till ${added.length} st.`);
      console.table(added);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("Eventperioder: kunde inte läggas till.", message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
