import { CalendarPlus, Clock3, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { EmptyState, Loading, Modal, PageHeader } from "../components/ui";
import { api, getErrorMessage } from "../lib/api";
import { appointmentLabels, careLabels, dateInput, formatDate } from "../lib/format";
import type { Appointment, AppointmentStatus, CareType, Patient } from "../types";

type FormData = { patientId: string; date: string; startTime: string; endTime: string; careType: CareType; status: AppointmentStatus; notes: string };
const emptyForm: FormData = { patientId: "", date: new Date().toISOString().slice(0, 10), startTime: "", endTime: "", careType: "CLINICAL", status: "SCHEDULED", notes: "" };

export function Agenda() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const load = async () => { setLoading(true); const [a, p] = await Promise.all([api.get("/appointments"), api.get("/patients")]); setItems(a.data); setPatients(p.data.filter((x: Patient) => x.status === "ACTIVE")); setLoading(false); };
  useEffect(() => { load(); }, []);
  const open = (item?: Appointment) => { setError(""); setEditing(item?.id || null); setForm(item ? { patientId: item.patientId, date: dateInput(item.date), startTime: item.startTime, endTime: item.endTime, careType: item.careType, status: item.status, notes: item.notes || "" } : emptyForm); setModal(true); };
  async function submit(e: FormEvent) { e.preventDefault(); setSaving(true); setError(""); try { if (editing) await api.put(`/appointments/${editing}`, form); else await api.post("/appointments", form); setModal(false); await load(); } catch (err) { setError(getErrorMessage(err)); } finally { setSaving(false); } }
  async function remove(id: string) { if (!confirm("Excluir este agendamento?")) return; await api.delete(`/appointments/${id}`); await load(); }
  const groups = Object.entries(items.reduce<Record<string, Appointment[]>>((acc, item) => { const key = item.date.slice(0, 10); (acc[key] ||= []).push(item); return acc; }, {}));
  return (
    <>
      <PageHeader title="Agenda" description="Atendimentos organizados por data." action={<button className="btn-primary" onClick={() => open()}><Plus className="h-4 w-4" />Novo atendimento</button>} />
      {loading ? <Loading /> : groups.length ? <div className="space-y-7">{groups.map(([date, appointments]) => <section key={date} className="card"><div className="mb-5 flex items-center gap-3 border-b border-stone-100 pb-4"><span className="rounded-2xl bg-rosewood-50 p-2.5 text-rosewood-500"><CalendarPlus className="h-4 w-4" /></span><h2 className="font-semibold capitalize text-stone-700">{new Date(`${date}T12:00:00Z`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", timeZone: "UTC" })}</h2></div><div className="space-y-3">{appointments.map((item) => <div key={item.id} className="flex flex-col gap-4 rounded-2xl border border-stone-100 bg-stone-50/70 p-4 transition hover:border-rosewood-100 hover:bg-rosewood-50/50 sm:flex-row sm:items-center"><div className="flex min-w-36 items-center gap-2 font-semibold text-stone-700"><Clock3 className="h-4 w-4 text-rosewood-400" />{item.startTime} — {item.endTime}</div><div className="flex-1"><LinkPatient id={item.patient.id} name={item.patient.name} /><p className="mt-1 text-sm text-stone-400">{careLabels[item.careType]}{item.notes ? ` · ${item.notes}` : ""}</p></div><span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${item.status === "SCHEDULED" ? "bg-rosewood-100 text-rosewood-700" : item.status === "COMPLETED" ? "bg-[#f4e7e3] text-[#8c5c57]" : "bg-stone-100 text-stone-600"}`}>{appointmentLabels[item.status]}</span><div className="flex gap-1"><button className="icon-button bg-white" onClick={() => open(item)}><Pencil className="h-4 w-4" /></button><button className="icon-button bg-white hover:bg-red-50 hover:text-red-500" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4" /></button></div></div>)}</div></section>)}</div> : <EmptyState title="Nenhum atendimento agendado" description="Crie um agendamento para organizar sua rotina." action={<button className="btn-primary" onClick={() => open()}><Plus className="h-4 w-4" />Novo atendimento</button>} />}
      {modal && <Modal title={editing ? "Editar atendimento" : "Novo atendimento"} onClose={() => setModal(false)}><form onSubmit={submit} className="space-y-4">{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}<label><span className="label">Paciente *</span><select className="field" required value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}><option value="">Selecione...</option>{patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><div className="grid gap-4 sm:grid-cols-2"><Input label="Data" type="date" value={form.date} set={(date) => setForm({ ...form, date })} /><Input label="Início" type="time" value={form.startTime} set={(startTime) => setForm({ ...form, startTime })} /><Input label="Fim" type="time" value={form.endTime} set={(endTime) => setForm({ ...form, endTime })} /><label><span className="label">Tipo</span><select className="field" value={form.careType} onChange={(e) => setForm({ ...form, careType: e.target.value as CareType })}>{Object.entries(careLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label><label><span className="label">Status</span><select className="field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AppointmentStatus })}>{Object.entries(appointmentLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label></div><label><span className="label">Observações</span><textarea className="field min-h-24" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label><div className="flex justify-end"><button className="btn-primary" disabled={saving}>{saving ? "Salvando..." : "Salvar atendimento"}</button></div></form></Modal>}
    </>
  );
}

function Input({ label, type, value, set }: { label: string; type: string; value: string; set: (value: string) => void }) { return <label><span className="label">{label} *</span><input className="field" type={type} required value={value} onChange={(e) => set(e.target.value)} /></label>; }
function LinkPatient({ id, name }: { id: string; name: string }) { return <a href={`/pacientes/${id}`} className="font-semibold text-stone-700 hover:text-rosewood-600">{name}</a>; }
