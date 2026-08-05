'use client';
/** S0 회차 선택 — 두 콘텐츠 카드(세계관·차시 수·미션 수) + 접속 QR. */
import { useEffect, useState } from 'react';
import { useBoothSession } from '@/lib/booth/session';
import { BOOTH_ROUNDS, MISSIONS } from '@/lib/data/missions';
import { getContent } from '@/lib/data/content';
import { activeRoundAt, ROUND_SWITCH } from '@/lib/booth/schedule';
import { THEME_CLASS, type ContentId } from '@/lib/theme/tokens';
import QrCode from '@/components/common/QrCode';
import AuroraBackdrop from '@/components/reactbits/AuroraBackdrop';
import GradientText from '@/components/reactbits/GradientText';
import SpotlightCard from '@/components/reactbits/SpotlightCard';

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
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-6)',
        padding: 'var(--space-6) var(--space-5)',
      }}
    >
      <AuroraBackdrop colorStops={['#34d399', '#22d3ee', '#fbbf24']} amplitude={1.2} />
      <header style={{ textAlign: 'center' }}>
        <GradientText
          as="h1"
          colors={['#34d399', '#22d3ee', '#fbbf24', '#34d399']}
          animationSpeed={8}
          style={{ fontSize: 'var(--fs-3xl)', fontWeight: 'var(--fw-bold)' }}
        >
          회차를 선택하세요
        </GradientText>
        {profile && (
          <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: 'var(--space-2)' }}>
            {profile.school} · {profile.name} 님 환영합니다
          </p>
        )}
        {activeRound && (
          <p
            className="glass-panel"
            style={{
              marginTop: 'var(--space-3)',
              display: 'inline-block',
              fontSize: 'var(--fs-sm)',
              borderRadius: 'var(--radius-full)',
              padding: 'var(--space-2) var(--space-4)',
            }}
          >
            🕒 현재 활성 회차: <strong>{BOOTH_ROUNDS[activeRound].title}</strong>
            {isPresenter
              ? ' · 강사 모드: 모든 회차 선택 가능'
              : ` · ${ROUND_SWITCH.label} 기준으로 도트밸리 → 세계수 전환`}
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
          // 강사(발표자)는 항상 선택 가능. 수강생은 활성 회차만.
          const locked = !isPresenter && activeRound !== null && cid !== activeRound;
          const lockMsg =
            cid === 'sos' ? `🔒 ${ROUND_SWITCH.label}부터 활성화됩니다` : '🔒 마감된 회차입니다';
          return (
            <SpotlightCard
              key={cid}
              className={THEME_CLASS[cid]}
              spotlightColor={locked ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.35)'}
              style={{ borderRadius: 'var(--radius-lg)', display: 'flex' }}
            >
            <button
              className={THEME_CLASS[cid]}
              onClick={() => !locked && selectRound(cid)}
              disabled={locked}
              aria-disabled={locked}
              style={{
                width: '100%',
                textAlign: 'left',
                background: locked ? 'var(--color-surface-2)' : 'var(--color-surface)',
                border: `2px solid ${locked ? 'var(--color-border)' : 'var(--color-primary)'}`,
                borderRadius: 'var(--radius-lg)',
                boxShadow: locked
                  ? 'none'
                  : '0 0 0 1px color-mix(in srgb, var(--color-primary) 40%, transparent), 0 18px 48px -14px color-mix(in srgb, var(--color-primary) 65%, transparent)',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                cursor: locked ? 'not-allowed' : 'pointer',
                opacity: locked ? 0.6 : 1,
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
                  color: locked ? 'var(--color-text-muted)' : 'var(--color-primary)',
                  fontWeight: 'var(--fw-bold)',
                }}
              >
                {locked ? lockMsg : '이 회차로 입장 →'}
              </span>
            </button>
            </SpotlightCard>
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
