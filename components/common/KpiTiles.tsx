'use client';
/** 요약 KPI 타일 행 — 큰 숫자로 핵심 지표 표시. */
export interface Kpi {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

export default function KpiTiles({ items }: { items: Kpi[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(150px, 1fr))`,
        gap: 'var(--space-3)',
      }}
    >
      {items.map((k) => (
        <div
          key={k.label}
          style={{
            background: k.accent ? 'var(--color-primary)' : 'var(--color-surface)',
            color: k.accent ? 'var(--color-primary-contrast)' : 'var(--color-text)',
            border: `1px solid ${k.accent ? 'var(--color-primary)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            padding: 'var(--space-4) var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <span style={{ fontSize: 'var(--fs-sm)', opacity: 0.85 }}>{k.label}</span>
          <span style={{ fontSize: 'var(--fs-3xl)', fontWeight: 'var(--fw-bold)', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
            {k.value}
          </span>
          {k.sub && <span style={{ fontSize: 'var(--fs-xs)', opacity: 0.8 }}>{k.sub}</span>}
        </div>
      ))}
    </div>
  );
}
