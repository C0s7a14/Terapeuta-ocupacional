import { LoaderCircle, Save } from "lucide-react";
import { useState, type FormEvent } from "react";
import { MoodSelector } from "./PatientDiary";
import type { DiaryMood } from "../types";

export type PortalDiaryFormData = {
  mood: DiaryMood | null;
  emotionalScale: number;
  stressLevel: number;
  sleepQuality: number;
  description: string;
  activities: string;
  patientOrCaregiverNotes: string;
};

export const emptyPortalDiaryForm: PortalDiaryFormData = {
  mood: null,
  emotionalScale: 5,
  stressLevel: 5,
  sleepQuality: 5,
  description: "",
  activities: "",
  patientOrCaregiverNotes: "",
};

export function PortalDiaryForm({ value, onChange, onSubmit, saving }: { value: PortalDiaryFormData; onChange: (value: PortalDiaryFormData) => void; onSubmit: (event: FormEvent) => void; saving: boolean }) {
  return (
    <form onSubmit={onSubmit} className="space-y-7">
      <div><h2 className="text-xl font-semibold text-stone-800">Como você está se sentindo hoje?</h2><p className="mt-1 text-sm text-stone-500">Escolha a opção que mais combina com o seu dia.</p></div>
      <MoodSelector value={value.mood} onChange={(mood) => onChange({ ...value, mood })} compact />
      <PortalScale label="Como foi seu dia?" low="Muito difícil" high="Muito bom" value={value.emotionalScale} onChange={(emotionalScale) => onChange({ ...value, emotionalScale })} />
      <PortalScale label="Quanto estresse você sentiu?" low="Pouco" high="Muito" value={value.stressLevel} tone="orange" onChange={(stressLevel) => onChange({ ...value, stressLevel })} />
      <PortalScale label="Como foi seu sono?" low="Ruim" high="Ótimo" value={value.sleepQuality} tone="purple" onChange={(sleepQuality) => onChange({ ...value, sleepQuality })} />
      <PortalArea label="Conte um pouco sobre o seu dia *" placeholder="O que aconteceu? Como você se sentiu?" required value={value.description} onChange={(description) => onChange({ ...value, description })} />
      <PortalArea label="O que você fez hoje?" placeholder="Escola, trabalho, brincadeiras, passeios..." value={value.activities} onChange={(activities) => onChange({ ...value, activities })} />
      <PortalArea label="Quer deixar mais alguma observação?" placeholder="Você ou seu responsável podem escrever aqui." value={value.patientOrCaregiverNotes} onChange={(patientOrCaregiverNotes) => onChange({ ...value, patientOrCaregiverNotes })} />
      <button className="btn-primary min-h-14 w-full text-base" disabled={saving}>{saving ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}{saving ? "Salvando..." : "Salvar meu registro"}</button>
    </form>
  );
}

function PortalScale({ label, low, high, value, onChange, tone = "rose" }: { label: string; low: string; high: string; value: number; onChange: (value: number) => void; tone?: "rose" | "orange" | "purple" }) {
  const active = tone === "orange" ? "bg-orange-500 border-orange-500" : tone === "purple" ? "bg-purple-500 border-purple-500" : "bg-rosewood-600 border-rosewood-600";
  return <fieldset><legend className="mb-3 font-semibold text-stone-700">{label}</legend><div className="grid grid-cols-5 gap-2 sm:grid-cols-10">{Array.from({ length: 10 }, (_, index) => index + 1).map((number) => <button key={number} type="button" onClick={() => onChange(number)} className={`h-11 rounded-xl border text-sm font-semibold transition ${value === number ? `${active} text-white shadow-md` : "border-stone-200 bg-white text-stone-500 hover:border-rosewood-200"}`}>{number}</button>)}</div><div className="mt-2 flex justify-between text-xs text-stone-400"><span>{low}</span><span>{high}</span></div></fieldset>;
}

function PortalArea({ label, placeholder, value, onChange, required = false }: { label: string; placeholder: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return <label><span className="mb-2 block font-semibold text-stone-700">{label}</span><textarea className="field min-h-28 resize-y text-base" required={required} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
