"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import type { StatsPayload } from "@/lib/types";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ticks = { color: "#94a3b8" };
const grid = { color: "rgba(148,163,184,0.12)" };

export function AnalyticsCharts({ stats }: { stats: StatsPayload }) {
  const doughnut = {
    labels: stats.byType.map((d) => d.label),
    datasets: [
      {
        data: stats.byType.map((d) => d.value),
        backgroundColor: ["#2dd4bf", "#f59e0b", "#818cf8", "#f87171"],
        borderWidth: 0,
      },
    ],
  };
  const occ = {
    labels: stats.occupancy.map((d) => d.label),
    datasets: [
      {
        data: stats.occupancy.map((d) => d.value),
        backgroundColor: ["#34d399", "#f87171", "#60a5fa"],
        borderWidth: 0,
      },
    ],
  };
  const floors = {
    labels: stats.byFloors.map((d) => d.label),
    datasets: [
      {
        label: "Buildings",
        data: stats.byFloors.map((d) => d.value),
        backgroundColor: "#818cf8",
        borderRadius: 8,
      },
    ],
  };
  const land = {
    labels: stats.byLandUse.map((d) => d.label),
    datasets: [
      {
        label: "Parcels",
        data: stats.byLandUse.map((d) => d.value),
        backgroundColor: "#2dd4bf",
        borderRadius: 8,
      },
    ],
  };
  const units = {
    labels: stats.unitsPerBuilding.map((d) => d.label),
    datasets: [
      {
        label: "Units",
        data: stats.unitsPerBuilding.map((d) => d.value),
        backgroundColor: "#f5b942",
        borderRadius: 8,
      },
    ],
  };

  const opts = {
    plugins: { legend: { labels: { color: "#e2e8f0" } } },
    scales: { x: { ticks, grid }, y: { ticks, grid } },
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="glass rounded-2xl p-5">
        <h3 className="mb-4 text-sm uppercase tracking-[0.18em] text-teal-300">Units by type</h3>
        <div className="mx-auto h-64 max-w-xs">
          <Doughnut data={doughnut} />
        </div>
      </div>
      <div className="glass rounded-2xl p-5">
        <h3 className="mb-4 text-sm uppercase tracking-[0.18em] text-teal-300">Occupancy</h3>
        <div className="mx-auto h-64 max-w-xs">
          <Doughnut data={occ} />
        </div>
      </div>
      <div className="glass rounded-2xl p-5">
        <h3 className="mb-4 text-sm uppercase tracking-[0.18em] text-teal-300">
          Buildings by number of floors
        </h3>
        <Bar data={floors} options={opts} />
      </div>
      <div className="glass rounded-2xl p-5">
        <h3 className="mb-4 text-sm uppercase tracking-[0.18em] text-teal-300">Parcels by land use</h3>
        <Bar data={land} options={opts} />
      </div>
      <div className="glass rounded-2xl p-5 lg:col-span-2">
        <h3 className="mb-4 text-sm uppercase tracking-[0.18em] text-teal-300">Units per building</h3>
        <Bar data={units} options={opts} />
      </div>
    </div>
  );
}
