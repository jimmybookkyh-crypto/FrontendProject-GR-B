import { Row, Container, Col, Card, InputGroup, Form } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router";
import "../Booking.css";

export default function BookingPage() {
  const auditoriums = [
    {
      name: "Stora Salongen",
      seatsPerRow: [8, 9, 10, 10, 10, 10, 12, 12],
    },
    {
      name: "Lilla Salongen",
      seatsPerRow: [6, 8, 9, 10, 10, 12],
    },
  ];

  const currentSalon = auditoriums[0];

  const buildRows = (seatsPerRow: number[]) => {
    let seatNumber = 1;
    return seatsPerRow.map((count) =>
      Array.from({ length: count }, () => {
        const id = String(seatNumber).padStart(2, "0");
        seatNumber += 1;
        return id;
      })
    );
  };

  const rows = buildRows(currentSalon.seatsPerRow);
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
        : [...current, seat]
    );
  };

  const handleInputChange = (
    value: string,
    setter: (val: number) => void,
    currentTicketTypeVal: number
  ) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 0) {
      setter(0);
      return;
    }

    const otherTicketsCount = totaltTickets - currentTicketTypeVal;
    const maxAllowed = selectedSeats.length - otherTicketsCount;

    if (parsed > maxAllowed) {
      setter(Math.max(0, maxAllowed));
    } else {
      setter(parsed);
    }
  };

  const adjustTickets = (
    setter: (val: number) => void,
    current: number,
    delta: number
  ) => {
    const next = current + delta;
    if (next < 0) {
      setter(0);
      return;
    }
    const other = totaltTickets - current;
    const maxAllowed = selectedSeats.length - other;
    setter(Math.min(next, Math.max(0, maxAllowed)));
  };

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
  };

  const occupiedSeats = ["12", "35", "36"];

  return (
    <div className="booking-page min-vh-100 text-light">
      <button
        type="button"
        onClick={() => navigate("/moviedetails")}
        className="btn btn-light btn-sm m-3"
      >
        ← Tillbaka
      </button>

      <h1 className="h4 fw-bold text-center mb-4 heading-gold">
        Boka biljetter
      </h1>

      <Container className="pb-5">
        <Row className="justify-content-center mb-4">
          <Col xs={12} lg={8} xl={7}>
            <Card>
              <Card.Body className="p-3 p-md-4">
                <Row className="align-items-center g-3 g-md-4">
                  <Col xs={5} md={4} className="text-center">
                    <img
                      src="src/assets/img/ph.png"
                      alt="Film"
                      className="img-fluid rounded"
                    />
                  </Col>
                  <Col xs={7} md={8}>
                    <h2 className="h5 fw-bold mb-3">Filmnamn</h2>
                    <p className="mb-1">Datum: 2026-10-01</p>
                    <p className="mb-1">Tid: 19:00</p>
                    <p className="mb-0">Salong: Salong 1</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4 justify-content-center align-items-start">
          <Col xs={12} lg={7}>
            <Card className="overflow-x-auto">
              <Card.Body className="p-3 p-md-4">
                <h3 className="h5 fw-bold heading-gold mb-3">Salong 1</h3>

                <div className="d-flex justify-content-center w-100 mb-3">
                  <img
                    src="src/assets/img/screenIco.png"
                    alt="Bioduk"
                    className="screen-icon img-fluid"
                  />
                </div>

                <div className="d-flex flex-column align-items-center">
                  {rows.map((row) => (
                    <div
                      key={row[0]}
                      className="d-flex flex-nowrap justify-content-center align-items-center mb-1"
                    >
                      {row.map((seat) => {
                        const isOccupied = occupiedSeats.includes(seat);
                        const isSelected = selectedSeats.includes(seat);
                        return (
                          <button
                            key={seat}
                            type="button"
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

                <div className="d-flex justify-content-center gap-3 mt-3 flex-wrap small">
                  <span>⚪ Ledig</span>
                  <span>⚫ Upptagen</span>
                  <span>🟡 Vald</span>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} lg={5}>
            <Card>
              <Card.Body className="p-3 p-md-4">
                <h3 className="h5 fw-bold text-center heading-gold mb-4">
                  Biljetter
                </h3>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span>Vuxen : 140 kr</span>
                  <InputGroup style={{ maxWidth: 140 }}>
                    <button
                      className="btn btn-outline-light"
                      type="button"
                      onClick={() =>
                        adjustTickets(setAdultTickets, adultTickets, -1)
                      }
                    >
                      −
                    </button>
                    <Form.Control
                      type="number"
                      className="text-center"
                      value={adultTickets}
                      onChange={(e) =>
                        handleInputChange(
                          e.target.value,
                          setAdultTickets,
                          adultTickets
                        )
                      }
                      min={0}
                    />
                    <button
                      className="btn btn-outline-light"
                      type="button"
                      onClick={() =>
                        adjustTickets(setAdultTickets, adultTickets, 1)
                      }
                    >
                      +
                    </button>
                  </InputGroup>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span>Barn : 80 kr</span>
                  <InputGroup style={{ maxWidth: 140 }}>
                    <button
                      className="btn btn-outline-light"
                      type="button"
                      onClick={() =>
                        adjustTickets(setChildTickets, childTickets, -1)
                      }
                    >
                      −
                    </button>
                    <Form.Control
                      type="number"
                      className="text-center"
                      value={childTickets}
                      onChange={(e) =>
                        handleInputChange(
                          e.target.value,
                          setChildTickets,
                          childTickets
                        )
                      }
                      min={0}
                    />
                    <button
                      className="btn btn-outline-light"
                      type="button"
                      onClick={() =>
                        adjustTickets(setChildTickets, childTickets, 1)
                      }
                    >
                      +
                    </button>
                  </InputGroup>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span>Pensionär : 120 kr</span>
                  <InputGroup style={{ maxWidth: 140 }}>
                    <button
                      className="btn btn-outline-light"
                      type="button"
                      onClick={() =>
                        adjustTickets(setSeniorTickets, seniorTickets, -1)
                      }
                    >
                      −
                    </button>
                    <Form.Control
                      type="number"
                      className="text-center"
                      value={seniorTickets}
                      onChange={(e) =>
                        handleInputChange(
                          e.target.value,
                          setSeniorTickets,
                          seniorTickets
                        )
                      }
                      min={0}
                    />
                    <button
                      className="btn btn-outline-light"
                      type="button"
                      onClick={() =>
                        adjustTickets(setSeniorTickets, seniorTickets, 1)
                      }
                    >
                      +
                    </button>
                  </InputGroup>
                </div>

                <p className="mb-1">
                  Valda platser:{" "}
                  {selectedSeats.length > 0
                    ? selectedSeats.join(", ")
                    : "Inga valda"}
                </p>
                <p className="mb-3">Antal biljetter: {totaltTickets}</p>
                <hr className="border-secondary" />
                <h4 className="h5 mb-3">Total: {totalPrice} kr</h4>
                <button
                  type="button"
                  className="btn btn-primary w-100"
                  disabled={
                    selectedSeats.length === 0 ||
                    totaltTickets !== selectedSeats.length
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
    </div>
  );
} 

BookingPage.route = {
  path: "/booking",
  order: 3,
  label: "Bokningssida",
};