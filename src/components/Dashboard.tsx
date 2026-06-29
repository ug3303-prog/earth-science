import React, { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Check, Gauge, AlertTriangle, Cloud, Upload, Plus, RotateCcw, Trash2
} from "lucide-react";
import { Group, UnitData } from "../lib/types";
import { UnitConfig } from "../lib/units";
import { num, outlierSet, avg, rnd } from "../lib/calc";
import { Metric } from "./Metric";
import { Card } from "./Card";
import { Row } from "./Row";
import { CsvImport } from "./CsvImport";

interface DashboardProps {
  unit: UnitConfig;
  udata: UnitData;
  setUnit: (patch: Partial<UnitData> | ((prev: UnitData) => UnitData)) => void;
  reset: () => void;
}

export function Dashboard({ unit, udata, setUnit, reset }: DashboardProps) {
  const { groups, count } = udata;
  const cols = unit.cols;
  const [showImport, setShowImport] = useState(false);

  // Compute outliers for each column
  const outliers = useMemo(() => {
    const o: Record<string, Set<number>> = {};
    cols.forEach((c) => {
      o[c.key] = outlierSet(groups, c.key);
    });
    return o;
  }, [groups, cols]);

  // Set of all group IDs that have at least one outlier
  const allOut = useMemo(() => {
    const s = new Set<number>();
    cols.forEach((c) => {
      outliers[c.key].forEach((id) => s.add(id));
    });
    return s;
  }, [outliers, cols]);

  // Aggregated data for Recharts (excluding outliers column-wise)
  const chartData = useMemo(() => {
    return cols.map((c) => {
      const a = avg(groups, c.key, outliers[c.key]);
      return {
        name: c.label,
        avg: a !== null ? rnd(a) : null,
      };
    });
  }, [groups, outliers, cols]);

  // Overall class average (excluding outliers)
  const overallAvg = useMemo(() => {
    const all: number[] = [];
    groups.forEach((g) => {
      cols.forEach((c) => {
        if (!outliers[c.key].has(g.id)) {
          const v = num(g[c.key]);
          if (v !== null) all.push(v);
        }
      });
    });
    return all.length ? rnd(all.reduce((a, b) => a + b, 0) / all.length).toLocaleString() : "—";
  }, [groups, outliers, cols]);

  const completed = groups.filter((g) => cols.every((c) => num(g[c.key]) !== null)).length;
  const outlierCount = allOut.size;

  const setCell = (id: number, key: string, val: string) => {
    setUnit((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => (g.id === id ? { ...g, [key]: val } : g)),
    }));
  };

  const setName = (id: number, val: string) => {
    setUnit((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => (g.id === id ? { ...g, name: val } : g)),
    }));
  };

  const addGroup = () => {
    const nid = Math.max(0, ...groups.map((g) => g.id)) + 1;
    const blank: Group = { id: nid, name: `${groups.length + 1}모둠` };
    cols.forEach((c) => {
      blank[c.key] = "";
    });
    setUnit((prev) => ({
      ...prev,
      groups: [...prev.groups, blank],
    }));
  };

  const removeGroup = (id: number) => {
    setUnit((prev) => ({
      ...prev,
      groups: prev.groups.filter((g) => g.id !== id),
    }));
  };

  const cellClass = (id: number, key: string) => {
    return outliers[key].has(id)
      ? "bg-red-50 text-red-700 border-red-300 font-medium focus:ring-red-200"
      : "bg-white border-slate-100 focus:ring-sky-200";
  };

  const handleObsCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    setUnit((prev) => ({ ...prev, count: val }));
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Metric icon={<Check size={16} />} label="측정 완료 모둠" value={`${completed}`} unit={`/ ${groups.length}`} tone="slate" />
        <Metric icon={<Gauge size={16} />} label={unit.avgLabel} value={overallAvg} unit={unit.unit} tone="sky" />
        <Metric icon={<AlertTriangle size={16} />} label="이상치 감지" value={`${outlierCount}`} unit="건" tone={outlierCount ? "amber" : "slate"} />
        <Metric icon={<Cloud size={16} />} label={unit.obsCountLabel} value={`${count}`} unit="건" tone="slate" />
      </div>

      {outlierCount > 0 && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 mb-5 text-sm text-amber-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-600" />
          <span>
            비정상적인 측정값 <strong className="font-semibold">{outlierCount}건</strong>이 감지됐어요. 빨간 칸은 재측정을 권장하며, 학급 평균과 아래 그래프 계산에서는 자동으로 제외됩니다.
          </span>
        </div>
      )}

      <Card className="mb-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-base font-semibold text-slate-900">{unit.measureTitle}</h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowImport((v) => !v)}
              className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition"
            >
              <Upload size={15} /> CSV
            </button>
            <button
              onClick={addGroup}
              className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition"
            >
              <Plus size={15} /> 모둠 추가
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 font-medium hover:bg-slate-50 transition"
            >
              <RotateCcw size={15} /> 초기화
            </button>
          </div>
        </div>
        
        {showImport && <CsvImport unit={unit} groups={groups} setUnit={setUnit as any} />}
        
        <div className="overflow-x-auto -mx-4 px-4 sm:-mx-5 sm:px-5">
          <table className="w-full text-sm" style={{ minWidth: 460 }}>
            <thead>
              <tr className="text-slate-400 text-xs border-b border-slate-100">
                <th className="text-left font-semibold py-2.5 pr-2" style={{ width: "26%" }}>모둠</th>
                {cols.map((c) => (
                  <th key={c.key} className="text-right font-semibold py-2.5 px-2">
                    {c.label} ({unit.unit})
                  </th>
                ))}
                <th style={{ width: 44 }}></th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition">
                  <td className="py-2 pr-2">
                    <input
                      value={g.name}
                      onChange={(e) => setName(g.id, e.target.value)}
                      className="w-full px-2 py-1.5 rounded-md bg-transparent text-slate-800 font-medium border border-transparent hover:border-slate-200 focus:border-sky-300 focus:bg-white focus:outline-none"
                      aria-label="모둠 이름"
                    />
                  </td>
                  {cols.map((c) => (
                    <td key={c.key} className="py-2 px-1">
                      <input
                        inputMode="decimal"
                        value={g[c.key] ?? ""}
                        onChange={(e) => setCell(g.id, c.key, e.target.value)}
                        placeholder="—"
                        className={`w-full text-right px-2 py-1.5 rounded-md border focus:outline-none focus:ring-2 ${cellClass(
                          g.id,
                          c.key
                        )}`}
                        aria-label={`${g.name} ${c.label}`}
                      />
                    </td>
                  ))}
                  <td className="text-center py-2">
                    <button
                      onClick={() => removeGroup(g.id)}
                      className="text-slate-300 hover:text-red-500 transition p-1.5 rounded-lg hover:bg-red-50"
                      aria-label="모둠 삭제"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-base font-semibold text-slate-900">{unit.chartTitle}</h2>
          <p className="text-xs text-slate-500 mb-4">{unit.chartHint}</p>
          <div style={{ width: "100%", height: 200 }} className="select-none">
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 10, right: 12, left: -4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                  tickFormatter={(v) => v.toLocaleString()}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}
                  formatter={(v: any) => [`${v.toLocaleString()} ${unit.unit}`, unit.avgLabel]}
                />
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#0284c7" }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-slate-900 mb-3">{unit.obsTitle}</h2>
          <Row label={unit.obsCountLabel}>
            <input
              type="number"
              value={count}
              onChange={handleObsCountChange}
              className="w-20 text-right px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-200"
              aria-label="제출 건수"
            />
          </Row>
          {unit.obsRows.map((r, i) => (
            <Row key={r.label} label={r.label} last={i === unit.obsRows.length - 1}>
              <span className="font-semibold text-slate-800">{r.value}</span>
            </Row>
          ))}
        </Card>
      </div>
    </>
  );
}
