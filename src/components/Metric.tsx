import React from "react";

interface MetricProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  tone?: "slate" | "sky" | "amber";
}

export function Metric({ icon, label, value, unit, tone = "slate" }: MetricProps) {
  const tones = {
    slate: "text-slate-500",
    sky: "text-sky-600",
    amber: "text-amber-600",
  };
  
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className={`flex items-center gap-1.5 text-xs ${tones[tone]}`}>
        {icon}
        <span className="text-slate-500 font-medium">{label}</span>
      </div>
      <div className="mt-1.5 text-2xl font-bold text-slate-900 leading-none">
        {value}{" "}
        <span className="text-sm font-normal text-slate-400">{unit}</span>
      </div>
    </div>
  );
}
