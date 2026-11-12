import { useMemo } from "react";
import screenIcon from "../assets/img/screenIco.webp";
import type { Seat } from "../interface/types";

import findBestSeats from "../utils/seats";

interface SeatMapProps {
  auditoriumName: string;
  seats: Seat[];
  occupiedSeats?: number[];
  selectedSeats: Seat[];
  onSeatClick: (seat: Seat) => void;
}

export const groupSeatsByRow = (seats: Seat[]): Seat[][] => {
  const rowsMap = new Map<number, Seat[]>();

  seats.forEach((seat) => {
    if (!rowsMap.has(seat.seatsRow)) {
      rowsMap.set(seat.seatsRow, []);
    }
    rowsMap.get(seat.seatsRow)!.push(seat);
  });

  return Array.from(rowsMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([, rowSeats]) =>
      rowSeats.sort((a, b) => a.seatsNumber - b.seatsNumber),
    );
};

export default function SeatMap({
  auditoriumName,
  seats,
  occupiedSeats = [],
  selectedSeats,
  onSeatClick,
}: SeatMapProps) {
  const rows = useMemo(() => groupSeatsByRow(seats), [seats]);

  const bestSeats = useMemo(
    () => findBestSeats(seats, occupiedSeats, selectedSeats, auditoriumName),
    [seats, occupiedSeats, selectedSeats, auditoriumName],
  );

  return (
    <div className="seat-map-container">
      <h3 className="h5 fw-bold heading-gold mb-3 text-center text-uppercase">
        {auditoriumName}
      </h3>

      <div className="d-flex justify-content-center w-100 mb-3">
        <img src={screenIcon} alt="Bioduk" className="screen-icon img-fluid" />
      </div>

      <div className="d-flex flex-column align-items-center">
        {rows.map((row, rowIndex) => (
          <div
            key={`row-${rowIndex + 1}`}
            className="d-flex flex-nowrap justify-content-center align-items-center mb-1"
          >
            {row.map((seat) => {
              const isOccupied = occupiedSeats.some(
                (occId) => Number(occId) === Number(seat.seatId),
              );

              const isSelected = selectedSeats.some(
                (s) => Number(s.seatId) === Number(seat.seatId),
              );
              const isRecommended =
                bestSeats !== null &&
                Number(bestSeats.seatId) === Number(seat.seatId);

              return (
                <button
                  key={seat.seatId}
                  type="button"
                  className={`seat ${
                    isOccupied
                      ? "occupied seat-occupied"
                      : isSelected
                        ? "selected seat-selected"
                        : isRecommended
                          ? "recommended seat-recommended"
                          : "available seat-available"
                  }`}
                  disabled={isOccupied}
                  onClick={() => !isOccupied && onSeatClick(seat)}
                  title={`Rad ${seat.seatsRow}, stol ${seat.seatsNumber}${isRecommended ? " – rekommenderad plats" : ""}`}
                >
                  {seat.seatsNumber}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-center gap-3 mt-3 flex-wrap fs-5">
        <span>⚪ Ledig</span>
        <span>⚫ Upptagen</span>
        <span>🟡 Vald</span>
        <span>🟢 För bästa upplevelse</span>
      </div>
    </div>
  );
}