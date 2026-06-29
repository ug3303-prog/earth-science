import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  tone: "emerald" | "sky" | "slate";
}

export function Badge({ children, tone }: BadgeProps) {
  const styles = {
    emerald: "bg-emerald-50 text-emerald-700",
    sky: "bg-sky-50 text-sky-700",
    slate: "bg-slate-100 text-slate-500",
  };
  
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md shrink-0 font-medium ${styles[tone]}`}>
      {children}
    </span>
  );
}
