import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { dateOnly } from "../utils.js";
import { diaryEntrySchema, documentSchema, evolutionSchema, medicalRecordSchema, patientSchema } from "../validators.js";

export const patientsRouter = Router();

async function ownedPatient(id: string, therapistId: string) {
  return prisma.patient.findFirst({ where: { id, therapistId } });
}

const moodLabels = {
  HAPPY: "Feliz",
  NEUTRAL: "Neutro",
  SAD: "Triste",
  ANXIOUS: "Ansioso",
  TIRED: "Cansado",
} as const;

function parseReportDate(value: unknown, fallback: Date, endOfDay = false) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback;
  return new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`);
}

function roundAverage(values: number[]) {
  return values.length ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10 : null;
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
      diaryEntries: { orderBy: { createdAt: "desc" }, take: 5 },
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

patientsRouter.get("/:id/diary", async (req, res) => {
  if (!(await ownedPatient(req.params.id, req.therapistId!))) {
    return res.status(404).json({ message: "Paciente não encontrado." });
  }
  const entries = await prisma.patientDiaryEntry.findMany({
    where: { patientId: req.params.id, therapistId: req.therapistId! },
    orderBy: { createdAt: "desc" },
  });
  res.json(entries);
});

patientsRouter.get("/:id/diary/weekly-report", async (req, res) => {
  const patient = await ownedPatient(req.params.id, req.therapistId!);
  if (!patient) return res.status(404).json({ message: "Paciente não encontrado." });

  const defaultEnd = new Date();
  defaultEnd.setUTCHours(23, 59, 59, 999);
  const defaultStart = new Date(defaultEnd);
  defaultStart.setUTCDate(defaultEnd.getUTCDate() - 6);
  defaultStart.setUTCHours(0, 0, 0, 0);
  const startDate = parseReportDate(req.query.startDate, defaultStart);
  const endDate = parseReportDate(req.query.endDate, defaultEnd, true);
  if (startDate > endDate) return res.status(400).json({ message: "O período informado é inválido." });

  const entries = await prisma.patientDiaryEntry.findMany({
    where: {
      patientId: patient.id,
      therapistId: req.therapistId!,
      createdAt: { gte: startDate, lte: endDate },
    },
    orderBy: { createdAt: "asc" },
  });

  const moodCounts = entries.reduce<Record<string, number>>((counts, entry) => {
    counts[entry.mood] = (counts[entry.mood] || 0) + 1;
    return counts;
  }, {});
  const predominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const averageEmotional = roundAverage(entries.map((entry) => entry.emotionalScale));
  const averageStress = roundAverage(entries.map((entry) => entry.stressLevel));
  const sleepValues = entries.flatMap((entry) => entry.sleepQuality == null ? [] : [entry.sleepQuality]);
  const averageSleep = roundAverage(sleepValues);
  const maxStress = entries.length ? Math.max(...entries.map((entry) => entry.stressLevel)) : null;

  const expectedDates: string[] = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    expectedDates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  const recordedDates = new Set(entries.map((entry) => entry.createdAt.toISOString().slice(0, 10)));
  const missingDates = expectedDates.filter((date) => !recordedDates.has(date));
  const highStressEntries = entries.filter((entry) => entry.stressLevel >= 7);
  const difficultMoodEntries = entries.filter((entry) => ["SAD", "ANXIOUS", "TIRED"].includes(entry.mood));
  const emotionalDrops = entries.slice(1).filter((entry, index) => entry.emotionalScale < entries[index].emotionalScale);
  const caregiverNotes = entries.filter((entry) => entry.patientOrCaregiverNotes);

  const attentionPoints: string[] = [];
  if (highStressEntries.length) attentionPoints.push(`${highStressEntries.length} dia(s) com estresse elevado (7 ou mais).`);
  if (difficultMoodEntries.length) attentionPoints.push(`${difficultMoodEntries.length} registro(s) com humor triste, ansioso ou cansado.`);
  if (missingDates.length) attentionPoints.push(`${missingDates.length} dia(s) sem registro no período.`);
  if (emotionalDrops.length) attentionPoints.push("Foi identificada queda na escala emocional ao longo da semana.");
  if (caregiverNotes.length) attentionPoints.push(`${caregiverNotes.length} observação(ões) do paciente ou responsável requerem leitura.`);

  const suggestions = new Set<string>();
  if (highStressEntries.length) suggestions.add("Investigar gatilhos de estresse e revisar estratégias de autorregulação.");
  if (missingDates.length >= 2) suggestions.add("Revisar a rotina da semana e possíveis barreiras para o registro diário.");
  if (difficultMoodEntries.length) suggestions.add("Conversar sobre situações associadas a tristeza, ansiedade ou cansaço.");
  if (averageSleep != null && averageSleep < 6) suggestions.add("Observar sono, cansaço e impacto na participação ocupacional.");
  if (entries.some((entry) => entry.mood === "HAPPY")) suggestions.add("Retomar atividades que favoreceram bem-estar e engajamento.");
  if (!suggestions.size) suggestions.add("Manter o acompanhamento da rotina e reforçar estratégias que sustentaram o bem-estar.");

  res.json({
    patient: { id: patient.id, name: patient.name, mainCondition: patient.mainCondition },
    period: { startDate: startDate.toISOString(), endDate: endDate.toISOString(), issuedAt: new Date().toISOString() },
    entries,
    recordCount: entries.length,
    predominantMood,
    predominantMoodLabel: predominantMood ? moodLabels[predominantMood as keyof typeof moodLabels] : null,
    averageEmotional,
    averageStress,
    maxStress,
    averageSleep,
    moodDistribution: moodCounts,
    missingDates,
    attentionPoints,
    suggestions: [...suggestions],
  });
});

patientsRouter.post("/:id/diary", async (req, res) => {
  const data = diaryEntrySchema.parse(req.body);
  if (!(await ownedPatient(req.params.id, req.therapistId!))) {
    return res.status(404).json({ message: "Paciente não encontrado." });
  }
  const entry = await prisma.patientDiaryEntry.create({
    data: {
      ...data,
      tags: data.tags ?? undefined,
      patientId: req.params.id,
      therapistId: req.therapistId!,
    },
  });
  res.status(201).json(entry);
});

patientsRouter.put("/:id/diary/:entryId", async (req, res) => {
  const data = diaryEntrySchema.parse(req.body);
  if (!(await ownedPatient(req.params.id, req.therapistId!))) {
    return res.status(404).json({ message: "Paciente não encontrado." });
  }
  const entry = await prisma.patientDiaryEntry.findFirst({
    where: { id: req.params.entryId, patientId: req.params.id, therapistId: req.therapistId! },
  });
  if (!entry) return res.status(404).json({ message: "Registro do diário não encontrado." });
  res.json(await prisma.patientDiaryEntry.update({
    where: { id: entry.id },
    data: { ...data, tags: data.tags ?? undefined },
  }));
});

patientsRouter.delete("/:id/diary/:entryId", async (req, res) => {
  if (!(await ownedPatient(req.params.id, req.therapistId!))) {
    return res.status(404).json({ message: "Paciente não encontrado." });
  }
  const entry = await prisma.patientDiaryEntry.findFirst({
    where: { id: req.params.entryId, patientId: req.params.id, therapistId: req.therapistId! },
  });
  if (!entry) return res.status(404).json({ message: "Registro do diário não encontrado." });
  await prisma.patientDiaryEntry.delete({ where: { id: entry.id } });
  res.status(204).send();
});
