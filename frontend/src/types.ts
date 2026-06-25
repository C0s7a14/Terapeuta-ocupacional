export type CareType = "CLINICAL" | "HOME" | "SCHOOL" | "ONLINE";
export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELED" | "NO_SHOW";
export type PatientStatus = "ACTIVE" | "INACTIVE";

export interface Therapist {
  id: string;
  name: string;
  email: string;
  phone?: string;
  professionalId?: string;
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
  _count?: { evolutions: number; appointments: number; documents: number };
}

