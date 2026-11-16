/* Hjälpfunktioner för datum.
   Datum skrivs som text: "2026-10-22" (år-månad-dag).
   Allt här räknas i LOKAL tid (svensk tid), inte UTC.
   Annars blir "idag" fel dag mellan kl 00 och 02 på natten. */

const weekdays = ["söndag", "måndag", "tisdag", "onsdag", "torsdag", "fredag", "lördag"];
const weekdaysShort = ["sön", "mån", "tis", "ons", "tors", "fre", "lör"];
const months = [
  "januari", "februari", "mars", "april", "maj", "juni",
  "juli", "augusti", "september", "oktober", "november", "december",
];
const monthsShort = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

/* Date -> "2026-10-22". Månad och dag fylls ut med nolla: 3 blir "03". */
function toDateText(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() börjar på 0
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/* "2026-10-22" -> Date */
function fromDateText(text: string): Date {
  const [year, month, day] = text.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/* Idag + n dagar som text. addDays(0) = idag, addDays(1) = imorgon. */
export function addDays(n: number): string {
  const date = new Date();
  date.setDate(date.getDate() + n);
  return toDateText(date);
}

/* "2026-10-23" -> "fredag 23 oktober" */
export function formatLongDate(text: string): string {
  const date = fromDateText(text);
  return `${weekdays[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}

/* "2026-10-24" -> "lör 24 okt" */
export function formatShortDate(text: string): string {
  const date = fromDateText(text);
  return `${weekdaysShort[date.getDay()]} ${date.getDate()} ${monthsShort[date.getMonth()]}`;
}

/* Används för datumet i adressen (?datum=...). Någon kan skriva vad som helst där.
   Är det inte ett riktigt datum, eller är det före idag, så blir det idag. */
export function validDate(text: string | null): string {
  const today = addDays(0);
  if (text === null) return today;
  const isRealDate = toDateText(fromDateText(text)) === text; // fångar t.ex. "abc" och "2026-99-99"
  return isRealDate && text >= today ? text : today;
}
