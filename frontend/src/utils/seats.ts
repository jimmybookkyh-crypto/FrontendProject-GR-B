
import type { Seat } from "../interface/types";

//konfigurering för olika auditorier, 
// för att prioritera vissa rader framför andra 
//optimalStart = vart den optimala startplatsen är i salongen. 0.00 = längst fram, 1.00 = längst bak
//optimalEnd = vart den optimala slutplatsen är i salongen. 0.00 = längst fram, 1.00 = längst bak
//rowWeight = prioriterar en bredare placering och vikt hoss mitten raderna (0-1)
//seatWeight = priotiering av mitten av raden (0-1)
const CONFIG = {
    "Stora Salongen": {
        optimalStart: 0.55, 
        optimalEnd: 0.80,
        rowWeight: 0.60,
        seatWeight: 0.70,
    },
    "Lilla Salongen": {
        optimalStart: 0.80,
        optimalEnd: 0.99,
        rowWeight: 0.55,
        seatWeight: 0.90,
    }
};

function calculateRowPenalty(
    rowPosition: number,
    optimalStart: number,
    optimalEnd: number
): number {

    if(rowPosition >= optimalStart &&
        rowPosition <= optimalEnd) 
        {
        return 0;
    }
    
    if(rowPosition < optimalStart) {
        return (optimalStart - rowPosition) / optimalStart;
    }

    return (rowPosition - optimalEnd) / (1 - optimalEnd); 
};

export default function findBestSeats(
    seats : Seat[],
    bookedSeatsId: number[],
    selectedSeats: Seat[], 
    auditoriumName: string
    ): Seat | null {

    // samla alla bokade och valda stolar
    const allOccupiedSeatsId = new Set([
        ...bookedSeatsId,
        ...selectedSeats.map((seat) => seat.seatId),
    ]);

    //filtrera bort  som är bokade
    const availableSeats = seats.filter(
        (seat) => !allOccupiedSeatsId.has(Number(seat.seatId))
    );

    //early return
    if (availableSeats.length === 0 || auditoriumName === undefined || auditoriumName === null) {
        return null;
    }

    //hämta alla rader, även om de är upptagna och sorta de efter storleksordning
    const rows = [ ...new Set(seats.map((seat) => seat.seatsRow))]
    .sort((a, b) => a - b);

    //konfigurera efter autidioriumName, för att prioritera vissa rader framför andra
    const config = CONFIG[auditoriumName as keyof typeof CONFIG]; 

    //gruppera alla stolar efter rad
    const seatsByRow = new Map<number, Seat[]>();

    for (const seat of seats) {
        const rowSeats = seatsByRow.get(seat.seatsRow) ?? [];
        rowSeats.push(seat);
        seatsByRow.set(seat.seatsRow, rowSeats);   
    } 

    let bestSeat: Seat | null = null;
    let bestScore = Infinity;

    for (const seat of availableSeats) {
        const rowIndex = rows.indexOf(seat.seatsRow);

        const rowSeats = seatsByRow.get(seat.seatsRow)!
        .sort((a, b) => a.seatsNumber - b.seatsNumber);

        const seatIndex = rowSeats.findIndex(
            (s) => s.seatId === seat.seatId
        );

        const rowPosition = 
            rows.length === 1
                ? 0.5
                : rowIndex / (rows.length - 1);

        // beräkna avstånd från salongens optimala rad
        const rowPenalty = calculateRowPenalty(
            rowPosition,
            config.optimalStart,
            config.optimalEnd
        );

        //beräkna asvtånd från radens mitt
        const centerIndex = (rowSeats.length -1) / 2;
        
        const maxSeatDistance = Math.max(centerIndex, 1);

        const seatPenalty = Math.abs(seatIndex - centerIndex) / maxSeatDistance;

        // lägre peäng = bättre placering

        const score = rowPenalty * config.rowWeight + seatPenalty * config.seatWeight;

        if (score < bestScore) {
            bestScore = score;
            bestSeat = seat;
        }
    }

    return bestSeat;
}