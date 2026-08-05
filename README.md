# school-ai-booth

2026 과·수·정 콘퍼런스(부산 BEXCO) **School AI 부스** 웹 애플리케이션.
2022 개정 중학교 정보과 성취기준 기반으로 School AI 콘텐츠(「도트밸리 속 버그를 잡아라」/「S.O.S 세계수를 구하라」)를 체험·재구성하는 단일 Next.js 앱.

- **부스 플랫폼** `/` — 입장·회차선택 → 오프닝 → 미션보드(도장) → 3D 지식그래프 → 사례 → 자료실, 강사 대시보드 `/teacher`
- **시연 차시앱** `/demo` — 「데이터를 풀어라!」 학생 흐름(활동·산출물·형성평가) + 교사 대시보드 `/demo/teacher`, 제작 과정 `/demo/how`

## 기술 스택
- Next.js 15 (App Router, TypeScript) · React 19
- Firebase (Firestore + 익명 인증 + Storage) — 실시간 도장·대시보드
- Gemini API (`/api/feedback` 서버 라우트) — 형성평가 자동 피드백
- 3d-force-graph (three.js) — 지식그래프
- Vercel 배포 (프로젝트 1개)

## 로컬 실행
```bash
npm install
cp .env.example .env    # 값 채우기(아래)
npm run dev             # http://localhost:3000
```
빌드/검증: `npm run build`, `npm run typecheck`

## 환경 변수 (`.env`)
`.env`는 커밋하지 않습니다(`.gitignore`). 이름만 담긴 `.env.example` 참고.

| 변수 | 용도 | 노출 |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` 외 6종 | Firebase 웹 SDK 설정 | 클라이언트(정상) |
| `GEMINI_API_KEY` | Gemini 피드백 | **서버 전용** |
| `TEACHER_PIN` | 대시보드 PIN(기본 데모: 123456) | **서버 전용** |
| `NEXT_PUBLIC_SURVEY_URL` | 의견조사 QR 대상 | 클라이언트 |
| `NEXT_PUBLIC_DEMO_LESSON_URL` | 시연 차시앱 경로(기본 `/demo`) | 클라이언트 |

## 배포 전 필수 설정 (Firebase 콘솔)
1. **Authentication → Sign-in method → 익명(Anonymous) 사용 설정**
2. **Firestore Database 생성** (예: asia-northeast3)
3. **Firestore → 규칙(Rules)** 에 리포의 `firestore.rules` 내용을 붙여넣고 **게시** — 이걸 해야 도장·대시보드 쓰기가 동작

## Vercel 배포
```bash
npm i -g vercel
vercel link          # 프로젝트 연결(1개)
# 환경 변수 등록: Vercel 대시보드 또는
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY   # ... 위 표의 변수 전부
vercel --prod        # 프로덕션 배포
```
배포 후 `NEXT_PUBLIC_SURVEY_URL`에 실제 설문 폼 주소를 넣고 재배포하면 마무리 QR에 반영됩니다.

## 데이터 모델 (Firestore)
```
booth/{sessionId}/participants/{uid}   { school, name, joinedAt, uid }
booth/{sessionId}/progress/{uid}       { m1, m2, m3, updatedAt, uid }
sessions/{sessionId}/students/{uid}    { name, studentNo, joinedAt, uid }
sessions/{sessionId}/progress/{uid}    { steps, artifact, quiz, feedback?, updatedAt, uid }
```
- 부스 세션: `dotvalley-1200`(12:00) / `sos-1500`(15:00)
- 차시앱 세션: `booth-1200` / `booth-1500` (학생 접속 `?s=` 로 지정, 교사 대시보드에서 전환)

## 개인정보·데이터 삭제 (행사 종료 후)
- 수집 항목은 **소속·성함(부스)·학번·이름(차시앱)** 뿐. 익명 인증 uid로 문서 소유.
- 각 대시보드의 **리셋 버튼**으로 해당 세션의 participants/students·progress를 일괄 삭제(파기).
- 행사 종료 후 두 대시보드에서 모든 세션을 리셋하면 개인정보가 남지 않습니다.

## 문서
- `docs/PRD-schoolai-booth.md`, `docs/PRD-lesson-demo.md` — 요구사항
- `docs/PLAN.md` — 구현 계획·WBS·결정사항
- `docs/REVIEW.md` — 수용 기준 대조·마감 게이트
- `docs/WORKFLOW-build-pipeline.md` — 빌드 파이프라인 규칙

푸터: 이승엽(장평중학교) · 도트밸리 5·8·10차시 집필
