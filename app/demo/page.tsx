'use client';
import { DemoSessionProvider, useDemoSession } from '@/lib/demo/session';
import Entry from '@/components/demo/Entry';
import LessonHome from '@/components/demo/LessonHome';

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
  return <LessonHome />;
}
