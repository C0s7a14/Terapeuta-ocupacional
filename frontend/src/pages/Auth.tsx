import { HeartHandshake, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api, getErrorMessage } from "../lib/api";

export function AuthPage({ register = false }: { register?: boolean }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", professionalId: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { token, signIn } = useAuth();
  const navigate = useNavigate();
  if (token) return <Navigate to="/" replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const { data } = await api.post(`/auth/${register ? "register" : "login"}`, form);
      signIn(data.token, data.therapist);
      navigate("/");
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f5dce0,_#fcf9f7_45%)] p-4 sm:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl shadow-rosewood-200/40 lg:grid-cols-2">
        <div className="hidden flex-col justify-between bg-rosewood-600 p-12 text-white lg:flex">
          <div className="flex items-center gap-3"><div className="rounded-2xl bg-white/15 p-3"><HeartHandshake /></div><span className="text-xl font-semibold">Essentia TO</span></div>
          <div><p className="mb-5 max-w-md text-4xl font-semibold leading-tight">Cuidado clínico com organização, presença e sensibilidade.</p><p className="max-w-md text-rosewood-100">Prontuários, evoluções e agenda reunidos em um espaço seguro e acolhedor.</p></div>
          <div className="flex items-center gap-2 text-sm text-rosewood-100"><ShieldCheck className="h-4 w-4" />Seus dados clínicos protegidos</div>
        </div>
        <div className="flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden"><div className="mb-2 flex items-center gap-2 text-rosewood-600"><HeartHandshake /><span className="font-semibold">Essentia TO</span></div></div>
            <p className="text-sm font-semibold uppercase tracking-[.2em] text-rosewood-500">{register ? "Comece agora" : "Bem-vinda de volta"}</p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-800">{register ? "Crie sua conta" : "Acesse seu espaço clínico"}</h1>
            <p className="mt-2 text-sm text-stone-500">{register ? "Cadastre seus dados profissionais." : "Entre para acompanhar seus pacientes."}</p>
            <form onSubmit={submit} className="mt-8 space-y-4">
              {register && <><label><span className="label">Nome completo</span><input className="field" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><div className="grid gap-4 sm:grid-cols-2"><label><span className="label">Telefone</span><input className="field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label><label><span className="label">Registro profissional</span><input className="field" value={form.professionalId} onChange={(e) => setForm({ ...form, professionalId: e.target.value })} /></label></div></>}
              <label><span className="label">E-mail</span><input className="field" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
              <label><span className="label">Senha</span><input className="field" type="password" minLength={6} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
              {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
              <button className="btn-primary w-full" disabled={loading}>{loading ? "Aguarde..." : register ? "Criar conta" : "Entrar"}</button>
            </form>
            <p className="mt-6 text-center text-sm text-stone-500">{register ? "Já possui uma conta?" : "Ainda não possui uma conta?"} <Link className="font-semibold text-rosewood-600 hover:underline" to={register ? "/login" : "/cadastro"}>{register ? "Entrar" : "Cadastre-se"}</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

