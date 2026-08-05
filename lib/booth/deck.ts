/**
 * 강의용 PPTX 덱 스펙 — 재구성 바구니로 프롬프트 생성 → Gemini가 슬라이드 구성 JSON 생성.
 * 활동 자료 링크는 pptx 빌더가 하단 하이퍼링크로 삽입(스펙엔 텍스트만).
 */
import { standardText } from '@/lib/data/standards';
import type { BasketItem } from '@/lib/booth/basket';

export interface DeckActivitySlide {
  title: string;
  points: string[];
}
export interface DeckSpec {
  title: string;
  subtitle: string;
  toc: string[];
  motivation: { title: string; body: string };
  activitySlides: DeckActivitySlide[]; // 순서 = 바구니 활동 순서
  conclusion: { title: string; message: string };
}

export const DECK_MODEL = 'gemini-flash-latest';

function uniqueStandards(items: BasketItem[]): string[] {
  return Array.from(new Set(items.flatMap((i) => i.standards)));
}

/** 사용자에게 보여주고 편집 가능한 프롬프트(=Gemini 입력) */
export function buildDeckPrompt(items: BasketItem[], contentTitle: string): string {
  const stds = uniqueStandards(items);
  const stdLines = stds.map((c) => `- ${c}: ${standardText(c)}`).join('\n');
  const actLines = items
    .map((it, i) => `${i + 1}. [${it.label}] ${it.title}`)
    .join('\n');

  return `당신은 중학교 정보 교사입니다. 아래 성취기준과 담은 활동으로 '교사 강의용 PPTX' 구성안을 설계하세요. 한국어, 존댓말.

[콘텐츠] ${contentTitle}
[성취기준]
${stdLines || '- (미지정)'}

[담은 활동 (순서 = 활동 슬라이드 순서)]
${actLines || '(없음)'}

슬라이드 구성:
1) 제목 — 강의 제목 + 부제(성취기준/단원)
2) 목차
3) 동기유발 — 학생 흥미를 끄는 도입 질문/상황
4) 활동 슬라이드 — 담은 활동마다 1장(제목 + 핵심 설명 2~3개). 자료 링크는 하단에 자동 하이퍼링크 삽입됨
5) 결론(마무리) — 성취기준을 활용해 교사가 학생에게 전달할 핵심 메시지

규칙: 각 슬라이드에 제목을 답니다. activitySlides 개수는 담은 활동 수(${items.length})와 정확히 같고 순서도 같아야 합니다.
반드시 아래 JSON만 출력(다른 텍스트 금지):
{"title":"강의 제목","subtitle":"부제","toc":["동기유발","활동1: ...","마무리"],"motivation":{"title":"동기유발 제목","body":"2~3문장"},"activitySlides":[{"title":"슬라이드 제목","points":["설명1","설명2"]}],"conclusion":{"title":"마무리 제목","message":"성취기준 관점 교사→학생 전달 메시지"}}`;
}

/** AI 없이 구성하는 기본 덱(폴백) */
export function fallbackDeck(items: BasketItem[], contentTitle: string): DeckSpec {
  const stds = uniqueStandards(items);
  return {
    title: `${contentTitle} — 재구성 강의`,
    subtitle: stds.length ? `성취기준 ${stds.join(', ')}` : '성취기준 기반 재구성 수업',
    toc: ['동기유발', ...items.map((it, i) => `활동 ${i + 1}. ${it.title}`), '마무리'],
    motivation: {
      title: '동기유발',
      body: '오늘 우리는 실생활 데이터와 인공지능을 직접 다뤄봅니다. 무엇을 배우게 될지 함께 살펴봅시다.',
    },
    activitySlides: items.map((it) => ({
      title: it.title,
      points: ['활동을 직접 체험합니다.', '핵심 개념을 정리하고 서로 이야기해 봅니다.'],
    })),
    conclusion: {
      title: '마무리',
      message: stds.length
        ? `오늘 활동으로 ${stds.join(', ')} 성취기준에 다가갔습니다. 배운 개념을 우리 주변 문제에 적용해 봅시다.`
        : '오늘 배운 개념을 우리 주변 문제에 적용해 봅시다.',
    },
  };
}

/** 모델 응답 → DeckSpec. 실패 시 null. activitySlides는 활동 수에 맞춰 보정. */
export function parseDeck(text: string, count: number): DeckSpec | null {
  try {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const o = JSON.parse(m[0]) as Partial<DeckSpec>;
    const slides = Array.isArray(o.activitySlides) ? o.activitySlides : [];
    const activitySlides: DeckActivitySlide[] = Array.from({ length: count }, (_, i) => {
      const s = slides[i];
      return {
        title: typeof s?.title === 'string' ? s.title : `활동 ${i + 1}`,
        points: Array.isArray(s?.points) ? s!.points.filter((p) => typeof p === 'string') : ['활동을 체험합니다.'],
      };
    });
    return {
      title: typeof o.title === 'string' ? o.title : '재구성 강의',
      subtitle: typeof o.subtitle === 'string' ? o.subtitle : '',
      toc: Array.isArray(o.toc) ? o.toc.filter((t) => typeof t === 'string') : [],
      motivation: {
        title: o.motivation?.title || '동기유발',
        body: o.motivation?.body || '',
      },
      activitySlides,
      conclusion: {
        title: o.conclusion?.title || '마무리',
        message: o.conclusion?.message || '',
      },
    };
  } catch {
    return null;
  }
}
