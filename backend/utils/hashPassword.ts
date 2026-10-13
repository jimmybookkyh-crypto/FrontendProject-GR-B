import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 13;

export async function hashPassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { password } = req.body ?? {};

    // bcrypt använder bara de första 72 byten, så längre lösenord nekas
    if (
      typeof password !== "string" ||
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        error: {
          message: "Lösenordet måste vara minst 8 tecken och högst 72 byte",
        },
      });
    }

    // Spara hashen under ett nytt namn och ta bort originalet,
    // så att lösenordet i klartext aldrig når routen eller databasen
    req.body.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    delete req.body.password;

    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    console.error("hashPassword failed", { message });

    return res.status(500).json({
      error: { message: "Fel vid hantering av lösenord" },
    });
  }
}
