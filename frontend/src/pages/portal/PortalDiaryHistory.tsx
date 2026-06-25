import { CalendarDays, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { diaryMoods } from "../../components/PatientDiary";
import { EmptyState } from "../../components/ui";
import { getErrorMessage, portalApi } from "../../lib/api";
import type { PortalDiaryEntry } from "../../types";

export function PortalDiaryHistory() {
  const [entries, setEntries] = useState<PortalDiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function load() {
    setLoading(true); setError("");
    try { const { data } = await portalApi.get<PortalDiaryEntry[]>("/portal/diary"); setEntries(data); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-stone-500"><LoaderCircle className="h-5 w-5 animate-spin text-rosewood-500" />Carregando seu diário...</div>;
  if (error) return <EmptyState title="Não foi possível carregar seu diário" description={error} action={<button className="btn-primary" onClick={load}>Tentar novamente</button>} />;
  return (
    <section className="space-y-5">
      <div><p className="eyebrow mb-2">Seu acompanhamento</p><h1 className="text-3xl font-semibold tracking-tight text-stone-800">Meu diário</h1><p className="mt-2 text-sm text-stone-500">{entries.length} {entries.length === 1 ? "registro enviado" : "registros enviados"}.</p></div>
      {entries.length ? <div className="space-y-4">{entries.map((entry) => { const mood = diaryMoods.find((item) => item.value === entry.mood)!; const Icon = mood.icon; return <article key={entry.id} className="card"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div className="flex gap-3"><span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${mood.colors}`}><Icon className="h-6 w-6" /></span><div><p className="font-semibold text-stone-700">{mood.label}</p><div className="mt-1 flex flex-wrap gap-2 text-xs text-stone-500"><span>Dia {entry.emotionalScale}/10</span><span>Estresse {entry.stressLevel}/10</span>{entry.sleepQuality != null && <span>Sono {entry.sleepQuality}/10</span>}</div></div></div><span className="flex items-center gap-1.5 text-xs text-stone-400"><CalendarDays className="h-4 w-4" />{new Date(entry.createdAt).toLocaleDateString("pt-BR")}</span></div><p className="mt-4 text-sm leading-6 text-stone-600">{entry.description}</p>{entry.activities && <HistoryText label="Atividades" text={entry.activities} />}{entry.patientOrCaregiverNotes && <HistoryText label="Observação enviada" text={entry.patientOrCaregiverNotes} />}</article>; })}</div> : <EmptyState title="Seu diário ainda está vazio" description="Faça o primeiro registro para compartilhar como foi o seu dia." />}
    </section>
  );
}

function HistoryText({ label, text }: { label: string; text: string }) {
  return <div className="mt-3 rounded-2xl bg-stone-50 p-3"><p className="text-xs font-semibold uppercase tracking-wider text-stone-400">{label}</p><p className="mt-1 text-sm leading-6 text-stone-500">{text}</p></div>;
}
