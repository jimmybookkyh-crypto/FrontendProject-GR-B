import { useState } from "react";
import "../styles/Start.css";
import { Link } from "react-router";
import Container from "react-bootstrap/Container";
import Carousel from "react-bootstrap/Carousel";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Collapse from "react-bootstrap/Collapse";
import Biodukbg from "../assets/img/biodukbg.png";
import Spiderman from "../assets/Spiderman.jpeg";
import Superman from "../assets/Superman.jpg";
import Ninja from "../assets/Ninja.jpg";
import placeholder from "../assets/img/ph.png";
import useFetch from "../hooks/useFetch"; // #319
import LoadingSpinner from "../components/LoadingSpinner"; // #320
import ErrorMessage from "../components/ErrorMessage"; // #320

/* #319: TILLFÄLLIG typ tills interface/types.ts är klar.
   Fälten heter som i backend (backend/interface/types.ts).
   Ersätt med: import type { Movie } from "../interface/types"; */
type Movie = {
  movieId: string;
  title: string;
};

export default function Start() {
  const [aktivtFilter, setAktivtFilter] = useState<
    "idag" | "imorgon" | "kalender"
  >("idag");
  const [datum, setDatum] = useState("");
  const idag = new Date().toISOString().split("T")[0];

  /* #319: hämtar filmerna från databasen i stället för hårdkodad testdata.
     Idag/Imorgon/Kalender filtrerar inte än enligt nya beslutet – det kräver visningarna (showings)
     och görs i #331 task. Just nu visas alla filmer som går (current = true). */
  const { data: filmer, loading, error } = useFetch<Movie[]>("/movies/current");

  function valjFilter(filter: "idag" | "imorgon" | "kalender") {
    setAktivtFilter(filter);
  }

  function handleDatumChange(event: React.ChangeEvent<HTMLInputElement>) {
    setDatum(event.target.value);
  }

  return (
    <>
      <div
        className="sida-innehall min-vh-100"
        style={{ backgroundImage: `url(${Biodukbg})` }}
      >
        <HeroCarousel />
        <FilterKnappar
          aktivtFilter={aktivtFilter}
          datum={datum}
          idag={idag}
          onValjFilter={valjFilter}
          onDatumChange={handleDatumChange}
        />
        <Container className="filmkatalog">
          {/* #320: gemensam laddning och felruta */}
          {loading && <LoadingSpinner text="Hämtar filmer…" />}
          {error && <ErrorMessage message={error} />}

          {filmer && filmer.length === 0 && (
            <p className="text-center text-light">
              Inga filmer att visa just nu.
            </p>
          )}
          {filmer && filmer.length > 0 && <FilmerStart filmer={filmer} />}
        </Container>
      </div>
    </>
  );
}
/* Hero-section med slides.
   Statiska bilder med flit – inte en del av #319.
   Ev. koppling till filmer/event görs i egen task. i sprint 4 */

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
          <h3>Teenage Mutant Ninja Turtles</h3>
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

/* Platshållare  3 filterknappar ersätts T094a - Design av datumfiltret och bygg den   
ersätts när #331 skapas*/

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
            className="w-100 filter-knapp"
            active={aktivtFilter === "idag"}
            onClick={() => onValjFilter("idag")}
          >
            Idag
          </Button>
        </Col>

        <Col xs={12} md={4}>
          <Button
            className="w-100 filter-knapp"
            active={aktivtFilter === "imorgon"}
            onClick={() => onValjFilter("imorgon")}
          >
            Imorgon
          </Button>
        </Col>

        <Col xs={12} md={4}>
          <Button
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
/* Platshållare Filmkort med knapp till biljetter.
   Ersätts av MovieCard + MovieGrid i #338. */

function FilmerStart({ filmer }: { filmer: Movie[] }) {
  return (
    <Row xs={2} md={3} className="g-3 g-md-5">
      {filmer.map((film) => (
        <Col key={film.movieId}>
          <Card className="filmkort">
            <Link to={`/moviedetails/filmkatalog/${film.movieId}`}>
              {/* Platshållare – riktiga posters kommer i poster-tasken #337*/}
              <Card.Img variant="top" src={placeholder} alt={film.title} />
            </Link>
            <Card.Body className="filmkort-body">
              {/* Platshållare Byts mot gemensam CTA-komponent i task #340*/}
              <Button
                as={Link as any}
                to={`/moviedetails/filmkatalog/${film.movieId}`}
                variant="normal"
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

Start.route = {
  path: "/",
  order: 0,
  label: "Start",
};
