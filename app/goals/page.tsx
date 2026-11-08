"use client";

import { useEffect, useState } from "react";
import SiteNav from "@/components/SiteNav";
import { LoadingState, SavingState } from "@/components/LoadingState";

type Goal = { id: string; name: string; targetAmount: number; currentAmount: number; targetDate?: string; monthlyContribution?: number };
const money = (value: number) => value.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [form, setForm] = useState({ name: "", targetAmount: "", currentAmount: "0", targetDate: "", monthlyContribution: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/financial-goals");
      if (response.status === 401) { window.location.href = "/login"; return; }
      const data = await response.json();
      setGoals((data.items || []).map((item: Goal & { _id?: string }) => ({ ...item, id: item.id || item._id || "" })));
    } finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/financial-goals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      ...form,
      targetAmount: Number(form.targetAmount),
      currentAmount: Number(form.currentAmount || 0),
      monthlyContribution: form.monthlyContribution ? Number(form.monthlyContribution) : undefined,
    }) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error || "Could not save goal."); return; }
    setMessage("Goal created."); setForm({ name: "", targetAmount: "", currentAmount: "0", targetDate: "", monthlyContribution: "" }); await load(); setSaving(false);
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this goal?")) return;
    const response = await fetch(`/api/financial-goals/${id}`, { method: "DELETE" });
    if (response.ok) setGoals((current) => current.filter((goal) => goal.id !== id));
  }

  return <main className="min-h-screen bg-[#f4f7f6] text-slate-900"><SiteNav /><div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
    <header><p className="text-xs font-bold tracking-[.22em] text-emerald-700">FINANCIAL GOALS</p><h1 className="mt-2 text-4xl font-bold tracking-tight">Turn plans into progress.</h1><p className="mt-2 text-slate-500">Track the milestones that matter to your household.</p></header>
    <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
      <form onSubmit={save} className="h-fit space-y-3 rounded-2xl border bg-white p-5 shadow-sm"><h2 className="font-bold">Create a goal</h2>
        <input required placeholder="Goal name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border px-3 py-3" />
        <input required type="number" min="0.01" step="0.01" placeholder="Target amount (₹)" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} className="w-full rounded-lg border px-3 py-3" />
        <input type="number" min="0" step="0.01" placeholder="Already saved (₹)" value={form.currentAmount} onChange={(e) => setForm({ ...form, currentAmount: e.target.value })} className="w-full rounded-lg border px-3 py-3" />
        <label className="block text-sm font-medium">Target date<input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-3 font-normal" /></label>
        <input type="number" min="0" step="0.01" placeholder="Monthly contribution (₹)" value={form.monthlyContribution} onChange={(e) => setForm({ ...form, monthlyContribution: e.target.value })} className="w-full rounded-lg border px-3 py-3" />
        {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}<button disabled={saving} className="w-full rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white disabled:opacity-60">{saving ? <SavingState label="Saving goal..." /> : "Save goal"}</button>
      </form>
      {loading ? <LoadingState label="Loading your goals..." /> : <section className="grid gap-4 sm:grid-cols-2">{goals.length === 0 ? <div className="rounded-2xl border bg-white p-10 text-center text-slate-500 sm:col-span-2">No goals yet. Create your first financial milestone.</div> : goals.map((goal) => {
        const progress = goal.targetAmount > 0 ? Math.min(100, Math.max(0, goal.currentAmount / goal.targetAmount * 100)) : 0;
        const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
        const months = goal.monthlyContribution && goal.monthlyContribution > 0 ? Math.ceil(remaining / goal.monthlyContribution) : null;
        return <article key={goal.id} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold">{goal.name}</h2><p className="mt-1 text-sm text-slate-500">{money(goal.currentAmount)} of {money(goal.targetAmount)}</p></div><button onClick={() => void remove(goal.id)} className="text-xs font-semibold text-rose-700">Delete</button></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} /></div><div className="mt-2 flex justify-between text-xs font-semibold text-slate-500"><span>{progress.toFixed(0)}% complete</span><span>{money(remaining)} remaining</span></div>{goal.targetDate && <p className="mt-4 text-sm text-slate-600">Target: {goal.targetDate}</p>}{months !== null && <p className="mt-1 text-sm text-emerald-700">Estimated completion: {months} month{months === 1 ? "" : "s"}</p>}</article>;
      })}</section>}
    </div>
  </div></main>;
}
