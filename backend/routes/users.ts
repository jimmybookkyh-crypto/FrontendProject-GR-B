import { Router } from 'express';
import { pool } from '../db/pool.js';
import { signToken } from "../utils/jwt.js"; 
import { parseId } from "../utils/parseId.js";
import { hashPassword } from "../utils/hashPassword.ts";
import { requireAuth, requireAdmin } from '../utils/requireAuth.ts';
import { parsePagination } from '../utils/parsePagination.js';
import { validateEmail } from "../utils/validateEmail.js";
import bcrypt from 'bcryptjs';

const usersRouter = Router();

/* GET /users ONLY ADMIN */
usersRouter.get("/", requireAuth, requireAdmin, async (req, res) => { 
  const pagination = parsePagination(req.query);

  if (!pagination) {
    return res.status(400).json({
      error: { message: "Ogiltig limit eller offset" },
    });
  }
  const { limit, offset } = pagination;

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
/* GET /users/:Id  (SELF OR ADMIN) */
usersRouter.get("/:Id", requireAuth, async (req, res) => { 
  const userId = parseId(req.params.Id as string);
  if (!userId) {
    return res.status(400).json({
      error: { message: "Ogiltigt användar-ID" },
    });
  }

  if (res.locals.user.role !== "admin" && res.locals.user.userId !== userId) {
    return res.status(403).json({
      error: { message: "Du får inte se andra användare" }
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
/* PATCH /users/:Id  (SELF OR ADMIN) */
usersRouter.patch("/:Id", requireAuth, hashPassword, async (req, res) => { 
  const userId = parseId(req.params.Id as string);
  if (!userId) {
    return res.status(400).json({
      error: { message: "Ogiltigt användar-ID" },
    });
  }

  if (res.locals.user.role !== "admin" && res.locals.user.userId !== userId)
 {
    return res.status(403).json({
      error: { message: "Du får inte uppdatera andra användare" }
    });
  }

  const { username, email, role } = req.body;
  const hashedPassword = req.body.passwordHash;

  if (email !== undefined && !validateEmail(email)) {
    return res.status(400).json({
      error: { message: "Ogiltig email" },
    });
  }

  try {
    const { rows } = await pool.query(
      `update users
        set username = coalesce($2, username),
       password = coalesce($3, password),
       email = coalesce($4, email),
       role = coalesce($5, role)
        where "userId" = $1
        returning "userId", username, email, role, "created_At"`,
      [userId, username, hashedPassword, email, role]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: { message: "Användare hittades inte" },
      });
    }

    return res.status(200).json({ data: rows[0] });
  }
  catch (error) {
    console.error("PATCH /users/:Id failed", error);
    return res.status(500).json({
      error: { message: "Fel vid uppdatering av användare" },
    });
  }
});

/* DELETE /users/:Id  (SELF OR ADMIN) */
usersRouter.delete("/:Id", requireAuth, async (req, res) => { 
  const userId = parseId(req.params.Id as string);

  if (!userId) {
    return res.status(400).json({
      error: { message: "Ogiltigt användar-ID" },
    });
  }

  if (res.locals.user.role !== "admin" && res.locals.user.userId !== userId) {
    return res.status(403).json({
      error: { message: "Du får inte ta bort andra användare" }
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
/* AUTH register*/ /*istället för post*/
usersRouter.post("/auth/register", hashPassword, async (req, res) => {
  const { username, email } = req.body;
  const hashedPassword = req.body.passwordHash; 

  if (!username || !hashedPassword || !email) {
    return res.status(400).json({
      error: { message: "Alla fält måste fyllas i" },
    });
  }

  try {
    // kontrollerar email
    const emailCheck = await pool.query(
      'select "userId" from users where email = $1', [email]);

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({
        error: { message: "Email redan registrerad" },
      });
    }

    // skapa användare
    const { rows } = await pool.query(
      `insert into users (username, password, email, role)
        values ($1, $2, $3, $4)
        returning "userId", username, email, role, "created_At"`,
      [username, hashedPassword, email, 'user']
    );
    return res.status(201).json({ data: rows[0] });
  } catch (error) {
    console.error("POST /users/auth/register failed", error);

    return res.status(500).json({
      error: { message: "fel vid registrering" },
    });
  }

});

/* AUTH login */
usersRouter.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: { message: "Email och lösenord krävs" },
    });
  }
  try {
    // hämta användare baserat på email
    const { rows } = await pool.query(
      'select "userId", username, password, email, role from users where email = $1', [email]);

    if (rows.length === 0) {
      return res.status(401).json({
        error: { message: "Ogiltig email eller lösenord" },
      });
    }

    const user = rows[0];

    // jämför lösenord
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        error: { message: "Ogiltig email eller lösenord" },
      });
    }
    
    const token = signToken({
      id: user.userId,
      email: user.email,
      role: user.role
    });

    return res.status(200).json({
      token,
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("POST /users/auth/login failed", error);
    return res.status(500).json({
      error: { message: "Fel vid inloggning" },
    });
  }
});

export default usersRouter;