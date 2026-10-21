
import React from "react";
import { useNavigate } from "react-router";
import { BackButtonProps } from "../interface/types";

export default function BackButton({
  label = "← Tillbaka",
  to,
  onClick,
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(); // Om klick lagts till
    } else if (to) {
      navigate(to); // Om adress lagts till
    } else {
      navigate(-1); // Annars bakåt i historiken
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="btn tillbaka-knapp rounded-pill py-2 px-4 fw-bold m-3"
    >
      {label}
    </button>
  );
}



