import type { BookingDraft } from "../interface/types";

const STORAGE_KEY = "bookingDraft";

export function saveBookingDraft(
  draft: BookingDraft
): void {

  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(draft)
  );
}
export function loadBookingDraft(
  showingId: number
): BookingDraft | null {
  const stored = sessionStorage.getItem(STORAGE_KEY);

  if (!stored) return null;

  const draft = JSON.parse(stored) as BookingDraft;

  if (draft.showingId !== showingId) {
    return null;
  }

  const THIRTY_MINUTES = 30 * 60 * 1000;

  if (Date.now() - draft.savedAt > THIRTY_MINUTES) {
    clearBookingDraft();
    return null;
  }

  return draft;
}

export function clearBookingDraft(): void { 
  sessionStorage.removeItem(STORAGE_KEY);
 }