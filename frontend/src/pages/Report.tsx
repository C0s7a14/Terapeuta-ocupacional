import { ArrowLeft, HeartHandshake, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EmptyState, Loading } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { getErrorMessage } from "../lib/api";
import { careLabels, formatDate } from "../lib/format";
import type { Patient } from "../types";

export function Report() {
  const { id } = useParams();
  const { therapist } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState("");
  const load = async () => {
    setError("");
    try { const { data } = await api.get(`/patients/${id}`); setPatient(data); }
    catch (err) { setError(getErrorMessage(err)); }
  };
  useEffect(() => { load(); }, [id]);
  if (error && !patient) return <EmptyState title="Não foi possível preparar o relatório" description={error} action={<button className="btn-primary" onClick={load}>Tentar novamente</button>} />;
  if (!patient) return <Loading label="Preparando relatório..." />;
  const record = patient.medicalRecord;
  const evolutions = patient.evolutions?.slice(0, 5) || [];
  const diaryEntries = patient.diaryEntries?.slice(0, 5) || [];
  return (
    <div className="mx-auto max-w-4xl">
      <div className="no-print mb-5 flex items-center justify-between"><Link to={`/pacientes/${id}`} className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-rosewood-600"><ArrowLeft className="h-4 w-4" />Voltar ao paciente</Link><button className="btn-primary" onClick={() => window.print()}><Printer className="h-4 w-4" />Gerar relatório</button></div>
      <article className="print-card card overflow-hidden bg-white p-7 sm:p-12">
        <div className="-mx-12 -mt-12 mb-10 h-2 bg-gradient-to-r from-rosewood-300 via-rosewood-600 to-nude" />
        <header className="mb-10 flex flex-col justify-between gap-5 border-b border-rosewood-200 pb-6 sm:flex-row sm:items-start">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-rosewood-500 p-2.5 text-white"><HeartHandshake className="h-6 w-6" /></div><div><p className="text-xl font-semibold text-stone-800">Essentia TO</p><p className="text-xs text-rosewood-500">Terapia Ocupacional</p></div></div>
          <div className="text-right text-xs text-stone-500"><p className="font-semibold text-stone-700">{therapist?.name}</p><p>{therapist?.professionalId || "Terapeuta Ocupacional"}</p><p>{therapist?.email}</p></div>
        </header>
        <h1 className="text-center text-2xl font-semibold uppercase tracking-[.12em] text-stone-800">Relatório de acompanhamento</h1>
        <p className="mt-2 text-center text-sm text-stone-400">Emitido em {new Date().toLocaleDateString("pt-BR")}</p>
        <ReportSection title="Identificação do paciente"><div className="grid gap-3 sm:grid-cols-2"><Line label="Nome" text={patient.name} /><Line label="Data de nascimento" text={formatDate(patient.birthDate)} /><Line label="Responsável" text={patient.guardian} /><Line label="Condição principal" text={patient.mainCondition} /></div></ReportSection>
        <ReportSection title="Dados clínicos"><Line label="Queixa inicial" text={patient.initialComplaint} /><Line label="Histórico clínico" text={patient.clinicalHistory} /></ReportSection>
        <ReportSection title="Prontuário e planejamento"><Line label="Avaliação inicial" text={record?.initialAssessment} /><Line label="Objetivos terapêuticos" text={record?.therapeuticGoals} /><Line label="Plano terapêutico" text={record?.therapeuticPlan} /><Line label="Frequência sugerida" text={record?.suggestedFrequency} /><Line label="Observações clínicas" text={record?.clinicalNotes} /></ReportSection>
        <ReportSection title="Evoluções recentes">{evolutions.length ? <div className="space-y-5">{evolutions.map((evolution) => <div key={evolution.id} className="break-inside-avoid border-l-2 border-rosewood-300 pl-4"><p className="font-semibold text-stone-700">{formatDate(evolution.sessionDate)} · {evolution.time} · {careLabels[evolution.careType]}</p><div className="mt-2 space-y-2"><Line label="Objetivo" text={evolution.sessionGoal} /><Line label="Atividades" text={evolution.activitiesPerformed} /><Line label="Desempenho" text={evolution.patientPerformance} /><Line label="Progresso" text={evolution.perceivedProgress} /><Line label="Próximos passos" text={evolution.nextSteps} /></div></div>)}</div> : <p className="text-sm text-stone-500">Não há evoluções registradas.</p>}</ReportSection>
        <ReportSection title="Diário Terapêutico">{diaryEntries.length ? <div className="space-y-5">{diaryEntries.map((entry) => <div key={entry.id} className="break-inside-avoid border-l-2 border-rosewood-300 pl-4"><p className="font-semibold text-stone-700">{new Date(entry.createdAt).toLocaleDateString("pt-BR")} · {moodLabels[entry.mood]} · Escala {entry.emotionalScale}/10</p><div className="mt-2 space-y-2"><Line label="Descrição" text={entry.description} /><Line label="Atividades" text={entry.activities} /><Line label="Observações da terapeuta" text={entry.therapistNotes} />{entry.tags?.length ? <Line label="Tags" text={entry.tags.join(", ")} /> : null}</div></div>)}</div> : <p className="text-sm text-stone-500">Não há registros no diário terapêutico.</p>}</ReportSection>
        <footer className="mt-16 flex justify-end"><div className="w-64 border-t border-stone-400 pt-2 text-center text-sm"><p className="font-semibold">{therapist?.name}</p><p className="text-xs text-stone-500">{therapist?.professionalId || "Terapeuta Ocupacional"}</p></div></footer>
      </article>
    </div>
  );
}

const moodLabels = { HAPPY: "Feliz", NEUTRAL: "Neutro", SAD: "Triste", ANXIOUS: "Ansioso", TIRED: "Cansado" };

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mt-9 break-inside-avoid-page"><h2 className="mb-4 rounded-lg bg-rosewood-50 px-3 py-2 text-sm font-semibold uppercase tracking-wider text-rosewood-700 print:border-b print:border-stone-200 print:bg-white print:px-0">{title}</h2><div className="space-y-3">{children}</div></section>; }
function Line({ label, text }: { label: string; text?: string }) { return <div className="break-inside-avoid rounded-xl border border-stone-100 bg-stone-50/50 p-3 print:border-0 print:bg-white print:p-0"><p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</p><p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-stone-700">{text || "Não informado."}</p></div>; }
