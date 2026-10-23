// Omvandlar "2026-10-23T22:00:00.000Z" eller "2026-10-24" till "2026-10-24".
// Ett datum med tid (ISO) räknas om till svensk tid. Backend skickar midnatt
// svensk tid som 22:00 dagen innan i UTC, så att bara klippa vid "T" ger en dag fel.
export const formatDate = (dateString?: string): string => {
  if (!dateString) return "";

  if (dateString.includes("T")) {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      // sv-SE ger formatet ÅÅÅÅ-MM-DD
      return date.toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" });
    }
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