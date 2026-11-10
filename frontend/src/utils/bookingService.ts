import apiRequest from "./apiRequest.ts";
import type { MyBookingsResponse } from "../interface/types.ts";

/* Sökvägen till användarens egna bokningar (T126c).
   Används med useFetch: useFetch<MyBookingsResponse>(MY_BOOKINGS_PATH) */
export const MY_BOOKINGS_PATH = "/bookings/me";

/* Adminportalen (P13 #417): sökvägen till en bokning via bokningsnumret.
   Används med useFetch: useFetch<AdminBooking>(adminBookingPath("3F9A0C1B")) */
export const adminBookingPath = (bookingNumber: string) =>
  `/bookings/number/${encodeURIComponent(bookingNumber)}`;

/* Guest cancellation (P17.2): path to a booking via the cancel token from the confirmation email.
   Used with useFetch: useFetch<TokenBooking>(bookingByTokenPath(token)) */
export const bookingByTokenPath = (token: string) =>
  `/bookings/token/${encodeURIComponent(token)}`;

/* API-anrop för bokningar (T126e).
   apiRequest skickar automatiskt med token som Authorization: Bearer <token>
   när användaren är inloggad. Det gäller även bokningen (POST /bookings),
   så en inloggad användares bokning kopplas till kontot i backend (T126b). */
export const bookingService = {
  getMyBookings: () => apiRequest<MyBookingsResponse>("bookings/me"),

  /* Avbokar en bokning (PATCH /bookings/:id/cancel).
     Backend tillåter bara ägaren (eller admin) och bara fram till 2 timmar före visningen.
     Bokningen och biljetterna sparas med status "cancelled". */
  cancelBooking: (bookingId: string | number) =>
    apiRequest<{ bookingId: number }>(
      `bookings/${encodeURIComponent(String(bookingId))}/cancel`,
      { method: "PATCH" },
    ),

  /* Cancels a guest booking with the token from the confirmation email
     (PATCH /bookings/token/:token/cancel). No login is needed, the token is the key.
     The backend allows it until 2 hours before the showing. */
  cancelBookingByToken: (token: string) =>
    apiRequest<{ bookingId: number }>(
      `bookings/token/${encodeURIComponent(token)}/cancel`,
      { method: "PATCH" },
    ),
};
