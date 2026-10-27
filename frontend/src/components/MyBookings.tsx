import { useState } from "react";
import { Link, useNavigate } from "react-router";
import Alert from "react-bootstrap/Alert";
import Modal from "react-bootstrap/Modal";
import { bookingService } from "../utils/bookingService.ts";
import {
  formatBiljettyper,
  formatPlatser,
  formatPris,
  formatVisning,
} from "../utils/format.ts";
import { kortDatum } from "../utils/datum.ts";
import type { MyBooking, MyBookingsResponse } from "../interface/types.ts";

/* Kommande och Tidigare bokningar på Mina sidor (T126f / #330).
   Data kommer från GET /bookings/me (T126c), redan uppdelad och sorterad i backend. */

type MyBookingsProps = {
  bookings: MyBookingsResponse;
  onCancelled: (message: string) => void; // MyPage hämtar om listan
};

/* images kan vara en lista, en JSON-text eller en vanlig sökväg (samma som MovieCard) */
function posterUrl(images: MyBooking["images"]): string {
  if (!images) return "";
  try {
    const parsed = typeof images === "string" ? JSON.parse(images) : images;
    return Array.isArray(parsed) ? (parsed[0] ?? "") : String(parsed);
  } catch {
    return typeof images === "string" ? images : "";
  }
}

/* "Rad 5: stol 6, 7, 8" -> "Rad 5 · stol 6, 7, 8" (som i skissen) */
function platserText(booking: MyBooking): string {
  return formatPlatser(booking.tickets)
    .map((rad) => rad.replace(":", " ·"))
    .join(" · ");
}

function biljetterText(booking: MyBooking): string {
  return formatBiljettyper(booking.tickets.map((t) => t.ticketType));
}

function Poster({ booking }: { booking: MyBooking }) {
  const url = posterUrl(booking.images);
  return (
    <Link
      to={`/movies/${booking.movieId}`}
      className="mypage-poster"
      aria-label={`Mer om ${booking.movieTitle}`}
    >
      {url ? <img src={url} alt="" /> : <span>Affisch</span>}
    </Link>
  );
}

export default function MyBookings({ bookings, onCancelled }: MyBookingsProps) {
  const navigate = useNavigate();
  const [toCancel, setToCancel] = useState<MyBooking | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const { upcoming, past } = bookings;

  /* Bekräftelsesidan läser bokningen från navigate-state (T077) */
  function showBooking(booking: MyBooking) {
    navigate("/bookingconfirmation", {
      state: {
        bookingNumber: booking.bookingNumber,
        movieId: Number(booking.movieId),
        movieTitle: booking.movieTitle,
        images: booking.images ?? [],
        date: booking.date,
        time: booking.time,
        auditoriumName: booking.auditoriumName,
        tickets: booking.tickets.map((t) => ({
          ticketTypeName: t.ticketType,
          price: t.price,
          seatsRow: t.seatsRow,
          seatsNumber: t.seatsNumber,
        })),
      },
    });
  }

  async function confirmCancel() {
    if (!toCancel) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await bookingService.cancelBooking(toCancel.bookingId);
      const title = toCancel.movieTitle;
      setToCancel(null);
      onCancelled(
        `Din bokning till ${title} är avbokad. Platserna är nu lediga för andra.`,
      );
    } catch (error) {
      setCancelError(
        error instanceof Error
          ? error.message
          : "Bokningen kunde inte avbokas.",
      );
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="mypage-panel mypage-bookings">
      {/* ---------- Kommande ---------- */}
      <section aria-labelledby="mypage-upcoming">
        <h2 id="mypage-upcoming" className="mypage-section-title">
          Kommande{" "}
          <span className="mypage-count">
            {upcoming.length} {upcoming.length === 1 ? "bokning" : "bokningar"}
          </span>
        </h2>

        {upcoming.length === 0 ? (
          <div className="mypage-empty">
            <p>Du har inga kommande bokningar.</p>
            <Link to="/moviecatalog" className="mypage-btn mypage-btn-red">
              Se våra filmer
            </Link>
          </div>
        ) : (
          <ul className="mypage-list">
            {upcoming.map((booking) => (
              <li key={booking.bookingId} className="mypage-booking">
                <Poster booking={booking} />

                <div className="mypage-booking-info">
                  <h3 className="mypage-movie-title">{booking.movieTitle}</h3>
                  <p className="mb-1">
                    {formatVisning(booking.date, booking.time)} ·{" "}
                    {booking.auditoriumName}
                  </p>
                  <p className="mb-1">
                    {platserText(booking)} · {biljetterText(booking)}
                  </p>
                  <p className="mypage-total">
                    Totalt {formatPris(booking.totalPrice)}
                  </p>
                  <p className="mypage-bookingnr">
                    Bokningsnummer: <span>{booking.bookingNumber}</span>
                  </p>
                </div>

                <div className="mypage-booking-actions">
                  <button
                    type="button"
                    className="mypage-btn mypage-btn-outline"
                    onClick={() => showBooking(booking)}
                  >
                    Visa bokning
                  </button>
                  <button
                    type="button"
                    className="mypage-btn mypage-btn-red"
                    onClick={() => {
                      setCancelError(null);
                      setToCancel(booking);
                    }}
                  >
                    Avboka
                  </button>
                  <small>Betalas i kassan</small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---------- Tidigare ---------- */}
      <section aria-labelledby="mypage-past" className="mt-4">
        <h2 id="mypage-past" className="mypage-section-title">
          Tidigare <span className="mypage-count">Filmer du har sett</span>
        </h2>

        {past.length === 0 ? (
          <p className="mypage-empty-text">Du har inga tidigare bokningar.</p>
        ) : (
          <ul className="mypage-list mypage-past">
            {past.map((booking) => (
              <li key={booking.bookingId} className="mypage-past-row">
                <span className="mypage-past-title">{booking.movieTitle}</span>
                <span>
                  {kortDatum(booking.date)} · {booking.time}
                </span>
                <span>{biljetterText(booking)}</span>
                <span className="mypage-past-price">
                  {formatPris(booking.totalPrice)}
                </span>
                {/* "Avbokad" kommer när bokningar får status (T113, sprint 4) */}
                <span className="mypage-badge">Sedd</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---------- Bekräfta avbokning ---------- */}
      <Modal
        show={toCancel !== null}
        onHide={() => !cancelling && setToCancel(null)}
        centered
        contentClassName="mypage-modal"
      >
        <Modal.Header closeButton={!cancelling}>
          <Modal.Title as="h2">Avboka bokningen?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {toCancel && (
            <>
              <p className="mb-1 fw-bold">{toCancel.movieTitle}</p>
              <p className="mb-1">
                {formatVisning(toCancel.date, toCancel.time)} ·{" "}
                {toCancel.auditoriumName}
              </p>
              <p className="mb-3">{platserText(toCancel)}</p>
              <p className="mb-0">
                Platserna släpps till andra besökare direkt. Det går inte att
                ångra.
              </p>
            </>
          )}
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
            onClick={() => setToCancel(null)}
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
    </div>
  );
}
