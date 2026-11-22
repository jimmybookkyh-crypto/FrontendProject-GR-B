export interface Booking {
  bookingId: number;
  created_at: Date;
  bookingNumber: string;
  email: string;
  showingId: number;
  userId: number | null;
}

export interface CreateBookingInput {
  email: string;
  showingId: number;
  tickets: { seatId: number; ticketTypeId: number }[];
}

export interface TicketInput {
  seatId: number;
  ticketTypeId: number;
}

export interface BookedTicket {
  seatId: number;
  seatsRow: number;
  seatsNumber: number;
  ticketTypeId: number;
  ticketType: string; 
  price: number;
}

export type CreatedBooking = Booking & {
  tickets: BookedTicket[];
  totalPrice: number;
};

export interface Movie {
  movieId: number; 
  title: string;
  productioncountries: string[] | null;
  productionyear: number | null;
  length: number | null;
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

export interface EventRow {
  eventId: number;
  created_at: string;
  name: string;
  date: string | null;
  current: boolean;
  info: string | null;
  image: string | null; 
  altText: string | null;
  tagline: string | null;
}


export interface EventPeriod {
  startDate: string;
  endDate: string;
}

export interface EventWithPeriods
  extends Omit<EventRow, "created_at" | "date" | "current"> {
  periods: EventPeriod[];
}

export interface Auditorium {
  auditoriumId: number; 
  name: string;
}

export interface ExistingShowing {
  showingId: number;
  auditoriumId: number;
  date: string;
  time: string;
  movieDurationMinutes: number;
}

export interface NewShowingCheck {
  auditoriumId: number;
  date: string;
  time: string;
  movieDurationMinutes: number;
  cleaningTimeMinutes?: number;
  showingIdToExclude?: number;
}

export interface ShowingListItem {
  showingId: string;
  date: string; 
  time: string; 
  movieId: number;
  movieTitle: string;
  auditoriumId: string;
  auditoriumName: string;
  eventId: number | null;
  hasStarted: boolean; 
}
