'use client';
/** 자료실 — 매뉴얼 PDF 4종 직다운로드 + School AI 초·중·고 콘텐츠 원본 링크. */
import { CONTENTS, SAI_CATALOG } from '@/lib/data/content';
import { MANUAL_SIZES } from '@/lib/constants';
import type { ContentId } from '@/lib/theme/tokens';

const CONTENT_LABEL: Record<ContentId, string> = {
  dotvalley: '도트밸리 속 버그를 잡아라',
  sos: 'S.O.S 세계수를 구하라',
};

export default function ResourceHub() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* 매뉴얼 PDF 4종 */}
      <div>
        <h3 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--space-3)' }}>
          매뉴얼 PDF 다운로드
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--space-3)',
          }}
        >
          {CONTENTS.map((c) => {
            const sizes = MANUAL_SIZES[c.id];
            return (
              <div
                key={c.id}
                style={{
                  padding: 'var(--space-4)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)',
                }}
              >
                <strong style={{ fontSize: 'var(--fs-sm)' }}>{CONTENT_LABEL[c.id]}</strong>
                <a href={c.guides.student} target="_blank" rel="noopener noreferrer" style={dlStyle}>
                  📘 학생용 매뉴얼 <span style={sizeStyle}>{sizes.student}</span>
                </a>
                <a href={c.guides.teacher} target="_blank" rel="noopener noreferrer" style={dlStyle}>
                  📗 교사용 매뉴얼 <span style={sizeStyle}>{sizes.teacher}</span>
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* School AI 콘텐츠 바로가기 */}
      <div>
        <h3 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--space-3)' }}>
          School AI 콘텐츠 바로가기
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-3)',
          }}
        >
          <CatalogGroup title="초등" items={SAI_CATALOG.elementary} />
          <CatalogGroup title="중학" items={SAI_CATALOG.middle} />
          <CatalogGroup title="고교" items={SAI_CATALOG.high} />
        </div>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-3)' }}>
          고교 프로젝트: {SAI_CATALOG.highProjects.map((p) => p.title).join(' · ')}
        </p>
        <a
          href={SAI_CATALOG.platformHome}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...dlStyle, marginTop: 'var(--space-2)', color: 'var(--color-primary)' }}
        >
          🏠 School AI 홈 ({SAI_CATALOG.platformHome})
        </a>
      </div>
    </section>
  );
}

function CatalogGroup({ title, items }: { title: string; items: { title: string; url: string }[] }) {
  return (
    <div
      style={{
        padding: 'var(--space-3)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-surface)',
      }}
    >
      <h4 style={{ fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-2)' }}>{title}</h4>
      <ul style={{ display: 'flex', flexDirection: 'column', gap: 4, listStyle: 'none' }}>
        {items.map((it) => (
          <li key={it.url}>
            <a
              href={it.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-primary)' }}
            >
              {it.title} ↗
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

const dlStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
  fontSize: 'var(--fs-sm)',
  padding: 'var(--space-2)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--color-surface-2)',
};

const sizeStyle: React.CSSProperties = {
  marginLeft: 'auto',
  fontSize: 'var(--fs-xs)',
  color: 'var(--color-text-muted)',
};
