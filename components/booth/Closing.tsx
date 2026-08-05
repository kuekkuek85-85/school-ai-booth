'use client';
/** S5 마무리 & 자료실 — 이수증 경로 · 연락처 + 자료실. (의견조사 제거) */
import ResourceHub from '@/components/booth/ResourceHub';
import { SAI_CONTACT } from '@/lib/constants';

export default function Closing() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h2 style={{ fontSize: 'var(--fs-2xl)' }}>마무리 & 자료실</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
          오늘 체험한 콘텐츠와 자료를 가져가세요.
        </p>
      </div>

      {/* 이수증 발급 + 문의 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
          padding: 'var(--space-5)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <h3 style={{ fontSize: 'var(--fs-lg)' }}>이수증 발급</h3>
        <p style={{ fontSize: 'var(--fs-sm)' }}>
          School AI 홈 → 학년별 배너 → [학습 도장 모으기]로 완주 후 마지막 단계에서 이름 입력 →
          출력(PDF 저장 권장).
        </p>
        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)' }}>
          문의: {SAI_CONTACT.phone} · {SAI_CONTACT.email}
        </p>
      </div>

      {/* 자료실 */}
      <ResourceHub />

      <footer style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 'var(--space-4)' }}>
        이승엽(장평중학교) · 도트밸리 5·8·10차시 집필
      </footer>
    </section>
  );
}
