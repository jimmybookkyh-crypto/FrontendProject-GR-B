import { Row, Container, Col, Card } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router";
import backgroundImage from "../assets/img/biodukbg.webp";
import "../styles/buttons.css";
import ErrorMessage from "../components/ErrorMessage";
import MovieCard from "../components/MovieCard";
import BackButton from "../components/BackButton";

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

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();

  const booking = location.state as ConfirmationState | null;

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
                    Är du inloggad avbokar du under Mina sidor.
                  </p>
                  <p className="mb-4">
                    <em>Vi har skickat en bekräftelse till din e-post.</em>
                  </p>
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

                    {/* <button
                      type="button"
                      className="button-cancel btn-outline-light rounded-pill py-2 px-4 fw-bold m-2"
                    >
                      Avboka bokning
                    </button> */}
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
  path: "/bookingconfirmation",
  order: 14,
  label: "Bokningsbekräftelse",
};
