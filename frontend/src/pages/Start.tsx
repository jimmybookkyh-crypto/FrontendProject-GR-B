import { useRef } from "react";
import { useSearchParams } from "react-router";
import "../styles/Start.css";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Biodukbg from "../assets/img/biodukbg.png";
import useFetch from "../hooks/useFetch";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import Datumremsa from "../components/Datumremsa";
import { langtDatum, plusDagar, validDate } from "../utils/date";
import MovieGrid from "../components/MovieGrid";
import FilterButtons from "../components/FilterButtons";
import { filterByAgeLimit, useAgeLimit } from "../utils/ageLimit";
import HeroSection from "../components/HeroSection";

/* #319: TILLFÄLLIG typ tills interface/types.ts är klar.
   Fälten heter som i backend (backend/interface/types.ts).
   Ersätt med: import type { Movie } from "../interface/types"; */
type Movie = {
  movieId: string;
  title: string;
  ageRating?: number;
  images?: string[] | string;
};

/* Det Start behöver veta om en visning: vilken film den gäller.
   (Svaret från GET /showings innehåller mer, t.ex. tid och salong.) */
type Showing = {
  movieId: number;
  hasStarted: boolean; // true = visningen har börjat och kan inte bokas
};

export default function Start() {
  const idag = plusDagar(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const valtDatum = validDate(searchParams.get("datum"));

  const setValtDatum = (date: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (date === idag) {
          next.delete("datum");
        } else {
          next.set("datum", date);
        }
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  };
  const [ageLimit, setAgeLimit] = useAgeLimit();
  const filterSectionRef = useRef<HTMLDivElement>(null);

  const selectDate = (date: string) => {
    setValtDatum(date);
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? "auto"
      : "smooth";
    filterSectionRef.current?.scrollIntoView({ behavior, block: "start" });
  };

  const { data: filmer, loading, error } = useFetch<Movie[]>("/movies/current");

  const {
    data: visningar,
    loading: laddarVisningar,
    error: visningsFel,
  } = useFetch<Showing[]>(`/showings?date=${valtDatum}&limit=100`);

  const filmerDenDagen =
    filmer && visningar
      ? filmer.filter((film) =>
          visningar.some(
            (showing) =>
              !showing.hasStarted &&
              String(showing.movieId) === String(film.movieId),
          ),
        )
      : null;
  const visibleMovies = filmerDenDagen
    ? filterByAgeLimit(filmerDenDagen, ageLimit)
    : null;
  const laddar = loading || laddarVisningar;
  const fel = error ?? visningsFel;

  return (
    <>
      <div
        className="sida-innehall min-vh-100"
        style={{ backgroundImage: `url(${Biodukbg})` }}
      >
        <HeroSection />
        <Container className="filter-sektion" ref={filterSectionRef}>
          <Datumremsa valtDatum={valtDatum} onByt={selectDate} />
        </Container>
        <FilterButtons ageLimit={ageLimit} onSelectAgeLimit={setAgeLimit} />
        <Container className="filmkatalog">
          <h2 className="datum-rubrik">
            {valtDatum === idag ? "Idag · " : ""}
            {langtDatum(valtDatum)}
          </h2>

          {laddar && <LoadingSpinner text="Hämtar filmer…" />}
          {fel && <ErrorMessage message={fel} />}

          {filmerDenDagen && filmerDenDagen.length === 0 && (
            <IngaVisningar
              onVisaIdag={
                valtDatum === idag ? undefined : () => setValtDatum(idag)
              }
            />
          )}
          {filmerDenDagen &&
            filmerDenDagen.length > 0 &&
            visibleMovies?.length === 0 && (
              <div className="inga-visningar">
                <h3>Inga filmer för vald åldersgräns</h3>
                <p>Välj en annan åldersgräns eller ett annat datum.</p>
                <Button
                  className="filter-knapp"
                  onClick={() => setAgeLimit(null)}
                >
                  Visa alla åldrar
                </Button>
              </div>
            )}
          {visibleMovies && visibleMovies.length > 0 && (
            <MovieGrid movies={visibleMovies} datum={valtDatum} navigatedFrom="start" />
          )}
        </Container>
      </div>
    </>
  );
}

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
