/* Gemensam formatering med svenska inställningar.
   Använd samma funktioner på Mina sidor och bekräftelsesidan, så ser det likadant ut. */
import { kortDatum } from "./datum.ts";

const prisFormat = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

/* 360 -> "360 kr", 1240 -> "1 240 kr" */
export function formatPris(belopp: number): string {
  return prisFormat.format(belopp);
}

/* "2026-10-26" + "18:30" -> "mån 26 okt kl. 18:30" */
export function formatVisning(datum: string, tid: string): string {
  return `${kortDatum(datum)} kl. ${tid.slice(0, 5)}`;
}

/* Grupperar stolar per rad: [{rad 5, stol 7}, {rad 5, stol 8}] -> "Rad 5: stol 7, 8" */
export function formatPlatser(
  platser: { seatsRow: number; seatsNumber: number }[],
): string[] {
  const perRad = new Map<number, number[]>();

  for (const plats of platser) {
    const stolar = perRad.get(plats.seatsRow) ?? [];
    stolar.push(plats.seatsNumber);
    perRad.set(plats.seatsRow, stolar);
  }

  return [...perRad.entries()]
    .sort(([a], [b]) => a - b)
    .map(
      ([rad, stolar]) =>
        `Rad ${rad}: stol ${stolar.sort((a, b) => a - b).join(", ")}`,
    );
}

/* Antal biljetter per typ: ["Vuxen", "Vuxen", "Barn"] -> "2 vuxen, 1 barn" */
export function formatBiljettyper(typer: string[]): string {
  const antal = new Map<string, number>();
  for (const typ of typer) antal.set(typ, (antal.get(typ) ?? 0) + 1);

  return [...antal.entries()]
    .map(([typ, n]) => `${n} ${typ.toLowerCase()}`)
    .join(", ");
}
