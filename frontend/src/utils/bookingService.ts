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
};
