"use client";

import { useState } from "react";
import type { ParcelFeature, SceneBuilding, SceneFloor, SceneUnit } from "@/lib/types";

export function SmartPropertyAssistant({
  parcel,
  building,
  floor,
  unit,
}: {
  parcel?: ParcelFeature;
  building?: SceneBuilding;
  floor?: SceneFloor;
  unit?: SceneUnit;
}) {
  const [question, setQuestion] = useState("Summarize this property");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/property-insights", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question, parcel, building, floor, unit }),
      });
      const data = (await res.json()) as { answer?: string; error?: string };
      setAnswer(data.answer ?? data.error ?? "No insight available.");
    } catch {
      setAnswer("Unable to reach the property assistant. Check the server configuration.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glass rounded-2xl p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-teal-300">Smart property assistant</div>
          <h2 className="mt-1 text-lg font-semibold">Ask about the selected property</h2>
        </div>
        <span className="rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-[10px] uppercase tracking-wider text-teal-200">
          Gemini powered
        </span>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") void ask(); }}
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm outline-none focus:border-teal-300/40"
          placeholder="e.g. How many vacant units are here?"
        />
        <button type="button" onClick={() => void ask()} disabled={loading || !question.trim()} className="rounded-xl bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50">
          {loading ? "Thinking…" : "Ask"}
        </button>
      </div>
      {answer ? <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 p-4 text-sm leading-6 text-slate-200 whitespace-pre-wrap">{answer}</div> : null}
    </section>
  );
}
