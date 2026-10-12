

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthUser {
  userId: string;
  role: "user" | "admin";
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  // Kontrollera att Authorization-headern finns
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token missing",
    });
  }

  //nyckel för att verifiera token, måste finnas i .env filen
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({
      message: "Server authentication is not configured",
    });
  }

  try {
    const decoded = jwt.verify(token, secret);

    // Kontrollera att token innehåller den data vi behöver
    if (
      typeof decoded === "string" ||
      typeof decoded.sub !== "string" ||
      !["user", "admin"].includes(String(decoded.role))
    ) {
      return res.status(401).json({
        message: "Invalid token payload",
      });
    }

    const user: AuthUser = {
      userId: decoded.sub,
      role: decoded.role as AuthUser["role"],
    };

    // Spara användaren för senare middleware och routes
    res.locals.user = user;

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}