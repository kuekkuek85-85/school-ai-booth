'use client';
/** 재구성 바구니 → 차시앱 발행. worksheets/active 문서에 성취기준·활동 저장. */
import { serverTimestamp, setDoc } from 'firebase/firestore';
import { ensureAnonymousAuth } from '@/lib/firebase/auth';
import { worksheetDoc } from '@/lib/firebase/collections';
import type { BasketItem } from '@/lib/booth/basket';

/** 바구니 활동들의 성취기준(중복 제거)·활동 목록을 발행 */
export async function publishBasket(items: BasketItem[]): Promise<void> {
  await ensureAnonymousAuth();
  const standards = Array.from(new Set(items.flatMap((it) => it.standards)));
  const activities = items.map((it) => ({
    title: it.title,
    label: it.label,
    link: it.link,
  }));
  await setDoc(worksheetDoc(), {
    standards,
    activities,
    createdAt: serverTimestamp(),
  });
}
