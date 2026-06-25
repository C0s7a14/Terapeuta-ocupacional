import { Activity, CalendarClock, ChevronRight, UserCheck, Users } from "lucide-react";
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
    { label: "Total de pacientes", value: data.totalPatients, icon: Users, color: "bg-rosewood-100 text-rosewood-600" },
    { label: "Pacientes ativos", value: data.activePatients, icon: UserCheck, color: "bg-emerald-50 text-emerald-600" },
    { label: "Sessões da semana", value: data.weeklySessions, icon: CalendarClock, color: "bg-amber-50 text-amber-600" },
  ];
  return (
    <>
      <PageHeader title={`Olá, ${firstName || "terapeuta"}!`} description="Aqui está um resumo da sua rotina clínica." action={<Link to="/agenda" className="btn-primary"><CalendarClock className="h-4 w-4" />Novo agendamento</Link>} />
      <div className="grid gap-4 sm:grid-cols-3">{cards.map(({ label, value, icon: Icon, color }) => <div className="card flex items-center gap-4" key={label}><div className={`rounded-2xl p-3 ${color}`}><Icon className="h-6 w-6" /></div><div><p className="text-2xl font-semibold text-stone-800">{value}</p><p className="text-sm text-stone-500">{label}</p></div></div>)}</div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="card">
          <div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold text-stone-800">Próximas sessões</h2><p className="text-sm text-stone-400">Seus próximos compromissos</p></div><Link to="/agenda" className="text-sm font-medium text-rosewood-600">Ver agenda</Link></div>
          {data.upcomingAppointments.length ? <div className="space-y-3">{data.upcomingAppointments.map((item) => <div key={item.id} className="flex items-center gap-4 rounded-xl bg-stone-50 p-3.5"><div className="min-w-14 rounded-xl bg-white p-2 text-center shadow-sm"><p className="text-xs uppercase text-stone-400">{new Date(item.date).toLocaleDateString("pt-BR", { month: "short", timeZone: "UTC" })}</p><p className="text-lg font-semibold text-rosewood-600">{new Date(item.date).getUTCDate()}</p></div><div className="min-w-0 flex-1"><p className="truncate font-medium text-stone-700">{item.patient.name}</p><p className="text-xs text-stone-400">{item.startTime} · {careLabels[item.careType]}</p></div><ChevronRight className="h-4 w-4 text-stone-300" /></div>)}</div> : <EmptyState title="Agenda tranquila" description="Não há próximas sessões agendadas." />}
        </section>
        <section className="card">
          <div className="mb-5"><h2 className="font-semibold text-stone-800">Evoluções recentes</h2><p className="text-sm text-stone-400">Últimos registros clínicos</p></div>
          {data.recentEvolutions.length ? <div className="space-y-3">{data.recentEvolutions.map((item) => <Link to={`/pacientes/${item.patient?.id}`} key={item.id} className="flex gap-3 rounded-xl p-3 transition hover:bg-rosewood-50"><div className="mt-1 rounded-full bg-rosewood-100 p-2 text-rosewood-500"><Activity className="h-4 w-4" /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-medium text-stone-700">{item.patient?.name}</p><span className="text-xs text-stone-400">{formatDate(item.sessionDate)}</span></div><p className="mt-1 line-clamp-2 text-sm text-stone-500">{item.perceivedProgress || item.patientPerformance}</p></div></Link>)}</div> : <EmptyState title="Sem evoluções" description="As evoluções registradas aparecerão aqui." />}
        </section>
      </div>
    </>
  );
}

