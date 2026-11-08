"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import { LoadingState } from "@/components/LoadingState";
import { getGoldPrice } from "@/lib/gold";
import { formatDate } from "@/lib/date";
import { getChangePercent, getCurrentValue, getValueLabel } from "@/lib/valuation";

type Item = { id: string; type: "House" | "FD" | "RD" | "Gold"; name: string; principal: number; investedAt: string; endDate?: string; maturityAmount?: number; interestRate?: number; compounding?: "monthly" | "quarterly" | "half-yearly" | "yearly"; quantity?: number; unit?: string; documentUrl?: string; notes?: string };
type GoldPrices = { 18: number; 22: number; 24: number };
type SortOrder = "maturity-asc" | "maturity-desc" | "principal-desc" | "name";
const money = (value: number) => value.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function daysUntil(date?: string) {
  if (!date) return null;
  return Math.ceil((new Date(`${date.slice(0, 10)}T00:00:00`).getTime() - new Date(new Date().toISOString().slice(0, 10)).getTime()) / 86400000);
}

export default function CategoryPage() {
  const params = useParams<{ type: string }>();
  const type = `${params.type || ""}`.toUpperCase() === "FD" ? "FD" : `${params.type || ""}`.toUpperCase() === "RD" ? "RD" : `${params.type || ""}`.toLowerCase() === "gold" ? "Gold" : "House";
  const [items, setItems] = useState<Item[]>([]);
  const [goldPrices, setGoldPrices] = useState<GoldPrices>({ 18: 0, 22: 0, 24: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [rateFilter, setRateFilter] = useState("all");
  const [sort, setSort] = useState<SortOrder>("maturity-asc");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/investments?type=${type}&pageSize=100`).then((r) => r.json()).then((data) => setItems(data.investments || [])).catch(() => undefined).finally(() => setLoading(false));
    if (type === "Gold") fetch("/api/prices/gold").then((r) => r.json()).then((data) => setGoldPrices(data.prices?.perGram || { 18: 0, 22: 0, 24: 0 })).catch(() => undefined);
  }, [type]);

  const filteredItems = useMemo(() => items.filter((item) => {
    const query = search.trim().toLowerCase();
    const days = daysUntil(item.endDate);
    const matchesSearch = !query || item.name.toLowerCase().includes(query) || item.notes?.toLowerCase().includes(query);
    const matchesStatus = status === "all" || (status === "upcoming" && days !== null && days >= 0) || (status === "matured" && days !== null && days < 0) || (status === "no-date" && days === null);
    const matchesRate = rateFilter === "all" || (rateFilter === "with-rate" && !!item.interestRate) || (rateFilter === "without-rate" && !item.interestRate);
    return matchesSearch && matchesStatus && matchesRate;
  }).sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "principal-desc") return b.principal - a.principal;
    const aDate = a.endDate ? new Date(a.endDate).getTime() : Number.MAX_SAFE_INTEGER;
    const bDate = b.endDate ? new Date(b.endDate).getTime() : Number.MAX_SAFE_INTEGER;
    return sort === "maturity-asc" ? aDate - bDate : bDate - aDate;
  }), [items, search, status, rateFilter, sort]);
  const total = items.reduce((sum, item) => sum + item.principal, 0);
  const currentTotal = items.reduce((sum, item) => sum + getCurrentValue(item, goldPrices), 0);
  const changePercent = getChangePercent(total, currentTotal);

  if (loading) return <main className="min-h-screen bg-[#f6f8fb]"><SiteNav /><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><LoadingState label={`Loading ${type} investments...`} /></div></main>;
  return <main className="min-h-screen bg-[#f6f8fb] text-slate-900"><SiteNav /><div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
    <div><p className="text-xs font-bold tracking-widest text-emerald-700">{type} PORTFOLIO</p><h1 className="mt-1 text-3xl font-bold">{type} investments</h1><p className="mt-2 text-slate-500">{items.length} records · {money(total)} principal tracked · {money(currentTotal)} current value <span className={`font-semibold ${changePercent >= 0 ? "text-emerald-700" : "text-rose-700"}`}>({changePercent >= 0 ? "↑" : "↓"} {Math.abs(changePercent).toFixed(2)}%)</span></p></div>
    {type === "Gold" && <section className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold tracking-widest text-amber-700">LIVE GOLD RATES</p><h2 className="mt-1 text-2xl font-bold">Today’s price per gram</h2></div><div className="grid grid-cols-3 gap-2">{([18, 22, 24] as const).map((karat) => <div key={karat} className="rounded-xl bg-white px-4 py-3 text-center shadow-sm"><p className="text-xs font-bold text-amber-700">{karat}K</p><p className="mt-1 font-bold">{goldPrices[karat] ? money(goldPrices[karat]) : "—"}</p></div>)}</div></div></section>}
    <section className="rounded-2xl border bg-white p-4 shadow-sm"><div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_1fr]"><label className="text-xs font-semibold text-slate-500">Search<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or notes" className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900" /></label><label className="text-xs font-semibold text-slate-500">Maturity status<select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900"><option value="all">All records</option><option value="upcoming">Upcoming</option><option value="matured">Matured</option><option value="no-date">No maturity date</option></select></label><label className="text-xs font-semibold text-slate-500">Interest rate<select value={rateFilter} onChange={(e) => setRateFilter(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900"><option value="all">All rates</option><option value="with-rate">Rate available</option><option value="without-rate">Rate not added</option></select></label><label className="text-xs font-semibold text-slate-500">Sort by<select value={sort} onChange={(e) => setSort(e.target.value as SortOrder)} className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900"><option value="maturity-asc">Maturity: soonest first</option><option value="maturity-desc">Maturity: latest first</option><option value="principal-desc">Principal: highest first</option><option value="name">Name: A-Z</option></select></label></div><p className="mt-3 text-xs text-slate-500">Showing {filteredItems.length} of {items.length} investments</p></section>
    {loading ? <LoadingState label={`Loading ${type} investments...`} /> : filteredItems.length === 0 ? <div className="rounded-2xl border bg-white p-10 text-center text-slate-500">No investments match your filters.</div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filteredItems.map((item) => { const gold = type === "Gold" && item.quantity ? getGoldPrice(goldPrices, item.name) : null; const currentValue = getCurrentValue(item, goldPrices); const change = getChangePercent(item.principal, currentValue); const days = daysUntil(item.endDate); const matured = days !== null && days < 0; return <article key={item.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm"><div className={`border-b-4 p-5 ${matured ? "border-rose-400 bg-rose-50/60" : days !== null && days <= 30 ? "border-amber-400 bg-amber-50/60" : "border-emerald-400"}`}><div className="flex items-start justify-between gap-3"><h2 className="font-bold">{item.name}</h2>{item.documentUrl && <a href={`/api/investments/${item.id}/document`} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-semibold text-emerald-700">View doc</a>}</div>{item.endDate ? <p className={`mt-3 text-sm font-bold ${matured ? "text-rose-700" : days !== null && days <= 30 ? "text-amber-700" : "text-emerald-700"}`}>{matured ? `Matured ${Math.abs(days || 0)} days ago` : days === 0 ? "Matures today" : `Matures in ${days} days`} · {formatDate(item.endDate)}</p> : <p className="mt-3 text-sm font-semibold text-slate-500">Maturity date not added</p>}</div><div className="space-y-2 p-5"><div className="flex justify-between"><span className="text-sm text-slate-500">Principal</span><strong>{money(item.principal)}</strong></div>{(type === "FD" || type === "RD") && <div className="flex justify-between"><span className="text-sm text-slate-500">Maturity value</span><strong className="text-emerald-700">{item.maturityAmount !== undefined ? money(item.maturityAmount) : "Not added"}</strong></div>}<div className="flex justify-between"><span className="text-sm text-slate-500">Current value</span><strong>{money(currentValue)}</strong></div><p className={`text-xs font-semibold ${change >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{change >= 0 ? "↑" : "↓"} {Math.abs(change).toFixed(2)}% {change >= 0 ? "increase" : "decrease"}</p><p className="text-sm text-slate-500">Invested {formatDate(item.investedAt)}</p>{item.interestRate && <p className="text-sm text-emerald-700">{item.interestRate}% p.a. · {item.compounding || "yearly"} compounding</p>}{item.notes && (type === "FD" || type === "RD" || type === "Gold") && <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{item.notes}</p>}{item.quantity && <p className="text-sm text-amber-700">{item.quantity} {item.unit}</p>}{gold && gold.pricePerGram > 0 && <p className="rounded-lg bg-amber-50 p-2 text-sm font-semibold text-amber-800">{gold.karat}K @ {money(gold.pricePerGram)}/g</p>}<a href="/investments" className="mt-2 inline-block rounded border px-3 py-2 text-xs font-semibold">Edit in portfolio</a></div></article>; })}</div>}
  </div></main>;
}
