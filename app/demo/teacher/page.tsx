'use client';
/** 차시앱 교사 대시보드 — PIN, 그리드·정답률·응답 리스트, 마스킹, 세션 리셋, activeSession 전환. */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PinGate from '@/components/common/PinGate';
import DemoGrid from '@/components/demo/DemoGrid';
import QuizStats from '@/components/demo/QuizStats';
import AnswerList from '@/components/demo/AnswerList';
import QrCode from '@/components/common/QrCode';
import KpiTiles from '@/components/common/KpiTiles';
import Toasts from '@/components/common/Toasts';
import { useDemoDashboard, resetDemoSession } from '@/lib/demo/dashboard';
import { useCompletionAlerts } from '@/lib/common/useCompletionAlerts';
import { DEMO_SESSIONS, type DemoSessionId } from '@/lib/data/missions';
import GradientText from '@/components/reactbits/GradientText';

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
  const doneCount = rows.filter((r) => r.total > 0 && r.completed >= r.total).length;
  const quizzed = rows.filter((r) => r.quiz);
  const correct = quizzed.filter((r) => r.quiz && r.quiz.score >= 1).length;
  const quizRate = quizzed.length ? Math.round((correct / quizzed.length) * 100) : 0;
  const { flashing, toasts } = useCompletionAlerts(
    rows.map((r) => ({ uid: r.uid, done: r.total > 0 && r.completed >= r.total, name: r.name })),
  );

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
    <main className="theme-sos animated-mesh" style={{ minHeight: '100vh' }}>
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
        <GradientText as="h1" colors={['#d97706', '#fbbf24', '#ec4899', '#d97706']} animationSpeed={9} style={{ fontSize: 'var(--fs-xl)', fontWeight: 'var(--fw-bold)' }}>
          차시앱 교사 대시보드
        </GradientText>

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
        {/* 학생 접속 QR + KPI */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-5)', alignItems: 'center' }}>
          {studentUrl && <QrCode value={studentUrl} caption={`학생 접속 (${session})`} size={140} />}
          <div style={{ flex: 1, minWidth: 300 }}>
            <KpiTiles
              items={[
                { label: '참여자', value: `${count}명` },
                { label: '완주', value: `${doneCount}명`, sub: `${count ? Math.round((doneCount / count) * 100) : 0}%`, accent: true },
                { label: '객관식 정답률', value: `${quizRate}%`, sub: `제출 ${quizzed.length}명` },
              ]}
            />
          </div>
        </div>

        <QuizStats rows={rows} />
        <DemoGrid rows={rows} masked={masked} flashing={flashing} />
        <AnswerList rows={rows} masked={masked} />
      </div>
      <Toasts toasts={toasts} />
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
