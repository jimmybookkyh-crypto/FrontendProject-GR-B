import { Router } from 'express';
import { pool } from '../db/pool.js';

const usersRouter = Router();

type User = {
  userId: number;
  username: string;
  password: string;
  email: string;
  role: string;
  created_At: Date;  
};

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      error: { message: "Endast admin har behörighet" },
    });
  }
  next();
}

function parseUserId(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) return null;

  const id = Number(value);
  if (!Number.isSafeInteger(id)) return null;

  return id;
}
/* get USERS */
usersRouter.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const offset = Math.max(Number(req.query.offset) || 0, 0);

  if (!Number.isInteger(limit) || !Number.isInteger(offset)) {
    return res.status(400).json({
      error: { message: "Ogilitg limit eller offset" },
    });
  }

  try {
    const { rows } = await pool.query(
      `select "userId", username, email, role, "created_At"
        from users
        order by "userId" limit $1 offset $2`, [limit, offset]);

    return res.status(200).json({ data: rows });
  } catch (error) {
    console.error("GET /users failed", error);
    return res.status(500).json({
      error: { message: "Fel vid hämtning av data" },
    });
  }
});
/* get -  User ID */
usersRouter.get("/:Id", async (req, res) => {
  const userId = parseUserId(req.params.Id);
  if (!userId) {
    return res.status(400).json({
      error: { message: "Ogiltigt användar-ID" },
    });
  }

  try {
    const { rows } = await pool.query(
      `select "userId", username, email, role, "created_At"
        from users
        where "userId" = $1`, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: { message: "Användare hittades inte" },
      });
    }

    return res.status(200).json({ data: rows[0] });
  } catch (error) {
    console.error("GET /users/:Id failed", error);

    return res.status(500).json({
      error: { message: "Fel vid hämtning av data" },
    });
  }
});

/* POST /users - Create User */
usersRouter.post("/", async (req, res) => {
  const { username, password, email, role } = req.body;

  if (!username || !password || !email || !role) {
    return res.status(400).json({
      error: { message: "Alla fält måste fyllas i" },
    });
  }

  try {
    const { rows } = await pool.query(
      `insert into users (username, password, email, role)
        values ($1, $2, $3, $4)
        returning "userId", username, email, role, "created_At"`,
      [username, password, email, role]);

    return res.status(201).json({ data: rows[0] });
  } catch (error) {
    console.error("POST /users failed", error);

    return res.status(500).json({
      error: { message: "Fel vid skapande av användare" },
    });
  }
}); 

/* PATCH /users/:Id - Update User */
usersRouter.patch("/:Id", async (req, res) => {
  const userId = parseUserId(req.params.Id);
  if (!userId) {
    return res.status(400).json({
      error: { message: "Ogiltigt användar-ID" },
    });
  }

  const { username, password, email, role } = req.body;

  try {
    const { rows } = await pool.query(
      `update users
        set username = $2, password = $3, email = $4, role = $5
        where "userId" = $1
        returning "userId", username, email, role, "created_At"`,
      [userId, username, password, email, role]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: { message: "Användare hittades inte" },
      });
    }

    return res.status(200).json({ data: rows[0] });
  } catch (error) {
    console.error("PATCH /users/:Id failed", error);

    return res.status(500).json({
      error: { message: "Fel vid uppdatering av användare" },
    });
  }
});

/* DELETE /users/:Id - Delete User */
usersRouter.delete("/:Id", async (req, res) => {
  const userId = parseUserId(req.params.Id);
  if (!userId) {
    return res.status(400).json({
      error: { message: "Ogiltigt användar-ID" },
    });
  }

  try {
    const { rows } = await pool.query(
      `delete from users
        where "userId" = $1
        returning "userId", username, email, role, "created_At"`,
      [userId]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: { message: "Användare hittades inte" },
      });
    }

    return res.status(200).json({ data: rows[0] });
  } catch (error) {
    console.error("DELETE /users/:Id failed", error);

    return res.status(500).json({
      error: { message: "Fel vid borttagning av användare" },
    });
  }
}); 

export default usersRouter;
