import { useState } from "react";
import "../styles/Start.css";
import { Link } from "react-router";
import Container from "react-bootstrap/Container";
import Carousel from "react-bootstrap/Carousel";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Biodukbg from "../assets/img/biodukbg.png";
import Spiderman from "../assets/Spiderman.jpeg";
import Superman from "../assets/Superman.jpg";
import Ninja from "../assets/Ninja.jpg";
import placeholder from "../assets/img/ph.png";
import useFetch from "../hooks/useFetch"; // #319
import LoadingSpinner from "../components/LoadingSpinner"; // #320
import ErrorMessage from "../components/ErrorMessage"; // #320
import Datumremsa from "../components/Datumremsa";
import { langtDatum, plusDagar } from "../utils/datum";
import MovieGrid from "../components/MovieGrid";

/* #319: TILLFÄLLIG typ tills interface/types.ts är klar.
   Fälten heter som i backend (backend/interface/types.ts).
   Ersätt med: import type { Movie } from "../interface/types"; */
type Movie = {
  movieId: string;
  title: string;
};

/* Det Start behöver veta om en visning: vilken film den gäller.
   (Svaret från GET /showings innehåller mer, t.ex. tid och salong.) */
type Showing = {
  movieId: number;
};

export default function Start() {
  const idag = plusDagar(0);
  const [valtDatum, setValtDatum] = useState(idag); // sidan börjar på idag

  // Alla filmer som går just nu (current = true)
  const { data: filmer, loading, error } = useFetch<Movie[]>("/movies/current");

  // Visningarna för valt datum. De visar vilka filmer som går just den dagen.
  // limit=100 så att alla dagens visningar kommer med (utan limit får vi max 50).
  const {
    data: visningar,
    loading: laddarVisningar,
    error: visningsFel,
  } = useFetch<Showing[]>(`/showings?date=${valtDatum}&limit=100`);

  // Behåller bara filmerna som har minst en visning det datumet
  const filmerDenDagen =
    filmer && visningar
      ? filmer.filter((film) =>
          visningar.some((v) => String(v.movieId) === String(film.movieId)),
        )
      : null;

  const laddar = loading || laddarVisningar;
  const fel = error ?? visningsFel;

  return (
    <>
      <div
        className="sida-innehall min-vh-100"
        style={{ backgroundImage: `url(${Biodukbg})` }}
      >
        <HeroCarousel />
        <Container className="filter-sektion">
          <Datumremsa valtDatum={valtDatum} onByt={setValtDatum} />
        </Container>
        <Container className="filmkatalog">
          <h2 className="datum-rubrik">
            {valtDatum === idag ? "Idag · " : ""}
            {langtDatum(valtDatum)}
          </h2>

          {/* #320: gemensam laddning och felruta */}
          {laddar && <LoadingSpinner text="Hämtar filmer…" />}
          {fel && <ErrorMessage message={fel} />}

          {filmerDenDagen && filmerDenDagen.length === 0 && (
            <IngaVisningar
              onVisaIdag={
                valtDatum === idag ? undefined : () => setValtDatum(idag)
              }
            />
          )}
          {filmerDenDagen && filmerDenDagen.length > 0 && (
            <MovieGrid movies={filmerDenDagen} datum={valtDatum} />
          )}
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

/* Visas när inga filmer går det valda datumet.
   Knappen "Visa idag" visas bara om man inte redan tittar på idag. */

function IngaVisningar({ onVisaIdag }: { onVisaIdag?: () => void }) {
  return (
    <div className="inga-visningar">
      <h3>Inga visningar detta datum</h3>
      <p>
        Välj ett annat datum{onVisaIdag ? ", eller se vad som visas idag" : ""}.
      </p>
      {onVisaIdag && (
        <Button className="filter-knapp" onClick={onVisaIdag}>
          Visa idag
        </Button>
      )}
    </div>
  );
}



Start.route = {
  path: "/",
  order: 0,
  label: "Start",
};
