import apiRequest from "./apiRequest.ts";
import type { MyBookingsResponse } from "../interface/types.ts";

/* Sökvägen till användarens egna bokningar (T126c).
   Används med useFetch: useFetch<MyBookingsResponse>(MY_BOOKINGS_PATH) */
export const MY_BOOKINGS_PATH = "/bookings/me";

/* API-anrop för bokningar (T126e).
   apiRequest skickar automatiskt med token som Authorization: Bearer <token>
   när användaren är inloggad. Det gäller även bokningen (POST /bookings),
   så en inloggad användares bokning kopplas till kontot i backend (T126b). */
export const bookingService = {
  getMyBookings: () => apiRequest<MyBookingsResponse>("bookings/me"),

  /* Avbokar en bokning (DELETE /bookings/:id).
     Backend tillåter bara ägaren (eller admin) och bara om visningen inte har börjat.
     Bokningen raderas och platserna blir lediga. Status "Avbokad" kommer i sprint 4 (T113). */
  cancelBooking: (bookingId: string | number) =>
    apiRequest<{ bookingId: number }>(
      `bookings/${encodeURIComponent(String(bookingId))}`,
      { method: "DELETE" },
    ),
};
