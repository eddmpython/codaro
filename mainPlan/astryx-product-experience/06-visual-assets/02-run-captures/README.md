# 02 Run Captures

상태: 진행

## 목표

완성된 Web 학습과 Notebook 표면을 실제 fixture로 캡처해 Landing과 docs의 제품 proof로 사용한다.

남은 종료 조건은 전체 상태 shot, light/dark 쌍 눈검수와 현재 제품 source를 기준으로 한 사람 검수다.

## 구현 순서

1. ready, running, checkFail, checkPass, localRequired 전체 상태 shot을 채운다.
2. 390x844, 768x1024, 1440x900에서 text clipping과 action 가시성을 눈검수한다.
3. light/dark 쌍에서 focal point, 작은 한국어, 확대 동작을 눈검수한다.
4. 현재 제품 source와 proof가 일치하는지 사람이 최종 승인한다.

## 영향 파일

- `assets/brand/visuals/manifest.json`
- `assets/brand/visuals/product/run/`

## 영향 함수·심볼

- 없음. 남은 작업은 전체 상태 shot과 light/dark 쌍의 사람 검수다.

## 테스트

- 전체 상태 shot 사람 검수
- 390x844, 768x1024, 1440x900 light/dark 비교

## 롤백

- capture fixture와 UI commit이 다르면 이전 asset을 current proof로 표시하지 않는다.
- failed capture를 수동 편집한 이미지로 대체하지 않는다.

## 평가

### 개발자 관점

- fixture와 git head가 고정돼야 screenshot이 재현 가능한 테스트 자산이 된다.

### PM 관점

- 첫 화면 이미지만 보고도 읽기, 편집, 실행, 검증이 한 제품 안에서 일어남을 알아야 한다.
