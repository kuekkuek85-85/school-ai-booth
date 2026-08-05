/**
 * 강의 PPTX 제작 프롬프트 — 재구성 바구니의 성취기준·활동(+링크)으로,
 * 수강생이 각자 AI(ChatGPT·Gemini·Claude 등)에 붙여넣어 '실제 .pptx 파일'을 만들도록 지시.
 */
import { standardText } from '@/lib/data/standards';
import type { BasketItem } from '@/lib/booth/basket';

function uniqueStandards(items: BasketItem[]): string[] {
  return Array.from(new Set(items.flatMap((i) => i.standards)));
}

export function buildDeckPrompt(items: BasketItem[], contentTitle: string): string {
  const stds = uniqueStandards(items);
  const stdLines = stds.map((c) => `- ${c}: ${standardText(c)}`).join('\n');
  const actLines = items
    .map((it, i) => `${i + 1}. [${it.label}] ${it.title}\n   링크: ${it.link}`)
    .join('\n');

  return `아래 정보로 **중학교 정보 교사용 강의 PowerPoint(.pptx) 파일**을 직접 만들어 주세요.
설명이나 JSON만 내지 말고, **실제로 열 수 있는 .pptx 파일**을 생성해 다운로드할 수 있게 제공해 주세요.

[콘텐츠] ${contentTitle}
[성취기준]
${stdLines || '- (미지정)'}

[담은 활동 (순서대로 슬라이드 1장씩)]
${actLines || '(없음)'}

■ 슬라이드 구성 (각 슬라이드에 제목 필수, 디자인은 심플하게)
1) 제목 슬라이드 — 강의 제목 + 부제(성취기준/단원)
2) 목차
3) 동기유발 — 학생 흥미를 끄는 도입 질문/상황
4) 활동 슬라이드 — 위 [담은 활동]마다 1장씩 (제목 + 핵심 설명 2~3개)
   · 각 슬라이드 하단에 그 활동의 링크를 반드시 **하이퍼링크**로 삽입
   · 가능하면 해당 링크에 **직접 접속해 대표 화면을 캡처한 이미지**를 슬라이드에 넣어주세요. (접속·캡처가 어려우면 하이퍼링크만 넣어도 됩니다)
5) 결론(마무리) 슬라이드 — 성취기준을 활용해 **교사가 학생에게 전달할 핵심 메시지**

■ 제작 규칙
- python-pptx 등을 사용해 실제 .pptx 파일을 만들어 **다운로드**할 수 있게 해주세요. (사용한 코드도 함께 보여주면 좋습니다)
- **한글이 깨지지 않도록 반드시 UTF-8로 처리**하고, **한글 지원 폰트(예: 맑은 고딕 / Malgun Gothic / Noto Sans KR)를 슬라이드 글꼴로 지정**해 주세요.
- 슬라이드마다 제목을 달고, 본문은 간결한 불릿으로 정리해 주세요.`;
}
