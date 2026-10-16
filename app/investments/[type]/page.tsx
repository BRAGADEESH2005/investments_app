"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SiteNav from "@/components/SiteNav";
type Item = { id: string; type: string; name: string; principal: number; investedAt: string; endDate?: string; interestRate?: number; quantity?: number; unit?: string; documentUrl?: string };
const money = (value: number) => value.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export default function CategoryPage() {
  const params = useParams<{ type: string }>(); const type = `${params.type || ""}`.toUpperCase() === "FD" ? "FD" : `${params.type || ""}`.toUpperCase() === "RD" ? "RD" : `${params.type || ""}`.toLowerCase() === "gold" ? "Gold" : "House";
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => { fetch(`/api/investments?type=${type}&pageSize=100`).then((r) => r.json()).then((data) => setItems(data.investments || [])).catch(() => undefined); }, [type]);
  const total = items.reduce((sum, item) => sum + item.principal, 0);
  return <main className="min-h-screen bg-[#f6f8fb] text-slate-900"><SiteNav /><div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6"><div><p className="text-xs font-bold tracking-widest text-emerald-700">{type} PORTFOLIO</p><h1 className="mt-1 text-3xl font-bold">{type} investments</h1><p className="mt-2 text-slate-500">{items.length} records · {money(total)} principal tracked</p></div><div className="grid gap-4 sm:grid-cols-3">{items.map((item) => <article key={item.id} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><h2 className="font-bold">{item.name}</h2>{item.documentUrl && <a href={`/api/investments/${item.id}/document`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-emerald-700">View doc</a>}</div><p className="mt-3 text-2xl font-bold">{money(item.principal)}</p><p className="mt-2 text-sm text-slate-500">Invested {item.investedAt}</p>{item.endDate && <p className="text-sm text-slate-500">Matures {item.endDate}</p>}{item.interestRate && <p className="text-sm text-emerald-700">{item.interestRate}% p.a.</p>}{item.quantity && <p className="text-sm text-amber-700">{item.quantity} {item.unit}</p>}<a href="/investments" className="mt-4 inline-block rounded border px-3 py-2 text-xs font-semibold">Edit in portfolio</a></article>)}</div>{items.length === 0 && <div className="rounded-2xl border bg-white p-10 text-center text-slate-500">No {type} investments yet. Add one from the overview page.</div>}</div></main>;
}
