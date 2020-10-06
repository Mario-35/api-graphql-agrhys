/**
 * OAuth authentication middleware.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Router, Request, Response, NextFunction } from "express";

export const auth = Router();

auth.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
