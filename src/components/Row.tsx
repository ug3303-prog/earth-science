import React from "react";

interface RowProps {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}

export function Row({ label, children, last = false }: RowProps) {
  return (
    <div className={`flex items-center justify-between py-2.5 text-sm ${last ? "" : "border-b border-slate-100"}`}>
      <span className="text-slate-500 font-medium">{label}</span>
      <div className="text-slate-800">{children}</div>
    </div>
  );
}
