'use client';
/**
 * 익명 인증 (D4). 입장 시 자동 익명 로그인 → uid를 pid로 사용.
 * 익명 세션은 브라우저 로컬 지속 → 새로고침·재접속 시 동일 uid 복구.
 */
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase/app';

let uidPromise: Promise<string> | null = null;

/** 익명 uid 확보. 이미 로그인돼 있으면 그 uid, 아니면 익명 로그인. */
export function ensureAnonymousAuth(): Promise<string> {
  if (auth.currentUser) return Promise.resolve(auth.currentUser.uid);
  if (uidPromise) return uidPromise;

  uidPromise = new Promise<string>((resolve, reject) => {
    const unsub = onAuthStateChanged(
      auth,
      async (user) => {
        unsub();
        if (user) {
          resolve(user.uid);
          return;
        }
        try {
          const cred = await signInAnonymously(auth);
          resolve(cred.user.uid);
        } catch (err) {
          uidPromise = null;
          reject(err);
        }
      },
      (err) => {
        unsub();
        uidPromise = null;
        reject(err);
      },
    );
  });

  return uidPromise;
}

/** 현재 uid (없으면 null) */
export function currentUid(): string | null {
  return auth.currentUser?.uid ?? null;
}
