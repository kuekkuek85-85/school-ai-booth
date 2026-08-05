'use client';
/**
 * 부스 세션 상태: 입장(소속·성함)·익명 uid·회차(해시)·강사 모드.
 * pid/localStorage 복구 및 participants 기록(idempotent).
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
import { participantDoc } from '@/lib/firebase/collections';
import { BOOTH_ROUNDS } from '@/lib/data/missions';
import type { ContentId } from '@/lib/theme/tokens';

const PROFILE_KEY = 'sai:booth:profile';

export interface BoothProfile {
  uid: string;
  school: string;
  name: string;
}

interface BoothSessionValue {
  ready: boolean;
  profile: BoothProfile | null;
  round: ContentId | null;
  isPresenter: boolean;
  sessionId: string | null;
  /** 소속·성함 입장 → 익명 인증 + 프로필 저장 */
  enter: (school: string, name: string) => Promise<void>;
  /** 회차 선택 → 해시 갱신 */
  selectRound: (cid: ContentId) => void;
  /** 회차 재선택으로 돌아가기 */
  clearRound: () => void;
}

const Ctx = createContext<BoothSessionValue | null>(null);

function readProfile(): BoothProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as BoothProfile) : null;
  } catch {
    return null;
  }
}

function hashToRound(): ContentId | null {
  if (typeof window === 'undefined') return null;
  const h = window.location.hash.replace('#', '');
  return h === 'dotvalley' || h === 'sos' ? h : null;
}

export function BoothSessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<BoothProfile | null>(null);
  const [round, setRound] = useState<ContentId | null>(null);
  const [isPresenter, setIsPresenter] = useState(false);

  // 초기 하이드레이션: localStorage 프로필 + 해시 회차 + presenter 쿼리
  useEffect(() => {
    setProfile(readProfile());
    setRound(hashToRound());
    const params = new URLSearchParams(window.location.search);
    setIsPresenter(params.get('presenter') === '1');
    setReady(true);

    const onHash = () => setRound(hashToRound());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const enter = useCallback(async (school: string, name: string) => {
    const uid = await ensureAnonymousAuth();
    const p: BoothProfile = { uid, school: school.trim(), name: name.trim() };
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    setProfile(p);
  }, []);

  const selectRound = useCallback((cid: ContentId) => {
    window.location.hash = cid;
    setRound(cid);
  }, []);

  const clearRound = useCallback(() => {
    window.location.hash = '';
    setRound(null);
  }, []);

  const sessionId = round ? BOOTH_ROUNDS[round].sessionId : null;

  // 학생: 프로필+회차 확정 시 participants 기록(idempotent, merge)
  useEffect(() => {
    if (isPresenter || !profile || !sessionId) return;
    void setDoc(
      participantDoc(sessionId, profile.uid),
      {
        school: profile.school,
        name: profile.name,
        uid: profile.uid,
        joinedAt: serverTimestamp(),
      },
      { merge: true },
    ).catch((e) => console.error('participants 기록 실패', e));
  }, [isPresenter, profile, sessionId]);

  const value: BoothSessionValue = {
    ready,
    profile,
    round,
    isPresenter,
    sessionId,
    enter,
    selectRound,
    clearRound,
  };

  return createElement(Ctx.Provider, { value }, children);
}

export function useBoothSession(): BoothSessionValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('BoothSessionProvider 안에서만 사용하세요');
  return v;
}
