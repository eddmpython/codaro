from __future__ import annotations

from typing import Any

from .common import TaskBlueprint, raises, task


T = task
E = raises


def decision(
    slug: str,
    title: str,
    goal: str,
    entry: str,
    table: dict[str, dict[str, Any]],
) -> TaskBlueprint:
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
    ] + [("rejects-unknown", ["unknown"], E("ValueError"))]
    return T(
        slug,
        title,
        goal,
        f"{entry}(situation)를 완성해 action, evidence, risk를 반환하세요.",
        f"def {entry}(situation):\n    raise NotImplementedError",
        solution,
        entry,
        cases,
        [
            "입력 자동화 action 전에 대상·경계·중단 방법을 검증하세요.",
            "화면 변화와 E-Stop evidence를 남기고 성공을 클릭 발생으로 판단하지 마세요.",
        ],
    )


BLUEPRINTS: dict[str, dict[str, TaskBlueprint]] = {
    "01": {
        "mastery": T(
            "input-safety-contract",
            "입력 자동화의 fail-safe·E-Stop·행동 budget 감사하기",
            "대상 앱과 dry run, 최대 action 수가 빠진 자동화를 실행 전에 차단한다.",
            "audit_input_safety(plan)를 완성하세요.",
            "def audit_input_safety(plan):\n    raise NotImplementedError",
            """def audit_input_safety(plan):
    required = {"targetApps", "failSafe", "emergencyStop", "dryRun", "maximumActions"}
    missing = sorted(required - set(plan))
    failures = []
    if not plan.get("targetApps"):
        failures.append("target-apps")
    if not plan.get("failSafe", False):
        failures.append("fail-safe")
    if not plan.get("emergencyStop"):
        failures.append("emergency-stop")
    if not plan.get("dryRun", False):
        failures.append("dry-run")
    if plan.get("maximumActions", 0) <= 0:
        failures.append("action-budget")
    return {"ready": not missing and not failures, "missing": missing, "failures": failures}
""",
            "audit_input_safety",
            [
                (
                    "accepts-bounded-plan",
                    [{"targetApps": ["Editor"], "failSafe": True, "emergencyStop": "ctrl+shift+esc", "dryRun": True, "maximumActions": 20}],
                    {"ready": True, "missing": [], "failures": []},
                ),
                (
                    "reports-disabled-guards",
                    [{"targetApps": [], "failSafe": False, "emergencyStop": "", "dryRun": False, "maximumActions": 0}],
                    {"ready": False, "missing": [], "failures": ["target-apps", "fail-safe", "emergency-stop", "dry-run", "action-budget"]},
                ),
                (
                    "reports-missing-contract",
                    [{}],
                    {"ready": False, "missing": ["dryRun", "emergencyStop", "failSafe", "maximumActions", "targetApps"], "failures": ["target-apps", "fail-safe", "emergency-stop", "dry-run", "action-budget"]},
                ),
            ],
            [
                "fail-safe 옵션과 사용자가 누를 E-Stop을 둘 다 계획하세요.",
                "처음 실행은 반드시 dry run이며 action 수에 상한을 두세요.",
            ],
        ),
        "transfer": T(
            "input-batch-authorization",
            "새 입력 action batch에 대상 창·budget 승인 전이하기",
            "현재 foreground 앱과 허용 action 종류·개수를 계획과 대조한다.",
            "authorize_input_batch(actions, foreground_app, plan)를 완성하세요.",
            "def authorize_input_batch(actions, foreground_app, plan):\n    raise NotImplementedError",
            """def authorize_input_batch(actions, foreground_app, plan):
    failures = []
    if foreground_app not in plan.get("targetApps", []):
        failures.append("foreground-app")
    if len(actions) > plan.get("maximumActions", 0):
        failures.append("action-budget")
    disallowed = sorted({action["kind"] for action in actions} - set(plan.get("allowedActions", [])))
    if disallowed:
        failures.append("action-kind")
    return {"authorized": not failures, "failures": failures, "actionCount": len(actions), "disallowedKinds": disallowed}
""",
            "authorize_input_batch",
            [
                (
                    "authorizes-allowed-batch",
                    [[{"kind": "move"}, {"kind": "click"}], "Editor", {"targetApps": ["Editor"], "maximumActions": 3, "allowedActions": ["move", "click"]}],
                    {"authorized": True, "failures": [], "actionCount": 2, "disallowedKinds": []},
                ),
                (
                    "rejects-wrong-app-and-budget",
                    [[{"kind": "click"}, {"kind": "click"}], "Mail", {"targetApps": ["Editor"], "maximumActions": 1, "allowedActions": ["click"]}],
                    {"authorized": False, "failures": ["foreground-app", "action-budget"], "actionCount": 2, "disallowedKinds": []},
                ),
                (
                    "rejects-disallowed-kind",
                    [[{"kind": "hotkey"}], "Editor", {"targetApps": ["Editor"], "maximumActions": 2, "allowedActions": ["move"]}],
                    {"authorized": False, "failures": ["action-kind"], "actionCount": 1, "disallowedKinds": ["hotkey"]},
                ),
            ],
            [
                "batch 직전에 foreground 앱을 다시 확인하세요.",
                "허용 action 종류와 최대 개수를 계획에서 가져오세요.",
            ],
        ),
        "retrieval": decision(
            "input-safety-recall",
            "GUI 입력 안전장치 회상하기",
            "사전 제한·실시간 중단·사후 증거를 구분한다.",
            "choose_input_safety",
            {
                "before": {"action": "allowlist app and dry run", "evidence": "planned action batch", "risk": "wrong target"},
                "during": {"action": "enable fail-safe and E-Stop", "evidence": "stop event", "risk": "runaway input"},
                "after": {"action": "verify observed state", "evidence": "before after screenshot and state", "risk": "click without outcome"},
            },
        ),
    },
    "02": {
        "mastery": T(
            "screen-coordinate-normalization",
            "화면 좌표를 viewport 비율로 정규화하기",
            "screen 경계 안의 point만 0~1 비율과 edge 거리를 반환한다.",
            "normalize_screen_point(x, y, width, height)를 완성하세요.",
            "def normalize_screen_point(x, y, width, height):\n    raise NotImplementedError",
            """def normalize_screen_point(x, y, width, height):
    if width <= 0 or height <= 0 or not 0 <= x < width or not 0 <= y < height:
        raise ValueError("point outside screen")
    return {
        "xRatio": round(x / width, 4),
        "yRatio": round(y / height, 4),
        "edgeDistance": min(x, y, width - 1 - x, height - 1 - y),
    }
""",
            "normalize_screen_point",
            [
                ("normalizes-center", [500, 250, 1000, 500], {"xRatio": 0.5, "yRatio": 0.5, "edgeDistance": 249}),
                ("normalizes-top-left", [0, 0, 100, 100], {"xRatio": 0.0, "yRatio": 0.0, "edgeDistance": 0}),
                ("rejects-right-edge-outside", [100, 0, 100, 100], E("ValueError")),
            ],
            [
                "현재 screen 크기 없이 저장한 절대 좌표를 재사용하지 마세요.",
                "가장 가까운 화면 edge 거리도 safety evidence로 남기세요.",
            ],
        ),
        "transfer": T(
            "monitor-point-resolution",
            "새 다중 모니터 배치에 point 소속 판정 전이하기",
            "음수 origin을 포함한 monitor rectangle에서 정확히 하나의 화면을 찾는다.",
            "resolve_monitor_for_point(point, monitors)를 완성하세요.",
            "def resolve_monitor_for_point(point, monitors):\n    raise NotImplementedError",
            """def resolve_monitor_for_point(point, monitors):
    matches = []
    for monitor in monitors:
        if monitor["x"] <= point[0] < monitor["x"] + monitor["width"] and monitor["y"] <= point[1] < monitor["y"] + monitor["height"]:
            matches.append(monitor["id"])
    if len(matches) != 1:
        return {"resolved": False, "monitor": None, "matches": sorted(matches)}
    return {"resolved": True, "monitor": matches[0], "matches": matches}
""",
            "resolve_monitor_for_point",
            [
                (
                    "resolves-negative-origin-monitor",
                    [[-100, 20], [{"id": "left", "x": -1920, "y": 0, "width": 1920, "height": 1080}, {"id": "main", "x": 0, "y": 0, "width": 1920, "height": 1080}]],
                    {"resolved": True, "monitor": "left", "matches": ["left"]},
                ),
                (
                    "resolves-main-monitor",
                    [[0, 0], [{"id": "left", "x": -100, "y": 0, "width": 100, "height": 100}, {"id": "main", "x": 0, "y": 0, "width": 100, "height": 100}]],
                    {"resolved": True, "monitor": "main", "matches": ["main"]},
                ),
                (
                    "reports-outside-point",
                    [[500, 500], [{"id": "main", "x": 0, "y": 0, "width": 100, "height": 100}]],
                    {"resolved": False, "monitor": None, "matches": []},
                ),
            ],
            [
                "다중 모니터에서는 가상 desktop origin이 음수일 수 있습니다.",
                "point가 정확히 한 monitor에 속하지 않으면 입력 action을 만들지 마세요.",
            ],
        ),
        "retrieval": decision(
            "screen-coordinate-recall",
            "화면 크기와 좌표 계약 회상하기",
            "viewport 비율·monitor origin·edge safety 근거를 복원한다.",
            "choose_coordinate_evidence",
            {
                "single-screen": {"action": "validate bounds and normalize", "evidence": "screen dimensions and ratios", "risk": "resolution drift"},
                "multi-monitor": {"action": "resolve virtual desktop rectangle", "evidence": "monitor identity and origin", "risk": "negative coordinate"},
                "edge": {"action": "enforce safety margin", "evidence": "edge distance", "risk": "fail-safe corner"},
            },
        ),
    },
    "03": {
        "mastery": T(
            "mouse-action-plan",
            "마우스 이동·클릭 action의 거리·대상·dry run 계획하기",
            "현재 위치에서 각 target까지 거리를 계산하고 click 전에 verify를 삽입한다.",
            "plan_mouse_actions(start, targets, dry_run)를 완성하세요.",
            "def plan_mouse_actions(start, targets, dry_run):\n    raise NotImplementedError",
            """def plan_mouse_actions(start, targets, dry_run):
    import math
    current = start
    actions = []
    total_distance = 0.0
    for target in targets:
        distance = math.hypot(target["x"] - current[0], target["y"] - current[1])
        total_distance += distance
        actions.append({"kind": "move", "target": target["id"], "distance": round(distance, 2)})
        actions.append({"kind": "verify", "target": target["id"]})
        actions.append({"kind": "preview" if dry_run else "click", "target": target["id"]})
        current = (target["x"], target["y"])
    return {"actions": actions, "totalDistance": round(total_distance, 2), "dryRun": dry_run}
""",
            "plan_mouse_actions",
            [
                (
                    "plans-dry-run-preview",
                    [[0, 0], [{"id": "save", "x": 3, "y": 4}], True],
                    {"actions": [{"kind": "move", "target": "save", "distance": 5.0}, {"kind": "verify", "target": "save"}, {"kind": "preview", "target": "save"}], "totalDistance": 5.0, "dryRun": True},
                ),
                (
                    "plans-two-real-clicks",
                    [[0, 0], [{"id": "a", "x": 0, "y": 3}, {"id": "b", "x": 4, "y": 3}], False],
                    {"actions": [{"kind": "move", "target": "a", "distance": 3.0}, {"kind": "verify", "target": "a"}, {"kind": "click", "target": "a"}, {"kind": "move", "target": "b", "distance": 4.0}, {"kind": "verify", "target": "b"}, {"kind": "click", "target": "b"}], "totalDistance": 7.0, "dryRun": False},
                ),
                (
                    "handles-no-targets",
                    [[1, 1], [], True],
                    {"actions": [], "totalDistance": 0.0, "dryRun": True},
                ),
            ],
            [
                "click 직전에 target state를 다시 확인하는 action을 삽입하세요.",
                "dry run에서는 click 대신 위치 preview만 생성하세요.",
            ],
        ),
        "transfer": T(
            "mouse-observation-audit",
            "새 클릭 실행에 before·after 상태 감사 전이하기",
            "target identity와 화면 hash 변화, 예상 outcome을 함께 판정한다.",
            "audit_mouse_observation(observation)를 완성하세요.",
            "def audit_mouse_observation(observation):\n    raise NotImplementedError",
            """def audit_mouse_observation(observation):
    failures = []
    if observation.get("plannedTarget") != observation.get("observedTarget"):
        failures.append("target")
    if observation.get("beforeHash") == observation.get("afterHash"):
        failures.append("no-state-change")
    if observation.get("observedOutcome") != observation.get("expectedOutcome"):
        failures.append("outcome")
    return {"passed": not failures, "failures": failures, "target": observation.get("observedTarget")}
""",
            "audit_mouse_observation",
            [
                (
                    "accepts-observed-outcome",
                    [{"plannedTarget": "save", "observedTarget": "save", "beforeHash": "a", "afterHash": "b", "expectedOutcome": "saved", "observedOutcome": "saved"}],
                    {"passed": True, "failures": [], "target": "save"},
                ),
                (
                    "reports-wrong-target-and-outcome",
                    [{"plannedTarget": "save", "observedTarget": "delete", "beforeHash": "a", "afterHash": "b", "expectedOutcome": "saved", "observedOutcome": "deleted"}],
                    {"passed": False, "failures": ["target", "outcome"], "target": "delete"},
                ),
                (
                    "reports-no-state-change",
                    [{"plannedTarget": "save", "observedTarget": "save", "beforeHash": "a", "afterHash": "a", "expectedOutcome": "saved", "observedOutcome": "saved"}],
                    {"passed": False, "failures": ["no-state-change"], "target": "save"},
                ),
            ],
            [
                "click event 발생을 성공으로 보지 말고 예상 화면 state를 관찰하세요.",
                "before/after evidence와 target identity를 같은 action ID로 묶으세요.",
            ],
        ),
        "retrieval": decision(
            "mouse-control-recall",
            "마우스 입력 안전 흐름 회상하기",
            "이동·target verify·outcome 검증 단계를 복원한다.",
            "choose_mouse_control",
            {
                "move": {"action": "bounded duration move", "evidence": "start target distance", "risk": "instant jump"},
                "click": {"action": "verify target then click", "evidence": "target identity", "risk": "layout drift"},
                "result": {"action": "observe expected state", "evidence": "before after outcome", "risk": "no-op click"},
            },
        ),
    },
    "04": {
        "mastery": T(
            "keyboard-sequence-plan",
            "텍스트 입력과 hotkey를 분리한 keyboard sequence 만들기",
            "plain text·key press·hotkey를 typed action으로 구성하고 금지 chord를 차단한다.",
            "plan_keyboard_sequence(items, blocked_hotkeys)를 완성하세요.",
            "def plan_keyboard_sequence(items, blocked_hotkeys):\n    raise NotImplementedError",
            """def plan_keyboard_sequence(items, blocked_hotkeys):
    blocked = {tuple(keys) for keys in blocked_hotkeys}
    actions = []
    rejected = []
    for index, item in enumerate(items):
        if item["kind"] == "text":
            actions.append({"kind": "write", "text": item["value"]})
        elif item["kind"] == "key":
            actions.append({"kind": "press", "key": item["value"]})
        elif item["kind"] == "hotkey":
            keys = tuple(item["keys"])
            if keys in blocked:
                rejected.append({"index": index, "reason": "blocked-hotkey"})
            else:
                actions.append({"kind": "hotkey", "keys": list(keys)})
        else:
            rejected.append({"index": index, "reason": "unknown-kind"})
    return {"ready": not rejected, "actions": actions, "rejected": rejected}
""",
            "plan_keyboard_sequence",
            [
                (
                    "plans-text-key-and-hotkey",
                    [[{"kind": "text", "value": "hello"}, {"kind": "key", "value": "enter"}, {"kind": "hotkey", "keys": ["ctrl", "s"]}], []],
                    {"ready": True, "actions": [{"kind": "write", "text": "hello"}, {"kind": "press", "key": "enter"}, {"kind": "hotkey", "keys": ["ctrl", "s"]}], "rejected": []},
                ),
                (
                    "rejects-blocked-hotkey",
                    [[{"kind": "hotkey", "keys": ["alt", "f4"]}], [["alt", "f4"]]],
                    {"ready": False, "actions": [], "rejected": [{"index": 0, "reason": "blocked-hotkey"}]},
                ),
                (
                    "rejects-unknown-kind",
                    [[{"kind": "macro"}], []],
                    {"ready": False, "actions": [], "rejected": [{"index": 0, "reason": "unknown-kind"}]},
                ),
            ],
            [
                "문자열과 special key, hotkey를 같은 `write` 호출로 섞지 마세요.",
                "앱 종료·시스템 전환 chord는 명시적 blocklist로 차단하세요.",
            ],
        ),
        "transfer": T(
            "keyboard-focus-audit",
            "새 키보드 입력에 focus·value 변화 감사 전이하기",
            "planned field와 실제 focus, 입력 전후 value를 비교한다.",
            "audit_keyboard_focus(observation, secret_input)를 완성하세요.",
            "def audit_keyboard_focus(observation, secret_input):\n    raise NotImplementedError",
            """def audit_keyboard_focus(observation, secret_input):
    failures = []
    if observation.get("plannedField") != observation.get("focusedField"):
        failures.append("focus")
    if observation.get("beforeValue") == observation.get("afterValue"):
        failures.append("no-value-change")
    if observation.get("expectedLength") != observation.get("observedLength"):
        failures.append("length")
    return {"passed": not failures, "failures": failures, "recordedValue": "[REDACTED]" if secret_input else observation.get("afterValue")}
""",
            "audit_keyboard_focus",
            [
                (
                    "accepts-focused-text-change",
                    [{"plannedField": "query", "focusedField": "query", "beforeValue": "", "afterValue": "hello", "expectedLength": 5, "observedLength": 5}, False],
                    {"passed": True, "failures": [], "recordedValue": "hello"},
                ),
                (
                    "reports-wrong-focus-and-length",
                    [{"plannedField": "email", "focusedField": "search", "beforeValue": "", "afterValue": "abc", "expectedLength": 5, "observedLength": 3}, False],
                    {"passed": False, "failures": ["focus", "length"], "recordedValue": "abc"},
                ),
                (
                    "redacts-secret-value",
                    [{"plannedField": "password", "focusedField": "password", "beforeValue": "", "afterValue": "secret", "expectedLength": 6, "observedLength": 6}, True],
                    {"passed": True, "failures": [], "recordedValue": "[REDACTED]"},
                ),
            ],
            [
                "입력 직전에 실제 focus field identity를 확인하세요.",
                "비밀번호는 value 대신 길이와 redacted marker만 evidence에 남기세요.",
            ],
        ),
        "retrieval": decision(
            "keyboard-input-recall",
            "키보드 자동화 안전 원칙 회상하기",
            "text·special key·secret 입력 증거를 구분한다.",
            "choose_keyboard_input",
            {
                "text": {"action": "verify focus then write", "evidence": "field and length change", "risk": "wrong focus"},
                "hotkey": {"action": "allowlist chord", "evidence": "typed key sequence", "risk": "system shortcut"},
                "secret": {"action": "use approved secret input", "evidence": "redacted length only", "risk": "clipboard or log leakage"},
            },
        ),
    },
    "05": {
        "mastery": T(
            "screenshot-region-audit",
            "스크린샷 region의 화면 경계·pixel budget 감사하기",
            "양수 크기와 containment, 최대 pixel 수를 검사한다.",
            "audit_screenshot_region(region, screen, maximum_pixels)를 완성하세요.",
            "def audit_screenshot_region(region, screen, maximum_pixels):\n    raise NotImplementedError",
            """def audit_screenshot_region(region, screen, maximum_pixels):
    failures = []
    if region["width"] <= 0 or region["height"] <= 0:
        failures.append("size")
    contained = region["x"] >= screen["x"] and region["y"] >= screen["y"] and region["x"] + region["width"] <= screen["x"] + screen["width"] and region["y"] + region["height"] <= screen["y"] + screen["height"]
    if not contained:
        failures.append("bounds")
    pixels = max(0, region["width"]) * max(0, region["height"])
    if pixels > maximum_pixels:
        failures.append("pixel-budget")
    return {"accepted": not failures, "failures": failures, "pixels": pixels, "contained": contained}
""",
            "audit_screenshot_region",
            [
                (
                    "accepts-contained-region",
                    [{"x": 10, "y": 10, "width": 100, "height": 50}, {"x": 0, "y": 0, "width": 200, "height": 100}, 10000],
                    {"accepted": True, "failures": [], "pixels": 5000, "contained": True},
                ),
                (
                    "reports-bounds-and-budget",
                    [{"x": 150, "y": 0, "width": 100, "height": 100}, {"x": 0, "y": 0, "width": 200, "height": 100}, 5000],
                    {"accepted": False, "failures": ["bounds", "pixel-budget"], "pixels": 10000, "contained": False},
                ),
                (
                    "reports-zero-size",
                    [{"x": 0, "y": 0, "width": 0, "height": 10}, {"x": 0, "y": 0, "width": 100, "height": 100}, 1000],
                    {"accepted": False, "failures": ["size"], "pixels": 0, "contained": True},
                ),
            ],
            [
                "전체 화면 대신 필요한 UI region만 캡처해 민감정보와 비용을 줄이세요.",
                "region containment와 pixel budget을 캡처 전에 검사하세요.",
            ],
        ),
        "transfer": T(
            "screenshot-mask-plan",
            "새 화면 증거에 민감 region mask 전이하기",
            "필수 mask 누락과 화면 전체를 가리는 과도한 mask를 찾는다.",
            "audit_screenshot_masks(capture, masks, required_mask_ids)를 완성하세요.",
            "def audit_screenshot_masks(capture, masks, required_mask_ids):\n    raise NotImplementedError",
            """def audit_screenshot_masks(capture, masks, required_mask_ids):
    ids = {mask["id"] for mask in masks}
    missing = sorted(set(required_mask_ids) - ids)
    capture_area = capture["width"] * capture["height"]
    excessive = []
    for mask in masks:
        area = mask["width"] * mask["height"]
        if capture_area and area / capture_area > 0.5:
            excessive.append(mask["id"])
    failures = []
    if missing:
        failures.append("missing-mask")
    if excessive:
        failures.append("excessive-mask")
    return {"accepted": not failures, "failures": failures, "missing": missing, "excessive": sorted(excessive)}
""",
            "audit_screenshot_masks",
            [
                (
                    "accepts-targeted-mask",
                    [{"width": 100, "height": 100}, [{"id": "email", "width": 20, "height": 10}], ["email"]],
                    {"accepted": True, "failures": [], "missing": [], "excessive": []},
                ),
                (
                    "reports-missing-mask",
                    [{"width": 100, "height": 100}, [], ["token"]],
                    {"accepted": False, "failures": ["missing-mask"], "missing": ["token"], "excessive": []},
                ),
                (
                    "reports-screen-covering-mask",
                    [{"width": 100, "height": 100}, [{"id": "all", "width": 90, "height": 90}], ["all"]],
                    {"accepted": False, "failures": ["excessive-mask"], "missing": [], "excessive": ["all"]},
                ),
            ],
            [
                "민감 region은 selector·ID 단위로 mask하고 화면 전체를 가리지 마세요.",
                "required mask 목록과 실제 적용 목록을 evidence에 남기세요.",
            ],
        ),
        "retrieval": decision(
            "screenshot-region-recall",
            "스크린샷 region 품질 기준 회상하기",
            "경계·민감정보·시각 evidence 역할을 구분한다.",
            "choose_screenshot_region",
            {
                "bounds": {"action": "validate contained positive region", "evidence": "screen and region geometry", "risk": "off-screen capture"},
                "privacy": {"action": "mask targeted sensitive regions", "evidence": "mask IDs and areas", "risk": "secret exposure"},
                "evidence": {"action": "bind state viewport and hash", "evidence": "capture manifest", "risk": "unidentified screenshot"},
            },
        ),
    },
    "06": {
        "mastery": T(
            "image-match-selection",
            "이미지 match 후보의 confidence·모호성 판정하기",
            "threshold 이상 후보가 하나이고 차점과 충분히 벌어질 때만 선택한다.",
            "select_image_match(candidates, threshold, minimum_margin)를 완성하세요.",
            "def select_image_match(candidates, threshold, minimum_margin):\n    raise NotImplementedError",
            """def select_image_match(candidates, threshold, minimum_margin):
    eligible = sorted((candidate for candidate in candidates if candidate["confidence"] >= threshold), key=lambda item: (-item["confidence"], item["id"]))
    if not eligible:
        return {"selected": None, "reason": "below-threshold", "eligible": []}
    margin = eligible[0]["confidence"] - eligible[1]["confidence"] if len(eligible) > 1 else 1.0
    if len(eligible) > 1 and margin < minimum_margin:
        return {"selected": None, "reason": "ambiguous", "eligible": [item["id"] for item in eligible]}
    return {"selected": eligible[0]["id"], "reason": "accepted", "eligible": [item["id"] for item in eligible]}
""",
            "select_image_match",
            [
                (
                    "selects-clear-best-match",
                    [[{"id": "a", "confidence": 0.95}, {"id": "b", "confidence": 0.8}], 0.7, 0.1],
                    {"selected": "a", "reason": "accepted", "eligible": ["a", "b"]},
                ),
                (
                    "rejects-ambiguous-matches",
                    [[{"id": "a", "confidence": 0.91}, {"id": "b", "confidence": 0.9}], 0.8, 0.05],
                    {"selected": None, "reason": "ambiguous", "eligible": ["a", "b"]},
                ),
                (
                    "rejects-below-threshold",
                    [[{"id": "a", "confidence": 0.5}], 0.8, 0.1],
                    {"selected": None, "reason": "below-threshold", "eligible": []},
                ),
            ],
            [
                "threshold 통과 후보가 여러 개면 첫 번째를 클릭하지 마세요.",
                "최고 confidence와 차점 margin을 함께 검사하세요.",
            ],
        ),
        "transfer": T(
            "template-compatibility-audit",
            "새 이미지 template에 scale·theme·source 감사 전이하기",
            "현재 화면 조건과 template metadata가 일치하는지 판정한다.",
            "audit_template_compatibility(template, screen_state)를 완성하세요.",
            "def audit_template_compatibility(template, screen_state):\n    raise NotImplementedError",
            """def audit_template_compatibility(template, screen_state):
    failures = []
    for key in ["scale", "theme", "locale"]:
        if template.get(key) != screen_state.get(key):
            failures.append(key)
    if not template.get("sourceHash"):
        failures.append("source-hash")
    return {"compatible": not failures, "failures": failures, "templateId": template.get("id")}
""",
            "audit_template_compatibility",
            [
                (
                    "accepts-matching-template",
                    [{"id": "save", "scale": 1.0, "theme": "light", "locale": "ko", "sourceHash": "abc"}, {"scale": 1.0, "theme": "light", "locale": "ko"}],
                    {"compatible": True, "failures": [], "templateId": "save"},
                ),
                (
                    "reports-state-mismatch",
                    [{"id": "save", "scale": 1.0, "theme": "light", "locale": "ko", "sourceHash": "abc"}, {"scale": 1.25, "theme": "dark", "locale": "en"}],
                    {"compatible": False, "failures": ["scale", "theme", "locale"], "templateId": "save"},
                ),
                (
                    "reports-unbound-template",
                    [{"id": "save", "scale": 1.0, "theme": "light", "locale": "ko"}, {"scale": 1.0, "theme": "light", "locale": "ko"}],
                    {"compatible": False, "failures": ["source-hash"], "templateId": "save"},
                ),
            ],
            [
                "template은 scale·theme·locale별로 source hash와 함께 관리하세요.",
                "현재 화면 조건과 다른 template을 confidence만으로 사용하지 마세요.",
            ],
        ),
        "retrieval": decision(
            "image-match-recall",
            "화면 이미지 match 품질 기준 회상하기",
            "template 호환성·threshold·모호성 근거를 복원한다.",
            "choose_image_match_gate",
            {
                "template": {"action": "match scale theme locale", "evidence": "source-bound template metadata", "risk": "visual drift"},
                "candidate": {"action": "apply confidence threshold", "evidence": "candidate scores", "risk": "false match"},
                "ambiguity": {"action": "require top margin", "evidence": "best and runner-up", "risk": "wrong duplicate"},
            },
        ),
    },
    "07": {
        "mastery": T(
            "clipboard-transaction-plan",
            "clipboard 사용을 capture·replace·verify·restore transaction으로 만들기",
            "민감도와 원본 복원 조건을 포함한 단계별 계획을 반환한다.",
            "plan_clipboard_transaction(original_type, new_type, contains_secret)를 완성하세요.",
            "def plan_clipboard_transaction(original_type, new_type, contains_secret):\n    raise NotImplementedError",
            """def plan_clipboard_transaction(original_type, new_type, contains_secret):
    allowed = {"text", "empty"}
    if original_type not in allowed or new_type not in allowed:
        raise ValueError("unsupported clipboard type")
    steps = ["capture-original", "write-new", "verify-write", "perform-paste", "restore-original", "verify-restore"]
    return {"steps": steps, "redactEvidence": contains_secret, "clearBeforeRestore": contains_secret, "restorable": True}
""",
            "plan_clipboard_transaction",
            [
                (
                    "plans-safe-text-transaction",
                    ["text", "text", False],
                    {"steps": ["capture-original", "write-new", "verify-write", "perform-paste", "restore-original", "verify-restore"], "redactEvidence": False, "clearBeforeRestore": False, "restorable": True},
                ),
                (
                    "plans-secret-clear-and-redaction",
                    ["empty", "text", True],
                    {"steps": ["capture-original", "write-new", "verify-write", "perform-paste", "restore-original", "verify-restore"], "redactEvidence": True, "clearBeforeRestore": True, "restorable": True},
                ),
                ("rejects-binary-clipboard", ["image", "text", False], E("ValueError")),
            ],
            [
                "clipboard write만 하지 말고 원본 capture와 restore 검증을 포함하세요.",
                "secret을 썼다면 evidence를 redact하고 restore 전 명시적으로 clear하세요.",
            ],
        ),
        "transfer": T(
            "clipboard-result-audit",
            "새 clipboard transaction에 복원·secret 잔존 감사 전이하기",
            "원본 hash 복원과 현재 secret fingerprint 잔존 여부를 판정한다.",
            "audit_clipboard_result(result)를 완성하세요.",
            "def audit_clipboard_result(result):\n    raise NotImplementedError",
            """def audit_clipboard_result(result):
    failures = []
    if result.get("originalHash") != result.get("restoredHash"):
        failures.append("restore")
    if result.get("secretFingerprint") and result.get("currentFingerprint") == result.get("secretFingerprint"):
        failures.append("secret-residual")
    if not result.get("pasteObserved", False):
        failures.append("paste-outcome")
    return {"passed": not failures, "failures": failures, "restored": result.get("originalHash") == result.get("restoredHash")}
""",
            "audit_clipboard_result",
            [
                (
                    "accepts-restored-observed-paste",
                    [{"originalHash": "a", "restoredHash": "a", "pasteObserved": True}],
                    {"passed": True, "failures": [], "restored": True},
                ),
                (
                    "reports-restore-and-paste-failure",
                    [{"originalHash": "a", "restoredHash": "b", "pasteObserved": False}],
                    {"passed": False, "failures": ["restore", "paste-outcome"], "restored": False},
                ),
                (
                    "reports-secret-residual",
                    [{"originalHash": "a", "restoredHash": "a", "secretFingerprint": "secret", "currentFingerprint": "secret", "pasteObserved": True}],
                    {"passed": False, "failures": ["secret-residual"], "restored": True},
                ),
            ],
            [
                "clipboard 원문 대신 hash·fingerprint로 restore와 잔존을 확인하세요.",
                "paste action과 대상 앱에서 관찰된 outcome을 분리해 기록하세요.",
            ],
        ),
        "retrieval": decision(
            "clipboard-safety-recall",
            "clipboard 자동화 안전 원칙 회상하기",
            "capture·secret·restore 증거를 복원한다.",
            "choose_clipboard_policy",
            {
                "capture": {"action": "hash and store supported original", "evidence": "type and hash", "risk": "unsupported binary data"},
                "secret": {"action": "redact and clear after paste", "evidence": "secret fingerprint absence", "risk": "clipboard leakage"},
                "restore": {"action": "restore then verify hash", "evidence": "original and restored hashes", "risk": "user data loss"},
            },
        ),
    },
    "08": {
        "mastery": T(
            "listener-scope-audit",
            "키보드·마우스 listener의 수집 범위와 종료 조건 감사하기",
            "허용 event·대상 앱·최대 시간·stop chord가 없는 listener를 차단한다.",
            "audit_listener_scope(scope)를 완성하세요.",
            "def audit_listener_scope(scope):\n    raise NotImplementedError",
            """def audit_listener_scope(scope):
    failures = []
    if not scope.get("eventKinds"):
        failures.append("events")
    if not scope.get("targetApps"):
        failures.append("apps")
    if scope.get("maximumSeconds", 0) <= 0:
        failures.append("duration")
    if not scope.get("stopChord"):
        failures.append("stop-chord")
    if scope.get("recordText", False):
        failures.append("text-capture")
    return {"ready": not failures, "failures": failures, "retention": "counts-and-timestamps-only"}
""",
            "audit_listener_scope",
            [
                (
                    "accepts-bounded-listener",
                    [{"eventKinds": ["click"], "targetApps": ["Editor"], "maximumSeconds": 30, "stopChord": "ctrl+shift+s", "recordText": False}],
                    {"ready": True, "failures": [], "retention": "counts-and-timestamps-only"},
                ),
                (
                    "reports-unbounded-text-capture",
                    [{"eventKinds": [], "targetApps": [], "maximumSeconds": 0, "stopChord": "", "recordText": True}],
                    {"ready": False, "failures": ["events", "apps", "duration", "stop-chord", "text-capture"], "retention": "counts-and-timestamps-only"},
                ),
                (
                    "rejects-key-text-recording",
                    [{"eventKinds": ["key"], "targetApps": ["Editor"], "maximumSeconds": 5, "stopChord": "esc", "recordText": True}],
                    {"ready": False, "failures": ["text-capture"], "retention": "counts-and-timestamps-only"},
                ),
            ],
            [
                "전역 listener를 무기한 실행하지 말고 앱·event·시간을 제한하세요.",
                "typed text는 저장하지 않고 event count와 timestamp만 보존하세요.",
            ],
        ),
        "transfer": T(
            "listener-event-summary",
            "새 listener event에 앱 이탈·stop 이후 수집 감사 전이하기",
            "stop 시점과 허용 앱을 기준으로 보존 가능한 event만 집계한다.",
            "summarize_listener_events(events, allowed_apps, stop_at)를 완성하세요.",
            "def summarize_listener_events(events, allowed_apps, stop_at):\n    raise NotImplementedError",
            """def summarize_listener_events(events, allowed_apps, stop_at):
    accepted = []
    rejected = []
    for event in events:
        if event["at"] > stop_at:
            rejected.append({"id": event["id"], "reason": "after-stop"})
        elif event["app"] not in allowed_apps:
            rejected.append({"id": event["id"], "reason": "app"})
        else:
            accepted.append(event)
    counts = {}
    for event in accepted:
        counts[event["kind"]] = counts.get(event["kind"], 0) + 1
    return {"counts": counts, "acceptedIds": [event["id"] for event in accepted], "rejected": rejected}
""",
            "summarize_listener_events",
            [
                (
                    "counts-allowed-events",
                    [[{"id": "a", "at": 1, "app": "Editor", "kind": "click"}, {"id": "b", "at": 2, "app": "Editor", "kind": "key"}], ["Editor"], 5],
                    {"counts": {"click": 1, "key": 1}, "acceptedIds": ["a", "b"], "rejected": []},
                ),
                (
                    "rejects-app-and-after-stop",
                    [[{"id": "a", "at": 1, "app": "Mail", "kind": "click"}, {"id": "b", "at": 10, "app": "Editor", "kind": "key"}], ["Editor"], 5],
                    {"counts": {}, "acceptedIds": [], "rejected": [{"id": "a", "reason": "app"}, {"id": "b", "reason": "after-stop"}]},
                ),
                (
                    "includes-event-at-stop",
                    [[{"id": "a", "at": 5, "app": "Editor", "kind": "click"}], ["Editor"], 5],
                    {"counts": {"click": 1}, "acceptedIds": ["a"], "rejected": []},
                ),
            ],
            [
                "stop event 이후 도착한 callback을 보존하지 마세요.",
                "허용 앱 밖 event는 원문 없이 ID와 거부 사유만 남기세요.",
            ],
        ),
        "retrieval": decision(
            "listener-privacy-recall",
            "입력 listener 개인정보 원칙 회상하기",
            "범위·중단·최소 보존 근거를 복원한다.",
            "choose_listener_policy",
            {
                "scope": {"action": "limit event apps and duration", "evidence": "listener contract", "risk": "global surveillance"},
                "stop": {"action": "register visible stop chord", "evidence": "stop timestamp", "risk": "unbounded capture"},
                "retain": {"action": "store counts not text", "evidence": "aggregated event summary", "risk": "keystroke leakage"},
            },
        ),
    },
    "09": {
        "mastery": T(
            "ui-state-machine",
            "상태 기반 자동화의 허용 transition 판정하기",
            "현재 state·event 조합이 명시된 경우에만 다음 action과 state를 반환한다.",
            "advance_ui_state(state, event, transitions)를 완성하세요.",
            "def advance_ui_state(state, event, transitions):\n    raise NotImplementedError",
            """def advance_ui_state(state, event, transitions):
    key = f"{state}:{event}"
    if key not in transitions:
        return {"advanced": False, "state": state, "action": "stop-and-capture", "reason": "unexpected-transition"}
    transition = transitions[key]
    return {"advanced": True, "state": transition["next"], "action": transition["action"], "reason": "matched"}
""",
            "advance_ui_state",
            [
                (
                    "advances-known-transition",
                    ["loading", "ready", {"loading:ready": {"next": "form", "action": "focus-email"}}],
                    {"advanced": True, "state": "form", "action": "focus-email", "reason": "matched"},
                ),
                (
                    "stops-unknown-event",
                    ["loading", "error", {"loading:ready": {"next": "form", "action": "focus-email"}}],
                    {"advanced": False, "state": "loading", "action": "stop-and-capture", "reason": "unexpected-transition"},
                ),
                (
                    "distinguishes-same-event-by-state",
                    ["saved", "ready", {"loading:ready": {"next": "form", "action": "focus"}, "saved:ready": {"next": "done", "action": "capture"}}],
                    {"advanced": True, "state": "done", "action": "capture", "reason": "matched"},
                ),
            ],
            [
                "action 순서가 아니라 관찰된 state와 event의 transition으로 자동화를 진행하세요.",
                "예상 밖 화면에서는 추측 클릭 대신 중단과 증거 캡처를 선택하세요.",
            ],
        ),
        "transfer": T(
            "ui-recovery-plan",
            "새 상태 실패에 제한된 recovery 계획 전이하기",
            "failure state·재시도 횟수·idempotency로 복구 action을 결정한다.",
            "plan_ui_recovery(failure_state, attempt, maximum_attempts, idempotent)를 완성하세요.",
            "def plan_ui_recovery(failure_state, attempt, maximum_attempts, idempotent):\n    raise NotImplementedError",
            """def plan_ui_recovery(failure_state, attempt, maximum_attempts, idempotent):
    if attempt <= 0 or maximum_attempts <= 0:
        raise ValueError("attempts must be positive")
    retryable = failure_state in {"loading-timeout", "temporary-dialog"}
    if retryable and idempotent and attempt < maximum_attempts:
        action = "capture-reset-retry"
    elif failure_state == "authentication-required":
        action = "stop-require-user"
    else:
        action = "stop-and-report"
    return {"action": action, "remaining": max(0, maximum_attempts - attempt), "retryable": retryable and idempotent}
""",
            "plan_ui_recovery",
            [
                ("retries-idempotent-timeout", ["loading-timeout", 1, 3, True], {"action": "capture-reset-retry", "remaining": 2, "retryable": True}),
                ("stops-non-idempotent-timeout", ["loading-timeout", 1, 3, False], {"action": "stop-and-report", "remaining": 2, "retryable": False}),
                ("requires-user-authentication", ["authentication-required", 1, 3, True], {"action": "stop-require-user", "remaining": 2, "retryable": False}),
                ("stops-at-limit", ["temporary-dialog", 3, 3, True], {"action": "stop-and-report", "remaining": 0, "retryable": True}),
            ],
            [
                "복구 전에 실패 화면을 캡처하고 state를 초기화하세요.",
                "인증 요구나 비멱등 action은 자동 재시도하지 마세요.",
            ],
        ),
        "retrieval": decision(
            "state-based-automation-recall",
            "상태 기반 자동화 원칙 회상하기",
            "관찰·transition·recovery 증거를 복원한다.",
            "choose_state_automation",
            {
                "observe": {"action": "classify current UI state", "evidence": "semantic or visual state identity", "risk": "stale screen"},
                "advance": {"action": "use explicit state event transition", "evidence": "transition ID", "risk": "blind sequence"},
                "recover": {"action": "capture then bounded recovery", "evidence": "attempt ledger", "risk": "looping mutation"},
            },
        ),
    },
    "10": {
        "mastery": T(
            "screen-audit-capstone",
            "종합 화면 점검의 상태·안전·증거 completeness 감사하기",
            "필수 state와 E-Stop, before/after, redaction evidence를 release 전에 판정한다.",
            "audit_screen_run(run, required_states)를 완성하세요.",
            "def audit_screen_run(run, required_states):\n    raise NotImplementedError",
            """def audit_screen_run(run, required_states):
    observed = {item["state"] for item in run.get("observations", [])}
    missing = sorted(set(required_states) - observed)
    failures = []
    if missing:
        failures.append("states")
    if not run.get("emergencyStopTested", False):
        failures.append("emergency-stop")
    if not run.get("beforeAfterBound", False):
        failures.append("before-after")
    if run.get("secretResiduals", 0) != 0:
        failures.append("secrets")
    return {"releaseReady": not failures, "failures": failures, "missingStates": missing, "observationCount": len(run.get("observations", []))}
""",
            "audit_screen_run",
            [
                (
                    "accepts-complete-safe-run",
                    [{"observations": [{"state": "ready"}, {"state": "saved"}], "emergencyStopTested": True, "beforeAfterBound": True, "secretResiduals": 0}, ["ready", "saved"]],
                    {"releaseReady": True, "failures": [], "missingStates": [], "observationCount": 2},
                ),
                (
                    "reports-state-and-safety-gaps",
                    [{"observations": [{"state": "ready"}], "emergencyStopTested": False, "beforeAfterBound": False, "secretResiduals": 1}, ["ready", "error"]],
                    {"releaseReady": False, "failures": ["states", "emergency-stop", "before-after", "secrets"], "missingStates": ["error"], "observationCount": 1},
                ),
                (
                    "reports-no-observations",
                    [{"emergencyStopTested": True, "beforeAfterBound": True, "secretResiduals": 0}, ["ready"]],
                    {"releaseReady": False, "failures": ["states"], "missingStates": ["ready"], "observationCount": 0},
                ),
            ],
            [
                "정상 완료 화면만이 아니라 오류·중단 state도 필수 목록에 포함하세요.",
                "E-Stop은 설정값이 아니라 실제 중단 event로 시험하세요.",
            ],
        ),
        "transfer": T(
            "screen-run-release-streak",
            "새 화면 자동화의 연속 무개입 통과 판정하기",
            "같은 plan hash의 pass와 intervention 0 조건으로 연속 streak를 계산한다.",
            "decide_screen_release(runs, current_plan_hash, required_streak)를 완성하세요.",
            "def decide_screen_release(runs, current_plan_hash, required_streak):\n    raise NotImplementedError",
            """def decide_screen_release(runs, current_plan_hash, required_streak):
    if required_streak <= 0:
        raise ValueError("required streak must be positive")
    streak = 0
    stale = []
    interventions = []
    for run in sorted(runs, key=lambda item: item["sequence"]):
        if run["planHash"] != current_plan_hash:
            stale.append(run["sequence"])
            continue
        if run.get("interventions", 0) > 0:
            interventions.append(run["sequence"])
        streak = streak + 1 if run["passed"] and run.get("interventions", 0) == 0 else 0
    return {"releaseReady": streak >= required_streak and not stale, "streak": streak, "stale": stale, "interventions": interventions}
""",
            "decide_screen_release",
            [
                (
                    "accepts-two-unassisted-passes",
                    [[{"sequence": 1, "planHash": "a", "passed": True, "interventions": 0}, {"sequence": 2, "planHash": "a", "passed": True, "interventions": 0}], "a", 2],
                    {"releaseReady": True, "streak": 2, "stale": [], "interventions": []},
                ),
                (
                    "resets-on-user-intervention",
                    [[{"sequence": 1, "planHash": "a", "passed": True, "interventions": 1}, {"sequence": 2, "planHash": "a", "passed": True, "interventions": 0}], "a", 2],
                    {"releaseReady": False, "streak": 1, "stale": [], "interventions": [1]},
                ),
                (
                    "rejects-stale-plan-run",
                    [[{"sequence": 1, "planHash": "old", "passed": True, "interventions": 0}, {"sequence": 2, "planHash": "a", "passed": True, "interventions": 0}], "a", 1],
                    {"releaseReady": False, "streak": 1, "stale": [1], "interventions": []},
                ),
                ("rejects-zero-streak", [[], "a", 0], E("ValueError")),
            ],
            [
                "사람이 중간에 고친 pass는 무개입 자동화 streak로 세지 마세요.",
                "현재 plan hash와 다른 실행 증거를 release 판정에 합치지 마세요.",
            ],
        ),
        "retrieval": decision(
            "screen-audit-capstone-recall",
            "종합 화면 자동화 종료 조건 회상하기",
            "안전·state·증거·연속 통과 기준을 복원한다.",
            "choose_screen_audit_gate",
            {
                "safety": {"action": "test fail-safe and E-Stop", "evidence": "real stop event", "risk": "runaway input"},
                "outcome": {"action": "bind before after state", "evidence": "state and screenshot hashes", "risk": "click-only success"},
                "release": {"action": "require current unassisted streak", "evidence": "plan-bound runs", "risk": "manual rescue or stale pass"},
            },
        ),
    },
}
