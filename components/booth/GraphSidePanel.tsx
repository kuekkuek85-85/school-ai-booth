'use client';
/** 지식그래프 사이드 패널 — 선택 노드(성취기준/차시/활동)의 상세 + 활동 바구니 담기. */
import type { GNode } from '@/lib/data/graph';
import { getLesson, type Activity } from '@/lib/data/content';
import { standardText, lessonMapping, lessonsForStandard } from '@/lib/data/standards';
import { activityId } from '@/lib/data/graph';
import type { BasketItem } from '@/lib/booth/basket';
import type { ContentId } from '@/lib/theme/tokens';

interface Props {
  node: GNode | null;
  onAdd: (item: BasketItem) => void;
  has: (id: string) => boolean;
}

export default function GraphSidePanel({ node, onAdd, has }: Props) {
  if (!node) {
    return (
      <Aside>
        <p style={muted}>노드를 클릭하면 상세가 표시됩니다.</p>
        <ul style={{ ...muted, paddingLeft: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
          <li>대단원/성취기준 클릭 → 차시 확장</li>
          <li>차시 클릭 → 활동 확장</li>
          <li>활동 → 바구니에 담기</li>
        </ul>
      </Aside>
    );
  }

  if (node.kind === 'standard') {
    const code = node.meta.code as string;
    const refs = lessonsForStandard(code);
    return (
      <Aside>
        <Badge>성취기준</Badge>
        <h3 style={title}>{code}</h3>
        <p style={{ fontSize: 'var(--fs-sm)' }}>{standardText(code)}</p>
        <h4 style={subTitle}>연계 차시 ({refs.length})</h4>
        <ul style={list}>
          {refs.map((r) => (
            <li key={`${r.contentId}-${r.lessonNo}`} style={{ fontSize: 'var(--fs-sm)' }}>
              {r.contentId === 'dotvalley' ? '도트밸리' : '세계수'} {r.lessonNo}차시 · {getLesson(r.contentId, r.lessonNo).title}{' '}
              {r.relation === 'secondary' && <em style={muted}>(보조)</em>}
            </li>
          ))}
        </ul>
      </Aside>
    );
  }

  if (node.kind === 'lesson') {
    const cid = node.meta.contentId as ContentId;
    const lessonNo = node.meta.lessonNo as number;
    const lesson = getLesson(cid, lessonNo);
    const stds = lessonMapping(cid, lessonNo).primary;
    return (
      <Aside>
        <Badge>차시</Badge>
        <h3 style={title}>{lessonNo}. {lesson.title}</h3>
        <h4 style={subTitle}>활동 ({lesson.activities.length})</h4>
        <ul style={list}>
          {lesson.activities.map((a) => (
            <ActivityRow key={a.no} cid={cid} lessonNo={lessonNo} activity={a} standards={stds} onAdd={onAdd} has={has} />
          ))}
        </ul>
      </Aside>
    );
  }

  if (node.kind === 'activity') {
    const cid = node.meta.contentId as ContentId;
    const lessonNo = node.meta.lessonNo as number;
    const a = node.meta.activity as Activity;
    const stds = lessonMapping(cid, lessonNo).primary;
    return (
      <Aside>
        <Badge>활동</Badge>
        <h3 style={title}>{a.title}</h3>
        <ul style={list}>
          <ActivityRow cid={cid} lessonNo={lessonNo} activity={a} standards={stds} onAdd={onAdd} has={has} />
        </ul>
      </Aside>
    );
  }

  // unit / content
  return (
    <Aside>
      <Badge>{node.kind === 'unit' ? '대단원' : '콘텐츠'}</Badge>
      <h3 style={title}>{node.label}</h3>
      <p style={muted}>하위 노드를 클릭해 탐색하세요.</p>
    </Aside>
  );
}

function ActivityRow({
  cid,
  lessonNo,
  activity,
  standards,
  onAdd,
  has,
}: {
  cid: ContentId;
  lessonNo: number;
  activity: Activity;
  standards: string[];
  onAdd: (item: BasketItem) => void;
  has: (id: string) => boolean;
}) {
  const id = activityId(cid, lessonNo, activity.no);
  const added = has(id);
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--fs-sm)' }}>
      <span aria-hidden>{activity.type === 'video' ? '🎬' : '🕹️'}</span>
      <span style={{ flex: 1 }}>{activity.title}</span>
      <a href={activity.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>
        열기 ↗
      </a>
      <button
        onClick={() =>
          onAdd({
            id,
            title: activity.title,
            link: activity.link,
            standards,
            label: `${lessonNo}-${activity.no}`,
          })
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
}

function Aside({ children }: { children: React.ReactNode }) {
  return (
    <aside
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        overflowY: 'auto',
      }}
    >
      {children}
    </aside>
  );
}
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ alignSelf: 'flex-start', fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-bold)', color: 'var(--color-primary)' }}>
      {children}
    </span>
  );
}

const title: React.CSSProperties = { fontSize: 'var(--fs-lg)' };
const subTitle: React.CSSProperties = { fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' };
const list: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', listStyle: 'none' };
const muted: React.CSSProperties = { fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)' };
