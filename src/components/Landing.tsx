import React, { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  ArrowRight, Satellite, Sun, Volume2, Smartphone, BookOpen, Check, Mail, X, Sparkles, AlertTriangle, FileText
} from "lucide-react";
import { Card } from "./Card";

// Load cobe Globe dynamically on the client side only to prevent Next.js SSR hydration mismatches
const InteractiveGlobe = dynamic(
  () => import("./InteractiveGlobe").then((m) => m.InteractiveGlobe),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-[320px] aspect-square bg-sky-50/40 rounded-full animate-pulse border border-sky-100/50 flex flex-col items-center justify-center text-xs text-sky-400 font-semibold gap-1.5">
        <Satellite className="animate-spin" size={20} />
        <span>3D 지구본 로드 중...</span>
      </div>
    ),
  }
);

interface LandingProps {
  onStart: () => void;
  onSelectUnit: (unitKey: string) => void;
}

// unDraw-style custom vector illustrations styled with sky-600 primary colors
function WeatherIllustration() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-24 text-sky-600 mb-3" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="120" height="80" rx="8" fill="#f0f9ff" />
      <path d="M40 55 C40 45, 52 42, 57 47 C62 40, 75 42, 78 48 C83 48, 88 52, 86 58 C85 62, 75 62, 40 62 Z" fill="#bae6fd" opacity="0.8" />
      <rect x="75" y="15" width="12" height="6" rx="1" fill="#0284c7" />
      <rect x="73" y="17" width="2" height="2" fill="#0284c7" />
      <rect x="87" y="17" width="2" height="2" fill="#0284c7" />
      <line x1="81" y1="21" x2="65" y2="45" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
      <rect x="45" y="30" width="14" height="24" rx="2" fill="#0f172a" />
      <rect x="47" y="32" width="10" height="18" fill="#ffffff" />
      <path d="M50 48 Q52 45, 54 48" stroke="#0284c7" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

function EcologyIllustration() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-24 text-emerald-600 mb-3" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="120" height="80" rx="8" fill="#f0fdf4" />
      <circle cx="90" cy="20" r="8" fill="#f59e0b" opacity="0.8" />
      <line x1="90" y1="8" x2="90" y2="10" stroke="#f59e0b" strokeWidth="1.5" />
      <line x1="90" y1="30" x2="90" y2="32" stroke="#f59e0b" strokeWidth="1.5" />
      <rect x="58" y="45" width="4" height="15" fill="#78350f" />
      <circle cx="60" cy="38" r="12" fill="#10b981" />
      <circle cx="52" cy="42" r="9" fill="#059669" />
      <circle cx="68" cy="42" r="9" fill="#059669" />
      <path d="M90 28 L65 48" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
      <path d="M25 45 C28 42, 33 42, 36 45" stroke="#10b981" strokeWidth="1.5" fill="none" />
      <rect x="22" y="48" width="16" height="12" rx="1.5" fill="#0f172a" />
      <rect x="24" y="50" width="12" height="8" fill="#10b981" />
    </svg>
  );
}

function NoiseIllustration() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-24 text-rose-600 mb-3" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="120" height="80" rx="8" fill="#fff5f5" />
      <rect x="20" y="40" width="12" height="22" fill="#cbd5e1" />
      <rect x="35" y="32" width="16" height="30" fill="#94a3b8" />
      <rect x="54" y="45" width="12" height="17" fill="#cbd5e1" />
      <path d="M72 45 Q78 30, 84 45" stroke="#ef4444" strokeWidth="1" />
      <path d="M70 49 Q78 20, 86 49" stroke="#f43f5e" strokeWidth="1.2" />
      <circle cx="85" cy="35" r="10" stroke="#f43f5e" strokeWidth="1.5" fill="#ffffff" />
      <line x1="85" y1="35" x2="91" y2="30" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Landing({ onStart, onSelectUnit }: LandingProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", school: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", contactForm);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowContact(false);
      setContactForm({ name: "", school: "", email: "", message: "" });
    }, 2500);
  };

  const faqs = [
    {
      q: "측정 장비가 따로 필요한가요?",
      a: "별도의 전용 장비가 없어도 괜찮습니다. 스마트폰에 탑재된 센서를 활용하는 phyphox 무료 앱과 지구 환경 관측용 GLOBE Observer 무료 앱만 있으면 모든 야외 측정 및 NASA 제출이 가능합니다.",
    },
    {
      q: "정규 교육과정 시수와 연계할 수 있나요?",
      a: "네, 2022 개정 과학과 교육과정의 '초등 과학 탐구 수행', '기후변화와 생태 전환 교육', 그리고 중학교 자유학기제 주제 선택 수업이나 고등학교 융합과학 탐구 시수와 완벽하게 부합합니다.",
    },
    {
      q: "AI 채점 결과를 생활기록부 입력에 곧바로 써도 안전한가요?",
      a: "생성되는 루브릭 채점 및 생활기록부 서술 문구는 교사의 최종 편집과 서명을 거쳐야 반영되는 '초안'으로 설계되어 있습니다. 교사의 최종 확인을 받기 전까지는 어떠한 성적 정보도 확정되지 않으므로 안심하고 사용하실 수 있습니다.",
    },
    {
      q: "학생 데이터는 안전하게 보관되나요?",
      a: "개인 정보 수집을 최소화하기 위해 학생 이름 및 소속 모둠 단위만 임시 보관하며, 외부 AI 엔진 호출 시 학생 실명이나 개인 식별 정보는 전달·기록되지 않도록 필터링 기술이 작용합니다.",
    },
    {
      q: "학교나 교육청 단위로 단체 도입하려면 어떻게 해야 하나요?",
      a: "하단의 '도입 문의' 또는 메일 문의를 남겨주시면 학급 설정 템플릿 제공, 교육 과정 매핑 컨설팅, 그리고 데이터 대시보드 커스터마이징을 지원해 드립니다.",
    },
  ];

  return (
    <div className="bg-[#f6f8fb] text-slate-800 antialiased min-h-screen">
      
      {/* 1. Hero Section with 3D Globe */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eef6ff] to-[#ffffff] pt-12 pb-16 lg:py-20 border-b border-sky-100/50">
        
        {/* Dynamic inline SVG decoration */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
          <svg width="400" height="400" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" stroke="#0284c7" strokeWidth="0.5" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="30" stroke="#0284c7" strokeWidth="0.8" />
            <path d="M50 5 L50 95 M5 50 L95 50" stroke="#0284c7" strokeWidth="0.3" />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 items-center text-center lg:text-left">
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start">
              <span className="inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full bg-sky-100/80 text-sky-700 font-bold mb-5 border border-sky-200/50 select-none">
                <Satellite size={14} className="animate-bounce" />
                <span>지구 기후 생태 전환 교육 & 시민과학 프로젝트</span>
              </span>
              
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                학생이 측정한 데이터가 NASA로 간다
                <span className="block text-sky-600 mt-2.5 font-bold">우리 동네에서 시작하는 지구 시민과학 수업</span>
              </h1>
              
              <p className="mt-6 text-sm md:text-base text-slate-600 leading-relaxed font-medium">
                교실 밖 환경을 직접 실측하고 분석해 국제 공동체에 기여합니다. 스마트폰 센서 데이터로 이상치를 탐색하고,
                AI 서술형 루브릭 채점부터 생활기록부 특기사항 문구 조안까지 한 번에 완료하는 과학교사용 통합 설계 킷.
              </p>

              <div className="mt-8 flex justify-center lg:justify-start gap-3 flex-wrap w-full">
                <button
                  onClick={onStart}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-sky-600 text-white font-bold text-sm shadow-md hover:bg-sky-700 active:scale-95 transition cursor-pointer select-none"
                >
                  <span>시작하기 (도구 바로가기)</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => setShowContact(true)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold text-sm shadow-sm hover:bg-slate-50 transition cursor-pointer select-none"
                >
                  <span>도입 문의하기</span>
                </button>
              </div>
            </div>
            
            {/* Column 2: 3D Globe Render (Cobe WebGL Canvas) */}
            <div className="lg:col-span-5 w-full flex justify-center overflow-hidden">
              <InteractiveGlobe />
            </div>
          </div>
        </div>
      </section>

      {/* 2. 3 Units Section */}
      <section className="py-16 max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-slate-900">맞춤형 지구 관측 단원</h2>
          <p className="text-xs text-slate-500 mt-2 font-semibold">클릭하면 해당 단원을 기입할 수 있는 교사용 도구 대시보드로 바로 진입합니다.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {/* Unit 1 */}
          <div
            onClick={() => onSelectUnit("weather")}
            className="group rounded-2xl border border-slate-100 bg-white p-5 cursor-pointer shadow-sm hover:shadow-md hover:border-sky-300 transition-all text-left"
          >
            <WeatherIllustration />
            <h3 className="text-base font-bold text-slate-900 mt-3">내 구름이 NASA로 간다</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              건물 층별 기압 차이를 스마트폰 센서로 수집하고, 오늘의 구름 종류를 사진에 기록하여 GLOBE 앱을 통해 NASA에 전송합니다.
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold">
                사용: phyphox 기압센서 + GLOBE 구름
              </span>
              <span className="text-xs text-sky-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">진입 &rarr;</span>
            </div>
          </div>

          {/* Unit 2 */}
          <div
            onClick={() => onSelectUnit("ecology")}
            className="group rounded-2xl border border-slate-100 bg-white p-5 cursor-pointer shadow-sm hover:shadow-md hover:border-sky-300 transition-all text-left"
          >
            <EcologyIllustration />
            <h3 className="text-base font-bold text-slate-900 mt-3">우리 학교 생태지도 — 빛과 그늘</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              양지 바른 교정과 나무 아래, 건물 그늘의 조도(lux)를 분석해 생물의 서식 환경을 시각화하고 교내 나무 높이를 실측합니다.
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold">
                사용: phyphox 빛센서 + GLOBE 토지피복
              </span>
              <span className="text-xs text-sky-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">진입 &rarr;</span>
            </div>
          </div>

          {/* Unit 3 */}
          <div
            onClick={() => onSelectUnit("noise")}
            className="group rounded-2xl border border-slate-100 bg-white p-5 cursor-pointer shadow-sm hover:shadow-md hover:border-sky-300 transition-all text-left"
          >
            <NoiseIllustration />
            <h3 className="text-base font-bold text-slate-900 mt-3">도시는 얼마나 시끄러울까</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              소음 센서 데시벨(dB) 데이터를 측정하여 도서관, 교실, 운동장의 생활 소음을 분류하고 동네 단위 소음 지도를 구성합니다.
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold">
                사용: phyphox 소음센서 + 소음 공공지도
              </span>
              <span className="text-xs text-sky-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">진입 &rarr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NASA Earth / Citizen Science Section */}
      <section className="py-16 bg-slate-50 border-t border-b border-slate-100/80">
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <div className="text-left">
            <span className="inline-flex text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 mb-4 select-none">
              ESG & 생태 전환 교육 매핑
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
              우리 교실의 기후 관측 데이터,<br />
              실제 글로벌 환경 연구로 이어집니다
            </h2>
            <p className="text-sm text-slate-600 mt-4 leading-relaxed font-medium">
              학생들이 phyphox와 GLOBE Observer 앱으로 측정한 기압, 조도, 소음 등의 데이터는 단순히 채점 후 버려지는 일회성 숙제가 아닙니다.
              NASA를 비롯한 전 세계 대기·기상 모델 공동연구를 지원하는 환경 시민과학 네트워크(GLOBE Program)에 축적되어 실시간 기후변화 모니터링 자료로 활용됩니다.
            </p>
            <p className="text-xs text-slate-400 mt-4 leading-relaxed font-medium">
              인류 공동의 생태 환경을 모니터링하고 기록하는 프로젝트를 교정에 직접 투영하여, 2022 개정 교육과정이 지향하는 실천적 시민 공동체 소양 교육을 달성해 보세요.
            </p>
          </div>
          
          {/* NASA Image display (with next/image optimization & lazy loading) */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md aspect-4/3 bg-slate-900 flex items-center justify-center group select-none">
            <Image
              src="/images/nasa-earth.png"
              alt="NASA Blue Marble Planet Earth photograph from space"
              fill
              sizes="(max-w-768px) 100vw, 460px"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
            <span className="absolute bottom-3 right-3 text-[10px] bg-slate-950/70 text-slate-200 px-2 py-0.5 rounded font-mono select-none" aria-label="이미지 출처">
              이미지: NASA
            </span>
          </div>
        </div>
      </section>

      {/* 4. Action Flow Diagram */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-extrabold">기록에서 생활기록부까지 단 5단계</h2>
            <p className="text-xs text-slate-400 mt-2 font-medium">교사의 단순 데이터 정리 행정 업무를 완전히 자동화합니다.</p>
          </div>

          <div className="grid md:grid-cols-5 gap-6 md:gap-3 relative">
            
            {/* Step 1 */}
            <div className="text-center relative">
              <div className="w-10 h-10 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center mx-auto mb-3 border border-sky-400 shadow-sm">
                <Smartphone size={16} />
              </div>
              <h4 className="text-sm font-bold">1. 스마트 관측</h4>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[150px] mx-auto">
                스마트폰 센서 앱과 CSV 내보내기로 측정 데이터를 통합
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center relative">
              <div className="w-10 h-10 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center mx-auto mb-3 border border-sky-400 shadow-sm">
                <AlertTriangle size={16} />
              </div>
              <h4 className="text-sm font-bold">2. 이상치 감지</h4>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[150px] mx-auto">
                Z-Score를 분석해 잘못 입력된 기압/조도 이상치 실시간 자동 검출
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center relative">
              <div className="w-10 h-10 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center mx-auto mb-3 border border-sky-400 shadow-sm">
                <Sparkles size={16} />
              </div>
              <h4 className="text-sm font-bold">3. 영역별 채점</h4>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[150px] mx-auto">
                4가지 영역별 서술형 답안 루브릭 매핑 및 근거 초안 제안
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center relative">
              <div className="w-10 h-10 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center mx-auto mb-3 border border-sky-400 shadow-sm">
                <FileText size={16} />
              </div>
              <h4 className="text-sm font-bold">4. 수업 리포트</h4>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[150px] mx-auto">
                학부모·외부 공유용 핵심성과 3항 요약본 생성
              </p>
            </div>

            {/* Step 5 */}
            <div className="text-center relative">
              <div className="w-10 h-10 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center mx-auto mb-3 border border-sky-400 shadow-sm">
                <BookOpen size={16} />
              </div>
              <h4 className="text-sm font-bold">5. 생기부 특기사항</h4>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[150px] mx-auto">
                채점 근거와 칭찬 성과를 가공해 생기부용 서술문 작성
              </p>
            </div>
            
          </div>
        </div>
      </section>

      {/* 5. Feature Preview */}
      <section className="py-16 max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-slate-900">대시보드 기능 미리보기</h2>
          <p className="text-xs text-slate-500 mt-2 font-semibold">실제 도구 화면에서 적용되는 레이아웃을 정적으로 재현한 모습입니다.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Dashboard chart mockup */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-sky-600 uppercase">대시보드 차트</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 flex items-center gap-0.5 font-bold">
                  <AlertTriangle size={10} /> 이상치 제외됨
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800">1모둠 옥상 기압: 1080hPa (이상치)</h4>
              <p className="text-[11px] text-slate-400 mt-1">이상치가 감지된 지점은 제외하여 학급의 평균 선을 정확하게 도식화합니다.</p>
              
              <div className="h-28 w-full mt-4 bg-slate-50 rounded-lg flex items-center justify-center relative border border-slate-100 overflow-hidden">
                <svg width="100%" height="80%" viewBox="0 0 100 40" className="absolute bottom-1 px-2" aria-hidden="true">
                  <path d="M 10 30 L 50 20 L 90 10" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="10" cy="30" r="3" fill="#0284c7" />
                  <circle cx="50" cy="20" r="3" fill="#0284c7" />
                  <circle cx="90" cy="10" r="3" fill="#0284c7" />
                  <circle cx="90" cy="35" r="3.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
                </svg>
                <span className="absolute bottom-2 right-2 text-[9px] text-red-500 font-bold">1080 hPa (옥상)</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 mt-3 border-t border-slate-50 pt-2 text-right">
              실시간 Z-score 이상치 색출
            </div>
          </Card>

          {/* AI Rubric Score Mockup */}
          <Card className="flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase block mb-3">AI 4요소 루브릭 채점</span>
              <h4 className="text-sm font-bold text-slate-800">김민서 학생 · 3모둠</h4>
              <div className="space-y-2 mt-3 text-xs">
                <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-700 text-[10px]">탐구 수행 (기압 측정)</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[9px] border border-emerald-100">잘함</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-700 text-[10px]">시민과학 (NASA 제출)</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[9px] border border-emerald-100">잘함</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-700 text-[10px]">해석 설명 (기압 변화)</span>
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[9px] border border-amber-100">보통</span>
                </div>
              </div>
              <div className="mt-3 text-[10px] bg-sky-50 text-sky-700 p-2 rounded-lg leading-relaxed flex items-start gap-1">
                <Sparkles size={11} className="shrink-0 mt-0.5" />
                <span>기압이 옥상으로 갈수록 감소함을 정확히 해석했으나, 구체적인 수치적 근거 누락함.</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 mt-3 border-t border-slate-50 pt-2 text-right">
              자체 AI 알고리즘 매핑
            </div>
          </Card>

          {/* Life Record Copy Mockup */}
          <Card className="flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase block mb-3">생활기록부 교과 세부능력사항</span>
              <h4 className="text-sm font-bold text-slate-800">생기부 서술 문구 초안</h4>
              <div className="mt-3 bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed font-medium">
                &ldquo;건물 고도별 기압 변화를 phyphox 앱으로 정확하게 실측하고 데이터를 막대그래프로 정리함. 
                구름 관측 자료를 GLOBE Observer를 통해 NASA에 등록하여 환경 시민과학 활동에 적극적으로 기여함.&rdquo;
              </div>
              <button className="w-full mt-3 inline-flex justify-center items-center gap-1.5 text-[11px] py-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 font-bold hover:bg-slate-50 transition cursor-default">
                <span>클릭 시 원클릭 복사</span>
              </button>
            </div>
            <div className="text-[10px] text-slate-400 mt-3 border-t border-slate-50 pt-2 text-right">
              ~함 체 서술어 문구 완성
            </div>
          </Card>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-8">자주 묻는 질문</h2>
          
          <div className="space-y-3.5">
            {faqs.map((faq, idx) => {
              const active = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left font-bold text-sm text-slate-800 hover:bg-sky-50/30 focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <span className={`text-sky-600 transition-transform ${active ? "rotate-180" : ""}`}>
                      &darr;
                    </span>
                  </button>
                  {active && (
                    <div className="px-5 pb-4 text-xs md:text-sm text-slate-500 leading-relaxed border-t border-slate-100/50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Footer Banner CTA */}
      <section className="bg-gradient-to-t from-[#eef6ff] to-[#ffffff] border-t border-sky-100 py-16 text-center">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">학교·학급 도입 지원 및 상담</h2>
          <p className="text-xs text-slate-500 mt-2 max-w-xl mx-auto font-medium">
            전용 데이터 대시보드 커스터마이징, 현장 교사 연수용 템플릿 배포, 2022 과학 교육과정 시수 매핑 컨설팅을 지원합니다.
          </p>
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <button
              onClick={() => setShowContact(true)}
              className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-sky-600 text-white font-bold text-xs md:text-sm shadow-md hover:bg-sky-700 transition cursor-pointer select-none"
            >
              <Mail size={15} />
              <span>도입 문의 작성하기</span>
            </button>
            <a
              href="mailto:contact@labmind.co.kr?subject=우리동네 지구관측 교실 도입 문의"
              className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs md:text-sm shadow-sm hover:bg-slate-50 transition"
            >
              <span>이메일 문의 보내기</span>
            </a>
          </div>
        </div>
      </section>

      {/* 8. Contact Modal Form */}
      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowContact(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 rounded-lg p-1.5"
              aria-label="닫기"
            >
              <X size={18} />
            </button>
            
            <h3 className="text-base font-extrabold text-slate-900 mb-2">도입 문의 양식</h3>
            <p className="text-[11px] text-slate-400 mb-4 font-semibold">요청 항목을 작성해 주시면 24시간 이내에 안내 답변 메일을 보내 드립니다.</p>

            {submitted ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 p-5 text-center text-xs font-semibold">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-3">
                  <Check size={20} />
                </div>
                문의가 정상적으로 등록되었습니다.<br />
                담당자가 영업일 기준 2일 이내에 연락드리겠습니다.
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3.5 text-xs text-left">
                <div>
                  <label htmlFor="name-input" className="block text-slate-600 font-bold mb-1">성함 *</label>
                  <input
                    id="name-input"
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white text-slate-700"
                    placeholder="이름을 입력해 주세요."
                  />
                </div>
                <div>
                  <label htmlFor="school-input" className="block text-slate-600 font-bold mb-1">소속 학교 / 기관 *</label>
                  <input
                    id="school-input"
                    type="text"
                    required
                    value={contactForm.school}
                    onChange={(e) => setContactForm({ ...contactForm, school: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white text-slate-700"
                    placeholder="학교명 및 직급을 써 주세요."
                  />
                </div>
                <div>
                  <label htmlFor="email-input" className="block text-slate-600 font-bold mb-1">이메일 주소 *</label>
                  <input
                    id="email-input"
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white text-slate-700"
                    placeholder="contact@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="message-input" className="block text-slate-600 font-bold mb-1">문의 내용 *</label>
                  <textarea
                    id="message-input"
                    required
                    rows={3}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white text-slate-700 resize-none"
                    placeholder="궁금하신 수업 매핑, 교육청 예산 문의 내용을 작성해 주세요."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-sky-600 text-white font-bold text-sm shadow-md hover:bg-sky-700 transition cursor-pointer"
                >
                  제출하기
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
