"use client";

import React, { useState, useEffect } from "react";
import { LayoutDashboard, ClipboardCheck, FileText, Satellite, RotateCw } from "lucide-react";
import { AppData, UnitData } from "../lib/types";
import { UNITS } from "../lib/units";
import { SEED } from "../lib/seed";
import { store } from "../lib/store";
import { Dashboard } from "../components/Dashboard";
import { Grading } from "../components/Grading";
import { Report } from "../components/Report";
import { Landing } from "../components/Landing";

const FONT_FAMILY = '"Pretendard", -apple-system, BlinkMacSystemFont, "맑은 고딕", "Malgun Gothic", sans-serif';

export default function Home() {
  const [data, setData] = useState<AppData>(SEED);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("dash");
  const [reloading, setReloading] = useState(false);
  const [viewMode, setViewMode] = useState<"landing" | "app">("landing");

  const handleReload = async () => {
    setReloading(true);
    try {
      const saved = await store.get("geoclass:v4");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.units) {
          setData(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to reload data from store adapter:", e);
    } finally {
      setTimeout(() => {
        setReloading(false);
      }, 500);
    }
  };

  // Load from localStorage Adapter on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const saved = await store.get("geoclass:v4");
        if (saved) {
          const parsed = JSON.parse(saved);
          // Check if data is fully compatible
          if (parsed && parsed.units) {
            setData(parsed);
          }
        }
      } catch (e) {
        console.error("Failed to load data from store adapter:", e);
      } finally {
        setLoaded(true);
      }
    };
    loadData();
  }, []);

  // Save to localStorage Adapter on data changes
  useEffect(() => {
    if (!loaded) return;
    const saveData = async () => {
      try {
        await store.set("geoclass:v4", JSON.stringify(data));
      } catch (e) {
        console.error("Failed to save data to store adapter:", e);
      }
    };
    saveData();
  }, [data, loaded]);

  const activeUnitKey = UNITS[data.activeUnit] ? data.activeUnit : "weather";
  const unit = UNITS[activeUnitKey];
  const udata = data.units[activeUnitKey] || SEED.units[activeUnitKey];

  // Updates the active unit data (either via partial object or functional updates)
  const setUnit = (patch: Partial<UnitData> | ((prev: UnitData) => UnitData)) => {
    setData((d) => {
      const k = UNITS[d.activeUnit] ? d.activeUnit : "weather";
      const currentUnitData = d.units[k] || SEED.units[k];
      const updatedUnitData =
        typeof patch === "function" ? patch(currentUnitData) : { ...currentUnitData, ...patch };
      return {
        ...d,
        units: {
          ...d.units,
          [k]: updatedUnitData,
        },
      };
    });
  };

  // Resets the active unit to seed data
  const resetUnit = () => {
    setData((d) => {
      const k = UNITS[d.activeUnit] ? d.activeUnit : "weather";
      return {
        ...d,
        units: {
          ...d.units,
          [k]: JSON.parse(JSON.stringify(SEED.units[k])), // deep copy
        },
      };
    });
  };

  const tabs = [
    { id: "dash", label: "대시보드", icon: <LayoutDashboard size={16} /> },
    { id: "grade", label: "자동 평가", icon: <ClipboardCheck size={16} /> },
    { id: "report", label: "리포트", icon: <FileText size={16} /> },
  ];

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f8fb] text-slate-500 font-medium">
        지구관측교실 데이터를 불러오는 중...
      </div>
    );
  }

  if (viewMode === "landing") {
    return (
      <Landing
        onStart={() => setViewMode("app")}
        onSelectUnit={(unitKey) => {
          setData((d) => ({ ...d, activeUnit: unitKey }));
          setTab("dash");
          setViewMode("app");
        }}
      />
    );
  }

  const UnitIcon = unit.icon;

  return (
    <main
      className="min-h-screen w-full text-slate-800"
      style={{ fontFamily: FONT_FAMILY, background: "#f6f8fb" }}
    >
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        
        {/* Sky gradient header */}
        <div
          className="rounded-2xl border border-sky-100 p-5 sm:p-6 mb-5 shadow-sm"
          style={{ background: "linear-gradient(180deg, #eef6ff 0%, #ffffff 100%)" }}
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-sky-600 text-white shrink-0 shadow-md">
                <UnitIcon size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 leading-tight">
                    {unit.title}
                  </h1>
                  <button
                    onClick={() => setViewMode("landing")}
                    className="text-[10px] px-2 py-0.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition font-semibold shrink-0 cursor-pointer select-none"
                    title="소개 페이지로 돌아가기"
                  >
                    소개로
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {unit.activity}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={data.activeUnit}
                onChange={(e) => {
                  setData((d) => ({ ...d, activeUnit: e.target.value }));
                  setTab("dash");
                }}
                className="text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-200"
                aria-label="단원 선택"
              >
                {Object.values(UNITS).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.title}
                  </option>
                ))}
              </select>
              
              <input
                value={data.className}
                onChange={(e) => setData((d) => ({ ...d, className: e.target.value }))}
                className="text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-200"
                style={{ width: 110 }}
                placeholder="학급명"
                aria-label="학급명"
              />
              <button
                onClick={handleReload}
                disabled={reloading}
                className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200 transition disabled:opacity-60 select-none cursor-pointer"
                title="저장된 데이터 다시 불러오기"
              >
                <RotateCw size={15} className={reloading ? "animate-spin" : ""} />
                <span className="hidden sm:inline">새로고침</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-5 select-none overflow-x-auto pb-1 scrollbar-thin">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 text-sm px-4.5 py-2.5 rounded-xl border font-semibold transition shrink-0 ${
                  active
                    ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Tab Render */}
        <div className="transition-all duration-300">
          {tab === "dash" && (
            <Dashboard unit={unit} udata={udata} setUnit={setUnit} reset={resetUnit} />
          )}
          {tab === "grade" && (
            <Grading key={unit.id} unit={unit} udata={udata} setUnit={setUnit} className={data.className} />
          )}
          {tab === "report" && (
            <Report
              key={unit.id}
              unit={unit}
              udata={udata}
              setUnit={setUnit}
              className={data.className}
              goGrade={() => setTab("grade")}
            />
          )}
        </div>

        <p className="text-[11px] text-slate-400 text-center mt-8 font-medium">
          우리동네 지구관측 교실 (labmind.co.kr 전용) · phyphox & GLOBE 측정 데이터 기반 교사 자동화
        </p>
      </div>
    </main>
  );
}
