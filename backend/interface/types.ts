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
