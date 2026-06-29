import { Group } from "./types";

export const num = (v: any): number | null => {
  if (v === undefined || v === null || v === "") return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
};

export function outlierSet(groups: Group[], key: string): Set<number> {
  const vals = groups.map((g) => num(g[key])).filter((v): v is number => v !== null);
  if (vals.length < 3) return new Set();
  
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const sd = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length);
  if (sd === 0) return new Set();
  
  const out = new Set<number>();
  groups.forEach((g) => {
    const v = num(g[key]);
    if (v !== null && Math.abs(v - mean) / sd > 1.8) {
      out.add(g.id);
    }
  });
  return out;
}

export function avg(groups: Group[], key: string, exclude: Set<number>): number | null {
  const vals = groups
    .filter((g) => !exclude.has(g.id))
    .map((g) => num(g[key]))
    .filter((v): v is number => v !== null);
    
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export const rnd = (n: number): number => {
  return n >= 100 ? Math.round(n) : Math.round(n * 10) / 10;
};
