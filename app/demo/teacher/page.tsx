'use client';
/** 차시앱 교사 대시보드 — PIN, 그리드·정답률·응답 리스트, 마스킹, 세션 리셋, activeSession 전환. */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PinGate from '@/components/common/PinGate';
import DemoGrid from '@/components/demo/DemoGrid';
import QuizStats from '@/components/demo/QuizStats';
import AnswerList from '@/components/demo/AnswerList';
import QrCode from '@/components/common/QrCode';
import { useDemoDashboard, resetDemoSession } from '@/lib/demo/dashboard';
import { DEMO_SESSIONS, type DemoSessionId } from '@/lib/data/missions';

export default function DemoTeacherPage() {
  return (
    <PinGate>
      <Dashboard />
    </PinGate>
  );
}

function Dashboard() {
  const [session, setSession] = useState<DemoSessionId>('booth-1200');
  const [masked, setMasked] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [origin, setOrigin] = useState('');
  const { rows, count } = useDemoDashboard(session);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  async function onReset() {
    if (!window.confirm(`${session} 세션 데이터를 모두 삭제(초기화)할까요?`)) return;
    setResetting(true);
    try {
      await resetDemoSession(session);
    } catch (e) {
      console.error(e);
      window.alert('리셋 중 오류가 발생했습니다.');
    } finally {
      setResetting(false);
    }
  }

  const studentUrl = origin ? `${origin}/demo?s=${session}` : '';

  return (
    <main className="theme-sos" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
          padding: 'var(--space-3) var(--space-5)',
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <h1 style={{ fontSize: 'var(--fs-xl)' }}>차시앱 교사 대시보드</h1>

        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--fs-sm)' }}>
          활성 세션
          <select
            value={session}
            onChange={(e) => setSession(e.target.value as DemoSessionId)}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontSize: 'var(--fs-sm)',
            }}
          >
            {DEMO_SESSIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <Link href="/demo/how" style={{ ...toolBtn, textDecoration: 'none' }}>
            이렇게 만들었어요
          </Link>
          <button onClick={() => setMasked((v) => !v)} style={toolBtn} aria-pressed={masked}>
            이름 마스킹 {masked ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={onReset}
            disabled={resetting}
            style={{ ...toolBtn, color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
          >
            {resetting ? '리셋 중…' : '세션 리셋'}
          </button>
        </div>
      </header>

      <div
        style={{
          maxWidth: 1000,
          margin: '0 auto',
          padding: 'var(--space-6) var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-5)',
        }}
      >
        {/* 학생 접속 QR + 인원 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-5)', alignItems: 'center' }}>
          {studentUrl && <QrCode value={studentUrl} caption={`학생 접속 (${session})`} size={140} />}
          <div style={{ fontSize: 'var(--fs-lg)', fontWeight: 'var(--fw-bold)' }}>참여자 {count}명</div>
        </div>

        <QuizStats rows={rows} />
        <DemoGrid rows={rows} masked={masked} />
        <AnswerList rows={rows} masked={masked} />
      </div>
    </main>
  );
}

const toolBtn: React.CSSProperties = {
  padding: 'var(--space-2) var(--space-3)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  fontSize: 'var(--fs-sm)',
  color: 'var(--color-text)',
  background: 'var(--color-surface)',
};
