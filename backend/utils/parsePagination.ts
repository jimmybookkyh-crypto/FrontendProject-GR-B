type PaginationQuery = {
  limit?: unknown;
  offset?: unknown;
};

type PaginationOptions = {
  defaultLimit?: number;
  maxLimit?: number;
};

export function parsePagination(
  query: PaginationQuery,
  options: PaginationOptions = {},
): { limit: number; offset: number } | null {
  const defaultLimit = options.defaultLimit ?? 50;
  const maxLimit = options.maxLimit ?? 100;

  let limit = defaultLimit;
  if (query.limit !== undefined) {
    const n = Number(query.limit);
    if (!Number.isSafeInteger(n) || n < 1) return null;
    limit = Math.min(n, maxLimit);
  }

  let offset = 0;
  if (query.offset !== undefined) {
    const n = Number(query.offset);
    if (!Number.isSafeInteger(n) || n < 0) return null;
    offset = n;
  }

  return { limit, offset };
}