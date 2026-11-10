import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import dotenv from "dotenv";
import moviesRouter from "./routes/movies.js";
import bookingRouter from "./routes/bookings.js";
import auditoriumRouter from "./routes/auditorium.js";
import eventsRouter from "./routes/events.js";
import seatsRouter from "./routes/seats.js";
import showingsRouter from "./routes/showings.js";
import ticketsRouter from "./routes/tickets.js";
import usersRouter from "./routes/users.js";
import { WebSocketServer, WebSocket } from "ws";
import { subscriptions } from "./websocket.js";
dotenv.config();

//Fångar ohanterade asynkrona fel
process.on("unhandledRejection", (err) => {
  console.error("Unhandled error:", err);
});

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ data: "data received" });
});

app.use("/movies", moviesRouter);
app.use("/bookings", bookingRouter);
app.use("/auditorium", auditoriumRouter);
app.use("/events", eventsRouter);
app.use("/seats", seatsRouter);
app.use("/showings", showingsRouter);
app.use("/tickets", ticketsRouter);
app.use("/users", usersRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: { message: "Det du söker finns inte." } });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    err.type === "entity.parse.failed"
  ) {
    res.status(400).json({ error: { message: "Förfrågan har fel format." } });
    return;
  }
  console.error(err);
  res
    .status(500)
    .json({ error: { message: "Något gick fel på servern. Försök igen." } });
});

const server = app.listen(process.env.PORT || 3000, () => {
  console.log("server ok");
});

const wss = new WebSocketServer({
  server,
  path: "/ws",
});
wss.on("connection", (ws) => {
  console.log("WebSocket connected");

  ws.on("message", (message) => {
    let data: { type?: unknown; showingId?: unknown };
    try {
      data = JSON.parse(message.toString());
    } catch {
      return;
    }

    if (data.type === "subscribe") {
      const showingId = Number(data.showingId);

      if (!subscriptions.has(showingId)) {
        subscriptions.set(showingId, new Set<WebSocket>());
      }

      subscriptions.get(showingId)?.add(ws);

      console.log("Subscribe:", showingId);
    }
  });
  ws.on("close", () => {
    subscriptions.forEach((clients, showingId) => {
      clients.delete(ws);

      if (clients.size === 0) {
        subscriptions.delete(showingId);
      }
    });

    console.log("WebSocket disconnected");
  });
});
