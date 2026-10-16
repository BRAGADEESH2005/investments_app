export function LoadingState({ label = "Loading your portfolio..." }: { label?: string }) {
  return <div className="flex items-center justify-center gap-3 rounded-2xl border bg-white p-12 text-sm text-slate-500 shadow-sm"><span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700" aria-hidden="true" />{label}</div>;
}

export function SavingState({ label = "Saving..." }: { label?: string }) {
  return <span className="inline-flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />{label}</span>;
}
