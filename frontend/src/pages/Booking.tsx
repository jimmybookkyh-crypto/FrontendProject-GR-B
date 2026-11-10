import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card, Badge, Form, Modal } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
// @ts-ignore Image assets are handled by the bundler; this project lacks image module declarations.
import backgroundImage from "../assets/img/biodukbg.png";
// @ts-ignore CSS is handled by the bundler; this project lacks CSS module declarations.
import "../styles/Booking.css";
import useFetch from "../hooks/useFetch";
import SeatMap from "../components/SeatMap";
import MovieCard from "../components/MovieCard";
import AgeBadge from "../components/AgeBadge";
import TicketCounter from "../components/TicketCounter";
import BackButton from "../components/BackButton";
import { useAuth } from "../utils/authContext";
import { emailError } from "../utils/validateUtil.ts";
import {
  formatDate,
  formatTime,
  calculateTotalPrice,
  getMaxAllowedTickets,
} from "../utils/BookingHelpers";
import type {
  Showing,
  Movie,
  TicketType,
  Seat,
  Booking,
} from "../interface/types";
import useSeatUpdates from "../hooks/useSeatUpdates";
import useBookingDraft from "../hooks/useBookingDraft";
import { loadBookingDraft, saveBookingDraft, clearBookingDraft } from "../utils/bookingDraft.ts";


export default function BookingPage() {
  const navigate = useNavigate();
  // Läs showingId från URL:en (/booking/:showingId)
  const { showingId } = useParams();

  // Hämta den inloggade användaren från AuthContext
  const { user } = useAuth();

  // State för e-post och userId
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  // Förifyll e-post och userId automatiskt när användaren är inloggad
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
    const currentUserId = user?.userId;
    if (currentUserId) {
      setUserId(Number(currentUserId));
    }
  }, [user]);

  // Hämta visningsdetaljer från backend
  const {
    data: showingRaw,
    loading: showingLoading,
    error: showingError,
  } = useFetch<Showing>(showingId ? `/showings/${showingId}` : null);

  const showing = showingRaw;
  const currentMovieId = showing?.movieId;

  // Hämta filmens detaljer (affisch, speltid, åldersgräns m.m.)
  const { data: movie } = useFetch<Movie>(
    currentMovieId ? `/movies/${currentMovieId}` : null,
  );

  // Titeln finns redan i visningen, filmens titel är reserv
  const currentTitle = showing?.movieTitle || movie?.title || "Laddar...";
  const currentImages = movie?.images ?? [];
  const currentDate = formatDate(showing?.date);
  const currentTime = formatTime(showing?.time);

  const currentAuditoriumId = showing?.auditoriumId ?? 0;
  const currentAuditoriumName = showing?.auditoriumName || "Salong";

  // Hämta alla stolar för salongen från /seats
  const {
    data: seatsRaw,
    loading: seatsLoading,
    error: seatsError,
  } = useFetch<Seat[]>(
    currentAuditoriumId ? `/seats?auditoriumId=${currentAuditoriumId}` : null,
  );

  const seats: Seat[] = seatsRaw || [];

  // ANvänder useSeatUpdates för att få realtidsuppdateringar av upptagna stolar via WebSocket
  const occupiedSeats = useSeatUpdates(showingId);

  // Hämta biljetttyper från API:et
  const { data: ticketTypesRaw } = useFetch<TicketType[]>(
    "/tickets/ticketTypes",
  );
  const ticketTypes: TicketType[] = ticketTypesRaw || [
    { ticketTypeId: 1, name: "Vuxen", price: 140 },
    { ticketTypeId: 2, name: "Barn", price: 80 },
    { ticketTypeId: 3, name: "Pensionär", price: 120 },
  ];

  const adultType =
    ticketTypes.find((t) => t.name.toLowerCase().includes("vuxen")) ||
    ticketTypes[0];
  const childType =
    ticketTypes.find((t) => t.name.toLowerCase().includes("barn")) ||
    ticketTypes[1];
  const seniorType =
    ticketTypes.find((t) => t.name.toLowerCase().includes("pensionär")) ||
    ticketTypes[2];

  const adultPrice = adultType?.price ?? 140;
  const childPrice = childType?.price ?? 80;
  const seniorPrice = seniorType?.price ?? 120;

  const draft = showingId
    ? loadBookingDraft(Number(showingId))
    : null;
  
  // State
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>(
    draft?.selectedSeats || []
  );
  const [seatWarning, setSeatWarning] = useState<string | null>(null);
  const seatWarningRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setSelectedSeats((current) => {
      const filtered = current.filter(
        (seat) => !occupiedSeats.includes(Number(seat.seatId))
      );

      if (filtered.length < current.length) {
        setSeatWarning(
          "En eller flera av dina valda platser bokades precis av någon annan. Välj en ny plats. De bästa lediga platserna är markerade."
        );
      }

      return filtered;
    });
  }, [occupiedSeats]);
  const [adultTickets, setAdultTickets] = useState(
    draft?.adultTickets ?? 0
  );
  const [childTickets, setChildTickets] = useState(
    draft?.childTickets ?? 0
  );
  const [seniorTickets, setSeniorTickets] = useState(
    draft?.seniorTickets ?? 0
  );

  useBookingDraft({
    showingId,
    selectedSeats,
    adultTickets,
    childTickets,
    seniorTickets,
  });

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  // Fel som visas direkt vid e-postfältet i modalen
  const [emailFieldError, setEmailFieldError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const totaltTickets = adultTickets + childTickets + seniorTickets;

  useEffect(() => {
    if (
      user &&
      draft?.resumeCheckout &&
      selectedSeats.length > 0 &&
      totaltTickets === selectedSeats.length &&
      !showEmailModal
    ) {
      setShowEmailModal(true);

      saveBookingDraft({
        ...draft,
        resumeCheckout: false,
      });
    }
  }, [
    user,
    draft,
    selectedSeats.length,
    totaltTickets,
    showEmailModal,
  ]);

  useEffect(() => {
    if (!seatWarning) return;

    if (window.innerWidth < 768) {
      seatWarningRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [seatWarning]);
  // Använder calculateTotalPrice från bookingHelpers
  const totalPrice = calculateTotalPrice(
    adultTickets,
    childTickets,
    seniorTickets,
    adultPrice,
    childPrice,
    seniorPrice,
  );

  const handleSeatClick = (seat: Seat) => {
    setSeatWarning(null); // Nollställ varningen när användaren klickar på en stol

    setSelectedSeats((current) =>
      current.some((s) => Number(s.seatId) === Number(seat.seatId))
        ? current.filter((s) => Number(s.seatId) !== Number(seat.seatId))
        : [...current, seat],
    );
  };

  const handleInputChange = (
    value: string,
    setter: (val: number) => void,
    currentVal: number,
  ) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 0) return setter(0);

    // Använder getMaxAllowedTickets från bookingHelpers
    const maxAllowed = getMaxAllowedTickets(
      selectedSeats.length,
      totaltTickets,
      currentVal,
    );
    setter(parsed > maxAllowed ? Math.max(0, maxAllowed) : parsed);
  };

  const adjustTickets = (
    setter: (val: number) => void,
    current: number,
    delta: number,
  ) => {
    const next = current + delta;
    if (next < 0) return setter(0);

    // Använder getMaxAllowedTickets från bookingHelpers
    const maxAllowed = getMaxAllowedTickets(
      selectedSeats.length,
      totaltTickets,
      current,
    );
    setter(Math.min(next, Math.max(0, maxAllowed)));
  };

  // Koppla ihop varje vald stol med motsvarande biljetttyp ID
  const mapSeatsToTickets = () => {
    const mappedTickets: Array<{
      seatId: number;
      ticketTypeId: number;
      price: number;
      seatInfo: string;
    }> = [];
    let seatIndex = 0;

    const adultTypeId = adultType?.ticketTypeId ?? 1;
    const childTypeId = childType?.ticketTypeId ?? 2;
    const seniorTypeId = seniorType?.ticketTypeId ?? 3;

    // Koppla vuxenbiljetter
    for (let i = 0; i < adultTickets; i++) {
      if (selectedSeats[seatIndex]) {
        mappedTickets.push({
          seatId: selectedSeats[seatIndex].seatId,
          ticketTypeId: adultTypeId,
          price: adultPrice,
          seatInfo: `Rad ${selectedSeats[seatIndex].seatsRow}, Stol ${selectedSeats[seatIndex].seatsNumber}`,
        });
        seatIndex++;
      }
    }

    // Koppla barnbiljetter
    for (let i = 0; i < childTickets; i++) {
      if (selectedSeats[seatIndex]) {
        mappedTickets.push({
          seatId: selectedSeats[seatIndex].seatId,
          ticketTypeId: childTypeId,
          price: childPrice,
          seatInfo: `Rad ${selectedSeats[seatIndex].seatsRow}, Stol ${selectedSeats[seatIndex].seatsNumber}`,
        });
        seatIndex++;
      }
    }

    // Koppla pensionärsbiljetter
    for (let i = 0; i < seniorTickets; i++) {
      if (selectedSeats[seatIndex]) {
        mappedTickets.push({
          seatId: selectedSeats[seatIndex].seatId,
          ticketTypeId: seniorTypeId,
          price: seniorPrice,
          seatInfo: `Rad ${selectedSeats[seatIndex].seatsRow}, Stol ${selectedSeats[seatIndex].seatsNumber}`,
        });
        seatIndex++;
      }
    }

    return mappedTickets;
  };

  // Nollställer valda stolar och räknare
  const resetSelection = () => {
    setSelectedSeats([]);
    setAdultTickets(0);
    setChildTickets(0);
    setSeniorTickets(0);
  };

  // POST-anrop för att spara bokningen i databasen
  const handleCheckout = async () => {
    const emailProblem = emailError(email);
    if (emailProblem) {
      setEmailFieldError(emailProblem);
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    const mappedTickets = mapSeatsToTickets();

    const formattedTickets = mappedTickets.map((t) => ({
      seatId: Number(t.seatId),
      ticketTypeId: Number(t.ticketTypeId || 1),
    }));

    // Skickar med userId om användaren är inloggad
    const bookingBody = {
      showingId: Number(showingId),
      email: email,
      userId: userId,
      tickets: formattedTickets,
    };

    try {
      // Skickar med inloggningens token så att backend kopplar bokningen till kontot (T126b).
      // Utan token sparas bokningen som gästbokning och syns inte på Mina sidor.
      const token = localStorage.getItem("token");
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(bookingBody),
      });

      const result: { data?: Booking; error?: { message?: string } } =
        await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          // Nollställ valda stolar och trigga omhämtning av upptagna stolar från backend
          resetSelection();

          throw new Error(
           "Tyvärr hann en eller flera av de valda platserna bokas av någon annan innan bokningen slutfördes.",
          );
        }
        throw new Error(
          result.error?.message || "Kunde inte genomföra bokningen.",
        );
      }

      if (!result.data) {
        throw new Error("Kunde inte genomföra bokningen.");
      }

      setShowEmailModal(false);
      
      resetSelection();

      clearBookingDraft();

      // Biljettypens namn utifrån id, t.ex. 1 -> "Vuxen"
      const ticketTypeName = (id: number) =>
        ticketTypes.find((t) => t.ticketTypeId === id)?.name ?? "Biljett";

      // Navigera till bekräftelsesidan och skicka med bokningen i state.
      // replace: true gör att bakåtknappen inte leder tillbaka till bokningsformuläret.
      navigate("/bookingconfirmation", {
        replace: true,
        state: {
          bookingNumber: result.data.bookingNumber,
          movieId: Number(currentMovieId),
          movieTitle: currentTitle,
          images: currentImages,
          ageRating: movie?.ageRating ?? null,
          date: currentDate,
          time: currentTime,
          auditoriumName: currentAuditoriumName,
          tickets: mappedTickets.map((t) => {
            const seat = selectedSeats.find((s) => s.seatId === t.seatId);
            return {
              seatsRow: seat?.seatsRow ?? 0,
              seatsNumber: seat?.seatsNumber ?? 0,
              ticketTypeName: ticketTypeName(t.ticketTypeId),
              price: Number(t.price),
            };
          }),
        },
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ett fel uppstod vid bokningen.";
      setBookingError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowEmailModal(false);
    setBookingError(null);
    setEmailFieldError(undefined);
  };

  const handleLoginClick = () => {
    if (!showingId) return;

    saveBookingDraft({
      showingId: Number(showingId),
      selectedSeats,
      adultTickets,
      childTickets,
      seniorTickets,
      resumeCheckout: true,
      savedAt: Date.now(),
    });

    navigate("/login", {
      state: {
        from: `/booking/${showingId}`,
      },
    });
  };
  if (showingLoading || seatsLoading) {
    return <div className="text-center text-light p-5">Laddar visning...</div>;
  }

  if (showingError || seatsError) {
    return (
      <div className="text-center text-danger p-5">
        {showingError || seatsError}
      </div>
    );
  }

  // Visningen har redan börjat, t.ex. via en gammal länk eller bakåtknappen (#289).
  // Backend nekar ändå bokningen, men här får besökaren beskedet direkt.
  if (showing?.hasStarted) {
    // Speltid som "1 tim 55 min", samma format som filmsidan
    const lengthText =
      movie?.length != null
        ? movie.length >= 60
          ? `${Math.floor(movie.length / 60)} tim ${movie.length % 60} min`
          : `${movie.length} min`
        : null;

    return (
      <div
        className="booking-page min-vh-100 text-light d-flex align-items-center py-5"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} md={10} lg={8} xl={7}>
              <Card className="glass-card text-center">
                <Card.Body className="p-4 p-md-5">
                  {/* Affisch */}
                  <Row className="justify-content-center mb-4">
                    <Col xs={10} sm={8} md={7}>
                      <MovieCard
                        movieId={currentMovieId || 1}
                        title={currentTitle}
                        images={currentImages}
                        showDetails={false}
                      />
                    </Col>
                  </Row>

                  {/* Filminformation, samma som på filmsidan */}
                  <h1
                    className="text-uppercase mb-1"
                    style={{ fontSize: "clamp(2rem, 3vw, 2.75rem)" }}
                  >
                    {currentTitle}
                  </h1>

                  {movie?.productionyear != null && (
                    <p className="fs-5 mb-3">{movie.productionyear}</p>
                  )}

                  <div className="d-flex justify-content-center align-items-center flex-wrap gap-2 mb-2">
                    <AgeBadge ageRating={movie?.ageRating} />
                    {lengthText && (
                      <Badge bg="secondary" className="p-2 fs-6">
                        {lengthText}
                      </Badge>
                    )}
                  </div>

                  {movie?.genre && (
                    <div className="mb-4">
                      <Badge
                        bg="outline-light"
                        className="border text-white fs-6"
                      >
                        {movie.genre}
                      </Badge>
                    </div>
                  )}

                  <hr className="my-4" />

                  {/* Beskedet */}
                  <h1 className="heading-gold h3 mb-3">
                    Visningen har redan börjat
                  </h1>
                  <p className="fs-5 mb-4">
                    Den här visningen kan inte längre bokas. Välj en annan tid
                    för filmen.
                  </p>

                  <button
                    type="button"
                    className="btn checkout-btn rounded-pill py-2 px-5 fw-bold fs-5"
                    onClick={() =>
                      navigate(
                        currentMovieId ? `/movies/${currentMovieId}` : "/",
                      )
                    }
                  >
                    Välj en annan visning
                  </button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div
      className="booking-page min-vh-100 text-light"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Utan to/onClick går BackButton ett steg bakåt i historiken */}
      <BackButton className="btn checkout-btn rounded-pill py-2 px-4 fw-bold m-3" />

      <h1 className="h4 fw-bold text-center mb-4 heading-gold">
        BOKA BILJETTER
      </h1>

      <Container className="pb-5">
        <Row className="justify-content-center mb-4">
          <Col xs={12} lg={8} xl={8}>
            <Card className="glass-card wider-card">
              <Card.Body className="p-3 p-md-4">
                <Row className="align-items-center g-3 g-md-4">
                  <Col xs={5} md={4} className="text-center">
                    {showing && (
                      <MovieCard
                        movieId={currentMovieId || 1}
                        title={currentTitle}
                        images={currentImages}
                        ageRating={movie?.ageRating}
                        showDetails={false}
                      />
                    )}
                  </Col>

                  <Col xs={7} md={8}>
                    <div className="film-krediter mt-1">
                      <h3 className="h1 fw-bold mb-3">{currentTitle}</h3>
                      <div className="mb-1">
                        <strong className="text-white">Datum: </strong>{" "}
                        {currentDate}
                      </div>
                      <div className="mb-1">
                        <strong className="text-white">Tid: </strong>{" "}
                        {currentTime}
                      </div>
                      <div className="mb-1">
                        <strong className="text-white">Salong: </strong>{" "}
                        {currentAuditoriumName}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4 justify-content-center align-items-stretch">
          <Col xs={12} md={7} lg={8} className="d-flex">
            <Card className="glass-card overflow-x-auto w-100">
              <Card.Body className="p-3 p-md-4">
                {seatWarning && (
                  <div
                    ref={seatWarningRef}
                    className="alert alert-warning mb-3"
                  >
                    {seatWarning}
                  </div>
                )}
                <p
                  className="mb-3"
                  style={{
                    fontSize: "0.9rem",
                    color: "rgba(245, 247, 250, 0.8)",
                  }}
                >
                  Välj dina platser genom att klicka på stolarna
                </p>
                <SeatMap
                  auditoriumName={currentAuditoriumName}
                  seats={seats}
                  occupiedSeats={occupiedSeats}
                  selectedSeats={selectedSeats}
                  onSeatClick={handleSeatClick}
                />
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} md={5} lg={4} className="d-flex">
            <Card className="glass-card w-100">
              <Card.Body className="p-3 p-md-4">
                <h3 className="h5 fw-bold text-center heading-gold mb-4">
                  BILJETTER
                </h3>

                <TicketCounter
                  label={adultType?.name || "Vuxen"}
                  description="Från 12 år"
                  price={adultPrice}
                  count={adultTickets}
                  onDecrease={() =>
                    adjustTickets(setAdultTickets, adultTickets, -1)
                  }
                  onIncrease={() =>
                    adjustTickets(setAdultTickets, adultTickets, 1)
                  }
                  onChange={(value) =>
                    handleInputChange(value, setAdultTickets, adultTickets)
                  }
                />
                <TicketCounter
                  label={childType?.name || "Barn"}
                  description="Till 11 år"
                  price={childPrice}
                  count={childTickets}
                  onDecrease={() =>
                    adjustTickets(setChildTickets, childTickets, -1)
                  }
                  onIncrease={() =>
                    adjustTickets(setChildTickets, childTickets, 1)
                  }
                  onChange={(value) =>
                    handleInputChange(value, setChildTickets, childTickets)
                  }
                />
                <TicketCounter
                  label={seniorType?.name || "Pensionär"}
                  description="Från 65 år"
                  price={seniorPrice}
                  count={seniorTickets}
                  onDecrease={() =>
                    adjustTickets(setSeniorTickets, seniorTickets, -1)
                  }
                  onIncrease={() =>
                    adjustTickets(setSeniorTickets, seniorTickets, 1)
                  }
                  onChange={(value) =>
                    handleInputChange(value, setSeniorTickets, seniorTickets)
                  }
                />

                <div className="mb-3">
                  <p className="mb-1 fw-bold">
                    Valda platser ({selectedSeats.length}):
                  </p>
                  {selectedSeats.length > 0 ? (
                    <ul className="list-unstyled small mb-0 ps-2">
                      {selectedSeats.map((seat) => (
                        <li key={seat.seatId}>
                          Rad {seat.seatsRow}, Stol {seat.seatsNumber}
                        </li>
                      ))}
                    </ul>
                  ) : (
                      <p
                        className="mb-0"
                        style={{
                          fontSize: "0.8rem",
                          color: "rgba(245, 247, 250, 0.7)",
                        }}
                      >
                        Inga valda
                      </p>
                  )}
                </div>

                <p className="mb-3">Antal biljetter: {totaltTickets}</p>
                <hr className="border-secondary" />
                <h4 className="h5 mb-3">Total: {totalPrice} kr</h4>

                <button
                  type="button"
                  className="btn checkout-btn rounded-pill py-2 px-4 fw-bold w-100"
                  disabled={
                    selectedSeats.length === 0 ||
                    totaltTickets !== selectedSeats.length
                  }
                  onClick={() => setShowEmailModal(true)}
                >
                  Boka
                </button>

                <Modal show={showEmailModal} onHide={handleCloseModal} centered>
                  <Modal.Header closeButton>
                    <Modal.Title className="text-dark">
                      Bekräfta e-post
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    {bookingError && (
                      <div className="alert alert-danger mb-3" role="alert">
                        {bookingError}
                      </div>
                    )}
                    <Form.Group controlId="bookingEmail">
                      <Form.Label className="text-dark d-flex align-items-center gap-2">
                        E-postadress
                        {user && (
                          <span className="badge bg-success">Inloggad</span>
                        )}
                      </Form.Label>
                      <Form.Control
                        size="lg"
                        type="email"
                        autoComplete="email"
                        placeholder="din.epost@example.se"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailFieldError(undefined);
                        }}
                        isInvalid={!!emailFieldError}
                        disabled={isSubmitting || !!user} // Inaktiverar ändring om inloggad
                      />
                      <Form.Control.Feedback type="invalid">
                        {emailFieldError}
                      </Form.Control.Feedback>
                      {user && (
                        <Form.Text className="text-muted">
                          Bokningsbekräftelsen kopplas till ditt konto (
                          {user.email}).
                        </Form.Text>
                      )}
                    </Form.Group>

                    {!user && (
                      <Form.Text className="d-block mt-3">
                        Har du redan ett konto?{" "}
                        <button
                          type="button"
                          className="btn btn-link p-0 align-baseline"
                          onClick={handleLoginClick}
                        >
                          Logga in
                        </button>
                      </Form.Text>
                    )}
                  </Modal.Body>
                  <Modal.Footer>
                    <button
                      type="button"
                      className="cta-btn checkout-btn fw-bold py-2 px-4"
                      onClick={handleCheckout}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Bokar..." : "SLUTFÖR BOKNING"}
                    </button>
                  </Modal.Footer>
                </Modal>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

BookingPage.route = {
  path: "/booking/:showingId",
  order: 3,
  label: "Bokningssida",
};
