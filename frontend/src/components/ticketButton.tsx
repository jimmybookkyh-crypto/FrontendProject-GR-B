import React from "react";
import { Link } from "react-router";
import { Button } from "react-bootstrap";
import { TicketButtonProps } from "../interface/types";

export default function TicketButton({
  to,
  label = "Biljetter →",
  onClick,
}: TicketButtonProps) {
  return (
    <Button
      as={Link as any}
      to={to}
      variant="normal"
      className="boka-knapp"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}