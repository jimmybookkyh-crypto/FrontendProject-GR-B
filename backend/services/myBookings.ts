import { pool } from "../db/pool.js";

export type MyBookingTicket = {
  seatsRow: number;
  seatsNumber: number;
  ticketType: string;
  price: number;
};

export type MyBooking = {
  bookingId: string; 
  bookingNumber: string;
  createdAt: string;
  showingId: string;
  movieId: string;
  movieTitle: string;
  images: string[] | string | null;
  ageRating: number | null;
  date: string; 
  time: string; 
  auditoriumName: string;
  isUpcoming: boolean;
  totalPrice: number;
  tickets: MyBookingTicket[];
  canCancel: boolean;
  status: "confirmed" | "cancelled";
};

export type MyBookings = {
  upcoming: MyBooking[]; 
  past: MyBooking[]; 
};

export async function getMyBookings(userId: number): Promise<MyBookings> {
  const { rows } = await pool.query<MyBooking>(
    `select
        b."bookingId",
        b."bookingNumber",
        b.created_at as "createdAt",
        b.status,
        sh."showingId",
        m."movieId",
        m.title as "movieTitle",
        m.images,
        m."ageRating",
        sh.date::text as date,
        left(sh."time"::time::text, 5) as "time",
        a.name as "auditoriumName",
        (b.status = 'confirmed' and (sh.date + sh."time") > now()) as "isUpcoming",
        (b.status = 'confirmed' and (sh.date + sh."time") - interval '2 hours' > now()) as "canCancel",
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
