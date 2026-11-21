import type { Request, Response, NextFunction } from "express";
import { requireAuth } from "./requireAuth.js";

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.headers.authorization) {
    return next();
  }

  return requireAuth(req, res, next);
}
