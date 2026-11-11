import { useId } from "react";
import { InputGroup, Form } from "react-bootstrap";
import type { TicketCounterProps } from "../interface/types";

export default function TicketCounter({
  label,
  description,
  price,
  count,
  onDecrease,
  onIncrease,
  onChange,
}: TicketCounterProps) {
  const descriptionId = useId();
  const describedBy = description ? descriptionId : undefined;
  const ticketWord = label === "Pensionär" ? "pensionärs" : label.toLowerCase();

  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <div className="ticket-text">
        <span className="ticket-info">
          <span> {label}:</span>
          <span className="ticket-price"> {price} kr </span>
        </span>
        {description && (
          <small id={descriptionId} className="ticket-description">
            {description}
          </small>
        )}
      </div>
      <InputGroup style={{ maxWidth: 140 }} className="w-auto ms-auto">
        <button
          className="btn btn-outline-light"
          type="button"
          onClick={onDecrease}
          aria-label={`Ta bort en ${ticketWord}biljett`}
          aria-describedby={describedBy}
        >
          −
        </button>
        <Form.Control
          type="number"
          className="text-center ticket-input"
          value={count}
          onChange={(e) => onChange(e.target.value)}
          min={0}
          aria-label={`Antal ${ticketWord}biljetter`}
          aria-describedby={describedBy}
        />
        <button
          className="btn btn-outline-light"
          type="button"
          onClick={onIncrease}
          aria-label={`Lägg till en ${ticketWord}biljett`}
          aria-describedby={describedBy}
        >
          +
        </button>
      </InputGroup>
    </div>
  );
}
