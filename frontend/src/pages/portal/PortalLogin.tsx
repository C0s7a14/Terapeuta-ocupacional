import { HeartHandshake, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { usePortalAuth } from "../../contexts/PortalAuthContext";
import { getErrorMessage, portalApi } from "../../lib/api";

export function PortalLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { token, signIn } = usePortalAuth();
  const navigate = useNavigate();
  if (token) return <Navigate to="/portal" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setError("");
    try {
      const { data } = await portalApi.post("/portal/auth/login", form);
      signIn(data.token, data.account);
      navigate("/portal");
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#f5dce0,_#fdf9f7_48%)] p-4">
      <div className="w-full max-w-md rounded-[2rem] border border-white bg-white/90 p-6 shadow-2xl shadow-rosewood-200/40 backdrop-blur sm:p-9">
        <div className="mb-8 text-center"><span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rosewood-600 text-white shadow-lg shadow-rosewood-200"><HeartHandshake className="h-7 w-7" /></span><p className="eyebrow">Essentia TO</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-800">Seu espaço de cuidado</h1><p className="mt-2 text-sm leading-6 text-stone-500">Entre para registrar como foi o seu dia e acompanhar seu diário.</p></div>
        <form className="space-y-4" onSubmit={submit}>
          <label><span className="label">E-mail</span><input className="field min-h-12 text-base" type="email" required autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label><span className="label">Senha</span><input className="field min-h-12 text-base" type="password" required autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
          {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          <button className="btn-primary min-h-13 w-full text-base" disabled={loading}>{loading ? "Entrando..." : "Entrar no portal"}</button>
        </form>
        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-stone-400"><ShieldCheck className="h-4 w-4" />Seu acesso é pessoal e protegido.</p>
      </div>
    </div>
  );
}
