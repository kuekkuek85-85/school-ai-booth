'use client';
/** 차시앱 입장 — 5자리 학번 + 이름. localStorage 복구. */
import { useState } from 'react';
import { useDemoSession } from '@/lib/demo/session';

export default function Entry() {
  const { enter } = useDemoSession();
  const [studentNo, setStudentNo] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = studentNo.trim().length > 0 && name.trim().length > 0 && !busy;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError('');
    try {
      await enter(studentNo, name);
    } catch {
      setError('입장 중 문제가 발생했습니다. 다시 시도해 주세요.');
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 'var(--space-5)' }}>
      <form
        onSubmit={onSubmit}
        style={{
          width: '100%',
          maxWidth: 400,
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
        <div>
          <h1 style={{ fontSize: 'var(--fs-xl)' }}>데이터를 풀어라!</h1>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)' }}>
            학번과 이름을 입력하고 시작하세요.
          </p>
        </div>

        <label style={fieldStyle}>
          <span style={labelStyle}>학번 (5자리)</span>
          <input
            value={studentNo}
            onChange={(e) => setStudentNo(e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
            inputMode="numeric"
            placeholder="예: 10203"
            style={inputStyle}
          />
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)' }}>
            학번이 없으면 <strong>0000 + 좌석번호</strong>로 입력하세요.
          </span>
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>이름</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 홍길동"
            autoComplete="off"
            style={inputStyle}
          />
        </label>

        {error && <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-danger)' }}>{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            fontWeight: 'var(--fw-bold)',
            background: canSubmit ? 'var(--color-primary)' : 'var(--color-surface-2)',
            color: canSubmit ? 'var(--color-primary-contrast)' : 'var(--color-text-muted)',
          }}
        >
          {busy ? '입장 중…' : '시작하기'}
        </button>
      </form>
    </main>
  );
}

const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' };
const labelStyle: React.CSSProperties = { fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-medium)' };
const inputStyle: React.CSSProperties = {
  padding: 'var(--space-3)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--fs-md)',
};
