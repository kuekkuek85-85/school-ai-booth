'use client';
/** S2 체험 미션 보드 — 회차별 추천 미션 3개 + 3개 완료 배지 + 자유 탐험 안내. */
import { useBoothSession } from '@/lib/booth/session';
import { useBoothProgress } from '@/lib/booth/progress';
import MissionCard from '@/components/booth/MissionCard';
import { MISSIONS, type MissionId } from '@/lib/data/missions';

interface Props {
  /** 자유 탐험(지식그래프 섹션)으로 이동 */
  onExplore?: () => void;
}

export default function MissionBoard({ onExplore }: Props) {
  const { round } = useBoothSession();
  const { progress, toggle, completedCount } = useBoothProgress();
  if (!round) return null;

  const missions = MISSIONS[round];
  const allDone = completedCount >= 3;

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--fs-2xl)' }}>체험 미션 보드</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            추천 미션 3개를 체험하고 완료 도장을 찍어보세요.
          </p>
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-full)',
            background: allDone ? 'var(--color-primary)' : 'var(--color-surface-2)',
            color: allDone ? 'var(--color-primary-contrast)' : 'var(--color-text)',
            fontWeight: 'var(--fw-bold)',
          }}
        >
          {allDone ? '🎉 3개 완료 배지 획득!' : `도장 ${completedCount} / 3`}
        </div>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--space-4)',
          alignItems: 'stretch',
        }}
      >
        {missions.map((m) => (
          <MissionCard
            key={m.id}
            contentId={round}
            mission={m}
            done={progress[m.id as MissionId]}
            onToggle={() => toggle(m.id)}
          />
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-4)',
          background: 'var(--color-surface)',
          border: '1px dashed var(--color-border)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <span style={{ color: 'var(--color-text-muted)' }}>
          더 찾아보고 싶다면? 성취기준에서 활동까지 자유 탐험
        </span>
        {onExplore && (
          <button
            onClick={onExplore}
            style={{
              fontWeight: 'var(--fw-bold)',
              color: 'var(--color-primary)',
            }}
          >
            지식그래프로 →
          </button>
        )}
      </div>
    </section>
  );
}
