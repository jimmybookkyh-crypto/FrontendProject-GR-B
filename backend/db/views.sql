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
  ON t."seatId" = s."seatId";

/* GET /showings/:id/bookings - Get all bookings for a specific showing */
CREATE OR REPLACE VIEW public.showing_bookings_view AS
SELECT
  b."bookingId",
  b."bookingNumber",
  b."showingId",
  b."userId",
  b.created_at
FROM public.bookings b;

/* GET /bookings/:id/tickets - Get all tickets for a specific booking */
CREATE OR REPLACE VIEW public.booking_tickets_view AS
SELECT
    t."ticketId",
    t."bookingId",
    tt."ticketTypeid",
    tt.name AS "ticketType",
    tt.price,
    s."seatId",
    s."seatsRow",
    s."seatsNumber"
FROM public.tickets t
JOIN public."ticketTypes" tt
    ON t."ticketTypeId" = tt."ticketTypeid"
JOIN public.seats s
    ON t."seatId" = s."seatId";

/* GET /bookings?status=past - Get booking history for past bookings */
CREATE OR REPLACE VIEW public.booking_history_view AS
SELECT
    b."bookingId",
    b."bookingNumber",
    b."userId",
    b."showingId",
    m."movieId",
    m.title AS "movieTitle",
    s.date,
    s."time",
    a."auditoriumId",
    a.name AS "auditoriumName"
FROM public.bookings b
JOIN public.showings s
    ON b."showingId" = s."showingId"
JOIN public.movies m
    ON s."movieId" = m."movieId"
JOIN public.auditoriums a
    ON s."auditoriumId" = a."auditoriumId";

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
