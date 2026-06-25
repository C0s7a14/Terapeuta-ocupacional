import { CalendarDays, HeartHandshake, LayoutDashboard, LogOut, Menu, Sparkles, Users, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/pacientes", label: "Pacientes", icon: Users },
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
];

export function Layout() {
  const [open, setOpen] = useState(false);
  const { therapist, signOut } = useAuth();
  const initials = therapist?.name.split(" ").slice(0, 2).map((n) => n[0]).join("");

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-24 items-center gap-3 px-6">
        <div className="rounded-2xl bg-gradient-to-br from-rosewood-500 to-rosewood-700 p-3 text-white shadow-lg shadow-rosewood-200"><HeartHandshake className="h-6 w-6" /></div>
        <div><p className="text-lg font-semibold tracking-tight text-stone-800">Essentia</p><p className="text-[11px] font-medium uppercase tracking-[.16em] text-rosewood-500">Terapia Ocupacional</p></div>
      </div>
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-rosewood-200 to-transparent" />
      <nav className="flex-1 space-y-2 px-4 py-6">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === "/"} onClick={() => setOpen(false)} className={({ isActive }) => `group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition ${isActive ? "bg-white text-rosewood-700 shadow-soft ring-1 ring-rosewood-100" : "text-stone-500 hover:bg-white/70 hover:text-stone-800"}`}>
            <span className="rounded-xl bg-white/70 p-2 text-rosewood-500 shadow-sm transition group-hover:scale-105"><Icon className="h-4 w-4" /></span>{label}
          </NavLink>
        ))}
      </nav>
      <div className="m-4 rounded-3xl border border-white/80 bg-white/65 p-3 shadow-soft">
        <div className="mb-3 flex items-center gap-3 px-1">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rosewood-200 to-nude text-sm font-semibold text-rosewood-800">{initials}</div>
          <div className="min-w-0"><p className="truncate text-sm font-semibold text-stone-700">{therapist?.name}</p><p className="truncate text-xs text-stone-400">{therapist?.email}</p></div>
        </div>
        <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-500 transition hover:bg-rosewood-50 hover:text-rosewood-600"><LogOut className="h-4 w-4" />Sair</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/80 bg-[#f8eeec]/95 shadow-soft backdrop-blur-xl lg:block">{sidebar}</aside>
      {open && <div className="no-print fixed inset-0 z-40 bg-stone-900/30 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)}><aside className="h-full w-72 bg-[#f8eeec]" onClick={(e) => e.stopPropagation()}><button className="absolute left-[230px] top-5 rounded-xl p-2 text-stone-500" onClick={() => setOpen(false)}><X /></button>{sidebar}</aside></div>}
      <div className="lg:pl-72">
        <header className="no-print sticky top-0 z-20 flex h-18 items-center justify-between border-b border-white/80 bg-cream/85 px-4 py-3 backdrop-blur-xl lg:hidden">
          <button onClick={() => setOpen(true)} className="icon-button bg-white shadow-sm"><Menu /></button>
          <span className="font-semibold tracking-tight text-stone-800">Essentia TO</span>
          <span className="rounded-xl bg-rosewood-100 p-2 text-rosewood-500"><Sparkles className="h-4 w-4" /></span>
        </header>
        <main className="print-area mx-auto max-w-[1600px] p-4 sm:p-7 lg:p-10"><Outlet /></main>
      </div>
    </div>
  );
}
