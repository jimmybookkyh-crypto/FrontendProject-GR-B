import { Router } from "express";
import { pool } from "../db/pool.js";

const showingsRouter: Router = Router();

showingsRouter.get("/", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM showings");
  res.json(rows);
});

showingsRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    `SELECT * FROM showings WHERE "showingId" = $1`,
    [id]
  );
  res.json(rows[0]);
});

showingsRouter.post("/", async (req, res) => {
  const { movieId, auditoriumId, date, time, eventId } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO showings ("movieId", "auditoriumId", date, "time", "eventId") VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [movieId, auditoriumId, date, time, eventId]
    );
    res.status(201).json(rows[0]);

  } catch (error) {
    console.error("Error vid skapande av visning:", error);
    res.status(500).json({ error: "fel vid skapande av visning" });
  }
});

showingsRouter.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { movieId, auditoriumId, date, time, eventId } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE showings
       SET "movieId" = COALESCE($2, "movieId"),
           "auditoriumId" = COALESCE($3, "auditoriumId"),
           date = COALESCE($4, date),
           "time" = COALESCE($5, "time"),
           "eventId" = COALESCE($6, "eventId")
       WHERE "showingId" = $1
       RETURNING *`,
      [id, movieId, auditoriumId, date, time, eventId]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error("PATCH /showings/:id failed", error);
    res.status(500).json({ error: { message: "Fel vid uppdatering av visning" } });
  }
});

  showingsRouter.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try { 
      await pool.query(`DELETE FROM showings WHERE "showingId" = $1`, [id]);
      res.json({ message: "Visning borttagen" });
    } catch (error) {
      console.error("DELETE /showings/:id failed", error);
      res.status(500).json({ error: { message: "Fel vid borttagning av visning" } });
    }
  });

export default showingsRouter;