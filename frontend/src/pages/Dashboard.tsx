import { Activity, CalendarClock, ChevronRight, HeartPulse, UserCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { careLabels, formatDate } from "../lib/format";
import type { Appointment, Evolution } from "../types";
import { EmptyState, Loading, PageHeader } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";

type DashboardData = { totalPatients: number; activePatients: number; weeklySessions: number; recentEvolutions: Evolution[]; upcomingAppointments: Appointment[] };

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const { therapist } = useAuth();
  useEffect(() => { api.get("/dashboard").then((r) => setData(r.data)); }, []);
  if (!data) return <Loading label="Preparando seu painel..." />;
  const firstName = therapist?.name.replace(/^Dra?\.\s*/i, "").split(" ")[0];
  const cards = [
    { label: "Total de pacientes", value: data.totalPatients, icon: Users, color: "from-rosewood-100 to-rosewood-50 text-rosewood-600", detail: "na sua base clínica" },
    { label: "Pacientes ativos", value: data.activePatients, icon: UserCheck, color: "from-[#f8e8e4] to-[#fff9f7] text-[#a95b61]", detail: "em acompanhamento" },
    { label: "Sessões da semana", value: data.weeklySessions, icon: CalendarClock, color: "from-[#f3e9df] to-[#fffaf5] text-[#9b705a]", detail: "compromissos previstos" },
  ];
  return (
    <>
      <PageHeader title={`Olá, ${firstName || "terapeuta"}!`} description="Aqui está um resumo da sua rotina clínica." action={<Link to="/agenda" className="btn-primary"><CalendarClock className="h-4 w-4" />Novo agendamento</Link>} />
      <div className="grid gap-4 sm:grid-cols-3">{cards.map(({ label, value, icon: Icon, color, detail }) => <div className="card card-hover relative overflow-hidden" key={label}><div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-rosewood-100/50 blur-2xl" /><div className={`relative mb-5 inline-flex rounded-2xl bg-gradient-to-br p-3.5 ${color}`}><Icon className="h-6 w-6" /></div><div className="relative"><p className="text-3xl font-semibold tracking-tight text-stone-800">{value}</p><p className="mt-1 text-sm font-medium text-stone-600">{label}</p><p className="mt-0.5 text-xs text-stone-400">{detail}</p></div></div>)}</div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_.92fr]">
        <section className="card">
          <div className="mb-6 flex items-center justify-between"><div><p className="eyebrow mb-1">Agenda</p><h2 className="text-lg font-semibold text-stone-800">Próximas sessões</h2><p className="text-sm text-stone-400">Seus próximos compromissos</p></div><Link to="/agenda" className="rounded-xl px-3 py-2 text-sm font-semibold text-rosewood-600 transition hover:bg-rosewood-50">Ver agenda</Link></div>
          {data.upcomingAppointments.length ? <div className="space-y-3">{data.upcomingAppointments.map((item) => <div key={item.id} className="group flex items-center gap-4 rounded-2xl border border-stone-100 bg-stone-50/70 p-3.5 transition hover:border-rosewood-100 hover:bg-rosewood-50/50"><div className="min-w-16 rounded-2xl bg-white p-2.5 text-center shadow-sm ring-1 ring-stone-100"><p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">{new Date(item.date).toLocaleDateString("pt-BR", { month: "short", timeZone: "UTC" })}</p><p className="text-xl font-semibold text-rosewood-600">{new Date(item.date).getUTCDate()}</p></div><div className="min-w-0 flex-1"><p className="truncate font-semibold text-stone-700">{item.patient.name}</p><p className="mt-1 text-xs text-stone-400">{item.startTime} · {careLabels[item.careType]}</p></div><ChevronRight className="h-4 w-4 text-stone-300 transition group-hover:translate-x-1 group-hover:text-rosewood-400" /></div>)}</div> : <EmptyState title="Agenda tranquila" description="Não há próximas sessões agendadas." />}
        </section>
        <section className="card">
          <div className="mb-6 flex items-start justify-between"><div><p className="eyebrow mb-1">Acompanhamento</p><h2 className="text-lg font-semibold text-stone-800">Evoluções recentes</h2><p className="text-sm text-stone-400">Últimos registros clínicos</p></div><div className="rounded-2xl bg-rosewood-50 p-2.5 text-rosewood-500"><HeartPulse className="h-5 w-5" /></div></div>
          {data.recentEvolutions.length ? <div className="relative space-y-1 before:absolute before:bottom-5 before:left-[18px] before:top-5 before:w-px before:bg-rosewood-100">{data.recentEvolutions.map((item) => <Link to={`/pacientes/${item.patient?.id}`} key={item.id} className="relative flex gap-4 rounded-2xl p-3 transition hover:bg-rosewood-50/70"><div className="z-10 mt-1 rounded-full bg-white p-2 text-rosewood-500 shadow-sm ring-4 ring-rosewood-50"><Activity className="h-4 w-4" /></div><div className="min-w-0 pb-2"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-stone-700">{item.patient?.name}</p><span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-500">{formatDate(item.sessionDate)}</span></div><p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-500">{item.perceivedProgress || item.patientPerformance}</p></div></Link>)}</div> : <EmptyState title="Sem evoluções" description="As evoluções registradas aparecerão aqui." />}
        </section>
      </div>
    </>
  );
}
