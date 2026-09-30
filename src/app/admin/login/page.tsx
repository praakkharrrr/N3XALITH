"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: fd.get("username"),
        password: fd.get("password"),
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Login failed");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4">
      <form onSubmit={(e) => void onSubmit(e)} className="glass space-y-4 rounded-3xl p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-teal-300">Restricted</p>
        <h1 className="text-3xl font-semibold">Admin sign in</h1>
        <p className="text-sm text-slate-400">
          Demo credentials: <span className="mono text-teal-200">admin</span> /{" "}
          <span className="mono text-teal-200">nexus3d</span>
        </p>
        <label className="grid gap-1 text-sm">
          Username
          <input name="username" required className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2"
          />
        </label>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button
          disabled={busy}
          className="w-full rounded-xl bg-teal-400 py-2 font-semibold text-slate-950"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
        </form>
    </main>
  );
}
