'use client';
/** S1 오프닝 — 세계관 요약 · 진행 4단계 · 두 활용 경로 차이. */
import { useBoothSession } from '@/lib/booth/session';
import { BOOTH_ROUNDS } from '@/lib/data/missions';
import { getContent } from '@/lib/data/content';

const STEPS = ['접수 · 입장', '콘텐츠 체험', '학교 적용 사례', '자료실'];

export default function Opening() {
  const { round } = useBoothSession();
  if (!round) return null;
  const r = BOOTH_ROUNDS[round];
  const content = getContent(round);
  const mapImage = `/maps/${round}.png`;

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

      {/* 마을 지도(줄거리 보기) — 클릭 시 학습 도장 모으기 맵 새 탭 */}
      <a
        href={content.mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'block', cursor: 'pointer' }}
        title="학습 도장 모으기 맵 열기"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mapImage}
          alt={`${r.title} 마을 지도`}
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
            display: 'block',
          }}
        />
      </a>
    </section>
  );
}
