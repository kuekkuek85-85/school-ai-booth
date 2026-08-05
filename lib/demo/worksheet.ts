/**
 * 동적 활동지 스펙 — 바구니 성취기준·활동으로 AI가 생성. 형성평가는 3문항 구조(q1 단답/q2 객관식/q3 단답) 유지.
 * 실패·미설정 시 기존 고정 차시로 폴백.
 */
import { getActivity } from '@/lib/data/content';
import { standardText } from '@/lib/data/standards';
import {
  DEMO_CONTENT_ID,
  DEMO_LESSON,
  DEMO_STEPS,
  DEMO_QUIZ,
  type QuizQuestion,
} from '@/lib/data/missions';

export interface WorksheetStep {
  key: string;
  label: string;
  title: string;
  guide?: string; // AI 한 줄 안내
  link?: string;
  type?: 'video' | 'interactive';
  artifact?: boolean; // 산출물 제출 단계
}

export interface WorksheetSpec {
  title: string;
  objective: string;
  standards: string[];
  steps: WorksheetStep[];
  quiz: QuizQuestion[]; // [q1 단답, q2 객관식, q3 단답]
  generated: boolean; // true=AI 생성, false=폴백
}

/** 발행된 바구니(활동지 생성 입력) */
export interface WorksheetInput {
  standards: string[];
  activities: { title: string; label: string; link: string }[];
}

/* ===================== 기본(폴백) 활동지 ===================== */

export function defaultWorksheet(): WorksheetSpec {
  const steps: WorksheetStep[] = DEMO_STEPS.filter((s) => s.id !== 'quiz').map((s) => {
    const a = s.ref ? getActivity(DEMO_CONTENT_ID, s.ref.lesson, s.ref.activity) : null;
    return {
      key: s.id,
      label: s.label,
      title: s.title,
      link: a?.link,
      type: a?.type,
      artifact: !!s.artifact,
    };
  });
  return {
    title: DEMO_LESSON.title,
    objective: DEMO_LESSON.goal,
    standards: DEMO_LESSON.standards,
    steps,
    quiz: DEMO_QUIZ,
    generated: false,
  };
}

/** 바구니 활동만으로 구성(AI 없이) — 제목·목표는 일반 문구, 형성평가는 기본 문항 */
export function worksheetFromInput(input: WorksheetInput): WorksheetSpec {
  if (!input.activities.length) return defaultWorksheet();
  const steps: WorksheetStep[] = input.activities.map((a, i) => ({
    key: `act${i}`,
    label: i === 0 ? '도입' : `활동 ${i}`,
    title: a.title,
    link: a.link,
    artifact: i === input.activities.length - 1, // 마지막 단계 산출물
  }));
  return {
    title: '나만의 재구성 활동지',
    objective: '선택한 성취기준의 활동을 순서대로 체험하고, 데이터에 기반해 의미를 해석한다.',
    standards: input.standards,
    steps,
    quiz: DEMO_QUIZ,
    generated: false,
  };
}

/* ===================== AI 생성 ===================== */

export const WORKSHEET_MODEL = 'gemini-flash-latest';

export function buildWorksheetPrompt(input: WorksheetInput): string {
  const stds = input.standards.map((c) => `- ${c}: ${standardText(c)}`).join('\n');
  const acts = input.activities.map((a, i) => `${i + 1}. ${a.title}`).join('\n');
  return `당신은 중학교 정보 교사를 돕는 수업 설계 보조입니다.
아래 [성취기준]과 [활동 목록]에만 근거해 45분 차시 '활동지'를 설계하세요. 존댓말, 한국어.

[성취기준]
${stds || '- (미지정)'}

[활동 목록(순서대로, 번호=단계)]
${acts || '(없음)'}

엄격 규칙:
- 반드시 위 성취기준과 활동 목록의 주제 범위 안에서만 작성하세요. 목록에 없는 소재(예: 피지컬 컴퓨팅, 센서 등)를 임의로 지어내지 마세요.
- guides는 활동 목록과 개수가 정확히 같은 배열이며, guides[i]는 (i+1)번 활동의 내용에 맞춘 한 줄 안내입니다.
- title/objective/quiz도 위 성취기준의 취지에 부합해야 합니다.

산출:
- title: 활동지 제목(성취기준 취지 반영, 15자 내외)
- objective: 오늘의 목표 1문장
- quiz: 형성평가 3문항 — q1(단답), q2(객관식 4지선다, 정답 인덱스 0~3), q3(단답). 성취기준에 맞춰 출제.

반드시 아래 JSON만 출력:
{"title":"...","objective":"...","guides":["...","..."],"quiz":{"q1":{"prompt":"..."},"q2":{"prompt":"...","options":["","","",""],"answerIndex":0},"q3":{"prompt":"..."}}}`;
}

/** 모델 응답 → WorksheetSpec (실패 시 null) */
export function parseWorksheet(text: string, input: WorksheetInput): WorksheetSpec | null {
  try {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const o = JSON.parse(m[0]) as {
      title?: string;
      objective?: string;
      guides?: string[];
      quiz?: {
        q1?: { prompt?: string };
        q2?: { prompt?: string; options?: string[]; answerIndex?: number };
        q3?: { prompt?: string };
      };
    };
    const guides = Array.isArray(o.guides) ? o.guides : [];
    const steps: WorksheetStep[] = input.activities.map((a, i) => ({
      key: `act${i}`,
      label: i === 0 ? '도입' : `활동 ${i}`,
      title: a.title,
      guide: typeof guides[i] === 'string' ? guides[i] : undefined,
      link: a.link,
      artifact: i === input.activities.length - 1,
    }));
    const q2opts =
      o.quiz?.q2?.options && o.quiz.q2.options.length === 4
        ? o.quiz.q2.options
        : DEMO_QUIZ.find((q) => q.id === 'q2')!.type === 'choice'
          ? (DEMO_QUIZ.find((q) => q.id === 'q2') as { options: string[] }).options
          : ['', '', '', ''];
    const quiz: QuizQuestion[] = [
      { id: 'q1', type: 'short', prompt: o.quiz?.q1?.prompt || '오늘 배운 내용을 한 가지 서술하세요.' },
      {
        id: 'q2',
        type: 'choice',
        prompt: o.quiz?.q2?.prompt || '가장 알맞은 것은?',
        options: q2opts,
        answerIndex:
          typeof o.quiz?.q2?.answerIndex === 'number' &&
          o.quiz.q2.answerIndex >= 0 &&
          o.quiz.q2.answerIndex <= 3
            ? o.quiz.q2.answerIndex
            : 0,
      },
      { id: 'q3', type: 'short', prompt: o.quiz?.q3?.prompt || '추가로 확인해야 할 점을 서술하세요.' },
    ];
    return {
      title: o.title || '재구성 활동지',
      objective: o.objective || '선택한 성취기준의 활동을 체험합니다.',
      standards: input.standards,
      steps: steps.length ? steps : defaultWorksheet().steps,
      quiz,
      generated: true,
    };
  } catch {
    return null;
  }
}
