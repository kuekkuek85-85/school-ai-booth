'use client';
/** 재구성 바구니 트레이 — 담은 활동 목록 + 마크다운 내보내기(복사). */
import { useState } from 'react';
import type { BasketItem } from '@/lib/booth/basket';

interface Props {
  items: BasketItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
  exportMarkdown: () => string;
  /** 차시앱으로 발행(worksheets/active 저장) */
  onPublish: () => Promise<void>;
}

export default function BasketTray({ items, onRemove, onClear, exportMarkdown, onPublish }: Props) {
  const [copied, setCopied] = useState(false);
  const [publishState, setPublishState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');

  async function copy() {
    const md = exportMarkdown();
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('아래 내용을 복사하세요', md);
    }
  }

  async function publish() {
    setPublishState('busy');
    try {
      await onPublish();
      setPublishState('done');
      setTimeout(() => setPublishState('idle'), 2500);
    } catch {
      setPublishState('error');
      setTimeout(() => setPublishState('idle'), 2500);
    }
  }

  return (
    <div
      style={{
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        padding: 'var(--space-3) var(--space-4)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        flexWrap: 'wrap',
      }}
    >
      <strong style={{ fontSize: 'var(--fs-sm)' }}>재구성 바구니 ({items.length})</strong>
      <ul style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', listStyle: 'none', flex: 1, minWidth: 200 }}>
        {items.length === 0 && (
          <li style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)' }}>
            활동을 담아 나만의 차시를 구성해 보세요.
          </li>
        )}
        {items.map((it) => (
          <li
            key={it.id}
            className="basket-chip"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 'var(--fs-xs)',
              padding: '2px var(--space-2)',
              background: 'var(--color-surface-2)',
              borderRadius: 'var(--radius-full)',
            }}
          >
            {it.label}
            <button onClick={() => onRemove(it.id)} aria-label="빼기" style={{ color: 'var(--color-danger)' }}>
              ×
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={copy}
        disabled={items.length === 0}
        style={{
          padding: 'var(--space-2) var(--space-4)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-primary)',
          color: 'var(--color-primary-contrast)',
          fontWeight: 'var(--fw-bold)',
          fontSize: 'var(--fs-sm)',
          opacity: items.length === 0 ? 0.5 : 1,
        }}
      >
        {copied ? '복사됨 ✓' : '내보내기(MD 복사)'}
      </button>
      <button
        onClick={publish}
        disabled={items.length === 0 || publishState === 'busy'}
        title="이 바구니로 차시앱 활동지를 생성합니다"
        style={{
          padding: 'var(--space-2) var(--space-4)',
          borderRadius: 'var(--radius-md)',
          border: '2px solid var(--color-primary)',
          color: publishState === 'done' ? 'var(--color-primary-contrast)' : 'var(--color-primary)',
          background: publishState === 'done' ? 'var(--color-primary)' : 'transparent',
          fontWeight: 'var(--fw-bold)',
          fontSize: 'var(--fs-sm)',
          opacity: items.length === 0 ? 0.5 : 1,
        }}
      >
        {publishState === 'busy'
          ? '발행 중…'
          : publishState === 'done'
            ? '차시앱 발행됨 ✓'
            : publishState === 'error'
              ? '발행 실패(규칙 확인)'
              : '🚀 차시앱으로 발행'}
      </button>
      {items.length > 0 && (
        <button onClick={onClear} style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)' }}>
          비우기
        </button>
      )}
    </div>
  );
}
