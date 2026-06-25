import { AlertTriangle, Brain, CalendarRange, HeartPulse, LoaderCircle, Moon, Printer, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api, getErrorMessage } from "../lib/api";
import type { DiaryMood, PatientDiaryEntry, WeeklyDiaryReport as WeeklyDiaryReportData } from "../types";
import { diaryMoods } from "./PatientDiary";
import { EmptyState } from "./ui";

function defaultPeriod() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) };
}

export function WeeklyDiaryReport({ patientId }: { patientId: string }) {
  const [period, setPeriod] = useState(defaultPeriod);
  const [report, setReport] = useState<WeeklyDiaryReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<WeeklyDiaryReportData>(`/patients/${patientId}/diary/weekly-report`, { params: period });
      setReport(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [patientId]);

  if (loading && !report) return <div className="flex min-h-72 items-center justify-center gap-3 text-sm text-stone-500"><LoaderCircle className="h-5 w-5 animate-spin text-rosewood-500" />Preparando relatório semanal...</div>;
  if (!report) return <EmptyState title="Não foi possível gerar o relatório" description={error || "Tente novamente em alguns instantes."} action={<button className="btn-primary" onClick={load}>Tentar novamente</button>} />;

  const stressClass = classifyStress(report.averageStress);
  return (
    <section className="weekly-report space-y-6">
      <div className="no-print flex flex-col justify-between gap-4 rounded-3xl border border-white bg-white/75 p-4 shadow-sm sm:flex-row sm:items-end">
        <div className="grid gap-3 sm:grid-cols-2">
          <DateField label="Início" value={period.startDate} onChange={(startDate) => setPeriod({ ...period, startDate })} />
          <DateField label="Fim" value={period.endDate} onChange={(endDate) => setPeriod({ ...period, endDate })} />
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={load} disabled={loading}>{loading && <LoaderCircle className="h-4 w-4 animate-spin" />}Atualizar período</button>
          <button className="btn-primary" onClick={() => window.print()}><Printer className="h-4 w-4" />Imprimir relatório semanal</button>
        </div>
      </div>

      {error && <p className="no-print rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <article className="weekly-print card overflow-hidden bg-white p-6 sm:p-8 lg:p-10">
        <div className="-mx-10 -mt-10 mb-8 h-2 bg-gradient-to-r from-rosewood-300 via-rosewood-600 to-nude" />
        <header className="flex flex-col justify-between gap-5 border-b border-rosewood-100 pb-7 sm:flex-row sm:items-start">
          <div>
            <p className="eyebrow mb-2">Relatório semanal</p>
            <h2 className="text-2xl font-semibold tracking-tight text-stone-800">{report.patient.name}</h2>
            <p className="mt-1 text-sm text-stone-500">{report.patient.mainCondition || "Condição principal não informada"}</p>
          </div>
          <dl className="grid gap-2 text-sm sm:text-right">
            <ReportDetail label="Período" value={`${formatShortDate(report.period.startDate)} a ${formatShortDate(report.period.endDate)}`} />
            <ReportDetail label="Emitido em" value={formatShortDate(report.period.issuedAt)} />
          </dl>
        </header>

        <ReportTitle icon={HeartPulse} title="Resumo da semana" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <Metric label="Registros" value={String(report.recordCount)} />
          <Metric label="Humor predominante" value={report.predominantMoodLabel || "Sem dados"} />
          <Metric label="Média emocional" value={score(report.averageEmotional)} />
          <Metric label="Média de estresse" value={score(report.averageStress)} />
          <Metric label="Maior estresse" value={score(report.maxStress)} />
          <Metric label="Média de sono" value={score(report.averageSleep)} />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[.75fr_1.25fr]">
          <section className={`rounded-3xl border p-6 ${stressClass.card}`}>
            <div className="flex items-start justify-between">
              <div><p className="text-xs font-semibold uppercase tracking-wider opacity-70">Nível médio de estresse</p><p className="mt-3 text-5xl font-semibold">{report.averageStress ?? "—"}<span className="text-lg opacity-60">/10</span></p></div>
              <span className="rounded-2xl bg-white/70 p-3"><Brain className="h-6 w-6" /></span>
            </div>
            <p className="mt-4 text-lg font-semibold">{stressClass.label}</p>
            <p className="mt-1 text-sm leading-6 opacity-75">{stressClass.description}</p>
            {stressClass.label === "Elevado" && <div className="mt-4 flex gap-2 rounded-2xl bg-white/65 p-3 text-sm"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />Recomenda-se explorar gatilhos e estratégias de regulação na próxima sessão.</div>}
          </section>
          <section className="rounded-3xl border border-stone-100 bg-stone-50/50 p-5">
            <p className="mb-4 text-sm font-semibold text-stone-700">Tendências diárias</p>
            <div className="space-y-5">
              <LineChart entries={report.entries} field="stressLevel" color="#ea580c" label="Estresse" />
              <LineChart entries={report.entries} field="emotionalScale" color="#bf4f6b" label="Escala emocional" />
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
          <section>
            <ReportTitle icon={CalendarRange} title="Evolução diária" />
            {report.entries.length ? <div className="space-y-3">{report.entries.map((entry) => <DailyEntry key={entry.id} entry={entry} />)}</div> : <EmptyState title="Nenhum registro no período" description="O relatório será preenchido quando houver registros no Diário Terapêutico." />}
          </section>
          <section>
            <ReportTitle icon={TrendingUp} title="Distribuição de humor" />
            <MoodDistribution distribution={report.moodDistribution} total={report.recordCount} />
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <InsightCard icon={AlertTriangle} title="Pontos de atenção" items={report.attentionPoints} empty="Nenhum ponto de atenção automático neste período." tone="attention" />
          <InsightCard icon={Sparkles} title="Sugestões para a próxima sessão" items={report.suggestions} empty="Manter acompanhamento da rotina e do bem-estar." tone="suggestion" />
        </div>
      </article>
    </section>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label><span className="label">{label}</span><input className="field py-2.5" type="date" value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function ReportTitle({ icon: Icon, title }: { icon: typeof HeartPulse; title: string }) {
  return <div className="mb-4 mt-8 flex items-center gap-2"><span className="rounded-xl bg-rosewood-50 p-2 text-rosewood-500"><Icon className="h-4 w-4" /></span><h3 className="font-semibold text-stone-800">{title}</h3></div>;
}

function ReportDetail({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs uppercase tracking-wider text-stone-400">{label}</dt><dd className="font-medium text-stone-600">{value}</dd></div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-stone-100 bg-stone-50/60 p-4"><p className="text-xs text-stone-400">{label}</p><p className="mt-1 text-lg font-semibold text-stone-700">{value}</p></div>;
}

function classifyStress(value: number | null) {
  if (value == null) return { label: "Sem dados", card: "border-stone-100 bg-stone-50 text-stone-600", description: "Não há registros suficientes para classificar o estresse." };
  if (value <= 3) return { label: "Baixo", card: "border-emerald-100 bg-emerald-50 text-emerald-800", description: "Os registros indicam baixo nível médio de estresse." };
  if (value <= 6) return { label: "Moderado", card: "border-amber-100 bg-amber-50 text-amber-800", description: "O estresse merece acompanhamento, especialmente em dias de mudança de rotina." };
  return { label: "Elevado", card: "border-orange-200 bg-orange-50 text-orange-900", description: "A semana apresentou estresse elevado e pode exigir investigação clínica." };
}

function LineChart({ entries, field, color, label }: { entries: PatientDiaryEntry[]; field: "stressLevel" | "emotionalScale"; color: string; label: string }) {
  const points = useMemo(() => {
    if (!entries.length) return "";
    return entries.map((entry, index) => {
      const x = entries.length === 1 ? 300 : 30 + index * (540 / (entries.length - 1));
      const y = 145 - ((entry[field] - 1) / 9) * 115;
      return `${x},${y}`;
    }).join(" ");
  }, [entries, field]);
  return <div><div className="mb-1 flex justify-between text-xs"><span className="font-semibold text-stone-500">{label}</span><span className="text-stone-400">1–10</span></div><svg viewBox="0 0 600 165" className="h-32 w-full overflow-visible" role="img" aria-label={`Gráfico de ${label}`}><line x1="30" x2="570" y1="145" y2="145" stroke="#e7e5e4" /><line x1="30" x2="570" y1="30" y2="30" stroke="#f1f0ef" strokeDasharray="5 5" />{points && <><polyline points={points} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />{points.split(" ").map((point) => { const [cx, cy] = point.split(","); return <circle key={point} cx={cx} cy={cy} r="5" fill="white" stroke={color} strokeWidth="3" />; })}</>}</svg></div>;
}

function DailyEntry({ entry }: { entry: PatientDiaryEntry }) {
  const mood = diaryMoods.find((item) => item.value === entry.mood)!;
  const Icon = mood.icon;
  return <article className="break-inside-avoid rounded-2xl border border-stone-100 bg-stone-50/60 p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div className="flex gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${mood.colors}`}><Icon className="h-5 w-5" /></span><div><p className="font-semibold text-stone-700">{formatLongDate(entry.createdAt)}</p><div className="mt-1 flex flex-wrap gap-2 text-xs"><span>{mood.label}</span><span>Emocional {entry.emotionalScale}/10</span><span>Estresse {entry.stressLevel}/10</span>{entry.sleepQuality != null && <span>Sono {entry.sleepQuality}/10</span>}</div></div></div></div><p className="mt-3 text-sm leading-6 text-stone-600">{entry.description}</p>{entry.patientOrCaregiverNotes && <p className="mt-3 rounded-xl bg-white p-3 text-sm italic text-stone-500">“{entry.patientOrCaregiverNotes}”</p>}{entry.therapistNotes && <p className="mt-2 text-xs text-stone-500"><strong>Observação clínica:</strong> {entry.therapistNotes}</p>}</article>;
}

function MoodDistribution({ distribution, total }: { distribution: Partial<Record<DiaryMood, number>>; total: number }) {
  return <div className="rounded-3xl border border-stone-100 bg-stone-50/50 p-5">{diaryMoods.map((mood) => { const count = distribution[mood.value] || 0; const percentage = total ? Math.round((count / total) * 100) : 0; return <div key={mood.value} className="mb-4 last:mb-0"><div className="mb-1.5 flex justify-between text-xs"><span className="font-medium text-stone-600">{mood.label}</span><span className="text-stone-400">{count} · {percentage}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-rosewood-400" style={{ width: `${percentage}%` }} /></div></div>; })}</div>;
}

function InsightCard({ icon: Icon, title, items, empty, tone }: { icon: typeof AlertTriangle; title: string; items: string[]; empty: string; tone: "attention" | "suggestion" }) {
  const colors = tone === "attention" ? "border-orange-100 bg-orange-50/60 text-orange-900" : "border-rosewood-100 bg-rosewood-50/60 text-rosewood-900";
  return <section className={`break-inside-avoid rounded-3xl border p-6 ${colors}`}><div className="mb-4 flex items-center gap-2"><Icon className="h-5 w-5" /><h3 className="font-semibold">{title}</h3></div><ul className="space-y-3 text-sm leading-6">{items.length ? items.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />{item}</li>) : <li>{empty}</li>}</ul></section>;
}

const score = (value: number | null) => value == null ? "—" : `${value}/10`;
const formatShortDate = (value: string) => new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" });
const formatLongDate = (value: string) => new Date(value).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
