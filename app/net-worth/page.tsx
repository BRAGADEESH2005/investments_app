"use client";

import { useEffect, useMemo, useState } from "react";
import SiteNav from "@/components/SiteNav";

type Investment = { principal: number; type: string };
type Liability = { id: string; name: string; amount: number };
const money = (value: number) => value.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function NetWorthPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [form, setForm] = useState({ name: "", amount: "" });
  const [message, setMessage] = useState("");
  useEffect(() => {
    Promise.all([fetch("/api/investments?pageSize=100").then((response) => response.json()), fetch("/api/liabilities").then((response) => response.json())]).then(([investmentData, liabilityData]) => { setInvestments(investmentData.investments || []); setLiabilities((liabilityData.items || []).map((item: Liability & { _id?: string }) => ({ ...item, id: item.id || item._id || "" }))); });
  }, []);
  const totalAssets = useMemo(() => investments.reduce((sum, item) => sum + item.principal, 0), [investments]);
  const totalLiabilities = useMemo(() => liabilities.reduce((sum, item) => sum + item.amount, 0), [liabilities]);
  const netWorth = totalAssets - totalLiabilities;
  const allocation = ["House", "FD", "RD", "Gold"].map((type) => ({ type, value: investments.filter((item) => item.type === type).reduce((sum, item) => sum + item.principal, 0) }));
  async function addLiability(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/liabilities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, amount: Number(form.amount) }) });
    const data = await response.json(); if (!response.ok) { setMessage(data.error || "Could not save liability."); return; }
    setForm({ name: "", amount: "" }); setMessage("Liability added."); const refreshed = await fetch("/api/liabilities").then((item) => item.json()); setLiabilities((refreshed.items || []).map((item: Liability & { _id?: string }) => ({ ...item, id: item.id || item._id || "" })));
  }
  return <main className="min-h-screen bg-[#f4f7f6] text-slate-900"><SiteNav /><div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6"><header><p className="text-xs font-bold tracking-[.22em] text-emerald-700">NET WORTH</p><h1 className="mt-2 text-4xl font-bold tracking-tight">The full financial picture.</h1><p className="mt-2 text-slate-500">LIC coverage is deliberately excluded from assets and net worth to avoid double-counting.</p></header>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-2xl bg-slate-950 p-5 text-white shadow-sm"><p className="text-sm text-slate-400">Overall net worth</p><p className="mt-2 text-3xl font-bold">{money(netWorth)}</p></div><div className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Total assets</p><p className="mt-2 text-3xl font-bold">{money(totalAssets)}</p></div><div className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Invested principal</p><p className="mt-2 text-3xl font-bold">{money(totalAssets)}</p></div><div className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Total liabilities</p><p className="mt-2 text-3xl font-bold text-rose-700">{money(totalLiabilities)}</p></div></div>
    <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><section className="rounded-2xl border bg-white p-6 shadow-sm"><p className="text-xs font-bold tracking-widest text-emerald-700">ASSET ALLOCATION</p><h2 className="mt-1 text-xl font-bold">Where your assets sit</h2><div className="mt-6 space-y-4">{allocation.map((item) => <div key={item.type}><div className="flex justify-between text-sm"><span className="font-semibold">{item.type}</span><span>{money(item.value)} · {totalAssets ? (item.value / totalAssets * 100).toFixed(1) : "0.0"}%</span></div><div className="mt-2 h-3 rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${totalAssets ? item.value / totalAssets * 100 : 0}%` }} /></div></div>)}</div></section>
      <form onSubmit={addLiability} className="h-fit space-y-3 rounded-2xl border bg-white p-6 shadow-sm"><h2 className="font-bold">Add liability</h2><input required placeholder="Loan or liability name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border px-3 py-3" /><input required type="number" min="0.01" step="0.01" placeholder="Outstanding amount (₹)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full rounded-lg border px-3 py-3" />{message && <p className="text-sm text-emerald-700">{message}</p>}<button className="w-full rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white">Save liability</button><div className="divide-y">{liabilities.map((liability) => <div key={liability.id} className="flex justify-between py-3 text-sm"><span>{liability.name}</span><span className="font-semibold">{money(liability.amount)}</span></div>)}</div></form></div>
  </div></main>;
}
