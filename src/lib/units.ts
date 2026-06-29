import React from "react";
import { Satellite, Sun, Volume2, LucideProps } from "lucide-react";

export interface UnitCol {
  key: string;
  label: string;
}

export interface ObsRow {
  label: string;
  value: string;
}

export interface UnitConfig {
  id: string;
  title: string;
  icon: React.ComponentType<LucideProps>;
  cols: UnitCol[];
  unit: string;
  measureTitle: string;
  chartTitle: string;
  chartHint: string;
  avgLabel: string;
  obsTitle: string;
  obsCountLabel: string;
  obsRows: ObsRow[];
  context: string;
  activity: string;
}

export const UNITS: Record<string, UnitConfig> = {
  weather: {
    id: "weather",
    title: "내 구름이 NASA로 간다",
    icon: Satellite,
    cols: [
      { key: "f", label: "1층" },
      { key: "s", label: "계단" },
      { key: "r", label: "옥상" },
    ],
    unit: "hPa",
    measureTitle: "모둠별 기압 측정값 (hPa)",
    chartTitle: "고도별 평균 기압",
    chartHint: "올라갈수록 기압이 낮아짐 · 이상치 제외",
    avgLabel: "학급 평균 기압",
    obsTitle: "구름 관측 현황 (GLOBE)",
    obsCountLabel: "NASA 제출(구름)",
    obsRows: [
      { label: "위성 매칭 대기", value: "12건" },
      { label: "가장 많은 구름", value: "적운 (8건)" },
      { label: "평균 운량", value: "45%" },
    ],
    context: "스마트폰 기압 측정(phyphox) + GLOBE 구름 관측 후 NASA 제출",
    activity: "phyphox 앱으로 건물 고도별 기압 측정, GLOBE Observer로 구름 관측·제출",
  },
  ecology: {
    id: "ecology",
    title: "우리 학교 생태지도 — 빛과 그늘",
    icon: Sun,
    cols: [
      { key: "f", label: "양지" },
      { key: "s", label: "나무그늘" },
      { key: "r", label: "건물그늘" },
    ],
    unit: "lux",
    measureTitle: "모둠별 조도 측정값 (lux)",
    chartTitle: "장소별 평균 조도",
    chartHint: "나무그늘이 가장 어두움 · 이상치 제외",
    avgLabel: "학급 평균 조도",
    obsTitle: "생태 관측 현황 (GLOBE)",
    obsCountLabel: "GLOBE 제출(나무·토지)",
    obsRows: [
      { label: "측정한 나무", value: "12그루" },
      { label: "평균 나무 높이", value: "6.4 m" },
      { label: "주요 토지피복", value: "잔디·교목" },
    ],
    context: "phyphox 빛 센서로 장소별 조도 측정 + GLOBE 나무 높이·둘레/토지피복 관측",
    activity: "phyphox 빛 센서로 양지·나무그늘·건물그늘 조도 측정, GLOBE로 나무·토지피복 관측",
  },
  noise: {
    id: "noise",
    title: "도시는 얼마나 시끄러울까 — 소음 지도",
    icon: Volume2,
    cols: [
      { key: "f", label: "도서관" },
      { key: "s", label: "교실" },
      { key: "r", label: "운동장" },
    ],
    unit: "dB",
    measureTitle: "모둠별 소음 측정값 (dB)",
    chartTitle: "장소별 평균 소음",
    chartHint: "사람이 많을수록 시끄러움 · 이상치 제외",
    avgLabel: "학급 평균 소음",
    obsTitle: "소음 지도 제출 현황 (시민과학)",
    obsCountLabel: "소음지도 제출",
    obsRows: [
      { label: "측정한 지점", value: "9곳" },
      { label: "가장 시끄러운 곳", value: "운동장" },
      { label: "WHO 주간 권고", value: "55 dB" },
    ],
    context: "phyphox 음향 센서로 장소별 소음 측정 + 우리동네 소음지도 시민과학 기록",
    activity: "phyphox 음향 센서로 도서관·교실·운동장 소음(dB) 측정, 우리동네 소음지도에 기록",
  },
};
