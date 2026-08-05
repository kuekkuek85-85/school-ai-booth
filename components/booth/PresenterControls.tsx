'use client';
/**
 * 교사용 발표 제어 — [설명 시작] 버튼 + 전체화면 발표자 스테이지(이전/다음/종료).
 * 상태는 Firestore로 동기화되어 같은 회차 수강생 화면에 강제 표시된다.
 */
import { useEffect, useMemo } from 'react';
import { getSlides } from '@/lib/booth/slides';
import { usePresenter } from '@/lib/booth/presentation';
import SlideView from '@/components/booth/SlideView';
import type { ContentId } from '@/lib/theme/tokens';

export default function PresenterControls({
  sessionId,
  contentId,
  contentTitle,
}: {
  sessionId: string | null;
  contentId: ContentId;
  contentTitle: string;
}) {
  const slides = useMemo(() => getSlides(contentId), [contentId]);
  const total = slides.length;
  const { active, slide, start, next, prev, close } = usePresenter(sessionId, total);
  const idx = Math.max(0, Math.min(total - 1, slide));

  // 발표 중 키보드 내비(→/← 이동, Esc 종료)
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
      else if (e.key === 'Escape') { e.preventDefault(); close(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, next, prev, close]);

  return (
    <>
      <button onClick={start} className="pill pill-primary" disabled={!sessionId}>
        ▶ 콘텐츠 설명 시작
      </button>

      {active && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
          {/* 상단: 발표자 표시 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
            <span className="caption" style={{ color: 'var(--color-text-muted)' }}>발표자 제어 · {contentTitle}</span>
            <span className="caption" style={{ color: 'var(--color-text-muted)' }}>수강생 화면 동기화 중 ●</span>
          </div>

          {/* 슬라이드 */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <SlideView slide={slides[idx]} />
          </div>

          {/* 하단 제어 바 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-5)', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)', flexWrap: 'wrap' }}>
            <button onClick={prev} disabled={idx === 0} className="pill pill-secondary" style={idx === 0 ? { opacity: 0.4 } : undefined}>
              ← 이전
            </button>
            <span style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-md)' }}>
              {idx + 1} <span style={{ color: 'var(--color-text-muted)' }}>/ {total}</span>
            </span>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button onClick={close} className="pill" style={{ color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>
                설명 종료
              </button>
              <button onClick={next} disabled={idx === total - 1} className="pill pill-primary" style={idx === total - 1 ? { opacity: 0.4 } : undefined}>
                다음 →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
