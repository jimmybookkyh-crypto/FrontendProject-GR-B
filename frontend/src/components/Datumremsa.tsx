import { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Collapse from "react-bootstrap/Collapse";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { kortDatum, plusDagar } from "../utils/datum";

/* Datumremsan: Idag, Imorgon, fem dagar till och en Kalender-knapp.
   Sidan som använder den äger valt datum (valtDatum) och får veta
   när det ändras via onByt.
   Stilen (.datumremsa, .filter-knapp) ligger i styles/Start.css, som laddas av Start.tsx. */

type DatumremsaProps = {
  valtDatum: string; // t.ex. "2026-10-22"
  onByt: (datum: string) => void;
};

/* Texten på dagsknappen: "Idag", "Imorgon" eller t.ex. "lör 24 okt" */
function knappText(datum: string, index: number): string {
  if (index === 0) return "Idag";
  if (index === 1) return "Imorgon";
  return kortDatum(datum);
}

export default function Datumremsa({ valtDatum, onByt }: DatumremsaProps) {
  const [kalenderOppen, setKalenderOppen] = useState(false);
  const idag = plusDagar(0);

  // 7 dagar: idag, imorgon och fem dagar till
  const dagar = [0, 1, 2, 3, 4, 5, 6].map((n) => plusDagar(n));

  // Kalenderknappen lyser när kalendern är öppen, eller när man valt ett
  // datum i kalendern som inte finns bland dagsknapparna.
  const kalenderAktiv = kalenderOppen || !dagar.includes(valtDatum);

  function valjDag(datum: string) {
    onByt(datum);
    setKalenderOppen(false);
  }

  function handleKalenderChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nyttDatum = event.target.value;
    // Tomt värde = datumet är inte färdigskrivet än.
    // Före idag = inte tillåtet. min={idag} stänger bara av dagarna i
    // kalenderrutan, man kan ändå skriva ett gammalt datum med tangentbordet.
    // Därför kollar vi här också. (Text i formatet ÅÅÅÅ-MM-DD går att jämföra.)
    if (nyttDatum === "" || nyttDatum < idag) return;
    onByt(nyttDatum);
    // Kalendern lämnas öppen tills man trycker på Kalender-knappen igen
  }

  return (
    <div className="datumremsa">
      <h2 className="datumremsa-rubrik">Välj datum</h2>

      <Row xs={2} md={4} lg={8} className="g-2">
        {dagar.map((datum, index) => (
          <Col key={datum}>
            <Button
              className="w-100 filter-knapp"
              active={datum === valtDatum}
              onClick={() => valjDag(datum)}
            >
              {knappText(datum, index)}
            </Button>
          </Col>
        ))}

        <Col>
          <Button
            className="w-100 filter-knapp"
            active={kalenderAktiv}
            onClick={() => setKalenderOppen(!kalenderOppen)}
            aria-expanded={kalenderOppen}
            aria-controls="kalender-val"
          >
            Kalender
          </Button>
        </Col>
      </Row>

      <Collapse in={kalenderOppen}>
        <div id="kalender-val">
          <Row className="justify-content-center mt-3">
            <Col xs={12} md={4}>
              <Form.Label htmlFor="datumval">Välj datum</Form.Label>
              <Form.Control
                id="datumval"
                type="date"
                min={idag}
                onChange={handleKalenderChange}
              />
            </Col>
          </Row>
        </div>
      </Collapse>
    </div>
  );
}
