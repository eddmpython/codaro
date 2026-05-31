---
id: packaging
title: 로컬 배포 bundle 원칙
description: Packaging rules for local distribution and bundled assets.
category: ops
section: release
order: 306
purpose: 최종 사용자는 Codaro.exe 단일 진입. Embedded Python + manifest exact wheel curated bundle. 외부 앱(Excel) 의존성은 별도 경계.
whenToUse: 새 bundle 정의, manifest 스키마 변경, 외부 앱(xlwings 등) 통합 정책 결정할 때.
---

# 로컬 배포 bundle 원칙

- 최종 사용자 배포는 `Codaro.exe` 하나를 기준으로 한다.
- launcher는 embedded Python runtime과 manifest가 지정한 exact wheel 기반 curated bundle만 설치한다.
- Codaro editor frontend는 기본적으로 `codaro` wheel 내부 `codaro/webBuild`에 포함한다. launcher manifest는 `editor.source: "backendWheel"`을 우선하고, 별도 editor zip은 legacy/internal archive release에서만 쓴다.
- launcher는 index에서 arbitrary latest package를 해석하거나 무제한 `pip install` 경로를 제품 기본으로 삼지 않는다.
- `codaro-excel` 같은 automation bundle은 Python package, helper runtime, capability probe, bootstrap을 launcher가 관리한다.
- normal `vX.Y.Z` tag release는 GitHub Release에 exact `codaro` wheel, `release-manifest.json`, `Codaro.exe`, checksum, SPDX SBOM, managed Windows Python runtime archive를 함께 업로드한다.
- GitHub Pages는 다운로드/문서 표면이다. launcher update는 tag 문자열만 보지 않고 `release-manifest.json`의 artifact URL과 sha256을 기준으로 한다.
- 외부 앱과 드라이버 의존성은 별도 경계로 둔다.
  - 예: `xlwings` 기반 Excel app automation은 launcher가 Python 쪽 의존성과 bootstrap을 관리하지만, Microsoft Excel 자체는 사용자가 설치해야 한다.
- 세부 배포 설계의 source of truth는 `launcher/PRD.md`, `launcher/PACKAGING.md`다.
