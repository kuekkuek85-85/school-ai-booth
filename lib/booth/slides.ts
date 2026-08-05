/**
 * 콘텐츠 설명 슬라이드 데이터 (교사용 매뉴얼 참고 + 앱 데이터 결합).
 * 차시 제목·미션·성취기준은 런타임에 실제 데이터에서 끌어와 정확성 보장.
 * 서술(특징·장단점·학습 유의사항)은 교사용 매뉴얼(무로그인·순차 학습·PC 권장 등)에 근거.
 */
import type { ContentId } from '@/lib/theme/tokens';
import { getContent } from '@/lib/data/content';
import { BOOTH_ROUNDS, MISSIONS } from '@/lib/data/missions';
import { standardText, unitName } from '@/lib/data/standards';

export type SlideBlock = 'white' | 'lime' | 'lilac' | 'cream' | 'mint' | 'coral' | 'pink' | 'navy';

interface Base {
  eyebrow: string;
  title: string;
  block: SlideBlock;
}
export type Slide =
  | (Base & { layout: 'cover'; subtitle: string; image?: string })
  | (Base & { layout: 'overview'; body: string; tags: string[]; image?: string })
  | (Base & { layout: 'bullets'; bullets: { h: string; d?: string }[] })
  | (Base & { layout: 'proscons'; pros: string[]; cons: string[] })
  | (Base & { layout: 'lessons'; lessons: { no: number; title: string }[] })
  | (Base & { layout: 'standards'; items: { code: string; unit: string; text: string }[] })
  | (Base & { layout: 'missions'; missions: { title: string; minutes: number; standards: string[]; note: string }[] })
  | (Base & { layout: 'closing'; subtitle: string });

/** 콘텐츠별 색블록 팔레트(도트밸리=시원한 계열 / 세계수=따뜻한 계열) */
const PALETTE: Record<ContentId, Record<string, SlideBlock>> = {
  dotvalley: { cover: 'mint', features: 'lime', standards: 'cream', missions: 'mint', usage: 'lilac' },
  sos: { cover: 'coral', features: 'coral', standards: 'cream', missions: 'coral', usage: 'lilac' },
};

export function getSlides(cid: ContentId): Slide[] {
  const content = getContent(cid);
  const round = BOOTH_ROUNDS[cid];
  const missions = MISSIONS[cid];
  const pal = PALETTE[cid];
  const image = `/maps/${cid}.png`;

  const totalActivities = content.lessons.reduce((s, l) => s + l.activities.length, 0);

  // 미션에서 관련 성취기준 유니크 추출
  const codes = Array.from(new Set(missions.flatMap((m) => m.standards))).sort();
  const items = codes.map((c) => ({ code: c, unit: unitName(c.slice(0, 4)), text: standardText(c) }));

  return [
    {
      layout: 'cover',
      eyebrow: `${round.time} 회차 · 콘텐츠 소개`,
      title: content.title,
      subtitle: round.worldview,
      block: pal.cover,
      image,
    },
    {
      layout: 'overview',
      eyebrow: '콘텐츠 개요',
      title: '어떤 콘텐츠인가요?',
      body: `${round.worldview}. 세계관 속 미션을 해결하며 인공지능 개념을 배우는 스토리 기반 체험형 콘텐츠로, 총 ${content.lessons.length}차시 ${totalActivities}개 활동으로 구성됩니다.`,
      tags: round.characters,
      block: 'white',
      image,
    },
    {
      layout: 'bullets',
      eyebrow: '특징',
      title: '이 콘텐츠의 특징',
      block: pal.features,
      bullets: [
        { h: '스토리 기반 몰입형', d: '세계관과 캐릭터를 따라가며 미션을 해결하는 서사형 구성' },
        { h: '게임형 상호작용', d: '클릭·드래그로 직접 조작하는 활동 중심 (단순 영상 시청이 아님)' },
        { h: 'AI 전 과정 실습', d: '데이터 수집 → 학습 → 테스트까지 머신러닝 사이클을 직접 체험' },
        { h: '성취기준 정렬', d: '2022 개정 정보과 인공지능(9정04) 등 대단원과 연계' },
        { h: '즉시 학습', d: '회원가입·설치 없이 브라우저로 바로 시작하는 무료 콘텐츠' },
      ],
    },
    {
      layout: 'proscons',
      eyebrow: '장점과 단점',
      title: '수업 전 알아두면 좋아요',
      block: 'white',
      pros: [
        '몰입도 높은 스토리로 자기주도 학습을 유도',
        '개념 → 실습 → 평가가 한 흐름 (공개수업 실전 차시로 바로 활용)',
        '무료·즉시 접속, 별도 설치 없이 브라우저만으로 진행',
      ],
      cons: [
        '로그인이 없어 중단 시 이어보기 불가 → 한 번에 완주 권장',
        '상호작용이 많아 모바일은 부적합 (데스크톱·노트북·태블릿 권장)',
        '순차 진행형이라 중간 구간 이동이 제한 — 차례대로 학습 권장',
      ],
    },
    {
      layout: 'lessons',
      eyebrow: '세부 차시',
      title: `${content.lessons.length}개 차시 구성`,
      block: 'white',
      lessons: content.lessons.map((l) => ({ no: l.no, title: l.title })),
    },
    {
      layout: 'standards',
      eyebrow: '관련 성취기준',
      title: '2022 개정 정보과 연계',
      block: pal.standards,
      items,
    },
    {
      layout: 'missions',
      eyebrow: '관련 활동',
      title: '부스 추천 미션',
      block: pal.missions,
      missions: missions.map((m) => ({
        title: m.title,
        minutes: m.minutes,
        standards: m.standards,
        note: m.teacherEye,
      })),
    },
    {
      layout: 'bullets',
      eyebrow: '학습 방법·유의사항',
      title: '이렇게 학습하세요',
      block: pal.usage,
      bullets: [
        { h: '바로 시작', d: '회원가입·설치 없이 브라우저로 접속해 학습을 시작' },
        { h: '끝까지 완주', d: '로그인이 없어 중간 종료 시 처음부터 재학습 — 한 번에 끝까지 진행' },
        { h: '순차 학습', d: '상호작용 중심 콘텐츠 — 영상·활동을 차례대로 진행' },
        { h: '기기 권장', d: '데스크톱·노트북·태블릿에서 학습 (모바일 부적합)' },
      ],
    },
    {
      layout: 'closing',
      eyebrow: '체험 시작',
      title: `지금부터 «${content.title}» 를 시작합니다`,
      subtitle: '화면의 안내를 따라 미션을 해결해 보세요.',
      block: 'navy',
    },
  ];
}
