
import type { Seat } from "../interface/types";

//konfigurering för olika auditorier, 
// för att prioritera vissa rader framför andra
const CONFIG = {
    "Stora Salongen": {
        targetRowPosition: 0.55,
        rowWeight: 0.65,
        seatWeight: 0.35,
    },
    "Lilla Salongen": {
        targetRowPosition: 0.65,
        rowWeight: 0.65,
        seatWeight: 0.35,
    }
};

export default function findBestSeats(seats : Seat[], bookedSeatsId: number[], auditoriumName: string) {

    //gå igenom alla stolar och filtrera bort de som är bokade
    const availableSeats = seats.filter((seat) => !bookedSeatsId.includes(seat.seatId));

    //early return
    if (availableSeats.length === 0 || auditoriumName === undefined || auditoriumName === null) {
        return null;
    }

    //hämta alla rader, även om de är upptagna och sorta de efter storleksordning
    const rows = [ ...new Set(seats.map((seat) => seat.seatsRow))]
    .sort((a, b) => a - b);

    //konfigurera efter autidioriumName, för att prioritera vissa rader framför andra
    const config = CONFIG[auditoriumName as keyof typeof CONFIG]; 

    //beräkna vilket rad som är optimal
    const targetRowIndex = (rows.length -1) * config.targetRowPosition;

    const maxRowDistance = Math.max(rows.length -1, 1);

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

        // beräkna avstånd från salongens optimala rad
        const rowPenalty = Math.abs(rowIndex - targetRowIndex) / maxRowDistance;

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

    // returnera stolen
    return bestSeat;
}