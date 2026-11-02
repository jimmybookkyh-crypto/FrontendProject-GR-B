import dotenv from "dotenv";

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../db/pool.js";

dotenv.config();

export const VALID_ROLES = ["user", "admin"] as const;
export type Role = (typeof VALID_ROLES)[number];

export function isValidRole(value: unknown): value is Role {
  return (
    typeof value === "string" &&
    (VALID_ROLES as readonly string[]).includes(value)
  );
}

export interface AuthUser {
  userId: string;
  role: Role;
}

/* requireAuth 
   1. Kontrollerar att token är äkta och inte har gått ut.
   2. Slår upp användaren i databasen vid varje anrop:
      - Kontot raderat  -> 401, token slutar gälla direkt.
      - Rollen ändrad   -> rollen hämtas från databasen, inte från token,
                           så en admin som blivit "user" förlorar admin-rätten direkt. */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  // Kontrollera att Authorization-headern finns
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      error: { message: "Autentisering krävs, du måste vara inloggad" },
    });
  }

  // Plockar token från headern och tar bort "Bearer "
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: { message: "Token saknas" },
    });
  }

  // Nyckel för att verifiera token, måste finnas i .env-filen
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({
      error: { message: "Serverns autentisering är inte konfigurerad" },
    });
  }

  // 1. Verifiera token
  let userIdFromToken: string;

  try {
    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === "string" ||
      (typeof decoded.sub !== "string" && typeof decoded.sub !== "number")
    ) {
      return res.status(401).json({
        error: { message: "Ogiltig token" },
      });
    }

    userIdFromToken = String(decoded.sub);
  } catch {
    return res.status(401).json({
      error: { message: "Ogiltig eller utgången token, logga in igen" },
    });
  }

  // 2. Kontrollera att kontot finns kvar och hämta aktuell roll
  try {
    const { rows } = await pool.query<{ userId: string; role: string }>(
      `select "userId", role from users where "userId" = $1`,
      [userIdFromToken],
    );

    if (rows.length === 0) {
      return res.status(401).json({
        error: { message: "Kontot finns inte längre, logga in igen" },
      });
    }

    const { userId, role } = rows[0];

    if (!isValidRole(role)) {
      return res.status(403).json({
        error: { message: "Kontot har en ogiltig roll, kontakta biografen" },
      });
    }

    const user: AuthUser = { userId: String(userId), role };

    // Spara användaren för senare middleware och routes
    res.locals.user = user;

    return next();
  } catch (error) {
    console.error("requireAuth: user lookup failed", error);
    return res.status(500).json({
      error: { message: "Kunde inte kontrollera inloggningen" },
    });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (res.locals.user?.role !== "admin") {
    return res
      .status(403)
      .json({ error: { message: "Endast för administratörer" } });
  }
  next();
}
