import { InputGroup, Form } from "react-bootstrap";
import type { TicketCounterProps } from "../interface/types";

/* En biljettrad på bokningssidan: biljettyp, pris och − antal +.
   Används för Vuxen, Barn och Pensionär i Booking.tsx.
   (TicketButton är något annat: länkknappen "Biljetter →".) */
export default function TicketCounter({
  label,
  price,
  count,
  onDecrease,
  onIncrease,
  onChange,
}: TicketCounterProps) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <span>
        {label} : {price} kr
      </span>
      <InputGroup style={{ maxWidth: 140 }}>
        <button
          className="btn btn-outline-light"
          type="button"
          onClick={onDecrease}
          aria-label={`Ta bort en ${label.toLowerCase()}biljett`}
        >
          −
        </button>
        <Form.Control
          type="number"
          className="text-center"
          value={count}
          onChange={(e) => onChange(e.target.value)}
          min={0}
          aria-label={`Antal ${label.toLowerCase()}biljetter`}
        />
        <button
          className="btn btn-outline-light"
          type="button"
          onClick={onIncrease}
          aria-label={`Lägg till en ${label.toLowerCase()}biljett`}
        >
          +
        </button>
      </InputGroup>
    </div>
  );
}
