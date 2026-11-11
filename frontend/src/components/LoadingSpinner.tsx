import { useEffect, useState } from "react";
import Spinner from "react-bootstrap/Spinner";

type LoadingSpinnerProps = {
  text?: string;
  delay?: number;
};

export default function LoadingSpinner({
  text = "Laddar…",
  delay = 400,
}: LoadingSpinnerProps) {
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return;
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!visible) return null;

  return (
    <div
      className="d-flex flex-column align-items-center gap-2 py-5 text-light"
      role="status"
      aria-live="polite"
    >
      <Spinner
        animation="border"
        style={{ color: "var(--fv-guldgul, #dfa213)" }}
        aria-hidden="true"
      />
      <span>{text}</span>
    </div>
  );
}
