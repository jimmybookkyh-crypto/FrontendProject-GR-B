// src/components/SlotButton.tsx
import { Button } from "react-bootstrap";
import type { SlotButtonProps } from "../interface/types";

export default function SlotButton({
  auditoriumName,
  time,
  disabled = false,
  onClick,
}: SlotButtonProps) {
  return (
    <Button
      size="lg"
      className="tid-knapp rounded-pill py-2 px-3 px-md-4 fw-bold d-flex justify-content-between align-items-center gap-3"
      onClick={onClick}
      disabled={disabled}
    >
      <span>{auditoriumName}</span>
      <span>{time}</span>
    </Button>
  );
}
