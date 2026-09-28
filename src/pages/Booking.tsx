import { Row, Container, Col, Card } from "react-bootstrap";
import { useState } from "react";
import "../Booking.css"

export default function BookingPage() {
  const rows = [
    ["A1", "A2", "A3", "A4", "A5"],
    ["B1", "B2", "B3", "B4", "B5"],
    ["C1", "C2", "C3", "C4", "C5"],
    ["D1", "D2", "D3", "D4", "D5"],
  ];

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const handleSeatClick = (seat: string) => {
    setSelectedSeats((current) =>
      current.includes(seat)
        ? current.filter((selected) => selected !== seat)
        : [...current, seat])
  }
  // hårdkodad del för mockup
  const occupiedSeats = ["C2", "C3"];  // bokar stolar för att visa i mockup
  
  return <>
    <Container className="py-4">
      <Row className="mb-4">
      <Col>
        <Card>
          <Card.Body>
            <Row>
              <Col md={4}>
                <img
                  src=""
                  alt="Film"
                  className="img-fluid"
                  />
                  </Col>
                  <Col md={8}>
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
          <Card>
            <Card.Body>
              <h3 className="text-center mb-4">
                Salong 1
              </h3>
              {/* FILMDUK */}
              <div className="bg-dark text-white text-center py-3 mb-5 rounded">
                FILMDUK
              </div>
              {/* STOLAR */}
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
                {/* LEGEND */}
                <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
                  <span>🟢 Ledig</span>
                  <span>🔴 Upptagen</span>
                  <span>🔵 Vald</span>
                </div>
            </Card.Body>
          </Card>

        </Col>
      </Row>
      <Row>
        <Col md={6} className="mb-3">
          <Card>
            <Card.Body>
              <h3>Biljetter</h3>
              <p>Vuxen – 140 kr</p>
              <p>Barn – 80 kr</p>
              <p>Pensionär – 120 kr</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-3">
          <Card>
            <Card.Body>
              <h3>Sammanfattning</h3>
              <p>Valda platser: A3, A4</p>
              <p>Antal biljetter: 2</p>
              <hr />
              <h4>Total: 280 kr</h4>
              <button className="btn btn-primary w-100">
                Boka
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