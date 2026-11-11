import { useState, type SubmitEvent } from "react";
import { useSearchParams } from "react-router";
import Alert from "react-bootstrap/Alert";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import RequireAuth from "../components/RequireAuth.tsx";
import LoadingSpinner from "../components/LoadingSpinner.tsx";
import useFetch from "../hooks/useFetch.ts";
import {
  adminBookingPath,
  bookingService,
} from "../utils/bookingService.ts";
import {
  formatBiljettyper,
  formatPlatser,
  formatPris,
  formatVisning,
} from "../utils/format.ts";
import type { AdminBooking } from "../interface/types.ts";
import "../styles/MyPage.css";

export default function AdminPage() {
  return (
    <RequireAuth role="admin">
      <AdminPortal />
    </RequireAuth>
  );
}

AdminPage.route = {
  path: "/admin",
  order: 0,
  label: "Admin",
};

const BOOKING_NUMBER_PATTERN = /^[0-9A-F]{8}$/;

function normalizeBookingNumber(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

function AdminPortal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searched = searchParams.get("bokning") ?? "";
  const isValid = BOOKING_NUMBER_PATTERN.test(searched);

  const [input, setInput] = useState(searched);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  const {
    data: booking,
    loading,
    error,
  } = useFetch<AdminBooking>(
    isValid ? `${adminBookingPath(searched)}?v=${refreshKey}` : null,
  );

  function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setSearchParams({ bokning: normalizeBookingNumber(input) });
  }

  const notFound =
    (searched !== "" && !isValid) ||
    error === "Bokningen finns ej" ||
    error === "Det du letar efter finns inte.";

  return (
    <div className="mypage">
      <Container className="py-4 py-lg-5">
        <header className="text-center mb-4 mb-lg-5">
          <h1 className="mypage-title">Adminportal</h1>
          <p className="mypage-greeting mb-0">
            Sök fram en bokning med bokningsnumret.
          </p>
        </header>

        <Row className="justify-content-center g-4">
          <Col xs={12} lg={8}>
            <Form noValidate onSubmit={handleSearch} className="mypage-panel">
              <h2 className="mypage-panel-title">Sök bokning</h2>
              <Form.Group controlId="admin-booking-number" className="mt-3">
                <Form.Label>Bokningsnummer</Form.Label>
                <div className="d-flex flex-column flex-sm-row gap-2 mt-2">
                  <Form.Control
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="t.ex. 3F9A0C1B"
                    autoComplete="off"
                    spellCheck={false}
                    maxLength={12}
                    className="text-uppercase"
                    aria-describedby="admin-booking-help"
                  />
                  <button
                    type="submit"
                    className="mypage-btn mypage-btn-outline"
                  >
                    Sök
                  </button>
                </div>
                <Form.Text
                  id="admin-booking-help"
                  className="mypage-help d-block mt-2"
                >
                  8 tecken, siffror 0–9 och bokstäver A–F.
                </Form.Text>
              </Form.Group>
            </Form>
          </Col>

          <Col xs={12} lg={8} aria-live="polite">
            {notice && (
              <Alert
                variant="success"
                dismissible
                onClose={() => setNotice(null)}
                className="mypage-notice"
                role="status"
              >
                {notice}
              </Alert>
            )}

            {loading && <LoadingSpinner text="Söker bokning…" />}

            {notFound && (
              <div className="mypage-panel">
                <p className="mb-0 fw-bold">Bokningen finns inte.</p>
                <p className="mypage-help mb-0">
                  Kontrollera bokningsnumret och sök igen.
                </p>
              </div>
            )}

            {error && !notFound && (
              <Alert variant="danger" className="mb-0">
                {error}
              </Alert>
            )}

            {booking && (
              <AdminBookingCard
                booking={booking}
                onCancelled={(message) => {
                  setNotice(message);
                  setRefreshKey((key) => key + 1);
                }}
              />
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

function posterUrl(images: AdminBooking["images"]): string {
  if (!images) return "";
  try {
    const parsed = typeof images === "string" ? JSON.parse(images) : images;
    return Array.isArray(parsed) ? (parsed[0] ?? "") : String(parsed);
  } catch {
    return typeof images === "string" ? images : "";
  }
}

function AdminBookingCard({
  booking,
  onCancelled,
}: {
  booking: AdminBooking;
  onCancelled: (message: string) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const poster = posterUrl(booking.images);
  const isCancelled = booking.status === "cancelled";
  const canCancel = !isCancelled && !booking.hasStarted;
  const seats = formatPlatser(booking.tickets).join(" · ");
  const ticketTypes = formatBiljettyper(
    booking.tickets.map((ticket) => ticket.ticketType),
  );

  async function confirmCancel() {
    setCancelling(true);
    setCancelError(null);
    try {
      await bookingService.cancelBooking(booking.bookingId);
      setConfirmOpen(false);
      onCancelled(
        `Bokning ${booking.bookingNumber} är avbokad. Platserna är nu lediga.`,
      );
    } catch (error) {
      setCancelError(
        error instanceof Error ? error.message : "Bokningen kunde inte avbokas.",
      );
    } finally {
      setCancelling(false);
    }
  }

  return (
    <section className="mypage-panel" aria-labelledby="admin-booking-title">
      <div className="mypage-booking">
        <div className="mypage-poster">
          {poster ? (
            <img src={poster} alt="" loading="lazy" />
          ) : (
            <span>Affisch</span>
          )}
        </div>

        <div className="mypage-booking-info">
          <h2 id="admin-booking-title" className="mypage-movie-title">
            {booking.movieTitle}
          </h2>
          <p className="mb-1">
            {formatVisning(booking.date, booking.time)} ·{" "}
            {booking.auditoriumName}
          </p>
          <p className="mb-1">
            {seats} · {ticketTypes}
          </p>
          <p className="mypage-total">
            Totalt {formatPris(booking.totalPrice)}
          </p>
          <p className="mypage-bookingnr">
            Bokningsnummer: <span>{booking.bookingNumber}</span>
          </p>
          <p className="mb-1">E-post: {booking.email}</p>
          <p className="mb-0">
            Status:{" "}
            <span className="mypage-badge">
              {isCancelled ? "Avbokad" : "Bekräftad"}
            </span>
          </p>
        </div>

        <div className="mypage-booking-actions mypage-booking-actions-single">
          {canCancel ? (
            <button
              type="button"
              className="mypage-btn mypage-btn-red"
              onClick={() => {
                setCancelError(null);
                setConfirmOpen(true);
              }}
            >
              Avboka
            </button>
          ) : (
            <span className="mypage-cancel-closed">
              {isCancelled ? "Bokningen är avbokad" : "Visningen har börjat"}
            </span>
          )}
          {!isCancelled && <small>Betalas i kassan</small>}
        </div>
      </div>

      {/* ---------- Bekräfta avbokning ---------- */}
      <Modal
        show={confirmOpen}
        onHide={() => !cancelling && setConfirmOpen(false)}
        centered
        contentClassName="mypage-modal"
      >
        <Modal.Header closeButton={!cancelling}>
          <Modal.Title as="h2">Är du säker?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-1 fw-bold">{booking.movieTitle}</p>
          <p className="mb-1">
            {formatVisning(booking.date, booking.time)} ·{" "}
            {booking.auditoriumName}
          </p>
          <p className="mb-3">{seats}</p>
          <p className="mb-0">
            Bokning {booking.bookingNumber} avbokas och platserna släpps till
            andra besökare. Det går inte att ångra.
          </p>
          {cancelError && (
            <Alert variant="danger" className="py-2 mt-3 mb-0">
              {cancelError}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="mypage-btn mypage-btn-outline"
            onClick={() => setConfirmOpen(false)}
            disabled={cancelling}
          >
            Behåll bokningen
          </button>
          <button
            type="button"
            className="mypage-btn mypage-btn-red"
            onClick={confirmCancel}
            disabled={cancelling}
          >
            {cancelling ? "Avbokar…" : "Ja, avboka"}
          </button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}
