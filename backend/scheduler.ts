import { addEventPeriods } from "./scripts/add-event-periods.js";
import { addEventShowings } from "./scripts/add-event-showings.js";
import { refillScreenings } from "./scripts/add-screenings.js";

const TEN_MINUTES_MS = 10 * 60 * 1000;

let isRunning = false;

async function runJob(
  name: string,
  job: () => Promise<unknown[]>,
): Promise<void> {
  try {
    const added = await job();
    if (added.length > 0) {
      console.log(`Schemaläggare: ${name}, lade till ${added.length} st.`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error(`Schemaläggare: ${name} misslyckades.`, message);
  }
}

export async function runScheduledJobs(): Promise<void> {
  if (isRunning) return;
  isRunning = true;

  try {
    await runJob("eventperioder", addEventPeriods);
    await runJob("eventvisningar", addEventShowings);
    await runJob("vanliga visningar", refillScreenings);
  } finally {
    isRunning = false;
  }
}

export function startScheduler(): void {
  void runScheduledJobs();
  setInterval(() => void runScheduledJobs(), TEN_MINUTES_MS);
}
