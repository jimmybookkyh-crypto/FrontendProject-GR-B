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
  userId?: number | null;
  tickets: { seatId: number; ticketTypeId: number }[];
}

export interface TicketInput {
  seatId: number;
  ticketTypeId: number;
}