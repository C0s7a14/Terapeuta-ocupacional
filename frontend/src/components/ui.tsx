import { X, LoaderCircle, Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function Loading({ label = "Carregando..." }: { label?: string }) {
  return <div className="flex min-h-52 items-center justify-center gap-3 text-sm text-stone-500"><LoaderCircle className="h-5 w-5 animate-spin text-rosewood-500" />{label}</div>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-rosewood-200 bg-rosewood-50/40 px-6 py-12 text-center">
      <div className="mb-4 rounded-2xl bg-white p-3 text-rosewood-400 shadow-sm"><Inbox className="h-6 w-6" /></div>
      <h3 className="font-semibold text-stone-700">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-stone-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/35 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={onClose}>
      <div className={`max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-cream p-5 shadow-2xl sm:rounded-3xl sm:p-6 ${wide ? "max-w-4xl" : "max-w-xl"}`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-stone-800">{title}</h2>
          <button className="rounded-xl p-2 text-stone-400 hover:bg-white hover:text-stone-700" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><h1 className="text-2xl font-semibold tracking-tight text-stone-800 sm:text-3xl">{title}</h1>{description && <p className="mt-1 text-sm text-stone-500">{description}</p>}</div>
      {action}
    </div>
  );
}

