import { BookOpen, CalendarHeart, ChevronRight, PlusCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { usePortalAuth } from "../../contexts/PortalAuthContext";

export function PortalDashboard() {
  const { account } = usePortalAuth();
  return (
    <div className="space-y-6">
      <section className="card overflow-hidden bg-gradient-to-br from-white via-white to-rosewood-50 p-7 sm:p-9">
        <span className="mb-5 inline-flex rounded-2xl bg-rosewood-100 p-3 text-rosewood-600"><Sparkles className="h-6 w-6" /></span>
        <p className="eyebrow mb-2">Bem-vindo ao seu diário</p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-800">Como foi o dia de {account?.patient.name.split(" ")[0]}?</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">Leva poucos minutos. Seus registros ajudam a terapeuta a compreender melhor a semana e preparar o próximo encontro.</p>
        <Link to="/portal/novo-registro" className="btn-primary mt-6 min-h-14 w-full text-base sm:w-auto"><PlusCircle className="h-5 w-5" />Fazer registro de hoje</Link>
      </section>
      <div className="grid gap-4 sm:grid-cols-2">
        <PortalLink to="/portal/novo-registro" icon={CalendarHeart} title="Novo registro" description="Conte como foi o dia, o humor, o estresse e o sono." filled />
        <PortalLink to="/portal/diario" icon={BookOpen} title="Meu diário" description="Veja os registros já enviados para a terapeuta." />
      </div>
    </div>
  );
}

function PortalLink({ to, icon: Icon, title, description, filled = false }: { to: string; icon: typeof BookOpen; title: string; description: string; filled?: boolean }) {
  return <Link to={to} className={`group flex min-h-40 items-start gap-4 rounded-3xl border p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift ${filled ? "border-rosewood-500 bg-rosewood-600 text-white" : "border-white bg-white/90 text-stone-700"}`}><span className={`rounded-2xl p-3 ${filled ? "bg-white/15" : "bg-rosewood-50 text-rosewood-500"}`}><Icon className="h-6 w-6" /></span><div className="flex-1"><h2 className="text-lg font-semibold">{title}</h2><p className={`mt-2 text-sm leading-6 ${filled ? "text-rosewood-100" : "text-stone-500"}`}>{description}</p></div><ChevronRight className="h-5 w-5 opacity-50 transition group-hover:translate-x-1" /></Link>;
}
