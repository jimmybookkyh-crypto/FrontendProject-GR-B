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
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (username: string, email: string, password: string) => Promise<void>;
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


