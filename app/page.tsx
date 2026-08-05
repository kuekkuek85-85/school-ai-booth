import Link from 'next/link';

export default function BoothHomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '1.75rem' }}>School AI 부스</h1>
      <p>부스 수강생 활동 플랫폼 (T06부터 구현 예정)</p>
      <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>
        시연용 차시 웹앱은 <Link href="/demo" style={{ textDecoration: 'underline' }}>/demo</Link> 에서 확인
      </p>
    </main>
  );
}
