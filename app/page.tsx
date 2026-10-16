"use client";

import { useEffect, useMemo, useState } from "react";
import SiteNav from "@/components/SiteNav";
import { LoadingState, SavingState } from "@/components/LoadingState";
import { getGoldPrice } from "@/lib/gold";

type Investment = { id: string; type: "House" | "FD" | "RD" | "Gold"; name: string; principal: number; investedAt: string; endDate?: string; interestRate?: number; quantity?: number; unit?: string; assetName?: string };
type GoldPrices = { 18: number; 22: number; 24: number };

const types = ["House", "FD", "RD", "Gold"] as const;
const money = (value: number) => value.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function Dashboard() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [type, setType] = useState<typeof types[number]>("House");
  const [form, setForm] = useState<Record<string, string>>({ name: "", principal: "", investedAt: new Date().toISOString().slice(0, 10), startDate: "", endDate: "", interestRate: "", quantity: "", unit: "grams", assetName: "", documentUrl: "" });
  const [file, setFile] = useState<File | null>(null);
  const [goldPrices, setGoldPrices] = useState<GoldPrices>({ 18: 0, 22: 0, 24: 0 });
  const [message, setMessage] = useState("");
  const [transactionInvestmentId, setTransactionInvestmentId] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [transactionSaving, setTransactionSaving] = useState(false);

  async function load() {
    setLoading(true);
    const response = await fetch("/api/investments");
    if (response.status === 401) { window.location.href = "/login"; return; }
    const data = await response.json();
    setInvestments(data.investments || []);
    setLoading(false);
  }
  useEffect(() => { void load(); fetch("/api/prices/gold").then((res) => res.json()).then((data) => setGoldPrices(data.prices?.perGram || { 18: 0, 22: 0, 24: 0 })).catch(() => undefined); }, []);

  const totalPrincipal = investments.reduce((sum, item) => sum + item.principal, 0);
  const byType = useMemo(() => types.map((investmentType) => ({ type: investmentType, value: investments.filter((item) => item.type === investmentType).reduce((sum, item) => sum + item.principal, 0) })), [investments]);

  async function uploadDocument() {
    if (!file) return "";
    const data = new FormData();
    data.append("file", file);
    const uploadedResponse = await fetch("/api/documents", { method: "POST", body: data });
    const uploaded = await uploadedResponse.json();
    if (!uploadedResponse.ok) throw new Error(uploaded.error?.message || "Document upload failed.");
    if (!uploaded.url) throw new Error("Document upload failed.");
    return uploaded.url as string;
  }

  async function addInvestment(event: React.FormEvent) {
    event.preventDefault(); setMessage(""); setSaving(true);
    try {
      const documentUrl = file ? await uploadDocument() : "";
      const response = await fetch("/api/investments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, type, principal: Number(form.principal), interestRate: form.interestRate ? Number(form.interestRate) : undefined, quantity: form.quantity ? Number(form.quantity) : undefined, documentUrl }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save investment.");
      setMessage("Investment saved successfully."); setForm((current) => ({ ...current, name: "", principal: "", interestRate: "", quantity: "", assetName: "" })); setFile(null); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save investment."); } finally { setSaving(false); }
  }

  async function addHouseTransaction(event: React.FormEvent) {
    event.preventDefault(); setTransactionSaving(true);
    const response = await fetch("/api/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ investmentId: transactionInvestmentId, amount: Number(transactionAmount), date: transactionDate }) });
    const data = await response.json();
    setMessage(response.ok ? "House transaction saved." : (data.error || "Could not save transaction."));
    if (response.ok) setTransactionAmount(""); setTransactionSaving(false);
  }

  return <main className="min-h-screen bg-[#f6f8fb] pb-10 text-slate-900">
    <SiteNav />
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1.3fr_.7fr]">
      <section className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8"><div className="relative z-[1]"><p className="text-xs font-bold tracking-[.2em] text-emerald-300">YOUR WEALTH, IN ONE VIEW</p><p className="mt-4 text-sm text-slate-400">Total principal tracked</p><p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{money(totalPrincipal)}</p><p className="mt-3 max-w-xl text-sm text-slate-400">Build a clearer financial future with a calm, structured view of your House, FD, RD and Gold holdings.</p><div className="mt-6 flex flex-wrap gap-3"><a href="/analysis" className="rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950">Explore insights</a><a href="/investments" className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white">View ledger</a></div></div><div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" /></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{byType.map((item) => <a href={`/investments/${item.type.toLowerCase()}`} key={item.type} className="rounded-2xl border bg-white p-4 shadow-sm hover:border-emerald-400"><p className="text-sm font-semibold text-slate-500">{item.type}</p><p className="mt-2 font-bold">{money(item.value)}</p></a>)}</div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-bold">Your portfolio</h2><p className="mt-1 text-sm text-slate-500">A scalable list; the API paginates as it grows.</p></div>{goldPrices[24] > 0 && <span className="text-xs font-semibold text-amber-700">Gold: 18K {money(goldPrices[18])} · 22K {money(goldPrices[22])} · 24K {money(goldPrices[24])}/g</span>}</div><div className="mt-4 divide-y">{loading ? <LoadingState label="Loading portfolio..." /> : investments.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">Add your first investment to start tracking.</p> : investments.map((item) => { const gold = item.type === "Gold" && item.quantity ? getGoldPrice(goldPrices, item.name) : null; return <div key={item.id} className="flex items-center justify-between gap-3 py-4"><div><p className="font-semibold">{item.name}</p><p className="text-xs text-slate-500">{item.type} · {item.investedAt}{item.interestRate ? ` · ${item.interestRate}% p.a.` : ""}</p></div><div className="text-right"><p className="font-bold">{money(item.principal)}</p>{gold && gold.pricePerGram > 0 && <p className="text-xs text-amber-700">Est. {money(item.quantity! * gold.pricePerGram)} · {gold.karat}K</p>}</div></div>; })}</div></div>
        <form onSubmit={addHouseTransaction} className="rounded-2xl border bg-white p-5 shadow-sm"><h2 className="font-bold">Daily House transaction</h2><p className="mt-1 text-sm text-slate-500">Record your daily House contribution without trying to calculate market value.</p><div className="mt-4 grid gap-3 sm:grid-cols-3"><select required value={transactionInvestmentId} onChange={(e) => setTransactionInvestmentId(e.target.value)} className="rounded-lg border px-3 py-3"><option value="">Select House account</option>{investments.filter((item) => item.type === "House").map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><input required type="number" min="0.01" step="0.01" placeholder="Amount (₹)" value={transactionAmount} onChange={(e) => setTransactionAmount(e.target.value)} className="rounded-lg border px-3 py-3" /><input required type="date" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} className="rounded-lg border px-3 py-3" /></div><button disabled={transactionSaving} className="mt-3 rounded-lg border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 disabled:opacity-60">{transactionSaving ? <SavingState label="Saving..." /> : "Save daily transaction"}</button></form>
      </section>
      <form onSubmit={addInvestment} className="h-fit space-y-4 rounded-3xl border bg-white p-5 shadow-sm sm:p-6"><div><p className="text-xs font-bold tracking-widest text-emerald-700">ADD INVESTMENT</p><h2 className="mt-1 text-xl font-bold">Record a new investment</h2></div><select value={type} onChange={(event) => setType(event.target.value as typeof type)} className="w-full rounded-lg border px-3 py-3">{types.map((item) => <option key={item}>{item}</option>)}</select><input required placeholder={type === "Gold" ? "Start with 22K, 24K or 18K (e.g. 22K Gold chain)" : "Investment name"} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border px-3 py-3" />{type === "Gold" && <p className="-mt-2 text-xs text-amber-700">Start the name with 22K, 24K or 18K. Uppercase/lowercase is accepted.</p>}<input required type="number" min="0.01" step="0.01" placeholder="Principal / amount (₹)" value={form.principal} onChange={(e) => setForm({ ...form, principal: e.target.value })} className="w-full rounded-lg border px-3 py-3" /><label className="block text-sm font-medium">Investment date<input required type="date" value={form.investedAt} onChange={(e) => setForm({ ...form, investedAt: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-3 font-normal" /></label>{(type === "FD" || type === "RD") && <div className="grid grid-cols-2 gap-3"><label className="text-sm font-medium">Start date<input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-3 font-normal" /></label><label className="text-sm font-medium">End date<input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-3 font-normal" /></label><input type="number" step="0.01" placeholder="Interest rate % p.a." value={form.interestRate} onChange={(e) => setForm({ ...form, interestRate: e.target.value })} className="col-span-2 rounded-lg border px-3 py-3" /></div>}{type === "Gold" && <div className="space-y-3"><input required placeholder="Ornament or coin name" value={form.assetName} onChange={(e) => setForm({ ...form, assetName: e.target.value })} className="w-full rounded-lg border px-3 py-3" /><div className="grid grid-cols-2 gap-3"><input required type="number" min="0.001" step="0.001" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="rounded-lg border px-3 py-3" /><select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="rounded-lg border px-3 py-3"><option value="grams">Grams</option><option value="pounds">Pounds</option></select></div><label className="block rounded-lg border border-dashed p-3 text-sm font-medium">Gold bill (required)<input required type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-2 w-full text-sm font-normal" /></label></div>}{type !== "Gold" && <label className="block text-sm font-medium">Supporting document (optional)<input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-1 w-full rounded-lg border px-3 py-3 font-normal" /></label>}{message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}<button disabled={saving} className="w-full rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white disabled:opacity-60">{saving ? <SavingState label="Saving investment..." /> : "Save investment"}</button></form>
    </div>
  </main>;
}
