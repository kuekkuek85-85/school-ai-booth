import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Footer from '@/components/common/Footer';

// figmaSans → Inter(라틴), figmaMono → JetBrains Mono. 한글은 Pretendard(아래 CDN).
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jbMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jbmono', display: 'swap' });

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
    <html lang="ko" className={`${inter.variable} ${jbMono.variable}`}>
      <head>
        {/* 한글 본문 — Pretendard(가변, 동적 서브셋) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
