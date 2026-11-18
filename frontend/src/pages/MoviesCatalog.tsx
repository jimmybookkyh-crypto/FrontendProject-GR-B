import { useState } from "react";
import "../styles/Start.css";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import useFetch from "../hooks/useFetch";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import MovieGrid from "../components/MovieGrid";
import FilterButtons, { type FilterTab } from "../components/FilterButtons";
import { filterByAgeLimit, useAgeLimit } from "../utils/ageLimit";
import { routes } from "../utils/paths.ts";
import BgImage from "../components/BgImgBd.tsx";

type Movie = {
  movieId: string;
  title: string;
  ageRating?: number;
};

type Filter = "currentMovies" | "upcomingMovies";

const FILTER_PATH: Record<Filter, string> = {
  currentMovies: "/movies/current",
  upcomingMovies: "/movies/not-current",
};

const FILTER_TABS: FilterTab<Filter>[] = [
  { value: "currentMovies", label: "Visas nu" },
  { value: "upcomingMovies", label: "Kommande filmer" },
];

export default function MovieCatalog() {
  const [activeFilter, setActiveFilter] = useState<Filter>("currentMovies");
  const [ageLimit, setAgeLimit] = useAgeLimit();

  const {
    data: movies,
    loading,
    error,
  } = useFetch<Movie[]>(FILTER_PATH[activeFilter]);

  const visibleMovies = movies ? filterByAgeLimit(movies, ageLimit) : null;

  return (
    <>
      <BgImage>
<<<<<<< HEAD
        <div
        className= "page-container"
        >
          <FilterButtons
            tabs={FILTER_TABS}
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
            ageLimit={ageLimit}
            onSelectAgeLimit={setAgeLimit}
          />
          <Container className="filmkatalog">
            {loading && <LoadingSpinner text="Hämtar filmer…" />}
            {error && <ErrorMessage message={error} />}
=======
      <div
      >
        <FilterButtons
          tabs={FILTER_TABS}
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
          ageLimit={ageLimit}
          onSelectAgeLimit={setAgeLimit}
        />
        <Container className="filmkatalog">
          {loading && <LoadingSpinner text="Hämtar filmer…" />}
          {error && <ErrorMessage message={error} />}
>>>>>>> 99a16c0d8b4f6af1598a750949de3cbfff756a08

          {movies && movies.length === 0 && (
            <p className="text-center text-light">
              Inga filmer att visa just nu.
            </p>
          )}

          {movies && movies.length > 0 && visibleMovies?.length === 0 && (
            <div className="inga-visningar">
              <h3>Inga filmer för vald åldersgräns</h3>
              <Button
                className="filter-knapp"
                onClick={() => setAgeLimit(null)}
              >
                Visa alla åldrar
              </Button>
            </div>
          )}

          {visibleMovies && visibleMovies.length > 0 && (
            <MovieGrid
              movies={visibleMovies}
              navigatedFrom="katalog"
              showDetails={activeFilter !== "upcomingMovies"}
            />
          )}
        </Container>
      </div>
      </BgImage>
    </>
  );
}

MovieCatalog.route = {
  path: routes.movies,
  order: 1,
  label: "Filmkatalog",
};
