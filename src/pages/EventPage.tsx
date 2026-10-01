import { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import backgroundImage from "../assets/img/biodukbg.png";
import Spindel from "../assets/Spindel.jpg";
import Batman1 from "../assets/Batman1.jpg";
import Doomsday from "../assets/Doomsday.jpg";
import "../styles/Event.css";

type EventData = {
  id: string;
  titel: string;
  tagline: string;
  start: string; // ISO-datum, t.ex. "2026-10-26"
  slut: string;
  bild: string;
  bildAlt: string;
  bildPosition?: string; // CSS object-position, om bilden behöver beskäras
  text: string[];
  filmer: string[];
};

/* Mockdata. Senare kan detta hämtas från backend. */
const EVENT: EventData[] = [
  {
    id: "avengers-assemble",
    titel: "Avengers Assemble",
    tagline: "Samla hjältarna",
    start: "2026-12-07",
    slut: "2026-12-13",
    bild: Doomsday,
    bildAlt: "Marvels hjältar samlade inför Avengers: Doomsday",
    bildPosition: "center 40%",
    text: [
      "Inför Avengers: Doomsday, som har svensk biopremiär den 16 december, samlar vi hjältarna på stora duken. Åtta Marvel-filmer, från Iron Man till Endgame, så att du är redo när Doctor Doom gör entré.",
      "Perfekt för dig som vill se hela sagan igen, eller börja från början.",
    ],
    filmer: [
      "Iron Man (2008)",
      "Thor (2011)",
      "Captain America: The First Avenger (2011)",
      "The Avengers (2012)",
      "Guardians of the Galaxy (2014)",
      "Black Panther (2018)",
      "Avengers: Infinity War (2018)",
      "Avengers: Endgame (2019)",
    ],
  },
  {
    id: "spindelveckan",
    titel: "Spindelveckan",
    tagline: "Din vänliga hjälte i grannskapet",
    start: "2026-10-26",
    slut: "2026-10-30",
    bild: Spindel,
    bildAlt: "Spider-Man hänger i sitt nät",
    text: [
      "Höstlovet är perfekt för en spindelvecka. Vi visar tio Spider-Man-filmer på fem dagar, från Sam Raimis klassiker till de animerade Spider-Verse-filmerna. Peter Parker, Miles Morales och hela spindelfamiljen i samma vecka.",
      "Passar hela familjen. Åldersgränsen skiljer sig mellan filmerna, så kolla varje films sida innan ni bokar.",
    ],
    filmer: [
      "Spider-Man (2002)",
      "Spider-Man 2 (2004)",
      "Spider-Man 3 (2007)",
      "The Amazing Spider-Man (2012)",
      "The Amazing Spider-Man 2 (2014)",
      "Spider-Man: Homecoming (2017)",
      "Spider-Man: A New Universe (2018)",
      "Spider-Man: Far From Home (2019)",
      "Spider-Man: No Way Home (2021)",
      "Spider-Man: Across the Spider-Verse (2023)",
    ],
  },
  {
    id: "morkrets-riddare",
    titel: "Mörkrets riddare",
    tagline: "Gotham glömmer aldrig",
    start: "2026-11-02",
    slut: "2026-11-08",
    bild: Batman1,
    bildAlt: "Batman1",
    text: [
      "Veckan efter Halloween tar mörkret över duken. Vi visar åtta Batman-filmer, från Tim Burtons gotiska Gotham till Christopher Nolans trilogi och Matt Reeves senaste. Mellan de mörka filmerna finns Lego Batman: Filmen för de yngre.",
      "Flera av filmerna har högre åldersgräns, så kolla varje films sida innan ni bokar.",
    ],
    filmer: [
      "Batman (1989)",
      "Batman – Återkomsten (1992)",
      "Batman Forever (1995)",
      "Batman Begins (2005)",
      "The Dark Knight (2008)",
      "The Dark Knight Rises (2012)",
      "Lego Batman: Filmen (2017)",
      "The Batman (2022)",
    ],
  },
];

/* Svensk datumformatering: "26–30 oktober" eller "30 oktober–2 november" */
const dagOchManad = new Intl.DateTimeFormat("sv-SE", {
  day: "numeric",
  month: "long",
});

function formateraPeriod(start: string, slut: string) {
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${slut}T00:00:00`);
  const slutText = dagOchManad.format(e);
  if (s.getMonth() === e.getMonth()) {
    return `${s.getDate()}–${slutText}`;
  }
  return `${dagOchManad.format(s)}–${slutText}`;
}

function EventKort({ event }: { event: EventData }) {
  const [visaFilmer, setVisaFilmer] = useState(false);
  const rubrikId = `event-rubrik-${event.id}`;
  const filmerId = `event-filmer-${event.id}`;

  return (
    <article className="event-kort" aria-labelledby={rubrikId}>
      <Row className="g-0">
        <Col lg={5}>
          <div className="event-bild-ram">
            <img
              className="event-bild"
              src={event.bild}
              alt={event.bildAlt}
              style={
                event.bildPosition
                  ? { objectPosition: event.bildPosition }
                  : undefined
              }
            />
          </div>
        </Col>

        <Col lg={7}>
          <div className="event-innehall">
            <p className="event-period">
              {formateraPeriod(event.start, event.slut)}
            </p>
            <h2 id={rubrikId} className="event-titel">
              {event.titel}
            </h2>
            <p className="event-tagline">{event.tagline}</p>

            {event.text.map((stycke) => (
              <p key={stycke} className="event-text">
                {stycke}
              </p>
            ))}

            <Collapse in={visaFilmer}>
              <div id={filmerId}>
                <ul className="event-filmer">
                  {event.filmer.map((film) => (
                    <li key={film}>{film}</li>
                  ))}
                </ul>
              </div>
            </Collapse>

            <div className="event-knappar">
              <Button
                variant="normal"
                className="event-filmer-knapp"
                onClick={() => setVisaFilmer((v) => !v)}
                aria-expanded={visaFilmer}
                aria-controls={filmerId}
              >
                {visaFilmer
                  ? "Dölj filmer"
                  : `Visa alla ${event.filmer.length} filmer`}
              </Button>
              {/* Byt gärna ut "/" mot en egen route per event senare */}
              {/* <Button
                as={Link as any}
                to="/"
                variant="normal"
                className="boka-knapp event-boka-knapp"
              >
                Se visningar →
              </Button> */}
            </div>
          </div>
        </Col>
      </Row>
    </article>
  );
}

export default function EventPage() {
  const idag = new Date().toISOString().split("T")[0];

  // Kommande event, sorterade på startdatum
  const kommandeEvent = EVENT.filter((e) => e.slut >= idag).sort((a, b) =>
    a.start.localeCompare(b.start),
  );

  return (
    <div
      className="event-page min-vh-100 w-100"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container className="event-sida">
        <header className="event-sidhuvud">
          <h1>Kommande event</h1>
          <p>Hjälteveckor på Filmvisarna: flera filmer, en hjälte, en vecka.</p>
        </header>

        {kommandeEvent.length === 0 ? (
          <p className="event-tomt">
            Just nu finns inga kommande event. Titta in igen snart, eller se vad
            som visas idag på startsidan.
          </p>
        ) : (
          <ul className="event-lista">
            {kommandeEvent.map((event) => (
              <li key={event.id}>
                <EventKort event={event} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </div>
  );
}

EventPage.route = {
  path: "/event",
  order: 1,
  label: "Event",
};
