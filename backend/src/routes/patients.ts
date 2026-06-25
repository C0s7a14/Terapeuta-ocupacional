import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { dateOnly } from "../utils.js";
import { documentSchema, evolutionSchema, medicalRecordSchema, patientSchema } from "../validators.js";

export const patientsRouter = Router();

async function ownedPatient(id: string, therapistId: string) {
  return prisma.patient.findFirst({ where: { id, therapistId } });
}

patientsRouter.get("/", async (req, res) => {
  const search = String(req.query.search ?? "");
  const patients = await prisma.patient.findMany({
    where: {
      therapistId: req.therapistId!,
      name: search ? { contains: search } : undefined,
    },
    orderBy: { name: "asc" },
    include: { _count: { select: { evolutions: true, appointments: true, documents: true } } },
  });
  res.json(patients);
});

patientsRouter.post("/", async (req, res) => {
  const data = patientSchema.parse(req.body);
  const patient = await prisma.patient.create({
    data: {
      ...data,
      email: data.email || null,
      birthDate: dateOnly(data.birthDate),
      therapistId: req.therapistId!,
      medicalRecord: { create: {} },
    },
    include: { medicalRecord: true },
  });
  res.status(201).json(patient);
});

patientsRouter.get("/:id", async (req, res) => {
  const patient = await prisma.patient.findFirst({
    where: { id: req.params.id, therapistId: req.therapistId! },
    include: {
      medicalRecord: true,
      evolutions: { orderBy: [{ sessionDate: "desc" }, { time: "desc" }] },
      appointments: { orderBy: [{ date: "desc" }, { startTime: "desc" }] },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!patient) return res.status(404).json({ message: "Paciente não encontrado." });
  res.json(patient);
});

patientsRouter.put("/:id", async (req, res) => {
  const data = patientSchema.parse(req.body);
  if (!(await ownedPatient(req.params.id, req.therapistId!))) {
    return res.status(404).json({ message: "Paciente não encontrado." });
  }
  const patient = await prisma.patient.update({
    where: { id: req.params.id },
    data: { ...data, email: data.email || null, birthDate: dateOnly(data.birthDate) },
  });
  res.json(patient);
});

patientsRouter.patch("/:id/status", async (req, res) => {
  const status = req.body.status === "ACTIVE" ? "ACTIVE" : "INACTIVE";
  if (!(await ownedPatient(req.params.id, req.therapistId!))) {
    return res.status(404).json({ message: "Paciente não encontrado." });
  }
  res.json(await prisma.patient.update({ where: { id: req.params.id }, data: { status } }));
});

patientsRouter.put("/:id/medical-record", async (req, res) => {
  const data = medicalRecordSchema.parse(req.body);
  if (!(await ownedPatient(req.params.id, req.therapistId!))) {
    return res.status(404).json({ message: "Paciente não encontrado." });
  }
  const record = await prisma.medicalRecord.upsert({
    where: { patientId: req.params.id },
    update: data,
    create: { ...data, patientId: req.params.id },
  });
  res.json(record);
});

patientsRouter.post("/:id/evolutions", async (req, res) => {
  const data = evolutionSchema.parse(req.body);
  if (!(await ownedPatient(req.params.id, req.therapistId!))) {
    return res.status(404).json({ message: "Paciente não encontrado." });
  }
  const evolution = await prisma.sessionEvolution.create({
    data: {
      ...data,
      sessionDate: dateOnly(data.sessionDate),
      patientId: req.params.id,
      therapistId: req.therapistId!,
    },
  });
  res.status(201).json(evolution);
});

patientsRouter.put("/:id/evolutions/:evolutionId", async (req, res) => {
  const data = evolutionSchema.parse(req.body);
  const evolution = await prisma.sessionEvolution.findFirst({
    where: { id: req.params.evolutionId, patientId: req.params.id, therapistId: req.therapistId! },
  });
  if (!evolution) return res.status(404).json({ message: "Evolução não encontrada." });
  res.json(await prisma.sessionEvolution.update({
    where: { id: evolution.id },
    data: { ...data, sessionDate: dateOnly(data.sessionDate) },
  }));
});

patientsRouter.delete("/:id/evolutions/:evolutionId", async (req, res) => {
  const evolution = await prisma.sessionEvolution.findFirst({
    where: { id: req.params.evolutionId, patientId: req.params.id, therapistId: req.therapistId! },
  });
  if (!evolution) return res.status(404).json({ message: "Evolução não encontrada." });
  await prisma.sessionEvolution.delete({ where: { id: evolution.id } });
  res.status(204).send();
});

patientsRouter.post("/:id/documents", async (req, res) => {
  const data = documentSchema.parse(req.body);
  if (!(await ownedPatient(req.params.id, req.therapistId!))) {
    return res.status(404).json({ message: "Paciente não encontrado." });
  }
  const document = await prisma.patientDocument.create({
    data: { ...data, patientId: req.params.id, therapistId: req.therapistId! },
  });
  res.status(201).json(document);
});

patientsRouter.delete("/:id/documents/:documentId", async (req, res) => {
  const document = await prisma.patientDocument.findFirst({
    where: { id: req.params.documentId, patientId: req.params.id, therapistId: req.therapistId! },
  });
  if (!document) return res.status(404).json({ message: "Documento não encontrado." });
  await prisma.patientDocument.delete({ where: { id: document.id } });
  res.status(204).send();
});

