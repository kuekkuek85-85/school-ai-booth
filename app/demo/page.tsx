import Link from 'next/link';

export default function DemoHomePage() {
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
      <h1 style={{ fontSize: '1.75rem' }}>데이터를 풀어라!</h1>
      <p>시연용 차시 웹앱 (T11부터 구현 예정)</p>
      <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>
        부스 홈으로 <Link href="/" style={{ textDecoration: 'underline' }}>돌아가기</Link>
      </p>
    </main>
  );
}
