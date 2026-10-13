/* Postgres-felkod från ett pg-fel, t.ex. "23505" (dubblett) eller "23503" (foreign key) */
export function pgErrorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    return String((error as { code: unknown }).code);
  }
  return undefined;
}
