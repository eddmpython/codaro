"""Misconception Catalog — outcome 별 학습자 오개념 사전.

학습자의 코드/에러/예측 결과를 카탈로그 trigger와 매칭해 misconception을 식별한다.
catalog 본문은 사람이 정제하지만, schema와 loader는 결정적이다. Predict-Run-Reconcile-Adapt
루프(`docs/skills/architecture/teacher-tool-loop.md`)의 1단계 입력이다.

저장 위치: `curricula/_misconceptions/<outcomeId>.yml`.
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import Iterable, Literal

import yaml
from pydantic import BaseModel, ConfigDict, Field, field_validator

from .predictionDiff import PredictionDiff


TriggerKind = Literal["codePattern", "errorPattern", "predictionMismatch"]
TriggerScope = Literal["code", "error", "prediction"]
CatalogStatus = Literal["draft", "reviewed", "approved"]


class MisconceptionTrigger(BaseModel):
    """단일 misconception을 감지하는 신호.

    - codePattern: 학습자 제출 코드에 대한 정규식.
    - errorPattern: 실행 시 발생한 traceback/메시지에 대한 정규식.
    - predictionMismatch: 학습자가 적은 예측과 실제 결과가 다른 방식.
      `expectedField`("value"|"shape"|"dtype"|"errorClass") + 선택적 `mismatchPattern` 정규식.
    """
    model_config = ConfigDict(extra="forbid")

    kind: TriggerKind
    appliesTo: TriggerScope
    pattern: str | None = None
    expectedField: str | None = None
    mismatchPattern: str | None = None
    description: str = ""

    @field_validator("pattern", "mismatchPattern")
    @classmethod
    def _validateRegex(cls, value: str | None) -> str | None:
        if value is None:
            return value
        try:
            re.compile(value)
        except re.error as exc:
            raise ValueError(f"invalid regex: {value!r} ({exc})") from exc
        return value

    def consistencyErrors(self) -> list[str]:
        errors: list[str] = []
        if self.kind == "codePattern":
            if self.appliesTo != "code":
                errors.append(f"codePattern trigger must appliesTo=code, got {self.appliesTo}")
            if not self.pattern:
                errors.append("codePattern trigger requires 'pattern'")
        elif self.kind == "errorPattern":
            if self.appliesTo != "error":
                errors.append(f"errorPattern trigger must appliesTo=error, got {self.appliesTo}")
            if not self.pattern:
                errors.append("errorPattern trigger requires 'pattern'")
        elif self.kind == "predictionMismatch":
            if self.appliesTo != "prediction":
                errors.append(f"predictionMismatch trigger must appliesTo=prediction, got {self.appliesTo}")
            if not self.expectedField:
                errors.append("predictionMismatch trigger requires 'expectedField'")
        return errors


class MisconceptionCorrection(BaseModel):
    model_config = ConfigDict(extra="forbid")

    hint: str
    miniExercise: str = ""


class MisconceptionDiagnostic(BaseModel):
    model_config = ConfigDict(extra="forbid")

    message: str
    references: list[str] = Field(default_factory=list)


class MisconceptionEntry(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    label: str
    summary: str
    triggers: list[MisconceptionTrigger] = Field(default_factory=list)
    diagnostic: MisconceptionDiagnostic
    correction: MisconceptionCorrection


class MisconceptionCatalogMeta(BaseModel):
    model_config = ConfigDict(extra="forbid")

    outcomeId: str
    status: CatalogStatus = "draft"
    version: int = 1
    note: str = ""


class MisconceptionCatalog(BaseModel):
    model_config = ConfigDict(extra="forbid")

    meta: MisconceptionCatalogMeta
    misconceptions: list[MisconceptionEntry] = Field(default_factory=list)

    @property
    def outcomeId(self) -> str:
        return self.meta.outcomeId


DEFAULT_CATALOG_DIR = Path(__file__).resolve().parents[3] / "curricula" / "_misconceptions"


def loadCatalog(path: Path) -> MisconceptionCatalog:
    """YAML 파일 한 개를 catalog로 로드한다."""
    raw = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    return MisconceptionCatalog.model_validate(raw)


def loadAllCatalogs(directory: Path | None = None) -> list[MisconceptionCatalog]:
    """디렉토리의 모든 outcome catalog를 outcomeId 알파벳 순으로 로드한다."""
    base = directory or DEFAULT_CATALOG_DIR
    if not base.exists():
        return []
    catalogs: list[MisconceptionCatalog] = []
    for yamlPath in sorted(base.glob("*.yml")):
        catalogs.append(loadCatalog(yamlPath))
    return catalogs


def validateCatalogs(
    catalogs: Iterable[MisconceptionCatalog],
    knownOutcomeIds: set[str],
) -> list[str]:
    """catalog 그래프 전체를 검사한다. errors가 비면 무결성 통과."""
    errors: list[str] = []
    seenCatalogOutcomes: set[str] = set()
    seenMisconceptionIds: set[str] = set()

    for catalog in catalogs:
        meta = catalog.meta
        outcomeId = meta.outcomeId

        if outcomeId in seenCatalogOutcomes:
            errors.append(f"duplicate catalog for outcome '{outcomeId}'")
        seenCatalogOutcomes.add(outcomeId)

        if outcomeId not in knownOutcomeIds:
            errors.append(f"catalog references unknown outcome '{outcomeId}'")

        if not catalog.misconceptions:
            errors.append(f"catalog '{outcomeId}' has no misconceptions")

        for entry in catalog.misconceptions:
            if entry.id in seenMisconceptionIds:
                errors.append(f"duplicate misconception id '{entry.id}'")
            seenMisconceptionIds.add(entry.id)

            if not entry.id.startswith(f"{outcomeId}."):
                errors.append(
                    f"misconception '{entry.id}' must be prefixed with '{outcomeId}.'"
                )

            if not entry.triggers:
                errors.append(f"misconception '{entry.id}' has no triggers")

            for idx, trigger in enumerate(entry.triggers):
                for triggerError in trigger.consistencyErrors():
                    errors.append(
                        f"misconception '{entry.id}' trigger[{idx}]: {triggerError}"
                    )

            for reference in entry.diagnostic.references:
                if reference not in knownOutcomeIds:
                    errors.append(
                        f"misconception '{entry.id}' references unknown outcome '{reference}'"
                    )

    return errors


def matchCodePattern(catalog: MisconceptionCatalog, code: str) -> list[MisconceptionEntry]:
    """코드 문자열에 대해 codePattern trigger를 매칭한다."""
    hits: list[MisconceptionEntry] = []
    for entry in catalog.misconceptions:
        for trigger in entry.triggers:
            if trigger.kind != "codePattern" or not trigger.pattern:
                continue
            if re.search(trigger.pattern, code):
                hits.append(entry)
                break
    return hits


def matchErrorPattern(catalog: MisconceptionCatalog, errorText: str) -> list[MisconceptionEntry]:
    """traceback/에러 텍스트에 대해 errorPattern trigger를 매칭한다."""
    hits: list[MisconceptionEntry] = []
    for entry in catalog.misconceptions:
        for trigger in entry.triggers:
            if trigger.kind != "errorPattern" or not trigger.pattern:
                continue
            if re.search(trigger.pattern, errorText):
                hits.append(entry)
                break
    return hits


_PREDICTION_FIELD_ALIASES = {"errorClass": "error"}


def matchPredictionMismatch(
    catalog: MisconceptionCatalog, diff: PredictionDiff
) -> list[MisconceptionEntry]:
    """예측-실측 diff에 대해 predictionMismatch trigger를 매칭한다.

    예외 없이 틀리는(noError 통과) silent 오개념 — 학습자가 예측을 잠갔는데
    어긋난 차원이 트리거의 expectedField와 일치하면 발화한다. mismatchPattern이
    있으면 실측 값(actual)에도 매칭돼야 한다.
    """
    fieldByName = {field.field: field for field in diff.fields}
    hits: list[MisconceptionEntry] = []
    for entry in catalog.misconceptions:
        for trigger in entry.triggers:
            if trigger.kind != "predictionMismatch" or not trigger.expectedField:
                continue
            fieldName = _PREDICTION_FIELD_ALIASES.get(
                trigger.expectedField, trigger.expectedField
            )
            field = fieldByName.get(fieldName)
            if field is None or field.status != "mismatch":
                continue
            if trigger.mismatchPattern and not re.search(
                trigger.mismatchPattern, field.actual
            ):
                continue
            hits.append(entry)
            break
    return hits


def matchOutcomes(
    outcomeIds: Iterable[str],
    *,
    code: str = "",
    errorText: str = "",
    predictionDiff: PredictionDiff | None = None,
    catalogDir: Path | None = None,
) -> list[tuple[str, MisconceptionEntry]]:
    """outcomeId 목록에 대해 catalog를 로드해 code/error에서 misconception을 매칭한다.

    반환: [(outcomeId, MisconceptionEntry), ...]. 같은 entry는 중복 없이 한 번만.
    catalog 파일이 없는 outcome은 조용히 skip — 카탈로그 작성 진행 중인 outcome이 있을 수 있다.
    """
    base = catalogDir or DEFAULT_CATALOG_DIR
    if not base.exists():
        return []

    hits: list[tuple[str, MisconceptionEntry]] = []
    seen: set[str] = set()
    for outcomeId in outcomeIds:
        path = base / f"{outcomeId}.yml"
        if not path.exists():
            continue
        catalog = loadCatalog(path)
        candidates: list[MisconceptionEntry] = []
        if code:
            candidates.extend(matchCodePattern(catalog, code))
        if errorText:
            candidates.extend(matchErrorPattern(catalog, errorText))
        if predictionDiff is not None:
            candidates.extend(matchPredictionMismatch(catalog, predictionDiff))
        for entry in candidates:
            if entry.id in seen:
                continue
            seen.add(entry.id)
            hits.append((outcomeId, entry))
    return hits
