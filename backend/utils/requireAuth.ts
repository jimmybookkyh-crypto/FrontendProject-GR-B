
import dotenv from 'dotenv';

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


dotenv.config();


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
      message: "Autorisering erfodras, du måste vara inloggad",
    });
  }

  //plockar token från header och tar bord "Bearer "
  const token = authHeader.split(" ")[1];

  console.log("Token:", token); // Logga token för felsökning

  if (!token) {
    return res.status(401).json({
      message: "Token saknas",
    });
  }

  //nyckel för att verifiera token, måste finnas i .env filen
  const secret = process.env.JWT_SECRET;

  console.log("JWT_SECRET:", secret); // Logga JWT_SECRET för felsökning

  if (!secret) {
    return res.status(500).json({
      message: "Server autentisering är inte konfigurad",
    });
  }

  try {
    const decoded = jwt.verify(token, secret);

    console.log("Decoded token:", decoded); // Logga dekodad token för felsökning

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
  } catch(error) {
    console.error("JWT verification error:", error);
    return res.status(401).json({
      message: "Invalid eller utgånget token",
    });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (res.locals.user?.role !== "admin") {
    return res.status(403).json({ error: { message: "Endast för administratörer" } });
  }
  next();
}