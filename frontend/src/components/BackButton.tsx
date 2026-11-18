import { useNavigate } from "react-router";
import type { BackButtonProps } from "../interface/types";
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
      onClick(); 
    } else if (to) {
   navigate(to, { viewTransition: true });
    } else {
      navigate(-1); 
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


