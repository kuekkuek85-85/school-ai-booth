'use client';
/** 참여자 × 5단계 완료 그리드 (onSnapshot 실시간). */
import type { DemoRow } from '@/lib/demo/dashboard';
import { DEMO_STEPS } from '@/lib/data/missions';
import { maskName } from '@/lib/booth/dashboard';

export default function DemoGrid({ rows, masked }: { rows: DemoRow[]; masked: boolean }) {
  if (rows.length === 0) {
    return <p style={{ color: 'var(--color-text-muted)' }}>아직 입장한 참여자가 없습니다.</p>;
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 520 }}>
        <thead>
          <tr>
            <th style={{ ...cell, textAlign: 'left', color: 'var(--color-text-muted)' }}>이름</th>
            {DEMO_STEPS.map((s) => (
              <th key={s.id} style={{ ...cell, color: 'var(--color-text-muted)', fontSize: 'var(--fs-xs)' }}>
                {s.label}
              </th>
            ))}
            <th style={{ ...cell, color: 'var(--color-text-muted)' }}>완료</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.uid}>
              <td style={{ ...cell, textAlign: 'left', fontWeight: 'var(--fw-bold)', whiteSpace: 'nowrap' }}>
                {masked ? maskName(r.name) : r.name}
              </td>
              {DEMO_STEPS.map((s) => (
                <td key={s.id} style={cell}>
                  {r.steps[s.id] ? '✅' : '·'}
                </td>
              ))}
              <td style={{ ...cell, fontWeight: 'var(--fw-bold)', color: r.completed === 5 ? 'var(--color-primary)' : 'var(--color-text)' }}>
                {r.completed}/5
              </td>
            </tr>
          ))}
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
