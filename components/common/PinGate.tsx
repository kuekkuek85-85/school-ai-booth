'use client';
/** PIN 게이트 — /api/verify-pin 서버 검증 후 자식 렌더. 성공은 sessionStorage에 저장. */
import { useEffect, useState } from 'react';

const OK_KEY = 'sai:teacher:ok';

export default function PinGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false);
  const [ready, setReady] = useState(false);
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setOk(sessionStorage.getItem(OK_KEY) === '1');
    setReady(true);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = (await res.json()) as { ok: boolean };
      if (data.ok) {
        sessionStorage.setItem(OK_KEY, '1');
        setOk(true);
      } else {
        setError('PIN이 올바르지 않습니다.');
      }
    } catch {
      setError('검증 중 오류가 발생했습니다.');
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return null;
  if (ok) return <>{children}</>;

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 'var(--space-5)' }}>
      <form
        onSubmit={submit}
        style={{
          width: '100%',
          maxWidth: 360,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        <h1 style={{ fontSize: 'var(--fs-xl)' }}>대시보드 잠금</h1>
        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)' }}>
          PIN을 입력하세요.
        </p>
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          type="password"
          inputMode="numeric"
          autoComplete="off"
          placeholder="PIN"
          style={{
            padding: 'var(--space-3)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--fs-lg)',
            letterSpacing: '0.3em',
            textAlign: 'center',
          }}
        />
        {error && <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-danger)' }}>{error}</p>}
        <button
          type="submit"
          disabled={busy || pin.length === 0}
          style={{
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-primary)',
            color: 'var(--color-primary-contrast)',
            fontWeight: 'var(--fw-bold)',
          }}
        >
          {busy ? '확인 중…' : '입장'}
        </button>
      </form>
    </main>
  );
}
