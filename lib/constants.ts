/**
 * 배포 시 교체하는 단일 지점 상수.
 * - DEMO_LESSON_URL: 단일 앱이므로 내부 경로 '/demo' (배포 순서 의존 없음)
 * - SURVEY_URL: 의견조사 폼 주소 — NEXT_PUBLIC_SURVEY_URL 로 주입(미설정 시 자리표시자)
 */
export const DEMO_LESSON_URL =
  process.env.NEXT_PUBLIC_DEMO_LESSON_URL || '/demo';

export const SURVEY_URL =
  process.env.NEXT_PUBLIC_SURVEY_URL || 'https://forms.gle/REPLACE_ME';

/** School AI 안내(자료실·마무리) */
export const SAI_CONTACT = {
  phone: '1522-6841',
  email: 'ai4school@kosac.re.kr',
};

/** 매뉴얼 PDF 파일 크기 표기(자료실) — PRD 명기값 */
export const MANUAL_SIZES: Record<string, { student: string; teacher: string }> = {
  dotvalley: { student: '7.3MB', teacher: '3.5MB' },
  sos: { student: '4.3MB', teacher: '1.2MB' },
};
