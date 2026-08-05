'use client';
/** 상단 고정 바 — 회차명 · 섹션 내비 · 타이머 · 빔 모드 토글. */
import Timer from '@/components/booth/Timer';
import { BOOTH_ROUNDS } from '@/lib/data/missions';
import type { ContentId } from '@/lib/theme/tokens';

export interface SectionMeta {
  id: string;
  label: string;
}

interface Props {
  round: ContentId;
  sections: SectionMeta[];
  index: number;
  goTo: (i: number) => void;
  beam: boolean;
  toggleBeam: () => void;
  onExitRound: () => void;
}

export default function TopBar({
  round,
  sections,
  index,
  goTo,
  beam,
  toggleBeam,
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
        {r.title}
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <Timer label="세션" durationSec={30 * 60} autoStart />
        <Timer label="미션" durationSec={18 * 60} />
        <button
          onClick={toggleBeam}
          title="빔 모드(폰트 확대) — 단축키 P"
          style={{
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border)',
            fontSize: 'var(--fs-sm)',
            fontWeight: 'var(--fw-medium)',
            color: beam ? 'var(--color-primary-contrast)' : 'var(--color-text-muted)',
            background: beam ? 'var(--color-primary)' : 'transparent',
          }}
        >
          빔 {beam ? 'ON' : 'OFF'}
        </button>
      </div>
    </header>
  );
}
