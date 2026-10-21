
import React from "react";
import { useNavigate } from "react-router";
import { BackButtonProps } from "../interface/types";
import "../styles/buttons.css";

export default function BackButton({
  label = "← Tillbaka",
  to,
  className = "cta-btn rounded-pill py-2 px-4 fw-bold m-3",
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
      className={className}
    >
      {label}
    </button>
  );
}



