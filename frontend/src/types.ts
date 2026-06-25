export type CareType = "CLINICAL" | "HOME" | "SCHOOL" | "ONLINE";
export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELED" | "NO_SHOW";
export type PatientStatus = "ACTIVE" | "INACTIVE";
export type DiaryMood = "HAPPY" | "NEUTRAL" | "SAD" | "ANXIOUS" | "TIRED";

export interface Therapist {
  id: string;
  name: string;
  email: string;
  phone?: string;
  professionalId?: string;
}

export interface PortalAccount {
  id: string;
  name: string;
  email: string;
  patient: {
    id: string;
    name: string;
    birthDate: string;
    guardian?: string;
  };
}

export interface PortalDiaryEntry {
  id: string;
  mood: DiaryMood;
  emotionalScale: number;
  stressLevel: number;
  sleepQuality?: number;
  description: string;
  activities?: string;
  patientOrCaregiverNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id?: string;
  initialAssessment?: string;
  therapeuticGoals?: string;
  therapeuticPlan?: string;
  suggestedFrequency?: string;
  clinicalNotes?: string;
}

export interface Evolution {
  id: string;
  sessionDate: string;
  time: string;
  careType: CareType;
  sessionGoal: string;
  activitiesPerformed: string;
  patientPerformance: string;
  observedDifficulties?: string;
  perceivedProgress?: string;
  nextSteps?: string;
  patient?: Pick<Patient, "id" | "name">;
}

export interface Appointment {
  id: string;
  patientId: string;
  date: string;
  startTime: string;
  endTime: string;
  careType: CareType;
  status: AppointmentStatus;
  notes?: string;
  patient: Pick<Patient, "id" | "name">;
}

export interface PatientDocument {
  id: string;
  name: string;
  type: string;
  description?: string;
  url?: string;
  createdAt: string;
}

export interface PatientDiaryEntry {
  id: string;
  patientId: string;
  therapistId: string;
  mood: DiaryMood;
  emotionalScale: number;
  stressLevel: number;
  sleepQuality?: number;
  description: string;
  activities?: string;
  therapistNotes?: string;
  patientOrCaregiverNotes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyDiaryReport {
  patient: Pick<Patient, "id" | "name" | "mainCondition">;
  period: { startDate: string; endDate: string; issuedAt: string };
  entries: PatientDiaryEntry[];
  recordCount: number;
  predominantMood: DiaryMood | null;
  predominantMoodLabel: string | null;
  averageEmotional: number | null;
  averageStress: number | null;
  maxStress: number | null;
  averageSleep: number | null;
  moodDistribution: Partial<Record<DiaryMood, number>>;
  missingDates: string[];
  attentionPoints: string[];
  suggestions: string[];
}

export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  guardian?: string;
  phone?: string;
  email?: string;
  address?: string;
  mainCondition?: string;
  initialComplaint?: string;
  clinicalHistory?: string;
  generalNotes?: string;
  status: PatientStatus;
  medicalRecord?: MedicalRecord;
  evolutions?: Evolution[];
  appointments?: Appointment[];
  documents?: PatientDocument[];
  diaryEntries?: PatientDiaryEntry[];
  _count?: { evolutions: number; appointments: number; documents: number };
}
