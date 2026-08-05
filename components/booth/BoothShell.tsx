'use client';
/**
 * 부스 진행 셸 — 상단바 + 섹션(S1~S5) 슬라이드.
 * 발표 모드 키보드 내비/빔 모드. 섹션 내용은 T08(미션보드)·T09(오프닝·사례·자료실)·T14(그래프)에서 채운다.
 */
import { useBoothSession } from '@/lib/booth/session';
import { usePresenterNav } from '@/lib/booth/presenter';
import TopBar, { type SectionMeta } from '@/components/booth/TopBar';
import MissionBoard from '@/components/booth/MissionBoard';
import { THEME_CLASS } from '@/lib/theme/tokens';

const SECTIONS: SectionMeta[] = [
  { id: 'opening', label: '오프닝' },
  { id: 'missions', label: '미션 보드' },
  { id: 'graph', label: '지식그래프' },
  { id: 'case', label: '학교 적용 사례' },
  { id: 'resources', label: '자료실' },
];

export default function BoothShell() {
  const { round, clearRound } = useBoothSession();
  const { index, goTo, beam, toggleBeam } = usePresenterNav(SECTIONS.length);
  const graphIndex = SECTIONS.findIndex((s) => s.id === 'graph');
  if (!round) return null;

  return (
    <div
      className={`${THEME_CLASS[round]} ${beam ? 'beam-mode' : ''}`}
      style={{ minHeight: '100vh', background: 'var(--color-bg)' }}
    >
      <TopBar
        round={round}
        sections={SECTIONS}
        index={index}
        goTo={goTo}
        beam={beam}
        toggleBeam={toggleBeam}
        onExitRound={clearRound}
      />
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: 'var(--space-6) var(--space-5)' }}>
        {SECTIONS[index].id === 'missions' ? (
          <MissionBoard onExplore={() => goTo(graphIndex)} />
        ) : (
          <SectionPlaceholder id={SECTIONS[index].id} label={SECTIONS[index].label} />
        )}
      </div>
    </div>
  );
}

/** T08·T09·T14에서 실제 섹션 컴포넌트로 교체될 자리 */
function SectionPlaceholder({ id, label }: { id: string; label: string }) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-3)',
        minHeight: '60vh',
        textAlign: 'center',
      }}
    >
      <h2 style={{ fontSize: 'var(--fs-2xl)' }}>{label}</h2>
      <p style={{ color: 'var(--color-text-muted)' }}>
        섹션 <code>{id}</code> — 이후 태스크에서 구현됩니다. (←/→·스페이스로 이동, P로 빔 모드)
      </p>
    </section>
  );
}
