export function pgErrorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    return String((error as { code: unknown }).code);
  }
  return undefined;
}

export function pgInputErrorMessage(error: unknown): string | null {
  switch (pgErrorCode(error)) {
    case "22P02":
      return "Ogiltigt värde: fel typ på något fält (t.ex. text där ett tal ska vara)";
    case "22003":
      return "Ett tal är utanför det tillåtna intervallet";
    case "22001":
      return "En text är för lång";
    case "23502": {
      const column = (error as { column?: string }).column;
      return `${column ?? "Ett obligatoriskt fält"} krävs`;
    }
    default:
      return null;
  }
}

   export function isForeignKeyError(error: unknown): boolean {
     return pgErrorCode(error) === "23503";
   }
