import {
  BatteryLow,
  BookOpen,
  CalendarDays,
  CircleAlert,
  Frown,
  LoaderCircle,
  Meh,
  Pencil,
  Plus,
  Smile,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { api, getErrorMessage } from "../lib/api";
import type { DiaryMood, PatientDiaryEntry } from "../types";
import { EmptyState, Modal } from "./ui";

type DiaryFormData = {
  emotionalScale: number;
  description: string;
  activities: string;
  therapistNotes: string;
  tags: string;
};

const emptyForm: DiaryFormData = {
  emotionalScale: 5,
  description: "",
  activities: "",
  therapistNotes: "",
  tags: "",
};

export const diaryMoods = [
  { value: "HAPPY", label: "Feliz", icon: Smile, colors: "bg-emerald-50 text-emerald-600 border-emerald-100", selected: "ring-2 ring-emerald-400 ring-offset-4" },
  { value: "NEUTRAL", label: "Neutro", icon: Meh, colors: "bg-amber-50 text-amber-600 border-amber-100", selected: "ring-2 ring-amber-400 ring-offset-4" },
  { value: "SAD", label: "Triste", icon: Frown, colors: "bg-blue-50 text-blue-500 border-blue-100", selected: "ring-2 ring-blue-400 ring-offset-4" },
  { value: "ANXIOUS", label: "Ansioso", icon: CircleAlert, colors: "bg-orange-50 text-orange-600 border-orange-100", selected: "ring-2 ring-orange-400 ring-offset-4" },
  { value: "TIRED", label: "Cansado", icon: BatteryLow, colors: "bg-purple-50 text-purple-500 border-purple-100", selected: "ring-2 ring-purple-400 ring-offset-4" },
] as const;

export function MoodSelector({ value, onChange, compact = false }: { value: DiaryMood | null; onChange: (mood: DiaryMood) => void; compact?: boolean }) {
  return (
    <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 ${compact ? "lg:gap-3" : "lg:gap-5"}`}>
      {diaryMoods.map(({ value: mood, label, icon: Icon, colors, selected }) => {
        const isSelected = value === mood;
        return (
          <button
            key={mood}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(mood)}
            className={`flex flex-col items-center justify-center gap-2 rounded-[1.4rem] border px-3 text-sm font-medium transition duration-200 hover:-translate-y-1 hover:shadow-md ${compact ? "min-h-24 py-3" : "min-h-28 py-4"} ${colors} ${isSelected ? `${selected} shadow-md` : ""}`}
          >
            <Icon className={`${compact ? "h-7 w-7" : "h-8 w-8"} stroke-[1.8]`} />
            <span className="text-stone-700">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function PatientDiary({ patientId, patientName }: { patientId: string; patientName: string }) {
  const [selectedMood, setSelectedMood] = useState<DiaryMood | null>(null);
  const [entries, setEntries] = useState<PatientDiaryEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showDiary, setShowDiary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState<DiaryFormData>(emptyForm);

  async function loadEntries() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<PatientDiaryEntry[]>(`/patients/${patientId}/diary`);
      setEntries(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function openForm(entry?: PatientDiaryEntry) {
    setSuccess("");
    setError("");
    setEditingId(entry?.id || null);
    if (entry) {
      setSelectedMood(entry.mood);
      setForm({
        emotionalScale: entry.emotionalScale,
        description: entry.description,
        activities: entry.activities || "",
        therapistNotes: entry.therapistNotes || "",
        tags: entry.tags?.join(", ") || "",
      });
    } else {
      setForm(emptyForm);
    }
    setShowForm(true);
  }

  async function toggleDiary() {
    const next = !showDiary;
    setShowDiary(next);
    if (next) await loadEntries();
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!selectedMood) {
      setError("Selecione o humor observado antes de salvar.");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      mood: selectedMood,
      emotionalScale: form.emotionalScale,
      description: form.description,
      activities: form.activities || null,
      therapistNotes: form.therapistNotes || null,
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    };
    try {
      if (editingId) await api.put(`/patients/${patientId}/diary/${editingId}`, payload);
      else await api.post(`/patients/${patientId}/diary`, payload);
      setShowForm(false);
      setShowDiary(true);
      setEditingId(null);
      setForm(emptyForm);
      setSuccess(editingId ? "Registro atualizado com sucesso." : "Registro adicionado ao diário.");
      await loadEntries();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove(entryId: string) {
    if (!confirm("Excluir este registro do diário?")) return;
    setDeletingId(entryId);
    setError("");
    try {
      await api.delete(`/patients/${patientId}/diary/${entryId}`);
      setEntries((current) => current.filter((entry) => entry.id !== entryId));
      setSuccess("Registro excluído com sucesso.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
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
        <button type="button" onClick={() => openForm()} className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-rosewood-500 to-rosewood-600 px-6 py-7 text-white shadow-lg shadow-rosewood-200/70 transition hover:-translate-y-0.5 hover:shadow-xl">
          <Plus className="h-6 w-6" />
          <span className="text-base font-semibold">Novo Registro</span>
        </button>
        <button type="button" onClick={toggleDiary} className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-rosewood-100 bg-white/75 px-6 py-7 text-rosewood-500 shadow-sm transition hover:-translate-y-0.5 hover:border-rosewood-200 hover:bg-rosewood-50/50 hover:shadow-md">
          {loading ? <LoaderCircle className="h-6 w-6 animate-spin" /> : <BookOpen className="h-6 w-6" />}
          <span className="text-base font-semibold">{loading ? "Carregando..." : "Meu Diário"}</span>
        </button>
      </div>

      {success && <p className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}
      {error && !showForm && <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      {showDiary && !loading && <PatientDiaryList entries={entries} deletingId={deletingId} onEdit={openForm} onDelete={remove} />}

      {showForm && (
        <Modal title={editingId ? "Editar registro do diário" : "Novo registro do diário"} wide onClose={() => setShowForm(false)}>
          <form className="space-y-5" onSubmit={submit}>
            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
            <div>
              <span className="label">Humor observado *</span>
              <MoodSelector value={selectedMood} onChange={setSelectedMood} compact />
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
              <span className="label">Atividades realizadas</span>
              <textarea className="field min-h-24 resize-y" placeholder="Quais atividades foram realizadas?" value={form.activities} onChange={(e) => setForm({ ...form, activities: e.target.value })} />
            </label>
            <label>
              <span className="label">Observações da terapeuta</span>
              <textarea className="field min-h-24 resize-y" placeholder="Registre percepções importantes..." value={form.therapistNotes} onChange={(e) => setForm({ ...form, therapistNotes: e.target.value })} />
            </label>
            <label>
              <span className="label">Tags ou categorias</span>
              <input className="field" placeholder="Ex.: regulação, autonomia, rotina" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              <span className="mt-1 block text-xs text-stone-400">Separe as tags por vírgulas.</span>
            </label>
            <div className="flex justify-end"><button className="btn-primary" type="submit" disabled={saving}>{saving && <LoaderCircle className="h-4 w-4 animate-spin" />}{saving ? "Salvando..." : editingId ? "Salvar alterações" : "Adicionar registro"}</button></div>
          </form>
        </Modal>
      )}
    </section>
  );
}

function PatientDiaryList({ entries, deletingId, onEdit, onDelete }: { entries: PatientDiaryEntry[]; deletingId: string | null; onEdit: (entry: PatientDiaryEntry) => void; onDelete: (id: string) => void }) {
  return (
    <section className="card">
      <div className="mb-6">
        <p className="eyebrow mb-1">Histórico terapêutico</p>
        <h3 className="text-lg font-semibold text-stone-800">Meu Diário</h3>
        <p className="text-sm text-stone-400">{entries.length} {entries.length === 1 ? "registro salvo" : "registros salvos"}.</p>
      </div>
      {entries.length ? (
        <div className="relative space-y-5 before:absolute before:bottom-7 before:left-5 before:top-7 before:w-px before:bg-rosewood-200">
          {entries.map((entry) => {
            const mood = diaryMoods.find((item) => item.value === entry.mood)!;
            const Icon = mood.icon;
            return (
              <article key={entry.id} className="relative ml-11 rounded-2xl border border-stone-100 bg-stone-50/60 p-5">
                <span className={`absolute -left-[3.25rem] top-5 flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm ${mood.colors}`}><Icon className="h-5 w-5" /></span>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${mood.colors}`}>{mood.label}</span>
                      <span className="rounded-full bg-rosewood-50 px-2.5 py-1 text-xs font-semibold text-rosewood-700">Escala {entry.emotionalScale}/10</span>
                      {entry.tags?.map((tag) => <span key={tag} className="rounded-full bg-white px-2.5 py-1 text-xs text-stone-500 shadow-sm">#{tag}</span>)}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-stone-600">{entry.description}</p>
                    {entry.activities && <DiaryText label="Atividades" text={entry.activities} />}
                    {entry.therapistNotes && <DiaryText label="Observações" text={entry.therapistNotes} italic />}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="mr-1 flex items-center gap-1.5 text-xs text-stone-400"><CalendarDays className="h-3.5 w-3.5" />{new Date(entry.createdAt).toLocaleDateString("pt-BR")}</span>
                    <button className="icon-button bg-white" title="Editar registro" onClick={() => onEdit(entry)}><Pencil className="h-4 w-4" /></button>
                    <button className="icon-button bg-white hover:bg-red-50 hover:text-red-500" title="Excluir registro" disabled={deletingId === entry.id} onClick={() => onDelete(entry.id)}>{deletingId === entry.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : <EmptyState title="Diário vazio" description="Crie o primeiro registro para acompanhar o estado emocional deste paciente." />}
    </section>
  );
}

function DiaryText({ label, text, italic = false }: { label: string; text: string; italic?: boolean }) {
  return <div className="mt-3 border-l-2 border-rosewood-200 pl-3"><p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">{label}</p><p className={`mt-1 text-sm leading-6 text-stone-500 ${italic ? "italic" : ""}`}>{text}</p></div>;
}
