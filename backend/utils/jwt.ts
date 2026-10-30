import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

//fånga saknad env
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET saknas i .env-filen!");
}
//Hämta jwt nyckel och livslängd
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

export interface UserData {
  sub: number | string;
  email: string;
  role?: string;
}

// Skapar JWT-token med användaruppgifter

export const signToken = (
  userData: UserData,
  expiresIn: string = JWT_EXPIRES_IN,
): string => {
  return jwt.sign(userData, JWT_SECRET, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });
};

// Verifierar avkodar en JWT-token
// Returnerar användardatan om token är giltig, annars null

export const verifyToken = <T = UserData>(token: string): T | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch {
    // Returnerar null om token har gått ut eller ändrats
    return null;
  }
};
