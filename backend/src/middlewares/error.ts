import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(error);

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: error.flatten().fieldErrors,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Já existe um registro com estes dados." });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
  }

  return res.status(500).json({ message: "Erro interno do servidor." });
}

