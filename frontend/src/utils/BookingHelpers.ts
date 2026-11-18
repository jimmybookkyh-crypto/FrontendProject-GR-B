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