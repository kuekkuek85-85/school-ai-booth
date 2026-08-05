'use client';
/** 차시앱 대시보드 데이터 — students + progress onSnapshot. 동료 현황판/교사 대시보드 공용. */
import { useEffect, useState } from 'react';
import { getDocs, deleteDoc, onSnapshot } from 'firebase/firestore';
import {
  studentsCol,
  demoProgressCol,
  type Student,
  type DemoProgress,
} from '@/lib/firebase/collections';
import { ensureAnonymousAuth } from '@/lib/firebase/auth';
import { DEMO_STEPS } from '@/lib/data/missions';

export interface DemoRow {
  uid: string;
  name: string;
  studentNo: string;
  steps: DemoProgress['steps'];
  completed: number;
  currentLabel: string;
  artifact: string;
  quiz: DemoProgress['quiz'];
  level?: '상' | '중' | '하';
}

const STEP_ORDER = DEMO_STEPS.map((s) => s.id);

function currentLabel(steps: DemoProgress['steps']): string {
  let last = -1;
  STEP_ORDER.forEach((id, i) => {
    if (steps[id]) last = i;
  });
  return last < 0 ? '시작 전' : DEMO_STEPS[last].label;
}

export function useDemoDashboard(sessionId: string) {
  const [students, setStudents] = useState<Student[]>([]);
  const [progressByUid, setProgressByUid] = useState<Record<string, DemoProgress>>({});
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
    const unsubS = onSnapshot(studentsCol(sessionId), (snap) =>
      setStudents(snap.docs.map((d) => d.data())),
    );
    const unsubP = onSnapshot(demoProgressCol(sessionId), (snap) => {
      const map: Record<string, DemoProgress> = {};
      snap.docs.forEach((d) => (map[d.id] = d.data()));
      setProgressByUid(map);
    });
    return () => {
      unsubS();
      unsubP();
    };
  }, [authed, sessionId]);

  const rows: DemoRow[] = students
    .map((s) => {
      const g = progressByUid[s.uid];
      const steps = g?.steps ?? { intro: false, act1: false, act2: false, act3: false, quiz: false };
      const completed = Object.values(steps).filter(Boolean).length;
      return {
        uid: s.uid,
        name: s.name,
        studentNo: s.studentNo,
        steps,
        completed,
        currentLabel: currentLabel(steps),
        artifact: g?.artifact ?? '',
        quiz: g?.quiz ?? null,
        level: g?.feedback?.level,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  return { rows, count: students.length };
}

/** 세션 리셋 = students + progress 일괄 삭제 */
export async function resetDemoSession(sessionId: string): Promise<void> {
  await ensureAnonymousAuth();
  const [ss, ps] = await Promise.all([
    getDocs(studentsCol(sessionId)),
    getDocs(demoProgressCol(sessionId)),
  ]);
  await Promise.all([
    ...ss.docs.map((d) => deleteDoc(d.ref)),
    ...ps.docs.map((d) => deleteDoc(d.ref)),
  ]);
}
