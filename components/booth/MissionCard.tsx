'use client';
/** 미션 카드 — 활동 스텝(딥링크) · 성취기준 칩 · 교사의 눈 · 완료 도장 · 교사용 매뉴얼. */
import StandardChip from '@/components/common/StandardChip';
import { getActivity, getGuides } from '@/lib/data/content';
import type { Mission } from '@/lib/data/missions';
import type { ContentId } from '@/lib/theme/tokens';

interface Props {
  contentId: ContentId;
  mission: Mission;
  done: boolean;
  onToggle: () => void;
}

export default function MissionCard({ contentId, mission, done, onToggle }: Props) {
  const teacherManual = getGuides(contentId).teacher;
  const isInstructor = contentId === 'dotvalley';

  return (
    <article
      style={{
        background: 'var(--color-surface)',
        border: `1px solid ${done ? 'var(--color-primary)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: 'var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        <div>
          <h3 style={{ fontSize: 'var(--fs-lg)' }}>{mission.title}</h3>
          <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)' }}>
            예상 {mission.minutes}분 · 활동 {mission.steps.length}개
          </span>
        </div>
        <span
          aria-hidden
          style={{
            fontSize: 'var(--fs-xl)',
            filter: done ? 'none' : 'grayscale(1) opacity(0.35)',
          }}
          title={done ? '완료' : '미완료'}
        >
          {done ? '🏅' : '⚪'}
        </span>
      </header>

      {/* 활동 스텝 딥링크 */}
      <ol style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', listStyle: 'none' }}>
        {mission.steps.map((step, i) => {
          const a = getActivity(contentId, step.lesson, step.activity);
          return (
            <li key={`${step.lesson}-${step.activity}`}>
              <a
                href={a.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-3)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--theme-tint, var(--color-surface-2))',
                }}
              >
                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)', minWidth: '2.6ch' }}>
                  {i + 1}
                </span>
                <span aria-hidden title={a.type === 'video' ? '영상' : '인터랙티브'}>
                  {a.type === 'video' ? '🎬' : '🕹️'}
                </span>
                <span style={{ fontSize: 'var(--fs-sm)', flex: 1 }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    {step.lesson}-{step.activity}
                  </span>{' '}
                  {a.title}
                </span>
                <span aria-hidden style={{ color: 'var(--color-primary)' }}>↗</span>
              </a>
            </li>
          );
        })}
      </ol>

      {/* 성취기준 칩 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        {mission.standards.map((code) => (
          <StandardChip key={code} code={code} instructor={isInstructor} />
        ))}
      </div>

      {/* 교사의 눈 */}
      <p
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          fontSize: 'var(--fs-sm)',
          background: 'var(--color-surface-2)',
          borderLeft: '3px solid var(--color-teacher-eye)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-2) var(--space-3)',
        }}
      >
        <span aria-hidden style={{ color: 'var(--color-teacher-eye)' }}>👁️</span>
        <span>
          <strong>교사의 눈</strong> — {mission.teacherEye}
        </span>
      </p>

      {/* 액션: 완료 도장 + 교사용 매뉴얼 */}
      <footer style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'auto' }}>
        <button
          onClick={onToggle}
          aria-pressed={done}
          style={{
            flex: 1,
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            fontWeight: 'var(--fw-bold)',
            color: done ? 'var(--color-primary-contrast)' : 'var(--color-primary)',
            background: done ? 'var(--color-primary)' : 'transparent',
            border: '2px solid var(--color-primary)',
          }}
        >
          {done ? '✓ 완료됨' : '완료 도장 찍기'}
        </button>
        <a
          href={teacherManual}
          target="_blank"
          rel="noopener noreferrer"
          title="교사용 매뉴얼 PDF"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            fontSize: 'var(--fs-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          📄 매뉴얼
        </a>
      </footer>
    </article>
  );
}
