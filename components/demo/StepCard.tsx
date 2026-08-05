'use client';
/** 차시 단계 카드 — 활동 딥링크(새 탭) + AI 안내 + 완료 체크 + (마지막) 산출물 제출. */
import { useEffect, useState } from 'react';
import type { WorksheetStep } from '@/lib/demo/worksheet';

interface Props {
  step: WorksheetStep;
  index: number;
  done: boolean;
  onToggle: () => void;
  artifact?: string;
  onSaveArtifact?: (text: string) => void;
}

export default function StepCard({ step, index, done, onToggle, artifact, onSaveArtifact }: Props) {
  const [text, setText] = useState(artifact ?? '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setText(artifact ?? '');
  }, [artifact]);

  return (
    <article
      style={{
        background: 'var(--color-surface)',
        border: `1px solid ${done ? 'var(--color-primary)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4) var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <span
          style={{
            width: 30,
            height: 30,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 'var(--radius-full)',
            background: done ? 'var(--color-primary)' : 'var(--color-surface-2)',
            color: done ? 'var(--color-primary-contrast)' : 'var(--color-text-muted)',
            fontWeight: 'var(--fw-bold)',
            fontSize: 'var(--fs-sm)',
          }}
        >
          {done ? '✓' : index + 1}
        </span>
        <div>
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-primary)', fontWeight: 'var(--fw-bold)' }}>
            {step.label}
          </span>
          <h3 style={{ fontSize: 'var(--fs-md)' }}>{step.title}</h3>
        </div>
      </header>

      {step.guide && (
        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)' }}>💡 {step.guide}</p>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        {step.link && (
          <a
            href={step.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-primary)',
              color: 'var(--color-primary)',
              fontWeight: 'var(--fw-bold)',
              fontSize: 'var(--fs-sm)',
            }}
          >
            {step.type === 'video' ? '🎬' : '🕹️'} 활동 열기 ↗
          </a>
        )}
        <button
          onClick={onToggle}
          aria-pressed={done}
          style={{
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            fontWeight: 'var(--fw-bold)',
            fontSize: 'var(--fs-sm)',
            color: done ? 'var(--color-primary-contrast)' : 'var(--color-primary)',
            background: done ? 'var(--color-primary)' : 'transparent',
            border: '1px solid var(--color-primary)',
          }}
        >
          {done ? '완료됨' : '완료 체크'}
        </button>
      </div>

      {step.artifact && onSaveArtifact && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-medium)' }}>
            산출물 (데이터 해석 의견)
          </label>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setSaved(false);
            }}
            rows={3}
            placeholder="활동을 바탕으로 알게 된 점·해석을 작성하세요."
            style={{
              padding: 'var(--space-3)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--fs-sm)',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button
              onClick={() => {
                onSaveArtifact(text.trim());
                setSaved(true);
              }}
              disabled={text.trim().length === 0}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary)',
                color: 'var(--color-primary-contrast)',
                fontWeight: 'var(--fw-bold)',
                fontSize: 'var(--fs-sm)',
                opacity: text.trim().length === 0 ? 0.5 : 1,
              }}
            >
              제출 / 수정
            </button>
            {saved && <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-success)' }}>저장됨 ✓</span>}
          </div>
        </div>
      )}
    </article>
  );
}
