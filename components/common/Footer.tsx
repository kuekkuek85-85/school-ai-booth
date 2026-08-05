'use client';
/**
 * 전역 푸터 — 이용약관·개인정보처리방침 링크. 클릭 시 모달로 전문 표시.
 * 히어로(다크 오로라) 화면 위에서도 읽히도록 솔리드 표면 배경 사용.
 */
import { useState } from 'react';

interface Section {
  h: string;
  p: string[];
}
interface LegalDoc {
  title: string;
  updated: string;
  intro?: string;
  sections: Section[];
}

const TERMS: LegalDoc = {
  title: '이용약관',
  updated: '시행일 2026년 8월 6일',
  intro:
    '본 약관은 교육 행사 현장에서 제공되는 체험형 서비스 「School AI 부스」(이하 “서비스”)의 이용 조건과 절차를 규정합니다.',
  sections: [
    {
      h: '제1조 (목적)',
      p: [
        '본 서비스는 2022 개정 정보과 성취기준에 기반한 교육 콘텐츠를 현장에서 체험·시연하기 위한 임시 서비스입니다. 콘텐츠 체험, 지식그래프 탐색, 강의자료 제작 프롬프트 제공, 진행 현황 확인 기능을 포함합니다.',
      ],
    },
    {
      h: '제2조 (이용 방법)',
      p: [
        '이용자는 행사 현장에서 소속(학교명)과 성함(차시 체험앱의 경우 학번·이름)을 입력하여 입장합니다.',
        '입력한 정보는 행사 진행 확인 및 참여 현황 표시 용도로만 사용됩니다.',
      ],
    },
    {
      h: '제3조 (이용자의 의무)',
      p: [
        '이용자는 타인의 정보를 도용하거나, 서비스의 정상적인 운영을 방해하는 행위를 하여서는 안 됩니다.',
      ],
    },
    {
      h: '제4조 (서비스의 성격 및 종료)',
      p: [
        '본 서비스는 교육 시연을 위한 한시적 서비스로, 행사 종료와 함께 운영이 종료되며 입력된 데이터는 파기됩니다.',
        '운영자는 행사 진행을 위하여 회차별 데이터를 초기화(파기)할 수 있습니다.',
      ],
    },
    {
      h: '제5조 (면책)',
      p: [
        '본 서비스는 현장 체험을 목적으로 제공되며, 콘텐츠는 교육용 예시입니다. 생성형 AI가 제공하는 피드백·자료는 참고용이며 정확성을 보증하지 않습니다.',
      ],
    },
    {
      h: '제6조 (문의)',
      p: ['서비스 이용에 관한 문의는 부스 현장 운영자에게 해주시기 바랍니다.'],
    },
  ],
};

const PRIVACY: LegalDoc = {
  title: '개인정보처리방침',
  updated: '시행일 2026년 8월 6일',
  intro:
    '「School AI 부스」는 행사 진행에 필요한 최소한의 정보만을 수집하며, 행사 종료 후 지체 없이 파기합니다.',
  sections: [
    {
      h: '1. 수집하는 개인정보 항목',
      p: [
        '· 부스: 소속(학교명), 성함',
        '· 차시 체험앱: 학번, 이름, 활동 진행 상황, 형성평가 응답 내용',
        '입장 시 브라우저에 익명 식별자(익명 인증)가 생성되며, 이는 본인의 진행 상황을 이어보기 위해 사용됩니다.',
      ],
    },
    {
      h: '2. 수집·이용 목적',
      p: [
        '행사 진행 확인, 참여 현황 대시보드 표시, 미션·활동 완료(완주) 확인 목적으로만 이용합니다.',
      ],
    },
    {
      h: '3. 보유 및 이용 기간',
      p: [
        '수집된 정보는 행사 진행 기간 동안에만 보유하며, 행사 종료 후 또는 운영자의 회차 리셋 시 지체 없이 삭제(파기)합니다.',
      ],
    },
    {
      h: '4. 제3자 제공 및 처리 위탁',
      p: [
        '수집한 개인정보를 외부에 제공하지 않습니다.',
        '데이터 저장을 위해 Google Firebase(Firestore) 서비스를 이용합니다.',
        '차시 체험앱의 AI 피드백 기능 이용 시, 이용자가 작성한 활동 결과물이 생성형 AI(Google Gemini) API로 전송될 수 있습니다. 이때 이름·학번 등 개인 식별 정보는 전송되지 않습니다.',
      ],
    },
    {
      h: '5. 이용자의 권리',
      p: [
        '이용자는 현장 운영자에게 요청하여 본인 정보의 열람 및 삭제를 요구할 수 있습니다.',
        '교사용 대시보드는 이름 마스킹 기능을 제공하여 화면 노출을 최소화합니다.',
      ],
    },
    {
      h: '6. 안전성 확보 조치',
      p: [
        '개인정보는 익명 인증 기반으로 처리되며, 행사 종료 후 파기를 원칙으로 합니다. 민감정보(주민등록번호 등)는 일절 수집하지 않습니다.',
      ],
    },
  ],
};

export default function Footer() {
  const [doc, setDoc] = useState<LegalDoc | null>(null);

  return (
    <>
      <footer
        style={{
          position: 'relative',
          zIndex: 1,
          marginTop: 'auto',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          padding: 'var(--space-4) var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}
      >
        <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => setDoc(TERMS)} style={linkBtn}>
            이용약관
          </button>
          <span aria-hidden style={{ color: 'var(--color-border)' }}>|</span>
          <button onClick={() => setDoc(PRIVACY)} style={{ ...linkBtn, fontWeight: 'var(--fw-bold)' }}>
            개인정보처리방침
          </button>
        </nav>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)' }}>
          © 2026 School AI 부스 · 교육 행사 체험용 한시 서비스
        </p>
      </footer>

      {doc && <LegalModal doc={doc} onClose={() => setDoc(null)} />}
    </>
  );
}

function LegalModal({ doc, onClose }: { doc: LegalDoc; onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={doc.title}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.5)',
        display: 'grid',
        placeItems: 'center',
        padding: 'var(--space-4)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 640,
          maxHeight: '86vh',
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-5)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div>
            <h2 style={{ fontSize: 'var(--fs-lg)' }}>{doc.title}</h2>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)' }}>{doc.updated}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            style={{ fontSize: 'var(--fs-lg)', color: 'var(--color-text-muted)', padding: 'var(--space-1)' }}
          >
            ✕
          </button>
        </header>

        <div style={{ overflowY: 'auto', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {doc.intro && (
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--lh-normal)' }}>
              {doc.intro}
            </p>
          )}
          {doc.sections.map((s) => (
            <section key={s.h} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 'var(--fw-bold)' }}>{s.h}</h3>
              {s.p.map((line, i) => (
                <p key={i} style={{ fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-normal)', color: 'var(--color-text)' }}>
                  {line}
                </p>
              ))}
            </section>
          ))}
        </div>

        <footer style={{ padding: 'var(--space-4) var(--space-5)', borderTop: '1px solid var(--color-border)', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{
              padding: 'var(--space-2) var(--space-5)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary)',
              color: 'var(--color-primary-contrast)',
              fontWeight: 'var(--fw-bold)',
              fontSize: 'var(--fs-sm)',
            }}
          >
            확인
          </button>
        </footer>
      </div>
    </div>
  );
}

const linkBtn: React.CSSProperties = {
  fontSize: 'var(--fs-sm)',
  color: 'var(--color-text-muted)',
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
};
