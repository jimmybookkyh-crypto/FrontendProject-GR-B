import { Row, Container, Col, Card } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import backgroundImage from "../assets/img/biodukbg.png";
import "../styles/buttons.css";
import useFetch from "../hooks/useFetch";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import MovieCard from "../components/MovieCard";

type Booking = {
  bookingNumber: string;
  email: string;
  date: string;
  time: string;
  movieId: number;
  movieTitle: string;
  images: string[] | null;
  ageRating: number | null;
  auditoriumName: string;
  tickets: {
    ticketTypeName: string;
    price: number;
    seatsRow: number;
    seatsNumber: number;
  }[];
};

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    data: booking,
    loading,
    error,
  } = useFetch<Booking>(id ? `/bookings/confirmation/${id}` : null);

  if (loading) return <LoadingSpinner text="Hämtar bokning…" />;
  if (error || !booking)
    return <ErrorMessage message={error ?? "Bokningen finns inte"} />;

  const seatLabels = booking.tickets
    .map((t) => `Rad ${t.seatsRow} plats ${t.seatsNumber}`)
    .join(", ");
  const countByType = booking.tickets.reduce<Record<string, number>>(
    (acc, t) => {
      acc[t.ticketTypeName] = (acc[t.ticketTypeName] ?? 0) + 1;
      return acc;
    },
    {},
  );
  const totalPrice = booking.tickets.reduce((sum, t) => sum + t.price, 0);

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
                        images={booking.images ?? ""}
                        ageRating={booking.ageRating ?? undefined}
                        showDetails={false}
                        datum={booking.date}
                      />
                    </Col>
                    <Col xs={7} md={8}>
                      <h2 className="h5 fw-bold mb-3">{booking.movieTitle}</h2>
                      <p className="mb-1">Datum: {booking.date}</p>
                      <p className="mb-1">Tid: {booking.time}</p>
                      <p className="mb-0">Salong: {booking.auditoriumName}</p>
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
                  <h3 className="h5 fw-bold heading-gold mb-4 text-center">
                    SAMMANFATTNING
                  </h3>

                  <h4 className="mb-2 text-center">
                    <strong>Bokningsnummer:</strong> {booking.bookingNumber}
                  </h4>
                  <p className="mb-4 text-center">
                    <em>
                      Ange ditt bokningsnummer i kassan vid betalning av dina
                      biobiljetter
                    </em>
                  </p>

                  <p className="mb-2">
                    <strong>Platser:</strong> {seatLabels}
                  </p>

                  {Object.entries(countByType).map(([name, count]) => (
                    <p key={name} className="mb-2">
                      <strong>{name}:</strong> {count} st
                    </p>
                  ))}

                  <hr className="border-secondary" />

                  <h4 className="h5 mb-4">
                    <strong>Totalpris:</strong> {totalPrice} kr
                  </h4>

                  <p className="mb-4">
                    <em>
                      Vi har skickat en bekräftelse på din bokning till din
                      e-postadress.
                    </em>
                  </p>

                  <div className="d-flex justify-content-between mt-4">
                    <button
                      type="button"
                      className="cta-btn rounded-pill py-2 px-4 fw-bold m-2"
                      onClick={() => navigate("/")}
                    >
                      Till startsidan
                    </button>

                    <button
                      type="button"
                      className="button-cancel btn-outline-light rounded-pill py-2 px-4 fw-bold m-2"
                    >
                      Avboka bokning
                    </button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}

BookingConfirmation.route = {
  path: "/booking/confirmation",
  order: 14,
  label: "Bokningsbekräftelse",
};
