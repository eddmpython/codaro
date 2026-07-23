# 00 Manifest Pipeline

상태: 진행

## 목표

모든 product, outcome, instructional, social asset을 source와 provenance가 추적되는 하나의 manifest로 관리하고 Landing과 Editor가 같은 ID를 해석하게 한다.

현재 `manifest.json`과 schema, deterministic build, AVIF/WebP responsive variants, Landing/Editor generated mirror가 구현돼 있다. 사람 provenance 검수와 completion evidence가 없어 `_done`은 아니다.

## 구현 순서

1. `VisualAssetManifest` JSON schema와 source directory contract를 만든다.
2. 기존 mascot와 screenshot을 manifest로 이관한다.
3. source hash, responsive AVIF/WebP, dimension, focal point를 결정적으로 생성한다.
4. landing/editor public mirror와 resolver를 만든다.
5. stale output, orphan source, license/provenance 누락을 gate로 차단한다.

## 영향 파일

- 신규 `assets/brand/visuals/manifest.json`
- 신규 `assets/brand/visuals/manifest.schema.json`
- 신규 `assets/brand/tools/buildVisualAssets.py`
- `assets/brand/tools/buildBrandAssets.py`
- `landing/scripts/syncBrand.js`
- 신규 `landing/scripts/syncVisualAssets.js`
- 신규 `editor/scripts/syncVisualAssets.mjs`

## 영향 함수·심볼

- 신규 `VisualAssetManifest`, `VisualAssetRecord`, `validateVisualManifest`
- 신규 `buildResponsiveVariants`, `resolveVisualAsset`
- 기존 brand build와 landing top-level sync flow

## 테스트

- 신규 `tests/assets/testVisualAssetManifest.py`
- 신규 `tests/assets/testBuildVisualAssets.py`
- 신규 `tests/assets/verifyVisualAssetBudget.py`
- `uv run python -X utf8 tests/run.py gate docs`

## 롤백

- source는 이동 전 hash와 path를 보존하고 derived output만 atomic replace한다.
- sync 실패 시 기존 hashed public asset과 manifest를 함께 유지한다.

## 평가

### 개발자 관점

- manifest 하나가 source, output, app mirror의 drift를 막아야 한다.

### PM 관점

- 출처와 사용 목적을 설명할 수 없는 이미지는 제품 자산으로 승인하지 않는다.
