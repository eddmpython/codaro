---
id: share-pack-distribution
title: 공유 팩 배포
description: Codaro curricula and automation recipe packs for local import, export, and future gallery distribution.
category: architecture
section: distribution
order: 210
purpose: 나만의 커리큘럼과 자동화를 GitHub Pages/GitHub Release/로컬 파일로 공유하되, 로컬 검증과 실행 경계를 고정한다.
whenToUse: 커뮤니티 커리큘럼, 자동화 recipe 공유, pack manifest, 다운로드/가져오기/내보내기 UI를 설계할 때.
---

# 공유 팩 배포

Codaro 공유 단위는 `codaroPack.yaml`을 루트에 둔 **pack**이다. GitHub Pages는 전시장, GitHub repository 또는 release asset은 배포 원본, Codaro 로컬 importer는 검증과 설치를 맡는다.

```text
GitHub Pages gallery
→ codaroPack.yaml 또는 .zip 링크
→ Codaro local inspect
→ manifest/path/YAML/automation 검증
→ localData/sharePacks 아래 설치
→ 공유 팩 제품 표면에서 커리큘럼 열기 또는 자동화 태스크 등록
```

## Pack 구조

```text
codaro-pack/
  codaroPack.yaml
  curricula/
    python/
      my-track/
        00_intro.yaml
        01_first_run.yaml
  automations/
    dailyReport.py
  assets/
  README.md
  LICENSE
```

기본 manifest:

```yaml
kind: codaroPack
specVersion: 1
id: example.daily-work
version: 0.1.0
title: 업무 자동화 입문 팩
author: example
license: MIT
codaro:
  minVersion: "0.1.0"
contents:
  curricula:
    - path: curricula/python/my-track/00_intro.yaml
    - path: curricula/python/my-track/01_first_run.yaml
  automations:
    - path: automations/dailyReport.py
packages:
  - pandas
permissions:
  filesystem: read
  network: optional
```

## 설치 경계

- built-in 커리큘럼은 저장소의 `curricula/`가 source of truth다.
- 공유받은 pack은 built-in 레지스트리에 복사하지 않고 Codaro 저장소 내부의 `localData/sharePacks` 아래에 설치한다.
- `localData/`는 `.gitignore` 대상이다. 설치된 pack, inspect cache, export archive, index는 Git 추적 대상이 아니다.
- 저장소 루트, `curricula/`, `automations/`에 외부 콘텐츠를 직접 풀지 않는다.
- 같은 pack id/version을 다시 설치하면 로컬 pack store 안에서만 교체한다.
- uninstall은 pack store에서 제거하거나 archive로 이동하는 로컬 사용자 데이터 작업이며, 저장소 파일을 삭제하지 않는다.

## 검증 규칙

`inspect`는 실행 전 검토 단계다. 다음은 오류로 간주해 설치를 막는다.

- `kind`가 `codaroPack`이 아니다.
- `id`, `title`, `contents`가 비어 있다.
- content path가 절대 경로이거나 `..`를 포함한다.
- manifest에 선언된 파일이 없다.
- curriculum YAML을 파싱할 수 없다.
- automation recipe가 `.py` 파일이 아니거나 `# %% [automation]` 셀을 갖지 않는다.
- 공유 automation recipe에 `DRY_RUN = True`가 없다.

다음은 경고다.

- curriculum YAML에 `meta.id`, `meta.category`, `tags`가 없다.
- curriculum lesson에 `sections`가 없다.
- `packages`가 manifest와 lesson `meta.packages` 중 한쪽에만 있다.
- automation recipe가 외부 파일/네트워크/브라우저 권한을 요구하지만 manifest `permissions`가 비어 있다.

## 원격 배포 규칙

- GitHub Pages는 정적 파일만 제공한다. 서버 사이드 설치 로직을 기대하지 않는다.
- 원격 URL은 `.zip` 또는 `codaroPack.yaml` URL을 우선 지원한다.
- 원격 manifest 방식은 디렉터리 listing을 할 수 없으므로 `contents.*[].path`는 파일 경로여야 한다.
- 버전 고정 배포는 GitHub Release asset `.zip`을 권장한다.
- raw URL이나 Pages URL은 빠른 공유에는 좋지만, 재현 가능한 배포는 tag/release URL을 사용한다.

## UI 운영

- 공개 제품 UI의 왼쪽 사이드바에 `공유 팩` 표면을 둔다.
- 제품 표면은 URL/path 입력 → inspect → install → installed list → open/register 순서를 가진다.
- 커리큘럼은 설치된 pack에서 읽어 `나만의 커리큘럼`으로 저장한 뒤 커리큘럼 표면에서 연다.
- 자동화 recipe는 내용을 먼저 확인하고, 태스크 등록 시에도 `DRY_RUN = True` 상태를 유지한다.
- 공유 작성자는 `codaroPack.yaml`이 있는 폴더를 zip으로 export한 뒤 GitHub Release 또는 Pages static asset으로 올릴 수 있다.
- GitHub에 올리는 기능은 인증, 권한, secret 보관, repository 선택 문제가 있으므로 1차 범위에서는 archive export까지만 제공한다.
- 실제 publish 자동화는 별도 GitHub provider/profile 경계를 갖춘 뒤 추가한다.

## GitHub Pages 갤러리

- React GitHub Pages 표면의 `/packs`가 공식 공유 팩 갤러리다.
- 각 카드에는 manifest URL을 그대로 노출한다. 사용자는 이 URL을 Codaro 공유 팩 표면에 붙여넣어 검사/설치한다.
- 공식 예제 pack은 `landing/static/share-packs/` 아래에 둔다. 이 디렉터리의 pack 파일은 Git 추적 대상이다.
- 설치된 사용자 pack과 cache는 `localData/sharePacks` 아래에 남기며 Git 추적 대상이 아니다.

## 관련

- [[curriculum-registry]] — built-in curriculum과 imported pack의 경계
- [[curriculum-authoring]] — 공유 가능한 curriculum YAML 품질 기준
- [[automation-authoring-loop]] — 공유 가능한 automation recipe 작성 기준
- [[automation-tasks-reports]] — 설치 후 task 등록과 실행 경계
