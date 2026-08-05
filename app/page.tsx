'use client';
import { BoothSessionProvider, useBoothSession } from '@/lib/booth/session';
import EntryGate from '@/components/booth/EntryGate';
import RoundSelect from '@/components/booth/RoundSelect';
import BoothShell from '@/components/booth/BoothShell';

export default function BoothHomePage() {
  return (
    <BoothSessionProvider>
      <PhaseSwitch />
    </BoothSessionProvider>
  );
}

function PhaseSwitch() {
  const { ready, profile, round, isPresenter } = useBoothSession();

  if (!ready) {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>불러오는 중…</p>
      </main>
    );
  }
  if (!isPresenter && !profile) return <EntryGate />;
  if (!round) return <RoundSelect />;
  return <BoothShell />;
}
