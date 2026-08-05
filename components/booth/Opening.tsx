'use client';
/** S1 오프닝 — 세계관 요약 · 진행 4단계 · 두 활용 경로 차이. */
import { useBoothSession } from '@/lib/booth/session';
import { BOOTH_ROUNDS } from '@/lib/data/missions';
import { getContent } from '@/lib/data/content';

const STEPS = ['접수 · 입장', '콘텐츠 체험', '학교 적용 사례', '의견조사 · 기념품'];

export default function Opening({ onExploreGraph }: { onExploreGraph?: () => void }) {
  const { round } = useBoothSession();
  if (!round) return null;
  const r = BOOTH_ROUNDS[round];
  const content = getContent(round);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h2 style={{ fontSize: 'var(--fs-2xl)' }}>{r.title}</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)', fontSize: 'var(--fs-lg)' }}>
          {r.worldview}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
          {r.characters.map((c) => (
            <span
              key={c}
              style={{
                padding: 'var(--space-1) var(--space-3)',
                borderRadius: 'var(--radius-full)',
                background: 'var(--theme-tint, var(--color-surface-2))',
                border: '1px solid var(--color-primary)',
                color: 'var(--color-primary)',
                fontSize: 'var(--fs-sm)',
                fontWeight: 'var(--fw-medium)',
              }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* 진행 4단계 */}
      <div>
        <h3 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--space-3)' }}>오늘의 진행 4단계</h3>
        <ol style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', listStyle: 'none' }}>
          {STEPS.map((s, i) => (
            <li
              key={s}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-primary)',
                  color: 'var(--color-primary-contrast)',
                  fontSize: 'var(--fs-sm)',
                  fontWeight: 'var(--fw-bold)',
                }}
              >
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      {/* 두 활용 경로 차이 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <PathCard
          badge="전환기 교육"
          title="학습 도장 모으기 — 통째로 완주"
          desc="전체 차시를 순서대로 완주하면 이수증 발급. 기말 이후 전환기 수업에 적합."
          href={content.originUrl}
          cta="학습 도장 모으기 열기 ↗"
        />
        <PathCard
          badge="정규수업 재구성"
          title="성취기준에서 출발 — 딥링크 체험"
          desc="필요한 성취기준의 활동만 뽑아 재조합. 오늘은 이 경로로 미션을 체험합니다."
          onClick={onExploreGraph}
          cta="지식그래프로 →"
          highlight
        />
      </div>
    </section>
  );
}

function PathCard({
  badge,
  title,
  desc,
  href,
  onClick,
  cta = '열기 ↗',
  highlight,
}: {
  badge: string;
  title: string;
  desc: string;
  href?: string;
  onClick?: () => void;
  cta?: string;
  highlight?: boolean;
}) {
  const cardStyle: React.CSSProperties = {
    textAlign: 'left',
    width: '100%',
    padding: 'var(--space-5)',
    borderRadius: 'var(--radius-lg)',
    background: highlight ? 'var(--theme-tint, var(--color-surface-2))' : 'var(--color-surface)',
    border: `2px solid ${highlight ? 'var(--color-primary)' : 'var(--color-border)'}`,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
    cursor: 'pointer',
    transition: 'box-shadow var(--dur-fast) var(--ease-standard)',
    boxShadow: 'var(--shadow-sm)',
  };

  const inner = (
    <>
      <span
        style={{
          alignSelf: 'flex-start',
          fontSize: 'var(--fs-xs)',
          fontWeight: 'var(--fw-bold)',
          color: 'var(--color-primary)',
        }}
      >
        {badge}
      </span>
      <h4 style={{ fontSize: 'var(--fs-md)' }}>{title}</h4>
      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)' }}>{desc}</p>
      <span style={{ marginTop: 'auto', fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-bold)', color: 'var(--color-primary)' }}>
        {cta}
      </span>
    </>
  );

  // 내부 이동(딥링크 체험 → 지식그래프)
  if (onClick) {
    return (
      <button type="button" onClick={onClick} style={cardStyle}>
        {inner}
      </button>
    );
  }
  // 외부 링크(학습 도장 모으기 → 콘텐츠 원본, 새 탭)
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={cardStyle}>
      {inner}
    </a>
  );
}
