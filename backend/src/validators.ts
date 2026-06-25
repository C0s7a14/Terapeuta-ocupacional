import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  professionalId: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const patientSchema = z.object({
  name: z.string().min(2),
  birthDate: z.string().date(),
  guardian: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.union([z.string().email(), z.literal("")]).optional().nullable(),
  address: z.string().optional().nullable(),
  mainCondition: z.string().optional().nullable(),
  initialComplaint: z.string().optional().nullable(),
  clinicalHistory: z.string().optional().nullable(),
  generalNotes: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const medicalRecordSchema = z.object({
  initialAssessment: z.string().optional().nullable(),
  therapeuticGoals: z.string().optional().nullable(),
  therapeuticPlan: z.string().optional().nullable(),
  suggestedFrequency: z.string().optional().nullable(),
  clinicalNotes: z.string().optional().nullable(),
});

export const evolutionSchema = z.object({
  sessionDate: z.string().date(),
  time: z.string().min(1),
  careType: z.enum(["CLINICAL", "HOME", "SCHOOL", "ONLINE"]),
  sessionGoal: z.string().min(2),
  activitiesPerformed: z.string().min(2),
  patientPerformance: z.string().min(2),
  observedDifficulties: z.string().optional().nullable(),
  perceivedProgress: z.string().optional().nullable(),
  nextSteps: z.string().optional().nullable(),
});

export const appointmentSchema = z.object({
  patientId: z.string().min(1),
  date: z.string().date(),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  careType: z.enum(["CLINICAL", "HOME", "SCHOOL", "ONLINE"]),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELED", "NO_SHOW"]).default("SCHEDULED"),
  notes: z.string().optional().nullable(),
});

export const documentSchema = z.object({
  name: z.string().min(2),
  type: z.string().min(2),
  description: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
});

