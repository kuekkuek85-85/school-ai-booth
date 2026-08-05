'use client';
/**
 * 발표 동기화 — 교사 대시보드(write)와 수강생 화면(read)을 Firestore control 문서로 연결.
 * booth/{sessionId}/control/presentation = { active, slide, updatedAt }.
 */
import { useCallback, useEffect, useState } from 'react';
import { onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { presentationDoc, type PresentationControl } from '@/lib/firebase/collections';
import { ensureAnonymousAuth } from '@/lib/firebase/auth';

const IDLE: PresentationControl = { active: false, slide: 0, updatedAt: null };

/** control 문서 실시간 구독 (수강생·교사 공통) */
export function usePresentationControl(sessionId: string | null): PresentationControl {
  const [ctrl, setCtrl] = useState<PresentationControl>(IDLE);
  useEffect(() => {
    if (!sessionId) return;
    let alive = true;
    ensureAnonymousAuth().catch(() => {});
    const unsub = onSnapshot(
      presentationDoc(sessionId),
      (snap) => {
        if (alive) setCtrl(snap.exists() ? snap.data() : IDLE);
      },
      (e) => console.error('발표 동기화 구독 실패', e),
    );
    return () => {
      alive = false;
      unsub();
    };
  }, [sessionId]);
  return ctrl;
}

async function write(sessionId: string, active: boolean, slide: number) {
  await ensureAnonymousAuth();
  await setDoc(presentationDoc(sessionId), { active, slide, updatedAt: serverTimestamp() });
}

/**
 * 교사 제어 — 시작/다음/이전/종료.
 * 교사 화면은 낙관적 로컬 상태로 즉시 반응하고(Firestore 왕복·규칙 미배포와 무관),
 * 같은 상태를 Firestore에 write 해 수강생 화면과 동기화한다.
 */
export function usePresenter(sessionId: string | null, total: number) {
  const [local, setLocal] = useState<{ active: boolean; slide: number } | null>(null);

  const active = local?.active ?? false;
  const slide = local?.slide ?? 0;

  const push = useCallback(
    (a: boolean, i: number) => {
      const clamped = Math.max(0, Math.min(total - 1, i));
      setLocal({ active: a, slide: clamped });
      if (sessionId) void write(sessionId, a, clamped).catch((e) => console.error('발표 동기화 실패(규칙 배포 확인)', e));
    },
    [sessionId, total],
  );

  return {
    active,
    slide,
    start: useCallback(() => push(true, 0), [push]),
    close: useCallback(() => push(false, slide), [push, slide]),
    next: useCallback(() => push(true, slide + 1), [push, slide]),
    prev: useCallback(() => push(true, slide - 1), [push, slide]),
  };
}
