import { CheckCircle2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { emptyPortalDiaryForm, PortalDiaryForm, type PortalDiaryFormData } from "../../components/PortalDiaryForm";
import { getErrorMessage, portalApi } from "../../lib/api";

export function PortalNewEntry() {
  const [form, setForm] = useState<PortalDiaryFormData>(emptyPortalDiaryForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.mood) { setError("Escolha como você está se sentindo hoje."); return; }
    setSaving(true); setError("");
    try {
      await portalApi.post("/portal/diary", {
        ...form,
        sleepQuality: form.sleepQuality || null,
        activities: form.activities || null,
        patientOrCaregiverNotes: form.patientOrCaregiverNotes || null,
      });
      setForm(emptyPortalDiaryForm);
      setSuccess(true);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setSaving(false); }
  }

  if (success) return <section className="card mx-auto max-w-2xl py-12 text-center"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-8 w-8" /></span><h1 className="mt-5 text-2xl font-semibold text-stone-800">Registro salvo com sucesso</h1><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">Obrigada por compartilhar como foi o dia. Essas informações estarão disponíveis para a terapeuta.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><button className="btn-primary" onClick={() => setSuccess(false)}>Fazer outro registro</button><Link className="btn-secondary" to="/portal/diario">Ver meu diário</Link></div></section>;

  return <section className="card mx-auto max-w-3xl p-6 sm:p-8">{error && <p className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}<PortalDiaryForm value={form} onChange={setForm} onSubmit={submit} saving={saving} /></section>;
}
