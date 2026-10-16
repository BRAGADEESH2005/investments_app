"use client";

export default function SiteNav() {
  return <nav className="border-b bg-white">
    <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
      <a href="/" className="mr-auto text-xs font-bold tracking-[.2em] text-emerald-700">HOUSEHOLD WEALTH</a>
      <a href="/" className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-slate-100">Overview</a>
      <a href="/analysis" className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-slate-100">Analysis</a>
      <a href="/investments" className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-slate-100">All investments</a>
      <a href="/profile" className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-slate-100">Profile</a>
      <button onClick={() => { void fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/login"; }} className="rounded-lg border px-3 py-2 text-sm font-semibold">Log out</button>
    </div>
  </nav>;
}
