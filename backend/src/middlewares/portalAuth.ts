import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config.js";

type PortalTokenPayload = { type?: string; portalAccountId?: string };

export function authenticatePortal(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Token de autenticação não informado." });

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as PortalTokenPayload;
    if (payload.type !== "portal" || !payload.portalAccountId) {
      return res.status(401).json({ message: "Token inválido para o portal." });
    }
    req.portalAccountId = payload.portalAccountId;
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
}
