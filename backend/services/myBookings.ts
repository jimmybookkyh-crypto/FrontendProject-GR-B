import { pool } from "../db/pool.js";

/* En biljett i en av användarens bokningar */
export type MyBookingTicket = {
  seatsRow: number;
  seatsNumber: number;
  ticketType: string; // t.ex. "Vuxen"
  price: number;
};

/* En bokning som den visas på Mina sidor */
export type MyBooking = {
  bookingId: string; // bigint kommer som text från pg
  bookingNumber: string;
  createdAt: string;
  showingId: string;
  movieId: string;
  movieTitle: string;
  images: string[] | string | null;
  ageRating: number | null;
  date: string; // "2026-10-26"
  time: string; // "18:30"
  auditoriumName: string;
  isUpcoming: boolean;
  totalPrice: number;
  tickets: MyBookingTicket[];
};

export type MyBookings = {
  upcoming: MyBooking[]; // närmast först
  past: MyBooking[]; // senaste först
};

/* Hämtar alla bokningar för en användare (T126c).
   Om visningen är kommande eller passerad avgörs i SQL (jämförs med now()),
   så att det inte blir tidszonsfel i JavaScript.
   Datum returneras som text (date::text), som i T094b.

   När avbokning som status är klar (T113) läggs detta till i select:
     b.status,
   och isUpcoming ändras till:
     (b.status = 'confirmed' and (sh.date + sh."time") > now()) as "isUpcoming"
   Då hamnar avbokade bokningar alltid under "Tidigare". */
export async function getMyBookings(userId: number): Promise<MyBookings> {
  const { rows } = await pool.query<MyBooking>(
    `select
        b."bookingId",
        b."bookingNumber",
        b.created_at as "createdAt",
        sh."showingId",
        m."movieId",
        m.title as "movieTitle",
        m.images,
        m."ageRating",
        sh.date::text as date,
        left(sh."time"::time::text, 5) as "time",
        a.name as "auditoriumName",
        ((sh.date + sh."time") > now()) as "isUpcoming",
        coalesce(sum(tt.price), 0)::int as "totalPrice",
        coalesce(
          json_agg(
            json_build_object(
              'seatsRow', s."seatsRow",
              'seatsNumber', s."seatsNumber",
              'ticketType', tt.name,
              'price', tt.price
            )
            order by s."seatsRow", s."seatsNumber"
          ) filter (where t."ticketId" is not null),
          '[]'
        ) as tickets
      from bookings b
      join showings sh on sh."showingId" = b."showingId"
      join movies m on m."movieId" = sh."movieId"
      join auditoriums a on a."auditoriumId" = sh."auditoriumId"
      left join tickets t on t."bookingId" = b."bookingId"
      left join seats s on s."seatId" = t."seatId"
      left join "ticketTypes" tt on tt."ticketTypeId" = t."ticketTypeId"
      where b."userId" = $1
      group by b."bookingId", sh."showingId", m."movieId", a."auditoriumId"
      order by sh.date, sh."time"`,
    [userId],
  );

  return {
    upcoming: rows.filter((booking) => booking.isUpcoming),
    past: rows.filter((booking) => !booking.isUpcoming).reverse(),
  };
}
