# 빌드 파이프라인 — Claude CLI(기획) → Codex CLI(구현) → Claude CLI(검토)

대상 프로젝트 2개 (모노레포 권장, Firebase 프로젝트 공유):
- `apps/booth` — 부스 수강생 활동 플랫폼 (PRD-schoolai-booth.md v2.2)
- `apps/lesson-demo` — 시연용 차시 웹앱 (PRD-lesson-demo.md)

리포 루트에 넣을 컨텍스트 파일:
```
/docs/PRD-schoolai-booth.md
/docs/PRD-lesson-demo.md
/data/sai-content-links.json
/data/sai-standards-map.json
/docs/PLAN.md          ← 1단계 산출물 (Claude CLI 작성)
/docs/REVIEW.md        ← 3단계 산출물 (Claude CLI 작성, 반복 갱신)
.env.example           ← Firebase·Gemini 키, TEACHER_PIN, SURVEY_URL, DEMO_LESSON_URL
```
규칙: 실제 키·PIN은 절대 커밋하지 않음(.env는 .gitignore). 디자인 토큰(색·타이포·모션)은 CSS 변수/상수 파일 1곳으로 분리 — 추후 design.md 개편 대비.

## 리포 운영 규칙 (전 단계 공통)

- **모든 대화·산출 문서·커밋 메시지는 한국어**
- 리포: `https://github.com/kuekkuek85-85/school-ai-booth.git`, 브랜치는 **main 단일**(1일 스프린트 솔로 작업 — 피처 브랜치 생략)
- **모든 수정 작업 완료 시 자동으로 add → commit → push**까지 진행 (커밋 단위 = 태스크 단위, 메시지에 T번호 포함. 예: `T03: 미션 보드 도장 Firestore 연동`)
- 최초 1회 초기화 (이미 원격에 리포가 있으면 clone으로 대체):
```bash
echo "# school-ai-booth" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/kuekkuek85-85/school-ai-booth.git
git push -u origin main
```

---

## 1단계 — Claude CLI: 기획·구현 계획 (코드 작성 금지)

붙여넣을 지시문:

```
/docs의 PRD 2개와 /data의 JSON 2개를 정독하고, 코드는 한 줄도 작성하지 말고 /docs/PLAN.md만 작성해줘. PLAN.md에는 다음을 담는다:

1. 모노레포 구조 확정: 디렉터리 트리, 공유 패키지(Firebase 초기화, 테마 토큰, JSON 데이터 로더), 앱별 라우트 맵
2. 데이터 흐름 설계: Firestore 컬렉션 스키마(두 PRD의 모델 통합·충돌 검토), 보안 규칙 초안, pid/localStorage 복구 로직
3. 3D 지식그래프 구현 전략: 3d-force-graph 노드/간선 데이터 생성 함수 시그니처, 점진 확장 상태 관리, 성능 예산(초기 30노드→확장 시 200노드 이하)
4. 작업 분해(WBS): Codex에게 넘길 태스크를 T01, T02... 번호로, 각 태스크마다 (a)목표 (b)만드는 파일 경로 (c)의존 태스크 (d)완료 판정 기준(해당 PRD 수용 기준 번호 인용). 태스크 하나는 Codex 1회 세션에서 끝나는 크기로.
5. 리스크 3개와 대응(예: 그래프 헤어볼, Firestore 규칙 실수로 쓰기 차단, 행사 당일 세션 전환 실수)
6. 구현 순서 권고: 내일 행사(8/6)까지 필수인 것(P0)과 있으면 좋은 것(P1) 구분. P0 = 부스 앱 입장·미션보드·대시보드·자료실·설문QR, lesson-demo 학생 흐름·대시보드. P1 = 3D 그래프 고급 인터랙션, Gemini 피드백, /how 페이지

PRD와 모순되는 판단이 필요하면 임의 변경하지 말고 PLAN.md 상단 '결정 필요' 목록에 질문으로 남겨줘.
```

산출: `PLAN.md` (사람이 '결정 필요' 항목 답변 후 확정 커밋)

## 2단계 — Codex CLI: 태스크 단위 구현

태스크마다 붙여넣을 템플릿 (T번호만 바꿔 반복):

```
/docs/PLAN.md의 T{NN}을 구현해줘. 규칙:
- PLAN.md의 파일 경로·시그니처를 그대로 따를 것. 구조 변경이 필요하면 구현하지 말고 이유를 보고할 것
- /docs/PRD-*.md의 해당 수용 기준을 구현 후 스스로 점검하고, 점검 결과를 커밋 메시지에 한 줄 요약
- 환경변수는 .env.example에 이름만 추가, 값 하드코딩 금지
- 테마 값은 반드시 토큰 파일에서만 가져올 것(인라인 색상 금지)
- 완료 후: 변경 파일 목록, 로컬 실행 확인 방법(명령어), 못 다한 것을 보고하고, main에 커밋 후 자동 push까지 진행할 것
```

커밋 단위 = 태스크 단위, main 직커밋 + 자동 push. 3단계 검토에서 FAIL이 나오면 재작업 커밋으로 수정(리버트 대신 전진 수정).

## 3단계 — Claude CLI: 검토 (코드 수정 최소화)

붙여넣을 지시문:

```
방금 구현된 T{NN} 브랜치를 검토하고 /docs/REVIEW.md에 결과를 추가해줘 (기존 내용 유지, T{NN} 섹션 append):

1. PRD 수용 기준 대조: 해당 태스크가 커버하는 기준 번호별 PASS/FAIL/부분, FAIL은 재현 절차 명시
2. PLAN.md 준수 여부: 경로·시그니처 이탈 목록
3. 보안·개인정보 점검: 키 하드코딩, Firestore 규칙 구멍(타인 문서 쓰기 가능 여부), 소속·성함 노출 범위, 리셋=파기 동작
4. 행사 당일 리스크: 네트워크 순단 시 동작, 12:00→15:00 세션 전환 절차가 클릭 몇 번인지
5. 판정: 통과 / Codex 재작업 필요(재작업 지시문 초안까지 작성). REVIEW.md 갱신 후 자동 push

사소한 오타·상수 수준은 직접 고치고 커밋해도 되지만, 로직 재작성은 하지 말고 Codex 재작업 지시문으로 넘겨줘.
```

FAIL → 재작업 지시문을 2단계 템플릿에 넣어 Codex 재실행 → 다시 3단계. PASS → 다음 태스크로.

## 마감 게이트 (8/6 아침 배포 전 최종 체크)

Claude CLI에 마지막으로 실행:
```
main 기준으로 두 앱을 빌드·배포 리허설하고 다음만 확인해 REVIEW.md 맨 위에 '최종 게이트' 섹션으로 기록해줘:
부스 앱 — 입장→도장→대시보드 반영 / 딥링크 표본 10개 열림 / 매뉴얼 PDF 4종 다운로드 / SURVEY_URL·DEMO_LESSON_URL 실값 주입 확인
lesson-demo — 학생 입장→활동 4개→형성평가→대시보드 반영 / 세션 dotvalley-1200 초기 상태 / Gemini 실패 폴백
둘 다 — Vercel 프로덕션 URL, QR 스캔 테스트용 URL 출력
```
