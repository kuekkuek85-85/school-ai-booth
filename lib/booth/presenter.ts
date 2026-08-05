'use client';
/** 발표 모드 내비게이션: ←/→·스페이스 섹션 전환, P키 빔 모드(폰트 확대) 토글. */
import { useCallback, useEffect, useState } from 'react';

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || el.isContentEditable;
}

export function usePresenterNav(count: number) {
  const [index, setIndex] = useState(0);
  const [beam, setBeam] = useState(false);

  const goTo = useCallback(
    (i: number) => setIndex(Math.max(0, Math.min(count - 1, i))),
    [count],
  );
  const next = useCallback(
    () => setIndex((i) => Math.min(count - 1, i + 1)),
    [count],
  );
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const toggleBeam = useCallback(() => setBeam((b) => !b), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        toggleBeam();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, toggleBeam]);

  return { index, goTo, next, prev, beam, toggleBeam };
}
