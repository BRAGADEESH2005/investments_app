"use client";

import { useEffect, useState } from "react";
import SiteNav from "@/components/SiteNav";
export default function ProfilePage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  useEffect(() => { fetch("/api/auth/me").then((r) => r.json()).then((data) => { if (data.error) window.location.href = "/login"; else setUser(data); }).catch(() => undefined); }, []);
  return <main className="min-h-screen bg-[#f6f8fb] text-slate-900"><SiteNav /><div className="mx-auto max-w-2xl px-4 py-10 sm:px-6"><div className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8"><p className="text-xs font-bold tracking-widest text-emerald-700">ACCOUNT</p><h1 className="mt-1 text-3xl font-bold">Your profile</h1>{user && <div className="mt-8 space-y-4"><label className="block text-sm font-semibold">Name<input readOnly value={user.name} className="mt-2 w-full rounded-lg border bg-slate-50 px-3 py-3 font-normal" /></label><label className="block text-sm font-semibold">Email<input readOnly value={user.email} className="mt-2 w-full rounded-lg border bg-slate-50 px-3 py-3 font-normal" /></label></div>}<p className="mt-8 text-sm text-slate-500">Your profile details are used to secure and personalize your household wealth tracker.</p></div></div></main>;
}
