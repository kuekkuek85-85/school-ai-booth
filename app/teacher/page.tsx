'use client';
/** 부스 강사 대시보드 — PIN 진입, 회차 탭, 참가자×미션3 그리드, 마스킹, 회차 리셋(파기). */
import { useState } from 'react';
import PinGate from '@/components/common/PinGate';
import DashboardGrid from '@/components/booth/DashboardGrid';
import KpiTiles from '@/components/common/KpiTiles';
import Toasts from '@/components/common/Toasts';
import { resetBoothSession, useBoothDashboard } from '@/lib/booth/dashboard';
import { useCompletionAlerts } from '@/lib/common/useCompletionAlerts';
import PresenterControls from '@/components/booth/PresenterControls';
import { BOOTH_ROUNDS } from '@/lib/data/missions';
import { THEME_CLASS, type ContentId } from '@/lib/theme/tokens';

const TABS: ContentId[] = ['dotvalley', 'sos'];

export default function TeacherPage() {
  return (
    <PinGate>
      <Dashboard />
    </PinGate>
  );
}

function Dashboard() {
  const [tab, setTab] = useState<ContentId>('dotvalley');
  const [masked, setMasked] = useState(false);
  const [resetting, setResetting] = useState(false);
  const round = BOOTH_ROUNDS[tab];

  const { rows, count } = useBoothDashboard(round.sessionId);
  const completed = rows.filter((r) => r.done === 3).length;
  const avgStamp = count ? (rows.reduce((s, r) => s + r.done, 0) / count).toFixed(1) : '0';
  const { flashing, toasts } = useCompletionAlerts(
    rows.map((r) => ({ uid: r.uid, done: r.done === 3, name: r.name })),
  );

  async function onReset() {
    if (!window.confirm(`${round.time} ${round.title} 회차 데이터를 모두 삭제(파기)할까요?`)) return;
    setResetting(true);
    try {
      await resetBoothSession(round.sessionId);
    } catch (e) {
      console.error(e);
      window.alert('리셋 중 오류가 발생했습니다.');
    } finally {
      setResetting(false);
    }
  }

  return (
    <main className={THEME_CLASS[tab]} style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
          padding: 'var(--space-3) var(--space-5)',
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <h1 style={{ fontSize: 'var(--fs-xl)', fontWeight: 'var(--fw-bold)' }}>강사 대시보드</h1>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {TABS.map((cid) => {
            const r = BOOTH_ROUNDS[cid];
            const active = cid === tab;
            return (
              <button
                key={cid}
                onClick={() => setTab(cid)}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: active ? 'var(--fw-bold)' : 'var(--fw-normal)',
                  color: active ? 'var(--color-primary-contrast)' : 'var(--color-text-muted)',
                  background: active ? 'var(--color-primary)' : 'var(--color-surface-2)',
                }}
              >
                {r.time} {r.title}
              </button>
            );
          })}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <PresenterControls sessionId={round.sessionId} contentId={tab} contentTitle={round.title} />
          <button
            onClick={() => setMasked((v) => !v)}
            style={toolBtn}
            aria-pressed={masked}
          >
            이름 마스킹 {masked ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={onReset}
            disabled={resetting}
            style={{ ...toolBtn, color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
          >
            {resetting ? '리셋 중…' : '회차 리셋(파기)'}
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'var(--space-6) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <KpiTiles
          items={[
            { label: '참가자', value: `${count}명` },
            { label: '완주(3/3)', value: `${completed}명`, sub: `${count ? Math.round((completed / count) * 100) : 0}%`, accent: true },
            { label: '평균 도장', value: `${avgStamp}`, sub: '/ 3' },
          ]}
        />
        <DashboardGrid rows={rows} masked={masked} flashing={flashing} />
      </div>
      <Toasts toasts={toasts} />
    </main>
  );
}

const toolBtn: React.CSSProperties = {
  padding: 'var(--space-2) var(--space-3)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  fontSize: 'var(--fs-sm)',
  color: 'var(--color-text)',
  background: 'var(--color-surface)',
};
