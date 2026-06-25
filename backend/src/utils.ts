import jwt from "jsonwebtoken";
import { env } from "./config.js";

export const signToken = (therapistId: string) =>
  jwt.sign({ type: "therapist", therapistId }, env.JWT_SECRET, { expiresIn: "7d" });

export const signPortalToken = (portalAccountId: string) =>
  jwt.sign({ type: "portal", portalAccountId }, env.JWT_SECRET, { expiresIn: "7d" });

export const dateOnly = (value: string) => new Date(`${value}T12:00:00.000Z`);

export function publicTherapist<T extends { passwordHash: string }>(
  therapist: T,
): Omit<T, "passwordHash"> {
  const { passwordHash: _, ...safe } = therapist;
  return safe;
}
