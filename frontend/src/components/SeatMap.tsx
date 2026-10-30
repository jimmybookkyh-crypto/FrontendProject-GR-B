import { useMemo } from "react";

export interface Seat {
  seatId: number;
  seatsRow: number;
  seatsNumber: number;
  auditoriumId: number;
}

interface SeatMapProps {
  auditoriumName: string;
  seats: Seat[];
  occupiedSeats?: number[];
  selectedSeats: Seat[];
  onSeatClick: (seat: Seat) => void;
}

/**
 * Hjälpfunktion: Grupperar stolar per rad och sorterar dem i nummerordning
 */
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
    .map(([_, rowSeats]) =>
      rowSeats.sort((a, b) => a.seatsNumber - b.seatsNumber)
    );
};

export default function SeatMap({
  auditoriumName,
  seats,
  occupiedSeats = [],
  selectedSeats,
  onSeatClick,
}: SeatMapProps) {
  // Grupperar stolarna rad för rad
  const rows = useMemo(() => groupSeatsByRow(seats), [seats]);

  return (
    <div className="seat-map-container">
      <h3 className="h5 fw-bold heading-gold mb-3 text-center text-uppercase">
        {auditoriumName}
      </h3>

      {/* Bioduk-bild */}
      <div className="d-flex justify-content-center w-100 mb-3">
        <img
          src="/src/assets/img/screenIco.png"
          alt="Bioduk"
          className="screen-icon img-fluid"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "../assets/img/screenIco.png";
          }}
        />
      </div>

      {/* Stolsnätverk */}
      <div className="d-flex flex-column align-items-center">
        {rows.map((row, rowIndex) => (
          <div
            key={`row-${rowIndex + 1}`}
            className="d-flex flex-nowrap justify-content-center align-items-center mb-1"
          >
            {/* Radnummer till vänster */}
            <span
              className="me-2 text-muted small"
              style={{ width: "25px", textAlign: "right" }}
            >
              R{row[0]?.seatsRow}
            </span>

            {/* Stolsknappar */}
            {row.map((seat) => {
              // ✅ 1. Säkra jämförelse med Number() så att strängar och siffror matchar
              const isOccupied = occupiedSeats.some(
                (occId) => Number(occId) === Number(seat.seatId)
              );

              const isSelected = selectedSeats.some(
                (s) => Number(s.seatId) === Number(seat.seatId)
              );

              return (
                <button
                  key={seat.seatId}
                  type="button"
                  // ✅ 2. Inkluderar både 'occupied' och 'seat-occupied' för att täcka alla CSS-stilar
                  className={`seat ${isOccupied
                      ? "occupied seat-occupied"
                      : isSelected
                        ? "selected seat-selected"
                        : "available seat-available"
                    }`}
                  disabled={isOccupied}
                  onClick={() => !isOccupied && onSeatClick(seat)}
                  title={`Rad ${seat.seatsRow}, Stol ${seat.seatsNumber}`}
                >
                  {seat.seatsNumber}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Teckenförklaring */}
      <div className="d-flex justify-content-center gap-3 mt-3 flex-wrap fs-5">
        <span>⚪ Ledig</span>
        <span>⚫ Upptagen</span>
        <span>🟡 Vald</span>
      </div>
    </div>
  );
}