/* Sidan man kom ifrån innan inloggning eller registrering.
   Skickas med som state.from, t.ex. av headerns "Logga in" och av Mina sidor.
   Ger startsidan om inget giltigt värde finns. */
export function getReturnTo(state: unknown): string {
  const from = (state as { from?: unknown } | null)?.from;

  if (typeof from !== "string") return "/";

  // Bara sidor i den här appen (ingen annan webbplats)
  if (!from.startsWith("/") || from.startsWith("//")) return "/";

  // Aldrig tillbaka till själva formulären
  if (from.startsWith("/login") || from.startsWith("/bli-medlem")) return "/";

  return from;
}
