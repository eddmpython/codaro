---
id: pyodide-first-runtime
title: 실행 환경 — Pyodide 기본, 로컬 확장
description: Runtime policy for Pyodide-first execution with optional local expansion.
category: identity
section: concepts
order: 104
purpose: Pyodide(브라우저)가 기본 실행 플랫폼. 로컬 서버 커널은 Pyodide 슈퍼셋(파일 I/O, 패키지 자동 설치, 무거운 ML).
whenToUse: 새 capability 추가, 엔진 분기 결정, 학습 콘텐츠 호환성 검증할 때.
---

# 실행 환경: Pyodide 기본, 로컬 확장

- **Pyodide(브라우저)가 기본 실행 플랫폼**이다. 모든 학습 콘텐츠가 Pyodide에서 동작한다.
- **로컬(서버 커널)은 Pyodide의 모든 것 + 추가 자동화**를 제공한다.
  - 실제 파일 I/O, 패키지 자동 설치, DB 연결, 무거운 ML, 로컬 AI(Ollama).
- 프론트엔드는 서버 커널 우선 → Pyodide 폴백으로 동작한다.
- 편집기 코드가 실행 엔진의 구현을 직접 알지 않는다.

## 관련

- [[execution-engine]] — 교체 가능한 엔진 인터페이스
- [[mounting-and-integration]] — createServerApp 마운팅
