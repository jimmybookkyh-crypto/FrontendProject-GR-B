CREATE OR REPLACE VIEW public.booked_seats_view AS
SELECT
  b."showingId",
  s."seatId",
  s."seatsRow",
  s."seatsNumber",
  s."auditoriumId"
FROM public.tickets t
JOIN public.bookings b
  ON t."bookingId" = b."bookingId"
JOIN public.seats s
  ON t."seatId" = s."seatId"
WHERE b.status = 'confirmed';

CREATE OR REPLACE VIEW public.event_showings_view AS
SELECT
    e."eventId",
    e.name AS "eventName",
    s."showingId",
    s.date,
    s."time",
    m."movieId",
    m.title AS "movieTitle",
    a."auditoriumId",
    a.name AS "auditoriumName"
FROM public.events e
JOIN public.showings s
    ON s."eventId" = e."eventId"
JOIN public.movies m
    ON s."movieId" = m."movieId"
JOIN public.auditoriums a
    ON s."auditoriumId" = a."auditoriumId";

   revoke all on public.booked_seats_view   from anon, authenticated;
   revoke all on public.event_showings_view from anon, authenticated;