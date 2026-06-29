import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}
