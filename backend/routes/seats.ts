import { Router } from "express";
import { pool } from "../db/pool.js";
import { parseId } from "../utils/parseId.js";

const seatsRouter = Router();

type Seat = {
  seatId: number;
  seatsRow: number;
  seatsNumber: number;
  auditoriumId: number;
};

// GET /seats  |  ?auditoriumId=1
seatsRouter.get("/", async (req, res) => {
  let auditoriumId: number | null = null;

  if (req.query.auditoriumId !== undefined) {
    auditoriumId =
      typeof req.query.auditoriumId === "string"
        ? parseId(req.query.auditoriumId)
        : null;

    if (auditoriumId === null) {
      return res.status(400).json({
        error: { message: "Ogiltigt salongs-id" },
      });
    }
  }

  // where......betyder: om inget filter skickas visas alla säten, annars bara den salongens.
  try {
    const { rows } = await pool.query<Seat>(
      `select "seatId", "seatsRow", "seatsNumber", "auditoriumId"
        from seats
        where ($1::bigint is null or "auditoriumId" = $1::bigint) 
        order by "auditoriumId", "seatsRow", "seatsNumber"`,
      [auditoriumId],
    );

    return res.status(200).json({ data: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("GET /seats failed", { message });

    return res.status(500).json({
      error: { message: "Fel vid hämtning av säten" },
    });
  }
});

export default seatsRouter;
