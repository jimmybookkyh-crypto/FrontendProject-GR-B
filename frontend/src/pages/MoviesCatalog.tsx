import { useState } from "react";
import "../styles/Start.css";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import backgroundImage from "../assets/img/biodukbg.png";
import useFetch from "../hooks/useFetch";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage"; 
import MovieGrid from "../components/MovieGrid";
import FilterButtons, { type FilterTab } from "../components/FilterButtons";
import { filterByAgeLimit, useAgeLimit } from "../utils/ageLimit"; 


type Movie = {
  movieId: string;
  title: string;
  ageRating?: number;
};

type Filter = "allaFilmer" | "kommandeFilmer";

const FILTER_PATH: Record<Filter, string> = {
  allaFilmer: "/movies/current",
  kommandeFilmer: "/movies/not-current",
};

const FILTER_TABS: FilterTab<Filter>[] = [
  { value: "allaFilmer", label: "Visas nu" },
  { value: "kommandeFilmer", label: "Kommande Filmer" },
];

export default function MovieCatalog() {
  const [activeFilter, setActiveFilter] = useState<Filter>("allaFilmer");
  const [ageLimit, setAgeLimit] = useAgeLimit(); 

    const {
      data: filmer,
      loading,
      error,
    } = useFetch<Movie[]>(FILTER_PATH[activeFilter]);

    const visibleMovies = filmer ? filterByAgeLimit(filmer, ageLimit) : null;

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

          {filmer && filmer.length === 0 && (
            <p className="text-center text-light">
              Inga filmer att visa just nu.
            </p>
          )}

          {filmer && filmer.length > 0 && visibleMovies?.length === 0 && (
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
              showDetails={activeFilter !== "kommandeFilmer"}
            />
          )}
        </Container>
      </div>
    </>
  );
}

MovieCatalog.route = {
  path: "/moviecatalog",
  order: 1,
  label: "Filmkatalog",
};
