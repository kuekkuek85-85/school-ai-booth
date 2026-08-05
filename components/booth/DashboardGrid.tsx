'use client';
/** 회차별 참가자 × 미션3 완료 그리드 (프레젠테이셔널). 새로 완주한 행은 플래시. */
import type { DashboardRow } from '@/lib/booth/dashboard';
import { maskName } from '@/lib/booth/dashboard';

interface Props {
  rows: DashboardRow[];
  masked: boolean;
  flashing: Set<string>;
}

export default function DashboardGrid({ rows, masked, flashing }: Props) {
  if (rows.length === 0) {
    return <p style={{ color: 'var(--color-text-muted)' }}>아직 입장한 참가자가 없습니다.</p>;
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 480 }}>
        <thead>
          <tr>
            <Th align="left">성함</Th>
            <Th align="left">소속</Th>
            <Th>M1</Th>
            <Th>M2</Th>
            <Th>M3</Th>
            <Th>완료</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.uid} className={flashing.has(r.uid) ? 'row-flash' : undefined}>
              <Td align="left" bold>
                {masked ? maskName(r.name) : r.name}
              </Td>
              <Td align="left" muted>
                {r.school}
              </Td>
              <Cell done={r.m1} />
              <Cell done={r.m2} />
              <Cell done={r.m3} />
              <Td bold>
                <span style={{ color: r.done === 3 ? 'var(--color-primary)' : 'var(--color-text)' }}>{r.done}/3</span>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, align = 'center' }: { children: React.ReactNode; align?: 'left' | 'center' }) {
  return (
    <th
      style={{
        textAlign: align,
        padding: 'var(--space-2) var(--space-3)',
        borderBottom: '2px solid var(--color-border)',
        fontSize: 'var(--fs-sm)',
        color: 'var(--color-text-muted)',
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = 'center',
  bold,
  muted,
}: {
  children: React.ReactNode;
  align?: 'left' | 'center';
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <td
      style={{
        textAlign: align,
        padding: 'var(--space-2) var(--space-3)',
        borderBottom: '1px solid var(--color-border)',
        fontSize: 'var(--fs-md)',
        fontWeight: bold ? 'var(--fw-bold)' : 'var(--fw-normal)',
        color: muted ? 'var(--color-text-muted)' : 'var(--color-text)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </td>
  );
}

function Cell({ done }: { done: boolean }) {
  return (
    <Td>
      <span aria-label={done ? '완료' : '미완료'} style={{ fontSize: 'var(--fs-lg)' }}>
        {done ? '🏅' : '·'}
      </span>
    </Td>
  );
}
