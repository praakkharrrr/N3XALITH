import Link from "next/link";
import { getStats } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const stats = await getStats();

  return (
    <main>
      <section className="relative min-h-[88vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1800&q=85"
          alt="Digital twin city visualization"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#06101c]/30 via-[#06101c]/70 to-[#06101c]" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-6 pb-16 pt-24">
          <p className="text-xs uppercase tracking-[0.35em] text-teal-300">
            Lucknow · 3D Property Mapping
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.05] sm:text-6xl">
            NEXUS-3D
            <span className="mt-3 block text-teal-200">
              3D ULPIN Generation & Vertical Property Mapping
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            Convert a conventional 2D land parcel into an interactive 3D building — then walk
            floors and units that share one ULPIN identity.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-full bg-teal-400 px-6 py-3 text-sm font-semibold text-slate-950"
            >
              Open dashboard
            </Link>
            <Link
              href="/city3d"
              className="rounded-full border border-teal-200/30 px-6 py-3 text-sm text-teal-100"
            >
              Enter 3D city
            </Link>
            <Link href="/map" className="rounded-full border border-white/15 px-6 py-3 text-sm">
              2D parcel map
            </Link>
          </div>
          <div className="mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [stats.totalParcels, "Parcels"],
              [stats.totalBuildings, "Buildings"],
              [stats.totalFloors, "Floors"],
              [stats.totalUnits, "Units"],
            ].map(([n, l]) => (
              <div key={String(l)} className="glass rounded-2xl px-4 py-3">
                <div className="text-2xl font-semibold">{n}</div>
                <div className="text-xs uppercase tracking-widest text-slate-400">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-10 px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-3">
          <Feature
            img="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1200&q=85"
            title="2D city / parcel map"
            text="Leaflet + OpenStreetMap with sample GeoJSON parcels for a Gomti Nagar demo cluster. Click a plot to retrieve its record."
          />
          <Feature
            img="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85"
            title="2D → 3D connection"
            text="The same parcel ID, building ID and ULPIN drive both the map polygon and the Three.js building."
          />
          <Feature
            img="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85"
            title="Vertical property mapping"
            text="Land parcel → building → floor → flat/shop. Floor explorer highlights the selected storey and unit in 3D."
          />
        </div>

        <div className="glass grid gap-8 rounded-3xl p-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold">Demo workflow</h2>
            <ol className="mt-5 space-y-3 text-slate-300">
              {[
                "Open Dashboard and inspect the 2D parcel map",
                "Select a parcel — property information loads",
                "Click View in 3D — the matching building opens",
                "Rotate / zoom the procedural model",
                "Switch to Floor View, then Unit View",
                "Read the ULPIN shared across 2D and 3D",
                "Return to the map — same record, same identifier",
              ].map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="mono text-teal-300">{String(i + 1).padStart(2, "0")}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <img
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1400&q=85"
            alt="GIS control room"
            className="h-full max-h-[420px] w-full rounded-2xl object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/explorer" className="glass rounded-2xl p-6 hover:border-teal-300/40">
            <div className="text-xs uppercase tracking-[0.2em] text-teal-300">Explorer</div>
            <h3 className="mt-2 text-xl font-semibold">Floor explorer</h3>
            <p className="mt-2 text-sm text-slate-400">
              Building A → Floor 5 → Flat 502, with live 3D highlighting.
            </p>
          </Link>
          <Link href="/search" className="glass rounded-2xl p-6 hover:border-teal-300/40">
            <div className="text-xs uppercase tracking-[0.2em] text-teal-300">Lookup</div>
            <h3 className="mt-2 text-xl font-semibold">Property search</h3>
            <p className="mt-2 text-sm text-slate-400">
              Query by ULPIN, building name, flat number or locality.
            </p>
          </Link>
          <Link href="/analytics" className="glass rounded-2xl p-6 hover:border-teal-300/40">
            <div className="text-xs uppercase tracking-[0.2em] text-teal-300">Charts</div>
            <h3 className="mt-2 text-xl font-semibold">Analytics</h3>
            <p className="mt-2 text-sm text-slate-400">
              Live Chart.js summaries from Firebase Firestore records.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}

function Feature({ img, title, text }: { img: string; title: string; text: string }) {
  return (
    <article className="glass overflow-hidden rounded-3xl">
      <div className="h-44 w-full overflow-hidden bg-slate-900">
        <img src={img} alt={title} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover"
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
      </div>
    </article>
  );
}
