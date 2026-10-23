// Omvandlar "2026-10-26T23:00:00.000Z" eller "2026-10-26" till "2026-10-26"
export const formatDate = (dateString?: string): string => {
  if (!dateString) return "";

  // Plocka ut de första 10 tecknen (YYYY-MM-DD)
  if (dateString.includes("T")) {
    return dateString.split("T")[0];
  }
  return dateString;
};

// Omvandlar "15:00:00+01" eller "15:00:00" till "15:00"
export const formatTime = (timeString?: string): string => {
  if (!timeString) return "";

  const cleanTime = timeString.split("+")[0].split("-")[0];
  const parts = cleanTime.split(":");

  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;  }

  return timeString;
};

// Räknar ut totalpriset för alla biljetter
export const calculateTotalPrice = (
  adultTickets: number,
  childTickets: number,
  seniorTickets: number,
  adultPrice: number = 140,
  childPrice: number = 80,
  seniorPrice: number = 120
): number => {
  return adultTickets * adultPrice + childTickets * childPrice + seniorTickets * seniorPrice;
};

// Räknar ut max antal biljetter man får lägga till baserat på valda stolar
export const getMaxAllowedTickets = (
  totalSelectedSeats: number,
  totalCurrentTickets: number,
  currentCategoryCount: number
): number => {
  return totalSelectedSeats - (totalCurrentTickets - currentCategoryCount);
};