'use client';
/** 차시앱 대시보드 데이터 — students + progress onSnapshot. 동료 현황판/교사 대시보드 공용. */
import { useEffect, useState } from 'react';
import { getDoc, getDocs, deleteDoc, onSnapshot } from 'firebase/firestore';
import {
  studentsCol,
  demoProgressCol,
  worksheetDoc,
  type Student,
  type DemoProgress,
} from '@/lib/firebase/collections';
import { ensureAnonymousAuth } from '@/lib/firebase/auth';
import { DEMO_STEPS } from '@/lib/data/missions';

export interface DemoRow {
  uid: string;
  name: string;
  studentNo: string;
  completed: number;
  total: number;
  currentLabel: string;
  artifact: string;
  quiz: DemoProgress['quiz'];
  level?: '상' | '중' | '하';
}

/** 발행된 활동지 기준 단계 key/label. 없으면 기본 고정 차시. */
interface StepMeta {
  keys: string[];
  labels: string[];
}

const DEFAULT_META: StepMeta = {
  keys: DEMO_STEPS.map((s) => s.id),
  labels: DEMO_STEPS.map((s) => s.label),
};

function currentLabel(steps: Record<string, boolean>, meta: StepMeta): string {
  let last = -1;
  meta.keys.forEach((k, i) => {
    if (steps[k]) last = i;
  });
  return last < 0 ? '시작 전' : meta.labels[last];
}

export function useDemoDashboard(sessionId: string) {
  const [students, setStudents] = useState<Student[]>([]);
  const [progressByUid, setProgressByUid] = useState<Record<string, DemoProgress>>({});
  const [meta, setMeta] = useState<StepMeta>(DEFAULT_META);
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

  // 발행된 활동지로 단계 총수·라벨 파악
  useEffect(() => {
    if (!authed) return;
    getDoc(worksheetDoc())
      .then((snap) => {
        const w = snap.data();
        if (w && w.activities.length) {
          const keys = w.activities.map((_, i) => `act${i}`).concat('quiz');
          const labels = w.activities
            .map((_, i) => (i === 0 ? '도입' : `활동 ${i}`))
            .concat('형성평가');
          setMeta({ keys, labels });
        } else {
          setMeta(DEFAULT_META);
        }
      })
      .catch(() => setMeta(DEFAULT_META));
  }, [authed]);

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

  const total = meta.keys.length;
  const rows: DemoRow[] = students
    .map((s) => {
      const g = progressByUid[s.uid];
      const steps = g?.steps ?? {};
      const completed = Object.values(steps).filter(Boolean).length;
      return {
        uid: s.uid,
        name: s.name,
        studentNo: s.studentNo,
        completed: Math.min(completed, total),
        total,
        currentLabel: currentLabel(steps, meta),
        artifact: g?.artifact ?? '',
        quiz: g?.quiz ?? null,
        level: g?.feedback?.level,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  return { rows, count: students.length, total };
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
