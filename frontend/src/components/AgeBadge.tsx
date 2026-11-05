import type { AgeBadgeProps } from "../interface/types";


export default function AgeBadge({ ageRating, className = "" }: AgeBadgeProps) {
    if (ageRating === null || ageRating === undefined) return null;

  const text = ageRating === 0 ? "Btl" : `${ageRating}+`;
  const description = ageRating === 0 ? "Barntillåten" : `Från ${ageRating} år`;

  return (
    <span
      className={`d-inline-flex align-items-center justify-content-center fw-bold text-white bg-dark bg-opacity-75 rounded-circle border border-light flex-shrink-0 ${className}`}
      style={{ width: "36px", height: "36px", fontSize: "0.85rem" }}
      title={description}
      aria-label={`Åldersgräns: ${description}`}
    >
      {text}
    </span>
  );
}
