import { CheckCircle2, KeyRound, LoaderCircle, Mail, Pencil, Power, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { api, getErrorMessage } from "../lib/api";
import type { PatientPortalAccount } from "../types";
import { EmptyState, Loading, Modal } from "./ui";

type AccountForm = { name: string; email: string; password: string; confirmPassword: string; isActive: boolean };
const emptyForm: AccountForm = { name: "", email: "", password: "", confirmPassword: "", isActive: true };

export function PortalAccessManager({ patientId, patientName, guardian }: { patientId: string; patientName: string; guardian?: string }) {
  const [account, setAccount] = useState<PatientPortalAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<"create" | "edit" | "password" | null>(null);
  const [form, setForm] = useState<AccountForm>(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true); setError("");
    try { const { data } = await api.get<PatientPortalAccount | null>(`/patients/${patientId}/portal-account`); setAccount(data); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [patientId]);

  function openCreate() {
    setForm({ ...emptyForm, name: guardian || patientName });
    setError(""); setModal("create");
  }

  function openEdit() {
    if (!account) return;
    setForm({ ...emptyForm, name: account.name, email: account.email, isActive: account.isActive });
    setError(""); setModal("edit");
  }

  function openPassword() {
    setForm({ ...emptyForm, name: account?.name || "", email: account?.email || "", isActive: account?.isActive ?? true });
    setError(""); setModal("password");
  }

  function validatePassword() {
    if (form.password.length < 6) return "A senha temporária deve ter pelo menos 6 caracteres.";
    if (form.password !== form.confirmPassword) return "As senhas informadas não coincidem.";
    return "";
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!modal) return;
    if (modal !== "edit") {
      const passwordError = validatePassword();
      if (passwordError) { setError(passwordError); return; }
    }
    setSaving(true); setError(""); setSuccess("");
    try {
      if (modal === "create") {
        const { data } = await api.post(`/patients/${patientId}/portal-account`, {
          name: form.name, email: form.email, password: form.password, isActive: form.isActive,
        });
        setAccount(data); setSuccess("Acesso ao portal criado com sucesso.");
      } else if (modal === "edit") {
        const { data } = await api.put(`/patients/${patientId}/portal-account`, {
          name: form.name, email: form.email, isActive: form.isActive,
        });
        setAccount(data); setSuccess("Dados de acesso atualizados.");
      } else {
        await api.patch(`/patients/${patientId}/portal-account/password`, { password: form.password });
        setSuccess("Senha temporária redefinida com sucesso.");
      }
      setModal(null);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setSaving(false); }
  }

  async function toggleStatus() {
    if (!account) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      const { data } = await api.patch(`/patients/${patientId}/portal-account/status`, { isActive: !account.isActive });
      setAccount(data); setSuccess(data.isActive ? "Acesso ao portal ativado." : "Acesso ao portal desativado.");
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setSaving(false); }
  }

  if (loading) return <Loading label="Verificando acesso ao portal..." />;
  if (!account) return <section>{error && <Message tone="error" text={error} />}<EmptyState title="Este paciente ainda não possui acesso ao portal" description="Crie uma conta para que o paciente ou responsável possa registrar informações diárias com segurança." action={<button className="btn-primary" onClick={openCreate}><ShieldCheck className="h-4 w-4" />Criar acesso ao portal</button>} />{modal === "create" && <AccountModal title="Criar acesso ao portal" form={form} setForm={setForm} error={error} saving={saving} submit={submit} close={() => setModal(null)} mode="create" />}</section>;

  return (
    <section className="space-y-5">
      {success && <Message tone="success" text={success} />}
      {error && !modal && <Message tone="error" text={error} />}
      <div className="card overflow-hidden p-0">
        <div className="border-b border-stone-100 bg-gradient-to-r from-white to-rosewood-50/60 p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div className="flex gap-4"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rosewood-100 text-rosewood-600"><UserRound className="h-7 w-7" /></span><div><p className="eyebrow mb-1">Acesso ao Portal</p><h2 className="text-xl font-semibold text-stone-800">{account.name}</h2><p className="mt-1 flex items-center gap-2 text-sm text-stone-500"><Mail className="h-4 w-4" />{account.email}</p></div></div>
            <span className={account.isActive ? "status-active" : "status-muted"}><span className={`h-1.5 w-1.5 rounded-full ${account.isActive ? "bg-emerald-500" : "bg-stone-400"}`} />{account.isActive ? "Ativo" : "Inativo"}</span>
          </div>
        </div>
        <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
          <Info label="Conta criada em" value={formatDateTime(account.createdAt)} />
          <Info label="Última atualização" value={formatDateTime(account.updatedAt)} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <button className="btn-secondary min-h-14" onClick={openEdit}><Pencil className="h-4 w-4" />Editar dados</button>
        <button className="btn-secondary min-h-14" onClick={openPassword}><KeyRound className="h-4 w-4" />Redefinir senha</button>
        <button className={`min-h-14 ${account.isActive ? "btn-secondary" : "btn-primary"}`} onClick={toggleStatus} disabled={saving}>{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}{account.isActive ? "Desativar acesso" : "Ativar acesso"}</button>
      </div>
      <p className="rounded-2xl bg-rosewood-50 px-4 py-3 text-sm leading-6 text-rosewood-700">O paciente ou responsável acessa pelo endereço <strong>/portal/login</strong>. A senha nunca é exibida após o cadastro.</p>

      {modal === "edit" && <AccountModal title="Editar acesso ao portal" form={form} setForm={setForm} error={error} saving={saving} submit={submit} close={() => setModal(null)} mode="edit" />}
      {modal === "password" && <AccountModal title="Redefinir senha do portal" form={form} setForm={setForm} error={error} saving={saving} submit={submit} close={() => setModal(null)} mode="password" />}
    </section>
  );
}

function AccountModal({ title, form, setForm, error, saving, submit, close, mode }: { title: string; form: AccountForm; setForm: (form: AccountForm) => void; error: string; saving: boolean; submit: (event: FormEvent) => void; close: () => void; mode: "create" | "edit" | "password" }) {
  return <Modal title={title} onClose={close}><form className="space-y-4" onSubmit={submit}>{error && <Message tone="error" text={error} />}{mode !== "password" && <><label><span className="label">Nome do paciente ou responsável *</span><input className="field" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label><span className="label">E-mail de acesso *</span><input className="field" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label></>}{mode !== "edit" && <><label><span className="label">Senha temporária *</span><input className="field" type="password" minLength={6} required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label><label><span className="label">Confirmar senha temporária *</span><input className="field" type="password" minLength={6} required value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} /></label></>}{mode !== "password" && <label className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3"><span><span className="block text-sm font-medium text-stone-700">Acesso ativo</span><span className="text-xs text-stone-400">Permite entrar imediatamente no portal.</span></span><input className="h-5 w-5 accent-rosewood-600" type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /></label>}<button className="btn-primary w-full" disabled={saving}>{saving && <LoaderCircle className="h-4 w-4 animate-spin" />}{saving ? "Salvando..." : mode === "password" ? "Redefinir senha" : "Salvar acesso"}</button></form></Modal>;
}

function Message({ tone, text }: { tone: "success" | "error"; text: string }) {
  return <p className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm ${tone === "success" ? "border border-emerald-100 bg-emerald-50 text-emerald-700" : "border border-red-100 bg-red-50 text-red-600"}`}>{tone === "success" && <CheckCircle2 className="h-4 w-4" />}{text}</p>;
}
function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-xs uppercase tracking-wider text-stone-400">{label}</p><p className="mt-1 font-medium text-stone-600">{value}</p></div>; }
const formatDateTime = (value: string) => new Date(value).toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" });
