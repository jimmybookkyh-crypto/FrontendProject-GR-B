import { useState } from "react";
import "../styles/Start.css";
import { Link } from "react-router";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import backgroundImage from "../assets/img/biodukbg.png";
import TicketButton from "../components/ticketButton";
import placeholder from "../assets/img/ph.png";
import useFetch from "../hooks/useFetch"; // #319
import LoadingSpinner from "../components/LoadingSpinner"; // #320
import ErrorMessage from "../components/ErrorMessage"; // #320
import MovieGrid from "../components/MovieGrid";

/* #319: TILLFÄLLIG typ tills interface/types.ts är klar.
   Fälten heter som i backend (backend/interface/types.ts).
   Ersätt med: import type { Movie } from "../interface/types"; */
type Movie = {
  movieId: string;
  title: string;
};

type Filter = "allaFilmer" | "kommandeFilmer";

/* #319: Vilken endpoint i backend varje filterknapp hämtar från.
   current = true  -> filmen visas just nu
   current = false -> filmen visas inte just nu (t.ex. kommande) */
const FILTER_PATH: Record<Filter, string> = {
  allaFilmer: "/movies/current",
  kommandeFilmer: "/movies/not-current",
};

export default function MovieCatalog() {
  const [aktivtFilter, setAktivFilter] = useState<Filter>("allaFilmer");

  // #319: hämtar filmerna från databasen i stället för hårdkodad testdata
  const {
    data: filmer,
    loading,
    error,
  } = useFetch<Movie[]>(FILTER_PATH[aktivtFilter]);

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
          {/* #320: gemensam laddning och felruta */}
          {loading && <LoadingSpinner text="Hämtar filmer…" />}
          {error && <ErrorMessage message={error} />}

          {filmer && filmer.length === 0 && (
            <p className="text-center text-light">
              Inga filmer att visa just nu.
            </p>
          )}
          {filmer && filmer.length > 0 && <MovieGrid movies={filmer} />}
        </Container>
      </div>
    </>
  );
}

/* 2 filterknappar – staplas på mobil, i rad på läsplatta/desktop */

type FilterKnapparProps = {
  aktivtFilter: Filter;
  onValjFilter: (filter: Filter) => void;
};

function FilterKnappar({ aktivtFilter, onValjFilter }: FilterKnapparProps) {
  return (
    <Container className="filter-sektion">
      <Row className="g-2 g-md-5 d-flex justify-content-center">
        <Col xs={12} md={5}>
          <Button
            style={{ backgroundColor: "#8e1733", borderColor: "#8e1733" }}
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
          <Button
            style={{ backgroundColor: "#8e1733", borderColor: "#8e1733" }}
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

MovieCatalog.route = {
  path: "/moviecatalog",
  order: 1,
  label: "Filmkatalog",
};
