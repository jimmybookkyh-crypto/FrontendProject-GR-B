import { useEffect, useState } from "react";

export default function useSeatUpdates(
  showingId: string | undefined,
) {
  const [occupiedSeats, setOccupiedSeats] = useState<number[]>([]);

  useEffect(() => {
    if (!showingId) return;

    (async () => {
      const response = await fetch(
        `/api/showings/${showingId}/seats`
      );

      const body = await response.json();

      setOccupiedSeats(body.data ?? []);
    })();

    const ws = new WebSocket("/ws");

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "subscribe",
          showingId: Number(showingId),
        })
      );
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "seats") {
        setOccupiedSeats(data.bookedSeatIds);
      }
    };
    return () => {
      ws.close();
    };

  }, [showingId]);

  return occupiedSeats;
}