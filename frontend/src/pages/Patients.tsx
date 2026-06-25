import { Eye, Plus, Search, UserRound } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { PatientForm, emptyPatient, type PatientFormData } from "../components/forms";
import { EmptyState, Loading, Modal, PageHeader } from "../components/ui";
import { api, getErrorMessage } from "../lib/api";
import { formatDate } from "../lib/format";
import type { Patient } from "../types";

export function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<PatientFormData>(emptyPatient);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true); setError("");
    try { const { data } = await api.get("/patients", { params: { search } }); setPatients(data); }
    catch (err) { setError(getErrorMessage(err)); setPatients([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { const timer = setTimeout(load, 250); return () => clearTimeout(timer); }, [search]);
  async function submit(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError("");
    try { await api.post("/patients", form); setModal(false); setForm(emptyPatient); await load(); }
    catch (err) { setError(getErrorMessage(err)); } finally { setSaving(false); }
  }
  return (
    <>
      <PageHeader title="Pacientes" description="Gerencie os pacientes e acompanhe seus registros clínicos." action={<button className="btn-primary" onClick={() => setModal(true)}><Plus className="h-4 w-4" />Novo paciente</button>} />
      {error && !modal && <p className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error} <button className="ml-2 font-semibold underline" onClick={load}>Tentar novamente</button></p>}
      <div className="card overflow-hidden p-0">
        <div className="border-b border-stone-100 bg-gradient-to-r from-white to-rosewood-50/50 p-5 sm:p-6"><div className="relative max-w-xl"><Search className="absolute left-4 top-3.5 h-4 w-4 text-rosewood-400" /><input className="field bg-white pl-11" placeholder="Buscar paciente por nome..." value={search} onChange={(e) => setSearch(e.target.value)} /></div></div>
        <div className="p-4 sm:p-6">{loading ? <Loading /> : patients.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left text-sm"><thead><tr className="text-[11px] uppercase tracking-[.14em] text-stone-400"><th className="px-4 py-2 font-semibold">Paciente</th><th className="px-4 py-2 font-semibold">Nascimento</th><th className="px-4 py-2 font-semibold">Contato</th><th className="px-4 py-2 font-semibold">Registros</th><th className="px-4 py-2 font-semibold">Status</th><th /></tr></thead><tbody>{patients.map((patient) => <tr key={patient.id} className="group bg-stone-50/70 transition hover:bg-rosewood-50/70"><td className="rounded-l-2xl px-4 py-4"><div className="flex items-center gap-3"><div className="rounded-2xl bg-white p-2.5 text-rosewood-500 shadow-sm ring-1 ring-rosewood-100"><UserRound className="h-5 w-5" /></div><div><p className="font-semibold text-stone-700">{patient.name}</p><p className="mt-0.5 text-xs text-stone-400">{patient.guardian || "Sem responsável informado"}</p></div></div></td><td className="px-4 py-4 text-stone-500">{formatDate(patient.birthDate)}</td><td className="px-4 py-4 text-stone-500">{patient.phone || patient.email || "—"}</td><td className="px-4 py-4"><span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-stone-500 shadow-sm">{patient._count?.evolutions || 0} evoluções</span></td><td className="px-4 py-4"><span className={patient.status === "ACTIVE" ? "status-active" : "status-muted"}><span className={`h-1.5 w-1.5 rounded-full ${patient.status === "ACTIVE" ? "bg-rosewood-500" : "bg-stone-400"}`} />{patient.status === "ACTIVE" ? "Ativo" : "Inativo"}</span></td><td className="rounded-r-2xl px-4 py-4 text-right"><Link to={`/pacientes/${patient.id}`} className="icon-button bg-white text-rosewood-500 shadow-sm" title="Visualizar"><Eye className="h-4 w-4" /></Link></td></tr>)}</tbody></table></div> : <EmptyState title="Nenhum paciente encontrado" description={search ? "Tente buscar por outro nome." : "Cadastre o primeiro paciente para começar."} action={!search && <button className="btn-primary" onClick={() => setModal(true)}><Plus className="h-4 w-4" />Cadastrar paciente</button>} />}</div>
      </div>
      {modal && <Modal title="Cadastrar paciente" wide onClose={() => setModal(false)}>{error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}<PatientForm value={form} onChange={setForm} onSubmit={submit} saving={saving} /></Modal>}
    </>
  );
}
