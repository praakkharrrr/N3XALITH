import { MappingWorkspace } from "@/components/MappingWorkspace";
import { getParcelsForMap, getSceneBuildings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ExplorerPage({
  searchParams,
}: {
  searchParams: Promise<{ building?: string; floor?: string; unit?: string }>;
}) {
  const sp = await searchParams;
  const [parcels, buildings] = await Promise.all([getParcelsForMap(), getSceneBuildings()]);
  return (
    <MappingWorkspace
      mode="explorer"
      parcels={parcels}
      buildings={buildings}
      initialBuildingId={sp.building ? Number(sp.building) : buildings[0]?.id}
      initialFloorId={sp.floor ? Number(sp.floor) : undefined}
      initialUnitId={sp.unit ? Number(sp.unit) : undefined}
    />
  );
}
