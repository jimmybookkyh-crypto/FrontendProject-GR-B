/* placeholder for types */

export interface AuthUser {
  userId: string;
  username: string;
  email: string;
  role: "user" | "admin";
}
export interface AuthResponse {
  token: string;
  user: AuthUser;
}
export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean | null;
  login: (username: string, password: string) => Promise<void>; // inloggning med användarnamn (#371)
  logout: () => void;
  updateUser: (user: AuthUser) => void; // Mina sidor: efter ändrade uppgifter
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
}
// Backknapp
export interface BackButtonProps {
  label?: string;
  to?: string;
  className?: string;
  onClick?: () => void;
}

// Visningsknapp
export interface SlotButtonProps {
  auditoriumName: string;
  time: string;
  disabled?: boolean;
  onClick?: () => void;
}

// Biljettknapp
export interface TicketButtonProps {
  to: string;
  label?: string;
  onClick?: () => void;
}

// Visningar från backend
export interface Showings {
  showingId: number;
  movieId: number;
  auditoriumId: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  eventId?: number | null;
}

// Props till SlotSelection
export interface SlotSelectionProps {
  showings?: Showings[];
}

// Mina sidor (T126): en biljett i en av användarens bokningar
export interface MyBookingTicket {
  seatsRow: number;
  seatsNumber: number;
  ticketType: string; // "Vuxen", "Pensionär", "Barn"
  price: number;
}

// Mina sidor (T126): en bokning från GET /bookings/me
export interface MyBooking {
  bookingId: string | number;
  bookingNumber: string;
  createdAt: string;
  showingId: string | number;
  movieId: string | number;
  movieTitle: string;
  images: string[] | string | null;
  ageRating: number | null;
  date: string; // "2026-10-26"
  time: string; // "18:30"
  auditoriumName: string;
  isUpcoming: boolean;
  totalPrice: number;
  tickets: MyBookingTicket[];
  canCancel: boolean;
  status: "confirmed" | "cancelled";
}

// Mina sidor (T126): svaret från GET /bookings/me
export interface MyBookingsResponse {
  upcoming: MyBooking[]; // närmast först
  past: MyBooking[]; // senaste först
}

export type EventRow = {
  eventId: string;
  name: string;
  date: string | null; // "YYYY-MM-DD"
  current: boolean;
  info: string | null;
};

export type EventShowing = {
  showingId: string;
  date: string;
  movieId: string;
  movieTitle: string;
  productionyear: number | null;
};

/* ---------- Bokningssidan (#411) ----------
   Typerna speglar vad backend skickar. pool.ts gör om bigint/numeric
   till vanliga tal, så alla id:n och priser är number. */

// Film från GET /movies/:id
export interface Movie {
  movieId: number;
  title: string;
  productioncountries: string[] | null;
  productionyear: number | null;
  length: number | null; // speltid i minuter
  genre: string | null;
  distributor: string | null;
  language: string | null;
  subtitles: string | null;
  director: string | null;
  actors: string[] | null;
  description: string | null;
  images: string[] | null;
  youtubetrailers: string[] | null;
  current: boolean;
  ageRating: number | null;
}

// En visning från GET /showings/:id
export interface Showing {
  showingId: number;
  date: string; // "2026-11-05"
  time: string; // "18:00"
  movieId: number;
  movieTitle: string;
  auditoriumId: number;
  auditoriumName: string;
  eventId: number | null;
  hasStarted?: boolean; // true = visningen har börjat och kan inte bokas
}

// En stol från GET /seats?auditoriumId=
export interface Seat {
  seatId: number;
  seatsRow: number;
  seatsNumber: number;
  auditoriumId: number;
}

// En salong
export interface Auditorium {
  auditoriumId: number;
  name: string;
}

// Biljettyp från GET /tickets/ticketTypes
export interface TicketType {
  ticketTypeId: number;
  name: string; // "Vuxen", "Barn", "Pensionär"
  price: number;
}

// Bokningen som POST /bookings svarar med
export interface Booking {
  bookingId: number;
  bookingNumber: string;
  email: string;
  showingId: number;
  userId: number | null;
  totalPrice: number;
}

// Props till TicketCounter (en biljettrad: typ, pris och − antal +)
export interface TicketCounterProps {
  label: string;
  price: number;
  count: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onChange: (value: string) => void;
}

export type FieldErrors = {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
};
