import { MappingWorkspace } from "@/components/MappingWorkspace";
import { getParcelsForMap, getSceneBuildings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ parcel?: string }>;
}) {
  const sp = await searchParams;
  const [parcels, buildings] = await Promise.all([getParcelsForMap(), getSceneBuildings()]);
  return (
    <MappingWorkspace
      mode="map"
      parcels={parcels}
      buildings={buildings}
      initialParcelId={sp.parcel ? Number(sp.parcel) : undefined}
    />
  );
}
