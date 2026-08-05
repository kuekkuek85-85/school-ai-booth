/**
 * 성취기준·차시 매핑 로더 (sai-standards-map.json 빌드 타임 임포트)
 * 2022 개정 중학교 정보과 성취기준 전문 25개 + 차시별 매핑
 */
import raw from '@/data/sai-standards-map.json';
import type { ContentId } from '@/lib/theme/tokens';

export interface UnitStandards {
  name: string;
  codes: Record<string, string>; // '9정01-01' → 전문
}

export interface LessonMapping {
  primary: string[];
  secondary: string[];
  rationale: string;
}

export type MappingSource = 'official' | 'instructor';

export interface ContentMapping {
  source: MappingSource;
  lessons: Record<string, LessonMapping>; // '1' → mapping
}

interface StandardsFile {
  standards: Record<string, UnitStandards>; // '9정01' → ...
  mapping: Record<ContentId, ContentMapping>;
}

const file = raw as unknown as StandardsFile;

export const STANDARDS = file.standards;
export const MAPPING = file.mapping;

/** 대단원 코드 목록 (9정01~05) */
export const UNIT_CODES: string[] = Object.keys(STANDARDS);

/** 성취기준 전체 코드 목록 (25개) */
export const ALL_STANDARD_CODES: string[] = UNIT_CODES.flatMap((u) =>
  Object.keys(STANDARDS[u].codes),
);

/** 성취기준 코드 → 전문. 없으면 코드 그대로 반환 */
export function standardText(code: string): string {
  const unit = code.slice(0, 4);
  return STANDARDS[unit]?.codes[code] ?? code;
}

/** 대단원 코드 → 대단원명 */
export function unitName(unitCode: string): string {
  return STANDARDS[unitCode]?.name ?? unitCode;
}

/** 특정 콘텐츠의 매핑 소스(official=공식 / instructor=강사 재구성안) */
export function mappingSource(id: ContentId): MappingSource {
  return MAPPING[id].source;
}

/** 차시의 성취기준 매핑 조회 */
export function lessonMapping(id: ContentId, lessonNo: number): LessonMapping {
  return (
    MAPPING[id].lessons[String(lessonNo)] ?? {
      primary: [],
      secondary: [],
      rationale: '',
    }
  );
}

/** 특정 성취기준이 매핑된 (콘텐츠, 차시, 관계) 목록 — 그래프 확장용 */
export interface StandardLessonRef {
  contentId: ContentId;
  lessonNo: number;
  relation: 'primary' | 'secondary';
}

export function lessonsForStandard(code: string): StandardLessonRef[] {
  const refs: StandardLessonRef[] = [];
  (Object.keys(MAPPING) as ContentId[]).forEach((cid) => {
    const lessons = MAPPING[cid].lessons;
    Object.keys(lessons).forEach((lnoStr) => {
      const m = lessons[lnoStr];
      const lessonNo = Number(lnoStr);
      if (m.primary.includes(code)) {
        refs.push({ contentId: cid, lessonNo, relation: 'primary' });
      } else if (m.secondary.includes(code)) {
        refs.push({ contentId: cid, lessonNo, relation: 'secondary' });
      }
    });
  });
  return refs;
}
