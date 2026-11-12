import { useEffect } from "react";
import type { Seat } from "../interface/types";
import { saveBookingDraft, clearBookingDraft, loadBookingDraft, } from "../utils/bookingDraft";

type Props = {
  showingId: string | undefined;
  selectedSeats: Seat[];
  adultTickets: number;
  childTickets: number;
  seniorTickets: number;
};

export default function useBookingDraft({
  showingId,
  selectedSeats,
  adultTickets,
  childTickets,
  seniorTickets,
}: Props) {
  useEffect(() => {

    if (
      selectedSeats.length === 0 &&
      adultTickets === 0 &&
      childTickets === 0 &&
      seniorTickets === 0
    ) {
    
      clearBookingDraft();
      return;
    }

    if (!showingId) return;

    const existingDraft = loadBookingDraft(Number(showingId));

    saveBookingDraft({
      showingId: Number(showingId),
      selectedSeats,
      adultTickets,
      childTickets,
      seniorTickets,
      resumeCheckout:
        existingDraft?.resumeCheckout ?? false,
      savedAt: Date.now(),
    });

  }, [
    showingId,
    selectedSeats,
    adultTickets,
    childTickets,
    seniorTickets,
  ]);
}