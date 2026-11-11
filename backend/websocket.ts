import { WebSocket } from "ws";

export const subscriptions = new Map<number, Set<WebSocket>>();

export function broadcastSeats(
  showingId: number,
  bookedSeatIds: number[],
) {
  const clients = subscriptions.get(showingId);

  if (!clients) return;

  const message = JSON.stringify({
    type: "seats",
    showingId,
    bookedSeatIds,
  });

  clients.forEach((client) => {
    client.send(message);
  });
}