'use client';
/** 참여자 진행 그리드 (가변 단계) — 진행 바 + 완료 n/N + 현재 단계 + 형성평가 제출. */
import type { DemoRow } from '@/lib/demo/dashboard';
import { maskName } from '@/lib/booth/dashboard';

export default function DemoGrid({
  rows,
  masked,
  flashing,
}: {
  rows: DemoRow[];
  masked: boolean;
  flashing?: Set<string>;
}) {
  if (rows.length === 0) {
    return <p style={{ color: 'var(--color-text-muted)' }}>아직 입장한 참여자가 없습니다.</p>;
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 520 }}>
        <thead>
          <tr>
            <th style={{ ...cell, textAlign: 'left', color: 'var(--color-text-muted)' }}>이름</th>
            <th style={{ ...cell, textAlign: 'left', color: 'var(--color-text-muted)', width: '40%' }}>진행</th>
            <th style={{ ...cell, color: 'var(--color-text-muted)' }}>현재 단계</th>
            <th style={{ ...cell, color: 'var(--color-text-muted)' }}>형성평가</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const pct = r.total ? Math.round((r.completed / r.total) * 100) : 0;
            return (
              <tr key={r.uid} className={flashing?.has(r.uid) ? 'row-flash' : undefined}>
                <td style={{ ...cell, textAlign: 'left', fontWeight: 'var(--fw-bold)', whiteSpace: 'nowrap' }}>
                  {masked ? maskName(r.name) : r.name}
                </td>
                <td style={cell}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <div style={{ flex: 1, height: 8, borderRadius: 'var(--radius-full)', background: 'var(--color-surface-2)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-primary)' }} />
                    </div>
                    <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-bold)', whiteSpace: 'nowrap' }}>
                      {r.completed}/{r.total}
                    </span>
                  </div>
                </td>
                <td style={{ ...cell, fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)' }}>{r.currentLabel}</td>
                <td style={cell}>{r.quiz ? '✅' : '·'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const cell: React.CSSProperties = {
  textAlign: 'center',
  padding: 'var(--space-2) var(--space-3)',
  borderBottom: '1px solid var(--color-border)',
  fontSize: 'var(--fs-sm)',
};
