import { useNavigate, useParams } from "react-router";
import { Container, Col, Row, Card, Button, Badge } from "react-bootstrap";
import backgroundImage from "../assets/img/biodukbg.png";
import "../styles/MoviesDetails.css";
import useFetch from "../hooks/useFetch";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import Trailer from "../components/Trailer";

/* TODO - TILLFÄLLIGA typer tills interface/types.ts är klar.
   Fälten heter som i backend (backend/interface/types.ts och databasen).
   Ersätt med: import type { Movie, Showing, Auditorium } from "../interface/types"; */
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

type Showing = {
  showingId: string;
  movieId: number;
  auditoriumId: string;
  date: string; // t.ex. "2026-10-22T22:00:00.000Z"
  time: string; // t.ex. "16:00:00+00"
};

type Auditorium = {
  auditoriumId: string;
  name: string;
};

export default function MovieDetails() {
  const navigate = useNavigate();
  const { id } = useParams(); // id från adressen, t.ex. /moviedetails/moviecatalog/3

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
      <button
        type="button"
        onClick={() => navigate("/moviecatalog")}
        className="btn tillbaka-knapp rounded-pill py-2 px-4 fw-bold m-3"
      >
        ← Tillbaka
      </button>

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

/* "2026-10-22T22:00:00.000Z" -> "torsdag 23 oktober" (svensk tid) */
function formateraDatum(datum: string): string {
  return new Date(datum).toLocaleDateString("sv-SE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/* visningar för filmen, grupperade per datum */
function SlotSelection({ movieId }: { movieId: string }) {
  const navigate = useNavigate();

  // /showings kan inte filtrera på film än, så vi hämtar max (100) och filtrerar här
  const {
    data: visningar,
    loading,
    error,
  } = useFetch<Showing[]>("/showings?limit=100");
  // Salongernas namn, så att det står "Stora Salongen" i stället för ett id
  const { data: salonger } = useFetch<Auditorium[]>("/auditorium");

  const filmensVisningar = (visningar ?? [])
    .filter((v) => String(v.movieId) === movieId)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  // Grupperar visningarna per datum: { "torsdag 23 oktober": [visning, visning] }
  const perDatum = new Map<string, Showing[]>();
  for (const visning of filmensVisningar) {
    const datum = formateraDatum(visning.date);
    perDatum.set(datum, [...(perDatum.get(datum) ?? []), visning]);
  }

  function salongsNamn(auditoriumId: string): string {
    return (
      salonger?.find((s) => s.auditoriumId === auditoriumId)?.name ??
      `Salong ${auditoriumId}`
    );
  }

  return (
    <Card className="glass-card">
      <Card.Body className="p-4">
        <Card.Title as="h3" className="mb-4 fs-5 d-flex justify-content-center">
          Välj visningstid
        </Card.Title>

        {loading && <LoadingSpinner text="Hämtar visningar…" />}
        {error && <ErrorMessage message={error} />}

        {visningar && filmensVisningar.length === 0 && (
          <p className="text-center">Inga visningar inlagda för filmen ännu.</p>
        )}

        {[...perDatum].map(([datum, dagensVisningar]) => (
          <div key={datum} className="mb-4">
            <p className="valt-datum small text-uppercase mb-2 text-center">
              {datum}
            </p>

            <div className="d-grid gap-3 w-75 mx-auto">
              {dagensVisningar.map((visning) => (
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
                  <span>{salongsNamn(visning.auditoriumId)}</span>
                  <span>kl {visning.time.slice(0, 5)}</span>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </Card.Body>
    </Card>
  );
}

MovieDetails.route = {
  path: "/moviedetails/moviecatalog/:id",
  order: 1,
  label: "Film detaljer",
};
