import { Row, Container, Col, Card } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router"
import "../Booking.css"

export default function BookingPage() {
  const rows = [
    ["A1", "A2", "A3", "A4", "A5"],
    ["B1", "B2", "B3", "B4", "B5"],
    ["C1", "C2", "C3", "C4", "C5"],
    ["D1", "D2", "D3", "D4", "D5"],
  ];
  const navigate = useNavigate();

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const [adultTickets, setAdultTickets] = useState(0);
  const [childTickets, setChildTickets] = useState(0);
  const [seniorTickets, setSeniorTickets] = useState(0);
  const adultPrice = 140;
  const childPrice = 80;
  const seniorPrice = 120;
  const totalPrice =
    adultTickets * adultPrice +
    childTickets * childPrice +
    seniorTickets * seniorPrice;
  const totaltTickets = adultTickets + childTickets + seniorTickets;

  const handleSeatClick = (seat: string) => {
    setSelectedSeats((current) =>
      current.includes(seat)
        ? current.filter((selected) => selected !== seat)
        : [...current, seat])
  }

  const handleCheckout = () => {
    navigate("/bookingconfirmation", {
      state: {
        seats: selectedSeats,
        adultTickets,
        childTickets,
        seniorTickets,
        totalPrice,
      },
    });
  }
  // hårdkodad del för mockup
  const occupiedSeats = ["C2", "C3"];  // bokar stolar för att visa i mockup

  return <>
    <button onClick={() => navigate("/moviedetails")} className="btn btn-secondary">
  ← Tillbaka
    </button>
    <h1>Boka biljetter</h1>
    <Container className="row justify-content-between">
      <Row className="mb-4">
      <Col>
        <Card>
          <Card.Body>
              <Row className="top-col-row">
                <Col md={6}>
                <img
                    src="src/assets/img/ph.png"
                  alt="Film"
                    className="test-40 img-fluid"
                  />
                  </Col>
                  <Col md={6} className="test-40 info-box">
                    <h2>Filmnamn</h2>
                    <p>Datum: 2026-10-01</p>
                    <p>Tid: 19:00</p>
                    <p>Salong: Salong 1</p>
                  </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          <Card className="seatchart-card">
            <Card.Body>
              <h3 className="text-center mb-4">
                Salong 1
              </h3>
              <div className="bg-dark text-white text-center py-3 mb-5 rounded">
                FILMDUK
              </div>
              <div>
                {rows.map((row) => (
                  <div
                    key={row[0]}
                    className="d-flex justify-content-center gap-2 mb-2"
                  >
                    {row.map((seat) => {
                      const isOccupied = occupiedSeats.includes(seat);
                      const isSelected = selectedSeats.includes(seat);
                      return (
                        <button
                          key={seat}
                          className={`seat ${
                            isOccupied
                              ? "seat-occupied"
                              : isSelected
                              ? "seat-selected"
                              : "seat-available"
                          }`}
                          disabled={isOccupied}
                          onClick={() => handleSeatClick(seat)}
                        >
                          {seat}
                        </button>
                      );
                    })}
                  </div>
                ))}
                </div>
                <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
                  <span>🟢 Ledig</span>
                  <span>🔴 Upptagen</span>
                  <span>🔵 Vald</span>
                </div>
            </Card.Body>
          </Card>

        </Col>
      </Row>
      <Row className="two-col-row">
        <Col md={6} className="mb-3">
          <Card className="ticket-card">
            <Card.Body>
              <h3>Biljetter</h3>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Vuxen : 140 kr</span>
                <div className="btn-group">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      setAdultTickets(Math.max(0, adultTickets - 1))
                    }
                  >
                    −
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      setAdultTickets(adultTickets + 1)
                    }
                  >
                    +
                  </button>
                  <p>{adultTickets}</p>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Barn : 80 kr</span>
                <div className="btn-group">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      setChildTickets(Math.max(0, childTickets - 1))
                    }
                  >
                    −
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      setChildTickets(childTickets + 1)
                    }
                  >
                    +
                  </button>
                  <p>{childTickets}</p>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Pensionär : 120 kr</span>
                <div className="btn-group">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      setSeniorTickets(Math.max(0, seniorTickets - 1))
                    }
                  >
                    −
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      setSeniorTickets(seniorTickets + 1)
                    }
                  >
                    +
                  </button>
                  <p>{seniorTickets}</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      
        <Col md={6} className="mb-3">
          <Card className="summary-card">
            <Card.Body>
              <h3>Sammanfattning</h3>
              <p>Valda platser:{" "}
                {selectedSeats.length > 0
                  ? selectedSeats.join(", ")
                  : "Inga valda"}
              </p>
              <p>Antal biljetter: {totaltTickets}</p>
              <hr />
              <h4>Total: {totalPrice} kr</h4>
              <button
                className="btn btn-primary w-100"
                disabled={
                  selectedSeats.length === 0 || totaltTickets !== selectedSeats.length
                }
                onClick={handleCheckout}
              >
                Gå vidare till betalning
              </button>
            </Card.Body>
          </Card>
        </Col>

      </Row>
    </Container>
  </>;
}
BookingPage.route = {
  path: "/booking",
  order: 3,
  label: "Bokningssida",
};