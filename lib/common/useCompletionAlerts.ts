'use client';
/**
 * 실시간 완료 감지 — 새로 '완주'한 참가자를 찾아 토스트 + 행 플래시 신호 반환.
 * 첫 로드의 기존 완료자는 토스트하지 않음(중복 방지).
 */
import { useEffect, useRef, useState } from 'react';

export interface AlertEntry {
  uid: string;
  done: boolean;
  name: string;
}
export interface Toast {
  id: number;
  text: string;
}

export function useCompletionAlerts(entries: AlertEntry[]) {
  const prevDone = useRef<Set<string>>(new Set());
  const armed = useRef(false);
  const idRef = useRef(0);
  const [flashing, setFlashing] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);

  // 초기 로드(기존 데이터 유입) 동안은 토스트 억제 → 1.5초 후 '무장'
  useEffect(() => {
    const t = window.setTimeout(() => {
      armed.current = true;
    }, 1500);
    return () => window.clearTimeout(t);
  }, []);

  // entries 배열은 매 렌더 새 참조 → 완료 uid 시그니처로 비교
  const doneSig = entries
    .filter((e) => e.done)
    .map((e) => e.uid)
    .sort()
    .join(',');

  useEffect(() => {
    const nowDone = new Set(entries.filter((e) => e.done).map((e) => e.uid));
    const newly = [...nowDone].filter((u) => !prevDone.current.has(u));
    prevDone.current = nowDone;
    // 무장 전(초기 로드)에는 기존 완주자를 흡수만 하고 토스트하지 않음
    if (!armed.current || !newly.length) return;

    setFlashing((prev) => {
      const s = new Set(prev);
      newly.forEach((u) => s.add(u));
      return s;
    });
    newly.forEach((u) => {
      const name = entries.find((e) => e.uid === u)?.name ?? '학생';
      const id = ++idRef.current;
      setToasts((t) => [...t, { id, text: `🎉 ${name} 완주!` }]);
      window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
      window.setTimeout(
        () =>
          setFlashing((prev) => {
            const s = new Set(prev);
            s.delete(u);
            return s;
          }),
        2600,
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneSig]);

  return { flashing, toasts };
}
