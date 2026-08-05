'use client';
/** S0 입장 게이트 — 소속(학교)·성함 입력 후 입장. 익명 인증 + localStorage 저장. */
import { useState } from 'react';
import { useBoothSession } from '@/lib/booth/session';

export default function EntryGate() {
  const { enter } = useBoothSession();
  const [school, setSchool] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = school.trim().length > 0 && name.trim().length > 0 && !busy;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError('');
    try {
      await enter(school, name);
    } catch {
      setError('입장 중 문제가 발생했습니다. 네트워크를 확인하고 다시 시도해 주세요.');
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 'var(--space-5)',
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: '100%',
          maxWidth: 420,
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
          <h1 style={{ fontSize: 'var(--fs-xl)', marginBottom: 'var(--space-1)' }}>
            School AI 부스 입장
          </h1>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)' }}>
            소속과 성함을 입력하고 입장하세요.
          </p>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-medium)' }}>
            소속 (학교명)
          </span>
          <input
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="예: 장평중학교"
            autoComplete="off"
            style={inputStyle}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-medium)' }}>
            성함
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 이승엽"
            autoComplete="off"
            style={inputStyle}
          />
        </label>

        {error && (
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-danger)' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            background: canSubmit ? 'var(--color-primary)' : 'var(--color-surface-2)',
            color: canSubmit ? 'var(--color-primary-contrast)' : 'var(--color-text-muted)',
            fontWeight: 'var(--fw-bold)',
            transition: 'background var(--dur-fast) var(--ease-standard)',
          }}
        >
          {busy ? '입장 중…' : '입장하기'}
        </button>

        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)', lineHeight: 'var(--lh-normal)' }}>
          입력한 소속·성함은 행사 진행 확인 용도로만 사용하며, 행사 종료 후 파기합니다.
        </p>
      </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: 'var(--space-3)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--fs-md)',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
};
