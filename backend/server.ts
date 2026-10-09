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
dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ data: "data received" });
});

app.use("/movies", moviesRouter);
/* app.use('/bookings', bookingRouter); */
/* app.use('/auditorium', auditoriumRouter); */
/* app.use('/events', eventsRouter); */
app.use("/seats", seatsRouter);
/* app.use('/showings', showingsRouter); */
/* app.use('/tickets', ticketsRouter); */
/* app.use('/users', usersRouter); */

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("server ok");
});
