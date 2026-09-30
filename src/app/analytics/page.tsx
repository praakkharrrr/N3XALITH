import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { StatsCards } from "@/components/StatsCards";
import { getStats } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const stats = await getStats();
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <p className="text-xs uppercase tracking-[0.22em] text-teal-300">Live Firestore records</p>
      <h1 className="text-4xl font-semibold">Analytics</h1>
      <p className="max-w-2xl text-slate-400">
        Charts are generated from the live Firestore dataset (parcels, buildings, floors and
        units) — not from hypothetical numbers.
      </p>
      <StatsCards stats={stats} />
      <AnalyticsCharts stats={stats} />
    </main>
  );
}
