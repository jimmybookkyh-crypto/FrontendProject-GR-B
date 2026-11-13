import { useNavigate, useParams, useSearchParams } from "react-router";
import { Container, Col, Row, Card, Badge } from "react-bootstrap";
import backgroundImage from "../assets/img/biodukbg.webp";
import "../styles/Start.css"; // stilen för Datumremsan (.datumremsa, .filter-knapp)
import "../styles/MoviesDetails.css";
import useFetch from "../hooks/useFetch";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import Trailer from "../components/Trailer";
import Datumremsa from "../components/Datumremsa";
import SlotButton from "../components/slotButton";
import BackButton from "../components/BackButton";
import AgeBadge from "../components/AgeBadge";
import { validDate, langtDatum, plusDagar } from "../utils/date";
import type { Movie, Showing } from "../interface/types";
import { useEffect } from "react";
import { paths, routes } from "../utils/paths.ts";

export default function MovieDetails() {
  const navigate = useNavigate();
  const { id } = useParams(); // id från adressen, t.ex. /filmer/3
  const [searchParams, setSearchParams] = useSearchParams();

  // Kontrollera om användaren kommer från Filmkatalogen
  const fromCatalog = searchParams.get("fran") === "katalog";

  // TODO: Valt datum ligger i adressen (/filmer/3?datum=2026-10-26), så det finns kvar
  // vid omladdning och när man går tillbaka från bokningen. Saknas det = idag.
  // OBS: adressparametern heter fortfarande "datum" så att befintliga länkar fungerar.
  const selectedDate = validDate(searchParams.get("datum"));

  function changeDate(date: string) {
    // Behåll fran=katalog när användaren byter datum
    setSearchParams(
      fromCatalog ? { fran: "katalog", datum: date } : { datum: date },
      { replace: true },
    );
  }

  function goBack() {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate(paths.movies);
    }
  }

  const {
    data: movie,
    loading,
    error,
  } = useFetch<Movie>(id ? `/movies/${id}` : null);

  const {
    data: movieShowings,
    loading: showingsLoading,
    error: showingsError,
  } = useFetch<Showing[]>(id ? `/showings?movieId=${id}` : null);

  const today = plusDagar(0);

  // Alla framtida datum då filmen har visningar
  const allUpcomingShowings = movieShowings
    ? [
        ...new Set(
          movieShowings
            .filter((showing) => showing.date >= today)
            .map((showing) => showing.date),
        ),
      ].sort()
    : [];

  // De sju första datumen visas som knappar
  const firstSevenShowings = allUpcomingShowings.slice(0, 7);

  // Behåll valt datum om det finns bland alla framtida visningsdatum.
  const firstAvailableShowing = selectedDate;

  useEffect(() => {
    if (showingsLoading || !movieShowings) return;

    // Sätt ett standarddatum endast om inget datum finns i URL:en.
    if (!searchParams.has("datum") && allUpcomingShowings.length > 0) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("datum", allUpcomingShowings[0]);
          return next;
        },
        { replace: true },
      );
    }
  }, [
    showingsLoading,
    movieShowings,
    searchParams,
    allUpcomingShowings,
    setSearchParams,
  ]);

  return (
    <div
      className="film-sida min-vh-100 w-100"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <BackButton onClick={goBack} /> {/* components/BackButton.tsx */}
      <Container className="pb-5">
        {loading && <LoadingSpinner text="Hämtar film…" />}
        {error && <ErrorMessage message={error} />}

        {movie && (
          <div className="film-stack d-flex flex-column gap-3">
            {/* Laddning av filmens visningar */}
            {showingsLoading && <LoadingSpinner text="Hämtar visningar…" />}

            {/* Fel vid hämtning av visningar */}
            {showingsError && <ErrorMessage message={showingsError} />}

            {/* Filmen saknar kommande visningar */}
            {!showingsLoading &&
              !showingsError &&
              movieShowings &&
              firstSevenShowings.length === 0 && (
                <p className="text-center text-white">
                  Filmen har inga kommande visningar just nu.
                </p>
              )}

            {/* Visa datumremsa och visningstider när visningarna har hämtats */}
            {!showingsLoading &&
              !showingsError &&
              firstSevenShowings.length > 0 && (
                <>
                  <Datumremsa
                    valtDatum={firstAvailableShowing}
                    dateList={firstSevenShowings}
                    onByt={changeDate}
                  />

                  <ShowingsBox
                    movieId={movie.movieId}
                    date={firstAvailableShowing}
                  />
                </>
              )}

            <Trailer
              youtubeId={movie.youtubetrailers?.[0]}
              title={movie.title}
            />
            <MovieInfo movie={movie} />
          </div>
        )}
      </Container>
    </div>
  );
}

function formatLength(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours} tim ${minutes} min` : `${minutes} min`;
}

function MovieInfo({ movie }: { movie: Movie }) {
  return (
    <Card className="glass-card film-info">
      <Card.Body className="px-3 px-md-4 py-3">
        <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-md-start gap-2 gap-md-4">
          <div>
            <Card.Title as="h1" className="mb-1">
              {movie.title}
            </Card.Title>
            {movie.productionyear !== null && (
              <Card.Subtitle className="film-original">
                {movie.productionyear}
              </Card.Subtitle>
            )}
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <AgeBadge ageRating={movie.ageRating} />
            {movie.length !== null && (
              <Badge bg="secondary" className="p-2">
                {formatLength(movie.length)}
              </Badge>
            )}
            {movie.genre && (
              <Badge bg="outline-light" className="border text-white p-2">
                {movie.genre}
              </Badge>
            )}
          </div>
        </div>

        <hr className="border-secondary my-3" />

        <Row className="g-3 g-lg-4">
          <Col md={7} lg={8}>
            {movie.description && (
              <div className="film-beskrivning">
                {movie.description.split(/\n\s*\n/).map((paragraph, index) => (
                  <p key={index}>{paragraph.trim()}</p>
                ))}
              </div>
            )}
          </Col>
          <Col md={5} lg={4}>
            <div className="film-krediter">
              {movie.director && (
                <div className="mb-1">
                  <strong>Regissör:</strong> {movie.director}
                </div>
              )}
              {movie.actors && movie.actors.length > 0 && (
                <div className="mb-1">
                  <strong>Skådespelare:</strong> {movie.actors.join(", ")}
                </div>
              )}
              {movie.language && (
                <div className="mb-1">
                  <strong>Språk:</strong> {movie.language}
                </div>
              )}
              {movie.subtitles && (
                <div className="mb-1">
                  <strong>Undertext:</strong> {movie.subtitles}
                </div>
              )}
              {Array.isArray(movie.productioncountries) &&
                movie.productioncountries.length > 0 && (
                  <div className="mb-1">
                    <strong>Land:</strong>{" "}
                    {movie.productioncountries.join(", ")}
                  </div>
                )}
              {movie.distributor && (
                <div>
                  <strong>Distributör:</strong> {movie.distributor}
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

function ShowingsBox({
  movieId,
  date,
}: {
  movieId: string | number;
  date: string;
}) {
  const navigate = useNavigate();

  const {
    data: showings,
    loading,
    error,
  } = useFetch<Showing[]>(`/showings?date=${date}&movieId=${String(movieId)}`);

  const upcomingShowings = showings
    ? showings.filter((showing) => !showing.hasStarted)
    : null;

  const allHaveStarted =
    showings !== null &&
    showings.length > 0 &&
    upcomingShowings !== null &&
    upcomingShowings.length === 0;

  return (
    <Card className="glass-card visningar-ruta">
      <Card.Body className="px-3 px-md-4 py-3">
        <Card.Title as="h2" className="visningar-rubrik text-center mb-3">
          Välj visningstid
        </Card.Title>

        <div className="visningar-rad d-flex flex-column flex-md-row align-items-center gap-3 gap-md-4">
          <div className="visningar-datum text-center text-md-start">
            <div className="valt-datum small text-uppercase">Valt datum</div>
            <div className="datum-vit fw-bold fs-4">{langtDatum(date)}</div>
          </div>

          <div className="visningar-tider flex-grow-1 w-100">
            {loading && <LoadingSpinner text="Hämtar visningar…" />}
            {error && <ErrorMessage message={error} />}

            {showings && showings.length === 0 && (
              <p className="mb-0 text-center text-md-start">
                Inga visningar detta datum
              </p>
            )}

            {allHaveStarted && (
              <p className="mb-0 text-center text-md-start">
                Inga fler visningar idag
              </p>
            )}

            {upcomingShowings && upcomingShowings.length > 0 && (
              <div className="d-grid d-md-flex flex-md-wrap gap-2">
                {upcomingShowings.map((showing) => (
                  <SlotButton
                    key={showing.showingId}
                    auditoriumName={showing.auditoriumName}
                    time={showing.time}
                    onClick={() => navigate(paths.booking(showing.showingId))}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

MovieDetails.route = {
  path: routes.movie,
  order: 1,
  label: "Filmdetaljer",
};
