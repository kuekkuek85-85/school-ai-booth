'use client';
/** 2D 목록 보기(그래프 폴백) — 콘텐츠·차시 아코디언 + 성취기준 칩 필터 + 활동 딥링크·바구니. */
import { useState } from 'react';
import { CONTENTS } from '@/lib/data/content';
import { lessonMapping } from '@/lib/data/standards';
import { activityId } from '@/lib/data/graph';
import StandardChip from '@/components/common/StandardChip';
import { ALL_STANDARD_CODES } from '@/lib/data/standards';
import type { BasketItem } from '@/lib/booth/basket';

interface Props {
  onAdd: (item: BasketItem) => void;
  has: (id: string) => boolean;
}

export default function ListFallback({ onAdd, has }: Props) {
  const [filter, setFilter] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--fs-sm)' }}>
        성취기준 필터
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
        >
          <option value="">전체</option>
          {ALL_STANDARD_CODES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      {CONTENTS.map((c) => {
        const lessons = c.lessons.filter((l) => {
          if (!filter) return true;
          const m = lessonMapping(c.id, l.no);
          return m.primary.includes(filter) || m.secondary.includes(filter);
        });
        if (lessons.length === 0) return null;
        return (
          <div key={c.id}>
            <h3 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--space-2)' }}>
              {c.id === 'dotvalley' ? '도트밸리 속 버그를 잡아라' : 'S.O.S 세계수를 구하라'}
            </h3>
            {lessons.map((l) => {
              const m = lessonMapping(c.id, l.no);
              return (
                <details key={l.no} style={{ borderBottom: '1px solid var(--color-border)', padding: 'var(--space-2) 0' }}>
                  <summary style={{ cursor: 'pointer', display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: 'var(--fs-sm)' }}>{l.no}. {l.title}</strong>
                    {m.primary.map((code) => (
                      <StandardChip key={code} code={code} instructor={c.id === 'dotvalley'} />
                    ))}
                  </summary>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4, marginTop: 'var(--space-2)', paddingLeft: 'var(--space-4)' }}>
                    {l.activities.map((a) => {
                      const id = activityId(c.id, l.no, a.no);
                      const added = has(id);
                      return (
                        <li key={a.no} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--fs-sm)' }}>
                          <span aria-hidden>{a.type === 'video' ? '🎬' : '🕹️'}</span>
                          <span style={{ flex: 1 }}>{a.title}</span>
                          <a href={a.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>
                            열기 ↗
                          </a>
                          <button
                            onClick={() =>
                              onAdd({ id, title: a.title, link: a.link, standards: m.primary, label: `${l.no}-${a.no}` })
                            }
                            disabled={added}
                            style={{
                              fontSize: 'var(--fs-xs)',
                              padding: '2px var(--space-2)',
                              borderRadius: 'var(--radius-full)',
                              border: '1px solid var(--color-primary)',
                              color: added ? 'var(--color-text-muted)' : 'var(--color-primary)',
                              background: added ? 'var(--color-surface-2)' : 'transparent',
                            }}
                          >
                            {added ? '담김' : '+ 바구니'}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
