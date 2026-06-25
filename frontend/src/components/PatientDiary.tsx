import {
  BatteryLow,
  BookOpen,
  CalendarDays,
  CircleAlert,
  Frown,
  Meh,
  Plus,
  Smile,
  Sparkles,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { EmptyState, Modal } from "./ui";

export type DiaryMood = "HAPPY" | "NEUTRAL" | "SAD" | "ANXIOUS" | "TIRED";

type DiaryEntry = {
  id: string;
  mood: DiaryMood;
  emotionalScale: number;
  description: string;
  notes: string;
  createdAt: string;
};

const moods = [
  { value: "HAPPY", label: "Feliz", icon: Smile, colors: "bg-emerald-50 text-emerald-600 border-emerald-100", selected: "ring-2 ring-emerald-400 ring-offset-4" },
  { value: "NEUTRAL", label: "Neutro", icon: Meh, colors: "bg-amber-50 text-amber-600 border-amber-100", selected: "ring-2 ring-amber-400 ring-offset-4" },
  { value: "SAD", label: "Triste", icon: Frown, colors: "bg-blue-50 text-blue-500 border-blue-100", selected: "ring-2 ring-blue-400 ring-offset-4" },
  { value: "ANXIOUS", label: "Ansioso", icon: CircleAlert, colors: "bg-orange-50 text-orange-600 border-orange-100", selected: "ring-2 ring-orange-400 ring-offset-4" },
  { value: "TIRED", label: "Cansado", icon: BatteryLow, colors: "bg-purple-50 text-purple-500 border-purple-100", selected: "ring-2 ring-purple-400 ring-offset-4" },
] as const;

const mockEntries: DiaryEntry[] = [
  {
    id: "mock-1",
    mood: "HAPPY",
    emotionalScale: 8,
    description: "Participou com interesse das propostas e demonstrou boa disposição durante a sessão.",
    notes: "Respondeu bem aos estímulos e manteve atenção nas atividades dirigidas.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-2",
    mood: "ANXIOUS",
    emotionalScale: 5,
    description: "Chegou um pouco inquieto, mas se organizou após a atividade de regulação.",
    notes: "Manter estratégias de previsibilidade no início dos próximos encontros.",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

export function MoodSelector({ value, onChange }: { value: DiaryMood | null; onChange: (mood: DiaryMood) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
      {moods.map(({ value: mood, label, icon: Icon, colors, selected }) => {
        const isSelected = value === mood;
        return (
          <button
            key={mood}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(mood)}
            className={`flex min-h-28 flex-col items-center justify-center gap-2 rounded-[1.4rem] border px-3 py-4 text-sm font-medium transition duration-200 hover:-translate-y-1 hover:shadow-md ${colors} ${isSelected ? `${selected} shadow-md` : ""}`}
          >
            <Icon className="h-8 w-8 stroke-[1.8]" />
            <span className="text-stone-700">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function PatientDiary({ patientName }: { patientName: string }) {
  const [selectedMood, setSelectedMood] = useState<DiaryMood | null>(null);
  const [entries, setEntries] = useState<DiaryEntry[]>(mockEntries);
  const [showForm, setShowForm] = useState(false);
  const [showDiary, setShowDiary] = useState(false);
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ emotionalScale: 5, description: "", notes: "" });

  function openForm() {
    setSuccess("");
    setShowForm(true);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const mood = selectedMood || "NEUTRAL";
    setEntries((current) => [{
      id: `local-${Date.now()}`,
      mood,
      emotionalScale: form.emotionalScale,
      description: form.description,
      notes: form.notes,
      createdAt: new Date().toISOString(),
    }, ...current]);
    setForm({ emotionalScale: 5, description: "", notes: "" });
    setShowForm(false);
    setShowDiary(true);
    setSuccess("Registro adicionado ao diário visual.");
  }

  return (
    <section className="space-y-6">
      <div className="card overflow-hidden p-0">
        <div className="bg-gradient-to-br from-white via-white to-rosewood-50/60 p-6 sm:p-8 lg:p-10">
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow mb-2">Diário terapêutico</p>
              <h2 className="text-xl font-semibold tracking-tight text-stone-800 sm:text-2xl">Como o paciente está se sentindo hoje?</h2>
              <p className="mt-2 text-sm text-stone-500">Selecione o humor que melhor representa o momento de {patientName.split(" ")[0]}.</p>
            </div>
            <span className="hidden rounded-2xl bg-rosewood-50 p-3 text-rosewood-500 sm:inline-flex"><Sparkles className="h-5 w-5" /></span>
          </div>
          <MoodSelector value={selectedMood} onChange={setSelectedMood} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button type="button" onClick={openForm} className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-rosewood-500 to-rosewood-600 px-6 py-7 text-white shadow-lg shadow-rosewood-200/70 transition hover:-translate-y-0.5 hover:shadow-xl">
          <Plus className="h-6 w-6" />
          <span className="text-base font-semibold">Novo Registro</span>
        </button>
        <button type="button" onClick={() => setShowDiary((current) => !current)} className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-rosewood-100 bg-white/75 px-6 py-7 text-rosewood-500 shadow-sm transition hover:-translate-y-0.5 hover:border-rosewood-200 hover:bg-rosewood-50/50 hover:shadow-md">
          <BookOpen className="h-6 w-6" />
          <span className="text-base font-semibold">Meu Diário</span>
        </button>
      </div>

      {success && <p className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}

      {showDiary && <PatientDiaryList entries={entries} />}

      {showForm && (
        <Modal title="Novo registro do diário" onClose={() => setShowForm(false)}>
          <form className="space-y-5" onSubmit={submit}>
            <div>
              <span className="label">Humor observado</span>
              <MoodSelector value={selectedMood} onChange={setSelectedMood} />
            </div>
            <label>
              <span className="label">Escala emocional: <strong className="text-rosewood-600">{form.emotionalScale}</strong>/10</span>
              <input className="w-full accent-rosewood-600" type="range" min="1" max="10" value={form.emotionalScale} onChange={(e) => setForm({ ...form, emotionalScale: Number(e.target.value) })} />
            </label>
            <label>
              <span className="label">Descrição do dia ou sessão *</span>
              <textarea className="field min-h-28 resize-y" required placeholder="Como o paciente se apresentou hoje?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            <label>
              <span className="label">Observações da terapeuta</span>
              <textarea className="field min-h-24 resize-y" placeholder="Registre percepções importantes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </label>
            <p className="rounded-xl bg-rosewood-50 px-3 py-2 text-xs leading-5 text-rosewood-700">Este registro é apenas visual e ficará salvo somente enquanto esta página permanecer aberta.</p>
            <div className="flex justify-end"><button className="btn-primary" type="submit">Adicionar registro</button></div>
          </form>
        </Modal>
      )}
    </section>
  );
}

function PatientDiaryList({ entries }: { entries: DiaryEntry[] }) {
  return (
    <section className="card">
      <div className="mb-6">
        <p className="eyebrow mb-1">Histórico visual</p>
        <h3 className="text-lg font-semibold text-stone-800">Meu Diário</h3>
        <p className="text-sm text-stone-400">Registros demonstrativos deste paciente.</p>
      </div>
      {entries.length ? (
        <div className="relative space-y-5 before:absolute before:bottom-7 before:left-5 before:top-7 before:w-px before:bg-rosewood-200">
          {entries.map((entry) => {
            const mood = moods.find((item) => item.value === entry.mood)!;
            const Icon = mood.icon;
            return (
              <article key={entry.id} className="relative ml-11 rounded-2xl border border-stone-100 bg-stone-50/60 p-5">
                <span className={`absolute -left-[3.25rem] top-5 flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm ${mood.colors}`}><Icon className="h-5 w-5" /></span>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${mood.colors}`}>{mood.label}</span>
                      <span className="rounded-full bg-rosewood-50 px-2.5 py-1 text-xs font-semibold text-rosewood-700">Escala {entry.emotionalScale}/10</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-stone-600">{entry.description}</p>
                    {entry.notes && <p className="mt-3 border-l-2 border-rosewood-200 pl-3 text-sm italic leading-6 text-stone-500">{entry.notes}</p>}
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 text-xs text-stone-400"><CalendarDays className="h-3.5 w-3.5" />{new Date(entry.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
              </article>
            );
          })}
        </div>
      ) : <EmptyState title="Diário vazio" description="Os registros visuais aparecerão aqui." />}
    </section>
  );
}
