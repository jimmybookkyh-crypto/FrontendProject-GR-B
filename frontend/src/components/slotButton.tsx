import type { SlotButtonProps } from "../interface/types";

export default function SlotButton({
  auditoriumName,
  time,
  disabled = false,
  onClick,
}: SlotButtonProps) {
  return (
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
