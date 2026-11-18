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

const isRunDirectly =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isRunDirectly) {
  try {
    const added = await addEventPeriods();

    if (added.length === 0) {
      console.log(
        "Eventperioder: inget att lägga till, schemat är redan fyllt.",
      );
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
