// src/components/SlotButton.tsx
import React from "react";
import { Button } from "react-bootstrap";
import { SlotButtonProps } from "../interface/types";

export default function SlotButton({
  auditoriumName,
  time,
  onClick,
}: SlotButtonProps) {
  return (
    <Button
      size="lg"
      className="tid-knapp rounded-pill py-2 px-4 fw-bold d-flex justify-content-between align-items-center"
      onClick={onClick}
    >
      <span>{auditoriumName}</span>
      <span>kl {time}</span>
    </Button>
  );
}
