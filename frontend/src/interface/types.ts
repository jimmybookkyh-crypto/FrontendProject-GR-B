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
  status?: "confirmed" | "cancelled"; // kommer med avbokning som status (T113)
}

// Mina sidor (T126): svaret från GET /bookings/me
export interface MyBookingsResponse {
  upcoming: MyBooking[]; // närmast först
  past: MyBooking[]; // senaste först
}
