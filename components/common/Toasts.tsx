'use client';
/** 완주 토스트 — 우하단에 쌓이며 자동 사라짐. */
import type { Toast } from '@/lib/common/useCompletionAlerts';

export default function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        right: 'var(--space-5)',
        bottom: 'var(--space-5)',
        zIndex: 90,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast-pop"
          style={{
            background: 'var(--color-primary)',
            color: 'var(--color-primary-contrast)',
            fontWeight: 'var(--fw-bold)',
            fontSize: 'var(--fs-lg)',
            padding: 'var(--space-3) var(--space-5)',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
