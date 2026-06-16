# 전문가 검토 합성

## 1. 결론

최고 포맷은 다음 8개 계약을 중심으로 잡는다.

1. `World Math Beat`: 수학이 세계를 조작하게 만드는 미션 단위.
2. `Visual Interaction Blueprint`: 상태가 있는 지도, 장면, 오브젝트, 모션 계약.
3. `Healthy Engagement Loop`: 사건 하나를 닫고 질문 하나만 여는 건강한 몰입 구조.
4. `Browser-only Save Contract`: 개인정보 없이 `localStorage`에 진행만 저장하는 정적 웹 게임 구조.
5. `Learning Engagement Artifacts`: 능력 카드, 오개념 카드, 단서 연결판, 복구 기록처럼 학습 기억을 다시 꺼내 쓰는 아티팩트 시스템.
6. `Curriculum Matrix`: 시즌, 개념, 능력, 조작, 오개념, 전이 과제를 관리하는 학습 범위 계약.
7. `Accessibility and Solo-use Contract`: 초등학생이 혼자 키보드, 터치, 큰 글자, 모션 축소에서도 완주하는 사용성 계약.
8. `Operations Contract`: versioned registry, 저장 migration, release gate, 회귀 테스트를 관리하는 장기 운영 계약.

이 계약들이 없으면 구현은 객관식 문제집, 예쁜 랜딩, 보상 수집 앱, 유지 어려운 콘텐츠 묶음으로 흐를 위험이 크다.

아티팩트 시스템의 상세 계약은 [learningEngagementArtifacts.md](learningEngagementArtifacts.md)를 기준으로 한다.
커리큘럼과 품질 기준은 [curriculumMatrix.md](curriculumMatrix.md), [episodeAuthoringGuide.md](episodeAuthoringGuide.md), [contentQualityRubric.md](contentQualityRubric.md)를 따른다.
접근성과 운영 기준은 [accessibilityAndUsability.md](accessibilityAndUsability.md), [operationsPrd.md](operationsPrd.md)를 따른다.

## 2. 최종 미션 포맷

모든 핵심 미션은 `World Math Beat`를 가진다.

```text
이상현상
→ 수학 규칙
→ 관찰 단서
→ 손 조작
→ 시각 모델
→ 수학 문장
→ 세계 반응
→ 이야기 단서
```

금지선:

- `question/choices/answer`만 있는 미션.
- 성공 후 능력만 지급하고 장면이 바뀌지 않는 미션.
- 오답이 "틀렸어요"로만 끝나는 미션.
- 수식이 장면 조작보다 먼저 나오는 미션.

## 3. 최종 게임 포맷

Product Core Slice는 자유 이동 게임이 아니라 지도 기반 장면 어드벤처다.

```text
지도 기반 허브
→ 장면 기반 에피소드
→ 오브젝트 조작 미션
→ 장소 복구
→ 단서장과 능력 도감 갱신
→ 지도 복귀
```

이유:

- 초등학생이 바로 이해한다.
- GitHub Pages 정적 앱으로 구현 가능하다.
- 수학 개념을 오브젝트 조작으로 연결하기 쉽다.
- 모바일에서 안정적이다.
- 에셋 제작 범위가 통제된다.

## 4. 최종 그래픽 포맷

Core Slice 그래픽은 다음 비율로 간다.

| 계층 | 방식 | 책임 |
| --- | --- | --- |
| 레이아웃 | CSS | 반응형, bottom sheet, 버튼, 카드 |
| 지도와 조작 | SVG | 장소 상태, 시계 바늘, 번호판, 케이크 조각 |
| 감정 | bitmap 또는 SVG | 노바 표정, 제로 쪽지, 작은 보상 장면 |
| 모션 | CSS transition | focus, wrong, correct, restored |

가장 중요한 첫 장면은 `시계탑이 멈춘 날`이다. 지도에서 멈춘 시계탑을 누르고, 시계와 버스 시간표를 비교하고, 답을 맞히면 바늘이 움직이며 정류장 불이 켜지는 흐름이 제품의 정체성을 증명한다.

## 5. 최종 몰입 포맷

몰입은 다음 6개 규칙으로 고정한다.

1. 에피소드마다 사건 1개를 해결한다.
2. cliffhanger는 다음 질문 1개만 연다.
3. 지도는 복구 전후가 눈에 보이게 한다.
4. 단서장은 수집률이 아니라 이해 연결 중심이다.
5. 능력 도감은 배지가 아니라 쓸 수 있는 도구 목록이다.
6. 세션 끝은 `계속하기`보다 `지도 보기`와 `오늘은 여기까지`를 기본값으로 둔다.

금지선:

- 출석 보상.
- 랜덤 보상.
- 순위표.
- 빨간 알림 배지 남발.
- 다음 에피소드 강제 시작.
- 숨겨진 수집률 압박.

## 6. 최종 브라우저 저장 포맷

Core Slice는 다음 구조로 고정한다.

```text
localStorage: 진행 상태와 설정
HTTP cache: 이미지, 글꼴, bundle
service worker: Core Slice 제외
IndexedDB: Core Slice 제외
Cache API: Core Slice 제외
```

진행 key:

```text
suspiciousMathCity.progress.v1
```

저장하지 않는 것:

- 이름
- 학년
- 학교
- 보호자 정보
- 자유입력 텍스트
- 기기 식별자
- 초 단위 행동 시각

구현 필수:

- `progressStore.js`만 `localStorage` 접근.
- JSON parse 실패 처리.
- schemaVersion 불일치 처리.
- 알 수 없는 id 제거.
- 저장 실패 시 게임 진행은 계속.

## 7. 구현 첫 슬라이스

첫 구현은 에피소드 수보다 제품 약속을 증명해야 한다.

순서:

1. `/math-city` route, prerender, sitemap.
2. `localStorage` 진행 저장.
3. versioned registry와 registry 검증.
4. SVG toy-city 지도.
5. 시계탑 장면.
6. 시간 렌즈 조작.
7. 끌기 대체 조작과 키보드 경로.
8. 시계탑 복구 애니메이션.
9. 능력 도감, 단서장.
10. 큰 글자와 모션 축소 확인.
11. 숫자 버스, 반쪽 빵집.

시계탑 장면이 완성되기 전에는 에피소드 수를 늘리지 않는다.

## 8. 장기 유지 판정

장기 프로젝트로 볼 수 있는 기준:

| 영역 | 통과 기준 |
| --- | --- |
| 학습 | 커리큘럼 매트릭스에 개념, 선수 감각, 오개념, 전이 과제가 있다 |
| 제작 | Episode Brief부터 registry 등록까지 제작 절차가 있다 |
| 접근성 | 키보드, 터치, 큰 글자, 모션 축소, 소리 없음에서 완주 가능 |
| 몰입 | 재방문 이유가 출석이나 보상이 아니라 능력 재사용과 단서 연결이다 |
| 운영 | id 안정성, migration, gate, 회귀 테스트가 있다 |

이 기준을 통과하지 못하면 시즌 확장이 아니라 첫 에피소드 품질 보강으로 돌아간다.
