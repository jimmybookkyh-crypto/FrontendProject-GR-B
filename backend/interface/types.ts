export interface Booking {
  bookingId: number;
  created_at: Date;
  bookingNumber: string;
  email: string;
  showingId: number;
  userId: number | null;
}

// Nu säger TypeScript ifrån om någon försöker läsa userId från anropet.
export interface CreateBookingInput {
  email: string;
  showingId: number;
  tickets: { seatId: number; ticketTypeId: number }[];
}

export interface TicketInput {
  seatId: number;
  ticketTypeId: number;
}

/* En biljett i svaret från POST /bookings: stolen (rad och nummer) och biljettypen (namn och pris) */
export interface BookedTicket {
  seatId: number;
  seatsRow: number;
  seatsNumber: number;
  ticketTypeId: number;
  ticketType: string; // t.ex. "Vuxen"
  price: number;
}

/* Svaret från POST /bookings: bokningen, biljetterna och totalpriset */
export type CreatedBooking = Booking & {
  tickets: BookedTicket[];
  totalPrice: number;
};

export interface Movie {
  movieId: string; // bigint kommer som text från pg
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
  eventId: string;
  created_at: string;
  name: string;
  date: string | null;
  current: boolean;
  info: string | null;
}

export interface Auditorium {
  auditoriumId: string; // bigint kommer som text från pg
  name: string;
}
