/**
 * 디자인 토큰 TS 미러 — app/globals.css의 CSS 변수와 값이 일치해야 한다.
 * JS에서 색을 직접 써야 하는 곳(지식그래프 노드 색 등)에서만 사용하고,
 * DOM 스타일은 가능한 CSS 변수(var(--...))를 우선한다.
 */

/** 회차(콘텐츠) 식별자 */
export type ContentId = 'dotvalley' | 'sos';

/** 회차별 테마 클래스명 (globals.css의 .theme-* 와 일치) */
export const THEME_CLASS: Record<ContentId, string> = {
  dotvalley: 'theme-dotvalley',
  sos: 'theme-sos',
};

/** 회차별 대표 색(강조) — CSS .theme-* 의 --color-primary 미러 */
export const CONTENT_PRIMARY: Record<ContentId, string> = {
  dotvalley: '#16a34a',
  sos: '#d97706',
};

/** 대단원 코드 → 색 (지식그래프 노드/성취기준 칩) — globals.css --unit-* 미러 */
export const UNIT_COLORS: Record<string, string> = {
  '9정01': '#3b82f6', // 컴퓨팅 시스템
  '9정02': '#06b6d4', // 데이터
  '9정03': '#8b5cf6', // 알고리즘과 프로그래밍
  '9정04': '#f59e0b', // 인공지능
  '9정05': '#ec4899', // 디지털 문화
};

/** 대단원 코드 → 한글명 */
export const UNIT_NAMES: Record<string, string> = {
  '9정01': '컴퓨팅 시스템',
  '9정02': '데이터',
  '9정03': '알고리즘과 프로그래밍',
  '9정04': '인공지능',
  '9정05': '디지털 문화',
};

/** 성취기준 코드에서 대단원 코드 추출 (예: '9정04-02' → '9정04') */
export function unitOf(standardCode: string): string {
  return standardCode.slice(0, 5);
}

/** 성취기준/노드 색 조회 (대단원 색 기준) */
export function colorForStandard(standardCode: string): string {
  return UNIT_COLORS[unitOf(standardCode)] ?? '#94a3b8';
}

/** 지식그래프 다크 캔버스 색 — globals.css --graph-* 미러 */
export const GRAPH = {
  bg: '#0b1020',
  fg: '#e6e9f2',
  link: '#4b5573',
  linkDashed: '#7c86a3',
} as const;

/** "교사의 눈" 별색 */
export const TEACHER_EYE_COLOR = '#eab308';

/** 모션 지속시간(ms) — globals.css --dur-* 미러 */
export const DURATION = {
  fast: 120,
  base: 220,
  slow: 420,
} as const;

/**
 * hex 색의 명도를 조정해 소속 대단원 색의 밝기 변화를 만든다.
 * amount > 0 이면 밝게(흰색 쪽), < 0 이면 어둡게(검정 쪽). -1..1
 */
export function shade(hex: string, amount: number): string {
  const m = hex.replace('#', '');
  const num = parseInt(
    m.length === 3
      ? m
          .split('')
          .map((c) => c + c)
          .join('')
      : m,
    16,
  );
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  const t = amount < 0 ? 0 : 255;
  const p = Math.abs(amount);
  r = Math.round((t - r) * p) + r;
  g = Math.round((t - g) * p) + g;
  b = Math.round((t - b) * p) + b;
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
