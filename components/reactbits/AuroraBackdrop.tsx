'use client';
/**
 * AuroraBackdrop — 히어로 화면용 다크 오로라 배경 레이어.
 * - 다크 그라디언트 베이스 위에 WebGL Aurora 를 얹어 밝은 UI 카드가 떠 보이게 함.
 * - prefers-reduced-motion 또는 WebGL 미지원 시 정적 그라디언트만(안전 폴백).
 * - position:fixed, z-index:-1 → 부모 main(position:relative; z-index:1)의
 *   스택 컨텍스트 안에서 콘텐츠 뒤에 깔린다(일반 흐름 텍스트가 가려지지 않도록).
 */
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Aurora = dynamic(() => import('./Aurora'), { ssr: false });

interface Props {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  speed?: number;
  /** 베이스 다크 그라디언트 (Aurora 뒤 배경) */
  baseGradient?: string;
}

export default function AuroraBackdrop({
  colorStops = ['#5227FF', '#22d3ee', '#7c3aed'],
  amplitude = 1.1,
  blend = 0.6,
  speed = 0.8,
  baseGradient = 'radial-gradient(120% 120% at 50% 0%, #131a2e 0%, #0b1020 55%, #070a14 100%)'
}: Props) {
  const [motionOk, setMotionOk] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setMotionOk(!reduce);
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        overflow: 'hidden',
        background: baseGradient
      }}
    >
      {motionOk && (
        <div style={{ position: 'absolute', inset: 0, opacity: 0.95 }}>
          <Aurora colorStops={colorStops} amplitude={amplitude} blend={blend} speed={speed} />
        </div>
      )}
      {/* 하단 비네트 — 카드 대비 강화 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(100% 60% at 50% 45%, transparent 40%, rgba(7,10,20,0.55) 100%)'
        }}
      />
    </div>
  );
}
