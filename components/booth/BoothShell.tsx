'use client';
/**
 * 부스 진행 셸 — 상단바 + 섹션(S1~S5) 슬라이드.
 * 발표 모드 키보드 내비/빔 모드. 섹션 내용은 T08(미션보드)·T09(오프닝·사례·자료실)·T14(그래프)에서 채운다.
 */
import { useBoothSession } from '@/lib/booth/session';
import { usePresenterNav } from '@/lib/booth/presenter';
import dynamic from 'next/dynamic';
import TopBar, { type SectionMeta } from '@/components/booth/TopBar';
import MissionBoard from '@/components/booth/MissionBoard';
import Opening from '@/components/booth/Opening';
import CaseStudy from '@/components/booth/CaseStudy';
import Closing from '@/components/booth/Closing';
import { THEME_CLASS } from '@/lib/theme/tokens';

// 3D 그래프는 WebGL 클라이언트 전용 → SSR 비활성
const KnowledgeGraph = dynamic(() => import('@/components/booth/KnowledgeGraph'), {
  ssr: false,
  loading: () => (
    <p style={{ color: 'var(--color-text-muted)', padding: 'var(--space-6)', textAlign: 'center' }}>
      지식그래프 불러오는 중…
    </p>
  ),
});

const SECTIONS: SectionMeta[] = [
  { id: 'opening', label: '오프닝' },
  { id: 'missions', label: '미션 보드' },
  { id: 'graph', label: '지식그래프' },
  { id: 'case', label: '학교 적용 사례' },
  { id: 'resources', label: '자료실' },
];

export default function BoothShell() {
  const { round, clearRound } = useBoothSession();
  const { index, goTo } = usePresenterNav(SECTIONS.length);
  const graphIndex = SECTIONS.findIndex((s) => s.id === 'graph');
  if (!round) return null;

  return (
    <div
      className={THEME_CLASS[round]}
      style={{ minHeight: '100vh', background: 'var(--color-bg)' }}
    >
      <TopBar
        round={round}
        sections={SECTIONS}
        index={index}
        goTo={goTo}
        onExitRound={clearRound}
      />
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: 'var(--space-6) var(--space-5)' }}>
        {renderSection(SECTIONS[index].id, () => goTo(graphIndex))}
      </div>
    </div>
  );
}

function renderSection(id: string, goGraph: () => void) {
  switch (id) {
    case 'opening':
      return <Opening />;
    case 'missions':
      return <MissionBoard onExplore={goGraph} />;
    case 'case':
      return <CaseStudy onExploreGraph={goGraph} />;
    case 'resources':
      return <Closing />;
    case 'graph':
      return <KnowledgeGraph />;
    default:
      return null;
  }
}
