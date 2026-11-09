import { useEffect, useState } from "react";

export default function useSeatUpdates(
  showingId: string | undefined,
) {
  const [occupiedSeats, setOccupiedSeats] = useState<number[]>([]);

  useEffect(() => {
    if (!showingId) return;

    let ws: WebSocket;
    let reconnect = true;

    (async () => {
      const response = await fetch(
        `/api/showings/${showingId}/seats`
      );

      const body = await response.json();

      setOccupiedSeats(body.data ?? []);
    })();


    const connect = () => {
      ws = new WebSocket("/ws");

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

      ws.onclose = () => {
        if (!reconnect) return;

        setTimeout(() => {
          connect();
        }, 3000);
      };
    };

    connect();

    return () => {
      reconnect = false;
      ws.close();
    };
  }, [showingId]);

  return occupiedSeats;
}