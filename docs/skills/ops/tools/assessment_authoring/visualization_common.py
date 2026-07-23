from __future__ import annotations

from typing import Any, TypedDict

from .common import TaskBlueprint, raises, task


class VisualLessonSpec(TypedDict):
    slug: str
    title: str
    question: str
    mark: str
    x: str
    y: str
    group: str | None
    transforms: list[str]
    interaction: str
    required: list[str]
    rows: list[dict[str, Any]]
    expectedEvidence: dict[str, Any]
    transferContext: str
    retrieval: dict[str, dict[str, Any]]


def _entry(prefix: str, slug: str) -> str:
    return prefix + "_" + slug.replace("-", "_")


def _mastery(spec: VisualLessonSpec) -> TaskBlueprint:
    entry = _entry("prepare", spec["slug"])
    required = spec["required"]
    x = spec["x"]
    y = spec["y"]
    group = spec["group"]
    solution = f'''def {entry}(rows):
    required = {required!r}
    if any(not set(required) <= set(row) for row in rows):
        raise ValueError("chart schema mismatch")
    usable = [row for row in rows if all(row[name] is not None for name in required)]
    groups = {{}}
    group_field = {group!r}
    for row in usable:
        key = "all" if group_field is None else str(row[group_field])
        groups[key] = groups.get(key, 0) + 1
    x_values = [row[{x!r}] for row in usable]
    y_values = [row[{y!r}] for row in usable]
    return {{
        "usableCount": len(usable),
        "excludedCount": len(rows) - len(usable),
        "groupCounts": {{key: groups[key] for key in sorted(groups)}},
        "xExtent": None if not x_values else [min(x_values), max(x_values)],
        "yExtent": None if not y_values else [min(y_values), max(y_values)],
    }}
'''
    return task(
        spec["slug"] + "-data-evidence",
        spec["title"] + " 데이터 증거 만들기",
        spec["question"] + "에 답하기 전에 usable·excluded 분모와 축 범위를 고정한다.",
        f"{entry}(rows)를 완성해 차트에 실제 사용된 행 수, 제외 수, 그룹 수, 두 축 범위를 반환하세요.",
        f"def {entry}(rows):\n    raise NotImplementedError",
        solution,
        entry,
        [
            ("summarizes-visible-data", [spec["rows"]], spec["expectedEvidence"]),
            ("handles-empty-data", [[]], {"usableCount": 0, "excludedCount": 0, "groupCounts": {}, "xExtent": None, "yExtent": None}),
        ],
        ["차트에 들어가지 않은 NULL 행도 excludedCount로 보존하세요.", "축 범위와 그룹별 표본 수 없이 모양만 해석하지 마세요."],
    )


def _transfer(spec: VisualLessonSpec) -> TaskBlueprint:
    entry = _entry("audit", spec["slug"])
    expected = {
        "mark": spec["mark"],
        "x": spec["x"],
        "y": spec["y"],
        "group": spec["group"],
        "transforms": sorted(spec["transforms"]),
        "interaction": spec["interaction"],
    }
    good = {**expected, "description": spec["transferContext"]}
    bad = {
        "mark": "table" if spec["mark"] != "table" else "pie",
        "x": spec["y"],
        "y": spec["x"],
        "group": None,
        "transforms": [],
        "interaction": "none",
        "description": "",
    }
    bad_errors = [
        name
        for name in ("mark", "x", "y", "group", "transforms", "interaction")
        if bad[name] != expected[name]
    ] + ["description"]
    solution = f'''def {entry}(candidate):
    expected = {expected!r}
    errors = []
    for name in ["mark", "x", "y", "group", "transforms", "interaction"]:
        actual = sorted(candidate.get(name, [])) if name == "transforms" else candidate.get(name)
        if actual != expected[name]:
            errors.append(name)
    if not str(candidate.get("description", "")).strip():
        errors.append("description")
    return {{"valid": not errors, "errors": errors, "encoding": expected}}
'''
    return task(
        spec["slug"] + "-encoding-transfer",
        spec["title"] + " 인코딩 계약을 새 문맥에 전이하기",
        spec["transferContext"] + "라는 새 문맥에서도 mark·axis·transform·interaction 책임을 재현한다.",
        f"{entry}(candidate)를 완성해 주어진 차트 사양의 오류와 기대 encoding을 반환하세요.",
        f"def {entry}(candidate):\n    raise NotImplementedError",
        solution,
        entry,
        [
            ("accepts-complete-encoding", [good], {"valid": True, "errors": [], "encoding": expected}),
            ("reports-misleading-encoding", [bad], {"valid": False, "errors": bad_errors, "encoding": expected}),
        ],
        ["표현 mark만 맞아도 충분하지 않습니다. 축·그룹·변환을 함께 검사하세요.", "description은 보이지 않는 사용자와 차트를 열 수 없는 상황의 핵심 증거입니다."],
    )


def _retrieval(spec: VisualLessonSpec) -> TaskBlueprint:
    entry = _entry("choose", spec["slug"])
    table = spec["retrieval"]
    solution = (
        f"def {entry}(situation):\n"
        f"    table = {table!r}\n"
        "    if situation not in table:\n"
        "        raise ValueError('unknown situation')\n"
        "    return table[situation]\n"
    )
    cases = [
        ("recalls-" + key, [key], value)
        for key, value in list(table.items())[:2]
    ] + [("rejects-unknown", ["unknown"], raises("ValueError"))]
    return task(
        spec["slug"] + "-interpretation-retrieval",
        spec["title"] + " 해석 위험 회상하기",
        spec["question"] + "을 다시 판단할 때 차트 선택과 증거 한계를 구분한다.",
        f"{entry}(situation)를 완성해 encoding, evidence, risk를 반환하세요.",
        f"def {entry}(situation):\n    raise NotImplementedError",
        solution,
        entry,
        cases,
        ["차트가 보여주는 패턴과 인과 주장을 구분하세요.", "축·분모·결측·표본 수 중 무엇이 해석을 바꾸는지 명시하세요."],
    )


def buildVisualBlueprints(specs: dict[str, VisualLessonSpec]) -> dict[str, dict[str, TaskBlueprint]]:
    return {
        lessonId: {
            "mastery": _mastery(spec),
            "transfer": _transfer(spec),
            "retrieval": _retrieval(spec),
        }
        for lessonId, spec in specs.items()
    }
