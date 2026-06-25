import { CalendarDays, FileText, HeartHandshake, LayoutDashboard, LogOut, Menu, Users, X } from "lucide-react";
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
      <div className="flex h-20 items-center gap-3 px-6">
        <div className="rounded-2xl bg-rosewood-500 p-2.5 text-white"><HeartHandshake className="h-6 w-6" /></div>
        <div><p className="text-lg font-semibold text-stone-800">Essentia</p><p className="-mt-1 text-xs text-rosewood-500">Terapia Ocupacional</p></div>
      </div>
      <nav className="flex-1 space-y-1.5 px-4 py-5">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === "/"} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${isActive ? "bg-rosewood-100 text-rosewood-700" : "text-stone-500 hover:bg-white hover:text-stone-800"}`}>
            <Icon className="h-5 w-5" />{label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-stone-200 p-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rosewood-200 text-sm font-semibold text-rosewood-700">{initials}</div>
          <div className="min-w-0"><p className="truncate text-sm font-semibold text-stone-700">{therapist?.name}</p><p className="truncate text-xs text-stone-400">{therapist?.email}</p></div>
        </div>
        <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-500 hover:bg-white hover:text-rosewood-600"><LogOut className="h-4 w-4" />Sair</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-stone-200 bg-[#f8f1ee] lg:block">{sidebar}</aside>
      {open && <div className="no-print fixed inset-0 z-40 bg-stone-900/30 lg:hidden" onClick={() => setOpen(false)}><aside className="h-full w-72 bg-[#f8f1ee]" onClick={(e) => e.stopPropagation()}><button className="absolute left-[230px] top-5 rounded-lg p-2 text-stone-500" onClick={() => setOpen(false)}><X /></button>{sidebar}</aside></div>}
      <div className="lg:pl-64">
        <header className="no-print sticky top-0 z-20 flex h-16 items-center justify-between border-b border-stone-200/70 bg-cream/90 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} className="rounded-xl p-2 text-stone-600"><Menu /></button>
          <span className="font-semibold text-stone-800">Essentia TO</span>
          <FileText className="h-5 w-5 text-rosewood-400" />
        </header>
        <main className="print-area p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}

