'use client';
/** 차시앱 진행 — demoProgress 문서 구독 + 단계 완료·산출물·형성평가 저장(낙관적). */
import { useCallback, useEffect, useState } from 'react';
import { onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { demoProgressDoc, type DemoProgress, type DemoQuizResult } from '@/lib/firebase/collections';
import { useDemoSession } from '@/lib/demo/session';
import type { DemoStepId } from '@/lib/data/missions';

const EMPTY: DemoProgress = {
  steps: { intro: false, act1: false, act2: false, act3: false, quiz: false },
  artifact: '',
  quiz: null,
  updatedAt: null,
  uid: '',
};

export function useDemoProgress() {
  const { sessionId, profile } = useDemoSession();
  const uid = profile?.uid ?? null;
  const [data, setData] = useState<DemoProgress>(EMPTY);

  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(demoProgressDoc(sessionId, uid), (snap) => {
      const d = snap.data();
      if (d) setData({ ...EMPTY, ...d, steps: { ...EMPTY.steps, ...d.steps } });
    });
    return unsub;
  }, [sessionId, uid]);

  const persist = useCallback(
    (patch: Partial<DemoProgress>) => {
      if (!uid) return;
      setData((prev) => {
        const next = { ...prev, ...patch, steps: { ...prev.steps, ...(patch.steps ?? {}) } };
        const write = () =>
          setDoc(
            demoProgressDoc(sessionId, uid),
            { ...next, uid, updatedAt: serverTimestamp() },
            { merge: true },
          );
        write().catch(() => setTimeout(() => write().catch((e) => console.error('진행 저장 실패', e)), 1500));
        return next;
      });
    },
    [sessionId, uid],
  );

  // persist가 steps를 prev와 병합하므로 변경 키만 넘긴다
  const toggleStep = useCallback(
    (id: DemoStepId) => persist({ steps: { [id]: !data.steps[id] } as DemoProgress['steps'] }),
    [persist, data.steps],
  );

  const setArtifact = useCallback((text: string) => persist({ artifact: text }), [persist]);

  const submitQuiz = useCallback(
    (result: DemoQuizResult) =>
      persist({ quiz: result, steps: { quiz: true } as DemoProgress['steps'] }),
    [persist],
  );

  const completed = Object.values(data.steps).filter(Boolean).length;

  return { data, toggleStep, setArtifact, submitQuiz, completed, total: 5 };
}
