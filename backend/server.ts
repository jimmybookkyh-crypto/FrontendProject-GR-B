import express from "express";
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

app.use((err: any, req: any, res: any, next: any) => {
  if (err.type === "entity.parse.failed") {
    return res
      .status(400)       //felaktiga post,json
      .json({ error: { message: "Invalid JSON in the request" } });
  }
  next(err);
});

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

app.use((req, res) => {
  res.status(404).json( { error: {message: "Sidan hittades inte"}} );
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
      const data = JSON.parse(message.toString());

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