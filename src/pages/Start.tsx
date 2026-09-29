import { useState } from "react";
import "../styles/Start.css";
import { Link } from "react-router";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Carousel from "react-bootstrap/Carousel";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Collapse from "react-bootstrap/Collapse";
import TMNT from "../images/TMNT.jpg";
import Spiderman from "../images/Spiderman.jpeg";
import Superman from "../images/Superman.jpg";
import Mulanfilm from "../images/Mulanfilm.jpeg";
import Spidermanfilm from "../images/Spidelmanfilm.jpg";
import Ninja from "../images/Ninja.jpg";
import charlie from "../images/charlie.jpg";
import Thor from "../images/Thor.jpg";
import Batman from "../images/Batman.jpg";
import fyra from "../images/fyra.jpg";
import superman2 from "../images/superman2.jpg";

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

function dagensDatumISO(): string {
  return new Date().toISOString().split("T")[0];
}

const IDAG_ISO = dagensDatumISO();

export default function Start() {
  const [aktivtFilter, setAktivtFilter] = useState<
    "idag" | "imorgon" | "kalender"
  >("idag");
  const [valtDatum, setValtDatum] = useState<string>("");

  const visadeFilmer = aktivtFilter === "idag" ? filmerIdag : filmerImorgon;

  function valjFilter(filter: "idag" | "imorgon" | "kalender") {
    setAktivtFilter(filter);
  }

  return (
    <>
      <NavBar />
      <HeroCarousel />
      <FilterKnappar
        aktivtFilter={aktivtFilter}
        valtDatum={valtDatum}
        onValjFilter={valjFilter}
        onValjDatum={setValtDatum}
      />
      <Container>
        <FilmerStart filmer={visadeFilmer} />
      </Container>
      <Footer />
    </>
  );
}
/*Placeholder NAVBAR*/
function NavBar() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home">FYLLNADS NAVBAR</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home">test</Nav.Link>
            <Nav.Link href="#link">test</Nav.Link>
            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">test</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">Mer test</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">test</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">test</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
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

/* 3 filter knappar placeholder ( Görs sedan som komponenter ) */

type FilterKnapparProps = {
  aktivtFilter: "idag" | "imorgon" | "kalender";
  valtDatum: string;
  onValjFilter: (filter: "idag" | "imorgon" | "kalender") => void;
  onValjDatum: (datum: string) => void;
};

function FilterKnappar({
  aktivtFilter,
  valtDatum,
  onValjFilter,
  onValjDatum,
}: FilterKnapparProps) {
  return (
    <Container className="mt-4 mb-4">
      <Row className="g-5">
        <Col>
          <Button
            variant="danger"
            size="lg"
            className="w-100"
            active={aktivtFilter === "idag"}
            onClick={() => onValjFilter("idag")}
          >
            Idag
          </Button>
        </Col>

        <Col>
          <Button
            variant="danger"
            size="lg"
            className="w-100"
            active={aktivtFilter === "imorgon"}
            onClick={() => onValjFilter("imorgon")}
          >
            Imorgon
          </Button>
        </Col>

        <Col>
          <Button
            variant="danger"
            size="lg"
            className="w-100"
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
                min={IDAG_ISO}
                value={valtDatum}
                onChange={(e) => onValjDatum(e.target.value)}
              />
            </Col>
          </Row>
        </div>
      </Collapse>
    </Container>
  );
}
/*6 st filmer cards med knapp till biljetter. ( Knappar görs sedan som komponenter )*/

function FilmerStart({ filmer }: { filmer: FilmMock[] }) {
  return (
    <Container>
      <Row xs={1} md={3} className="g-5">
        {filmer.map((film) => (
          <Col key={film.id}>
            <Card>
              <Card.Img variant="top" src={film.bild} alt={film.titel} />
              <Card.Body>
                <Button
                  as={Link as any}
                  to={`/moviedetails/moviecatalog/${film.id}`}
                  variant="danger"
                >
                  Biljetter
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
/*Placeholder FOOTER*/

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
