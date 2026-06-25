import { ArrowLeft, CalendarDays, FilePlus2, FileText, MoreHorizontal, Pencil, Plus, Printer, Trash2, UserRoundCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { EvolutionForm, MedicalRecordForm, PatientForm, emptyEvolution, type EvolutionFormData, type PatientFormData } from "../components/forms";
import { PatientDiary } from "../components/PatientDiary";
import { WeeklyDiaryReport } from "../components/WeeklyDiaryReport";
import { EmptyState, Loading, Modal } from "../components/ui";
import { api, getErrorMessage } from "../lib/api";
import { careLabels, dateInput, formatDate } from "../lib/format";
import type { Evolution, MedicalRecord, Patient } from "../types";

type Tab = "overview" | "record" | "evolutions" | "diary" | "weekly" | "documents";

export function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [modal, setModal] = useState<"patient" | "evolution" | "document" | null>(null);
  const [editEvolution, setEditEvolution] = useState<string | null>(null);
  const [patientForm, setPatientForm] = useState<PatientFormData | null>(null);
  const [evolutionForm, setEvolutionForm] = useState<EvolutionFormData>(emptyEvolution);
  const [recordForm, setRecordForm] = useState<MedicalRecord>({});
  const [documentForm, setDocumentForm] = useState({ name: "", type: "", description: "", url: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const { data } = await api.get(`/patients/${id}`);
    setPatient(data);
    setRecordForm(data.medicalRecord || {});
    setPatientForm({
      name: data.name, birthDate: dateInput(data.birthDate), guardian: data.guardian || "", phone: data.phone || "",
      email: data.email || "", address: data.address || "", mainCondition: data.mainCondition || "",
      initialComplaint: data.initialComplaint || "", clinicalHistory: data.clinicalHistory || "",
      generalNotes: data.generalNotes || "", status: data.status,
    });
  };
  useEffect(() => { load().catch(() => navigate("/pacientes")); }, [id]);
  if (!patient || !patientForm) return <Loading label="Carregando prontuário..." />;

  const submitPatient = async (e: FormEvent) => { e.preventDefault(); await action(async () => api.put(`/patients/${id}`, patientForm), "patient"); };
  const submitRecord = async (e: FormEvent) => { e.preventDefault(); await action(async () => api.put(`/patients/${id}/medical-record`, recordForm)); };
  const submitEvolution = async (e: FormEvent) => { e.preventDefault(); await action(async () => editEvolution ? api.put(`/patients/${id}/evolutions/${editEvolution}`, evolutionForm) : api.post(`/patients/${id}/evolutions`, evolutionForm), "evolution"); };
  const submitDocument = async (e: FormEvent) => { e.preventDefault(); await action(async () => api.post(`/patients/${id}/documents`, documentForm), "document"); };
  async function action(request: () => Promise<unknown>, close?: typeof modal) {
    setSaving(true); setError("");
    try { await request(); if (close) setModal(null); await load(); }
    catch (err) { setError(getErrorMessage(err)); } finally { setSaving(false); }
  }
  const openEvolution = (evolution?: Evolution) => {
    setEditEvolution(evolution?.id || null);
    setEvolutionForm(evolution ? {
      sessionDate: dateInput(evolution.sessionDate), time: evolution.time, careType: evolution.careType,
      sessionGoal: evolution.sessionGoal, activitiesPerformed: evolution.activitiesPerformed,
      patientPerformance: evolution.patientPerformance, observedDifficulties: evolution.observedDifficulties || "",
      perceivedProgress: evolution.perceivedProgress || "", nextSteps: evolution.nextSteps || "",
    } : emptyEvolution);
    setError(""); setModal("evolution");
  };
  const removeEvolution = async (evolutionId: string) => {
    if (!confirm("Excluir esta evolução?")) return;
    setError("");
    try { await api.delete(`/patients/${id}/evolutions/${evolutionId}`); await load(); }
    catch (err) { setError(getErrorMessage(err)); }
  };
  const removeDocument = async (documentId: string) => {
    if (!confirm("Excluir este documento?")) return;
    setError("");
    try { await api.delete(`/patients/${id}/documents/${documentId}`); await load(); }
    catch (err) { setError(getErrorMessage(err)); }
  };
  const toggleStatus = async () => {
    setError("");
    try { await api.patch(`/patients/${id}/status`, { status: patient.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }); await load(); }
    catch (err) { setError(getErrorMessage(err)); }
  };

  const tabs: { key: Tab; label: string }[] = [{ key: "overview", label: "Visão geral" }, { key: "record", label: "Prontuário" }, { key: "evolutions", label: "Evoluções" }, { key: "diary", label: "Diário Terapêutico" }, { key: "weekly", label: "Relatório Semanal" }, { key: "documents", label: "Documentos" }];
  return (
    <>
      <div className="no-print mb-5"><Link to="/pacientes" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-rosewood-600"><ArrowLeft className="h-4 w-4" />Voltar para pacientes</Link></div>
      <div className="no-print card mb-6 overflow-hidden bg-gradient-to-br from-white via-white to-rosewood-50/70">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-rosewood-100 to-nude text-2xl font-semibold text-rosewood-700 shadow-sm ring-4 ring-white">{patient.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}</div><div><p className="eyebrow mb-1">Painel clínico</p><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight text-stone-800">{patient.name}</h1><span className={patient.status === "ACTIVE" ? "status-active" : "status-muted"}><span className={`h-1.5 w-1.5 rounded-full ${patient.status === "ACTIVE" ? "bg-rosewood-500" : "bg-stone-400"}`} />{patient.status === "ACTIVE" ? "Ativo" : "Inativo"}</span></div><p className="mt-1 text-sm text-stone-500">{patient.mainCondition || "Condição principal não informada"}</p></div></div>
          <div className="flex flex-wrap gap-2"><Link to={`/pacientes/${id}/relatorio`} className="btn-secondary"><Printer className="h-4 w-4" />Relatório</Link><button className="btn-secondary" onClick={() => setModal("patient")}><Pencil className="h-4 w-4" />Editar</button><button className="btn-secondary" onClick={toggleStatus}><MoreHorizontal className="h-4 w-4" />{patient.status === "ACTIVE" ? "Inativar" : "Ativar"}</button></div>
        </div>
      </div>
      <div className="no-print mb-7 overflow-x-auto rounded-2xl border border-white bg-white/70 p-1.5 shadow-sm"><div className="flex min-w-max gap-1">{tabs.map((item) => <button key={item.key} onClick={() => setTab(item.key)} className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${tab === item.key ? "bg-rosewood-100 text-rosewood-700 shadow-sm" : "text-stone-400 hover:bg-white hover:text-stone-700"}`}>{item.label}</button>)}</div></div>
      {error && !modal && tab !== "record" && <Error text={error} />}

      {tab === "overview" && <Overview patient={patient} />}
      {tab === "record" && <div className="card max-w-4xl"><div className="mb-5"><h2 className="font-semibold text-stone-800">Prontuário clínico</h2><p className="text-sm text-stone-400">Avaliação e planejamento terapêutico do paciente.</p></div>{error && <Error text={error} />}<MedicalRecordForm value={recordForm} onChange={setRecordForm} onSubmit={submitRecord} saving={saving} /></div>}
      {tab === "evolutions" && <section><div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="eyebrow mb-1">Linha de cuidado</p><h2 className="text-lg font-semibold text-stone-800">Evoluções por sessão</h2><p className="text-sm text-stone-400">{patient.evolutions?.length || 0} registros clínicos</p></div><button className="btn-primary" onClick={() => openEvolution()}><Plus className="h-4 w-4" />Nova evolução</button></div>{patient.evolutions?.length ? <div className="relative space-y-5 before:absolute before:bottom-8 before:left-5 before:top-8 before:w-px before:bg-rosewood-200 sm:before:left-6">{patient.evolutions.map((evolution) => <article key={evolution.id} className="card card-hover relative ml-10 sm:ml-12"><div className="absolute -left-[3.3rem] top-7 flex h-10 w-10 items-center justify-center rounded-full bg-white text-rosewood-500 shadow-soft ring-4 ring-rosewood-50 sm:-left-[3.65rem]"><CalendarDays className="h-4 w-4" /></div><div className="mb-5 flex flex-col justify-between gap-3 border-b border-stone-100 pb-4 sm:flex-row"><div><p className="font-semibold text-stone-700">{formatDate(evolution.sessionDate)} às {evolution.time}</p><span className="mt-1 inline-flex rounded-full bg-rosewood-50 px-2.5 py-1 text-xs font-medium text-rosewood-600">{careLabels[evolution.careType]}</span></div><div className="flex gap-1"><button className="icon-button" onClick={() => openEvolution(evolution)}><Pencil className="h-4 w-4" /></button><button className="icon-button hover:bg-red-50 hover:text-red-500" onClick={() => removeEvolution(evolution.id)}><Trash2 className="h-4 w-4" /></button></div></div><div className="grid gap-5 md:grid-cols-2"><TextBlock title="Objetivo" text={evolution.sessionGoal} /><TextBlock title="Atividades realizadas" text={evolution.activitiesPerformed} /><TextBlock title="Desempenho" text={evolution.patientPerformance} /><TextBlock title="Progresso percebido" text={evolution.perceivedProgress} /><TextBlock title="Dificuldades observadas" text={evolution.observedDifficulties} /><TextBlock title="Próximos passos" text={evolution.nextSteps} /></div></article>)}</div> : <EmptyState title="Nenhuma evolução registrada" description="Registre o acompanhamento de uma sessão para construir a linha de cuidado." action={<button className="btn-primary" onClick={() => openEvolution()}><Plus className="h-4 w-4" />Registrar evolução</button>} />}</section>}
      {tab === "diary" && <PatientDiary patientId={patient.id} patientName={patient.name} />}
      {tab === "weekly" && <WeeklyDiaryReport patientId={patient.id} />}
      {tab === "documents" && <section><div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold text-stone-800">Documentos</h2><p className="text-sm text-stone-400">Referências e documentos vinculados ao paciente.</p></div><button className="btn-primary" onClick={() => { setError(""); setModal("document"); }}><FilePlus2 className="h-4 w-4" />Novo documento</button></div>{patient.documents?.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{patient.documents.map((doc) => <div className="card flex gap-3" key={doc.id}><div className="h-fit rounded-xl bg-rosewood-100 p-2.5 text-rosewood-500"><FileText className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="truncate font-semibold text-stone-700">{doc.name}</p><p className="text-xs font-medium text-rosewood-500">{doc.type}</p><p className="mt-2 line-clamp-2 text-sm text-stone-500">{doc.description || "Sem descrição"}</p>{doc.url && <p className="mt-2 truncate text-xs text-stone-400">{doc.url}</p>}</div><button className="h-fit p-1 text-stone-300 hover:text-red-500" onClick={() => removeDocument(doc.id)}><Trash2 className="h-4 w-4" /></button></div>)}</div> : <EmptyState title="Nenhum documento" description="Registre referências de documentos relacionados ao paciente." />}</section>}

      {modal === "patient" && <Modal title="Editar paciente" wide onClose={() => setModal(null)}>{error && <Error text={error} />}<PatientForm value={patientForm} onChange={setPatientForm} onSubmit={submitPatient} saving={saving} /></Modal>}
      {modal === "evolution" && <Modal title={editEvolution ? "Editar evolução" : "Nova evolução"} wide onClose={() => setModal(null)}>{error && <Error text={error} />}<EvolutionForm value={evolutionForm} onChange={setEvolutionForm} onSubmit={submitEvolution} saving={saving} /></Modal>}
      {modal === "document" && <Modal title="Registrar documento" onClose={() => setModal(null)}><form className="space-y-4" onSubmit={submitDocument}>{error && <Error text={error} />}<SimpleInput label="Nome do documento" value={documentForm.name} set={(name) => setDocumentForm({ ...documentForm, name })} /><SimpleInput label="Tipo" value={documentForm.type} set={(type) => setDocumentForm({ ...documentForm, type })} /><label><span className="label">Descrição</span><textarea className="field min-h-24" value={documentForm.description} onChange={(e) => setDocumentForm({ ...documentForm, description: e.target.value })} /></label><SimpleInput label="URL ou caminho fictício" value={documentForm.url} set={(url) => setDocumentForm({ ...documentForm, url })} required={false} /><div className="flex justify-end"><button className="btn-primary" disabled={saving}>{saving ? "Salvando..." : "Salvar documento"}</button></div></form></Modal>}
    </>
  );
}

function Overview({ patient }: { patient: Patient }) {
  return <div className="grid gap-6 xl:grid-cols-3"><section className="card xl:col-span-2"><p className="eyebrow mb-1">Acompanhamento</p><h2 className="mb-6 text-lg font-semibold text-stone-800">Informações clínicas</h2><div className="grid gap-6 md:grid-cols-2"><TextBlock title="Queixa inicial" text={patient.initialComplaint} /><TextBlock title="Diagnóstico ou condição principal" text={patient.mainCondition} /><TextBlock title="Histórico clínico" text={patient.clinicalHistory} /><TextBlock title="Observações gerais" text={patient.generalNotes} /></div></section><aside className="space-y-6"><div className="card"><p className="eyebrow mb-1">Cadastro</p><h2 className="mb-5 text-lg font-semibold text-stone-800">Dados pessoais</h2><dl className="space-y-4 text-sm"><Detail label="Nascimento" value={formatDate(patient.birthDate)} /><Detail label="Responsável" value={patient.guardian} /><Detail label="Telefone" value={patient.phone} /><Detail label="E-mail" value={patient.email} /><Detail label="Endereço" value={patient.address} /></dl></div><div className="card bg-gradient-to-br from-rosewood-600 to-rosewood-800 text-white"><UserRoundCheck className="mb-5 h-7 w-7 text-rosewood-200" /><p className="text-3xl font-semibold">{patient.evolutions?.length || 0}</p><p className="mt-1 text-sm text-rosewood-100">evoluções registradas</p></div></aside></div>;
}
function TextBlock({ title, text }: { title: string; text?: string }) { return <div><p className="mb-1 text-xs font-semibold uppercase tracking-wider text-stone-400">{title}</p><p className="whitespace-pre-line text-sm leading-relaxed text-stone-600">{text || "Não informado."}</p></div>; }
function Detail({ label, value }: { label: string; value?: string }) { return <div><dt className="text-xs text-stone-400">{label}</dt><dd className="mt-0.5 text-stone-600">{value || "Não informado"}</dd></div>; }
function Error({ text }: { text: string }) { return <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{text}</p>; }
function SimpleInput({ label, value, set, required = true }: { label: string; value: string; set: (value: string) => void; required?: boolean }) { return <label><span className="label">{label}{required && " *"}</span><input className="field" required={required} value={value} onChange={(e) => set(e.target.value)} /></label>; }
