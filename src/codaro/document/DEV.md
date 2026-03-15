# Document DEV

## 역할

`src/codaro/document/`는 Codaro 문서의 canonical 모델과 포맷 변환을 담당한다.

현재 지원 포맷:
- Codaro native `.py`
- marimo `.py`
- Jupyter `.ipynb`

## 파일 구성

- `models.py`
  - `CodaroDocument`
  - `BlockConfig`
  - `DocumentMetadata`
  - `RuntimeConfig`
  - `AppConfig`
- `service.py`
  - 문서 생성
  - 로드
  - 저장
  - export
- `codaroFormat.py`
  - Codaro native Python 파서/writer
- `marimoFormat.py`
  - marimo import/export
- `jupyterFormat.py`
  - Jupyter import/export
- `analysis.py`
  - Python AST 기반 defines/uses 분석

## canonical 모델

현재 문서 필드는 아래를 기준으로 한다.
- `id`
- `title`
- `blocks`
- `metadata`
- `runtime`
- `app`

블록은 현재 두 타입이 중심이다.
- `code`
- `markdown`

각 블록은 아래 실행 상태를 가진다.
- `executionCount`
- `status`
- `lastRunAt`
- `lastOutput`

## 로드 규칙

`service.loadDocument()`는 아래 순서로 포맷을 판별한다.

1. `.ipynb` 확장자면 Jupyter로 처리
2. 소스에 `marimo.App` 또는 `@app.cell`이 있으면 marimo로 처리
3. 나머지는 Codaro native `.py`로 처리

즉 현재는 파일 메타데이터보다 파일 내용 기반 판별도 같이 사용한다.

## 저장 규칙

저장은 현재 항상 Codaro native `.py` writer를 기준으로 한다.
내부 메모리 모델을 JSON으로 외부 저장하지는 않는다.

저장 시 같이 정리되는 값:
- 제목 비어 있으면 파일명 사용
- `metadata.updatedAt` 갱신
- `app.title`을 문서 제목과 동기화

## 분석 규칙

`analysis.py`는 AST를 사용해 블록별 정의/사용 이름을 계산한다.
현재 목적은 아래 두 가지다.
- 중복 정의 감지
- 순환 참조 감지의 입력 데이터

이 레이어는 아직 단순하다.
- import
- 함수/클래스 정의
- 변수 대입
- builtin 제외한 사용 이름

## 한계

- 블록 타입이 아직 `code`, `markdown` 위주다
- 장기 목표인 `guide`, `widget`, `view`, `file`은 아직 모델에 본격 반영되지 않았다
- Jupyter와 marimo는 완전 보존이 아니라 편집 가능한 핵심 구조 보존을 목표로 한다
- 실행 결과 캐시는 문서 저장 포맷에 포함되지 않는다

## 다음 작업

- block 타입 확장
- 문서 레벨 schema version 추가
- widget/view descriptor를 문서 모델에 포함
- 분석 레이어를 dependency graph 중심으로 고도화
