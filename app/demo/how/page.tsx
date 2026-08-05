/** /demo/how — "이렇게 만들었어요" 제작 과정 3단계 정적 페이지(부스 멘트용). */
import Link from 'next/link';
import type { Metadata } from 'next';
import { DEMO_LESSON } from '@/lib/data/missions';
import { standardText } from '@/lib/data/standards';

export const metadata: Metadata = {
  title: '이렇게 만들었어요 — 데이터를 풀어라!',
};

const STEPS = [
  {
    n: 1,
    title: '성취기준에서 출발',
    body: '가르쳐야 할 성취기준을 먼저 고릅니다. 이 차시는 데이터 단원의 두 성취기준을 목표로 삼았습니다.',
    detail: DEMO_LESSON.standards.map((c) => `${c} ${standardText(c)}`),
  },
  {
    n: 2,
    title: '활동 발췌·재조합',
    body: 'School AI 「S.O.S 세계수를 구하라」 2차시에서 목표에 맞는 활동 4개만 뽑아 도입→전개1~3 순서로 재구성했습니다.',
    detail: [
      '도입: 데이터 수집과 관리',
      '전개1: 나무 데이터 모으기',
      '전개2: 식물 생장 데이터 시각화하기',
      '전개3: 식물 생장 데이터 해석하기(산출물 제출)',
    ],
  },
  {
    n: 3,
    title: '바이브 코딩',
    body: '발췌한 활동 목록(제목+딥링크+성취기준)을 그대로 AI에게 주고, 학생 입장·완료 체크·산출물 제출·형성평가·교사 대시보드까지 한 번에 만들었습니다.',
    detail: [
      '지식그래프의 재구성 바구니 → 마크다운 내보내기가 그 입력이 됩니다.',
      '이 페이지가 보는 웹앱이 바로 그 결과물입니다.',
    ],
  },
];

export default function HowPage() {
  return (
    <main className="theme-sos" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--space-6) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <header>
          <h1 style={{ fontSize: 'var(--fs-2xl)' }}>이렇게 만들었어요</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
            성취기준 → 활동 발췌 → 바이브 코딩. 이 차시 웹앱이 만들어진 3단계.
          </p>
        </header>

        {STEPS.map((s) => (
          <section
            key={s.n}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span
                style={{
                  width: 36,
                  height: 36,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-primary)',
                  color: 'var(--color-primary-contrast)',
                  fontWeight: 'var(--fw-bold)',
                  fontSize: 'var(--fs-lg)',
                }}
              >
                {s.n}
              </span>
              <h2 style={{ fontSize: 'var(--fs-lg)' }}>{s.title}</h2>
            </div>
            <p style={{ fontSize: 'var(--fs-sm)' }}>{s.body}</p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', paddingLeft: 'var(--space-5)', fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)' }}>
              {s.detail.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </section>
        ))}

        <Link
          href="/demo"
          style={{
            alignSelf: 'flex-start',
            padding: 'var(--space-3) var(--space-5)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-primary)',
            color: 'var(--color-primary-contrast)',
            fontWeight: 'var(--fw-bold)',
          }}
        >
          ← 차시앱으로
        </Link>
      </div>
    </main>
  );
}
