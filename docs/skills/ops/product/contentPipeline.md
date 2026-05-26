---
id: content-pipeline
title: 콘텐츠 발급 파이프라인
description: Local-only short video, carousel, and publishing package workflow for Codaro.
category: ops
section: product
order: 342
purpose: Codaro의 제품 증거를 짧은 영상, 캐러셀, 발행 패키지로 반복 생산하되 실제 작업물은 로컬 전용으로 격리한다.
whenToUse: 쇼츠, 릴스, 캐러셀, 제품 데모 영상, 업로드 캡션, 콘텐츠 발급 작업장을 만들거나 정리할 때.
---

# 콘텐츠 발급 파이프라인

Codaro 콘텐츠는 일반 홍보물이 아니라 제품 증거다. 좋은 결과물은 "무엇을 말했는가"보다 "실제로 무엇을 보여줬는가"로 판단한다. 에디터 화면, 실행 결과, 자동화 산출물, 학습 흐름, 로컬 런타임 복구 장면이 중심이어야 한다.

## 저장소 경계

- 실제 작업장은 루트 `sns/`다.
- `sns/`는 `.gitignore`로 추적하지 않는다.
- 공개 글과 긴 설명은 `docs/blog/`에 둔다.
- 안정된 운영 규칙만 `docs/skills/ops/product/`에 둔다.
- 브랜드 원본과 확정 export는 `assets/brand/`, `editor/public/brand/`, `landing/static/brand/` 경계를 따른다.
- 렌더 파일, 캡션 초안, 업로드 패키지, 음원, 화면 녹화, 썸네일 후보는 루트나 문서 폴더에 남기지 않는다.

## 로컬 폴더 계약

```text
sns/
├── README.md
├── briefs/
├── work/
├── templates/
├── assets/
├── renders/
├── qa/
├── publish/
└── scripts/
```

- `briefs/`: 소재 후보와 원천 링크를 보관한다.
- `work/`: 개별 콘텐츠 팩을 만든다. 형식은 `{NNN}-{slug}`다.
- `templates/`: 반복 포맷의 예시 brief와 시각 규칙을 둔다.
- `assets/`: 로컬 캡처, 배경, 썸네일 후보를 둔다.
- `renders/`: 중간 렌더와 스냅샷을 둔다.
- `qa/`: 자동 점검 리포트를 둔다.
- `publish/`: 최종 업로드 패키지만 모은다.
- `scripts/`: 스캐폴드와 QA 보조 스크립트를 둔다.

## 발급 단계

1. `brief`: 대상 사용자, 한 문장 약속, 실제 증거 장면, 금지 문구, CTA를 고정한다.
2. `sourceEvidence`: 문서, 제품 화면, 실행 결과, 블로그 원문, 변경 로그 중 최소 1개를 연결한다.
3. `script`: 첫 2초 문제 제기, 실제 제품 장면, 결과, CTA 순서로 쓴다.
4. `visualPlan`: 화면 캡처, 코드 셀, 자동화 로그, 리포트 결과, 마스코트 사용 여부를 컷 단위로 정한다.
5. `render`: 포맷별 템플릿으로 출력한다.
6. `qa`: 문구 길이, 첫 화면 명확성, 근거 누락, 과장 표현, 링크, 모바일 가독성을 확인한다.
7. `publish`: 업로드 파일, 썸네일, 캡션, 해시태그, 원천 링크를 한 폴더로 묶는다.

## 포맷 기준

### 쇼츠/릴스

- 길이: 15-60초.
- 첫 2초에 문제 또는 결과가 보여야 한다.
- 제품 화면 없이 말만 이어지는 컷을 피한다.
- 코드 글자는 모바일에서 읽히는 크기로 캡처한다.
- 마지막에는 Codaro가 해결한 작업 종류를 한 줄로 남긴다.

### 캐러셀

- 크기: 1080 x 1350.
- 권장 장수: 5-8장.
- 구조: Hook, 문제, Codaro 방식, 실제 화면, 결과, CTA.
- 한 장에는 주장 하나만 둔다.
- 마지막 장은 링크보다 행동을 먼저 말한다.

### 긴 영상

- 길이: 3-8분.
- 이야기보다 제품 완주 흐름을 우선한다.
- "설치 → 목표 입력 → 실행 → 실패 복구 → 결과" 중 최소 3단계를 보여준다.
- 긴 영상에서 뽑은 핵심 장면은 쇼츠와 캐러셀로 재사용한다.

## 품질 Gate

콘텐츠는 아래 기준을 통과해야 발행 패키지로 보낸다.

- 약속: 첫 문장과 최종 결과가 같은 문제를 다룬다.
- 증거: 실제 화면, 실행 결과, 문서 링크 중 하나 이상이 있다.
- 가독성: 모바일에서 제목, 코드, 버튼, 캡션이 잘리지 않는다.
- 정확성: 없는 기능, 아직 검증되지 않은 품질, 과장된 성능 표현을 쓰지 않는다.
- 브랜드: Codaro 이름, 색, 마스코트, 제품 화면이 포맷에 맞게 보인다.
- CTA: 블로그, GitHub, 제품 문서, 다음 학습 행동 중 하나로 연결한다.
- 권리: 외부 이미지, 음원, 폰트 출처를 기록한다.

## 콘텐츠 축

- 자동화 결과: 태스크 실행, 리포트 생성, 알림, 재실행 흐름.
- 학습 흐름: 커리큘럼 YAML, 코드 셀, 실행 결과, 피드백.
- 에디터 런타임: `# %%` 셀, 로컬 Python, 패키지 준비, 오류 복구.
- 제품 철학: 코드가 인터페이스가 되는 개인 자동화 스튜디오.
- 공개 글 재가공: `docs/blog/` 글을 쇼츠와 캐러셀로 분해한다.

## 로컬 명령

```bash
uv run python -X utf8 sns/scripts/createContentPack.py --kind shorts --slug automation-report-demo --source docs/skills/identity/automation-tasks-reports.md
uv run python -X utf8 sns/scripts/qaContent.py
```

이 명령은 로컬 `sns/` 작업장만 변경한다. 결과물은 추적하지 않는다.

## 완료 기준

콘텐츠 1개는 아래 파일을 갖출 때 완료로 본다.

```text
sns/work/{NNN}-{slug}/
├── brief.json
├── script.md
├── visualPlan.md
├── qaChecklist.md
└── publish/
    ├── caption.txt
    ├── hashtags.txt
    └── sourceLinks.txt
```

렌더 파일이 없어도 brief, script, visual plan, QA checklist가 없으면 좋은 결과물로 보지 않는다.
