/**
 * Gemini 피드백 프롬프트/스키마 상수 (상수 분리 — F5-2 요구).
 * 성취기준 9정02-03·04 관점의 한 줄 피드백 + 상/중/하 도달도 제안(교사 수정 가능한 '제안').
 */
import type { DemoFeedback } from '@/lib/firebase/collections';

export interface FeedbackInput {
  artifact?: string;
  q1?: string;
  q3?: string;
}

export const GEMINI_MODEL = 'gemini-flash-latest';

export const FEEDBACK_SYSTEM = `당신은 중학교 정보 교사를 돕는 채점 보조입니다.
성취기준 [9정02-03] 실생활 데이터를 표·다이어그램 등 다양한 형태로 구조화한다,
[9정02-04] 데이터 간 관계를 파악하고 데이터에 기반해 의미를 해석한다.
학생 응답을 위 성취기준 관점에서 평가해 각 항목에 한 줄(1문장, 존댓말) 피드백을 주고,
전체 도달도를 상/중/하 중 하나로 제안하세요. 반드시 아래 JSON만 출력합니다.`;

export function buildPrompt(input: FeedbackInput): string {
  return `${FEEDBACK_SYSTEM}

[산출물(데이터 해석 의견)] ${input.artifact ?? '(없음)'}
[형성평가 1번(시각화 장점)] ${input.q1 ?? '(없음)'}
[형성평가 3번(상관·인과 구분)] ${input.q3 ?? '(없음)'}

출력 JSON 스키마:
{"artifact": "산출물 한 줄 피드백", "q1": "1번 한 줄 피드백", "q3": "3번 한 줄 피드백", "level": "상|중|하"}`;
}

/** 모델 응답 텍스트에서 JSON 피드백 파싱. 실패 시 null. */
export function parseFeedback(text: string): DemoFeedback | null {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const obj = JSON.parse(match[0]) as Record<string, unknown>;
    const level =
      obj.level === '상' || obj.level === '중' || obj.level === '하'
        ? (obj.level as '상' | '중' | '하')
        : undefined;
    return {
      artifact: typeof obj.artifact === 'string' ? obj.artifact : undefined,
      q1: typeof obj.q1 === 'string' ? obj.q1 : undefined,
      q3: typeof obj.q3 === 'string' ? obj.q3 : undefined,
      level,
    };
  } catch {
    return null;
  }
}
