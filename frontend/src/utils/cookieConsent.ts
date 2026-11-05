import type { CookieConsent } from "../interface/types";

// Nyckeln i localStorage, samma lagring som inloggningen använder
const STORAGE_KEY = "cookieConsent";

// Datum då cookie-informationen senast ändrades. Ändras texten på /cookies:
// sätt dagens datum här, så frågar bannern alla besökare igen.
export const COOKIE_POLICY_UPDATED = "2026-11-05";

// Skickas när valet ändras, så att bannern döljs även om valet görs på /cookies
export const CONSENT_CHANGED_EVENT = "cookieconsentchange";

/* Läser det sparade valet. null = inget giltigt val (då visas bannern). */
export function getCookieConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CookieConsent;
    if (typeof parsed.statistics !== "boolean" || typeof parsed.date !== "string") {
      return null;
    }

    // Valet gjordes innan cookie-informationen ändrades: fråga igen
    if (parsed.date < COOKIE_POLICY_UPDATED) return null;

    return parsed;
  } catch {
    // Trasigt värde eller blockerad lagring: behandla som att inget val finns
    return null;
  }
}

/* Sparar valet med dagens datum. statistics: true = "Godkänn alla". */
export function saveCookieConsent(statistics: boolean): CookieConsent {
  const consent: CookieConsent = {
    statistics,
    date: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // Lagringen är blockerad: valet gäller bara tills sidan laddas om
  }

  window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
  return consent;
}

/* Används när en statistiktjänst kopplas in i framtiden:
   if (hasStatisticsConsent()) { starta statistiken } */
export function hasStatisticsConsent(): boolean {
  return getCookieConsent()?.statistics === true;
}
