from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[4]
CURRICULA = ROOT / "curricula" / "python"
VARIANT_KEYS = ("masteryVariants", "transferVariants", "retrievalVariants")
PERFORMANCE_CLAIM = (
    "브라우저의 격리된 Python Worker가 숨은 입력으로 핵심 행동과 데이터 계약을 검증하고, "
    "외부 package·파일 artifact가 필요한 실행은 lesson Run 및 Local evidence로 분리합니다."
)
RETRIEVAL_MINIMUM_HOURS = 7 * 24


class LiteralString(str):
    pass


def literalStringRepresenter(dumper: yaml.SafeDumper, value: LiteralString):
    return dumper.represent_scalar("tag:yaml.org,2002:str", str(value), style="|")


yaml.SafeDumper.add_representer(LiteralString, literalStringRepresenter)


def readable(value: Any) -> Any:
    if isinstance(value, str) and "\n" in value:
        return LiteralString(value)
    if isinstance(value, list):
        return [readable(item) for item in value]
    if isinstance(value, dict):
        return {key: readable(item) for key, item in value.items()}
    return value


def authoredVariants(assessment: dict[str, Any]) -> list[dict[str, Any]]:
    variants: list[dict[str, Any]] = []
    for key in VARIANT_KEYS:
        value = assessment.get(key)
        if isinstance(value, list):
            variants.extend(item for item in value if isinstance(item, dict))
    return variants


def hasStrongCheckSpec(variants: list[dict[str, Any]]) -> bool:
    return any(
        isinstance(variant.get("check"), dict)
        and variant["check"].get("kind") in {"behavior", "output"}
        and variant["check"].get("strength") == "strong"
        for variant in variants
    )


def needsClaimBackfill(assessment: dict[str, Any], variants: list[dict[str, Any]]) -> bool:
    transferIds = {
        str(variant.get("id"))
        for variant in assessment.get("transferVariants", [])
        if isinstance(variant, dict) and variant.get("id")
    }
    retrievals = [
        variant
        for variant in assessment.get("retrievalVariants", [])
        if isinstance(variant, dict)
    ]
    return (
        not assessment.get("performanceClaim")
        or any(not variant.get("claimScope") or variant.get("unseen") is not True for variant in variants)
        or any(
            variant.get("minimumDelayHours") != RETRIEVAL_MINIMUM_HOURS
            or set(variant.get("sourceSectionIds") or []) != transferIds
            for variant in retrievals
        )
    )


def updatedAssessment(assessment: dict[str, Any], variants: list[dict[str, Any]]) -> dict[str, Any]:
    result = dict(assessment)
    result.setdefault("schemaVersion", 1)
    result.setdefault("performanceClaim", PERFORMANCE_CLAIM)
    result.setdefault("tierParity", {"web": "portable-concept", "local": "package-practice-and-artifact"})
    result.setdefault(
        "supportPolicy",
        "첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.",
    )
    authoring = dict(result.get("authoring")) if isinstance(result.get("authoring"), dict) else {}
    authoring.setdefault("source", "curated-existing-assessment")
    authoring.setdefault("solutionVerification", "required")
    authoring.setdefault("independentReview", "pending")
    result["authoring"] = authoring
    transferIds = [
        str(variant.get("id"))
        for variant in result.get("transferVariants", [])
        if isinstance(variant, dict) and variant.get("id")
    ]
    for variant in variants:
        variant.setdefault("claimScope", "portable-concept")
        variant.setdefault("reviewStatus", "machine-verified-pending-independent-review")
        variant["unseen"] = True
        if variant.get("mode") == "retrieval":
            variant["minimumDelayHours"] = RETRIEVAL_MINIMUM_HOURS
            variant["sourceSectionIds"] = transferIds
    return result


def replaceAssessmentBlock(path: Path, text: str, assessment: dict[str, Any]) -> str:
    marker = "\nassessment:\n"
    if text.count(marker) != 1:
        raise RuntimeError(f"expected one trailing assessment block: {path.relative_to(ROOT).as_posix()}")
    prefix, _ = text.split(marker, 1)
    block = yaml.safe_dump(
        readable({"assessment": assessment}),
        allow_unicode=True,
        default_flow_style=False,
        sort_keys=False,
        width=120,
    )
    updated = prefix.rstrip() + "\n" + block
    parsed = yaml.safe_load(updated) or {}
    if parsed.get("assessment") != assessment:
        raise RuntimeError(f"assessment round-trip mismatch: {path.relative_to(ROOT).as_posix()}")
    return updated


def main() -> int:
    parser = argparse.ArgumentParser(description="Backfill explicit claims only on existing strong authored assessments")
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    changed: list[str] = []
    for path in sorted(CURRICULA.rglob("*.yaml")):
        if path.name == "schema.yaml":
            continue
        text = path.read_text(encoding="utf-8")
        content = yaml.safe_load(text) or {}
        assessment = content.get("assessment")
        if not isinstance(assessment, dict):
            continue
        variants = authoredVariants(assessment)
        if not variants or not hasStrongCheckSpec(variants) or not needsClaimBackfill(assessment, variants):
            continue
        updated = updatedAssessment(assessment, variants)
        updatedText = replaceAssessmentBlock(path, text, updated)
        changed.append(path.relative_to(ROOT).as_posix())
        if args.write:
            path.write_text(updatedText, encoding="utf-8", newline="\n")
    action = "updated" if args.write else "would update"
    print(f"{action}: {len(changed)} strong assessment claim block(s)")
    for path in changed:
        print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
