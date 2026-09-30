import { redirect } from "next/navigation";
import { AdminClient } from "@/components/AdminClient";
import { getAdminSession } from "@/lib/auth";
import { listAllAdmin } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");
  const data = await listAllAdmin();
  return (
    <main>
      <AdminClient
        username={user}
        parcels={data.parcels}
        buildings={data.buildings}
        floors={data.floors}
        units={data.units}
        ulpins={data.ulpins}
      />
    </main>
  );
}
