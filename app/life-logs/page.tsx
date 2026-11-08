"use client";

import { useEffect, useState } from "react";
import SiteNav from "@/components/SiteNav";
import { LoadingState, SavingState } from "@/components/LoadingState";

type LifeLog = { id: string; entry: string; driveLink?: string; notes?: string; createdAt?: string };

export default function LifeLogsPage() {
  const [logs, setLogs] = useState<LifeLog[]>([]);
  const [form, setForm] = useState({ entry: "", driveLink: "", notes: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<LifeLog | null>(null);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/life-logs?pageSize=100");
      if (response.status === 401) { window.location.href = "/login"; return; }
      const data = await response.json();
      setLogs((data.items || []).map((item: LifeLog & { _id?: string }) => ({ ...item, id: item.id || item._id || "" })));
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const response = await fetch(editing ? `/api/life-logs/${editing.id}` : "/api/life-logs", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entry: form.entry.trim(), driveLink: form.driveLink.trim(), notes: form.notes.trim() }),
    });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error || "Could not save life log."); return; }
    setForm({ entry: "", driveLink: "", notes: "" });
    setEditing(null);
    setMessage(editing ? "Life log updated." : "Life log saved.");
    await load();
    setSaving(false);
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this life log?")) return;
    const response = await fetch(`/api/life-logs/${id}`, { method: "DELETE" });
    if (response.ok) setLogs((current) => current.filter((log) => log.id !== id));
  }

  function edit(log: LifeLog) {
    setEditing(log);
    setForm({ entry: log.entry, driveLink: log.driveLink || "", notes: log.notes || "" });
    setMessage("");
  }

  return <main className="min-h-screen bg-[#f4f7f6] text-slate-900"><SiteNav /><div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
    <header><p className="text-xs font-bold tracking-[.22em] text-emerald-700">LIFE LOGS</p><h1 className="mt-2 text-4xl font-bold tracking-tight">Keep the moments that matter.</h1><p className="mt-2 text-slate-500">Write down a memory, milestone, or moment and keep related documents nearby.</p></header>
    <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
      <form onSubmit={save} className="h-fit space-y-3 rounded-2xl border bg-white p-5 shadow-sm"><h2 className="font-bold">{editing ? "Edit life log" : "Add a life log"}</h2>
        <textarea required maxLength={10000} placeholder="Write about your day, memory, or milestone..." value={form.entry} onChange={(e) => setForm({ ...form, entry: e.target.value })} className="min-h-44 w-full rounded-lg border px-3 py-3" />
        <input type="url" maxLength={2048} placeholder="Drive link (optional)" value={form.driveLink} onChange={(e) => setForm({ ...form, driveLink: e.target.value })} className="w-full rounded-lg border px-3 py-3" />
        <textarea maxLength={1000} placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="min-h-24 w-full rounded-lg border px-3 py-3" />
        {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}<button disabled={saving} className="w-full rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white disabled:opacity-60">{saving ? <SavingState label={editing ? "Updating life log..." : "Saving life log..."} /> : editing ? "Update life log" : "Save life log"}</button>{editing && <button type="button" disabled={saving} onClick={() => { setEditing(null); setForm({ entry: "", driveLink: "", notes: "" }); setMessage(""); }} className="w-full rounded-lg border px-4 py-3 font-semibold text-slate-700 disabled:opacity-60">Cancel edit</button>}
      </form>
      {loading ? <LoadingState label="Loading your life logs..." /> : <section className="space-y-4">{logs.length === 0 ? <div className="rounded-2xl border bg-white p-10 text-center text-slate-500">No life logs yet. Add your first memory or milestone.</div> : logs.map((log) => <article key={log.id} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><p className="whitespace-pre-wrap text-slate-800">{log.entry}</p><div className="flex shrink-0 gap-3"><button onClick={() => edit(log)} className="text-xs font-semibold text-emerald-700">Edit</button><button onClick={() => void remove(log.id)} className="text-xs font-semibold text-rose-700">Delete</button></div></div><p className="mt-4 text-xs text-slate-500">{log.createdAt ? new Date(log.createdAt).toLocaleString("en-IN") : ""}</p>{log.notes && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600"><span className="font-semibold text-slate-900">Notes:</span> {log.notes}</p>}{log.driveLink && <a href={log.driveLink} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-semibold text-emerald-700">Open Drive link ↗</a>}</article>)}</section>}
    </div>
  </div></main>;
}
