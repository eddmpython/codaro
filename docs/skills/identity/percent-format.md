---
id: percent-format
title: 파일 포맷 - Percent Format (.py)
description: Percent-format notebook conventions that keep files executable as Python.
category: identity
section: concepts
order: 103
purpose: Codaro의 기본 저장 포맷. 모듈 레벨 코드 + `# %%` 셀 경계. python file.py로 그대로 실행 가능.
whenToUse: 문서 파서/writer, ipynb 변환, 외부 에디터 호환성 다룰 때.
---

# 파일 포맷: Percent Format (.py)

- Codaro의 기본 저장 포맷은 Percent Format이다.
- `# %% [code]`, `# %% [markdown]` 주석이 셀 경계를 구분한다.
- 코드는 모듈 레벨 (들여쓰기 0칸). 함수로 감싸지 않는다.
- `python file.py`로 그대로 실행 가능하다.
- VS Code, Spyder, Jupytext가 동일한 `# %%` 포맷을 인식한다.
- ipynb 호환 import/export는 유지한다.

## AppSpec 메타데이터

앱 projection은 실행 코드가 아니라 주석 TOML인 `codaro-app` 블록에 저장한다. 이 블록은 title, layout, code visibility, entry block, state policy를 모두 보존하면서 `python file.py` 실행을 방해하지 않는다.

```python
# /// codaro-app
# schemaVersion = 1
# title = "CSV 검증 보고서"
# layout = "grid"
# hideCode = true
# entryBlockIds = ["report-view"]
# statePolicy = "perSession"
# ///

# %% [code] id=report-view
print("ready")
```

- `schemaVersion`은 현재 1만 허용하며 모르는 버전은 파일을 덮어쓰기 전에 거부한다.
- `layout`은 `notebook`, `learning`, `stack`, `grid` 중 하나다.
- `statePolicy`는 `none`, `perSession`, `shared` 중 하나다.
- `entryBlockIds`는 실제 문서 block을 한 번씩만 참조해야 한다. 삭제되거나 중복된 entry는 조용히 제거하지 않고 load 또는 save를 차단한다.
- 기존 `# codaro:app title='...'` header는 한 schema epoch 동안 읽는다. 다음 저장은 canonical `codaro-app` 블록 하나로 migration한다.
- PEP 723 `# /// script`는 Python 의존성, `# /// codaro-app`은 Codaro 앱 projection을 각각 소유하며 서로 섞지 않는다.

공유 wire 계약의 기준은 `contracts/appSpec.schema.json`이다. 기능 블록 compiler가 소비할 실행 단위 계약은 `contracts/executableUnit.schema.json`이며 생성된 Python과 TypeScript type은 직접 수정하지 않는다.

## 관련

- [[document-model]] - 블록 중심 내부 모델
- [[transparent-scope-isolation]] - 셀이 모듈 레벨에서 실행되는 의미
