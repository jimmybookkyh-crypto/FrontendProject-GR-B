import { Router } from "express";
import { pool } from "../db/pool.js";

const ticketsRouter: Router = Router();

ticketsRouter.get("/ticketTypes", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `select "ticketTypeId", name, price
       from "ticketTypes"
       order by price asc`
    );

    return res.status(200).json({ data: rows });
  } catch (error) {
    console.error("GET /ticketTypes failed", error);
    return res.status(500).json({
      error: { message: "Fel vid hämtning av data" },
    });
  }
});

export default ticketsRouter;
