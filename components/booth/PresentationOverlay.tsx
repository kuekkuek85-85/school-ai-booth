'use client';
/**
 * 수강생용 발표 오버레이 — 교사가 [설명 시작] 시 전체화면으로 강제 표시.
 * 교사의 다음/이전에 따라 슬라이드가 동기화되고, 교사가 종료해야 화면이 풀린다.
 */
import { useMemo } from 'react';
import { usePresentationControl } from '@/lib/booth/presentation';
import { getSlides } from '@/lib/booth/slides';
import SlideView from '@/components/booth/SlideView';
import type { ContentId } from '@/lib/theme/tokens';

export default function PresentationOverlay({
  sessionId,
  contentId,
}: {
  sessionId: string | null;
  contentId: ContentId;
}) {
  const control = usePresentationControl(sessionId);
  const slides = useMemo(() => getSlides(contentId), [contentId]);

  if (!control.active) return null;
  const idx = Math.max(0, Math.min(slides.length - 1, control.slide));

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'var(--color-bg)' }}>
      <SlideView slide={slides[idx]} />
      {/* 강사 설명 중 안내 + 진행 표시 */}
      <div
        className="caption"
        style={{
          position: 'fixed',
          top: 14,
          left: 14,
          padding: '6px 12px',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--color-primary)',
          color: 'var(--color-primary-contrast)',
        }}
      >
        ● 강사님이 설명 중입니다
      </div>
      <div
        className="caption"
        style={{
          position: 'fixed',
          bottom: 14,
          right: 16,
          color: 'var(--color-text-muted)',
        }}
      >
        {idx + 1} / {slides.length}
      </div>
    </div>
  );
}
