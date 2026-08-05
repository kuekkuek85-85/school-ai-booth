'use client';
/** 상단 고정 바 — 회차명 · 섹션 내비. */
import { BOOTH_ROUNDS } from '@/lib/data/missions';
import type { ContentId } from '@/lib/theme/tokens';
import GradientText from '@/components/reactbits/GradientText';

const TITLE_COLORS: Record<ContentId, string[]> = {
  dotvalley: ['#16a34a', '#4ade80', '#22d3ee', '#16a34a'],
  sos: ['#d97706', '#fbbf24', '#f59e0b', '#d97706'],
};

export interface SectionMeta {
  id: string;
  label: string;
}

interface Props {
  round: ContentId;
  sections: SectionMeta[];
  index: number;
  goTo: (i: number) => void;
  onExitRound: () => void;
}

export default function TopBar({
  round,
  sections,
  index,
  goTo,
  onExitRound,
}: Props) {
  const r = BOOTH_ROUNDS[round];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-2) var(--space-4)',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        flexWrap: 'wrap',
      }}
    >
      <button
        onClick={onExitRound}
        title="회차 다시 선택"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          fontWeight: 'var(--fw-bold)',
          color: 'var(--color-primary)',
        }}
      >
        <span
          style={{
            fontSize: 'var(--fs-xs)',
            color: 'var(--color-primary-contrast)',
            background: 'var(--color-primary)',
            padding: '2px var(--space-2)',
            borderRadius: 'var(--radius-full)',
          }}
        >
          {r.time}
        </span>
        <GradientText colors={TITLE_COLORS[round]} animationSpeed={9} style={{ fontWeight: 'var(--fw-bold)' }}>
          {r.title}
        </GradientText>
      </button>

      <nav
        style={{
          display: 'flex',
          gap: 'var(--space-1)',
          flexWrap: 'wrap',
          flex: 1,
          minWidth: 240,
        }}
      >
        {sections.map((s, i) => {
          const active = i === index;
          return (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              aria-current={active ? 'step' : undefined}
              style={{
                padding: 'var(--space-1) var(--space-3)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--fs-sm)',
                fontWeight: active ? 'var(--fw-bold)' : 'var(--fw-normal)',
                color: active
                  ? 'var(--color-primary-contrast)'
                  : 'var(--color-text-muted)',
                background: active ? 'var(--color-primary)' : 'transparent',
              }}
            >
              {i + 1}. {s.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
