from __future__ import annotations

from typing import Any, TypedDict

from .common import TaskBlueprint, task


T = task


class VisionConfig(TypedDict):
    slug: str
    title: str
    goal: str
    required: list[str]
    rules: list[dict[str, Any]]
    valid: dict[str, Any]
    invalid: dict[str, Any]
    identity: list[str]
    metrics: dict[str, float]
    expected: dict[str, Any]
    observedGood: dict[str, Any]
    observedBad: dict[str, Any]
    stages: dict[str, dict[str, str]]


def vision_config(
    slug: str,
    title: str,
    goal: str,
    required: list[str],
    rules: list[dict[str, Any]],
    valid: dict[str, Any],
    invalid: dict[str, Any],
    identity: list[str],
    metrics: dict[str, float],
    expected: dict[str, Any],
    observed_good: dict[str, Any],
    observed_bad: dict[str, Any],
    stages: dict[str, dict[str, str]],
) -> VisionConfig:
    return {
        "slug": slug,
        "title": title,
        "goal": goal,
        "required": required,
        "rules": rules,
        "valid": valid,
        "invalid": invalid,
        "identity": identity,
        "metrics": metrics,
        "expected": expected,
        "observedGood": observed_good,
        "observedBad": observed_bad,
        "stages": stages,
    }


def _violations(value: dict[str, Any], rules: list[dict[str, Any]]) -> list[str]:
    violations: list[str] = []
    for rule in rules:
        field = rule["field"]
        current = value.get(field)
        kind = rule["kind"]
        failed = False
        if kind == "range":
            failed = (
                not isinstance(current, (int, float))
                or isinstance(current, bool)
                or current < rule["min"]
                or current > rule["max"]
            )
        elif kind == "enum":
            failed = current not in rule["values"]
        elif kind == "odd":
            failed = not isinstance(current, int) or isinstance(current, bool) or current <= 0 or current % 2 == 0
        elif kind == "positive":
            failed = not isinstance(current, (int, float)) or isinstance(current, bool) or current <= 0
        elif kind == "unit-interval":
            failed = (
                not isinstance(current, (int, float))
                or isinstance(current, bool)
                or current < 0
                or current > 1
            )
        elif kind == "not-equal":
            failed = current == value.get(rule["other"])
        elif kind == "ordered":
            other = value.get(rule["other"])
            failed = (
                not isinstance(current, (int, float))
                or isinstance(current, bool)
                or not isinstance(other, (int, float))
                or isinstance(other, bool)
                or current >= other
            )
        elif kind == "length":
            failed = not isinstance(current, (list, tuple)) or len(current) != rule["value"]
        elif kind == "divisible":
            failed = not isinstance(current, int) or isinstance(current, bool) or current % rule["value"] != 0
        elif kind == "nonempty":
            failed = not isinstance(current, (str, list, tuple, dict)) or len(current) == 0
        else:
            raise ValueError(f"unknown vision rule: {kind}")
        if failed:
            violations.append(rule["id"])
    return sorted(violations)


def _audit(value: dict[str, Any], config: VisionConfig) -> dict[str, Any]:
    missing = sorted(field for field in config["required"] if field not in value)
    violations = _violations(value, config["rules"])
    return {
        "accepted": not missing and not violations,
        "topic": config["slug"],
        "missing": missing,
        "violations": violations,
    }


def _reconcile(expected: dict[str, Any], observed: dict[str, Any], config: VisionConfig) -> dict[str, Any]:
    required = set(config["identity"]) | set(config["metrics"])
    missing = sorted(required - set(observed))
    identity_mismatch = sorted(
        field
        for field in config["identity"]
        if field in observed and observed[field] != expected.get(field)
    )
    metric_drift = []
    for field, tolerance in config["metrics"].items():
        if field not in observed:
            continue
        actual = observed[field]
        target = expected.get(field)
        if (
            not isinstance(actual, (int, float))
            or isinstance(actual, bool)
            or not isinstance(target, (int, float))
            or isinstance(target, bool)
            or abs(actual - target) > tolerance
        ):
            metric_drift.append(field)
    metric_drift.sort()
    return {
        "passed": not missing and not identity_mismatch and not metric_drift,
        "topic": config["slug"],
        "missing": missing,
        "identityMismatch": identity_mismatch,
        "metricDrift": metric_drift,
    }


def make_vision_lesson(config: VisionConfig) -> dict[str, TaskBlueprint]:
    slug = config["slug"]
    audit_entry = f"audit_{slug}_contract"
    reconcile_entry = f"reconcile_{slug}_result"
    recall_entry = f"choose_{slug}_evidence"
    rules = config["rules"]
    required = config["required"]
    identity = config["identity"]
    metrics = config["metrics"]
    stages = config["stages"]

    audit_solution = f'''def {audit_entry}(value):
    required = {required!r}
    rules = {rules!r}
    missing = sorted(field for field in required if field not in value)
    violations = []
    for rule in rules:
        field = rule["field"]
        current = value.get(field)
        kind = rule["kind"]
        failed = False
        if kind == "range":
            failed = not isinstance(current, (int, float)) or isinstance(current, bool) or current < rule["min"] or current > rule["max"]
        elif kind == "enum":
            failed = current not in rule["values"]
        elif kind == "odd":
            failed = not isinstance(current, int) or isinstance(current, bool) or current <= 0 or current % 2 == 0
        elif kind == "positive":
            failed = not isinstance(current, (int, float)) or isinstance(current, bool) or current <= 0
        elif kind == "unit-interval":
            failed = not isinstance(current, (int, float)) or isinstance(current, bool) or current < 0 or current > 1
        elif kind == "not-equal":
            failed = current == value.get(rule["other"])
        elif kind == "ordered":
            other = value.get(rule["other"])
            failed = not isinstance(current, (int, float)) or isinstance(current, bool) or not isinstance(other, (int, float)) or isinstance(other, bool) or current >= other
        elif kind == "length":
            failed = not isinstance(current, (list, tuple)) or len(current) != rule["value"]
        elif kind == "divisible":
            failed = not isinstance(current, int) or isinstance(current, bool) or current % rule["value"] != 0
        elif kind == "nonempty":
            failed = not isinstance(current, (str, list, tuple, dict)) or len(current) == 0
        if failed:
            violations.append(rule["id"])
    violations.sort()
    return {{"accepted": not missing and not violations, "topic": {slug!r}, "missing": missing, "violations": violations}}
'''
    reconcile_solution = f'''def {reconcile_entry}(expected, observed):
    identity = {identity!r}
    metrics = {metrics!r}
    required = set(identity) | set(metrics)
    missing = sorted(required - set(observed))
    identity_mismatch = sorted(field for field in identity if field in observed and observed[field] != expected.get(field))
    metric_drift = []
    for field, tolerance in metrics.items():
        if field not in observed:
            continue
        actual = observed[field]
        target = expected.get(field)
        if not isinstance(actual, (int, float)) or isinstance(actual, bool) or not isinstance(target, (int, float)) or isinstance(target, bool) or abs(actual - target) > tolerance:
            metric_drift.append(field)
    metric_drift.sort()
    return {{"passed": not missing and not identity_mismatch and not metric_drift, "topic": {slug!r}, "missing": missing, "identityMismatch": identity_mismatch, "metricDrift": metric_drift}}
'''
    recall_solution = (
        f"def {recall_entry}(stage):\n"
        f"    stages = {stages!r}\n"
        "    if stage not in stages:\n"
        "        raise ValueError('unknown vision stage')\n"
        "    return stages[stage]\n"
    )

    missing_case = dict(config["valid"])
    missing_case.pop(required[0], None)
    return {
        "mastery": T(
            f"{slug}-contract-audit",
            f"{config['title']} 입력 계약 감사하기",
            config["goal"],
            f"{audit_entry}(value)를 완성해 주제별 입력 불변식 위반을 반환하세요.",
            f"def {audit_entry}(value):\n    raise NotImplementedError",
            audit_solution,
            audit_entry,
            [
                ("accepts-valid-contract", [config["valid"]], _audit(config["valid"], config)),
                ("reports-missing-field", [missing_case], _audit(missing_case, config)),
                ("reports-topic-invariants", [config["invalid"]], _audit(config["invalid"], config)),
            ],
            [
                "이미지를 실행하기 전에 shape·dtype·좌표·threshold 계약을 데이터로 검증하세요.",
                "Web에서는 불변식 판단을 실행하고 Local에서는 실제 픽셀·렌더 artifact를 확인하세요.",
            ],
        ),
        "transfer": T(
            f"{slug}-result-reconciliation",
            f"{config['title']} 결과를 새 입력에 대조하기",
            "artifact identity와 수치 metric을 허용 오차 안에서 함께 검증한다.",
            f"{reconcile_entry}(expected, observed)를 완성하세요.",
            f"def {reconcile_entry}(expected, observed):\n    raise NotImplementedError",
            reconcile_solution,
            reconcile_entry,
            [
                ("accepts-reconciled-result", [config["expected"], config["observedGood"]], _reconcile(config["expected"], config["observedGood"], config)),
                ("reports-identity-or-metric-drift", [config["expected"], config["observedBad"]], _reconcile(config["expected"], config["observedBad"], config)),
                ("reports-missing-result-fields", [config["expected"], {}], _reconcile(config["expected"], {}, config)),
            ],
            [
                "같은 파일명보다 source hash·frame ID 같은 안정적인 identity를 비교하세요.",
                "정확히 같아야 하는 값과 tolerance가 필요한 metric을 분리하세요.",
            ],
        ),
        "retrieval": T(
            f"{slug}-evidence-recall",
            f"{config['title']} 검증 원칙 회상하기",
            "입력·처리·결과 단계의 action, evidence, risk를 기억에서 복원한다.",
            f"{recall_entry}(stage)를 완성하세요.",
            f"def {recall_entry}(stage):\n    raise NotImplementedError",
            recall_solution,
            recall_entry,
            [(f"recalls-{stage}", [stage], value) for stage, value in stages.items()],
            [
                "각 단계가 남기는 관찰 가능한 증거를 먼저 떠올리세요.",
                "패키지 호출 성공과 비전 결과의 정확성을 같은 증거로 보지 마세요.",
            ],
        ),
    }
