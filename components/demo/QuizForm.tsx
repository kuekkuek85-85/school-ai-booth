'use client';
/** 형성평가 3문항 — 객관식(q2) 자동 채점, 단답(q1·q3) 저장. */
import { useEffect, useState } from 'react';
import { useDemoProgress } from '@/lib/demo/progress';
import { DEMO_QUIZ } from '@/lib/data/missions';

export default function QuizForm() {
  const { data, submitQuiz, requestFeedback } = useDemoProgress();
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState<number>(-1);
  const [q3, setQ3] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loadingFb, setLoadingFb] = useState(false);

  // 기존 제출 복구
  useEffect(() => {
    if (data.quiz) {
      setQ1(data.quiz.q1);
      setQ2(data.quiz.q2);
      setQ3(data.quiz.q3);
      setSubmitted(true);
    }
  }, [data.quiz]);

  const choiceQ = DEMO_QUIZ.find((q) => q.id === 'q2');
  const answerIndex = choiceQ && choiceQ.type === 'choice' ? choiceQ.answerIndex : 0;
  const canSubmit = q1.trim() && q2 >= 0 && q3.trim();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const score = q2 === answerIndex ? 1 : 0;
    submitQuiz({ q1: q1.trim(), q2, q3: q3.trim(), score });
    setSubmitted(true);
    // Gemini 피드백 요청(실패해도 제출은 정상)
    setLoadingFb(true);
    await requestFeedback({ artifact: data.artifact, q1: q1.trim(), q3: q3.trim() });
    setLoadingFb(false);
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      <h3 style={{ fontSize: 'var(--fs-lg)' }}>형성평가</h3>

      {DEMO_QUIZ.map((q, i) => (
        <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-medium)' }}>
            {i + 1}. {q.prompt}
          </span>
          {q.type === 'short' ? (
            <input
              value={q.id === 'q1' ? q1 : q3}
              onChange={(e) => (q.id === 'q1' ? setQ1(e.target.value) : setQ3(e.target.value))}
              placeholder="답을 입력하세요"
              style={inputStyle}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {q.options.map((opt, oi) => (
                <label
                  key={oi}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    padding: 'var(--space-2) var(--space-3)',
                    border: `1px solid ${q2 === oi ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="q2"
                    checked={q2 === oi}
                    onChange={() => setQ2(oi)}
                  />
                  <span style={{ fontSize: 'var(--fs-sm)' }}>
                    {['①', '②', '③', '④'][oi]} {opt}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            padding: 'var(--space-3) var(--space-5)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-primary)',
            color: 'var(--color-primary-contrast)',
            fontWeight: 'var(--fw-bold)',
            opacity: canSubmit ? 1 : 0.5,
          }}
        >
          {submitted ? '다시 제출' : '제출하기'}
        </button>
        {submitted && data.quiz && (
          <span style={{ fontSize: 'var(--fs-sm)', color: data.quiz.score ? 'var(--color-success)' : 'var(--color-warning)' }}>
            객관식 {data.quiz.score ? '정답 ✓' : '오답'} · 단답 저장됨
          </span>
        )}
      </div>

      {/* Gemini 피드백 */}
      {submitted && (loadingFb || data.feedback) && (
        <div
          style={{
            background: 'var(--theme-tint, var(--color-surface-2))',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
            fontSize: 'var(--fs-sm)',
          }}
        >
          <strong style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            🤖 AI 피드백
            {data.feedback?.level && (
              <span
                style={{
                  fontSize: 'var(--fs-xs)',
                  padding: '1px var(--space-2)',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-primary)',
                  color: 'var(--color-primary-contrast)',
                }}
              >
                도달도 {data.feedback.level}
              </span>
            )}
          </strong>
          {loadingFb && !data.feedback && <span style={{ color: 'var(--color-text-muted)' }}>피드백 생성 중…</span>}
          {data.feedback?.artifact && <span>· 산출물: {data.feedback.artifact}</span>}
          {data.feedback?.q1 && <span>· 1번: {data.feedback.q1}</span>}
          {data.feedback?.q3 && <span>· 3번: {data.feedback.q3}</span>}
        </div>
      )}
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  padding: 'var(--space-3)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--fs-sm)',
};
