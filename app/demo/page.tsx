'use client';
import { DemoSessionProvider, useDemoSession } from '@/lib/demo/session';
import { useWorksheet } from '@/lib/demo/useWorksheet';
import Entry from '@/components/demo/Entry';
import LessonHome from '@/components/demo/LessonHome';
import WorksheetLoading from '@/components/demo/WorksheetLoading';

export default function DemoPage() {
  return (
    <DemoSessionProvider>
      <PhaseSwitch />
    </DemoSessionProvider>
  );
}

function PhaseSwitch() {
  const { ready, profile } = useDemoSession();

  if (!ready) {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>불러오는 중…</p>
      </main>
    );
  }
  if (!profile) return <Entry />;
  return <WorksheetGate />;
}

/** 입장 후: 활동지 동적 생성(로딩바) → 완료 시 차시 렌더 */
function WorksheetGate() {
  const { sessionId, profile } = useDemoSession();
  const { spec } = useWorksheet(sessionId, !!profile);
  if (!spec) return <WorksheetLoading />;
  return <LessonHome spec={spec} />;
}
