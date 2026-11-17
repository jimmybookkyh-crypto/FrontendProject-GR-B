import { Link } from "react-router";
import type { TicketButtonProps } from "../interface/types";

export default function TicketButton({
  to,
  label = "Biljetter →",
  onClick,
}: TicketButtonProps) {
  return (
    // Plain Link, so Bootstrap's .btn styles do not override .cta-btn
    <Link to={to} className="cta-btn text-decoration-none" onClick={onClick}>
      {label}
    </Link>
  );
}

