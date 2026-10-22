import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { Container, Col, Row, Ratio, Card, Button, Badge,} from "react-bootstrap";
import backgroundImage from "../assets/img/biodukbg.png";
import "../styles/MoviesDetails.css";
import useFetch from "../hooks/useFetch";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import Trailer from "../components/Trailer";
import Datumremsa from "../components/Datumremsa";
import { giltigtDatum, langtDatum } from "../utils/datum";
import BackButton from "../components/backButton"

/* TODO - TILLFÄLLIGA typer tills interface/types.ts är klar.
   Fälten heter som i backend (backend/interface/types.ts och databasen).
   Ersätt med: import type { Movie, Showing } from "../interface/types"; */
type Movie = {
  movieId: string;
  title: string;
  productionyear: number | null;
  length: number | null; // minuter
  genre: string | null;
  director: string | null;
  actors: string[] | null;
  description: string | null;
  youtubetrailers: string[] | null; // YouTube-id,
  ageRating: number | null;
};

/* Så ser en visning ut i svaret från GET /showings (se backend/routes/showings.ts) */
type Showing = {
  showingId: string;
  date: string; // "2026-10-26"
  time: string; // "18:00"
  movieId: number;
  movieTitle: string;
  auditoriumId: string;
  auditoriumName: string;
  eventId: number | null;
};

export default function MovieDetails() {
  const navigate = useNavigate();
  const { id } = useParams(); // id från adressen, t.ex. /moviedetails/moviecatalog/3
  const [searchParams] = useSearchParams();
  // Datumet följer med från startsidan (?datum=2026-10-26). Annars börjar vi på idag.
  const [valtDatum, setValtDatum] = useState(
    giltigtDatum(searchParams.get("datum")),
  );

  // hämtar filmen. null = vänta tills id finns i adressen
  const {
    data: film,
    loading,
    error,
  } = useFetch<Movie>(id ? `/movies/${id}` : null);

  return (
    <div
      className="film-sida min-vh-100 w-100"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <BackButton to="/" />  { /*component/backButton.tsx*/}
      
      <Container className="pb-5">
        {/* gemensam laddning och felruta */}
        {loading && <LoadingSpinner text="Hämtar film…" />}
        {error && <ErrorMessage message={error} />}

        {film && (
          <Row className="g-4 justify-content-center">
            <Col lg={7} md={12}>
              <Trailer
                youtubeId={film.youtubetrailers?.[0]}
                title={film.title}
              />
              <FilmInfo film={film} />
            </Col>
            <Col lg={5} md={12}>
              <SlotSelection movieId={film.movieId} />
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}

/* 119 -> "1 tim 59 min" */
function formateraLangd(minuter: number): string {
  const tim = Math.floor(minuter / 60);
  const min = minuter % 60;
  return tim > 0 ? `${tim} tim ${min} min` : `${min} min`;
}

/* visar filmens information från databasen */
function FilmInfo({ film }: { film: Movie }) {
  return (
    <Card className="mb-0 glass-card film-info">
      <Card.Body className="p-4 p-xl-5">
        <Card.Title as="h1" className="mb-2">
          {film.title}
        </Card.Title>
        {film.productionyear !== null && (
          <Card.Subtitle className="film-original mb-3">
            {film.productionyear}
          </Card.Subtitle>
        )}

        {/* Åldersgräns och längd */}
        <div className="d-flex gap-2 mb-2">
          {film.ageRating !== null && (
            <Badge bg="danger" className="p-2">
              {film.ageRating === 0 ? "Barntillåten" : `${film.ageRating} år`}
            </Badge>
          )}
          {film.length !== null && (
            <Badge bg="secondary" className="p-2">
              {formateraLangd(film.length)}
            </Badge>
          )}
        </div>

        {/* Genre */}
        {film.genre && (
          <div className="mb-3">
            <Badge bg="outline-light" className="border text-white me-1">
              {film.genre}
            </Badge>
          </div>
        )}

        <hr className="border-secondary my-3" />

        {film.description && (
          <p className="film-beskrivning mb-4">{film.description}</p>
        )}

        <hr className="border-secondary my-3" />

        {/* Filminformation */}
        <div className="film-krediter mt-1">
          {film.director && (
            <div className="mb-1">
              <strong className="text-white">Regissör:</strong> {film.director}
            </div>
          )}
          {film.actors && film.actors.length > 0 && (
            <div>
              <strong className="text-white">Skådespelare:</strong>{" "}
              {film.actors.join(", ")}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

/* Visar vilket datum som är valt */
function ThisDate({ datum }: { datum: string }) {
  return (
    <Card className="mb-4 glass-card">
      <Card.Body className="py-3">
        <Card.Subtitle className="valt-datum small text-uppercase mb-1 d-flex justify-content-center">
          Valt datum
        </Card.Subtitle>
        <Card.Title
          as="h3"
          className="datum-vit mb-0 fw-bold fs-4 d-flex justify-content-center"
        >
          {langtDatum(datum)}
        </Card.Title>
      </Card.Body>
    </Card>
  );
}

/* Visningarna för filmen det valda datumet */
function SlotSelection({ movieId, datum }: { movieId: string; datum: string }) {
  const navigate = useNavigate();

  // API:t filtrerar på datum och film, sorterar på tid och skickar med salongens namn
  const {
    data: visningar,
    loading,
    error,
  } = useFetch<Showing[]>(`/showings?date=${datum}&movieId=${movieId}`);

  return (
    <Card className="glass-card">
      <Card.Body className="p-4">
        <Card.Title as="h3" className="mb-4 fs-5 d-flex justify-content-center">
          Välj visningstid
        </Card.Title>

        {loading && <LoadingSpinner text="Hämtar visningar…" />}
        {error && <ErrorMessage message={error} />}

        {visningar && visningar.length === 0 && (
          <p className="text-center mb-0">Inga visningar detta datum</p>
        )}

        {visningar && visningar.length > 0 && (
          <div className="d-grid gap-3 w-75 mx-auto">
            {visningar.map((visning) => (
              <Button
                key={visning.showingId}
                size="lg"
                className="tid-knapp rounded-pill py-2 px-4 fw-bold d-flex justify-content-between align-items-center"
                // Bokningssidan läser showingId i bokningstasken
                onClick={() =>
                  navigate("/booking", {
                    state: { showingId: visning.showingId },
                  })
                }
              >
                <span>{visning.auditoriumName}</span>
                <span>kl {visning.time}</span>
              </Button>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}



MovieDetails.route = {
  path: "/moviedetails/moviecatalog/:id",
  order: 1,
  label: "Film detaljer",
};
