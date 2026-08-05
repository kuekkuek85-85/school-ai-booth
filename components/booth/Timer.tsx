'use client';
/** 카운트다운 타이머 — 세션 30분 / 미션 18분. 3분 전 경고색, 0 도달 시 위험색. */
import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  label: string;
  durationSec: number;
  warnSec?: number; // 이 값 이하로 남으면 경고색 (기본 180초 = 3분)
  autoStart?: boolean;
}

function fmt(sec: number): string {
  const s = Math.max(0, sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

export default function Timer({
  label,
  durationSec,
  warnSec = 180,
  autoStart = false,
}: Props) {
  const [remaining, setRemaining] = useState(durationSec);
  const [running, setRunning] = useState(autoStart);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (ref.current) clearInterval(ref.current);
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [running]);

  const reset = useCallback(() => {
    setRunning(false);
    setRemaining(durationSec);
  }, [durationSec]);

  const color =
    remaining <= 0
      ? 'var(--color-danger)'
      : remaining <= warnSec
        ? 'var(--color-warning)'
        : 'var(--color-text)';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
      }}
    >
      <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)' }}>
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-lg)',
          fontWeight: 'var(--fw-bold)',
          color,
          fontVariantNumeric: 'tabular-nums',
          minWidth: '4.2ch',
          textAlign: 'center',
        }}
        aria-live="off"
      >
        {fmt(remaining)}
      </span>
      <button
        onClick={() => setRunning((v) => !v)}
        title={running ? '일시정지' : '시작'}
        style={btnStyle}
      >
        {running ? '⏸' : '▶'}
      </button>
      <button onClick={reset} title="리셋" style={btnStyle}>
        ↺
      </button>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
  fontSize: 'var(--fs-sm)',
  lineHeight: 1,
};
