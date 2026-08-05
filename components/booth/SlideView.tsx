'use client';
/** 콘텐츠 설명 슬라이드 1장 렌더러 — Figma 색블록 포스터 스타일(전체화면). */
import type { Slide, SlideBlock } from '@/lib/booth/slides';
import StandardChip from '@/components/common/StandardChip';

const BLOCK_BG: Record<SlideBlock, string> = {
  white: 'var(--color-surface)',
  lime: 'var(--block-lime)',
  lilac: 'var(--block-lilac)',
  cream: 'var(--block-cream)',
  mint: 'var(--block-mint)',
  coral: 'var(--block-coral)',
  pink: 'var(--block-pink)',
  navy: 'var(--block-navy)',
};

export default function SlideView({ slide }: { slide: Slide }) {
  const dark = slide.block === 'navy';
  const fg = dark ? 'var(--color-text-invert)' : 'var(--color-text)';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: BLOCK_BG[slide.block],
        color: fg,
        display: 'flex',
        flexDirection: 'column',
        padding: 'clamp(24px, 4.5vw, 72px)',
        overflow: 'hidden',
      }}
    >
      {slide.layout === 'cover' || slide.layout === 'closing' ? (
        <CenterSlide slide={slide} fg={fg} />
      ) : (
        <>
          <p className="eyebrow" style={{ opacity: 0.85 }}>
            {slide.eyebrow}
          </p>
          <h2
            style={{
              fontSize: 'clamp(26px, 4.4vw, 56px)',
              fontWeight: 'var(--fw-normal)',
              letterSpacing: '-0.8px',
              lineHeight: 1.08,
              margin: 'clamp(8px,1.4vh,14px) 0 clamp(16px,3vh,34px)',
            }}
          >
            {slide.title}
          </h2>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            <Body slide={slide} />
          </div>
        </>
      )}
    </div>
  );
}

function CenterSlide({ slide, fg }: { slide: Slide; fg: string }) {
  const isCover = slide.layout === 'cover';
  return (
    <div
      style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: isCover && 'image' in slide && slide.image ? '1.1fr 0.9fr' : '1fr',
        gap: 'clamp(24px, 4vw, 64px)',
        alignItems: 'center',
      }}
    >
      <div>
        <p className="eyebrow" style={{ opacity: 0.85 }}>
          {slide.eyebrow}
        </p>
        <h1
          style={{
            fontSize: 'clamp(34px, 6vw, 84px)',
            fontWeight: 'var(--fw-normal)',
            letterSpacing: '-1.6px',
            lineHeight: 1.02,
            margin: 'clamp(12px,2vh,20px) 0',
          }}
        >
          {slide.title}
        </h1>
        {'subtitle' in slide && slide.subtitle && (
          <p style={{ fontSize: 'clamp(18px, 2.4vw, 30px)', fontWeight: 'var(--fw-normal)', color: fg, opacity: 0.9, lineHeight: 1.35 }}>
            {slide.subtitle}
          </p>
        )}
      </div>
      {isCover && 'image' in slide && slide.image && (
        <img
          src={slide.image}
          alt=""
          style={{
            width: '100%',
            maxHeight: '70vh',
            objectFit: 'contain',
            borderRadius: 'var(--radius-md)',
          }}
        />
      )}
    </div>
  );
}

function Body({ slide }: { slide: Slide }) {
  switch (slide.layout) {
    case 'overview':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: slide.image ? '1.2fr 0.8fr' : '1fr', gap: 'clamp(20px,3vw,48px)', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 'clamp(18px, 2.2vw, 28px)', lineHeight: 1.5 }}>{slide.body}</p>
            {slide.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-5)' }}>
                {slide.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 'var(--fs-md)',
                      fontWeight: 'var(--fw-medium)',
                      padding: '6px 16px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
          {slide.image && (
            <img src={slide.image} alt="" style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: 'var(--radius-md)' }} />
          )}
        </div>
      );

    case 'bullets':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px,2vh,22px)' }}>
          {slide.bullets.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'baseline' }}>
              <span className="caption" style={{ minWidth: 34, opacity: 0.6 }}>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <p style={{ fontSize: 'clamp(19px, 2.2vw, 30px)', fontWeight: 'var(--fw-bold)', lineHeight: 1.25 }}>{b.h}</p>
                {b.d && <p style={{ fontSize: 'clamp(15px, 1.5vw, 20px)', lineHeight: 1.45, marginTop: 4 }}>{b.d}</p>}
              </div>
            </div>
          ))}
        </div>
      );

    case 'proscons':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(16px,3vw,40px)' }}>
          <PcCol title="장점" mark="＋" markColor="var(--color-success)" items={slide.pros} />
          <PcCol title="유의점" mark="!" markColor="var(--color-warning)" items={slide.cons} />
        </div>
      );

    case 'lessons':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-3)' }}>
          {slide.lessons.map((l) => (
            <div key={l.no} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)' }}>
              <span
                style={{
                  minWidth: 34,
                  height: 34,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-primary)',
                  color: 'var(--color-primary-contrast)',
                  fontWeight: 'var(--fw-bold)',
                  fontSize: 'var(--fs-sm)',
                }}
              >
                {l.no}
              </span>
              <span style={{ fontSize: 'clamp(15px,1.5vw,19px)', fontWeight: 'var(--fw-medium)' }}>{l.title}</span>
            </div>
          ))}
        </div>
      );

    case 'standards':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {slide.items.map((it) => (
            <div key={it.code} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'baseline', flexWrap: 'wrap' }}>
              <StandardChip code={it.code} />
              <span style={{ fontSize: 'clamp(15px,1.6vw,21px)', lineHeight: 1.4 }}>
                <strong style={{ marginRight: 8 }}>{it.unit}</strong>
                {it.text}
              </span>
            </div>
          ))}
        </div>
      );

    case 'missions':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {slide.missions.map((m, i) => (
            <div key={i} style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 'var(--space-2)' }}>
                <span className="caption" style={{ opacity: 0.6 }}>미션 {i + 1}</span>
                <span className="caption" style={{ opacity: 0.6 }}>약 {m.minutes}분</span>
              </div>
              <p style={{ fontSize: 'clamp(17px,1.9vw,24px)', fontWeight: 'var(--fw-bold)', lineHeight: 1.3 }}>{m.title}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {m.standards.map((s) => (
                  <StandardChip key={s} code={s} />
                ))}
              </div>
              <p style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.4, borderLeft: '3px solid var(--color-teacher-eye)', paddingLeft: 'var(--space-3)' }}>
                👁 {m.note}
              </p>
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}

function PcCol({ title, mark, markColor, items }: { title: string; mark: string; markColor: string; items: string[] }) {
  return (
    <div>
      <p className="eyebrow" style={{ marginBottom: 'var(--space-3)' }}>{title}</p>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {items.map((it, i) => (
          <li key={i} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'baseline' }}>
            <span style={{ color: markColor, fontWeight: 'var(--fw-bold)', fontSize: 'clamp(18px,2vw,26px)', lineHeight: 1 }}>{mark}</span>
            <span style={{ fontSize: 'clamp(16px,1.7vw,22px)', lineHeight: 1.4 }}>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
