'use client';
/** 재구성 바구니 — 활동 담기/빼기, localStorage 유지, 마크다운 내보내기. */
import { useCallback, useEffect, useState } from 'react';

export interface BasketItem {
  id: string; // activityId
  title: string;
  link: string;
  standards: string[];
  label: string; // "5-2" 등 차시-활동
}

const KEY = 'sai:booth:basket';

export function useBasket() {
  const [items, setItems] = useState<BasketItem[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const save = useCallback((next: BasketItem[]) => {
    setItems(next);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const add = useCallback(
    (item: BasketItem) => {
      setItems((prev) => {
        if (prev.some((x) => x.id === item.id)) return prev;
        const next = [...prev, item];
        window.localStorage.setItem(KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((x) => x.id !== id);
      window.localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => save([]), [save]);

  const has = useCallback((id: string) => items.some((x) => x.id === id), [items]);

  const exportMarkdown = useCallback(() => {
    const lines = [
      '# 재구성 활동 목록',
      '',
      '> 이 목록을 바이브 코딩에 넣으면 차시 웹앱이 됩니다.',
      '',
      ...items.map(
        (it) =>
          `- [${it.label} ${it.title}](${it.link}) — 성취기준: ${it.standards.join(', ') || '—'}`,
      ),
    ];
    return lines.join('\n');
  }, [items]);

  return { items, add, remove, clear, has, exportMarkdown };
}
