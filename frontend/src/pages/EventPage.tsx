import { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import type { EventPeriod, EventRow, EventShowing } from "../interface/types";
import backgroundImage from "../assets/img/biodukbg.png";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import useFetch from "../hooks/useFetch";
import "../styles/Event.css";


/* Svensk datumformatering: "26–30 oktober" eller "30 oktober–2 november" */
const dateMonth = new Intl.DateTimeFormat("sv-SE", {
  day: "numeric",
  month: "long",
});

function formatDatePeriod(start: string, end: string) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  if (start === end) return dateMonth.format(startDate);
  const endText = dateMonth.format(endDate);
  if (startDate.getMonth() === endDate.getMonth()) {
    return `${startDate.getDate()}–${endText}`;
  }
  return `${dateMonth.format(startDate)}–${endText}`;
}

/* En rad per film ("Titel (2008)") i visningsordning, samt första och sista
   visningsdatum. Backend sorterar på datum och tid. */
function groupShowings(showings: EventShowing[]) {
  const processedMovieIds = new Set<string>();
  const movies: string[] = [];

  for (const showing of showings) {
    if (processedMovieIds.has(showing.movieId)) continue;

    processedMovieIds.add(showing.movieId);

    movies.push(
      showing.productionyear
        ? `${showing.movieTitle} (${showing.productionyear})`
        : showing.movieTitle,
    );
  }

  return {
    movies,
    start: showings[0]?.date ?? null,
    end: showings[showings.length - 1]?.date ?? null,
  };
}

/* Event.info är en enda textsträng. Varje rad blir paragraph. */
function parseEventInfo(info: string | null): string[] {
  if (!info) return [];
  return info
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
function EventCard({ event, period }: { event: EventRow; period: EventPeriod }) {
  const [showMovies, setShowMovies] = useState(false);
  const { data, loading, error } = useFetch<EventShowing[]>(
    `/events/${event.eventId}/showings`,
  );

  // Samma event kan visas flera gånger (en per period), så id:t måste vara unikt per kort
  const cardId = `${event.eventId}-${period.startDate}`;
  const headingId = `event-heading-${cardId}`;
  const moviesId = `event-movies-${cardId}`;

  const paragraphs = parseEventInfo(event.info);
  const { movies } = groupShowings(data ?? []);

  const dateRange = formatDatePeriod(period.startDate, period.endDate);

  return (
    <article className="event-card" aria-labelledby={headingId}>
      <Row className="g-0">
        <Col lg={5}>
          <div className="event-image-border">
            <img
              className="event-image"
              src={event.image ?? backgroundImage}
              alt={event.altText ?? ""}
            />
          </div>
        </Col>

        <Col lg={7}>
          <div className="event-content">
            <p className="event-date-range">{dateRange}</p>
            <h2 id={headingId} className="event-title">
              {event.name}
            </h2>
            {event.tagline && (
              <p className="event-tagline">{event.tagline}</p>
            )}
            {paragraphs.map((paragraph) => (
              <p key={paragraph} className="event-text">
                {paragraph}
              </p>
            ))}

            {loading && <LoadingSpinner text="Hämtar event…" />}
            {error && <ErrorMessage message={error} />}

            {!loading && !error && movies.length > 0 && (
              <>
                <Collapse in={showMovies}>
                  <div id={moviesId}>
                    <ul className="event-movies">
                      {movies.map((movie) => (
                        <li key={movie}>{movie}</li>
                      ))}
                    </ul>
                  </div>
                </Collapse>

                <div className="event-buttons">
                  <Button
                    variant="normal"
                    className="event-movies-button"
                    onClick={() => setShowMovies((v) => !v)}
                    aria-expanded={showMovies}
                    aria-controls={moviesId}
                  >
                    {showMovies
                      ? "Dölj filmer"
                      : `Visa alla ${movies.length} filmer`}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Col>
      </Row>
    </article>
  );
}

export default function EventPage() {
  const { data, loading, error } = useFetch<EventRow[]>("/events");

  // Ett kort per period, alla sorterade på startdatum
  const upcomingCards = (data ?? [])
    .flatMap((event) => event.periods.map((period) => ({ event, period })))
    .sort((a, b) => a.period.startDate.localeCompare(b.period.startDate));

  return (
    <div
      className="event-page min-vh-100 w-100"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container className="event-page-container">
        <header className="event-header">
          <h1>Kommande evenemanger</h1>
          <p>Hjälteveckor på Filmvisarna: flera filmer, en hjälte, en vecka.</p>
        </header>

        {loading && <LoadingSpinner text="Hämtar event…" />}
        {error && <ErrorMessage message={error} />}

        {!loading && !error && upcomingCards.length === 0 && (
          <p className="event-empty">
            Just nu finns inga kommande event. Titta in igen snart, eller se vad
            som visas idag på startsidan.
          </p>
        )}

        {!loading && !error && upcomingCards.length > 0 && (
          <ul className="event-list">
            {upcomingCards.map(({ event, period }) => (
              <li key={`${event.eventId}-${period.startDate}`}>
                <EventCard event={event} period={period} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </div>
  );
}

EventPage.route = {
  path: "/event",
  order: 1,
  label: "Event",
};
