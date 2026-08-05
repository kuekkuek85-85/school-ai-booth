# PLAN.md — School AI 부스 모노레포 구현 계획 (1단계 산출물)

작성: Claude CLI / 2026-08-05 / 대상 행사: 2026-08-06 과·수·정 콘퍼런스 1일차 중학 회차 2개
근거 문서: `PRD-schoolai-booth.md`(v2.2), `PRD-lesson-demo.md`(v1.0), `WORKFLOW-build-pipeline.md`, `data/sai-content-links.json`, `data/sai-standards-map.json`, 매뉴얼 PDF 4종

> **본 문서는 코드 없이 기획·WBS만 담는다.** 구현은 사용자가 아래 '결정 필요'를 확정한 뒤 Codex CLI가 T02부터 진행한다.
> (T01은 컨텍스트 파일 배치 커밋으로 이미 사용됨 → 구현 WBS는 **T02**부터 시작)

---

## 0. 결정 사항 (확정 완료)

모든 결정이 확정됨(2026-08-05). 아래대로 구현한다.

| # | 쟁점 | 확정 내용 | 상태 |
|---|---|---|---|
| **D1** | Firebase 클라이언트 환경변수 접두사 | Firebase 6종을 **`NEXT_PUBLIC_FIREBASE_*`**로 사용(`.env.example` 반영 완료). `GEMINI_API_KEY`는 서버 전용. 실제 값은 gitignore된 `.env`. | ✅ 확정 |
| **D2** | lesson-demo 세션 ID | **PRD대로 `booth-1200`/`booth-1500`** 사용. 마감 게이트의 `dotvalley-1200`은 오기로 간주. | ✅ 확정 |
| **D3** | TEACHER_PIN 검증 방식 | **환경변수 `TEACHER_PIN` 단일 소스**, Firestore 미저장, 두 앱 공유. **PIN 값 = `123456`**(`.env`에 저장, 커밋 금지). | ✅ 확정 |
| **D4** | 보안 규칙 '본인 문서만 쓰기' | **Firebase Anonymous Auth 도입** → `request.auth.uid`를 pid로. 규칙에서 소유권 검증. ⚠️ **Firebase 콘솔에서 익명 로그인 활성화 필요**(구현 전 선행). | 🔧 콘솔 설정 대기 |
| **D5** | 배포 단위·모노레포 툴링 | **Vercel 프로젝트 2개**(booth, lesson-demo) + **npm workspaces + Turborepo**. lesson-demo 먼저 배포 → 그 URL을 booth `DEMO_LESSON_URL`에 주입. | ✅ 확정 |

---

## 1. 모노레포 구조 확정

### 1.1 디렉터리 트리
```
school-ai-booth/
├─ apps/
│  ├─ booth/                     # 부스 플랫폼 (단일 페이지 슬라이드 앱)
│  │  ├─ app/
│  │  │  ├─ layout.tsx           # 테마 토큰 주입, 폰트
│  │  │  ├─ page.tsx             # S0~S5 섹션(슬라이드) 컨테이너
│  │  │  └─ teacher/page.tsx     # 강사 대시보드 (PIN)
│  │  ├─ components/             # 섹션·미션카드·그래프·상단바 등
│  │  ├─ lib/                    # 앱 국소 로직(세션 컨텍스트, 도장 훅)
│  │  ├─ next.config.mjs
│  │  └─ package.json
│  └─ lesson-demo/               # 시연용 차시 웹앱 「데이터를 풀어라!」
│     ├─ app/
│     │  ├─ layout.tsx
│     │  ├─ page.tsx             # 학생 흐름
│     │  ├─ teacher/page.tsx     # 교사 대시보드 (PIN)
│     │  ├─ how/page.tsx         # 제작 과정 정적 페이지 (P1)
│     │  └─ api/feedback/route.ts# Gemini 피드백 서버 라우트 (P1)
│     ├─ components/
│     ├─ lib/
│     ├─ next.config.mjs
│     └─ package.json
├─ packages/
│  ├─ firebase/                  # @sai/firebase — 초기화·컬렉션 ref·익명 인증·규칙
│  │  ├─ src/{app.ts, collections.ts, auth.ts, index.ts}
│  │  └─ firestore.rules         # 보안 규칙 (배포용)
│  ├─ theme/                     # @sai/theme — 디자인 토큰(색·타이포·모션)
│  │  └─ src/{tokens.css, tokens.ts, index.ts}
│  └─ data/                      # @sai/data — JSON 로더·모델·그래프/미션 빌더
│     └─ src/{content.ts, standards.ts, missions.ts, graph.ts, index.ts}
├─ data/                         # 원본 JSON (packages/data가 빌드 타임 임포트)
│  ├─ sai-content-links.json
│  └─ sai-standards-map.json
├─ docs/                         # PRD·PLAN·REVIEW·매뉴얼 PDF
├─ package.json                  # workspaces 루트
├─ turbo.json
├─ tsconfig.base.json
├─ .env.example
└─ .gitignore
```

### 1.2 공유 패키지 책임
- **`@sai/firebase`**: `initFirebaseApp()`, `db`/`storage` export, 타입드 컬렉션 ref 헬퍼(`participantsRef(sessionId)` 등), `ensureAnonymousAuth()`, `firestore.rules`. **테마·데이터에 의존하지 않음.**
- **`@sai/theme`**: CSS 변수 정의(`tokens.css` — `:root` + 콘텐츠 테마 클래스 `.theme-dotvalley`/`.theme-sos`)와 TS 상수 미러(`tokens.ts`). **인라인 색상 절대 금지, 모든 색·타이포·모션은 여기서만.** 추후 `design.md` 교체 대비 단일 지점.
- **`@sai/data`**: 두 JSON을 빌드 타임 임포트해 타입 안전 모델로 노출. 파생 데이터 빌더 제공(미션 정의 상수, 그래프 노드/간선 빌더, 성취기준 조회).

### 1.3 앱별 라우트 맵
**booth** (해시로 회차 유지, 섹션=슬라이드)
| 경로 | 내용 |
|---|---|
| `/#dotvalley` `/#sos` | S0 입장·회차선택 → S1 오프닝 → S2 미션보드 → S3 3D 그래프 → S4 사례 → S5 자료실. 강사 우회 `?presenter=1` |
| `/teacher` | PIN 진입 강사 대시보드(회차 탭 × 참가자 × 미션3 그리드) |

**lesson-demo**
| 경로 | 내용 |
|---|---|
| `/` | 학생 입장 → 차시 홈 → 단계 카드5 → 진행바 → 동료 현황판 |
| `/teacher` | PIN 진입 교사 대시보드(그리드·정답률·응답·산출물·리셋·세션전환) |
| `/how` | 제작 과정 3단계 정적 페이지 (P1) |
| `/api/feedback` | Gemini 피드백 서버 라우트 (P1) |

---

## 2. 데이터 흐름 설계

### 2.1 Firestore 컬렉션 스키마 (두 PRD 통합)
두 앱은 **서로 다른 최상위 컬렉션 루트**를 쓰므로 같은 Firebase 프로젝트에서 충돌 없이 공존한다.

**booth** (부스 플랫폼)
```
booth/{sessionId}/participants/{pid}  { school, name, joinedAt, uid }
booth/{sessionId}/progress/{pid}      { m1:bool, m2:bool, m3:bool, updatedAt, uid }
   · sessionId ∈ { "dotvalley-1200", "sos-1500" }
```

**lesson-demo** (시연 차시 웹앱)
```
sessions/{sessionId}/students/{studentId}  { name, studentNo, joinedAt, uid }
sessions/{sessionId}/progress/{studentId}  {
    steps: { intro, act1, act2, act3, quiz : bool },
    artifact: string,
    quiz: { q1:string, q2:number, q3:string, score:number },
    feedback?: { artifact?:string, q1?:string, q3?:string, level?:'상'|'중'|'하' },  // P1 Gemini
    updatedAt
}
   · sessionId ∈ { "booth-1200", "booth-1500" }  (D2), activeSession은 앱 상수/설정
```
- **config 문서 제거**(D3): PIN·activeSession을 Firestore에 두지 않음. PIN은 `TEACHER_PIN` 환경변수, `activeSession`은 앱 상수(세션 전환은 D2 정책상 배포 상수 또는 대시보드 로컬 토글 — 아래 T13 참조).
- `pid`/`studentId` = **익명 인증 uid**(D4). 문서 ID와 `uid` 필드를 일치시켜 규칙에서 소유권 검증.

### 2.2 보안 규칙 초안 (`packages/firebase/firestore.rules`)
```
rules_version='2';
service cloud.firestore {
  match /databases/{db}/documents {
    // 공통: 로그인(익명 포함)해야 하고, 본인 uid 문서만 생성/수정
    function ownDoc() {
      return request.auth != null && request.resource.data.uid == request.auth.uid;
    }
    match /booth/{sid}/participants/{pid} {
      allow read: if request.auth != null;          // 대시보드 읽기(이름·소속·도장)
      allow create, update: if pid == request.auth.uid && ownDoc();
      allow delete: if false;                        // 리셋은 관리 경로(아래 주1)에서만
    }
    match /booth/{sid}/progress/{pid} {
      allow read: if request.auth != null;
      allow create, update: if pid == request.auth.uid && ownDoc();
      allow delete: if false;
    }
    match /sessions/{sid}/students/{sidt} {
      allow read: if request.auth != null;
      allow create, update: if sidt == request.auth.uid && ownDoc();
      allow delete: if false;
    }
    match /sessions/{sid}/progress/{sidt} {
      allow read: if request.auth != null;
      allow create, update: if sidt == request.auth.uid && ownDoc();
      allow delete: if false;
    }
  }
}
```
> **주1 (리셋=파기):** 클라이언트 일괄 삭제를 규칙으로 허용하면 타인 문서 삭제 구멍이 생김. 회차 리셋은 (a) 규칙에 관리 삭제를 열지 말고 **PIN 게이트 뒤의 서버 라우트/Admin SDK**로 처리하거나, (b) 데모 편의를 위해 리셋 전용 규칙을 임시 개방하되 마감 후 폐기. → T10/T13 착수 시 (a) 우선, 시간 부족 시 (b) 폴백. 이 선택도 REVIEW에서 점검.

### 2.3 pid / localStorage 복구 로직
```
입장 시:
  1) ensureAnonymousAuth() → uid 확보
  2) localStorage["sai:booth:profile"] = { uid, school, name }  (lesson-demo는 studentNo)
  3) participants/{uid} upsert (joinedAt=serverTimestamp)
재접속(새로고침) 시:
  1) localStorage 프로필 존재 → 입장 게이트 스킵
  2) ensureAnonymousAuth()가 동일 uid 반환(익명 세션 지속) → progress/{uid} 구독으로 본인 상태 복구
  3) 익명 세션이 만료/불일치면 프로필의 저장값으로 게이트 프리필 후 재입장
도장/단계 토글:
  · 낙관적 UI(즉시 반영) + Firestore setDoc(merge) → 실패 시 재시도 큐(localStorage 캐시로 오프라인 방어)
```

---

## 3. 3D 지식그래프 구현 전략 (booth S3, P1)

라이브러리: **`3d-force-graph`**(three.js 기반, npm 번들). 폴백: 2D 목록(아코디언).

### 3.1 노드/간선 데이터 모델 & 함수 시그니처 (`packages/data/graph.ts`)
```ts
type NodeKind = 'unit' | 'standard' | 'content' | 'lesson' | 'activity';
interface GNode {
  id: string;            // unit:9정02 | std:9정02-03 | content:sos | lesson:sos-2 | act:sos-2-1
  kind: NodeKind;
  label: string;
  unit: string;          // 소속 대단원 코드(색 결정) 9정01~05
  color: string;         // @sai/theme 대단원 5색 + 명도 변화
  meta: Record<string, unknown>;  // 성취기준 전문, 딥링크, 활동유형 등
}
interface GLink {
  source: string; target: string;
  kind: 'unit-standard' | 'standard-lesson' | 'content-lesson' | 'lesson-activity';
  style: 'solid' | 'dashed';   // primary=solid, secondary=dashed
  instructor: boolean;         // 도트밸리(강사 재구성안) 간선 구분 배지/범례
}

buildInitialGraph(): { nodes: GNode[]; links: GLink[] }
   // 대단원 5 + 성취기준 25 + (unit-standard 간선) = 30 노드 (활동 미포함)
expandStandard(code: string, state): Patch   // 매핑 차시 노드(콘텐츠 허브 경유) 추가
expandLesson(lessonId: string, state): Patch // 해당 차시 활동 노드 추가
collapseLesson(lessonId: string, state): Patch
searchFocus(query: string): string | null    // 성취기준 코드/활동 제목 → 노드 id
```
`Patch = { addNodes, addLinks, removeNodes, removeLinks }`.

### 3.2 점진 확장 상태 관리 & 성능 예산
- 상태: `expandedStandards: Set<string>`, `expandedLessons: Set<string>` + 파생 `visibleNodes/visibleLinks`(메모이즈).
- **초기 30노드**. 성취기준 클릭 → 차시 확장. 차시 클릭 → 활동 확장.
- **성능 예산: 확장 노드 200개 이하 상시 유지.** 새 차시 활동을 펼칠 때 임계 초과 예상 시 **가장 오래 펼친 차시 자동 접기(LRU)** + 사용자 수동 접기 지원. (전체 완전 전개 ≈ 282노드이므로 절대 한꺼번에 그리지 않음.)
- 초기 로딩 2초 내(활동 노드 지연 생성), 60fps 목표.
- 노드 색: 대단원 5색 고정(`@sai/theme`), 콘텐츠·차시·활동은 소속 대단원 색 명도 변화. 도트밸리 매핑 간선 `instructor:true` → 점선/배지 + 범례.
- **재구성 바구니**: 활동 담기/빼기 → 하단 트레이 → 내보내기 시 "제목 + 딥링크 + 연계 성취기준" 마크다운 클립보드 복사(localStorage 유지).

---

## 4. 작업 분해 (WBS) — Codex CLI 태스크

각 태스크는 Codex 1회 세션 크기. 완료 판정의 "수용 기준 n(부스)/n(데모)"는 각 PRD의 8장/7장 번호.

### 기반 (P0 선행)
**T02 — 모노레포 스캐폴딩**
- (a) npm workspaces + Turborepo, 두 Next.js(App Router, TS) 앱 뼈대, 공유 `tsconfig.base.json`, 루트 스크립트(dev/build/lint)
- (b) `package.json`, `turbo.json`, `tsconfig.base.json`, `apps/booth/*`, `apps/lesson-demo/*` 최소 뼈대, `packages/{firebase,theme,data}/package.json`
- (c) 없음
- (d) `npm run dev`로 두 앱이 각각 기동, 빈 페이지 렌더

**T03 — @sai/theme 디자인 토큰**
- (a) 색·타이포·모션 토큰을 CSS 변수+TS 상수로. 도트밸리(탐험 그린), 세계수(숲 앰버), 대단원 5색, 다크 그래프 배경, "교사의 눈" 별색
- (b) `packages/theme/src/{tokens.css,tokens.ts,index.ts}`
- (c) T02
- (d) 두 앱에서 토큰 임포트로 배경/텍스트 색 적용, 인라인 색상 0건

**T04 — @sai/data 로더·모델·빌더**
- (a) 두 JSON 빌드 타임 임포트, 타입 모델, 성취기준 조회, **미션 정의 상수**(부스 6미션·활동 스텝 매핑), lesson-demo 4단계 상수, 그래프 빌더 시그니처(3.1) 구현
- (b) `packages/data/src/{content.ts,standards.ts,missions.ts,graph.ts,index.ts}`
- (c) T02
- (d) 232활동·25성취기준 로드, `buildInitialGraph()`가 30노드 반환, 미션별 활동 딥링크 조회 동작

**T05 — @sai/firebase 초기화·인증·규칙**
- (a) Firebase 초기화(NEXT_PUBLIC 설정), `db`/`storage`, 컬렉션 ref 헬퍼, `ensureAnonymousAuth()`, `firestore.rules`(2.2)
- (b) `packages/firebase/src/{app.ts,collections.ts,auth.ts,index.ts}`, `packages/firebase/firestore.rules`
- (c) T02, D1·D4 확정
- (d) 익명 로그인 후 임의 progress 문서 write 성공, 타 uid 문서 write 규칙 거부

### 부스 플랫폼 P0
**T06 — booth S0 입장·회차 선택**
- (a) 입장 게이트(소속·성함, 최소수집 안내), 회차 카드+접속 QR, 해시 라우팅 유지, pid/localStorage 복구, participants 기록, 강사 우회
- (b) `apps/booth/app/page.tsx`(S0 파트), `components/EntryGate.tsx`, `components/RoundSelect.tsx`, `lib/session.ts`
- (c) T03,T04,T05
- (d) 부스 수용 1(새로고침 회차 유지), 9 일부(입장→participants 기록·복구)

**T07 — booth 상단바·발표모드·타이머**
- (a) 상단 고정바(회차명·섹션 내비), 발표 모드 키보드(←/→·스페이스·P빔), 세션 30분+미션 18분 타이머(3분 전 경고)
- (b) `components/TopBar.tsx`, `components/Timer.tsx`, `lib/presenter.ts`
- (c) T06
- (d) 부스 수용 6(키보드 전환·타이머), F2/F3

**T08 — booth S2 미션 보드 + 도장**
- (a) 회차별 추천 미션 3개 카드(미션명·시간·활동 스텝 딥링크·성취기준 칩+전문 툴팁·교사의 눈), 완료 도장 → progress Firestore 즉시 반영+localStorage, 3개 완료 배지, 교사용 매뉴얼 버튼 상시 노출
- (b) `components/MissionBoard.tsx`, `components/MissionCard.tsx`, `components/StandardChip.tsx`, `lib/progress.ts`
- (c) T06,T07
- (d) 부스 수용 2(딥링크 새 탭·232 렌더), 5(도장·배지), 9(도장→대시보드 1초 반영·복구)

**T09 — booth S1·S4·S5 (오프닝·사례·자료실)**
- (a) S1 오프닝(세계관·경로 차이), S4 사례 3장(전환기 완주 / 재구성 시나리오+`DEMO_LESSON_URL` 버튼 / 공개수업 5차시), S5 마무리+**자료실**(매뉴얼 PDF 4종 직다운로드·`saiCatalog` 초중고 링크·설문 QR `SURVEY_URL`)
- (b) `components/{Opening,CaseStudy,Closing,ResourceHub,SurveyQR}.tsx`, `lib/constants.ts`(SURVEY_URL·DEMO_LESSON_URL 참조)
- (c) T06
- (d) 부스 수용 7(URL 상수 1곳 교체), 8(PDF 4종 즉시 다운로드·카탈로그 링크)

**T10 — booth /teacher 대시보드**
- (a) PIN 진입, 회차 탭(12:00/15:00) × 참가자 × 미션3 완료 그리드 onSnapshot, 참가자 수, 이름 마스킹 토글, 회차 리셋(=파기)
- (b) `apps/booth/app/teacher/page.tsx`, `components/DashboardGrid.tsx`, 리셋 경로(2.2 주1 정책)
- (c) T05,T08, D3 확정
- (d) 부스 수용 9(그리드 1초 반영·리셋 일괄 삭제), F11 전부

### 시연 차시 웹앱 P0
**T11 — lesson-demo 입장·차시 홈·단계 카드**
- (a) 학번5+이름 입장·localStorage 복구, 차시 홈(성취기준 9정02-03·04 칩+전문 접기·목표), 단계 카드5(도입/전개1~3/형성평가), 활동 딥링크, 완료 체크→progress, 전개3 산출물 텍스트 제출·수정
- (b) `apps/lesson-demo/app/page.tsx`, `components/{Entry,LessonHome,StepCard,ArtifactInput}.tsx`, `lib/{session,steps}.ts`
- (c) T03,T04,T05, D2 확정
- (d) 데모 수용 1(딥링크·완료→그리드 반영), 5(재접속 복구), F6

**T12 — lesson-demo 형성평가·진행바·동료 현황판**
- (a) 형성평가 3문항(객관식 자동 채점·단답 저장), 진행바(5단계 완료율·축하 화면), 동료 현황판(이름·단계만)
- (b) `components/{QuizForm,ProgressBar,PeerBoard}.tsx`, `lib/quiz.ts`
- (c) T11
- (d) 데모 수용 2 일부(객관식 자동채점·정답률 갱신은 T13와 함께), F3/F4

**T13 — lesson-demo /teacher 대시보드**
- (a) PIN 진입, 참여자×5단계 그리드 onSnapshot, 객관식 정답률 도넛, 단답·산출물 리스트, 이름 마스킹, 세션 리셋, `activeSession` 전환(booth-1200↔booth-1500)
- (b) `apps/lesson-demo/app/teacher/page.tsx`, `components/{DemoGrid,QuizStats,AnswerList}.tsx`
- (c) T11,T12, D2·D3 확정
- (d) 데모 수용 2·3·4(정답률·산출물 리스트·마스킹·리셋·세션 전환)

### P1 (있으면 좋음)
**T14 — booth S3 3D 지식그래프** (3장 전략 구현: 초기30·점진확장·사이드패널·재구성 바구니 내보내기·검색·2D 폴백) / (b) `components/{KnowledgeGraph,GraphSidePanel,BasketTray,GraphSearch,ListFallback}.tsx` / (c) T04,T08 / (d) 부스 수용 3(성취기준 클릭→차시→활동→딥링크 4클릭 이내·재구성안 구분), 4(바구니 3개→마크다운 복사)
**T15 — lesson-demo Gemini 피드백** (`/api/feedback` Vercel 라우트, 산출물·단답 → 성취기준 관점 피드백+도달도 제안, 실패 시 조용한 폴백, 프롬프트/스키마 상수 분리) / (c) T13, GEMINI_API_KEY / (d) 데모 수용 2(5초 내 피드백·실패 시 제출 정상)
**T16 — lesson-demo /how 정적 페이지** (제작 과정 3단계) / (c) T02 / (d) 데모 F7
**T17 — 배포·마감 게이트** (Vercel 프로젝트 2개, 환경변수 주입, DEMO_LESSON_URL 연결, README, 마감 게이트 리허설을 REVIEW.md에 기록) / (c) 전 P0 / (d) `WORKFLOW` 마감 게이트 항목 전부

### 의존 그래프 요약
```
T02 → T03,T04,T05
T05,T04,T03 → T06 → T07 → T08 → T09
T08,T05 → T10
T03,T04,T05 → T11 → T12 → T13
(P1) T14←T08 ; T15←T13 ; T16←T02 ; T17←모든 P0
```

---

## 5. 리스크 3종과 대응

1. **그래프 헤어볼** — 활동 232개를 한 번에 그리면 판독 불가·프레임 저하.
   → 초기 30노드 + 점진 확장, 확장 상한 200 + LRU 자동 접기(3.2), 2D 목록 폴백 상시 제공. T14를 P1로 두어 P0 데모가 그래프에 의존하지 않게 분리.
2. **Firestore 규칙 실수로 쓰기 차단(또는 과개방)** — 규칙이 빡빡하면 도장이 안 써지고, 느슨하면 타인 문서 삭제 구멍.
   → 익명 인증 uid 기반 소유권 규칙(2.2), 삭제는 규칙에서 차단하고 리셋은 관리 경로(주1). 배포 전 에뮬레이터/실사용 write·타인 write 거부 테스트를 T05·T10·T13 완료 판정에 포함.
3. **행사 당일 12:00→15:00 세션 전환 실수** — 잘못된 세션에 기록되거나 이전 회차 데이터가 섞임.
   → 부스는 세션ID를 회차 해시(#dotvalley/#sos)에 **결정론적으로 바인딩**(dotvalley-1200/sos-1500), 사람이 고를 여지 최소화. lesson-demo는 대시보드 세션 전환을 **명시 버튼 1개 + 확인 다이얼로그**로. 리셋=현재 세션만 삭제. 전환 절차가 클릭 몇 번인지 REVIEW 마감 게이트에서 실측.

---

## 6. 구현 순서 (P0 / P1)

**P0 (8/6 필수):** T02 → T03 → T04 → T05 → (booth) T06 → T07 → T08 → T09 → T10 → (lesson-demo) T11 → T12 → T13.
- 부스: 입장·미션보드·강사 대시보드·자료실·설문 QR 확보. lesson-demo: 학생 흐름·대시보드 확보. **그래프 없이도 행사 진행 가능한 상태.**

**P1 (여유 시):** T14(3D 그래프 고급 인터랙션) → T15(Gemini 피드백) → T16(/how) → T17(배포·마감 게이트 정식화).
- 단, **T17의 배포 자체는 P0 검증에도 필요** → P0 완료 시점에 booth+lesson-demo를 각각 프리뷰 배포해 딥링크·QR·대시보드 실증(마감 게이트 축약본)을 먼저 돌리고, P1에서 최종 게이트로 승격.

---

## 7. 참고: 확인된 데이터 사실
- 활동 총 **232개** = 도트밸리 128(10차시) + 세계수 104(8차시). 도트밸리 차시별 활동 13/13/12/12/12/13/13/13/13/14, 세계수 8차시 각 13.
- 성취기준 25개(9정01 컴퓨팅시스템 3 / 9정02 데이터 5 / 9정03 알고리즘·프로그래밍 9 / 9정04 인공지능 5 / 9정05 디지털문화 3).
- content-links 구조: `contents[].{id,title,body,mapUrl,originUrl,lessons[].{no,title,activities[].{no,title,link,type}},guides.{student,teacher}}` + `saiCatalog.{platformHome,elementary[3],middle[3],high[4],highProjects[5]}`.
- 매뉴얼 확인: 도장 모으기→이수증, 이탈 시 처음부터, 무로그인·기록없음, 모바일 학습 불가(S4 운영 팁과 일치).
