'use client';
/** 활동지 동적 생성 로딩바 — 단계 메시지 순환 + 진행 애니메이션(생성 완료까지). */
import { useEffect, useState } from 'react';

const MESSAGES = [
  '발행된 활동지 확인 중…',
  '성취기준 분석 중…',
  '활동 순서 구성 중…',
  'AI가 형성평가 문항 생성 중…',
  '활동지 마무리 중…',
];

export default function WorksheetLoading() {
  const [pct, setPct] = useState(8);
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    // 95%까지 서서히 차오름(생성 완료 시 상위에서 언마운트)
    const p = setInterval(() => {
      setPct((v) => (v < 95 ? v + Math.max(1, Math.round((95 - v) / 12)) : v));
    }, 300);
    const m = setInterval(() => {
      setMsgIdx((i) => (i + 1) % MESSAGES.length);
    }, 1400);
    return () => {
      clearInterval(p);
      clearInterval(m);
    };
  }, []);

  return (
    <main className="theme-sos" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 'var(--space-5)', background: 'var(--color-bg)' }}>
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 'var(--fs-2xl)' }}>🤖✨</div>
        <div>
          <h1 style={{ fontSize: 'var(--fs-xl)' }}>맞춤 활동지를 만드는 중</h1>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
            선택한 성취기준으로 AI가 오늘의 활동지를 구성하고 있어요.
          </p>
        </div>

        <div style={{ height: 12, borderRadius: 'var(--radius-full)', background: 'var(--color-surface-2)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              background: 'var(--color-primary)',
              transition: 'width var(--dur-base) var(--ease-standard)',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-sm)' }}>
          <span style={{ color: 'var(--color-primary)', fontWeight: 'var(--fw-bold)' }}>{MESSAGES[msgIdx]}</span>
          <span style={{ color: 'var(--color-text-muted)' }}>{pct}%</span>
        </div>
      </div>
    </main>
  );
}
