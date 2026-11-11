import { pool } from "../db/pool.js";

export async function getBookedSeatIds(
  showingId: number,
): Promise<number[]> {
  const bookedSeats = await pool.query(
    `
    select "seatId"
    from booked_seats_view
    where "showingId" = $1
    `,
    [showingId]
  );

  return bookedSeats.rows.map(
    (row) => Number(row.seatId)
  );
}
