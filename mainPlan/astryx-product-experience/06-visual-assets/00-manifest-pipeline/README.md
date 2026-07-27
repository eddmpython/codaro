# 00 Manifest Pipeline

상태: 진행

## 목표

모든 product, outcome, instructional, social asset을 source와 provenance가 추적되는 하나의 manifest로 관리하고 Landing과 Editor가 같은 ID를 해석하게 한다.

남은 종료 조건은 product, outcome, instructional, social asset의 출처와 사용 권한을 사람이 검수하고, 설명할 수 없는 자산이 없음을 승인하는 것이다.

## 구현 순서

1. manifest의 `author`, `license`, `licenseUrl`, source와 사용 목적을 자산별로 사람이 대조한다.
2. 자체 제작, 캡처, 외부 라이선스 자산의 근거가 실제 파일과 일치하는지 검수한다.
3. 출처나 사용 권한을 설명할 수 없는 자산을 제거하거나 올바른 근거로 교체한다.
4. Landing과 Editor에서 노출되는 자산 집합에 대해 최종 provenance 승인을 기록한다.

## 영향 파일

- `assets/brand/visuals/manifest.json`
- 실제 source asset과 라이선스 근거
- `docs/skills/ops/product/branding.md`

## 영향 함수·심볼

- 없음. 남은 작업은 자산 provenance 사람 검수와 승인이다.

## 테스트

- manifest provenance 사람 검수표
- Landing과 Editor 노출 자산의 출처·권한 표본 대조

## 롤백

- 검수 근거가 불충분한 자산은 public usage에서 제외하고 검증된 대체 자산이 생길 때까지 text fallback을 사용한다.

## 평가

### 개발자 관점

- manifest 하나가 source, output, app mirror의 drift를 막아야 한다.

### PM 관점

- 출처와 사용 목적을 설명할 수 없는 이미지는 제품 자산으로 승인하지 않는다.
