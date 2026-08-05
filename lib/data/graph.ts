/**
 * 3D 지식그래프 노드/간선 빌더 (stateless).
 * 노드 계층: 대단원(5) → 성취기준(25) → 콘텐츠(2) → 차시(18) → 활동(232)
 * 점진 확장(성능 예산: 확장 노드 200 이하)은 T14 컴포넌트가 이 빌더들로 상태를 조립한다.
 */
import type { ContentId } from '@/lib/theme/tokens';
import { UNIT_COLORS, shade } from '@/lib/theme/tokens';
import {
  STANDARDS,
  UNIT_CODES,
  ALL_STANDARD_CODES,
  standardText,
  unitName,
  lessonsForStandard,
} from '@/lib/data/standards';
import { CONTENTS, getContent, getLesson } from '@/lib/data/content';

export type NodeKind = 'unit' | 'standard' | 'content' | 'lesson' | 'activity';

export interface GNode {
  id: string;
  kind: NodeKind;
  label: string;
  unit: string; // 소속 대단원 코드(색 결정)
  color: string;
  meta: Record<string, unknown>;
}

export interface GLink {
  source: string;
  target: string;
  kind: 'unit-standard' | 'standard-lesson' | 'content-lesson' | 'lesson-activity';
  style: 'solid' | 'dashed';
  instructor: boolean; // 도트밸리(강사 재구성안) 매핑 간선 구분
}

export interface GraphPatch {
  nodes: GNode[];
  links: GLink[];
}

/* ---- ID 규약 ---- */
export const unitId = (u: string) => `unit:${u}`;
export const stdId = (c: string) => `std:${c}`;
export const contentId = (c: ContentId) => `content:${c}`;
export const lessonId = (c: ContentId, n: number) => `lesson:${c}-${n}`;
export const activityId = (c: ContentId, l: number, a: number) =>
  `act:${c}-${l}-${a}`;

const unitColor = (u: string) => UNIT_COLORS[u] ?? '#94a3b8';

/**
 * 초기 그래프: 대단원 5 + 성취기준 25 + (대단원—성취기준) 간선.
 * 활동 232개는 처음부터 그리지 않는다(헤어볼 방지).
 */
export function buildInitialGraph(): GraphPatch {
  const nodes: GNode[] = [];
  const links: GLink[] = [];

  UNIT_CODES.forEach((u) => {
    nodes.push({
      id: unitId(u),
      kind: 'unit',
      label: `${u} ${unitName(u)}`,
      unit: u,
      color: unitColor(u),
      meta: { unitCode: u },
    });
    Object.keys(STANDARDS[u].codes).forEach((code) => {
      nodes.push({
        id: stdId(code),
        kind: 'standard',
        label: code,
        unit: u,
        color: shade(unitColor(u), 0.15),
        meta: { code, text: standardText(code) },
      });
      links.push({
        source: unitId(u),
        target: stdId(code),
        kind: 'unit-standard',
        style: 'solid',
        instructor: false,
      });
    });
  });

  return { nodes, links };
}

/**
 * 성취기준 확장: 해당 성취기준에 매핑된 차시 노드(콘텐츠 허브 경유)와 간선 추가.
 * - standard—lesson: primary=실선 / secondary=점선, 도트밸리는 instructor=true
 * - content—lesson: 소속(실선)
 */
export function expandStandard(code: string): GraphPatch {
  const nodes: GNode[] = [];
  const links: GLink[] = [];
  const seenContent = new Set<string>();
  const seenLesson = new Set<string>();

  lessonsForStandard(code).forEach(({ contentId: cid, lessonNo, relation }) => {
    const c = getContent(cid);
    const l = getLesson(cid, lessonNo);
    const cId = contentId(cid);
    const lId = lessonId(cid, lessonNo);
    const cUnit = code.slice(0, 5);

    if (!seenContent.has(cId)) {
      seenContent.add(cId);
      nodes.push({
        id: cId,
        kind: 'content',
        label: c.title,
        unit: cUnit,
        color: shade(unitColor(cUnit), 0.35),
        meta: { contentId: cid },
      });
    }
    if (!seenLesson.has(lId)) {
      seenLesson.add(lId);
      nodes.push({
        id: lId,
        kind: 'lesson',
        label: `${lessonNo}. ${l.title}`,
        unit: cUnit,
        color: shade(unitColor(cUnit), 0.5),
        meta: { contentId: cid, lessonNo, activityCount: l.activities.length },
      });
      links.push({
        source: cId,
        target: lId,
        kind: 'content-lesson',
        style: 'solid',
        instructor: false,
      });
    }
    links.push({
      source: stdId(code),
      target: lId,
      kind: 'standard-lesson',
      style: relation === 'primary' ? 'solid' : 'dashed',
      instructor: cid === 'dotvalley',
    });
  });

  return { nodes, links };
}

/** 차시 확장: 활동 노드 + (차시—활동) 간선 추가 */
export function expandLesson(cid: ContentId, lessonNo: number): GraphPatch {
  const l = getLesson(cid, lessonNo);
  const cUnit = l ? nodeUnitForLesson(cid, lessonNo) : '9정04';
  const lId = lessonId(cid, lessonNo);
  const nodes: GNode[] = [];
  const links: GLink[] = [];

  l.activities.forEach((a) => {
    const aId = activityId(cid, lessonNo, a.no);
    nodes.push({
      id: aId,
      kind: 'activity',
      label: a.title,
      unit: cUnit,
      color: shade(unitColor(cUnit), 0.68),
      meta: { contentId: cid, lessonNo, activity: a },
    });
    links.push({
      source: lId,
      target: aId,
      kind: 'lesson-activity',
      style: 'solid',
      instructor: false,
    });
  });

  return { nodes, links };
}

/** 차시 접기: 해당 차시 활동 노드 ID 목록 (T14가 상태에서 제거) */
export function activityNodeIds(cid: ContentId, lessonNo: number): string[] {
  return getLesson(cid, lessonNo).activities.map((a) =>
    activityId(cid, lessonNo, a.no),
  );
}

/** 차시의 대표 대단원 색 결정: primary 성취기준의 대단원 우선 */
function nodeUnitForLesson(cid: ContentId, lessonNo: number): string {
  const refs = ALL_STANDARD_CODES.filter((code) =>
    lessonsForStandard(code).some(
      (r) => r.contentId === cid && r.lessonNo === lessonNo && r.relation === 'primary',
    ),
  );
  return (refs[0] ?? '9정04').slice(0, 5);
}

/**
 * 검색: 성취기준 코드 또는 활동 제목으로 노드 ID 후보를 찾는다.
 * 반환 노드가 아직 그래프에 없을 수 있으므로, T14가 경로를 확장한 뒤 포커스한다.
 */
export function searchNodeId(query: string): string | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const codeHit = ALL_STANDARD_CODES.find((c) => c.toLowerCase().includes(q));
  if (codeHit) return stdId(codeHit);

  for (const c of CONTENTS) {
    for (const l of c.lessons) {
      const a = l.activities.find((x) => x.title.toLowerCase().includes(q));
      if (a) return activityId(c.id, l.no, a.no);
    }
  }
  return null;
}
