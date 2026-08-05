/**
 * 부스 미션 정의 + 시연 차시앱(데이터를 풀어라!) 단계·형성평가 상수.
 * 활동 스텝은 (차시번호, 활동번호)로 참조하고 content.ts getActivity로 해석한다.
 * 출처: PRD-schoolai-booth.md §4 S2, PRD-lesson-demo.md §2.
 */
import type { ContentId } from '@/lib/theme/tokens';

/* ===================== 부스 회차(세션) ===================== */

export interface BoothRound {
  contentId: ContentId;
  sessionId: string; // Firestore booth/{sessionId}
  time: string; // 표시용
  title: string;
  worldview: string; // 세계관 한 줄
  characters: string[];
}

export const BOOTH_ROUNDS: Record<ContentId, BoothRound> = {
  dotvalley: {
    contentId: 'dotvalley',
    sessionId: 'dotvalley-1200',
    time: '12:00',
    title: '도트밸리 속 버그를 잡아라',
    worldview: '조이와 타미의 마을 탐험기 — NPC들의 버그를 AI로 해결하라',
    characters: ['조이', '타미', '매드맨', '힐봇'],
  },
  sos: {
    contentId: 'sos',
    sessionId: 'sos-1500',
    time: '15:00',
    title: 'S.O.S 세계수를 구하라',
    worldview: 'AI 세계를 지키는 수호 정령 — 세계수 데이터베이스 복구 미션',
    characters: ['그리니', '워터리', '클라우디', '지키미'],
  },
};

/* ===================== 부스 미션 ===================== */

export interface MissionStep {
  lesson: number;
  activity: number;
}

export type MissionId = 'm1' | 'm2' | 'm3';

export interface Mission {
  id: MissionId;
  title: string;
  minutes: number;
  steps: MissionStep[];
  standards: string[]; // 연계 성취기준 코드 칩
  teacherEye: string; // "교사의 눈"
}

export const MISSIONS: Record<ContentId, Mission[]> = {
  dotvalley: [
    {
      id: 'm1',
      title: '돼지를 분류하는 AI 만들기',
      minutes: 7,
      steps: [
        { lesson: 5, activity: 2 },
        { lesson: 5, activity: 3 },
        { lesson: 5, activity: 4 },
        { lesson: 5, activity: 9 },
      ],
      standards: ['9정04-02', '9정04-03', '9정04-04'],
      teacherEye:
        '지도학습 전 과정을 게임 4개로 — 공개수업 실전 차시(사례 파트 연결)',
    },
    {
      id: 'm2',
      title: 'AI가 그린 모나리자? GAN 체험',
      minutes: 7,
      steps: [
        { lesson: 8, activity: 5 },
        { lesson: 8, activity: 6 },
        { lesson: 8, activity: 7 },
        { lesson: 8, activity: 8 },
      ],
      standards: ['9정04-01', '9정04-05'],
      teacherEye: '생성자·판별자를 진위 판별 게임으로 — 생성형 AI 수업 도입부',
    },
    {
      id: 'm3',
      title: '개인정보 비식별 조치',
      minutes: 4,
      steps: [
        { lesson: 10, activity: 2 },
        { lesson: 10, activity: 3 },
      ],
      standards: ['9정04-05', '9정05-03'],
      teacherEye: 'AI 윤리 10대 기준 중 프라이버시 — 도덕·사회 융합 연결',
    },
  ],
  sos: [
    {
      id: 'm1',
      title: '수호나무 질병 진단 시스템',
      minutes: 8,
      steps: [
        { lesson: 6, activity: 4 },
        { lesson: 6, activity: 8 },
        { lesson: 6, activity: 9 },
        { lesson: 6, activity: 10 },
        { lesson: 6, activity: 11 },
      ],
      standards: ['9정01-03', '9정03-08'],
      teacherEye: '피지컬 컴퓨팅+AI 풀사이클이 한 미션에',
    },
    {
      id: 'm2',
      title: '이미지 모델 학습·테스트',
      minutes: 5,
      steps: [
        { lesson: 4, activity: 7 },
        { lesson: 4, activity: 8 },
      ],
      standards: ['9정04-03'],
      teacherEye: "평가에 '학습에 안 쓴 데이터'를 쓰는 이유를 게임으로",
    },
    {
      id: 'm3',
      title: 'AI 시대 직업 체험',
      minutes: 5,
      steps: [
        { lesson: 8, activity: 5 },
        { lesson: 8, activity: 7 },
        { lesson: 8, activity: 9 },
      ],
      standards: ['9정05-01'],
      teacherEye: '자유학기·진로시간 활용 포인트',
    },
  ],
};

/* ============ 시연 차시앱 「데이터를 풀어라!」 (세계수 2차시 발췌) ============ */

/** 차시앱 세션 ID (D2: PRD대로 booth-1200 / booth-1500) */
export const DEMO_SESSIONS = ['booth-1200', 'booth-1500'] as const;
export type DemoSessionId = (typeof DEMO_SESSIONS)[number];

/** 차시앱은 세계수(sos) 콘텐츠의 활동을 딥링크로 사용 */
export const DEMO_CONTENT_ID: ContentId = 'sos';

export const DEMO_LESSON = {
  title: '데이터를 풀어라!',
  subject: '중학교 정보 · 데이터 단원 1차시(45분)',
  standards: ['9정02-03', '9정02-04'],
  goal: '실생활 데이터를 구조화·시각화하고, 데이터에 기반해 의미를 해석한다.',
};

export type DemoStepId = 'intro' | 'act1' | 'act2' | 'act3' | 'quiz';

export interface DemoStep {
  id: DemoStepId;
  label: string; // 도입/전개1..3/형성평가
  title: string;
  /** 활동 딥링크 참조 (sos 콘텐츠 차시-활동). quiz 단계는 없음 */
  ref?: { lesson: number; activity: number };
  /** 산출물 텍스트 제출 단계 여부 (전개3) */
  artifact?: boolean;
}

export const DEMO_STEPS: DemoStep[] = [
  { id: 'intro', label: '도입', title: '데이터 수집과 관리(영상)', ref: { lesson: 2, activity: 1 } },
  { id: 'act1', label: '전개1', title: '나무 데이터 모으기', ref: { lesson: 2, activity: 2 } },
  { id: 'act2', label: '전개2', title: '식물 생장 데이터 시각화하기', ref: { lesson: 2, activity: 7 } },
  { id: 'act3', label: '전개3', title: '식물 생장 데이터 해석하기', ref: { lesson: 2, activity: 8 }, artifact: true },
  { id: 'quiz', label: '형성평가', title: '형성평가 3문항' },
];

/** 형성평가 문항 (2번만 객관식 자동 채점) */
export interface QuizChoiceQuestion {
  id: 'q2';
  type: 'choice';
  prompt: string;
  options: string[];
  answerIndex: number; // 0-base 정답
}
export interface QuizShortQuestion {
  id: 'q1' | 'q3';
  type: 'short';
  prompt: string;
}
export type QuizQuestion = QuizShortQuestion | QuizChoiceQuestion;

export const DEMO_QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    type: 'short',
    prompt: '데이터를 시각화하면 좋은 점 1가지를 서술하세요.',
  },
  {
    id: 'q2',
    type: 'choice',
    prompt: '선그래프가 적합한 경우는?',
    options: ['시간에 따른 변화', '항목 비율', '분포 비교', '관계 파악'],
    answerIndex: 0,
  },
  {
    id: 'q3',
    type: 'short',
    prompt:
      '"불량식품 섭취량이 많을수록 수면시간이 길다"는 그래프 해석에서 추가로 확인해야 할 것은?',
  },
];
