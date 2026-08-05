'use client';
/** 차시 홈 — 차시명·성취기준(칩+전문 접기)·목표 + 단계 카드. (진행바·형성평가·현황판은 T12) */
import { useDemoSession } from '@/lib/demo/session';
import { useDemoProgress } from '@/lib/demo/progress';
import StepCard from '@/components/demo/StepCard';
import QuizForm from '@/components/demo/QuizForm';
import ProgressBar from '@/components/demo/ProgressBar';
import PeerBoard from '@/components/demo/PeerBoard';
import StandardChip from '@/components/common/StandardChip';
import { DEMO_LESSON, DEMO_STEPS } from '@/lib/data/missions';
import { standardText } from '@/lib/data/standards';

export default function LessonHome() {
  const { profile } = useDemoSession();
  const { data, toggleStep, setArtifact } = useDemoProgress();

  return (
    <main
      className="theme-sos"
      style={{ minHeight: '100vh', background: 'var(--color-bg)' }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'var(--space-6) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* 헤더 */}
        <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <h1 style={{ fontSize: 'var(--fs-2xl)' }}>{DEMO_LESSON.title}</h1>
            {profile && (
              <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)' }}>
                {profile.studentNo} · {profile.name}
              </span>
            )}
          </div>
          <p style={{ color: 'var(--color-text-muted)' }}>{DEMO_LESSON.subject}</p>

          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {DEMO_LESSON.standards.map((c) => (
              <StandardChip key={c} code={c} />
            ))}
          </div>
          <details style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)' }}>
            <summary style={{ cursor: 'pointer' }}>성취기준 전문 보기</summary>
            <ul style={{ marginTop: 'var(--space-2)', paddingLeft: 'var(--space-5)' }}>
              {DEMO_LESSON.standards.map((c) => (
                <li key={c}>
                  <strong>{c}</strong> {standardText(c)}
                </li>
              ))}
            </ul>
          </details>

          <p
            style={{
              fontSize: 'var(--fs-sm)',
              background: 'var(--theme-tint, var(--color-surface-2))',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3)',
            }}
          >
            🎯 <strong>오늘의 목표</strong> — {DEMO_LESSON.goal}
          </p>
        </header>

        <ProgressBar />

        {/* 단계 카드 (활동 4개) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {DEMO_STEPS.filter((s) => s.id !== 'quiz').map((step, i) => (
            <StepCard
              key={step.id}
              step={step}
              index={i}
              done={data.steps[step.id]}
              onToggle={() => toggleStep(step.id)}
              artifact={step.artifact ? data.artifact : undefined}
              onSaveArtifact={step.artifact ? setArtifact : undefined}
            />
          ))}

          {/* 형성평가 */}
          <QuizForm />
        </div>

        {/* 동료 현황판 */}
        <PeerBoard />
      </div>
    </main>
  );
}
