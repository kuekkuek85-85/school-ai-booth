'use client';
/** 성취기준 코드 칩 + 전문 툴팁(호버/포커스). 색은 소속 대단원 색. */
import { useState } from 'react';
import { colorForStandard } from '@/lib/theme/tokens';
import { standardText } from '@/lib/data/standards';

interface Props {
  code: string;
  /** 강사 재구성안 배지 표시 여부(도트밸리 매핑) */
  instructor?: boolean;
}

export default function StandardChip({ code, instructor }: Props) {
  const [open, setOpen] = useState(false);
  const color = colorForStandard(code);

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        aria-label={`성취기준 ${code}: ${standardText(code)}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 'var(--fs-xs)',
          fontWeight: 'var(--fw-bold)',
          color: '#fff',
          background: color,
          padding: '2px var(--space-2)',
          borderRadius: 'var(--radius-full)',
          lineHeight: 1.6,
        }}
      >
        {code}
        {instructor && (
          <span
            title="강사 재구성안"
            style={{
              fontSize: '0.65em',
              background: 'rgba(255,255,255,0.28)',
              borderRadius: 'var(--radius-full)',
              padding: '0 5px',
            }}
          >
            재구성안
          </span>
        )}
      </button>

      {open && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            left: 0,
            zIndex: 60,
            width: 'max-content',
            maxWidth: 320,
            background: 'var(--color-text)',
            color: 'var(--color-text-invert)',
            fontSize: 'var(--fs-xs)',
            fontWeight: 'var(--fw-normal)',
            lineHeight: 'var(--lh-normal)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <strong>{code}</strong> {standardText(code)}
        </span>
      )}
    </span>
  );
}
