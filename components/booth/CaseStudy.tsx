'use client';
/** S4 학교 적용 사례 — 전환기 완주 · 정규수업 재구성(시연 웹앱) · 공개수업 실전 사례. */
import Link from 'next/link';
import { DEMO_LESSON_URL } from '@/lib/constants';
import { useBoothSession } from '@/lib/booth/session';
import { getContent } from '@/lib/data/content';
import DeckStudio from '@/components/booth/DeckStudio';

interface Props {
  /** 지식그래프 섹션으로 이동(재구성 시연) */
  onExploreGraph?: () => void;
}

export default function CaseStudy({ onExploreGraph }: Props) {
  const { round } = useBoothSession();
  const stampUrl = round ? getContent(round).mapUrl : undefined;

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div>
        <h2 style={{ fontSize: 'var(--fs-2xl)' }}>학교 적용 사례 & 수업 설계</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
          체험한 콘텐츠를 내 정보 수업에 어떻게 녹일까?
        </p>
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        {/* 1. 전환기 완주 → 학습 도장 모으기 페이지(새 탭) */}
        <CaseCard n={1} badge="전환기 교육" title="통째로 완주 — 학습 도장 모으기 + 이수증" href={stampUrl}>
          <p style={pStyle}>
            전체 차시를 순서대로 완주하면 이수증 발급. 운영 팁: 학습 중 이탈 시 처음부터 →
            차시 단위 운영 권장, 이수증은 PDF로도 저장, 모바일 학습은 불가(데스크톱/노트북/태블릿).
          </p>
          <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-bold)', color: 'var(--color-primary)' }}>
            학습 도장 모으기 열기 ↗
          </span>
        </CaseCard>

        {/* 2. 정규수업 재구성 → 시연 웹앱 */}
        <CaseCard n={2} badge="정규수업 재구성" title="성취기준에서 출발 — 재구성 바구니 → 나만의 차시 웹앱" highlight>
          <p style={pStyle}>
            &quot;9정02 데이터 단원 차시를 만든다면?&quot; — 지식그래프에서 성취기준을 클릭해 활동을
            바구니에 담고, 그 목록을 바이브 코딩하면 이런 차시 웹앱이 됩니다.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
            {onExploreGraph && (
              <button onClick={onExploreGraph} style={secondaryBtn}>
                지식그래프에서 재구성 시연 →
              </button>
            )}
            <Link href={DEMO_LESSON_URL} target="_blank" rel="noopener noreferrer" style={primaryBtn}>
              🚀 시연용 차시 웹앱 열기
            </Link>
          </div>
          <p style={{ ...pStyle, marginTop: 'var(--space-2)' }}>
            수강생이 학생으로 입장해 활동·형성평가를 하면, 강사 빔의 교사 대시보드가 실시간으로 차오릅니다.
          </p>
        </CaseCard>

        {/* 3. 회차별: 세계수 → 강의 PPTX 생성 / 도트밸리 → 공개수업 실전 */}
        {round === 'sos' ? (
          <CaseCard n={3} badge="AI 강의자료" title="바구니로 강의용 PPTX 자동 생성">
            <DeckStudio />
          </CaseCard>
        ) : (
          <CaseCard n={3} badge="공개수업 실전" title="도트밸리 5차시 이미지 인식(사물 분류)" href="https://www.miricanvas.com/ko/v/13s8tly">
            <p style={pStyle}>
              도입 영상 → 수집·전처리·라벨링 게임 → 테스트·성능 개선 → 우리 학교 문제 적용 토의.
              <strong> 체험하신 M1이 바로 이 차시입니다.</strong>
            </p>
            <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-bold)', color: 'var(--color-primary)' }}>
              공개수업 자료 열기 ↗
            </span>
          </CaseCard>
        )}
      </div>
    </section>
  );
}

function CaseCard({
  n,
  badge,
  title,
  highlight,
  href,
  children,
}: {
  n: number;
  badge: string;
  title: string;
  highlight?: boolean;
  href?: string;
  children: React.ReactNode;
}) {
  const cardStyle: React.CSSProperties = {
    padding: 'var(--space-5)',
    borderRadius: 'var(--radius-lg)',
    background: highlight ? 'var(--theme-tint, var(--color-surface-2))' : 'var(--color-surface)',
    border: `2px solid ${highlight ? 'var(--color-primary)' : 'var(--color-border)'}`,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
    ...(href ? { cursor: 'pointer', boxShadow: 'var(--shadow-sm)' } : {}),
  };
  const inner = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <span
          style={{
            width: 30,
            height: 30,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-primary)',
            color: 'var(--color-primary-contrast)',
            fontWeight: 'var(--fw-bold)',
          }}
        >
          {n}
        </span>
        <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-bold)', color: 'var(--color-primary)' }}>
          {badge}
        </span>
      </div>
      <h3 style={{ fontSize: 'var(--fs-lg)' }}>{title}</h3>
      {children}
    </>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={cardStyle}>
        {inner}
      </a>
    );
  }
  return <article style={cardStyle}>{inner}</article>;
}

const pStyle: React.CSSProperties = {
  fontSize: 'var(--fs-sm)',
  color: 'var(--color-text-muted)',
  lineHeight: 'var(--lh-normal)',
};
const primaryBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
  padding: 'var(--space-3) var(--space-4)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-primary)',
  color: 'var(--color-primary-contrast)',
  fontWeight: 'var(--fw-bold)',
};
const secondaryBtn: React.CSSProperties = {
  padding: 'var(--space-3) var(--space-4)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-primary)',
  color: 'var(--color-primary)',
  fontWeight: 'var(--fw-bold)',
};
