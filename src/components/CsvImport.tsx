import React, { useState } from "react";
import Papa from "papaparse";
import { Upload, CheckCircle2 } from "lucide-react";
import { Group } from "../lib/types";
import { UnitConfig } from "../lib/units";
import { rnd } from "../lib/calc";

interface CsvImportProps {
  unit: UnitConfig;
  groups: Group[];
  setUnit: (patch: { groups: Group[] } | ((prev: { groups: Group[] }) => { groups: Group[] })) => void;
}

export function CsvImport({ unit, groups, setUnit }: CsvImportProps) {
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [phyphox, setPhyphox] = useState<{ mean: number; n: number } | null>(null);
  const [pick, setPick] = useState<{ gid: number | null; col: string }>({
    gid: groups[0]?.id ?? null,
    col: unit.cols[0].key,
  });

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg(null);
    setErr(null);
    setPhyphox(null);
    
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const resultString = String(reader.result).trim();
        const res = Papa.parse<string[]>(resultString, { skipEmptyLines: true });
        const rows = res.data.filter((r) => r.length && r.some((c) => String(c).trim() !== ""));
        
        if (!rows.length) {
          setErr("빈 파일이에요.");
          return;
        }
        
        const header = rows[0].map((c) => String(c).trim());
        const sensorWords = /time|시간|pressure|hpa|lux|illumin|sound|db|decibel|co2|ppm/i;
        const looksPhyphox = sensorWords.test(header.join(" ")) && header.length <= 3 && rows.length > 5;
        
        if (looksPhyphox) {
          // Last column is usually the measurement value
          const colIdx = header.length - 1;
          const vals = rows
            .slice(1)
            .map((r) => parseFloat(r[colIdx]))
            .filter((v) => isFinite(v));
            
          if (!vals.length) {
            setErr("측정값을 찾지 못했어요.");
            return;
          }
          
          const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
          setPhyphox({ mean: rnd(mean), n: vals.length });
          setPick({ gid: groups[0]?.id ?? null, col: unit.cols[0].key });
        } else {
          // Class list mode
          const firstIsHeader = rows[0].slice(1).some((c) => !isFinite(parseFloat(c)));
          const body = firstIsHeader ? rows.slice(1) : rows;
          
          const ng = body.map((r, i) => {
            const name = String(r[0] ?? "").trim() || `${i + 1}모둠`;
            const g: Group = { id: i + 1, name };
            unit.cols.forEach((c, ci) => {
              const v = r[ci + 1];
              g[c.key] = v == null ? "" : String(v).trim();
            });
            return g;
          });
          
          if (!ng.length) {
            setErr("모둠 데이터를 찾지 못했어요.");
            return;
          }
          
          // Next.js uses functional state or object patch
          setUnit({ groups: ng });
          setMsg(`${ng.length}개 모둠 데이터를 불러왔어요.`);
        }
      } catch (er) {
        setErr("CSV를 읽지 못했어요. 형식을 확인해 주세요.");
      }
    };
    reader.readAsText(file, "utf-8");
    e.target.value = "";
  };

  const insertPhyphox = () => {
    if (!phyphox || pick.gid === null) return;
    
    // Update the correct cell
    setUnit((prev: any) => {
      const updatedGroups = prev.groups.map((g: Group) => 
        g.id === pick.gid ? { ...g, [pick.col]: String(phyphox.mean) } : g
      );
      return { ...prev, groups: updatedGroups };
    });
    
    setMsg(`phyphox 평균값 ${phyphox.mean} ${unit.unit}을(를) 넣었어요.`);
    setPhyphox(null);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 mb-3 text-sm">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-slate-600 font-medium">CSV 가져오기 — 학급 데이터 일괄 입력 또는 phyphox 내보내기 파일</span>
        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-200 text-sky-700 bg-white hover:bg-sky-50 cursor-pointer transition select-none font-medium">
          <Upload size={15} /> 파일 선택
          <input type="file" accept=".csv,text/csv" onChange={onFile} className="hidden" />
        </label>
      </div>
      <div className="text-xs text-slate-400 mt-2 leading-relaxed">
        <strong>학급 CSV 형식:</strong> 첫 열 = 모둠 이름, 다음 열 = {unit.cols.map((c) => c.label).join(" · ")} (단위 {unit.unit}). 헤더 행은 생략하거나 포함할 수 있습니다.<br />
        <strong>phyphox 내보내기:</strong> 센서 데이터를 올리면 측정값 평균을 계산해 원하는 모둠 칸에 즉시 넣을 수 있습니다.
      </div>
      {msg && (
        <div className="text-xs text-emerald-700 mt-2.5 flex items-center gap-1 font-medium">
          <CheckCircle2 size={13} /> {msg}
        </div>
      )}
      {err && <div className="text-xs text-red-600 mt-2.5 font-medium">{err}</div>}
      
      {phyphox && (
        <div className="mt-3.5 rounded-lg border border-sky-200 bg-white p-3.5 shadow-sm">
          <div className="text-sm text-slate-700 mb-2.5">
            phyphox 파일 감지 — 측정값 {phyphox.n}개의 평균 <strong className="font-semibold text-sky-600">{phyphox.mean} {unit.unit}</strong>. 어느 모둠의 칸에 넣을까요?
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={pick.gid ?? ""}
              onChange={(e) => setPick((p) => ({ ...p, gid: Number(e.target.value) }))}
              className="text-sm px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200"
              aria-label="대상 모둠 선택"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <select
              value={pick.col}
              onChange={(e) => setPick((p) => ({ ...p, col: e.target.value }))}
              className="text-sm px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200"
              aria-label="대상 측정값 열 선택"
            >
              {unit.cols.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
            <button
              onClick={insertPhyphox}
              className="text-sm px-3.5 py-1.5 rounded-md bg-sky-600 text-white font-medium hover:bg-sky-700 transition"
            >
              값 넣기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
