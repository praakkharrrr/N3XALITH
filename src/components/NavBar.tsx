"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/map", label: "2D Map" },
  { href: "/city3d", label: "3D City" },
  { href: "/explorer", label: "Floor Explorer" },
  { href: "/search", label: "Search" },
  { href: "/analytics", label: "Analytics" },
  { href: "/admin", label: "Admin" },
];

export function NavBar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-teal-400/15 bg-[#06101c]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="NEXUS-3D" className="h-9 w-9" />
          <div>
            <div className="text-sm font-semibold tracking-[0.18em] text-teal-200">NEXUS-3D</div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">
              ULPIN · Vertical Mapping
            </div>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => {
            const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  active
                    ? "bg-teal-400/15 text-teal-200"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <button
          className="rounded-md border border-teal-400/20 px-3 py-1 text-sm lg:hidden"
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          Menu
        </button>
      </div>
      {open ? (
        <div className="grid gap-1 border-t border-teal-400/10 px-4 py-3 lg:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
            >
              {l.label}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}
