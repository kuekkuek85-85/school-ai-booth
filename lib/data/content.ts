/**
 * 콘텐츠 딥링크 데이터 로더 (sai-content-links.json 빌드 타임 임포트)
 * 도트밸리 10차시 128활동 + 세계수 8차시 104활동 = 232활동
 */
import raw from '@/data/sai-content-links.json';
import type { ContentId } from '@/lib/theme/tokens';

export type ActivityType = 'video' | 'interactive';

export interface Activity {
  no: number;
  title: string;
  link: string;
  type: ActivityType;
}

export interface Lesson {
  no: number;
  title: string;
  activities: Activity[];
}

export interface Guides {
  student: string;
  teacher: string;
}

export interface Content {
  id: ContentId;
  title: string;
  body: string;
  mapUrl: string;
  originUrl: string;
  lessons: Lesson[];
  guides: Guides;
}

export interface CatalogItem {
  title: string;
  url: string;
}
export interface CatalogProject {
  title: string;
  key: string;
}
export interface SaiCatalog {
  platformHome: string;
  elementary: CatalogItem[];
  middle: CatalogItem[];
  high: CatalogItem[];
  highProjects: CatalogProject[];
}

interface ContentLinksFile {
  contents: Content[];
  saiCatalog: SaiCatalog;
}

const file = raw as unknown as ContentLinksFile;

export const CONTENTS: Content[] = file.contents;
export const SAI_CATALOG: SaiCatalog = file.saiCatalog;

/** 회차별 콘텐츠 조회 */
export function getContent(id: ContentId): Content {
  const c = CONTENTS.find((x) => x.id === id);
  if (!c) throw new Error(`알 수 없는 콘텐츠: ${id}`);
  return c;
}

/** 차시 조회 (1-base lesson no) */
export function getLesson(id: ContentId, lessonNo: number): Lesson {
  const l = getContent(id).lessons.find((x) => x.no === lessonNo);
  if (!l) throw new Error(`${id}에 ${lessonNo}차시가 없습니다`);
  return l;
}

/** 활동 조회 (lesson no + activity no) */
export function getActivity(
  id: ContentId,
  lessonNo: number,
  activityNo: number,
): Activity {
  const a = getLesson(id, lessonNo).activities.find((x) => x.no === activityNo);
  if (!a) throw new Error(`${id} ${lessonNo}-${activityNo} 활동이 없습니다`);
  return a;
}

/** 콘텐츠의 교사용/학생용 매뉴얼 PDF URL */
export function getGuides(id: ContentId): Guides {
  return getContent(id).guides;
}

/** 전체 활동 수 (검증용) */
export function totalActivityCount(): number {
  return CONTENTS.reduce(
    (sum, c) => sum + c.lessons.reduce((s, l) => s + l.activities.length, 0),
    0,
  );
}
