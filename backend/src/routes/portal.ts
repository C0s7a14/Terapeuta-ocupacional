import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { authenticatePortal } from "../middlewares/portalAuth.js";
import { signPortalToken } from "../utils.js";
import { portalDiaryEntrySchema, portalLoginSchema } from "../validators.js";

export const portalAuthRouter = Router();
export const portalRouter = Router();

const safeEntrySelect = {
  id: true,
  mood: true,
  emotionalScale: true,
  stressLevel: true,
  sleepQuality: true,
  description: true,
  activities: true,
  patientOrCaregiverNotes: true,
  createdAt: true,
  updatedAt: true,
} as const;

async function activePortalAccount(id: string) {
  return prisma.patientPortalAccount.findFirst({
    where: { id, isActive: true, patient: { status: "ACTIVE" } },
    include: { patient: { select: { id: true, therapistId: true, name: true, birthDate: true, guardian: true } } },
  });
}

function publicPortalAccount(account: NonNullable<Awaited<ReturnType<typeof activePortalAccount>>>) {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    patient: {
      id: account.patient.id,
      name: account.patient.name,
      birthDate: account.patient.birthDate,
      guardian: account.patient.guardian,
    },
  };
}

portalAuthRouter.post("/login", async (req, res) => {
  const data = portalLoginSchema.parse(req.body);
  const account = await prisma.patientPortalAccount.findUnique({
    where: { email: data.email.toLowerCase() },
    include: { patient: { select: { id: true, therapistId: true, name: true, birthDate: true, guardian: true, status: true } } },
  });
  if (!account || !account.isActive || account.patient.status !== "ACTIVE" || !(await bcrypt.compare(data.password, account.passwordHash))) {
    return res.status(401).json({ message: "E-mail ou senha inválidos." });
  }
  res.json({ token: signPortalToken(account.id), account: publicPortalAccount(account) });
});

portalAuthRouter.get("/me", authenticatePortal, async (req, res) => {
  const account = await activePortalAccount(req.portalAccountId!);
  if (!account) return res.status(401).json({ message: "Conta do portal inativa ou não encontrada." });
  res.json(publicPortalAccount(account));
});

portalRouter.use(authenticatePortal);

portalRouter.get("/me", async (req, res) => {
  const account = await activePortalAccount(req.portalAccountId!);
  if (!account) return res.status(401).json({ message: "Conta do portal inativa ou não encontrada." });
  res.json(publicPortalAccount(account));
});

portalRouter.get("/diary", async (req, res) => {
  const account = await activePortalAccount(req.portalAccountId!);
  if (!account) return res.status(401).json({ message: "Conta do portal inativa ou não encontrada." });
  const entries = await prisma.patientDiaryEntry.findMany({
    where: { patientId: account.patient.id, therapistId: account.patient.therapistId },
    select: safeEntrySelect,
    orderBy: { createdAt: "desc" },
  });
  res.json(entries);
});

portalRouter.post("/diary", async (req, res) => {
  const data = portalDiaryEntrySchema.parse(req.body);
  const account = await activePortalAccount(req.portalAccountId!);
  if (!account) return res.status(401).json({ message: "Conta do portal inativa ou não encontrada." });
  const entry = await prisma.patientDiaryEntry.create({
    data: {
      ...data,
      patientId: account.patient.id,
      therapistId: account.patient.therapistId,
      therapistNotes: null,
      tags: undefined,
    },
    select: safeEntrySelect,
  });
  res.status(201).json(entry);
});
