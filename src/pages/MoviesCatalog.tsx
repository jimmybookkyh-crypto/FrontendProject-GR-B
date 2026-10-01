import { useState } from "react";
import "../styles/Start.css";
import { Link } from "react-router";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import backgroundImage from "../assets/img/biodukbg.png";

import TMNT from "../assets/TMNT.jpg";
import Superman from "../assets/Superman.jpg";
import Mulanfilm from "../assets/Mulanfilm.jpeg";
import Ninja from "../assets/Ninja.jpg";
import charlie from "../assets/charlie.jpg";
import Thor from "../assets/Thor.jpg";
import Batman from "../assets/Batman.jpg";
import fyra from "../assets/fyra.jpg";
import superman2 from "../assets/superman2.jpg";
import SpidermanJpg from "../assets/Spiderman.jpg";
import Spidelmanfilm from "../assets/Spidelmanfilm.jpg";
import Mulan from "../assets/Mulan.jpg";
import Doomsday from "../assets/Doomsday.jpg";
import SpidermanJpeg from "../assets/Spiderman.jpeg";

type FilmMock = {
  id: string;
  titel: string;
  bild: string;
};

const allaFilmer: FilmMock[] = [
  { id: "thor", titel: "Thor: Love & Thunder", bild: Thor },
  { id: "batman", titel: "Batman", bild: Batman },
  { id: "spiderman-jpg", titel: "Spider-Man", bild: SpidermanJpg },
  {
    id: "spidelmanfilm",
    titel: "Spider-Man: No Way Home",
    bild: Spidelmanfilm,
  },
  { id: "mulan", titel: "Mulan", bild: Mulan },
  { id: "mulanfilm", titel: "Mulan (Live Action)", bild: Mulanfilm },
  { id: "tmnt", titel: "TMNT", bild: TMNT },
  { id: "charlie", titel: "Charlie's Angels", bild: charlie },
  { id: "superman", titel: "Superman", bild: Superman },
  { id: "superman2", titel: "Superman II", bild: superman2 },
  { id: "doomsday", titel: "Doomsday", bild: Doomsday },
  { id: "ninja", titel: "Ninja Turtles", bild: Ninja },
  { id: "fyra", titel: "Fantastic Four", bild: fyra },
  { id: "spiderman-jpeg", titel: "Spider-Man: Animated", bild: SpidermanJpeg },
];

const kommandeFilmer: FilmMock[] = [
  { id: "doomsday", titel: "Doomsday", bild: Doomsday },
  { id: "superman2", titel: "Superman II", bild: superman2 },
  { id: "fyra", titel: "Fantastic Four", bild: fyra },
  { id: "ninja", titel: "Ninja Turtles", bild: Ninja },
  { id: "mulanfilm", titel: "Mulan (Live Action)", bild: Mulanfilm },
  { id: "spiderman-jpeg", titel: "Spider-Man: Animated", bild: SpidermanJpeg },
];

export default function MovieCatalog() {
  const [aktivtFilter, setAktivFilter] = useState<
    "allaFilmer" | "kommandeFilmer"
  >("allaFilmer");

  const visadeFilmer =
    aktivtFilter === "allaFilmer" ? allaFilmer : kommandeFilmer;

  return (
    <>
      <div
        className="sida-innehall"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <FilterKnappar
          aktivtFilter={aktivtFilter}
          onValjFilter={setAktivFilter}
        />
        <Container className="filmkatalog">
          <FilmerStart filmer={visadeFilmer} />
        </Container>
      </div>
    </>
  );
}

/* 3 filterknappar – staplas på mobil, tre i rad på läsplatta/desktop */

type FilterKnapparProps = {
  aktivtFilter: "allaFilmer" | "kommandeFilmer";
  onValjFilter: (filter: "allaFilmer" | "kommandeFilmer") => void;
};

function FilterKnappar({ aktivtFilter, onValjFilter }: FilterKnapparProps) {
  return (
    <Container className="filter-sektion">
      <Row className="g-2 g-md-5 d-flex justify-content-center">
        <Col xs={12} md={5}>
          <Button style={{ backgroundColor: '#8e1733', borderColor: '#8e1733' }}
            variant="outline-dark"
            size="lg"
            className="w-100 filter-knapp"
            active={aktivtFilter === "allaFilmer"}
            onClick={() => onValjFilter("allaFilmer")}
          >
            Alla Filmer
          </Button>
        </Col>

        <Col xs={12} md={5}>
          <Button style={{ backgroundColor: '#8e1733', borderColor: '#8e1733' }}
            variant="outline-dark"
            size="lg"
            className="w-100 filter-knapp"
            active={aktivtFilter === "kommandeFilmer"}
            onClick={() => onValjFilter("kommandeFilmer")}
          >
            Kommande Filmer
          </Button>
        </Col>
      </Row>
    </Container>
  );
}
/*6 st filmer cards med knapp till biljetter.*/

function FilmerStart({ filmer }: { filmer: FilmMock[] }) {
  return (
    //<Row xs={2} md={3} className="g-3 g-md-5">
    <Row xs={2} sm={2} md={3} lg={4} className="g-4 justify-content-center">
      {filmer.map((film) => (
        <Col key={film.id}>
          <Card className="filmkort">
            <Card.Img variant="top" src={film.bild} alt={film.titel} />
            <Card.Body className="filmkort-body">
              <Button style={{ backgroundColor: '#8e1733', borderColor: '#8e1733' }}
                variant="outline-light"
                as={Link as any}
                to={`/moviedetails/moviecatalog/${film.id}`}
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

MovieCatalog.route = {
  path: "/moviecatalog",
  order: 1,
  label: "Filmkatalog",
};
