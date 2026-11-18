import { Router } from "express";
import { pool } from "../db/pool.js";
import { signToken } from "../utils/jwt.js";
import { parseId } from "../utils/parseId.js";
import { hashPassword } from "../utils/hashPassword.ts";
import {
  requireAuth,
  requireAdmin,
  isValidRole,
} from "../utils/requireAuth.ts";
import { parsePagination } from "../utils/parsePagination.js";
import { normalizeEmail } from "../utils/normalizeEmail.js";
import { validateEmail } from "../utils/validateEmail.js";
import {
  isUsernameTooLong,
  USERNAME_TOO_LONG_MESSAGE,
} from "../utils/validateUsername.js";
import bcrypt from "bcryptjs";

const usersRouter = Router();

const DUMMY_HASH = "$2b$13$6Gg4dNtWkIZNQfKVvlFdD.ZkGKUgBSC3GUGcR8T0Brco0vpdhZlBW";


usersRouter.get("/", requireAuth, requireAdmin, async (req, res) => {
  const pagination = parsePagination(req.query);

  if (!pagination) {
    return res.status(400).json({
      error: { message: "Ogiltig gräns eller förskjutning" },
    });
  }
  const { limit, offset } = pagination;

  try {
    const { rows } = await pool.query(
      `select "userId", username, email, role, "created_At"
        from users
        order by "userId" limit $1 offset $2`,
      [limit, offset],
    );

    return res.status(200).json({ data: rows });
  } catch (error) {
    console.error("GET /users failed", error);
    return res.status(500).json({
      error: { message: "Fel vid hämtning av data" },
    });
  }
});

usersRouter.get("/:Id", requireAuth, async (req, res) => {
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
      error: { message: "Du får inte se andra användare" },
    });
  }

  try {
    const { rows } = await pool.query(
      `select "userId", username, email, role, "created_At"
        from users
        where "userId" = $1`,
      [userId],
    );

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

usersRouter.patch("/:Id", requireAuth, hashPassword, async (req, res) => {
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
      error: { message: "Du får inte uppdatera andra användare" },
    });
  }

  const { username, role } = req.body;
  const hashedPassword = req.body.passwordHash;

  const email = normalizeEmail(req.body.email);

  if (
    (username !== undefined &&
      (typeof username !== "string" || username.trim() === "")) ||
    (hashedPassword !== undefined &&
      (typeof hashedPassword !== "string" || hashedPassword.trim() === "")) ||
    (email !== undefined && (typeof email !== "string" || email.trim() === ""))
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

  if (username !== undefined && isUsernameTooLong(username)) {
    return res.status(400).json({
      error: { message: USERNAME_TOO_LONG_MESSAGE },
    });
  }

  if (res.locals.user.role !== "admin" && role !== undefined) {
    return res.status(403).json({
      error: { message: "Endast admin får ändra roll" },
    });
  }

  if (role !== undefined && !isValidRole(role)) {
    return res.status(400).json({
      error: { message: "Ogiltig roll, tillåtna värden är 'user' och 'admin'" },
    });
  }

  try {
    if (Number(res.locals.user.userId) === userId) {
      const { currentPassword } = req.body;

      if (typeof currentPassword !== "string" || currentPassword === "") {
        return res.status(400).json({
          error: { message: "Ange ditt nuvarande lösenord" },
        });
      }

      const current = await pool.query(
        'select password from users where "userId" = $1',
        [userId],
      );

      const match = await bcrypt.compare(
        currentPassword,
        current.rows[0]?.password ?? DUMMY_HASH,
      );

      if (!match) {
        return res.status(401).json({
          error: { message: "Nuvarande lösenord stämmer inte." },
        });
      }
    }

    const { rows } = await pool.query(
      `update users
        set username = coalesce($2, username),
       password = coalesce($3, password),
       email = coalesce($4, email),
       role = coalesce($5, role)
        where "userId" = $1
        returning "userId", username, email, role, "created_At"`,
      [userId, username, hashedPassword, email, role],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: { message: "Användare hittades inte" },
      });
    }

    return res.status(200).json({ data: rows[0] });
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: { message: "Denna Email finns redan registrerad" },
      });
    }

    console.error("PATCH /users/:Id failed", error);
    return res.status(500).json({
      error: { message: "Fel vid uppdatering av användare" },
    });
  }
});

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

    const upcoming = await client.query<{ bookingId: string }>(
      `select b."bookingId"
        from bookings b
        join showings sh on sh."showingId" = b."showingId"
        where b."userId" = $1
        and b.status = 'confirmed'
        and (sh.date + sh."time") > now()
        for update of b`,
      [userId],
    );

    const upcomingIds = upcoming.rows.map((row) => row.bookingId);

    const isAdmin = res.locals.user.role === "admin";

    if (upcomingIds.length > 0 && !isAdmin) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        error: {
          message:
            "Du har kommande bokningar. Avboka dem först, eller vänta tills visningarna har varit, innan du raderar kontot.",
        },
      });
    }

    if (upcomingIds.length > 0) {
      await client.query(
        `update bookings
          set status = 'cancelled', "cancelledAt" = now()
          where "bookingId" = any($1::bigint[])`,
        [upcomingIds],
      );
    }

    await client.query(
      `update bookings
        set "userId" = null, email = $2
        where "userId" = $1`,
      [userId, ANONYMIZED_EMAIL],
    );

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

    return res.status(204).send();
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

usersRouter.post("/auth/register", hashPassword, async (req, res) => {
  const username = req.body.username;

  const email = normalizeEmail(req.body.email);

  const hashedPassword = req.body.passwordHash;

  if (
    typeof username !== "string" ||
    typeof hashedPassword !== "string" ||
    typeof email !== "string"
  ) {
    return res.status(400).json({
      error: { message: "Alla fält måste finnas och vara strängar" },
    });
  }

  if (
    username.trim() === "" ||
    hashedPassword.trim() === "" ||
    email.trim() === ""
  ) {
    return res.status(400).json({
      error: { message: "Alla fält måste fyllas i" },
    });
  }

  if (isUsernameTooLong(username)) {
    return res.status(400).json({
      error: { message: USERNAME_TOO_LONG_MESSAGE },
    });
  }

  //validera email
  if (!validateEmail(email)) {
    return res.status(400).json({
      error: { message: "Ogiltig email" },
    });
  }

  try {
    const emailCheck = await pool.query(
      'select "userId" from users where email = $1',
      [email],
    );

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({
        error: { message: "Email redan registrerad" },
      });
    }

    const { rows } = await pool.query(
      `insert into users (username, password, email, role)
        values ($1, $2, $3, $4)
        returning "userId", username, email, role, "created_At"`,
      [username, hashedPassword, email, "user"],
    );
    return res.status(201).json({ data: rows[0] });
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: { message: "Denna Email finns redan registrerad" },
      });
    }

    console.error("POST /users/auth/register failed", error);

    return res.status(500).json({
      error: { message: "fel vid registrering" },
    });
  }
});

usersRouter.post("/auth/login", async (req, res) => {
  const password = req.body.password;
  const username = req.body.username;

  if (typeof password !== "string" || typeof username !== "string") {
    return res.status(400).json({
      error: {
        message: "Användarnamn och lösenord krävs och måste vara strängar",
      },
    });
  }

  if (password.trim() === "" || username.trim() === "") {
    return res.status(400).json({
      error: { message: "Alla fält måste fyllas i" },
    });
  }

  try {
    const { rows } = await pool.query(
      'select "userId", username, password, email, role from users where username = $1',
      [username],
    );

    const user = rows[0];

    const passwordHash = user?.password ?? DUMMY_HASH;

    const match = await bcrypt.compare(password, passwordHash);

    if (!user || !match) {
      return res.status(401).json({
        error: { message: "Fel användarnamn eller lösenord" },
      });
    }

    const token = signToken({
      sub: user.userId,
      email: user.email,
      role: user.role,
    });

    return res.status(200).json({
      token,
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("POST /users/auth/login failed", error);
    return res.status(500).json({
      error: { message: "Fel vid inloggning" },
    });
  }
});

export default usersRouter;
