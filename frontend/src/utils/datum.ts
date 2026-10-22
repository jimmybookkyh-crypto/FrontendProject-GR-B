/* Hjälpfunktioner för datum.
   Datum skrivs som text: "2026-10-22" (år-månad-dag).
   Allt här räknas i LOKAL tid (svensk tid), inte UTC.
   Annars blir "idag" fel dag mellan kl 00 och 02 på natten. */

const veckodagar = ["söndag", "måndag", "tisdag", "onsdag", "torsdag", "fredag", "lördag"];
const veckodagarKort = ["sön", "mån", "tis", "ons", "tors", "fre", "lör"];
const manader = [
  "januari", "februari", "mars", "april", "maj", "juni",
  "juli", "augusti", "september", "oktober", "november", "december",
];
const manaderKort = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

/* Date -> "2026-10-22". Månad och dag fylls ut med nolla: 3 blir "03". */
function tillText(d: Date): string {
  const manad = String(d.getMonth() + 1).padStart(2, "0"); // getMonth() börjar på 0
  const dag = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${manad}-${dag}`;
}

/* "2026-10-22" -> Date */
function franText(text: string): Date {
  const [ar, manad, dag] = text.split("-").map(Number);
  return new Date(ar, manad - 1, dag);
}

/* Idag + n dagar som text. plusDagar(0) = idag, plusDagar(1) = imorgon. */
export function plusDagar(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return tillText(d);
}

/* "2026-10-23" -> "fredag 23 oktober" */
export function langtDatum(text: string): string {
  const d = franText(text);
  return `${veckodagar[d.getDay()]} ${d.getDate()} ${manader[d.getMonth()]}`;
}

/* "2026-10-24" -> "lör 24 okt" */
export function kortDatum(text: string): string {
  const d = franText(text);
  return `${veckodagarKort[d.getDay()]} ${d.getDate()} ${manaderKort[d.getMonth()]}`;
}

/* Används för datumet i adressen (?datum=...). Någon kan skriva vad som helst där.
   Är det inte ett riktigt datum, eller är det före idag, så blir det idag. */
export function giltigtDatum(text: string | null): string {
  const idag = plusDagar(0);
  if (text === null) return idag;
  const arRiktigt = tillText(franText(text)) === text; // fångar t.ex. "abc" och "2026-99-99"
  return arRiktigt && text >= idag ? text : idag;
}
