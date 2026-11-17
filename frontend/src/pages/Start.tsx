import { useRef, useState } from "react";
import { useSearchParams } from "react-router";
import "../styles/Start.css";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import useFetch from "../hooks/useFetch";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import DateStrip from "../components/DateStrip";
import { formatLongDate, addDays, validDate } from "../utils/date";
import MovieGrid from "../components/MovieGrid";
import FilterButtons from "../components/FilterButtons";
import { filterByAgeLimit, useAgeLimit } from "../utils/ageLimit";
import HeroSection from "../components/HeroSection";
import type { Showing } from "../interface/types";
import BgImage from "../components/BgImgBd";

type Movie = {
  movieId: string;
  title: string;
  ageRating?: number;
  images?: string[] | string;
};

type StartShowing = Pick<Showing, "movieId" | "hasStarted">;

export default function Start() {
  const today = addDays(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedDate = validDate(searchParams.get("datum"));

  const setSelectedDate = (date: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (date === today) {
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
    setSelectedDate(date);
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? "auto"
      : "smooth";
    filterSectionRef.current?.scrollIntoView({ behavior, block: "start" });
  };

  const {
    data: movies,
    loading,
    error,
  } = useFetch<Movie[]>("/movies?limit=100");

  const {
    data: showings,
    loading: loadingShowings,
    error: showingsError,
  } = useFetch<StartShowing[]>(`/showings?date=${selectedDate}&limit=100`);

  const [shownShowings, setShownShowings] = useState<StartShowing[] | null>(
    null,
  );
  if (showings && showings !== shownShowings) {
    setShownShowings(showings);
  }
  const currentShowings = showingsError ? null : (showings ?? shownShowings);

  const moviesOnDate =
    movies && currentShowings
      ? movies.filter((movie) =>
          currentShowings.some(
            (showing) =>
              !showing.hasStarted &&
              String(showing.movieId) === String(movie.movieId),
          ),
        )
      : null;
  const visibleMovies = moviesOnDate
    ? filterByAgeLimit(moviesOnDate, ageLimit)
    : null;
  const isLoading = (loading || loadingShowings) && !moviesOnDate;
  const fetchError = error ?? showingsError;

  return (
    <>
      <BgImage>
        <div>
          <HeroSection />
          <Container className="filter-sektion" ref={filterSectionRef}>
            <DateStrip selectedDate={selectedDate} onSelectDate={selectDate} />
          </Container>
          <FilterButtons ageLimit={ageLimit} onSelectAgeLimit={setAgeLimit} />
          <Container className="filmkatalog" aria-busy={loadingShowings}>
            <h2 className="datum-rubrik">
              {selectedDate === today ? "Idag · " : ""}
              {formatLongDate(selectedDate)}
            </h2>

            {isLoading && <LoadingSpinner text="Hämtar filmer…" />}
            {fetchError && <ErrorMessage message={fetchError} />}

            {moviesOnDate && moviesOnDate.length === 0 && (
              <NoShowings
                onShowToday={
                  selectedDate === today
                    ? undefined
                    : () => setSelectedDate(today)
                }
              />
            )}
            {moviesOnDate &&
              moviesOnDate.length > 0 &&
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
              <MovieGrid
                movies={visibleMovies}
                date={selectedDate}
                navigatedFrom="start"
              />
            )}
          </Container>
        </div>
      </BgImage>
    </>
  );
}

function NoShowings({ onShowToday }: { onShowToday?: () => void }) {
  return (
    <div className="inga-visningar">
      <h3>Inga visningar detta datum</h3>
      <p>
        Välj ett annat datum{onShowToday ? ", eller se vad som visas idag" : ""}
        .
      </p>
      {onShowToday && (
        <Button className="filter-knapp" onClick={onShowToday}>
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
