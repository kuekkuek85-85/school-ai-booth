'use client';
/** S0 회차 선택 — 두 콘텐츠 카드(세계관·차시 수·미션 수) + 접속 QR. */
import { useEffect, useState } from 'react';
import { useBoothSession } from '@/lib/booth/session';
import { BOOTH_ROUNDS, MISSIONS } from '@/lib/data/missions';
import { getContent } from '@/lib/data/content';
import { THEME_CLASS, type ContentId } from '@/lib/theme/tokens';
import QrCode from '@/components/common/QrCode';

const ORDER: ContentId[] = ['dotvalley', 'sos'];

export default function RoundSelect() {
  const { selectRound, profile } = useBoothSession();
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-6)',
        padding: 'var(--space-6) var(--space-5)',
      }}
    >
      <header style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 'var(--fs-2xl)' }}>회차를 선택하세요</h1>
        {profile && (
          <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
            {profile.school} · {profile.name} 님 환영합니다
          </p>
        )}
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-5)',
          width: '100%',
          maxWidth: 860,
        }}
      >
        {ORDER.map((cid) => {
          const r = BOOTH_ROUNDS[cid];
          const content = getContent(cid);
          const activities = content.lessons.reduce(
            (s, l) => s + l.activities.length,
            0,
          );
          return (
            <button
              key={cid}
              className={THEME_CLASS[cid]}
              onClick={() => selectRound(cid)}
              style={{
                textAlign: 'left',
                background: 'var(--color-surface)',
                border: '2px solid var(--color-primary)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                cursor: 'pointer',
                transition: 'transform var(--dur-fast) var(--ease-standard)',
              }}
            >
              <span
                style={{
                  alignSelf: 'flex-start',
                  fontSize: 'var(--fs-sm)',
                  fontWeight: 'var(--fw-bold)',
                  color: 'var(--color-primary-contrast)',
                  background: 'var(--color-primary)',
                  padding: 'var(--space-1) var(--space-3)',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {r.time} 회차
              </span>
              <h2 style={{ fontSize: 'var(--fs-lg)' }}>{r.title}</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--fs-sm)' }}>
                {r.worldview}
              </p>
              <dl
                style={{
                  display: 'flex',
                  gap: 'var(--space-5)',
                  marginTop: 'var(--space-2)',
                }}
              >
                <Stat label="차시" value={`${content.lessons.length}차시`} />
                <Stat label="추천 미션" value={`${MISSIONS[cid].length}개`} />
                <Stat label="활동" value={`${activities}개`} />
              </dl>
              <span
                style={{
                  marginTop: 'var(--space-2)',
                  color: 'var(--color-primary)',
                  fontWeight: 'var(--fw-bold)',
                }}
              >
                이 회차로 입장 →
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
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <dt style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)' }}>
        {label}
      </dt>
      <dd style={{ fontSize: 'var(--fs-md)', fontWeight: 'var(--fw-bold)' }}>{value}</dd>
    </div>
  );
}
