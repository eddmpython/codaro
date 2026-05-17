---
id: percent-format
title: 파일 포맷 — Percent Format (.py)
category: identity
purpose: Codaro의 기본 저장 포맷. 모듈 레벨 코드 + `# %%` 셀 경계. python file.py로 그대로 실행 가능.
whenToUse: 문서 파서/writer, ipynb/reactive-app 변환, 외부 에디터 호환성 다룰 때.
---

# 파일 포맷: Percent Format (.py)

- Codaro의 기본 저장 포맷은 Percent Format이다.
- `# %% [code]`, `# %% [markdown]` 주석이 셀 경계를 구분한다.
- 코드는 모듈 레벨 (들여쓰기 0칸). 함수로 감싸지 않는다.
- `python file.py`로 그대로 실행 가능하다.
- VS Code, Spyder, Jupytext가 동일한 `# %%` 포맷을 인식한다.
- reactive-app/ipynb 호환 import/export는 유지한다.

## 관련

- [[document-model]] — 블록 중심 내부 모델
- [[transparent-scope-isolation]] — 셀이 모듈 레벨에서 실행되는 의미
