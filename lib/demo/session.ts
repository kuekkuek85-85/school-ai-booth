'use client';
/**
 * 차시앱 세션 상태 — 학번5+이름 입장, 익명 uid, sessions/{sessionId}/students 기록.
 * sessionId: ?s=booth-1500 쿼리 우선 → localStorage → 기본 booth-1200 (D2).
 */
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { serverTimestamp, setDoc } from 'firebase/firestore';
import { ensureAnonymousAuth } from '@/lib/firebase/auth';
import { studentDoc } from '@/lib/firebase/collections';
import { DEMO_SESSIONS, type DemoSessionId } from '@/lib/data/missions';

const PROFILE_KEY = 'sai:demo:profile';
const SESSION_KEY = 'sai:demo:session';
const DEFAULT_SESSION: DemoSessionId = 'booth-1200';

export interface DemoProfile {
  uid: string;
  studentNo: string;
  name: string;
  sessionId: string;
}

interface DemoSessionValue {
  ready: boolean;
  profile: DemoProfile | null;
  sessionId: string;
  enter: (studentNo: string, name: string) => Promise<void>;
}

const Ctx = createContext<DemoSessionValue | null>(null);

function readProfile(): DemoProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as DemoProfile) : null;
  } catch {
    return null;
  }
}

/**
 * 세션 결정 우선순위: 명시적 `?s=` 쿼리(유효 시) > 저장 프로필 세션 > localStorage > 기본.
 * 명시적 쿼리가 최우선이라, 재접속 학생이 `/demo?s=booth-1500`로 회차를 바꾸면 그대로 반영된다.
 */
function resolveSession(profile: DemoProfile | null): string {
  if (typeof window === 'undefined') return profile?.sessionId || DEFAULT_SESSION;
  const q = new URLSearchParams(window.location.search).get('s');
  if (q && (DEMO_SESSIONS as readonly string[]).includes(q)) {
    window.localStorage.setItem(SESSION_KEY, q);
    return q; // 명시적 쿼리 최우선
  }
  return (
    profile?.sessionId || window.localStorage.getItem(SESSION_KEY) || DEFAULT_SESSION
  );
}

export function DemoSessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<DemoProfile | null>(null);
  const [sessionId, setSessionId] = useState<string>(DEFAULT_SESSION);

  useEffect(() => {
    const p = readProfile();
    const s = resolveSession(p);
    // 쿼리로 세션이 바뀌었으면 저장 프로필도 갱신 → 이후 기록이 올바른 세션에 쌓임
    if (p && p.sessionId !== s) {
      const updated = { ...p, sessionId: s };
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      setProfile(updated);
    } else {
      setProfile(p);
    }
    setSessionId(s);
    setReady(true);
  }, []);

  const enter = useCallback(
    async (studentNo: string, name: string) => {
      const uid = await ensureAnonymousAuth();
      const p: DemoProfile = {
        uid,
        studentNo: studentNo.trim(),
        name: name.trim(),
        sessionId,
      };
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
      setProfile(p);
      await setDoc(
        studentDoc(sessionId, uid),
        { name: p.name, studentNo: p.studentNo, uid, joinedAt: serverTimestamp() },
        { merge: true },
      ).catch((e) => console.error('students 기록 실패', e));
    },
    [sessionId],
  );

  const value: DemoSessionValue = { ready, profile, sessionId, enter };
  return createElement(Ctx.Provider, { value }, children);
}

export function useDemoSession(): DemoSessionValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('DemoSessionProvider 안에서만 사용하세요');
  return v;
}
