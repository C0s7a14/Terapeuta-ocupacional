import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { dateOnly } from "../utils.js";
import { appointmentSchema } from "../validators.js";

export const appointmentsRouter = Router();

appointmentsRouter.get("/", async (req, res) => {
  const appointments = await prisma.appointment.findMany({
    where: { therapistId: req.therapistId! },
    include: { patient: { select: { id: true, name: true, status: true } } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
  res.json(appointments);
});

appointmentsRouter.post("/", async (req, res) => {
  const data = appointmentSchema.parse(req.body);
  const patient = await prisma.patient.findFirst({
    where: { id: data.patientId, therapistId: req.therapistId! },
  });
  if (!patient) return res.status(404).json({ message: "Paciente não encontrado." });
  const appointment = await prisma.appointment.create({
    data: { ...data, date: dateOnly(data.date), therapistId: req.therapistId! },
    include: { patient: { select: { id: true, name: true } } },
  });
  res.status(201).json(appointment);
});

appointmentsRouter.put("/:id", async (req, res) => {
  const data = appointmentSchema.parse(req.body);
  const appointment = await prisma.appointment.findFirst({
    where: { id: req.params.id, therapistId: req.therapistId! },
  });
  const patient = await prisma.patient.findFirst({
    where: { id: data.patientId, therapistId: req.therapistId! },
  });
  if (!appointment || !patient) return res.status(404).json({ message: "Agendamento não encontrado." });
  res.json(await prisma.appointment.update({
    where: { id: appointment.id },
    data: { ...data, date: dateOnly(data.date) },
    include: { patient: { select: { id: true, name: true } } },
  }));
});

appointmentsRouter.delete("/:id", async (req, res) => {
  const appointment = await prisma.appointment.findFirst({
    where: { id: req.params.id, therapistId: req.therapistId! },
  });
  if (!appointment) return res.status(404).json({ message: "Agendamento não encontrado." });
  await prisma.appointment.delete({ where: { id: appointment.id } });
  res.status(204).send();
});

