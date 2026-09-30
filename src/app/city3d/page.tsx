import { MappingWorkspace } from "@/components/MappingWorkspace";
import { getParcelsForMap, getSceneBuildings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function CityPage({
  searchParams,
}: {
  searchParams: Promise<{ building?: string; floor?: string; unit?: string; parcel?: string }>;
}) {
  const sp = await searchParams;
  const [parcels, buildings] = await Promise.all([getParcelsForMap(), getSceneBuildings()]);
  return (
    <MappingWorkspace
      mode="city"
      parcels={parcels}
      buildings={buildings}
      initialParcelId={sp.parcel ? Number(sp.parcel) : undefined}
      initialBuildingId={sp.building ? Number(sp.building) : undefined}
      initialFloorId={sp.floor ? Number(sp.floor) : undefined}
      initialUnitId={sp.unit ? Number(sp.unit) : undefined}
    />
  );
}
