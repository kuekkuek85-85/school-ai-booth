'use client';
/** S0 회차 선택 — 두 콘텐츠 색블록 카드(세계관·차시 수·미션 수) + 접속 QR. */
import { useEffect, useState } from 'react';
import { useBoothSession } from '@/lib/booth/session';
import { BOOTH_ROUNDS, MISSIONS } from '@/lib/data/missions';
import { getContent } from '@/lib/data/content';
import { activeRoundAt, ROUND_SWITCH } from '@/lib/booth/schedule';
import { THEME_CLASS, type ContentId } from '@/lib/theme/tokens';
import QrCode from '@/components/common/QrCode';

const ORDER: ContentId[] = ['dotvalley', 'sos'];

export default function RoundSelect() {
  const { selectRound, profile, isPresenter } = useBoothSession();
  const [origin, setOrigin] = useState('');
  const [activeRound, setActiveRound] = useState<ContentId | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
    const update = () => setActiveRound(activeRoundAt(new Date()));
    update();
    const id = window.setInterval(update, 30000); // 시각 전환 자동 반영
    return () => window.clearInterval(id);
  }, []);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-6)',
        padding: 'var(--space-8) var(--space-5)',
        background: 'var(--color-bg)',
      }}
    >
      <header style={{ textAlign: 'center', maxWidth: 760 }}>
        <p className="eyebrow" style={{ marginBottom: 'var(--space-3)' }}>
          Round Select
        </p>
        <h1 style={{ fontSize: 'var(--fs-2xl)', fontWeight: 'var(--fw-normal)' }}>회차를 선택하세요</h1>
        {profile && (
          <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
            {profile.school} · {profile.name} 님 환영합니다
          </p>
        )}
        {activeRound && (
          <p
            style={{
              marginTop: 'var(--space-4)',
              display: 'inline-block',
              fontSize: 'var(--fs-sm)',
              background: 'var(--block-lilac)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-2) var(--space-4)',
            }}
          >
            🕒 현재 활성 회차: <strong>{BOOTH_ROUNDS[activeRound].title}</strong>
            {isPresenter
              ? ' · 강사 모드: 모든 회차 선택 가능'
              : ` · ${ROUND_SWITCH.label} 기준 전환`}
          </p>
        )}
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-5)',
          width: '100%',
          maxWidth: 900,
        }}
      >
        {ORDER.map((cid) => {
          const r = BOOTH_ROUNDS[cid];
          const content = getContent(cid);
          const activities = content.lessons.reduce((s, l) => s + l.activities.length, 0);
          // 강사(발표자)는 항상 선택 가능. 수강생은 활성 회차만.
          const locked = !isPresenter && activeRound !== null && cid !== activeRound;
          const lockMsg =
            cid === 'sos' ? `🔒 ${ROUND_SWITCH.label}부터 활성화됩니다` : '🔒 마감된 회차입니다';
          return (
            <button
              key={cid}
              className={THEME_CLASS[cid]}
              onClick={() => !locked && selectRound(cid)}
              disabled={locked}
              aria-disabled={locked}
              style={{
                textAlign: 'left',
                background: locked ? 'var(--color-surface-2)' : 'var(--theme-block)',
                color: locked ? 'var(--color-text-muted)' : 'var(--color-text)',
                border: locked ? '1px solid var(--color-border)' : 'none',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-8)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                cursor: locked ? 'not-allowed' : 'pointer',
                opacity: locked ? 0.75 : 1,
                transition: 'transform var(--dur-fast) var(--ease-standard)',
              }}
            >
              <span className="eyebrow">{r.time} 회차</span>
              <h2 style={{ fontSize: 'var(--fs-xl)', fontWeight: 'var(--fw-bold)' }}>{r.title}</h2>
              <p style={{ fontSize: 'var(--fs-md)' }}>{r.worldview}</p>
              <dl style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-2)' }}>
                <Stat label="차시" value={`${content.lessons.length}차시`} />
                <Stat label="추천 미션" value={`${MISSIONS[cid].length}개`} />
                <Stat label="활동" value={`${activities}개`} />
              </dl>
              <span
                className={locked ? undefined : 'pill pill-primary'}
                style={{
                  alignSelf: 'flex-start',
                  marginTop: 'var(--space-3)',
                  ...(locked
                    ? { fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-sm)' }
                    : {}),
                }}
              >
                {locked ? lockMsg : '이 회차로 입장 →'}
              </span>
            </button>
          );
        })}
      </div>

      {origin && (
        <div style={{ marginTop: 'var(--space-4)' }}>
          <QrCode value={origin} caption="접속 QR (이 부스 주소)" size={160} />
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      <dt className="caption">{label}</dt>
      <dd style={{ fontSize: 'var(--fs-md)', fontWeight: 'var(--fw-bold)' }}>{value}</dd>
    </div>
  );
}
