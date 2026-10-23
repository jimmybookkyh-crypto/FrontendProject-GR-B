import { useState, useEffect } from "react";
import { Container, Row, Col, Card, InputGroup, Form, Modal } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import backgroundImage from "../assets/img/biodukbg.png";
import "../styles/Booking.css";
import useFetch from "../hooks/useFetch";
import SeatMap, { Seat } from "../components/SeatMap";
import MovieCard from "../components/MovieCard";
import { useAuth } from "../utils/authContext";
import {formatDate, formatTime, calculateTotalPrice, getMaxAllowedTickets,} from "../utils/bookingHelpers";

interface Showing {
  showingId: number;
  movieId?: number;
  movie_id?: number;
  movieTitle?: string;
  movie_title?: string;
  title?: string;
  posterUrl?: string;
  poster_url?: string;
  images?: string | string[];
  date?: string;
  time?: string;
  auditoriumId?: number;
  auditorium_id?: number;
  auditoriumName?: string;
  auditorium_name?: string;
}

interface Movie {
  movieId: number;
  title: string;
  images?: string | string[];
  posterUrl?: string;
  poster_url?: string;
}

interface TicketType {
  ticketTypeId?: number;
  ticket_type_id?: number;
  id?: number;
  name: string;
  price: number;
}

export default function BookingPage() {
  const navigate = useNavigate();
  // Läs showingId från URL:en (/booking/:showingId)
  const { showingId } = useParams();

  // Hämta den inloggade användaren från AuthContext
  const { user } = useAuth();

  // State för att tvinga omhämtning av upptagna stolar
  const [seatRefreshKey, setSeatRefreshKey] = useState(0);

  // State för e-post och userId
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  // Förifyll e-post och userId automatiskt när användaren är inloggad
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
    const currentUserId = user?.id ?? user?.userId;
    if (currentUserId) {
      setUserId(Number(currentUserId));
    }
  }, [user]);

  // Hämta visningsdetaljer från backend
  const { data: showingRaw, loading: showingLoading, error: showingError } =
    useFetch<any>(showingId ? `/showings/${showingId}` : null);

  const showing: Showing | undefined = showingRaw?.data || showingRaw;
  const currentMovieId = showing?.movieId ?? showing?.movie_id;

  // Hämta filmens detaljer om visningen saknar JOIN med movies
  const { data: movieRaw } = useFetch<any>(
    currentMovieId ? `/movies/${currentMovieId}` : null
  );
  const movie: Movie | undefined = movieRaw?.data || movieRaw;

  // Säkerställt att rätt titel och bild väljs för den aktuella filmen
  const currentTitle =
    showing?.movieTitle ||
    showing?.movie_title ||
    showing?.title ||
    movie?.title ||
    "Laddar...";

  const rawImage =
    showing?.posterUrl ||
    showing?.poster_url ||
    showing?.images ||
    movie?.posterUrl ||
    movie?.poster_url ||
    movie?.images ||
    "/src/assets/img/ph.png";

  const currentImages = typeof rawImage === "string" ? [rawImage] : rawImage;
  const currentDate = formatDate(showing?.date);
  const currentTime = formatTime(showing?.time);

  // Konvertera alltid ID:t till ett siffervärde med Number()
  const currentAuditoriumId = Number(
    showing?.auditoriumId ?? showing?.auditorium_id ?? 0
  );

  const getAuditoriumName = (id?: number) => {
    if (id === 1) return "Stora Salongen";
    if (id === 2) return "Lilla Salongen";

    // Om backend skickar med namnet direkt i objektet (t.ex. från JOIN)
    if (showing?.auditoriumName) return showing.auditoriumName;
    if (showing?.auditorium_name) return showing.auditorium_name;

    return "Salong";
  };
  const currentAuditoriumName =
    showing?.auditoriumName ||
    showing?.auditorium_name ||
    getAuditoriumName(currentAuditoriumId);

  // Hämta alla stolar för salongen från /seats och normalisera fälten
  const { data: seatsRaw, loading: seatsLoading, error: seatsError } =
    useFetch<any>(currentAuditoriumId ? `/seats?auditoriumId=${currentAuditoriumId}` : null);

  const rawSeatsList = seatsRaw?.data || seatsRaw || [];
  const seats: Seat[] = Array.isArray(rawSeatsList)
    ? rawSeatsList.map((s: any) => ({
      seatId: Number(s.seatId ?? s.seat_id),
      seatsRow: Number(s.seatsRow ?? s.seats_row ?? s.row),
      seatsNumber: Number(s.seatsNumber ?? s.seats_number ?? s.number),
      auditoriumId: Number(s.auditoriumId ?? s.auditorium_id),
    }))
    : [];

  // Hämta upptagna stolar för den aktuella visningen (inkluderar seatRefreshKey för automatisk reload)
  const { data: occupiedSeatsRaw } = useFetch<any>(
    showingId ? `/showings/${showingId}/seats?refresh=${seatRefreshKey}` : null
  );

  const rawList = occupiedSeatsRaw?.data || occupiedSeatsRaw || [];

  // Säkerställer att alla upptagna stolar konverteras till rena NUMMER
  const occupiedSeats: number[] = Array.isArray(rawList)
    ? rawList
      .map((item: any) => {
        if (typeof item === "object" && item !== null) {
          return Number(item.seatId ?? item.seat_id);
        }
        return Number(item);
      })
      .filter((id) => !isNaN(id) && id > 0)
    : [];

  // Hämta biljetttyper från API:et
  const { data: ticketTypesRaw } = useFetch<any>("/tickets/ticketTypes");
  const ticketTypes: TicketType[] = ticketTypesRaw?.data || ticketTypesRaw || [
    { ticketTypeId: 1, name: "Vuxen", price: 140 },
    { ticketTypeId: 2, name: "Barn", price: 80 },
    { ticketTypeId: 3, name: "Pensionär", price: 120 },
  ];

  const adultType = ticketTypes.find((t) => t.name.toLowerCase().includes("vuxen")) || ticketTypes[0];
  const childType = ticketTypes.find((t) => t.name.toLowerCase().includes("barn")) || ticketTypes[1];
  const seniorType = ticketTypes.find((t) => t.name.toLowerCase().includes("pensionär")) || ticketTypes[2];

  const adultPrice = adultType?.price ?? 140;
  const childPrice = childType?.price ?? 80;
  const seniorPrice = seniorType?.price ?? 120;

  // State
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [adultTickets, setAdultTickets] = useState(0);
  const [childTickets, setChildTickets] = useState(0);
  const [seniorTickets, setSeniorTickets] = useState(0);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totaltTickets = adultTickets + childTickets + seniorTickets;

  // Använder calculateTotalPrice från bookingHelpers
  const totalPrice = calculateTotalPrice(
    adultTickets,
    childTickets,
    seniorTickets,
    adultPrice,
    childPrice,
    seniorPrice
  );

  const handleSeatClick = (seat: Seat) => {
    setSelectedSeats((current) =>
      current.some((s) => Number(s.seatId) === Number(seat.seatId))
        ? current.filter((s) => Number(s.seatId) !== Number(seat.seatId))
        : [...current, seat]
    );
  };

  const handleInputChange = (value: string, setter: (val: number) => void, currentVal: number) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 0) return setter(0);

    // Använder getMaxAllowedTickets från bookingHelpers
    const maxAllowed = getMaxAllowedTickets(selectedSeats.length, totaltTickets, currentVal);
    setter(parsed > maxAllowed ? Math.max(0, maxAllowed) : parsed);
  };

  const adjustTickets = (setter: (val: number) => void, current: number, delta: number) => {
    const next = current + delta;
    if (next < 0) return setter(0);

    // Använder getMaxAllowedTickets från bookingHelpers
    const maxAllowed = getMaxAllowedTickets(selectedSeats.length, totaltTickets, current);
    setter(Math.min(next, Math.max(0, maxAllowed)));
  };

  // Koppla ihop varje vald stol med motsvarande biljetttyp ID
  const mapSeatsToTickets = () => {
    const mappedTickets: Array<{ seatId: number; ticketTypeId: number; price: number; seatInfo: string; }> = [];
    let seatIndex = 0;

    const adultTypeId = Number(adultType?.ticketTypeId || adultType?.ticket_type_id || adultType?.id || 1);
    const childTypeId = Number(childType?.ticketTypeId || childType?.ticket_type_id || childType?.id || 2);
    const seniorTypeId = Number(seniorType?.ticketTypeId || seniorType?.ticket_type_id || seniorType?.id || 3);

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
    if (!email || !email.includes("@")) {
      setBookingError("Vänligen ange en giltig e-postadress.");
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
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingBody),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          // Nollställ valda stolar och trigga omhämtning av upptagna stolar från backend
          resetSelection();
          setSeatRefreshKey((prev) => prev + 1);

          throw new Error(
            "Tyvärr hann någon annan boka en eller flera av de valda stolarna. Kartan har uppdaterats med de senaste lediga platserna."
          );
        }
        throw new Error(
          result.error?.message || "Kunde inte genomföra bokningen."
        );
      }

      setShowEmailModal(false);

      // Navigera till bekräftelsesidan
      navigate("/bookingconfirmation", {
        state: {
          bookingId: result.data?.bookingId || result.bookingId,
          movieTitle: currentTitle,
          date: currentDate,
          time: currentTime,
          auditoriumName: currentAuditoriumName,
          seats: selectedSeats,
          ticketsPayload: mappedTickets,
          totalPrice,
          email,
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
    // Triggar omhämtning av stolarna när modalen stängs
    setSeatRefreshKey((prev) => prev + 1);
  };

  if (showingLoading || seatsLoading) {
    return <div className="text-center text-light p-5">Laddar visning...</div>;
  }

  if (showingError || seatsError) {
    return <div className="text-center text-danger p-5">{showingError || seatsError}</div>;
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
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="btn checkout-btn rounded-pill py-2 px-4 fw-bold m-3"
      >
        ← Tillbaka
      </button>

      <h1 className="h4 fw-bold text-center mb-4 heading-gold">BOKA BILJETTER</h1>

      <Container className="pb-5">
        <Row className="justify-content-center mb-4">
          <Col xs={12} lg={8} xl={7}>
            <Card className="glass-card">
              <Card.Body className="p-3 p-md-4">
                <Row className="align-items-center g-3 g-md-4">
                  <Col xs={5} md={4} className="text-center">
                    {showing && (
                      <MovieCard
                        movieId={currentMovieId || 1}
                        title={currentTitle}
                        images={currentImages}
                        showDetails={false}
                      />
                    )}
                  </Col>

                  <Col xs={7} md={8}>
                    <h2 className="h5 fw-bold mb-3">{currentTitle}</h2>
                    <p className="mb-1">Datum: {currentDate}</p>
                    <p className="mb-1">Tid: {currentTime}</p>
                    <p className="mb-0">Salong: {currentAuditoriumName}</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4 justify-content-center align-items-start">
          <Col xs={12} lg={7}>
            <Card className="glass-card overflow-x-auto">
              <Card.Body className="p-3 p-md-4">
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

          <Col xs={12} lg={5}>
            <Card className="glass-card">
              <Card.Body className="p-3 p-md-4">
                <h3 className="h5 fw-bold text-center heading-gold mb-4">BILJETTER</h3>

                {/* Vuxen */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span>{adultType?.name || "Vuxen"} : {adultPrice} kr</span>
                  <InputGroup style={{ maxWidth: 140 }}>
                    <button className="btn btn-outline-light" type="button" onClick={() => adjustTickets(setAdultTickets, adultTickets, -1)}>−</button>
                    <Form.Control type="number" className="text-center" value={adultTickets} onChange={(e) => handleInputChange(e.target.value, setAdultTickets, adultTickets)} min={0} />
                    <button className="btn btn-outline-light" type="button" onClick={() => adjustTickets(setAdultTickets, adultTickets, 1)}>+</button>
                  </InputGroup>
                </div>

                {/* Barn */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span>{childType?.name || "Barn"} : {childPrice} kr</span>
                  <InputGroup style={{ maxWidth: 140 }}>
                    <button className="btn btn-outline-light" type="button" onClick={() => adjustTickets(setChildTickets, childTickets, -1)}>−</button>
                    <Form.Control type="number" className="text-center" value={childTickets} onChange={(e) => handleInputChange(e.target.value, setChildTickets, childTickets)} min={0} />
                    <button className="btn btn-outline-light" type="button" onClick={() => adjustTickets(setChildTickets, childTickets, 1)}>+</button>
                  </InputGroup>
                </div>

                {/* Pensionär */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span>{seniorType?.name || "Pensionär"} : {seniorPrice} kr</span>
                  <InputGroup style={{ maxWidth: 140 }}>
                    <button className="btn btn-outline-light" type="button" onClick={() => adjustTickets(setSeniorTickets, seniorTickets, -1)}>−</button>
                    <Form.Control type="number" className="text-center" value={seniorTickets} onChange={(e) => handleInputChange(e.target.value, setSeniorTickets, seniorTickets)} min={0} />
                    <button className="btn btn-outline-light" type="button" onClick={() => adjustTickets(setSeniorTickets, seniorTickets, 1)}>+</button>
                  </InputGroup>
                </div>

                <div className="mb-3">
                  <p className="mb-1 fw-bold">Valda platser ({selectedSeats.length}):</p>
                  {selectedSeats.length > 0 ? (
                    <ul className="list-unstyled small mb-0 ps-2">
                      {selectedSeats.map((seat) => (
                        <li key={seat.seatId}>
                          Rad {seat.seatsRow}, Stol {seat.seatsNumber}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted small mb-0">Inga valda</p>
                  )}
                </div>

                <p className="mb-3">Antal biljetter: {totaltTickets}</p>
                <hr className="border-secondary" />
                <h4 className="h5 mb-3">Total: {totalPrice} kr</h4>

                <button
                  type="button"
                  className="btn checkout-btn rounded-pill py-2 px-4 fw-bold w-100"
                  disabled={selectedSeats.length === 0 || totaltTickets !== selectedSeats.length}
                  onClick={() => setShowEmailModal(true)}
                >
                  Boka
                </button>

                <Modal show={showEmailModal} onHide={handleCloseModal} centered>
                  <Modal.Header closeButton>
                    <Modal.Title className="text-dark">Bekräfta e-post</Modal.Title>
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
                        {user && <span className="badge bg-success">Inloggad</span>}
                      </Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="din.epost@example.se"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting || !!user} // Inaktiverar ändring om inloggad
                      />
                      {user && (
                        <Form.Text className="text-muted">
                          Bokningsbekräftelsen kopplas till ditt konto ({user.email}).
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Modal.Body>
                  <Modal.Footer>
                    <button
                      type="button"
                      className="cta-btn checkout-btn fw-bold py-2 px-4"
                      onClick={handleCheckout}
                      disabled={isSubmitting || !email}
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