import React, { useState, useMemo } from "react";
import {
  Sparkles, Loader2, FileText, ChevronRight, Copy, CheckCircle2, Link2, RotateCcw
} from "lucide-react";
import { Student, RubricKey } from "../lib/types";
import { UnitConfig } from "../lib/units";
import { num, outlierSet, avg, rnd } from "../lib/calc";
import { Card } from "./Card";

const RUBRIC: { key: RubricKey; label: string }[] = [
  { key: "탐구수행", label: "탐구 수행" },
  { key: "데이터표현", label: "데이터 표현" },
  { key: "해석설명", label: "해석·설명" },
  { key: "협력태도", label: "협력·태도" },
];

interface ReportProps {
  unit: UnitConfig;
  udata: { groups: any[]; students: Student[]; count: number };
  setUnit: (patch: any) => void;
  className: string;
  goGrade: () => void;
}

interface ClassReportData {
  summary: string;
  achievements: string[];
}

export function Report({ unit, udata, setUnit, className, goGrade }: ReportProps) {
  const { groups, students, count } = udata;
  const cols = unit.cols;
  
  const [classReport, setClassReport] = useState<ClassReportData | null>(null);
  const [crLoading, setCrLoading] = useState(false);
  const [crError, setCrError] = useState<string | null>(null);
  const [recBusy, setRecBusy] = useState<Record<number, boolean>>({});
  const [recBatch, setRecBatch] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  const outliers = useMemo(() => {
    const o: Record<string, Set<number>> = {};
    cols.forEach((c) => (o[c.key] = outlierSet(groups, c.key)));
    return o;
  }, [groups, cols]);

  const allOut = useMemo(() => {
    const s = new Set<number>();
    cols.forEach((c) => outliers[c.key].forEach((id) => s.add(id)));
    return s;
  }, [outliers, cols]);

  const chartData = useMemo(() => {
    return cols.map((c) => {
      const a = avg(groups, c.key, outliers[c.key]);
      return { name: c.label, v: a != null ? rnd(a) : null };
    });
  }, [groups, outliers, cols]);

  const updateStudent = (id: number, patch: Partial<Student>) => {
    setUnit((prev: any) => ({
      ...prev,
      students: prev.students.map((s: Student) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  };

  const genClassReport = async () => {
    setCrLoading(true);
    setCrError(null);
    setClassReport(null);

    const rows = groups
      .map(
        (g) =>
          `${g.name}: ` +
          cols.map((c) => `${c.label} ${g[c.key] || "—"}`).join(", ") +
          (allOut.has(g.id) ? " (이상치)" : "")
      )
      .join("\n");

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "classReport",
          payload: {
            className,
            unitTitle: unit.title,
            unitContext: unit.context,
            rowsText: rows,
            chartDataText: chartData.map((c) => `${c.name} ${c.v ?? "—"}`).join(", "),
            obsCount: count,
            unitUnit: unit.unit,
          },
        }),
      });

      const res = await response.json();
      if (res.ok) {
        setClassReport(res.data);
      } else {
        throw new Error(res.error || "리포트 생성 실패");
      }
    } catch (e: any) {
      console.error(e);
      setCrError(e.message || "리포트 생성 중 문제가 발생했어요. 다시 시도해 주세요.");
    } finally {
      setCrLoading(false);
    }
  };

  const genRecord = async (id: number) => {
    const st = students.find((s) => s.id === id);
    if (!st || !st.evaluation || "error" in st.evaluation) return;

    setRecBusy((b) => ({ ...b, [id]: true }));
    
    const evText = RUBRIC.map((r) => {
      const evaluationVal = st.evaluation && !("error" in st.evaluation) ? st.evaluation[r.key] : null;
      return `${r.label}: ${evaluationVal?.level ?? "평가 없음"} (${evaluationVal?.evidence ?? ""})`;
    }).join("\n");

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "record",
          payload: {
            unitTitle: unit.title,
            evaluationText: evText,
          },
        }),
      });

      const res = await response.json();
      if (res.ok) {
        updateStudent(id, { record: res.data.record });
      } else {
        throw new Error(res.error || "문구 생성 실패");
      }
    } catch (e) {
      console.error(e);
      updateStudent(id, { record: "생성 실패 — 다시 시도해 주세요." });
    } finally {
      setRecBusy((b) => ({ ...b, [id]: false }));
    }
  };

  const genAllRecords = async () => {
    setRecBatch(true);
    // Generate records sequentially to respect API rate limits
    for (const s of students) {
      const graded = s.evaluation && !("error" in s.evaluation);
      if (graded && !s.record) {
        await genRecord(s.id);
      }
    }
    setRecBatch(false);
  };

  const copy = (id: number, text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch (e) {
      console.error("Clipboard copy failed:", e);
    }
  };

  const gradedStudents = students.filter((s) => s.evaluation && !("error" in s.evaluation));

  return (
    <>
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-5 flex-wrap font-medium">
        <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">1. 측정 데이터</span>
        <ChevronRight size={13} className="text-slate-300" />
        <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">2. 평가 근거</span>
        <ChevronRight size={13} className="text-slate-300" />
        <span className="px-2.5 py-1 rounded-md bg-sky-100 text-sky-700 border border-sky-200">3. 리포트·기록 문구</span>
      </div>

      <Card className="mb-5">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Sparkles size={17} className="text-sky-600 animate-pulse" />
              <span>학급 수업 리포트</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">현재 학급의 측정 데이터로 학부모·관리자 공유용 초안을 만듭니다.</p>
          </div>
          <button
            onClick={genClassReport}
            disabled={crLoading}
            className="inline-flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl bg-sky-600 text-white font-medium hover:bg-sky-700 disabled:opacity-60 transition shadow-sm select-none"
          >
            {crLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>작성 중…</span>
              </>
            ) : (
              <>
                <FileText size={15} />
                <span>{classReport ? "다시 생성" : "리포트 생성"}</span>
              </>
            )}
          </button>
        </div>

        {!classReport && !crLoading && !crError && (
          <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
            상단 버튼을 누르면 이 학급의 기입된 측정값과 관측 건수로 리포트가 생성됩니다.
          </div>
        )}
        
        {crError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700 font-medium">
            {crError}
          </div>
        )}
        
        {classReport && (
          <div className="rounded-xl border border-slate-200 p-4 sm:p-5 bg-white shadow-sm mt-3">
            <span className="inline-flex text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 font-semibold mb-3">
              AI 수업 리포트 초안
            </span>
            <p className="text-sm leading-7 text-slate-800 whitespace-pre-wrap">{classReport.summary}</p>
            {classReport.achievements?.length > 0 && (
              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-4">
                <div className="text-sm font-semibold text-slate-700 mb-2.5">핵심 성과 요약</div>
                <ul className="space-y-2">
                  {classReport.achievements.map((a, i) => (
                    <li key={i} className="text-sm text-slate-700 flex gap-2 items-start">
                      <span className="text-sky-500 font-bold mt-0.5">•</span>
                      <span className="leading-relaxed">{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">학생별 생기부 문구</h2>
            <p className="text-xs text-slate-500 mt-0.5">자동 평가 탭에서 기록한 4가지 루브릭 채점 결과를 바탕으로 생활기록부 문구를 작성합니다.</p>
          </div>
          {gradedStudents.length > 0 && (
            <button
              onClick={genAllRecords}
              disabled={recBatch}
              className="inline-flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-xl border border-sky-200 text-sky-700 bg-sky-50 hover:bg-sky-100 disabled:opacity-60 transition font-semibold select-none shadow-sm"
            >
              {recBatch ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>생성 중…</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>전체 생성</span>
                </>
              )}
            </button>
          )}
        </div>

        {gradedStudents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
            아직 채점된 학생이 없어요.{" "}
            <button onClick={goGrade} className="text-sky-600 underline font-semibold hover:text-sky-700">
              자동 평가 탭
            </button>
            에서 먼저 학생들의 답안을 AI 채점해 주세요.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {gradedStudents.map((st) => (
              <div key={st.id} className="py-4 first:pt-2 last:pb-2">
                <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-800">
                    {st.name}{" "}
                    <span className="text-slate-400 font-normal text-xs">| {st.group}</span>
                  </span>
                  <div className="flex gap-2">
                    {st.record && (
                      <button
                        onClick={() => copy(st.id, st.record!)}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 font-semibold hover:bg-slate-50 transition shadow-sm select-none"
                      >
                        {copied === st.id ? (
                          <>
                            <CheckCircle2 size={13} className="text-emerald-500" />
                            <span className="text-emerald-700">복사됨</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>복사</span>
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => genRecord(st.id)}
                      disabled={recBusy[st.id]}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-sky-200 bg-white text-sky-700 font-semibold hover:bg-sky-50 disabled:opacity-60 transition shadow-sm select-none"
                    >
                      {recBusy[st.id] ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>작성 중…</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} />
                          <span>{st.record ? "다시 생성" : "문구 생성"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                {st.record ? (
                  <div className="bg-slate-50/50 rounded-xl p-3.5 border border-slate-100">
                    <p className="text-sm leading-7 text-slate-800 font-medium">{st.record}</p>
                    <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                      <Link2 size={12} className="text-slate-300" />
                      <span>평가 근거 항목 반영됨</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 bg-slate-50/30 border border-slate-100 border-dashed rounded-xl p-3 text-center">
                    문구 생성 버튼을 누르면 이 학생의 평가 내역을 가공해 생기부 초안 문장을 작성합니다.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
