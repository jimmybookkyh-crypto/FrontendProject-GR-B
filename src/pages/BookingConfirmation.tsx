import { Row, Container, Col, Card,  } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router";
import backgroundImage from "../assets/img/biodukbg.png";
import "../styles/buttons.css";

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const { state } = useLocation();


  return <> 
    <div className="booking-page min-vh-100 text-light"
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
                    <img
                      src="src/assets/Thor.jpg"
                      alt="Film Poster"
                      className="img-fluid rounded"
                    />
                  </Col>
                  <Col xs={7} md={8}>
                    <h2 className="h5 fw-bold mb-3">Thor: love and thunder</h2>
                    <p className="mb-1">Datum: 2026-10-01</p>
                    <p className="mb-1">Tid: 19:00</p>
                    <p className="mb-0">Salong: Stora Salongen </p>
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
                  <strong>Bokningsnummer:</strong> FV-2026-AB12
                </h4>
                <p className="mb-4 text-center">
                  <em>Ange ditt bokningsnummer i kassan vid betalning av dina biobiljetter</em>
                </p>
    

                <p className="mb-2">
                  <strong>Platser:</strong>{" "}
                  {state.seats.join(", ")}
                </p>

                {state.adultTickets > 0 && (
                  <p className="mb-2">
                    <strong>Vuxen:</strong> {state.adultTickets} st
                  </p>
                )}

                {state.childTickets > 0 && (
                  <p className="mb-2">
                    <strong>Barn:</strong> {state.childTickets} st
                  </p>
                )}

                {state.seniorTickets > 0 && (
                  <p className="mb-2">
                    <strong>Pensionär:</strong> {state.seniorTickets} st
                  </p>
                )}


                <hr className="border-secondary" />

                <h4 className="h5 mb-4">
                  <strong>Totalpris:</strong> {state.totalPrice} kr
                </h4>

                <p className="mb-4">
                  <em>Vi har skickat en bekräftelse på din bokning till din e-postadress.</em>
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
;
}

BookingConfirmation.route = {
  path: "/bookingconfirmation",
  order: 1,
  label: "Bokningsbekräftelse",
};
