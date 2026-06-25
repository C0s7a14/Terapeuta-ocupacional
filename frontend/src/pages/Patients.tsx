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
  const load = async () => { setLoading(true); const { data } = await api.get("/patients", { params: { search } }); setPatients(data); setLoading(false); };
  useEffect(() => { const timer = setTimeout(load, 250); return () => clearTimeout(timer); }, [search]);
  async function submit(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError("");
    try { await api.post("/patients", form); setModal(false); setForm(emptyPatient); await load(); }
    catch (err) { setError(getErrorMessage(err)); } finally { setSaving(false); }
  }
  return (
    <>
      <PageHeader title="Pacientes" description="Gerencie os pacientes e acompanhe seus registros clínicos." action={<button className="btn-primary" onClick={() => setModal(true)}><Plus className="h-4 w-4" />Novo paciente</button>} />
      <div className="card">
        <div className="relative mb-5 max-w-md"><Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" /><input className="field pl-10" placeholder="Buscar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        {loading ? <Loading /> : patients.length ? <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b text-xs uppercase tracking-wider text-stone-400"><th className="px-3 py-3 font-medium">Paciente</th><th className="px-3 py-3 font-medium">Nascimento</th><th className="px-3 py-3 font-medium">Contato</th><th className="px-3 py-3 font-medium">Registros</th><th className="px-3 py-3 font-medium">Status</th><th /></tr></thead><tbody>{patients.map((patient) => <tr key={patient.id} className="border-b border-stone-100 last:border-0 hover:bg-rosewood-50/30"><td className="px-3 py-4"><div className="flex items-center gap-3"><div className="rounded-xl bg-rosewood-100 p-2 text-rosewood-500"><UserRound className="h-5 w-5" /></div><div><p className="font-medium text-stone-700">{patient.name}</p><p className="text-xs text-stone-400">{patient.guardian || "Sem responsável informado"}</p></div></div></td><td className="px-3 py-4 text-stone-500">{formatDate(patient.birthDate)}</td><td className="px-3 py-4 text-stone-500">{patient.phone || patient.email || "—"}</td><td className="px-3 py-4 text-stone-500">{patient._count?.evolutions || 0} evoluções</td><td className="px-3 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${patient.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>{patient.status === "ACTIVE" ? "Ativo" : "Inativo"}</span></td><td className="px-3 py-4 text-right"><Link to={`/pacientes/${patient.id}`} className="inline-flex rounded-lg p-2 text-rosewood-500 hover:bg-rosewood-100" title="Visualizar"><Eye className="h-4 w-4" /></Link></td></tr>)}</tbody></table></div> : <EmptyState title="Nenhum paciente encontrado" description={search ? "Tente buscar por outro nome." : "Cadastre o primeiro paciente para começar."} action={!search && <button className="btn-primary" onClick={() => setModal(true)}><Plus className="h-4 w-4" />Cadastrar paciente</button>} />}
      </div>
      {modal && <Modal title="Cadastrar paciente" wide onClose={() => setModal(false)}>{error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}<PatientForm value={form} onChange={setForm} onSubmit={submit} saving={saving} /></Modal>}
    </>
  );
}

