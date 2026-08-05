'use client';
/** 단답 응답 + 산출물(데이터 해석 의견) 리스트 — 시연 중 빔으로 읽어주는 용도. */
import type { DemoRow } from '@/lib/demo/dashboard';
import { maskName } from '@/lib/booth/dashboard';

export default function AnswerList({ rows, masked }: { rows: DemoRow[]; masked: boolean }) {
  const withArtifact = rows.filter((r) => r.artifact.trim());
  const withShort = rows.filter((r) => r.quiz && (r.quiz.q1 || r.quiz.q3));

  const nameOf = (r: DemoRow) => (masked ? maskName(r.name) : r.name);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
      {/* 산출물 */}
      <section style={panel}>
        <h3 style={panelTitle}>산출물 — 데이터 해석 의견 ({withArtifact.length})</h3>
        {withArtifact.length === 0 ? (
          <p style={muted}>아직 제출된 산출물이 없습니다.</p>
        ) : (
          <ul style={listStyle}>
            {withArtifact.map((r) => (
              <li key={r.uid} style={item}>
                <strong style={{ fontSize: 'var(--fs-sm)' }}>{nameOf(r)}</strong>
                <p style={{ fontSize: 'var(--fs-sm)' }}>{r.artifact}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 단답 */}
      <section style={panel}>
        <h3 style={panelTitle}>형성평가 단답 (1·3번) ({withShort.length})</h3>
        {withShort.length === 0 ? (
          <p style={muted}>아직 제출된 단답이 없습니다.</p>
        ) : (
          <ul style={listStyle}>
            {withShort.map((r) => (
              <li key={r.uid} style={item}>
                <strong style={{ fontSize: 'var(--fs-sm)' }}>{nameOf(r)}</strong>
                {r.quiz?.q1 && (
                  <p style={{ fontSize: 'var(--fs-sm)' }}>
                    <span style={muted}>1.</span> {r.quiz.q1}
                  </p>
                )}
                {r.quiz?.q3 && (
                  <p style={{ fontSize: 'var(--fs-sm)' }}>
                    <span style={muted}>3.</span> {r.quiz.q3}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

const panel: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-4) var(--space-5)',
};
const panelTitle: React.CSSProperties = { fontSize: 'var(--fs-md)', marginBottom: 'var(--space-3)' };
const listStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', listStyle: 'none' };
const item: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  paddingBottom: 'var(--space-2)',
  borderBottom: '1px solid var(--color-border)',
};
const muted: React.CSSProperties = { fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)' };
