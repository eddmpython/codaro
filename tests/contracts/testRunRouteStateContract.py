from __future__ import annotations

import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
SCHEMA_PATH = ROOT / "contracts" / "runRouteState.schema.json"


def loadSchema() -> dict[str, object]:
    return json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))


def testRunRouteStateContractIsClosedAndVersioned() -> None:
    schema = loadSchema()
    properties = schema["properties"]

    assert schema["$schema"] == "https://json-schema.org/draft/2020-12/schema"
    assert schema["additionalProperties"] is False
    assert properties["schemaVersion"] == {"const": 1}
    assert set(schema["required"]) == {
        "schemaVersion",
        "surface",
        "runtimeTier",
        "lessonKey",
        "pathId",
        "sectionId",
        "documentId",
        "taskId",
    }


def testRunRouteStateContractPinsSurfaceRuntimeAndCanonicalLessonKey() -> None:
    schema = loadSchema()
    properties = schema["properties"]
    lessonKey = properties["lessonKey"]["anyOf"][1]
    routeId = schema["$defs"]["NullableRouteId"]["anyOf"][1]

    assert properties["surface"]["enum"] == ["home", "chat", "editor", "curriculum", "automation", "share"]
    assert properties["runtimeTier"]["enum"] == ["web", "local"]
    assert lessonKey["maxLength"] == 321
    assert re.fullmatch(lessonKey["pattern"], "30days/day01_헬로월드")
    assert re.fullmatch(lessonKey["pattern"], "day01") is None
    assert re.fullmatch(lessonKey["pattern"], "too/many/parts") is None
    assert routeId["maxLength"] == 160
    assert re.fullmatch(routeId["pattern"], "pythonFoundation")
    assert re.fullmatch(routeId["pattern"], "bad\nsection") is None
