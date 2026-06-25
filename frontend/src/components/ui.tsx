import { X, LoaderCircle, Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function Loading({ label = "Carregando..." }: { label?: string }) {
  return <div className="flex min-h-52 items-center justify-center gap-3 rounded-3xl border border-white/80 bg-white/50 text-sm text-stone-500"><LoaderCircle className="h-5 w-5 animate-spin text-rosewood-500" />{label}</div>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-rosewood-200 bg-gradient-to-br from-rosewood-50/80 to-white px-6 py-12 text-center">
      <div className="mb-4 rounded-2xl bg-white p-3 text-rosewood-500 shadow-soft"><Inbox className="h-6 w-6" /></div>
      <h3 className="font-semibold text-stone-700">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-stone-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/35 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={onClose}>
      <div className={`max-h-[94vh] w-full overflow-y-auto rounded-t-[2rem] border border-white bg-cream p-5 shadow-2xl sm:rounded-[2rem] sm:p-7 ${wide ? "max-w-4xl" : "max-w-xl"}`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <div><p className="eyebrow">Essentia TO</p><h2 className="mt-1 text-xl font-semibold text-stone-800">{title}</h2></div>
          <button className="icon-button bg-white" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="eyebrow mb-2">Espaço clínico</p><h1 className="text-3xl font-semibold tracking-[-0.035em] text-stone-800 sm:text-4xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">{description}</p>}</div>
      {action}
    </div>
  );
}
