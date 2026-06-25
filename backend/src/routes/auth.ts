import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { loginSchema, registerSchema } from "../validators.js";
import { publicTherapist, signToken } from "../utils.js";
import { authenticate } from "../middlewares/auth.js";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const data = registerSchema.parse(req.body);
  const passwordHash = await bcrypt.hash(data.password, 12);
  const therapist = await prisma.therapist.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      phone: data.phone || null,
      professionalId: data.professionalId || null,
    },
  });
  res.status(201).json({ token: signToken(therapist.id), therapist: publicTherapist(therapist) });
});

authRouter.post("/login", async (req, res) => {
  const data = loginSchema.parse(req.body);
  const therapist = await prisma.therapist.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (!therapist || !(await bcrypt.compare(data.password, therapist.passwordHash))) {
    return res.status(401).json({ message: "E-mail ou senha inválidos." });
  }

  res.json({ token: signToken(therapist.id), therapist: publicTherapist(therapist) });
});

authRouter.get("/me", authenticate, async (req, res) => {
  const therapist = await prisma.therapist.findUniqueOrThrow({ where: { id: req.therapistId } });
  res.json(publicTherapist(therapist));
});

