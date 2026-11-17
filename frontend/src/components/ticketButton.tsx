import { Link } from "react-router";
import type { TicketButtonProps } from "../interface/types";

export default function TicketButton({
  to,
  label = "Biljetter →",
  onClick,
}: TicketButtonProps) {
  return (
    <Link
      to={to}
      viewTransition
      className="cta-btn text-decoration-none"
      onClick={onClick}
    >
      {label}
    </Link>
  );
}

