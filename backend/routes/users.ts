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

  if (res.locals.user.role !== "admin" && Number(res.locals.user.userId) !== userId) {
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

  if (res.locals.user.role !== "admin" && Number(res.locals.user.userId) !== userId)
 {
    return res.status(403).json({
      error: { message: "Du får inte uppdatera andra användare" }
    });
  }

  const { username, role } = req.body;
  const hashedPassword = req.body.passwordHash;

  //uppstår problem om email inte är en sträng vid .toLowerCase(), t.ex. om det är null eller undefined
  const email = typeof req.body.email === "string"
  ? req.body.email.toLowerCase()
  : req.body.email;

  // Validera endast fält som skickats med
  if (
    (username !== undefined &&
      (typeof username !== "string" || username.trim() === "")) ||
    (hashedPassword !== undefined &&
      (typeof hashedPassword !== "string" || hashedPassword.trim() === "")) ||
    (email !== undefined &&
      (typeof email !== "string" || email.trim() === ""))
    ) {
      return res.status(400).json({
        error: { message: "Fälten måste vara strängar och får inte vara tomma" },
      });
  }

  if (email !== undefined && !validateEmail(email)) {
    return res.status(400).json({
      error: { message: "Ogiltig email" },
    });
  }

  if (res.locals.user.role !== "admin" && role !== undefined) {
    return res.status(403).json({
      error: { message: "Endast admin får ändra roll" }
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

/* DELETE /users/:Id  (SELF OR ADMIN)
   Radera konto (T126 / T156 / #297), allt i en transaktion:
   1. Kommande bokningar (visningen har inte börjat) avbokas: biljetter och bokning tas bort,
      så platserna blir lediga för andra.
   2. Tidigare bokningar anonymiseras: kopplas loss från kontot (userId = NULL)
      och e-posten ersätts, så att biografens historik finns kvar utan personuppgifter.
   3. Kontot raderas.
   Utan steg 1–2 stoppar databasen raderingen (booking_userId_fkey) och svaret blir 500. */
const ANONYMIZED_EMAIL = "raderad-anvandare@filmvisarna.se";

usersRouter.delete("/:Id", requireAuth, async (req, res) => {
  const userId = parseId(req.params.Id as string);

  if (!userId) {
    return res.status(400).json({
      error: { message: "Ogiltigt användar-ID" },
    });
  }

  if (
    res.locals.user.role !== "admin" &&
    Number(res.locals.user.userId) !== userId
  ) {
    return res.status(403).json({
      error: { message: "Du får inte ta bort andra användare" },
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Avboka kommande bokningar och frigör platserna
    const upcoming = await client.query<{ bookingId: string }>(
      `select b."bookingId"
        from bookings b
        join showings sh on sh."showingId" = b."showingId"
        where b."userId" = $1
          and (sh.date + sh."time") > now()
        for update of b`,
      [userId],
    );

    const upcomingIds = upcoming.rows.map((row) => row.bookingId);

    if (upcomingIds.length > 0) {
      await client.query(
        `delete from tickets where "bookingId" = any($1::bigint[])`,
        [upcomingIds],
      );
      await client.query(
        `delete from bookings where "bookingId" = any($1::bigint[])`,
        [upcomingIds],
      );
    }

    // 2. Anonymisera tidigare bokningar
    await client.query(
      `update bookings
        set "userId" = null, email = $2
        where "userId" = $1`,
      [userId, ANONYMIZED_EMAIL],
    );

    // 3. Radera kontot
    const { rows } = await client.query(
      `delete from users
        where "userId" = $1
        returning "userId", username, email, role, "created_At"`,
      [userId],
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        error: { message: "Användare hittades inte" },
      });
    }

    await client.query("COMMIT");

    return res.status(200).json({
      data: { ...rows[0], cancelledBookings: upcomingIds.length },
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("DELETE /users/:Id failed", error);

    return res.status(500).json({
      error: { message: "Fel vid borttagning av användare" },
    });
  } finally {
    client.release();
  }
});
/* AUTH register*/ /*istället för post*/
usersRouter.post("/auth/register", hashPassword, async (req, res) => {
  
  const username = req.body.username;

  //uppstår problem om email inte är en sträng vid .toLowerCase()
  const email = typeof req.body.email === "string"
  ? req.body.email.toLowerCase()
  : req.body.email;

  const hashedPassword = req.body.passwordHash; 

  //ser om fälten är strängar
  if (
  typeof username !== "string" ||
  typeof hashedPassword !== "string" ||
  typeof email !== "string"
  ) {
    return res.status(400).json({
      error: { message: "Alla fält måste finnas och vara strängar" },
    });
  }

  //ser om fälten är tomma eller är bara mellanslag
  if (
    username.trim() === "" ||
    hashedPassword.trim() === "" ||
    email.trim() === ""
  ) {
    return res.status(400).json({
      error: { message: "Alla fält måste fyllas i" },
    });
  }

  //validera email
  if (!validateEmail(email)) {
    return res.status(400).json({
      error: { message: "Ogiltig email" },
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

  const password = req.body.password;
  const username = req.body.username;

  //ser om fälten finns och är strängar
  if (
  typeof password !== "string" ||
  typeof username !== "string"
  ) {
    return res.status(400).json({
      error: { message: "Användarnamn och lösenord krävs och måste vara strängar" },
    });
  }

  //ser om fälten är tomma eller är bara mellanslag
  if (
    password.trim() === "" ||
    username.trim() === ""
  ) {
    return res.status(400).json({
      error: { message: "Alla fält måste fyllas i" },
    });
  }

  /*
  //validera email
  if (!validateEmail(email)) {
    return res.status(400).json({
      error: { message: "Ogiltig email" },
    });
  }
  */

  try {
    // hämta användare baserat på användarnamn
    const { rows } = await pool.query(
      'select "userId", username, password, email, role from users where username = $1', [username]);

    if (rows.length === 0) {
      return res.status(401).json({
        error: { message: "Ogiltig användarnamn eller lösenord" },
      });
    }

    const user = rows[0];

    // jämför lösenord
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        error: { message: "Ogiltig användarnamn eller lösenord" },
      });
    }
    
    const token = signToken({
      sub: user.userId,
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