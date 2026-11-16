import { paths } from "./paths.ts";

export function getReturnTo(state: unknown): string {
  const from = (state as { from?: unknown } | null)?.from;

  if (typeof from !== "string") return paths.start;

  if (!from.startsWith("/") || from.startsWith("//")) return paths.start;

  if (from.startsWith(paths.login) || from.startsWith(paths.register)) {
    return paths.start;
  }

  return from;
}
