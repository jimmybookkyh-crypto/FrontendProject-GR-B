/* Postgres-felkod från ett pg-fel, t.ex. "23505" (dubblett) eller "23503" (foreign key) */
export function pgErrorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    return String((error as { code: unknown }).code);
  }
  return undefined;
}

/* Översätter Postgres-fel som beror på felaktig indata till ett felmeddelande (för 400).
   Returnerar null om felet är något annat. */
export function pgInputErrorMessage(error: unknown): string | null {
  switch (pgErrorCode(error)) {
    case "22P02":
      return "Ogiltigt värde: fel typ på något fält (t.ex. text där ett tal ska vara)";
    case "22003":
      return "Ett tal är utanför det tillåtna intervallet";
    case "22001":
      return "En text är för lång";
    case "23502": {
      // not null-fält som saknas. pg anger vilken kolumn det gäller.
      const column = (error as { column?: string }).column;
      return `${column ?? "Ett obligatoriskt fält"} krävs`;
    }
    default:
      return null;
  }
}
