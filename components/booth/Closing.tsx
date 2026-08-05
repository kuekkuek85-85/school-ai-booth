'use client';
/** S5 마무리 & 자료실 — 의견조사 QR · 설문 개요 · 이수증 경로 · 연락처 + 자료실. */
import QrCode from '@/components/common/QrCode';
import ResourceHub from '@/components/booth/ResourceHub';
import { SURVEY_URL, SAI_CONTACT } from '@/lib/constants';

export default function Closing() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h2 style={{ fontSize: 'var(--fs-2xl)' }}>마무리 & 자료실</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
          오늘 체험한 콘텐츠와 자료를 가져가세요.
        </p>
      </div>

      {/* 설문 QR + 개요 */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-6)',
          alignItems: 'center',
          padding: 'var(--space-5)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <QrCode value={SURVEY_URL} caption="의견조사 참여 QR" size={200} />
        <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <h3 style={{ fontSize: 'var(--fs-lg)' }}>의견조사 (경품 추첨)</h3>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)' }}>
            6항목 · 5점 리커트 척도. 경품 추첨을 위해 휴대폰 번호 수집에 동의를 받습니다.
          </p>
          <p style={{ fontSize: 'var(--fs-sm)' }}>
            <strong>이수증 발급</strong>: School AI 홈 → 학년별 배너 → [학습 도장 모으기]로
            완주 후 마지막 단계에서 이름 입력 → 출력(PDF 저장 권장).
          </p>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)' }}>
            문의: {SAI_CONTACT.phone} · {SAI_CONTACT.email}
          </p>
        </div>
      </div>

      {/* 자료실 */}
      <ResourceHub />

      <footer style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 'var(--space-4)' }}>
        이승엽(장평중학교) · 도트밸리 5·8·10차시 집필
      </footer>
    </section>
  );
}
