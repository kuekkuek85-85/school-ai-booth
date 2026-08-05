'use client';
/** 차시 홈 — 동적 활동지(spec) 렌더: 제목·성취기준·목표 + 가변 단계 + 형성평가 + 동료 현황판. */
import { useDemoSession } from '@/lib/demo/session';
import { useDemoProgress } from '@/lib/demo/progress';
import StepCard from '@/components/demo/StepCard';
import QuizForm from '@/components/demo/QuizForm';
import ProgressBar from '@/components/demo/ProgressBar';
import PeerBoard from '@/components/demo/PeerBoard';
import StandardChip from '@/components/common/StandardChip';
import { standardText } from '@/lib/data/standards';
import type { WorksheetSpec } from '@/lib/demo/worksheet';

export default function LessonHome({ spec }: { spec: WorksheetSpec }) {
  const { profile } = useDemoSession();
  const { data, toggleStep, setArtifact } = useDemoProgress();
  const total = spec.steps.length + 1; // 단계 + 형성평가

  return (
    <main className="theme-sos" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'var(--space-6) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <h1 style={{ fontSize: 'var(--fs-2xl)', fontWeight: 'var(--fw-normal)' }}>{spec.title}</h1>
            {profile && (
              <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)' }}>
                {profile.studentNo} · {profile.name}
              </span>
            )}
          </div>
          {spec.generated && (
            <span style={{ alignSelf: 'flex-start', fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-bold)', color: 'var(--color-primary-contrast)', background: 'var(--color-primary)', padding: '2px var(--space-3)', borderRadius: 'var(--radius-full)' }}>
              🤖 AI가 성취기준으로 생성한 맞춤 활동지
            </span>
          )}

          {spec.standards.length > 0 && (
            <>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {spec.standards.map((c) => (
                  <StandardChip key={c} code={c} />
                ))}
              </div>
              <details style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)' }}>
                <summary style={{ cursor: 'pointer' }}>성취기준 전문 보기</summary>
                <ul style={{ marginTop: 'var(--space-2)', paddingLeft: 'var(--space-5)' }}>
                  {spec.standards.map((c) => (
                    <li key={c}>
                      <strong>{c}</strong> {standardText(c)}
                    </li>
                  ))}
                </ul>
              </details>
            </>
          )}

          <p style={{ fontSize: 'var(--fs-sm)', background: 'var(--theme-tint, var(--color-surface-2))', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
            🎯 <strong>오늘의 목표</strong> — {spec.objective}
          </p>
        </header>

        <ProgressBar total={total} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {spec.steps.map((step, i) => (
            <StepCard
              key={step.key}
              step={step}
              index={i}
              done={!!data.steps[step.key]}
              onToggle={() => toggleStep(step.key)}
              artifact={step.artifact ? data.artifact : undefined}
              onSaveArtifact={step.artifact ? setArtifact : undefined}
            />
          ))}

          <QuizForm quiz={spec.quiz} />
        </div>

        <PeerBoard />
      </div>
    </main>
  );
}
