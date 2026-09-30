import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-6">
      <div className="glass max-w-lg rounded-3xl p-10 text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-teal-300">NEXUS-3D</p>
        <h1 className="mt-3 text-3xl font-semibold">Record not found</h1>
        <p className="mt-3 text-slate-400">
          That parcel, building or unit is not in the demo cluster.
        </p>
        <Link href="/dashboard" className="mt-6 inline-block rounded-full bg-teal-400 px-5 py-2 text-sm font-semibold text-slate-950">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
