"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Building, Floor, Parcel, UlpinRecord } from "@/lib/schema-types";

type UnitRow = {
  unit: {
    id: number;
    unitCode: string;
    unitNumber: string;
    propertyType: string;
    occupancy: string;
    status: string;
    areaSqft: number;
    buildingId: number;
    parcelId: number;
    floorId: number;
  };
  owner: string | null;
  ulpin: string | null;
};

type Tab = "overview" | "parcels" | "buildings" | "units" | "ulpin";

export function AdminClient({
  parcels,
  buildings,
  floors,
  units,
  ulpins,
  username,
}: {
  parcels: Parcel[];
  buildings: Building[];
  floors: Floor[];
  units: UnitRow[];
  ulpins: UlpinRecord[];
  username: string;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const filteredUnits = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return units;
    return units.filter(
      (u) =>
        u.unit.unitNumber.toLowerCase().includes(t) ||
        u.unit.unitCode.toLowerCase().includes(t) ||
        (u.ulpin ?? "").toLowerCase().includes(t) ||
        (u.owner ?? "").toLowerCase().includes(t),
    );
  }, [q, units]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 px-4 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-teal-300">Admin console</div>
          <h1 className="text-3xl font-semibold">Property records</h1>
          <p className="text-sm text-slate-400">Signed in as {username}</p>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded-full border border-white/15 px-4 py-2 text-sm"
        >
          Sign out
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["overview", "Overview"],
            ["parcels", "Parcels"],
            ["buildings", "Buildings"],
            ["units", "Units"],
            ["ulpin", "ULPIN"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-sm ${
              tab === id ? "bg-teal-400 text-slate-950" : "border border-white/10"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {msg ? (
        <div className="rounded-xl border border-teal-400/20 bg-teal-400/10 px-4 py-2 text-sm text-teal-100">
          {msg}
        </div>
      ) : null}

      {tab === "overview" ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Parcels", parcels.length],
            ["Buildings", buildings.length],
            ["Floors", floors.length],
            ["Units", units.length],
          ].map(([l, v]) => (
            <div key={String(l)} className="glass rounded-2xl p-5">
              <div className="text-xs uppercase tracking-widest text-teal-300">{l}</div>
              <div className="mt-2 text-4xl font-semibold">{v}</div>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "parcels" ? (
        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <ParcelForm
            onDone={(text) => {
              setMsg(text);
              router.refresh();
            }}
          />
          <div className="glass nexus-scroll max-h-[70vh] overflow-auto rounded-2xl p-4">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-2">Code</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Use</th>
                  <th className="p-2">Area</th>
                </tr>
              </thead>
              <tbody>
                {parcels.map((p) => (
                  <tr key={p.id} className="border-t border-white/5">
                    <td className="p-2 mono">{p.parcelCode}</td>
                    <td className="p-2">{p.name}</td>
                    <td className="p-2">{p.landUse}</td>
                    <td className="p-2">{p.areaSqm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {tab === "buildings" ? (
        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <BuildingForm
            parcels={parcels}
            onDone={(text) => {
              setMsg(text);
              router.refresh();
            }}
          />
          <div className="glass nexus-scroll max-h-[70vh] overflow-auto rounded-2xl p-4">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-2">Code</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Floors</th>
                  <th className="p-2">Height</th>
                </tr>
              </thead>
              <tbody>
                {buildings.map((b) => (
                  <tr key={b.id} className="border-t border-white/5">
                    <td className="p-2 mono">{b.buildingCode}</td>
                    <td className="p-2">{b.name}</td>
                    <td className="p-2">{b.propertyType}</td>
                    <td className="p-2">{b.floorsCount}</td>
                    <td className="p-2">{b.heightM} m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {tab === "units" ? (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
            <UnitForm
              parcels={parcels}
              floors={floors}
              onDone={(text) => {
                setMsg(text);
                router.refresh();
              }}
            />
            <div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Filter units, owners, ULPIN…"
                className="mb-3 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm"
              />
              <div className="glass nexus-scroll max-h-[70vh] overflow-auto rounded-2xl p-4">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="p-2">Unit</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Occupancy</th>
                      <th className="p-2">Owner</th>
                      <th className="p-2">ULPIN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUnits.map((u) => (
                      <tr key={u.unit.id} className="border-t border-white/5">
                        <td className="p-2">{u.unit.unitNumber}</td>
                        <td className="p-2">{u.unit.propertyType}</td>
                        <td className="p-2">
                          <OccupancyEditor
                            id={u.unit.id}
                            value={u.unit.occupancy}
                            number={u.unit.unitNumber}
                            type={u.unit.propertyType}
                            area={u.unit.areaSqft}
                            status={u.unit.status}
                            onDone={() => router.refresh()}
                          />
                        </td>
                        <td className="p-2">{u.owner ?? "—"}</td>
                        <td className="p-2 mono text-amber-200">{u.ulpin ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "ulpin" ? (
        <div className="glass rounded-2xl p-5">
          <p className="text-sm text-amber-100">
            ULPIN values are identifiers only — not official Government of India
            ULPINs.
          </p>
          <div className="nexus-scroll mt-4 max-h-[65vh] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-2">ULPIN</th>
                  <th className="p-2">Entity</th>
                  <th className="p-2">IDs</th>
                </tr>
              </thead>
              <tbody>
                {ulpins.map((u) => (
                  <tr key={u.id} className="border-t border-white/5">
                    <td className="p-2 mono text-amber-200">{u.ulpin}</td>
                    <td className="p-2">{u.entityType}</td>
                    <td className="p-2 text-slate-400">
                      P{u.parcelId ?? "-"} / B{u.buildingId ?? "-"} / F{u.floorId ?? "-"} / U
                      {u.unitId ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1 text-xs text-slate-300">
      {label}
      {children}
    </label>
  );
}

const inputCls =
  "rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white";

function ParcelForm({ onDone }: { onDone: (s: string) => void }) {
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const res = await fetch("/api/parcels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parcelCode: fd.get("parcelCode"),
        name: fd.get("name"),
        address: fd.get("address"),
        areaSqm: Number(fd.get("areaSqm")),
        latitude: Number(fd.get("latitude")),
        longitude: Number(fd.get("longitude")),
        landUse: fd.get("landUse"),
        posX: Number(fd.get("posX")),
        posZ: Number(fd.get("posZ")),
      }),
    });
    setBusy(false);
    const data = await res.json();
    if (!res.ok) return onDone(data.error ?? "Failed");
    onDone(`Parcel saved. ULPIN ${data.ulpin}`);
    e.currentTarget.reset();
  }
  return (
    <form onSubmit={(e) => void submit(e)} className="glass grid gap-3 rounded-2xl p-4">
      <h3 className="font-semibold">Add parcel</h3>
      <Field label="Parcel code">
        <input name="parcelCode" required className={inputCls} placeholder="P-017" />
      </Field>
      <Field label="Name">
        <input name="name" required className={inputCls} />
      </Field>
      <Field label="Address">
        <input name="address" className={inputCls} defaultValue="Gomti Nagar, Lucknow" />
      </Field>
      <Field label="Area sq.m">
        <input name="areaSqm" type="number" defaultValue={900} className={inputCls} />
      </Field>
      <Field label="Latitude">
        <input name="latitude" defaultValue="26.8674" className={inputCls} />
      </Field>
      <Field label="Longitude">
        <input name="longitude" defaultValue="81.0160" className={inputCls} />
      </Field>
      <Field label="Land use">
        <select name="landUse" className={inputCls}>
          <option>residential</option>
          <option>commercial</option>
          <option>mixed</option>
          <option>vacant</option>
          <option>open-space</option>
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="3D pos X">
          <input name="posX" defaultValue="0" className={inputCls} />
        </Field>
        <Field label="3D pos Z">
          <input name="posZ" defaultValue="0" className={inputCls} />
        </Field>
      </div>
      <button disabled={busy} className="rounded-xl bg-teal-400 py-2 text-sm font-semibold text-slate-950">
        Save parcel
      </button>
    </form>
  );
}

function BuildingForm({
  parcels,
  onDone,
}: {
  parcels: Parcel[];
  onDone: (s: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const res = await fetch("/api/buildings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buildingCode: fd.get("buildingCode"),
        name: fd.get("name"),
        parcelId: Number(fd.get("parcelId")),
        propertyType: fd.get("propertyType"),
        floorsCount: Number(fd.get("floorsCount")),
        heightM: Number(fd.get("heightM")),
        builtAreaSqm: Number(fd.get("builtAreaSqm")),
        yearBuilt: Number(fd.get("yearBuilt")),
        color: fd.get("color"),
      }),
    });
    setBusy(false);
    const data = await res.json();
    if (!res.ok) return onDone(data.error ?? "Failed");
    onDone(`Building saved with floors. ULPIN ${data.ulpin}`);
    e.currentTarget.reset();
  }
  return (
    <form onSubmit={(e) => void submit(e)} className="glass grid gap-3 rounded-2xl p-4">
      <h3 className="font-semibold">Add building</h3>
      <Field label="Building code">
        <input name="buildingCode" required className={inputCls} placeholder="B-011" />
      </Field>
      <Field label="Name">
        <input name="name" required className={inputCls} />
      </Field>
      <Field label="Parcel">
        <select name="parcelId" className={inputCls}>
          {parcels.map((p) => (
            <option key={p.id} value={p.id}>
              {p.parcelCode} · {p.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Type">
        <select name="propertyType" className={inputCls}>
          <option>residential</option>
          <option>commercial</option>
          <option>mixed</option>
        </select>
      </Field>
      <Field label="Floors">
        <input name="floorsCount" type="number" defaultValue={4} className={inputCls} />
      </Field>
      <Field label="Height (m)">
        <input name="heightM" type="number" defaultValue={14} className={inputCls} />
      </Field>
      <Field label="Built area">
        <input name="builtAreaSqm" type="number" defaultValue={1200} className={inputCls} />
      </Field>
      <Field label="Year">
        <input name="yearBuilt" type="number" defaultValue={2024} className={inputCls} />
      </Field>
      <Field label="Color">
        <input name="color" defaultValue="#14b8a6" className={inputCls} />
      </Field>
      <button disabled={busy} className="rounded-xl bg-teal-400 py-2 text-sm font-semibold text-slate-950">
        Save building
      </button>
    </form>
  );
}

function UnitForm({
  parcels,
  floors,
  onDone,
}: {
  parcels: Parcel[];
  floors: Floor[];
  onDone: (s: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const res = await fetch("/api/units", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        unitCode: fd.get("unitCode"),
        unitNumber: fd.get("unitNumber"),
        floorId: Number(fd.get("floorId")),
        parcelId: Number(fd.get("parcelId")),
        propertyType: fd.get("propertyType"),
        areaSqft: Number(fd.get("areaSqft")),
        occupancy: fd.get("occupancy"),
        facing: fd.get("facing"),
        ownerName: fd.get("ownerName"),
        ownerEmail: fd.get("ownerEmail"),
        ownerPhone: fd.get("ownerPhone"),
      }),
    });
    setBusy(false);
    const data = await res.json();
    if (!res.ok) return onDone(data.error ?? "Failed");
    onDone(`Unit saved. ULPIN ${data.ulpin}`);
    e.currentTarget.reset();
  }
  return (
    <form onSubmit={(e) => void submit(e)} className="glass grid gap-3 rounded-2xl p-4">
      <h3 className="font-semibold">Add unit</h3>
      <Field label="Unit code">
        <input name="unitCode" required className={inputCls} placeholder="B-001-U99" />
      </Field>
      <Field label="Unit number">
        <input name="unitNumber" required className={inputCls} placeholder="Flat 503" />
      </Field>
      <Field label="Floor">
        <select name="floorId" className={inputCls}>
          {floors.map((f) => (
            <option key={f.id} value={f.id}>
              Floor #{f.id} · {f.label} (B{f.buildingId})
            </option>
          ))}
        </select>
      </Field>
      <Field label="Parcel">
        <select name="parcelId" className={inputCls}>
          {parcels.map((p) => (
            <option key={p.id} value={p.id}>
              {p.parcelCode}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Type">
        <select name="propertyType" className={inputCls}>
          <option>flat</option>
          <option>shop</option>
          <option>office</option>
        </select>
      </Field>
      <Field label="Area sq.ft">
        <input name="areaSqft" type="number" defaultValue={1100} className={inputCls} />
      </Field>
      <Field label="Occupancy">
        <select name="occupancy" className={inputCls}>
          <option>occupied</option>
          <option>vacant</option>
          <option>rented</option>
        </select>
      </Field>
      <Field label="Facing">
        <input name="facing" defaultValue="North" className={inputCls} />
      </Field>
      <Field label="Owner name (demo)">
        <input name="ownerName" className={inputCls} />
      </Field>
      <Field label="Owner email">
        <input name="ownerEmail" className={inputCls} />
      </Field>
      <Field label="Owner phone">
        <input name="ownerPhone" className={inputCls} />
      </Field>
      <button disabled={busy} className="rounded-xl bg-teal-400 py-2 text-sm font-semibold text-slate-950">
        Save unit + generate ULPIN
      </button>
    </form>
  );
}

function OccupancyEditor({
  id,
  value,
  number,
  type,
  area,
  status,
  onDone,
}: {
  id: number;
  value: string;
  number: string;
  type: string;
  area: number;
  status: string;
  onDone: () => void;
}) {
  async function change(occupancy: string) {
    await fetch("/api/units", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        unitNumber: number,
        propertyType: type,
        occupancy,
        status,
        areaSqft: area,
      }),
    });
    onDone();
  }
  return (
    <select
      defaultValue={value}
      onChange={(e) => void change(e.target.value)}
      className="rounded-md border border-white/10 bg-transparent px-1 py-1"
    >
      <option value="occupied">occupied</option>
      <option value="vacant">vacant</option>
      <option value="rented">rented</option>
    </select>
  );
}
