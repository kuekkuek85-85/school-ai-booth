'use client';
/** 동료 현황판 — 이름·현재 단계만 공개(제출 내용 비공개). */
import { useDemoSession } from '@/lib/demo/session';
import { useDemoDashboard } from '@/lib/demo/dashboard';

export default function PeerBoard() {
  const { sessionId } = useDemoSession();
  const { rows, count } = useDemoDashboard(sessionId);

  return (
    <section
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4) var(--space-5)',
      }}
    >
      <h3 style={{ fontSize: 'var(--fs-md)', marginBottom: 'var(--space-3)' }}>
        동료 현황판 <span style={{ color: 'var(--color-text-muted)', fontWeight: 'var(--fw-normal)' }}>({count}명)</span>
      </h3>
      {count === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--fs-sm)' }}>
          아직 참여자가 없습니다.
        </p>
      ) : (
        <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', listStyle: 'none' }}>
          {rows.map((r) => (
            <li
              key={r.uid}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-3)',
                background: 'var(--color-surface-2)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--fs-sm)',
              }}
            >
              <strong>{r.name}</strong>
              <span style={{ color: 'var(--color-text-muted)' }}>{r.currentLabel}</span>
              <span style={{ color: 'var(--color-primary)', fontWeight: 'var(--fw-bold)' }}>
                {r.completed}/5
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
