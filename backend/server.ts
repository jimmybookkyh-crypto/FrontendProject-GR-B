import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import dotenv from "dotenv";
import path from "node:path";
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
import { startScheduler } from "./scheduler.js";
dotenv.config();


process.on("unhandledRejection", (err) => {
  console.error("Unhandled error:", err);
});

const app = express();
app.disable("x-powered-by");
app.use(express.json());

const distFolder = path.join(import.meta.dirname, "..", "frontend", "dist");

const api = express.Router();

api.use("/movies", moviesRouter);
api.use("/bookings", bookingRouter);
api.use("/auditorium", auditoriumRouter);
api.use("/events", eventsRouter);
api.use("/seats", seatsRouter);
api.use("/showings", showingsRouter);
api.use("/tickets", ticketsRouter);
api.use("/users", usersRouter);

app.use("/api", api);

app.use(express.static(distFolder));

app.get("/{*splat}", (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith("/api") || !req.accepts("html")) {
    next();
    return;
  }
  res.sendFile(path.join(distFolder, "index.html"));
});

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
  startScheduler();
});

const wss = new WebSocketServer({
  server,
  path: "/ws",
});
wss.on("connection", (ws) => {

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

    }
  });
  ws.on("close", () => {
    subscriptions.forEach((clients, showingId) => {
      clients.delete(ws);

      if (clients.size === 0) {
        subscriptions.delete(showingId);
      }
    });

  });
});
