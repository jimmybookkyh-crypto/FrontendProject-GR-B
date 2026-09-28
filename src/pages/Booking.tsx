import { Row, Container, Col, Card } from "react-bootstrap";
import "../Booking.css"


export default function BookingPage() {
  const rows = [
    ["A1", "A2", "A3", "A4", "A5"],
    ["B1", "B2", "B3", "B4", "B5"],
    ["C1", "C2", "C3", "C4", "C5"],
    ["D1", "D2", "D3", "D4", "D5"],
  ];

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
                    {row.map((seat) => (
                      <button
                        key={seat}
                        className="seat seat-available"
                      >
                        {seat}
                      </button>
                    ))}
                  </div> 
                ))}
                </div>

                {/* LEGEND */}
                <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
                  <span>🟢 Ledig</span>
                  <span>🔴 Upptagen</span>
                  <span>🔵 Vald</span>
                  <span>🟡 Rekommenderad</span>
                </div>

            </Card.Body>
          </Card>

        </Col>
      </Row>
      

    
    {/* <section className="Auditorium">
      <article className="Screen">

        </article>
      <article className="Seat-map">
      
        {rows.map((row) => (
          <div key = { row[0]}
            className="d-flex justify-content-center gap-2 mb-2" >
        {
            row.map((seat) => (
              <button key={seat} className="seat seat-avalible" >
                {seat}
              </button>
            
            ))}
          </div>
        ))}
      </article>
    </section> */}

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


/*Designa salongskarta: grafisk skiss av stolar och rader med duk/scen och tydliga lägen (ledig, upptagen, vald, rekommenderad) samt teckenförklaring

Anpassa salongskartan för små skärmar (tillräckligt stora tryckytor, ev. zoom/scroll)

Se filmstadens lösning på responsiv design för mobiler (dragbar touchscreen selector)

Designa hur bästa kvarvarande stolar markeras från start och hur besökaren ändrar valet (klicka på andra stolar)
Initialt ska de bästa kvarvarande stolarna markeras, men besökaren ska kunna ändra valet.

Designa biljettväljare för Vuxen (140 kr), Pensionär (120 kr) och Barn (80 kr) samt löpande visning av totalpris

Designa hur live-uppdatering syns: stol byter läge och hur en redan vald stol som blir upptagen hanteras*/