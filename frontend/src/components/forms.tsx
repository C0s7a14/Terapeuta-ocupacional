import type { FormEvent } from "react";
import type { CareType, MedicalRecord, Patient } from "../types";
import { dateInput } from "../lib/format";

export type PatientFormData = Omit<Patient, "id" | "medicalRecord" | "evolutions" | "appointments" | "documents" | "_count">;

export const emptyPatient: PatientFormData = {
  name: "", birthDate: "", guardian: "", phone: "", email: "", address: "", mainCondition: "",
  initialComplaint: "", clinicalHistory: "", generalNotes: "", status: "ACTIVE",
};

const Field = ({ label, name, value, onChange, type = "text", required = false }: { label: string; name: string; value: string; onChange: (name: string, value: string) => void; type?: string; required?: boolean }) => (
  <label><span className="label">{label}{required && " *"}</span><input className="field" type={type} value={value} required={required} onChange={(e) => onChange(name, e.target.value)} /></label>
);

const Area = ({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: (name: string, value: string) => void }) => (
  <label><span className="label">{label}</span><textarea className="field min-h-24 resize-y" value={value} onChange={(e) => onChange(name, e.target.value)} /></label>
);

export function PatientForm({ value, onChange, onSubmit, saving }: { value: PatientFormData; onChange: (value: PatientFormData) => void; onSubmit: (e: FormEvent) => void; saving: boolean }) {
  const set = (name: string, fieldValue: string) => onChange({ ...value, [name]: fieldValue });
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome" name="name" value={value.name} onChange={set} required />
        <Field label="Data de nascimento" name="birthDate" type="date" value={dateInput(value.birthDate)} onChange={set} required />
        <Field label="Responsável" name="guardian" value={value.guardian || ""} onChange={set} />
        <Field label="Telefone" name="phone" value={value.phone || ""} onChange={set} />
        <Field label="E-mail" name="email" type="email" value={value.email || ""} onChange={set} />
        <label><span className="label">Status</span><select className="field" value={value.status} onChange={(e) => set("status", e.target.value)}><option value="ACTIVE">Ativo</option><option value="INACTIVE">Inativo</option></select></label>
      </div>
      <Field label="Endereço" name="address" value={value.address || ""} onChange={set} />
      <Area label="Diagnóstico ou condição principal" name="mainCondition" value={value.mainCondition || ""} onChange={set} />
      <Area label="Queixa inicial" name="initialComplaint" value={value.initialComplaint || ""} onChange={set} />
      <Area label="Histórico clínico" name="clinicalHistory" value={value.clinicalHistory || ""} onChange={set} />
      <Area label="Observações gerais" name="generalNotes" value={value.generalNotes || ""} onChange={set} />
      <div className="flex justify-end"><button className="btn-primary" disabled={saving}>{saving ? "Salvando..." : "Salvar paciente"}</button></div>
    </form>
  );
}

export type EvolutionFormData = {
  sessionDate: string; time: string; careType: CareType; sessionGoal: string; activitiesPerformed: string;
  patientPerformance: string; observedDifficulties: string; perceivedProgress: string; nextSteps: string;
};

export const emptyEvolution: EvolutionFormData = {
  sessionDate: new Date().toISOString().slice(0, 10), time: "", careType: "CLINICAL", sessionGoal: "",
  activitiesPerformed: "", patientPerformance: "", observedDifficulties: "", perceivedProgress: "", nextSteps: "",
};

export function EvolutionForm({ value, onChange, onSubmit, saving }: { value: EvolutionFormData; onChange: (value: EvolutionFormData) => void; onSubmit: (e: FormEvent) => void; saving: boolean }) {
  const set = (name: string, fieldValue: string) => onChange({ ...value, [name]: fieldValue });
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Data da sessão" name="sessionDate" type="date" value={value.sessionDate} onChange={set} required />
        <Field label="Horário" name="time" type="time" value={value.time} onChange={set} required />
        <label><span className="label">Tipo *</span><select className="field" value={value.careType} onChange={(e) => set("careType", e.target.value)}><option value="CLINICAL">Clínico</option><option value="HOME">Domiciliar</option><option value="SCHOOL">Escolar</option><option value="ONLINE">Online</option></select></label>
      </div>
      <Area label="Objetivo da sessão" name="sessionGoal" value={value.sessionGoal} onChange={set} />
      <Area label="Atividades realizadas" name="activitiesPerformed" value={value.activitiesPerformed} onChange={set} />
      <Area label="Desempenho do paciente" name="patientPerformance" value={value.patientPerformance} onChange={set} />
      <Area label="Dificuldades observadas" name="observedDifficulties" value={value.observedDifficulties} onChange={set} />
      <Area label="Progresso percebido" name="perceivedProgress" value={value.perceivedProgress} onChange={set} />
      <Area label="Próximos passos" name="nextSteps" value={value.nextSteps} onChange={set} />
      <div className="flex justify-end"><button className="btn-primary" disabled={saving}>{saving ? "Salvando..." : "Salvar evolução"}</button></div>
    </form>
  );
}

export function MedicalRecordForm({ value, onChange, onSubmit, saving }: { value: MedicalRecord; onChange: (value: MedicalRecord) => void; onSubmit: (e: FormEvent) => void; saving: boolean }) {
  const set = (name: string, fieldValue: string) => onChange({ ...value, [name]: fieldValue });
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Area label="Avaliação inicial" name="initialAssessment" value={value.initialAssessment || ""} onChange={set} />
      <Area label="Objetivos terapêuticos" name="therapeuticGoals" value={value.therapeuticGoals || ""} onChange={set} />
      <Area label="Plano terapêutico" name="therapeuticPlan" value={value.therapeuticPlan || ""} onChange={set} />
      <Field label="Frequência sugerida" name="suggestedFrequency" value={value.suggestedFrequency || ""} onChange={set} />
      <Area label="Observações clínicas" name="clinicalNotes" value={value.clinicalNotes || ""} onChange={set} />
      <div className="flex justify-end"><button className="btn-primary" disabled={saving}>{saving ? "Salvando..." : "Salvar prontuário"}</button></div>
    </form>
  );
}

