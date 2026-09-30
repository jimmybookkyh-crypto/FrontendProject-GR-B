import { useState } from "react";
import "../styles/Start.css";
import { Link } from "react-router";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Carousel from "react-bootstrap/Carousel";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Collapse from "react-bootstrap/Collapse";
import TMNT from "../assets/TMNT.jpg";
import Spiderman from "../assets/Spiderman.jpeg";
import Superman from "../assets/Superman.jpg";
import Mulanfilm from "../assets/Mulanfilm.jpeg";
import Spidermanfilm from "../assets/Spiderman.jpg";
import Ninja from "../assets/Ninja.jpg";
import charlie from "../assets/charlie.jpg";
import Thor from "../assets/Thor.jpg";
import Batman from "../assets/Batman.jpg";
import fyra from "../assets/fyra.jpg";
import superman2 from "../assets/superman2.jpg";

type FilmMock = {
  id: string;
  titel: string;
  bild: string;
};

const filmerIdag: FilmMock[] = [
  { id: "thor", titel: "Thor", bild: Thor },
  { id: "mulan", titel: "Mulan", bild: Mulanfilm },
  { id: "tmnt", titel: "TMNT", bild: TMNT },
  { id: "charlie", titel: "Charlie", bild: charlie },
  { id: "batman", titel: "Batman", bild: Batman },
  { id: "spiderman", titel: "Spiderman", bild: Spidermanfilm },
];

const filmerImorgon: FilmMock[] = [
  { id: "fyra", titel: "Fyra", bild: fyra },
  { id: "superman2", titel: "Superman", bild: superman2 },
  { id: "tmnt", titel: "TMNT", bild: TMNT },
  { id: "charlie", titel: "Charlie", bild: charlie },
  { id: "batman", titel: "Batman", bild: Batman },
  { id: "mulan", titel: "Mulan", bild: Mulanfilm },
];

export default function Start() {
  const [aktivtFilter, setAktivtFilter] = useState<
    "idag" | "imorgon" | "kalender"
  >("idag");
  const [datum, setDatum] = useState("");
  const idag = new Date().toISOString().split("T")[0];

  const visadeFilmer =
    aktivtFilter === "idag"
      ? filmerIdag
      : aktivtFilter === "imorgon"
        ? filmerImorgon
        : datum
          ? filmerImorgon // Kalender + datum valt: visa "imorgon"-filmerna (mockup)
          : filmerIdag; // Kalender men inget datum valt än

  function valjFilter(filter: "idag" | "imorgon" | "kalender") {
    setAktivtFilter(filter);
  }

  function handleDatumChange(event: React.ChangeEvent<HTMLInputElement>) {
    setDatum(event.target.value);
  }

  return (
    <>
      <div className="sida-innehall">
        <HeroCarousel />
        <FilterKnappar
          aktivtFilter={aktivtFilter}
          datum={datum}
          idag={idag}
          onValjFilter={valjFilter}
          onDatumChange={handleDatumChange}
        />
        <Container className="filmkatalog">
          <FilmerStart filmer={visadeFilmer} />
        </Container>
      </div>
      <Footer />
    </>
  );
}
/* Hero-section med slides */

function HeroCarousel() {
  return (
    <Carousel className="hero-carousel">
      <Carousel.Item>
        <img
          className="d-block w-100 hero-image"
          src={Ninja}
          alt="Första bilden"
        />
        <Carousel.Caption>
          <h3>Teen Age Mutant Ninja Turtles</h3>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100 hero-image"
          src={Spiderman}
          alt="Andra bilden"
        />
        <Carousel.Caption>
          <h3>Spiderman</h3>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100 hero-image"
          src={Superman}
          alt="Tredje bilden"
        />
        <Carousel.Caption>
          <h3>Superman</h3>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
}

/* 3 filterknappar – staplas på mobil, tre i rad på läsplatta/desktop */

type FilterKnapparProps = {
  aktivtFilter: "idag" | "imorgon" | "kalender";
  datum: string;
  idag: string;
  onValjFilter: (filter: "idag" | "imorgon" | "kalender") => void;
  onDatumChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

function FilterKnappar({
  aktivtFilter,
  datum,
  idag,
  onValjFilter,
  onDatumChange,
}: FilterKnapparProps) {
  return (
    <Container className="filter-sektion">
      <Row className="g-2 g-md-5">
        <Col xs={12} md={4}>
          <Button
            variant="danger"
            size="lg"
            className="w-100 filter-knapp"
            active={aktivtFilter === "idag"}
            onClick={() => onValjFilter("idag")}
          >
            Idag
          </Button>
        </Col>

        <Col xs={12} md={4}>
          <Button
            variant="danger"
            size="lg"
            className="w-100 filter-knapp"
            active={aktivtFilter === "imorgon"}
            onClick={() => onValjFilter("imorgon")}
          >
            Imorgon
          </Button>
        </Col>

        <Col xs={12} md={4}>
          <Button
            variant="danger"
            size="lg"
            className="w-100 filter-knapp"
            active={aktivtFilter === "kalender"}
            onClick={() => onValjFilter("kalender")}
            aria-expanded={aktivtFilter === "kalender"}
            aria-controls="kalender-val"
          >
            Kalender
          </Button>
        </Col>
      </Row>
      <Collapse in={aktivtFilter === "kalender"}>
        <div id="kalender-val">
          <Row className="justify-content-center mt-3">
            <Col xs={12} md={4}>
              <Form.Label htmlFor="datumval">Välj datum</Form.Label>
              <Form.Control
                id="datumval"
                type="date"
                min={idag}
                value={datum}
                onChange={onDatumChange}
              />
            </Col>
          </Row>
        </div>
      </Collapse>
    </Container>
  );
}
/*6 st filmer cards med knapp till biljetter.*/

function FilmerStart({ filmer }: { filmer: FilmMock[] }) {
  return (
    <Row xs={2} md={3} className="g-3 g-md-5">
      {filmer.map((film) => (
        <Col key={film.id}>
          <Card className="filmkort">
            <Card.Img variant="top" src={film.bild} alt={film.titel} />
            <Card.Body className="filmkort-body">
              <Button
                as={Link as any}
                to={`/moviedetails/moviecatalog/${film.id}`}
                variant="danger"
                className="boka-knapp"
              >
                Biljetter →
              </Button>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
/*Placeholder FOOTER – stylas inte i Start.css*/

function Footer() {
  return (
    <Container>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand href="#">Footer</Navbar.Brand>
        </Container>
      </Navbar>
    </Container>
  );
}

Start.route = {
  path: "/",
  order: 0,
  label: "Start",
};
