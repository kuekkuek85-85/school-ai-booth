'use client';
import { BoothSessionProvider, useBoothSession } from '@/lib/booth/session';
import EntryGate from '@/components/booth/EntryGate';
import RoundSelect from '@/components/booth/RoundSelect';
import { BOOTH_ROUNDS } from '@/lib/data/missions';
import { THEME_CLASS } from '@/lib/theme/tokens';

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
  return <BoothShellPlaceholder />;
}

/** T07~T09에서 상단바·미션보드·사례·자료실로 대체될 자리 */
function BoothShellPlaceholder() {
  const { round, profile, isPresenter, clearRound } = useBoothSession();
  if (!round) return null;
  const r = BOOTH_ROUNDS[round];

  return (
    <main
      className={THEME_CLASS[round]}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-6)',
        textAlign: 'center',
      }}
    >
      <span
        style={{
          fontSize: 'var(--fs-sm)',
          fontWeight: 'var(--fw-bold)',
          color: 'var(--color-primary-contrast)',
          background: 'var(--color-primary)',
          padding: 'var(--space-1) var(--space-3)',
          borderRadius: 'var(--radius-full)',
        }}
      >
        {r.time} · {r.title}
      </span>
      <h1 style={{ fontSize: 'var(--fs-2xl)' }}>입장 완료</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>
        {isPresenter ? '강사 모드' : `${profile?.school} · ${profile?.name}`} — 부스
        진행 화면(오프닝·미션보드·사례·자료실)은 T07~T09에서 구현됩니다.
      </p>
      <button
        onClick={clearRound}
        style={{
          marginTop: 'var(--space-3)',
          padding: 'var(--space-2) var(--space-4)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-text-muted)',
        }}
      >
        회차 다시 선택
      </button>
    </main>
  );
}
