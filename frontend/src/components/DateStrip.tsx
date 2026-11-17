import { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Collapse from "react-bootstrap/Collapse";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { formatShortDate, addDays } from "../utils/date";

/* Datumremsan: Idag, Imorgon, fem dagar till och en Kalender-knapp.
   Sidan som använder den äger valt datum (selectedDate) och får veta
   när det ändras via onSelectDate.
   Stilen (.datumremsa, .filter-knapp) ligger i styles/Start.css, som laddas av Start.tsx. */

type DateStripProps = {
  selectedDate: string; // t.ex. "2026-10-22"
  dateList?: string[];
  onSelectDate: (date: string) => void;
};

/* Texten på dagsknappen: "Idag", "Imorgon" eller t.ex. "lör 24 okt" */
function buttonText(date: string): string {
  if (date === addDays(0)) return "Idag";
  if (date === addDays(1)) return "Imorgon";
  return formatShortDate(date);
}

export default function DateStrip({
  selectedDate,
  onSelectDate,
  dateList,
}: DateStripProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const today = addDays(0);

  // 7 dagar: idag, imorgon och fem dagar till eller showings datum som finns
  const days = dateList ?? [0, 1, 2, 3, 4, 5, 6].map((n) => addDays(n));
  // Kalenderknappen lyser när kalendern är öppen, eller när man valt ett
  // datum i kalendern som inte finns bland dagsknapparna.
  const calendarActive = calendarOpen || !days.includes(selectedDate);

  function selectDay(date: string) {
    onSelectDate(date);
    setCalendarOpen(false);
  }

  function handleCalendarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newDate = event.target.value;
    // Tomt värde = datumet är inte färdigskrivet än.
    // Före idag = inte tillåtet. min={today} stänger bara av dagarna i
    // kalenderrutan, man kan ändå skriva ett gammalt datum med tangentbordet.
    // Därför kollar vi här också. (Text i formatet ÅÅÅÅ-MM-DD går att jämföra.)
    if (newDate === "" || newDate < today) return;
    onSelectDate(newDate);
    // Kalendern lämnas öppen tills man trycker på Kalender-knappen igen
  }

  return (
    <div className="datumremsa">
      <h2 className="datumremsa-rubrik">Välj datum</h2>

      <Row xs={2} md={4} lg={8} className="g-2">
        {days.map((date) => (
          <Col key={date}>
            <Button
              type="button"
              className="w-100 filter-knapp"
              active={date === selectedDate}
              onClick={() => selectDay(date)}
            >
              {buttonText(date)}
            </Button>
          </Col>
        ))}

        <Col>
          <Button
            className="w-100 filter-knapp"
            active={calendarActive}
            onClick={() => setCalendarOpen(!calendarOpen)}
            aria-expanded={calendarOpen}
            aria-controls="kalender-val"
          >
            Kalender
          </Button>
        </Col>
      </Row>

      <Collapse in={calendarOpen}>
        <div id="kalender-val">
          <Row className="justify-content-center mt-3">
            <Col xs={12} md={4}>
              <Form.Label htmlFor="datumval">Välj datum</Form.Label>
              <Form.Control
                id="datumval"
                type="date"
                min={today}
                onChange={handleCalendarChange}
              />
            </Col>
          </Row>
        </div>
      </Collapse>
    </div>
  );
}
