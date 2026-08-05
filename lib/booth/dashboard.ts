'use client';
/** 강사 대시보드 데이터 — participants + progress onSnapshot 구독, 회차 리셋(파기). */
import { useEffect, useState } from 'react';
import { getDocs, deleteDoc, onSnapshot } from 'firebase/firestore';
import {
  participantsCol,
  boothProgressCol,
  type Participant,
  type BoothProgress,
} from '@/lib/firebase/collections';
import { ensureAnonymousAuth } from '@/lib/firebase/auth';

export interface DashboardRow {
  uid: string;
  school: string;
  name: string;
  m1: boolean;
  m2: boolean;
  m3: boolean;
  done: number;
}

export function useBoothDashboard(sessionId: string) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [progressByUid, setProgressByUid] = useState<Record<string, BoothProgress>>({});
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let alive = true;
    ensureAnonymousAuth()
      .then(() => alive && setAuthed(true))
      .catch((e) => console.error('대시보드 인증 실패', e));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!authed) return;
    const unsubP = onSnapshot(participantsCol(sessionId), (snap) => {
      setParticipants(snap.docs.map((d) => d.data()));
    });
    const unsubG = onSnapshot(boothProgressCol(sessionId), (snap) => {
      const map: Record<string, BoothProgress> = {};
      snap.docs.forEach((d) => {
        map[d.id] = d.data();
      });
      setProgressByUid(map);
    });
    return () => {
      unsubP();
      unsubG();
    };
  }, [authed, sessionId]);

  const rows: DashboardRow[] = participants
    .map((p) => {
      const g = progressByUid[p.uid];
      const m1 = !!g?.m1;
      const m2 = !!g?.m2;
      const m3 = !!g?.m3;
      return {
        uid: p.uid,
        school: p.school,
        name: p.name,
        m1,
        m2,
        m3,
        done: Number(m1) + Number(m2) + Number(m3),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  return { rows, count: participants.length };
}

/** 회차 리셋 = participants + progress 문서 일괄 삭제(파기) */
export async function resetBoothSession(sessionId: string): Promise<void> {
  await ensureAnonymousAuth();
  const [ps, gs] = await Promise.all([
    getDocs(participantsCol(sessionId)),
    getDocs(boothProgressCol(sessionId)),
  ]);
  await Promise.all([
    ...ps.docs.map((d) => deleteDoc(d.ref)),
    ...gs.docs.map((d) => deleteDoc(d.ref)),
  ]);
}

/** 이름 마스킹: 첫 글자만 노출 (이승엽 → 이**) */
export function maskName(name: string): string {
  if (name.length <= 1) return name;
  return name[0] + '*'.repeat(name.length - 1);
}
