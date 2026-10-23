import type { Request, Response, NextFunction } from "express";
import { requireAuth } from "./requireAuth.js";

/* Valfri inloggning (T126b).
   Används där både gäster och inloggade får göra anropet, t.ex. POST /bookings.

   - Ingen Authorization-header: gäst, res.locals.user blir undefined.
   - Header finns: token kontrolleras precis som i requireAuth.
     En ogiltig eller utgången token ger 401, den blir alltså inte tyst en gästbokning. 
     Vi återanvänder requireAuth, så finns logiken bara på ett ställe.*/
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.headers.authorization) {
    return next();
  }

  return requireAuth(req, res, next);
}
