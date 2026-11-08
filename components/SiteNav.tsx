"use client";

import { useState } from "react";

export default function SiteNav() {
  const [isOpen, setIsOpen] = useState(false);
  const links = [
    ["/", "Overview"],
    ["/net-worth", "Net worth"],
    ["/analysis", "Analysis"],
    ["/investments", "All investments"],
    ["/insurance", "LIC insurance"],
    ["/goals", "Goals"],
    ["/life-logs", "Life logs"],
    ["/profile", "Profile"],
  ];

  const logOut = () => {
    void fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return <nav className="border-b bg-white">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
      <a href="/" className="text-xs font-bold tracking-[.16em] text-emerald-700 sm:tracking-[.2em]">HOUSEHOLD WEALTH</a>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="site-navigation"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        onClick={() => setIsOpen((open) => !open)}
        className="rounded-lg border p-2 text-slate-700 hover:bg-slate-100 md:hidden"
      >
        <span className="block h-0.5 w-5 bg-current" />
        <span className="mt-1 block h-0.5 w-5 bg-current" />
        <span className="mt-1 block h-0.5 w-5 bg-current" />
      </button>
      <div id="site-navigation" className={`${isOpen ? "flex" : "hidden"} absolute left-0 right-0 top-[57px] z-10 flex-col gap-1 border-b bg-white p-4 shadow-md md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
        {links.map(([href, label]) => <a key={href} href={href} onClick={() => setIsOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-slate-100">{label}</a>)}
        <button onClick={logOut} className="rounded-lg border px-3 py-2 text-left text-sm font-semibold md:ml-1">Log out</button>
      </div>
    </div>
  </nav>;
}
