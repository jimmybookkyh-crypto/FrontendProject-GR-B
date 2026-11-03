//Gemensam hjälpfil: Vi behöver annars kopiera in detta till varje fil

export function parseId(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) return null;

  const id = Number(value);
  if (!Number.isSafeInteger(id)) return null;

  return id;
}

export function isPositiveInt(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

/* Tar emot ett tal eller text med bara siffror ("12") och ger tillbaka talet 12.
   Allt annat ("abc", "1.5", "0", "-1", "") ger null. */
export function toPositiveInt(value: unknown): number | null {
  if (typeof value === "number") return isPositiveInt(value) ? value : null;
  if (typeof value === "string") return parseId(value);
  return null;
}
