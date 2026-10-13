import { isPositiveInt } from "./parseId.js";

/* Regler per fält i movies. Används av både POST och PATCH så att de alltid är lika. */
type FieldSpec = {
  isValid: (value: unknown) => boolean;
  hint: string;
  json?: boolean; // json-kolumner måste skickas som JSON-text till databasen
};

export type FieldEntry = { column: string; value: unknown; json: boolean };

const textOrNull = (max: number) => (value: unknown) =>
  value === null || (typeof value === "string" && value.length <= max);

const intOrNull = (min: number, max: number) => (value: unknown) =>
  value === null ||
  (Number.isInteger(value) && (value as number) >= min && (value as number) <= max);

const stringListOrNull = (value: unknown) =>
  value === null ||
  (Array.isArray(value) && value.every((item) => typeof item === "string"));

const MOVIE_FIELDS: Record<string, FieldSpec> = {
  title: {
    isValid: (v) => typeof v === "string" && v.trim().length >= 1 && v.trim().length <= 255,
    hint: "text, 1-255 tecken",
  },
  productioncountries: { isValid: stringListOrNull, hint: "lista med texter eller null", json: true },
  productionyear: { isValid: intOrNull(1888, 2100), hint: "heltal (1888-2100) eller null" },
  length: { isValid: intOrNull(1, 1000), hint: "heltal i minuter (1-1000) eller null" },
  genre: { isValid: textOrNull(100), hint: "text, max 100 tecken, eller null" },
  distributor: { isValid: textOrNull(100), hint: "text, max 100 tecken, eller null" },
  language: { isValid: textOrNull(100), hint: "text, max 100 tecken, eller null" },
  subtitles: { isValid: textOrNull(100), hint: "text, max 100 tecken, eller null" },
  director: { isValid: textOrNull(255), hint: "text, max 255 tecken, eller null" },
  actors: { isValid: stringListOrNull, hint: "lista med texter eller null", json: true },
  description: { isValid: (v) => v === null || typeof v === "string", hint: "text eller null" },
  images: { isValid: stringListOrNull, hint: "lista med texter eller null", json: true },
  youtubetrailers: { isValid: stringListOrNull, hint: "lista med texter eller null", json: true },
  current: { isValid: (v) => typeof v === "boolean", hint: "true eller false" },
  ageRating: { isValid: intOrNull(0, 99), hint: "heltal (0-99) eller null" },
};

/* Läser och validerar fälten i en POST (isCreate = true) eller PATCH.
   Returnerar en lista med kolumn/värde, eller ett felmeddelande.
   Kolumnnamnen kommer alltid från MOVIE_FIELDS ovan, aldrig direkt från användaren. */
export function readMovieFields(
  body: Record<string, unknown>,
  isCreate: boolean,
): { entries: FieldEntry[] } | { error: string } {
  const entries: FieldEntry[] = [];

  if (isCreate) {
    if (body.title === undefined) return { error: "title krävs" };

    // movieId är valfritt vid POST. Skickas det inte med används databasens eget id.
    if (body.movieId !== undefined) {
      if (!isPositiveInt(body.movieId)) {
        return { error: "movieId måste vara ett heltal större än 0" };
      }
      entries.push({ column: "movieId", value: body.movieId, json: false });
    }
  }

  for (const [field, spec] of Object.entries(MOVIE_FIELDS)) {
    const value = body[field];
    if (value === undefined) continue;

    if (!spec.isValid(value)) {
      return { error: `Ogiltigt värde för ${field}: ${spec.hint}` };
    }

    entries.push({
      column: field,
      value: field === "title" ? (value as string).trim() : value,
      json: spec.json === true,
    });
  }

  return { entries };
}

/* json-kolumner skickas som text, annars gör pg om en array till en Postgres-array */
export function toDbValue(entry: FieldEntry): unknown {
  return entry.json && entry.value !== null ? JSON.stringify(entry.value) : entry.value;
}
