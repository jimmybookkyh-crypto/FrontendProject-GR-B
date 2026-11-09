import { useEffect, useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import TicketButton from "./ticketButton";
import AgeBadge from "./AgeBadge";
import "../styles/HeroSection.css";

const MAX_MOVIE_SLIDES = 3;
const SLIDE_INTERVAL_MS = 7000; // hur länge varje bild visas

type HeroEvent = {
  eventId: string;
  name: string;
  current: boolean;
  info: string | null;
};

type HeroEventShowing = {
  showingId: string;
  date: string;
  time: string;
  movieId: string;
  movieTitle: string;
};

type HeroMovie = {
  movieId: number | string;
  title: string;
  productionyear?: number | null;
  ageRating?: number | null;
  description?: string | null;
  images?: string[] | string;
};

type HeroSlideData = {
  key: string;
  label: string;
  title: string;
  ageRating?: number | null;
  text: string;
  poster: string;
  buttonTo: string;
  buttonLabel: string;
};

function getFirstValue(value?: string[] | string): string {
  if (!value) return "";
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? (parsed[0] ?? "") : String(parsed);
  } catch {
    return typeof value === "string" ? value : "";
  }
}

function getFirstSentence(text?: string | null): string {
  if (!text) return "";
  const firstParagraph = text.split(/\n+/)[0].trim();
  const match = firstParagraph.match(/^.*?[.!?](\s|$)/);
  return (match ? match[0] : firstParagraph).trim();
}

/* Första stycket, t.ex. ur events.info */
function getFirstParagraph(text?: string | null): string {
  return text ? text.split(/\n+/)[0].trim() : "";
}

function getShowingKey(showing: { date: string; time: string }): string {
  return `${showing.date}T${showing.time.slice(0, 5)}`;
}

function getNowKey(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

const shortDateFormat = new Intl.DateTimeFormat("sv-SE", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

function formatShortDate(date: string): string {
  return shortDateFormat
    .format(new Date(`${date}T00:00:00`))
    .replace(/\./g, "");
}

const dayMonthFormat = new Intl.DateTimeFormat("sv-SE", {
  day: "numeric",
  month: "short",
});

function formatPeriod(start: string, end: string): string {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  const clean = (value: string) => value.replace(/\./g, "");
  const endText = clean(dayMonthFormat.format(endDate));

  if (start === end) return endText;
  if (startDate.getMonth() === endDate.getMonth()) {
    return `${startDate.getDate()}–${endText}`;
  }
  return `${clean(dayMonthFormat.format(startDate))}–${endText}`;
}

function buildEventSlides(
  event: HeroEvent,
  showings: HeroEventShowing[],
  upcoming: HeroEventShowing[],
  movieById: Map<string, HeroMovie>,
): HeroSlideData[] {
  const period = formatPeriod(
    showings[0].date,
    showings[showings.length - 1].date,
  );
  const hasStarted = getShowingKey(showings[0]) <= getNowKey();

  const byNewest = (a: string, b: string) =>
    (movieById.get(b)?.productionyear ?? 0) -
    (movieById.get(a)?.productionyear ?? 0);

  const eventMovieIds = [
    ...new Set(showings.map((s) => String(s.movieId))),
  ].sort(byNewest);
  const eventMovieId = eventMovieIds[0];

  const eventSlide: HeroSlideData = {
    key: `event-${event.eventId}`,
    label: `${hasStarted ? "Månadens event" : "Kommande event"} · ${period}`,
    title: event.name,
    text: getFirstParagraph(event.info),
    poster: getFirstValue(movieById.get(eventMovieId)?.images),
    buttonTo: `/event#event-${event.eventId}`,
    buttonLabel: "Läs om eventet →",
  };

  const upcomingMovieIds = [...new Set(upcoming.map((s) => String(s.movieId)))]
    .filter((id) => id !== eventMovieId)
    .sort(byNewest)
    .slice(0, MAX_MOVIE_SLIDES);

  const movieSlides = upcomingMovieIds.map((id): HeroSlideData => {
    const movie = movieById.get(id);
    const nextShowing = upcoming.find((s) => String(s.movieId) === id)!;
    return {
      key: `movie-${id}`,
      label: `${event.name} · ${period}`,
      title: movie?.title ?? nextShowing.movieTitle,
      ageRating: movie?.ageRating,
      text: getFirstSentence(movie?.description),
      poster: getFirstValue(movie?.images),
      buttonTo: `/movies/${id}?datum=${nextShowing.date}`,
      buttonLabel: `Biljetter → ${formatShortDate(nextShowing.date)}`,
    };
  });

  return [eventSlide, ...movieSlides];
}

function buildFallbackSlides(movies: HeroMovie[]): HeroSlideData[] {
  return movies
    .filter((movie) => getFirstValue(movie.images))
    .slice(0, MAX_MOVIE_SLIDES + 1)
    .map((movie) => ({
      key: `movie-${movie.movieId}`,
      label: "Visas nu",
      title: movie.title,
      ageRating: movie.ageRating,
      text: getFirstSentence(movie.description),
      poster: getFirstValue(movie.images),
      buttonTo: `/movies/${movie.movieId}`,
      buttonLabel: "Se filmen →",
    }));
}

function useHeroSlides(): HeroSlideData[] {
  const [slides, setSlides] = useState<HeroSlideData[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    const getData = <T,>(path: string): Promise<T | null> =>
      fetch(`/api${path}`, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : { data: null }))
        .then((body: { data?: T | null }) => body.data ?? null)
        .catch(() => null);

    (async () => {
      const [events, movies, currentMovies] = await Promise.all([
        getData<HeroEvent[]>("/events?limit=100"),
        getData<HeroMovie[]>("/movies?limit=100"),
        getData<HeroMovie[]>("/movies/current"),
      ]);
      if (controller.signal.aborted) return;

      const movieById = new Map(
        (movies ?? []).map((movie) => [String(movie.movieId), movie]),
      );
      const nowKey = getNowKey();

      const candidates = await Promise.all(
        (events ?? [])
          .filter((event) => event.current)
          .map(async (event) => {
            const showings =
              (await getData<HeroEventShowing[]>(
                `/events/${event.eventId}/showings`,
              )) ?? [];
            const upcoming = showings.filter(
              (showing) => getShowingKey(showing) > nowKey,
            );
            return { event, showings, upcoming };
          }),
      );
      if (controller.signal.aborted) return;

      const chosen = candidates
        .filter((candidate) => candidate.upcoming.length > 0)
        .sort((a, b) =>
          getShowingKey(a.upcoming[0]).localeCompare(
            getShowingKey(b.upcoming[0]),
          ),
        )[0];

      setSlides(
        chosen
          ? buildEventSlides(
              chosen.event,
              chosen.showings,
              chosen.upcoming,
              movieById,
            )
          : buildFallbackSlides(currentMovies ?? []),
      );
    })();

    return () => controller.abort();
  }, []);

  return slides;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function HeroSection() {
  const slides = useHeroSlides();
  const [isPaused, setIsPaused] = useState(prefersReducedMotion);

  if (slides.length === 0) {
    return (
      <div className="hero-carousel">
        <div className="hero-slide" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="hero-wrapper">
      <Carousel
        className="hero-carousel"
        interval={isPaused ? null : SLIDE_INTERVAL_MS}
        prevLabel="Föregående"
        nextLabel="Nästa"
        indicatorLabels={slides.map((slide) => `Visa ${slide.title}`)}
      >
        {slides.map((slide, index) => {
          const isFirst = index === 0;
          const Heading = isFirst ? "h1" : "h2";

          return (
            <Carousel.Item key={slide.key}>
              <div className="hero-slide">
                {slide.poster && (
                  <>
                    <div
                      className="hero-slide-bg"
                      style={{ backgroundImage: `url(${slide.poster})` }}
                      aria-hidden="true"
                    />
                    <img
                      className="hero-slide-poster"
                      src={slide.poster}
                      alt={`Affisch: ${slide.title}`}
                      fetchPriority={isFirst ? "high" : "auto"}
                      loading={isFirst ? "eager" : "lazy"}
                    />
                  </>
                )}

                <div className="hero-slide-content">
                  <p className="hero-slide-label">{slide.label}</p>
                  <div className="hero-slide-title-row">
                    <Heading className="hero-slide-title">
                      {slide.title}
                    </Heading>
                    <AgeBadge
                      ageRating={slide.ageRating}
                      className="hero-slide-age"
                    />
                  </div>
                  {slide.text && (
                    <p className="hero-slide-text">{slide.text}</p>
                  )}

                  <div className="hero-slide-ticket">
                    <TicketButton
                      to={slide.buttonTo}
                      label={slide.buttonLabel}
                    />
                  </div>
                </div>
              </div>
            </Carousel.Item>
          );
        })}
      </Carousel>

      {slides.length > 1 && (
        <button
          type="button"
          className="hero-pause-toggle"
          onClick={() => setIsPaused((paused) => !paused)}
          aria-label={isPaused ? "Starta bildspelet" : "Pausa bildspelet"}
          title={isPaused ? "Starta bildspelet" : "Pausa bildspelet"}
        >
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="currentColor"
            aria-hidden="true"
          >
            {isPaused ? (
              <path d="M8 5v14l11-7z" />
            ) : (
              <>
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </>
            )}
          </svg>
        </button>
      )}
    </div>
  );
}
