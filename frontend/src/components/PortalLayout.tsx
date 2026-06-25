import { BookOpen, HeartHandshake, Home, LogOut, PlusCircle } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { usePortalAuth } from "../contexts/PortalAuthContext";

const links = [
  { to: "/portal", label: "Início", icon: Home, end: true },
  { to: "/portal/novo-registro", label: "Novo registro", icon: PlusCircle },
  { to: "/portal/diario", label: "Meu diário", icon: BookOpen },
];

export function PortalLayout() {
  const { account, signOut } = usePortalAuth();
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fbecee,_#fdf9f7_38%)]">
      <header className="sticky top-0 z-20 border-b border-white/80 bg-cream/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3"><span className="rounded-2xl bg-rosewood-600 p-2.5 text-white shadow-lg shadow-rosewood-200"><HeartHandshake className="h-5 w-5" /></span><div><p className="font-semibold text-stone-800">Essentia TO</p><p className="text-xs text-rosewood-500">Portal do paciente</p></div></div>
          <button onClick={signOut} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-stone-500 hover:bg-white hover:text-rosewood-600"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">Sair</span></button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8">
        <div className="mb-6"><p className="text-sm text-stone-500">Olá, {account?.name}</p><p className="text-xs text-stone-400">Acompanhamento de {account?.patient.name}</p></div>
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-rosewood-100 bg-white/95 px-2 py-2 shadow-[0_-12px_35px_rgba(112,61,73,.08)] backdrop-blur sm:bottom-5 sm:left-1/2 sm:right-auto sm:w-fit sm:-translate-x-1/2 sm:rounded-2xl sm:border">
        <div className="mx-auto flex max-w-md justify-around gap-1">
          {links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex min-w-24 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition ${isActive ? "bg-rosewood-100 text-rosewood-700" : "text-stone-400 hover:bg-rosewood-50 hover:text-rosewood-600"}`}><Icon className="h-5 w-5" />{label}</NavLink>)}
        </div>
      </nav>
    </div>
  );
}
