'use client';
/**
 * 바구니 기반 강의 PPTX 생성 스튜디오.
 * [프롬프트 보기·복사] 팝업(편집 가능) + [PPTX 자동 생성](Gemini→pptx 다운로드).
 */
import { useMemo, useState } from 'react';
import { useBasket } from '@/lib/booth/basket';
import { useBoothSession } from '@/lib/booth/session';
import { BOOTH_ROUNDS } from '@/lib/data/missions';
import { buildDeckPrompt } from '@/lib/booth/deck';

export default function DeckStudio() {
  const { items } = useBasket();
  const { round } = useBoothSession();
  const contentTitle = round ? BOOTH_ROUNDS[round].title : '재구성 수업';

  const defaultPrompt = useMemo(() => buildDeckPrompt(items, contentTitle), [items, contentTitle]);
  const [prompt, setPrompt] = useState('');
  const [dirty, setDirty] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const empty = items.length === 0;
  const currentPrompt = () => (dirty ? prompt : defaultPrompt);

  function openModal() {
    if (!dirty) setPrompt(defaultPrompt);
    setOpen(true);
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(currentPrompt());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('아래 프롬프트를 복사하세요', currentPrompt());
    }
  }

  const [lastDl, setLastDl] = useState<string | null>(null);

  // 같은 프롬프트로 3개 AI가 만든 예시 pptx 다운로드 (API 비용 없음)
  function downloadPptx(file: string, fileName: string, label: string) {
    const a = document.createElement('a');
    a.href = file;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setLastDl(label);
    setTimeout(() => setLastDl(null), 2500);
  }

  const EXAMPLES: { label: string; file: string; name: string }[] = [
    { label: 'Claude', file: '/example-claude.pptx', name: '강의자료_Claude.pptx' },
    { label: 'ChatGPT', file: '/example-chatgpt.pptx', name: '강의자료_ChatGPT.pptx' },
    { label: 'Gemini', file: '/example-gemini.pptx', name: '강의자료_Gemini.pptx' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--lh-normal)' }}>
        지식그래프에서 <strong>바구니에 담은 활동</strong>으로 강의 PPTX 제작 프롬프트를 만들어 드립니다.
        <strong> 프롬프트를 복사해 본인 AI에 붙여넣으면</strong> 제목·목차·동기유발·활동 자료 링크·결론까지 담긴 강의자료를 만들 수 있습니다.
      </p>

      {empty && (
        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-warning)' }}>
          프롬프트를 만들려면 먼저 3. 지식그래프에서 활동을 바구니에 담아주세요.
        </p>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
        <button onClick={openModal} disabled={empty} style={{ ...btn, ...primaryBtn, opacity: empty ? 0.5 : 1 }}>
          📝 프롬프트 보기·복사
        </button>
        <span style={{ alignSelf: 'center', fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)' }}>
          담은 활동 {items.length}개
        </span>
      </div>

      {/* 같은 프롬프트 → 3개 AI 결과 비교 다운로드 */}
      <div style={{ marginTop: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-bold)' }}>
          🔬 같은 프롬프트로 만든 3개 AI 결과 비교(예시 다운로드)
        </span>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {EXAMPLES.map((ex) => (
            <button key={ex.label} onClick={() => downloadPptx(ex.file, ex.name, ex.label)} style={{ ...btn, ...secondaryBtn }}>
              {lastDl === ex.label ? `${ex.label} 내려받음 ✓` : `📥 ${ex.label}`}
            </button>
          ))}
        </div>
      </div>

      {/* 프롬프트 팝업 */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
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
              maxWidth: 720,
              maxHeight: '86vh',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              padding: 'var(--space-5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 'var(--fs-lg)' }}>PPTX 생성 프롬프트 (수정 가능)</h3>
              <button onClick={() => setOpen(false)} aria-label="닫기" style={{ fontSize: 'var(--fs-lg)', color: 'var(--color-text-muted)' }}>
                ✕
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setDirty(true);
              }}
              rows={16}
              style={{
                width: '100%',
                flex: 1,
                padding: 'var(--space-3)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--fs-sm)',
                fontFamily: 'var(--font-mono)',
                lineHeight: 'var(--lh-normal)',
                resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
              {dirty && (
                <button
                  onClick={() => {
                    setPrompt(defaultPrompt);
                    setDirty(false);
                  }}
                  style={{ ...btn, ...secondaryBtn }}
                >
                  기본값으로
                </button>
              )}
              <button onClick={copyPrompt} style={{ ...btn, ...primaryBtn }}>
                {copied ? '복사됨 ✓' : '복사하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const btn: React.CSSProperties = {
  padding: 'var(--space-2) var(--space-4)',
  borderRadius: 'var(--radius-md)',
  fontWeight: 'var(--fw-bold)',
  fontSize: 'var(--fs-sm)',
};
const primaryBtn: React.CSSProperties = {
  background: 'var(--color-primary)',
  color: 'var(--color-primary-contrast)',
};
const secondaryBtn: React.CSSProperties = {
  border: '1px solid var(--color-primary)',
  color: 'var(--color-primary)',
  background: 'transparent',
};
