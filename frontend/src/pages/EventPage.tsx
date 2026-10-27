import { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import type { EventRow, EventShowing } from "../interface/types";
import backgroundImage from "../assets/img/biodukbg.png";
//placeholder bilder för event tills de finns i databasen
import Spindel from "../assets/Spindel.jpg";
import Batman1 from "../assets/Batman1.jpg";
import Doomsday from "../assets/Doomsday.jpg";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import useFetch from "../hooks/useFetch";
import "../styles/Event.css";

/* mock data för bild och tagline ligger kvar i frontend tills de finns i databasen. */
type EventMockData = {
  tagline: string;
  src: string;
  alt: string;
  position?: string;
};

const eventMockData: Record<string, EventMockData> = {
  "avengers assemble": {
    tagline: "Samla hjältarna",
    src: Doomsday,
    alt: "Marvels hjältar samlade inför Avengers: Doomsday",
    position: "center 40%",
  },
  spindelveckan: {
    tagline: "Din vänliga hjälte i grannskapet",
    src: Spindel,
    alt: "Spider-Man hänger i sitt nät",
  },
  "mörkrets riddare": {
    tagline: "Gotham glömmer aldrig",
    src: Batman1,
    alt: "Batman i mörkret över Gotham",
  },
};
/* TODO: Retur för mock data till bild och tagline, ska städas upp senare*/
function getEventMockData(name: string): EventMockData {
  return (
    eventMockData[name.trim().toLowerCase()] ?? {
      tagline: "",
      src: backgroundImage,
      alt: "",
    }
  );
}

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
function EventCard({ event }: { event: EventRow }) {
  const [showMovies, setShowMovies] = useState(false);
  const { data, loading, error } = useFetch<EventShowing[]>(
    `/events/${event.eventId}/showings`,
  );

  const headingId = `event-heading-${event.eventId}`;
  const moviesId = `event-movies-${event.eventId}`;

  const eventDetails = getEventMockData(event.name);
  const paragraphs = parseEventInfo(event.info);
  const { movies, start, end } = groupShowings(data ?? []);

  // Saknas showings används eventets eget datum, och saknas det visas ingen dateRange
  const periodStart = start ?? event.date;
  const periodEnd = end ?? event.date;
  const dateRange =
    periodStart && periodEnd ? formatDatePeriod(periodStart, periodEnd) : null;

  return (
    <article className="event-card" aria-labelledby={headingId}>
      <Row className="g-0">
        <Col lg={5}>
          <div className="event-image-border">
            <img
              className="event-image"
              src={eventDetails.src}
              alt={eventDetails.alt}
              style={
                eventDetails.position
                  ? { objectPosition: eventDetails.position }
                  : undefined
              }
            />
          </div>
        </Col>

        <Col lg={7}>
          <div className="event-content">
            {!loading && dateRange && (
              <p className="event-date-range">{dateRange}</p>
            )}
            <h2 id={headingId} className="event-title">
              {event.name}
            </h2>
            {eventDetails.tagline && (
              <p className="event-tagline">{eventDetails.tagline}</p>
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

  // TODO: filtrera på slutdatum när events tabell byggs om (idag finns bara ett datum).
  // Tills vidare visas aktuella event (current = true), sorterade på datum.
  const upcomingEvents = (data ?? [])
    .filter((e) => e.current)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));

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

        {!loading && !error && upcomingEvents.length === 0 && (
          <p className="event-empty">
            Just nu finns inga kommande event. Titta in igen snart, eller se vad
            som visas idag på startsidan.
          </p>
        )}

        {!loading && !error && upcomingEvents.length > 0 && (
          <ul className="event-list">
            {upcomingEvents.map((event) => (
              <li key={event.eventId}>
                <EventCard event={event} />
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
