import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'School AI 부스',
  description:
    '2022 개정 정보과 성취기준 기반 School AI 콘텐츠 부스 — 도트밸리 속 버그를 잡아라 / S.O.S 세계수를 구하라',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
