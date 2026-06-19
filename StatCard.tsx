import React from "react";

export default function StatCard({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return <div className="card p-4">
    <div className="text-xs uppercase tracking-wider text-emerald-300">{label}</div>
    <div className="mt-1 text-2xl font-black">{value}</div>
    {sub && <div className="mt-1 text-xs text-emerald-200/75">{sub}</div>}
  </div>;
}
