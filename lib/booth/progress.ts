'use client';
/**
 * 미션 도장 진행 — Firestore progress 문서 구독 + 낙관적 토글 + localStorage 캐시.
 * 강사 모드(uid 없음)는 로컬 상태만. 쓰기 실패 시 1회 재시도.
 */
import { useCallback, useEffect, useState } from 'react';
import { onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { boothProgressDoc } from '@/lib/firebase/collections';
import { useBoothSession } from '@/lib/booth/session';
import type { MissionId } from '@/lib/data/missions';

export interface MissionProgress {
  m1: boolean;
  m2: boolean;
  m3: boolean;
}

const EMPTY: MissionProgress = { m1: false, m2: false, m3: false };

function cacheKey(sessionId: string, uid: string) {
  return `sai:booth:progress:${sessionId}:${uid}`;
}

export function useBoothProgress() {
  const { sessionId, profile, isPresenter } = useBoothSession();
  const uid = profile?.uid ?? null;
  const [progress, setProgress] = useState<MissionProgress>(EMPTY);

  // localStorage 캐시 선반영
  useEffect(() => {
    if (!sessionId || !uid) return;
    try {
      const raw = window.localStorage.getItem(cacheKey(sessionId, uid));
      if (raw) setProgress({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, [sessionId, uid]);

  // Firestore 실시간 구독(본인 문서)
  useEffect(() => {
    if (!sessionId || !uid) return;
    const unsub = onSnapshot(boothProgressDoc(sessionId, uid), (snap) => {
      const d = snap.data();
      if (d) {
        const next = { m1: !!d.m1, m2: !!d.m2, m3: !!d.m3 };
        setProgress(next);
        window.localStorage.setItem(cacheKey(sessionId, uid), JSON.stringify(next));
      }
    });
    return unsub;
  }, [sessionId, uid]);

  const toggle = useCallback(
    (key: MissionId) => {
      setProgress((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        // 로컬 캐시
        if (sessionId && uid) {
          window.localStorage.setItem(cacheKey(sessionId, uid), JSON.stringify(next));
        }
        // 강사 모드/미입장은 로컬만
        if (isPresenter || !sessionId || !uid) return next;

        const write = () =>
          setDoc(
            boothProgressDoc(sessionId, uid),
            { ...next, uid, updatedAt: serverTimestamp() },
            { merge: true },
          );
        write().catch(() => {
          setTimeout(() => {
            write().catch((e) => console.error('progress 저장 실패', e));
          }, 1500);
        });
        return next;
      });
    },
    [sessionId, uid, isPresenter],
  );

  const completedCount = Number(progress.m1) + Number(progress.m2) + Number(progress.m3);

  return { progress, toggle, completedCount };
}
