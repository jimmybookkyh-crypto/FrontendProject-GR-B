import { Row, Container, Col, Card } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router"
import "../Booking.css"

export default function BookingPage() {
const rows = [
    ["01", "02", "03", "04", "05", "06", "07", "08"], 
    ["09", "10", "11", "12", "13", "14", "15", "16", "17"],
    ["18", "19", "20", "21", "22", "23", "24", "25", "26", "27"],
    ["28", "29", "30", "31", "32", "33", "34", "35", "36", "37"],
    ["38", "39", "40", "41", "42", "43", "44", "45", "46", "47"],
    ["48", "49", "50", "51", "52", "53", "54", "55", "56", "57"],
    ["58", "59", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69"], 
    ["70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "80", "81"],
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
  const occupiedSeats = ["12", "35", "36"];  // bokar stolar för att visa i mockup

  return <>
    <button onClick={() => navigate("/moviedetails")} className="btn btn-secondary">
  ← Tillbaka
    </button>
    <h1>Boka biljetter</h1>
    <Container className="justify-content-between">
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
      <Row className="booking-main-row g-4">
        <Col xs={12} lg={7} className="booking-duk-col">
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
        <Col xs={12} lg={5} className="booking-val-col">
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