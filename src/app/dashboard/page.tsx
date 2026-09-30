import { MappingWorkspace } from "@/components/MappingWorkspace";
import { StatsCards } from "@/components/StatsCards";
import { getParcelsForMap, getSceneBuildings, getStats } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [parcels, buildings, stats] = await Promise.all([
    getParcelsForMap(),
    getSceneBuildings(),
    getStats(),
  ]);
  return (
    <main className="pb-10">
      <div className="mx-auto max-w-[1600px] px-4 pt-5">
        <StatsCards stats={stats} />
      </div>
      <MappingWorkspace mode="dashboard" parcels={parcels} buildings={buildings} />
    </main>
  );
}
