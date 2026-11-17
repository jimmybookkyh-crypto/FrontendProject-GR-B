// src/components/SlotButton.tsx
import type { SlotButtonProps } from "../interface/types";

export default function SlotButton({
  auditoriumName,
  time,
  disabled = false,
  onClick,
}: SlotButtonProps) {
  return (
    // Plain button, so Bootstrap's .btn styles do not override .cta-btn.
    // tid-knapp is kept for the detail page's own rules (font size, no line break).
    <button
      type="button"
      className="cta-btn tid-knapp d-flex justify-content-between align-items-center gap-3"
      onClick={onClick}
      disabled={disabled}
    >
      <span>{auditoriumName}</span>
      <span>{time}</span>
    </button>
  );
}
