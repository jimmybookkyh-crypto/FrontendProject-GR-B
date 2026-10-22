import Spinner from "react-bootstrap/Spinner";

type LoadingSpinnerProps = {
  text?: string; // t.ex. "Hämtar filmer…"
};

/* Gemensam laddningsindikator.
   Användning: {loading && <LoadingSpinner text="Hämtar filmer…" />} */
export default function LoadingSpinner({
  text = "Laddar…",
}: LoadingSpinnerProps) {
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
