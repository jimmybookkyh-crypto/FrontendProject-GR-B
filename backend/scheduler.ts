/* Schemaläggare för automatiska jobb i backend.
   Startas från server.ts: körs en gång direkt vid start och sedan en gång per dygn.

   Ordningen spelar roll:
   1. Eventperioder (T197)
   2. Eventvisningar under perioderna (T197)
   3. (senare) Vanliga visningar fyller lediga tider (T193) */

import { addEventPeriods } from "./scripts/add-event-periods.js";
import { addEventShowings } from "./scripts/add-event-showings.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

let isRunning = false;

export async function runScheduledJobs(): Promise<void> {
  // Hoppa över om förra körningen fortfarande pågår
  if (isRunning) return;
  isRunning = true;

  try {
    const periods = await addEventPeriods();
    if (periods.length > 0) {
      console.log(`Schemaläggare: lade till ${periods.length} eventperiod(er).`, periods);
    }

    const showings = await addEventShowings();
    if (showings.length > 0) {
      console.log(`Schemaläggare: lade till ${showings.length} eventvisning(ar).`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("Schemaläggare: ett jobb misslyckades.", message);
  } finally {
    isRunning = false;
  }
}

export function startScheduler(): void {
  void runScheduledJobs();
  setInterval(() => void runScheduledJobs(), ONE_DAY_MS);
}
