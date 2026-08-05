'use client';
/**
 * 학생 입장 시 활동지 해석: 발행된 바구니(worksheets/active) → /api/worksheet 로 동적 생성.
 * 세션별 localStorage 캐시(재접속 시 재생성 안 함). 실패 시 기본 차시로 폴백.
 */
import { useEffect, useState } from 'react';
import { getDoc } from 'firebase/firestore';
import { ensureAnonymousAuth } from '@/lib/firebase/auth';
import { worksheetDoc } from '@/lib/firebase/collections';
import { defaultWorksheet, type WorksheetInput, type WorksheetSpec } from '@/lib/demo/worksheet';

export function useWorksheet(sessionId: string, ready: boolean) {
  const [spec, setSpec] = useState<WorksheetSpec | null>(null);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    if (!ready) return;
    let alive = true;
    const cacheKey = `sai:demo:spec:${sessionId}`;

    // 캐시 우선(재접속)
    try {
      const cached = window.localStorage.getItem(cacheKey);
      if (cached) {
        setSpec(JSON.parse(cached) as WorksheetSpec);
        setFromCache(true);
        return;
      }
    } catch {
      /* ignore */
    }

    (async () => {
      let input: WorksheetInput = { standards: [], activities: [] };
      try {
        await ensureAnonymousAuth();
        const snap = await getDoc(worksheetDoc());
        const w = snap.data();
        if (w && w.activities.length) {
          input = { standards: w.standards, activities: w.activities };
        }
      } catch {
        /* 발행본 없음/권한 → 기본 흐름 */
      }

      let result: WorksheetSpec;
      try {
        const res = await fetch('/api/worksheet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
        result = ((await res.json()) as { spec: WorksheetSpec }).spec ?? defaultWorksheet();
      } catch {
        result = defaultWorksheet();
      }
      if (!alive) return;
      try {
        window.localStorage.setItem(cacheKey, JSON.stringify(result));
      } catch {
        /* ignore */
      }
      setSpec(result);
    })();

    return () => {
      alive = false;
    };
  }, [ready, sessionId]);

  return { spec, fromCache };
}
