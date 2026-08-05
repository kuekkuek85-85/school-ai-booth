'use client';
/** 내 진행 바 — 5단계 완료율. 전체 완료 시 축하 표시. */
import { useDemoProgress } from '@/lib/demo/progress';

export default function ProgressBar({ total }: { total: number }) {
  const { completed } = useDemoProgress();
  const safeTotal = Math.max(1, total);
  const done = Math.min(completed, safeTotal);
  const pct = Math.round((done / safeTotal) * 100);
  const allDone = done >= safeTotal;

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4) var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: 'var(--fs-sm)' }}>
          {allDone ? '🎉 모든 단계 완료! 수고했어요' : '내 진행'}
        </strong>
        <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)' }}>
          {done} / {safeTotal} 단계
        </span>
      </div>
      <div
        style={{
          height: 10,
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-surface-2)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: 'var(--color-primary)',
            transition: 'width var(--dur-base) var(--ease-standard)',
          }}
        />
      </div>
    </div>
  );
}
