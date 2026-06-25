import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", async (req, res) => {
  const therapistId = req.therapistId!;
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const [totalPatients, activePatients, weeklySessions, recentEvolutions, upcomingAppointments] =
    await Promise.all([
      prisma.patient.count({ where: { therapistId } }),
      prisma.patient.count({ where: { therapistId, status: "ACTIVE" } }),
      prisma.appointment.count({
        where: { therapistId, date: { gte: startOfWeek, lt: endOfWeek }, status: { not: "CANCELED" } },
      }),
      prisma.sessionEvolution.findMany({
        where: { therapistId },
        include: { patient: { select: { id: true, name: true } } },
        orderBy: [{ sessionDate: "desc" }, { createdAt: "desc" }],
        take: 5,
      }),
      prisma.appointment.findMany({
        where: { therapistId, date: { gte: startOfToday }, status: "SCHEDULED" },
        include: { patient: { select: { id: true, name: true } } },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        take: 5,
      }),
    ]);

  res.json({ totalPatients, activePatients, weeklySessions, recentEvolutions, upcomingAppointments });
});
