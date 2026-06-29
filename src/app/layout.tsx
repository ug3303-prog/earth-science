import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "우리동네 지구관측 교실 — 과학탐구 교사용 AI 자동화",
  description: "교사가 학생의 측정 데이터를 입력/가져오면 이상치를 자동 감지하고, AI가 4개 영역 루브릭으로 채점해 생활기록부 특기사항 문구 초안을 만들어 주는 스마트 과학교실 자동화 대시보드입니다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
