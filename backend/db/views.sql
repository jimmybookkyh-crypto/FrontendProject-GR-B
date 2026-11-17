/* GET /showings/:id/seats - Get all booked seats for a specific showing */
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

/* GET /events/:id/showings - Get all showings for a specific event */
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

/* GET /showings and GET /showings/:id - Get showings with movie, auditorium, eventId and hasStarted */
CREATE OR REPLACE VIEW public.showing_details_view AS
SELECT
    s."showingId",
    s.date::text AS date,
    left(s."time"::text, 5) AS "time",
    s."movieId",
    m.title AS "movieTitle",
    s."auditoriumId",
    a.name AS "auditoriumName",
    s."eventId",
    ((s.date + s."time") <= now()) AS "hasStarted"
FROM public.showings s
JOIN public.movies m
    ON m."movieId" = s."movieId"
JOIN public.auditoriums a
    ON a."auditoriumId" = s."auditoriumId";

/* POST /showings and PATCH /showings/:id - Get showings per auditorium and date with movie length, for the overlap check */
CREATE OR REPLACE VIEW public.auditorium_schedule_view AS
SELECT
    s."showingId",
    s."auditoriumId",
    s.date::text AS date,
    left(s."time"::text, 5) AS "time",
    m.length AS "movieDurationMinutes"
FROM public.showings s
JOIN public.movies m
    ON m."movieId" = s."movieId";

  /* Stänger vyerna för Supabases publika API (anon/authenticated).
      Backend ansluter som postgres och påverkas inte. */
   revoke all on public.booked_seats_view   from anon, authenticated;
   revoke all on public.event_showings_view from anon, authenticated;
   revoke all on public.showing_details_view from anon, authenticated;
   revoke all on public.auditorium_schedule_view from anon, authenticated;