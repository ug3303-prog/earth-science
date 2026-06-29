import React, { useState } from "react";
import {
  Sparkles, Loader2, ClipboardCheck, ChevronDown, ChevronRight, CheckCircle2, Check, RotateCcw
} from "lucide-react";
import { Student, RubricKey, RubricLevel } from "../lib/types";
import { UnitConfig } from "../lib/units";
import { Metric } from "./Metric";
import { Badge } from "./Badge";

const RUBRIC: { key: RubricKey; label: string }[] = [
  { key: "탐구수행", label: "탐구 수행 (측정·관측)" },
  { key: "데이터표현", label: "데이터 표현 (표·그래프)" },
  { key: "해석설명", label: "해석·설명" },
  { key: "협력태도", label: "협력·태도 (시민과학)" },
];

const LEVELS: RubricLevel[] = ["잘함", "보통", "노력요함"];

const LEVEL_STYLE: Record<RubricLevel, string> = {
  잘함: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/50",
  보통: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/50",
  노력요함: "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/50",
};

interface GradingProps {
  unit: UnitConfig;
  udata: { students: Student[] };
  setUnit: (patch: any) => void;
  className: string;
}

export function Grading({ unit, udata, setUnit, className }: GradingProps) {
  const { students } = udata;
  const [openId, setOpenId] = useState<number | null>(null);
  const [busy, setBusy] = useState<Record<number, boolean>>({});
  const [batch, setBatch] = useState(false);

  const updateStudent = (id: number, patch: Partial<Student>) => {
    setUnit((prev: any) => ({
      ...prev,
      students: prev.students.map((s: Student) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  };

  const grade = async (id: number) => {
    const st = students.find((s) => s.id === id);
    if (!st) return;

    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "grade",
          payload: {
            studentName: st.name,
            studentGroup: st.group,
            studentAnswer: st.answer,
            unitTitle: unit.title,
            unitActivity: unit.activity,
          },
        }),
      });

      const res = await response.json();
      if (res.ok) {
        updateStudent(id, { evaluation: res.data, approved: false });
        setOpenId(id);
      } else {
        throw new Error(res.error || "채점 실패");
      }
    } catch (e) {
      console.error("AI Grading failed:", e);
      updateStudent(id, { evaluation: { error: true } });
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  };

  const gradeAll = async () => {
    setBatch(true);
    // Grade students sequentially or in parallel. Slower requests run sequentially to avoid rate-limits.
    for (const s of students) {
      const needsGrading = !s.evaluation || (s.evaluation as any).error;
      if (needsGrading) {
        await grade(s.id);
      }
    }
    setBatch(false);
  };

  const setLevel = (id: number, key: RubricKey, level: RubricLevel) => {
    const st = students.find((s) => s.id === id);
    if (!st || !st.evaluation || "error" in st.evaluation) return;
    
    updateStudent(id, {
      evaluation: {
        ...st.evaluation,
        [key]: {
          ...st.evaluation[key],
          level,
        },
      },
    });
  };

  const gradedCount = students.filter((s) => s.evaluation && !("error" in s.evaluation)).length;
  const approvedCount = students.filter((s) => s.approved).length;

  return (
    <>
      <div className="flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 mb-4 text-sm text-sky-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <Sparkles size={18} className="shrink-0 mt-0.5 text-sky-600" />
        <span>
          AI가 생성한 평가는 <strong className="font-semibold">초안</strong>입니다. 단계 칸을 눌러 직접 수정할 수 있으며, 교사가 승인하기 전까지 학생 리포트나 학교 기록에 공식 반영되지 않습니다.
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <Metric label="학급 학생" value={`${students.length}`} unit="명" tone="slate" />
        <Metric label="AI 채점 완료" value={`${gradedCount}`} unit="명" tone="sky" />
        <Metric label="교사 승인 완료" value={`${approvedCount}`} unit="명" tone="slate" />
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={gradeAll}
          disabled={batch}
          className="inline-flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl bg-sky-600 text-white font-medium hover:bg-sky-700 disabled:opacity-60 transition shadow-sm select-none"
        >
          {batch ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>전체 채점 중…</span>
            </>
          ) : (
            <>
              <ClipboardCheck size={16} />
              <span>전체 AI 채점</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-3">
        {students.map((st) => {
          const open = openId === st.id;
          const hasError = st.evaluation && "error" in st.evaluation;
          const graded = st.evaluation && !hasError;
          
          return (
            <div
              key={st.id}
              className="rounded-xl border bg-white shadow-[0_1px_3px_rgba(0,0,0,0.01)] transition hover:shadow-md"
              style={{ borderColor: "#eef1f5" }}
            >
              <button
                onClick={() => setOpenId(open ? null : st.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-200 rounded-xl"
                aria-expanded={open}
              >
                <div className="w-9 h-9 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center text-xs font-semibold shrink-0">
                  {st.name.slice(-2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <span>{st.name}</span>
                    <span className="text-slate-400 font-normal text-xs">| {st.group}</span>
                  </div>
                  <div className="text-xs text-slate-400 truncate mt-0.5">{st.answer}</div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  {st.approved ? (
                    <Badge tone="emerald">
                      <CheckCircle2 size={12} /> 승인됨
                    </Badge>
                  ) : graded ? (
                    <Badge tone="sky">채점됨</Badge>
                  ) : (
                    <Badge tone="slate">미채점</Badge>
                  )}
                  {open ? (
                    <ChevronDown size={16} className="text-slate-400 shrink-0" />
                  ) : (
                    <ChevronRight size={16} className="text-slate-400 shrink-0" />
                  )}
                </div>
              </button>

              {open && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-4">
                  <div className="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-3 mb-4">
                    <div className="text-xs text-slate-400 font-medium mb-1.5">활동지 서술형 답안 (수정 시 평가가 리셋됩니다)</div>
                    <textarea
                      value={st.answer}
                      onChange={(e) =>
                        updateStudent(st.id, {
                          answer: e.target.value,
                          evaluation: null,
                          approved: false,
                          record: null,
                        })
                      }
                      rows={2}
                      className="w-full text-sm text-slate-700 bg-transparent resize-none focus:outline-none border-b border-transparent focus:border-slate-200 py-0.5"
                      placeholder="답안을 입력해 주세요."
                    />
                  </div>

                  {!graded && !hasError && (
                    <button
                      onClick={() => grade(st.id)}
                      disabled={busy[st.id]}
                      className="inline-flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-lg border border-sky-200 text-sky-700 font-semibold hover:bg-sky-50 disabled:opacity-60 transition shadow-sm"
                    >
                      {busy[st.id] ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>채점 중…</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={15} />
                          <span>AI 채점</span>
                        </>
                      )}
                    </button>
                  )}

                  {hasError && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3 flex items-center justify-between">
                      <span>채점 중 오류가 발생했거나 한도가 초과되었습니다.</span>
                      <button
                        onClick={() => grade(st.id)}
                        disabled={busy[st.id]}
                        className="underline font-semibold hover:text-red-800 flex items-center gap-1 focus:outline-none"
                      >
                        {busy[st.id] ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <RotateCcw size={13} />
                        )}
                        다시 시도
                      </button>
                    </div>
                  )}

                  {graded && st.evaluation && !("error" in st.evaluation) && (
                    <>
                      <div className="space-y-3">
                        {RUBRIC.map((r) => {
                          const ev = st.evaluation ? (st.evaluation as any)[r.key] || {} : {};
                          return (
                            <div key={r.key} className="border border-slate-100 bg-white rounded-xl p-3.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
                              <div className="flex items-center justify-between gap-3 flex-wrap">
                                <span className="text-sm font-semibold text-slate-700">{r.label}</span>
                                <div className="flex gap-1.5">
                                  {LEVELS.map((lv) => {
                                    const active = ev.level === lv;
                                    return (
                                      <button
                                        key={lv}
                                        onClick={() => setLevel(st.id, r.key, lv)}
                                        className={`text-xs px-2.5 py-1.5 rounded-lg border transition font-medium select-none ${
                                          active
                                            ? LEVEL_STYLE[lv]
                                            : "border-slate-200 text-slate-400 bg-white hover:bg-slate-50"
                                        }`}
                                      >
                                        {lv}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                              {ev.evidence && (
                                <div className="text-xs text-slate-500 mt-2.5 flex items-start gap-1.5 bg-slate-50/50 p-2 rounded-lg border border-dashed border-slate-100">
                                  <Sparkles size={13} className="shrink-0 mt-0.5 text-sky-400" />
                                  <span className="leading-relaxed">{ev.evidence}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="flex gap-2 mt-4 flex-wrap">
                        <button
                          onClick={() => updateStudent(st.id, { approved: !st.approved })}
                          className={`inline-flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl font-semibold transition shadow-sm ${
                            st.approved
                              ? "border border-slate-200 text-slate-500 hover:bg-slate-50 bg-white"
                              : "bg-sky-600 text-white hover:bg-sky-700"
                          }`}
                        >
                          <Check size={16} />
                          <span>{st.approved ? "승인 취소" : "평가 승인"}</span>
                        </button>
                        <button
                          onClick={() => grade(st.id)}
                          disabled={busy[st.id]}
                          className="inline-flex items-center gap-1.5 text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-semibold hover:bg-slate-50 bg-white transition"
                        >
                          {busy[st.id] ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <RotateCcw size={16} />
                          )}
                          <span>다시 채점</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
