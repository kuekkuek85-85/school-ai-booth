'use client';
/** 객관식(q2) 정답률 도넛. */
import type { DemoRow } from '@/lib/demo/dashboard';

export default function QuizStats({ rows }: { rows: DemoRow[] }) {
  const submitted = rows.filter((r) => r.quiz);
  const correct = submitted.filter((r) => r.quiz && r.quiz.score >= 1).length;
  const rate = submitted.length ? Math.round((correct / submitted.length) * 100) : 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-5)',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
      }}
    >
      <div
        role="img"
        aria-label={`객관식 정답률 ${rate}%`}
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: `conic-gradient(var(--color-primary) ${rate * 3.6}deg, var(--color-surface-2) 0deg)`,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: '50%',
            background: 'var(--color-surface)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 'var(--fs-xl)',
            fontWeight: 'var(--fw-bold)',
          }}
        >
          {rate}%
        </div>
      </div>
      <div>
        <h3 style={{ fontSize: 'var(--fs-md)' }}>형성평가 객관식 정답률</h3>
        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)' }}>
          제출 {submitted.length}명 · 정답 {correct}명
        </p>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
          2번(선그래프가 적합한 경우) · 정답 ① 시간에 따른 변화
        </p>
      </div>
    </div>
  );
}
