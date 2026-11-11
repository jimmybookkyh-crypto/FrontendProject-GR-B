import { Row, Container, Col, Card } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router";
import backgroundImage from "../assets/img/biodukbg.webp";
import "../styles/buttons.css";
import ErrorMessage from "../components/ErrorMessage";
import MovieCard from "../components/MovieCard";
import BackButton from "../components/BackButton";
import LoadingSpinner from "../components/LoadingSpinner";
import useFetch from "../hooks/useFetch";
import { bookingByTokenPath, bookingService } from "../utils/bookingService.ts";

type ConfirmationState = {
  bookingNumber: string;
  movieId: number;
  movieTitle: string;
  images: string[];
  ageRating?: number | null;
  date: string;
  time: string;
  auditoriumName: string;
  tickets: {
    ticketTypeName: string;
    price: number;
    seatsRow: number;
    seatsNumber: number;
  }[];
  from?: "mypage";
};

/* What GET /bookings/token/:token returns.
   Used when the page is opened from the link in the confirmation email (P17.2). */
type TokenBooking = {
  bookingNumber: string;
  movieId: number;
  movieTitle: string;
  images: string[];
  ageRating: number | null;
  date: string;
  time: string;
  auditoriumName: string;
  status: "confirmed" | "cancelled";
  canCancel: boolean; // false when cancelled or less than 2 hours before the showing
  tickets: {
    ticketType: string;
    price: number;
    seatsRow: number;
    seatsNumber: number;
  }[];
};

// The backend answers this when the token does not match any booking
const BOOKING_NOT_FOUND = "Bokningen finns ej";

// Converts the booking from the backend to the same shape as the navigate state,
// so both ways into the page are shown by the same layout
function toConfirmationState(booking: TokenBooking): ConfirmationState {
  return {
    bookingNumber: booking.bookingNumber,
    movieId: booking.movieId,
    movieTitle: booking.movieTitle,
    images: booking.images,
    ageRating: booking.ageRating,
    date: booking.date,
    time: booking.time,
    auditoriumName: booking.auditoriumName,
    tickets: booking.tickets.map((t) => ({
      ticketTypeName: t.ticketType,
      price: t.price,
      seatsRow: t.seatsRow,
      seatsNumber: t.seatsNumber,
    })),
  };
}

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();

  // The link in the confirmation email carries a cancel token: /bookingconfirmation?token=...
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // With a token the page fetches the booking itself. Without one nothing is fetched (null).
  const {
    data: tokenBooking,
    loading,
    error,
  } = useFetch<TokenBooking>(token ? bookingByTokenPath(token) : null);

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);

  if (token && loading) {
    return <LoadingSpinner text="Hämtar din bokning…" />;
  }

  if (token && error) {
    return (
      <ErrorMessage
        message={
          error === BOOKING_NOT_FOUND
            ? "Länken är ogiltig. Bokningen finns ej. Kontrollera att du öppnade hela länken från ditt bekräftelsemejl."
            : error
        }
      />
    );
  }

  // Without a token the booking comes from navigate state (straight after booking).
  // With a token it comes from the backend.
  const booking = token
    ? tokenBooking && toConfirmationState(tokenBooking)
    : (location.state as ConfirmationState | null);

  if (!booking?.bookingNumber) {
    return (
      <ErrorMessage message="Det finns ingen bokning att visa. Har du redan bokat hittar du bokningsnumret i ditt bekräftelsemejl." />
    );
  }

  const countByType = booking.tickets.reduce<Record<string, number>>(
    (acc, t) => {
      acc[t.ticketTypeName] = (acc[t.ticketTypeName] ?? 0) + 1;
      return acc;
    },
    {},
  );
  const totalPrice = booking.tickets.reduce((sum, t) => sum + t.price, 0);

  // Cancelling is only possible when the page was opened with a token
  const wasAlreadyCancelled = tokenBooking?.status === "cancelled";
  const canCancel = !!token && !!tokenBooking?.canCancel && !isCancelled;

  // Runs when the visitor answers "Ja, avboka" in the dialog
  async function confirmCancel() {
    if (!token) return;
    setIsCancelling(true);
    setCancelError(null);
    try {
      await bookingService.cancelBookingByToken(token);
      setIsCancelled(true);
      setShowCancelDialog(false);
    } catch (err) {
      setCancelError(
        err instanceof Error ? err.message : "Bokningen kunde inte avbokas.",
      );
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <>
      <div
        className="booking-page min-vh-100 text-light"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {booking.from === "mypage" && <BackButton to="/mypage" />}
        <h1 className="h4 fw-bold text-center p-3 mb-4 heading-gold">
          BOKNINGSBEKRÄFTELSE
        </h1>

        <Container className="pb-5">
          <Row className="justify-content-center mb-4">
            <Col xs={12} lg={8} xl={7}>
              <Card className="glass-card">
                <Card.Body className="p-3 p-md-4">
                  <Row className="align-items-center g-3 g-md-4">
                    <Col xs={5} md={4} className="text-center">
                      <MovieCard
                        movieId={booking.movieId}
                        title={booking.movieTitle}
                        images={booking.images}
                        ageRating={booking.ageRating}
                        showDetails={false}
                        datum={booking.date}
                      />
                    </Col>
                    <Col xs={7} md={8}>
                      <div className="film-krediter mt-1">
                        <h3 className="h1 fw-bold mb-3">
                          {booking.movieTitle}
                        </h3>
                        <div className="mb-1">
                          <strong className="text-white">Datum: </strong>{" "}
                          {booking.date}
                        </div>
                        <div className="mb-1">
                          <strong className="text-white">Tid: </strong>{" "}
                          {booking.time}
                        </div>
                        <div className="mb-1">
                          <strong className="text-white">Salong: </strong>{" "}
                          {booking.auditoriumName}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col xs={12} lg={8} xl={7}>
              <Card className="glass-card">
                <Card.Body className="p-3 p-md-4">
                  <h3 className="h4 fw-bold heading-gold mb-2 text-center">
                    Bokningsnummer: {booking.bookingNumber}
                  </h3>
                  <p className="mb-4 text-center">
                    <em>
                      Ange ditt bokningsnummer i kassan vid betalning av dina
                      biobiljetter
                    </em>
                  </p>
                  <div className="mb-3">
                    <p className="mb-1 fw-bold">
                      Platser ({booking.tickets.length}):
                    </p>
                    <ul className="list-unstyled small mb-0">
                      {booking.tickets.map((t) => (
                        <li key={`${t.seatsRow}-${t.seatsNumber}`}>
                          Rad {t.seatsRow}, Stol {t.seatsNumber}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {Object.entries(countByType).map(([name, count]) => (
                    <p key={name} className="mb-2">
                      <strong>{name}:</strong> {count} st
                    </p>
                  ))}
                  <hr className="border-secondary" />
                  <h4 className="h5 mb-4">
                    <strong>Totalpris:</strong> {totalPrice} kr
                  </h4>

                  <p className="mb-1">
                    <strong>Avbokning:</strong> Du kan avboka fram till 2 timmar
                    före visningen.
                  </p>
                  <p className="mb-2">
                    Har du bokat utan konto avbokar du via länken i ditt
                    bekräftelsemejl. Är du medlem avbokar du på Mina sidor.
                  </p>
                  {!token && (
                    <p className="mb-4">
                      <em>Vi har skickat en bekräftelse till din e-post.</em>
                    </p>
                  )}

                  {/* Messages shown only when the page was opened from the email link */}
                  {token && isCancelled && (
                    <Alert variant="success" className="mt-3 mb-0">
                      Din bokning är avbokad. Platserna är nu lediga för andra.
                    </Alert>
                  )}
                  {token && !isCancelled && wasAlreadyCancelled && (
                    <Alert variant="info" className="mt-3 mb-0">
                      Den här bokningen är redan avbokad.
                    </Alert>
                  )}
                  {token && !isCancelled && !wasAlreadyCancelled && !canCancel && (
                    <Alert variant="warning" className="mt-3 mb-0">
                      Det är för sent att avboka. Avbokning går bara fram till 2
                      timmar före visningen.
                    </Alert>
                  )}
                  <div className="d-flex justify-content-between mt-4">
                    {booking.from === "mypage" && (
                      <button
                        type="button"
                        className="btn btn-outline-light rounded-pill py-2 px-4 fw-bold m-2"
                        onClick={() => navigate("/mypage")}
                      >
                        Tillbaka till Mina sidor
                      </button>
                    )}

                    {canCancel && (
                      <button
                        type="button"
                        className="button-cancel btn-outline-light rounded-pill py-2 px-4 fw-bold m-2"
                        onClick={() => {
                          setCancelError(null);
                          setShowCancelDialog(true);
                        }}
                      >
                        Avboka bokning
                      </button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>

        {/* Asks before cancelling, so nothing is cancelled by mistake */}
        <Modal
          show={showCancelDialog}
          onHide={() => !isCancelling && setShowCancelDialog(false)}
          centered
        >
          <Modal.Header closeButton={!isCancelling}>
            <Modal.Title className="text-dark">Är du säker?</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-dark">
            <p className="mb-0">
              Din bokning till {booking.movieTitle} avbokas och platserna
              släpps till andra besökare. Det går inte att ångra.
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
              className="btn btn-outline-secondary rounded-pill px-4"
              onClick={() => setShowCancelDialog(false)}
              disabled={isCancelling}
            >
              Nej, behåll
            </button>
            <button
              type="button"
              className="btn btn-danger rounded-pill px-4"
              onClick={confirmCancel}
              disabled={isCancelling}
            >
              {isCancelling ? "Avbokar…" : "Ja, avboka"}
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}

BookingConfirmation.route = {
  path: "/bookingconfirmation",
  order: 14,
  label: "Bokningsbekräftelse",
};
