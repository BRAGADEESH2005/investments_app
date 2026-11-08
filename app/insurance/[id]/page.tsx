"use client";

import { useEffect, useState } from "react";
import SiteNav from "@/components/SiteNav";
import { useParams } from "next/navigation";

type Policy = { id: string; policyName: string; policyNumber: string; policyholderName: string; lifeAssuredName: string; nomineeName?: string; sumAssured: number; premiumAmount: number; paymentFrequency: string; premiumPayingTerm: number; nextPremiumDueDate: string; maturityDate: string; expectedMaturityAmount?: number; paidPremiums?: number; totalPremiumsPaid?: number; documentUrl?: string; notes?: string };
type Payment = { id: string; amount: number; paidOn: string; dueDate: string; status: string; receiptUrl?: string };
const money = (value: number) => value.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function PolicyDashboard() {
  const { id } = useParams<{ id: string }>();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [amount, setAmount] = useState("");
  const [paidOn, setPaidOn] = useState(new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState("");
  async function load() {
    const response = await fetch("/api/lic-policies");
    if (response.status === 401) { window.location.href = "/login"; return; }
    const data = await response.json(); const found = (data.items || []).find((item: Policy & { _id?: string; planName?: string; premiumFrequency?: string; nextPremiumDate?: string }) => String(item._id || item.id) === id);
    if (found) {
      const paymentsResponse = await fetch(`/api/premium-payments?policyId=${id}`);
      const paymentsData = await paymentsResponse.json();
      setPolicy({ ...found, id, policyName: found.policyName || found.planName || "", paymentFrequency: found.paymentFrequency || found.premiumFrequency || "yearly", nextPremiumDueDate: found.nextPremiumDueDate || found.nextPremiumDate || "" });
      setPayments((paymentsData.payments || []).map((payment: Payment & { _id?: string; paidAt?: string }) => ({ ...payment, id: payment.id || payment._id || "", paidOn: payment.paidOn || payment.paidAt || "", dueDate: payment.dueDate || payment.paidOn || "" })));
    }
  }
  useEffect(() => { if (id) void load(); }, [id]);
  async function recordPayment(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/premium-payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ policyId: id, amount: Number(amount), paidAt: paidOn }) });
    const data = await response.json();
    setMessage(response.ok ? "Premium payment recorded." : (data.error || "Could not record payment."));
    if (response.ok) { setAmount(""); await load(); }
  }
  if (!policy) return <main className="min-h-screen bg-[#f4f7f6]"><SiteNav /><p className="mx-auto max-w-7xl p-8 text-slate-500">Loading policy...</p></main>;
  const progress = Math.min(100, ((policy.paidPremiums || 0) / Math.max(policy.premiumPayingTerm, 1)) * 100);
  return <main className="min-h-screen bg-[#f4f7f6] text-slate-900"><SiteNav /><div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6"><a href="/insurance" className="text-sm font-semibold text-emerald-700">← All LIC policies</a><header><p className="text-xs font-bold tracking-[.22em] text-emerald-700">POLICY DASHBOARD</p><h1 className="mt-2 text-4xl font-bold">{policy.policyName}</h1><p className="mt-2 text-slate-500">Policy {policy.policyNumber} · Life assured: {policy.lifeAssuredName}</p></header>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{[["Coverage", money(policy.sumAssured)], ["Premiums paid", money(policy.totalPremiumsPaid || 0)], ["Premium count", `${policy.paidPremiums || 0} / ${policy.premiumPayingTerm}`], ["Next payment", policy.nextPremiumDueDate], ["Maturity", policy.maturityDate]].map(([label, value]) => <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 font-bold">{value}</p></div>)}</div>
    {policy.documentUrl && <a href={policy.documentUrl} target="_blank" rel="noreferrer" className="inline-block rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm">View policy document ↗</a>}
    {policy.notes && <p className="rounded-xl border bg-white p-4 text-sm text-slate-600 shadow-sm"><span className="font-semibold text-slate-900">Notes:</span> {policy.notes}</p>}
    <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]"><form onSubmit={recordPayment} className="h-fit space-y-3 rounded-2xl border bg-white p-5 shadow-sm"><h2 className="font-bold">Record premium payment</h2><input required type="number" min="0.01" step="0.01" placeholder={`Amount (usually ${money(policy.premiumAmount)})`} value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-lg border px-3 py-3" /><label className="block text-sm font-medium">Paid on<input required type="date" value={paidOn} onChange={(e) => setPaidOn(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-3 font-normal" /></label>{message && <p className="text-sm text-emerald-700">{message}</p>}<button className="w-full rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white">Mark premium paid</button></form>
      <section className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-bold tracking-widest text-emerald-700">PREMIUM JOURNEY</p><h2 className="mt-1 text-xl font-bold">Payment history</h2></div><span className="text-sm text-slate-500">{progress.toFixed(0)}% complete</span></div><div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} /></div><div className="mt-5 divide-y">{payments.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No payments recorded yet.</p> : payments.map((payment) => <div key={payment.id} className="flex items-center justify-between gap-3 py-3"><div><p className="font-semibold">{money(payment.amount)}</p><p className="text-xs text-slate-500">Paid {payment.paidOn} · Due {payment.dueDate}</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{payment.status}</span></div>)}</div></section></div>
    <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Insurance coverage ({money(policy.sumAssured)}) and estimated maturity benefits ({money(policy.expectedMaturityAmount || 0)}) are shown separately. They are not included as current investment value.</p>
  </div></main>;
}
