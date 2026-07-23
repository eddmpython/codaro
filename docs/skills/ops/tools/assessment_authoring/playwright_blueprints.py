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
            "브라우저 동작 성공과 사용자 목표 달성을 같은 것으로 취급하지 마세요.",
            "선택한 action과 함께 판정 가능한 evidence와 남는 risk를 기록하세요.",
        ],
    )


BLUEPRINTS: dict[str, dict[str, TaskBlueprint]] = {
    "00": {
        "mastery": T(
            "automation-brief-contract",
            "브라우저 자동화 brief의 안전 계약 만들기",
            "목표·성공 조건·허용 origin·데이터 정책이 빠진 자동화를 실행 전에 식별한다.",
            "audit_automation_brief(brief)를 완성하세요.",
            "def audit_automation_brief(brief):\n    raise NotImplementedError",
            """def audit_automation_brief(brief):
    required = {"target", "goal", "success", "allowedOrigins", "dataPolicy"}
    missing = sorted(required - set(brief))
    failures = []
    if not brief.get("success"):
        failures.append("success")
    if not brief.get("allowedOrigins"):
        failures.append("allowedOrigins")
    if brief.get("dataPolicy") not in {"public-only", "test-account", "approved-sensitive"}:
        failures.append("dataPolicy")
    return {
        "ready": not missing and not failures,
        "missing": missing,
        "failures": failures,
        "evidence": ["navigation", "assertion", "artifact"],
    }
""",
            "audit_automation_brief",
            [
                (
                    "accepts-explicit-brief",
                    [{"target": "status", "goal": "check notice", "success": ["heading"], "allowedOrigins": ["https://example.test"], "dataPolicy": "public-only"}],
                    {"ready": True, "missing": [], "failures": [], "evidence": ["navigation", "assertion", "artifact"]},
                ),
                (
                    "reports-empty-boundaries",
                    [{"target": "portal", "goal": "audit", "success": [], "allowedOrigins": [], "dataPolicy": "unknown"}],
                    {"ready": False, "missing": [], "failures": ["success", "allowedOrigins", "dataPolicy"], "evidence": ["navigation", "assertion", "artifact"]},
                ),
                (
                    "reports-missing-fields",
                    [{"target": "page"}],
                    {"ready": False, "missing": ["allowedOrigins", "dataPolicy", "goal", "success"], "failures": ["success", "allowedOrigins", "dataPolicy"], "evidence": ["navigation", "assertion", "artifact"]},
                ),
            ],
            [
                "사이트를 열기 전에 성공 조건과 허용 origin을 데이터로 고정하세요.",
                "스크린샷 한 장이 아니라 navigation·assertion·artifact를 함께 계획하세요.",
            ],
        ),
        "transfer": T(
            "runtime-tier-plan",
            "새 자동화 요구에 Web·Local 역할 분리 전이하기",
            "외부 브라우저·비밀·파일 산출물 요구를 근거로 실행 tier를 판정한다.",
            "plan_runtime_tier(requirements)를 완성하세요.",
            "def plan_runtime_tier(requirements):\n    raise NotImplementedError",
            """def plan_runtime_tier(requirements):
    local_reasons = []
    if requirements.get("realBrowser"):
        local_reasons.append("real-browser")
    if requirements.get("secrets"):
        local_reasons.append("secret-store")
    if requirements.get("downloads"):
        local_reasons.append("filesystem-artifact")
    tier = "local" if local_reasons else "web"
    return {
        "tier": tier,
        "localReasons": local_reasons,
        "webCanPractice": ["locator policy", "wait logic", "evidence contract"],
    }
""",
            "plan_runtime_tier",
            [
                (
                    "keeps-contract-practice-on-web",
                    [{"realBrowser": False, "secrets": False, "downloads": False}],
                    {"tier": "web", "localReasons": [], "webCanPractice": ["locator policy", "wait logic", "evidence contract"]},
                ),
                (
                    "requires-local-for-browser-and-secret",
                    [{"realBrowser": True, "secrets": True, "downloads": False}],
                    {"tier": "local", "localReasons": ["real-browser", "secret-store"], "webCanPractice": ["locator policy", "wait logic", "evidence contract"]},
                ),
                (
                    "requires-local-for-download",
                    [{"downloads": True}],
                    {"tier": "local", "localReasons": ["filesystem-artifact"], "webCanPractice": ["locator policy", "wait logic", "evidence contract"]},
                ),
            ],
            [
                "Web에서는 자동화 판단을 학습하고 실제 OS·브라우저 권한은 Local에 남기세요.",
                "Local 전환 이유를 기능 이름이 아니라 필요한 capability로 기록하세요.",
            ],
        ),
        "retrieval": decision(
            "automation-scope-recall",
            "브라우저 자동화 범위 결정 회상하기",
            "읽기·상태 변경·인증 자동화의 위험 경계를 구분한다.",
            "choose_automation_scope",
            {
                "public-read": {"action": "web contract then local probe", "evidence": "status and semantic assertion", "risk": "site change"},
                "account-read": {"action": "local isolated profile", "evidence": "redacted storage and trace", "risk": "secret exposure"},
                "state-changing": {"action": "local dry run with allowlist", "evidence": "planned and observed mutation", "risk": "irreversible action"},
            },
        ),
    },
    "01": {
        "mastery": T(
            "navigation-result-audit",
            "첫 탐색의 status·origin·redirect 증거 판정하기",
            "응답 연쇄에서 최종 URL과 HTTP 실패, origin 이탈을 함께 찾는다.",
            "audit_navigation(responses, allowed_origins)를 완성하세요.",
            "def audit_navigation(responses, allowed_origins):\n    raise NotImplementedError",
            """def audit_navigation(responses, allowed_origins):
    from urllib.parse import urlsplit
    if not responses:
        raise ValueError("empty response chain")
    failures = []
    hops = []
    for response in responses:
        url = response["url"]
        parts = urlsplit(url)
        origin = f"{parts.scheme}://{parts.netloc}"
        hops.append({"url": url, "status": response["status"], "origin": origin})
        if response["status"] >= 400:
            failures.append(f"http-{response['status']}")
        if origin not in allowed_origins:
            failures.append("origin")
    final = hops[-1]
    return {"ok": not failures, "finalUrl": final["url"], "finalStatus": final["status"], "hops": len(hops), "failures": failures}
""",
            "audit_navigation",
            [
                (
                    "accepts-allowed-redirect",
                    [[{"url": "https://example.test/start", "status": 302}, {"url": "https://example.test/home", "status": 200}], ["https://example.test"]],
                    {"ok": True, "finalUrl": "https://example.test/home", "finalStatus": 200, "hops": 2, "failures": []},
                ),
                (
                    "reports-origin-and-http",
                    [[{"url": "https://example.test/start", "status": 302}, {"url": "https://login.test/fail", "status": 503}], ["https://example.test"]],
                    {"ok": False, "finalUrl": "https://login.test/fail", "finalStatus": 503, "hops": 2, "failures": ["http-503", "origin"]},
                ),
                ("rejects-empty-chain", [[], ["https://example.test"]], E("ValueError")),
            ],
            [
                "page가 열렸다는 사실 외에 response status와 최종 origin을 검사하세요.",
                "허용한 redirect chain과 의도하지 않은 외부 이동을 구분하세요.",
            ],
        ),
        "transfer": T(
            "semantic-page-probe",
            "새 페이지에 의미 기반 첫 상태 점검 전이하기",
            "제목·주요 landmark·console 오류로 탐색 직후 상태를 요약한다.",
            "summarize_page_probe(probe)를 완성하세요.",
            "def summarize_page_probe(probe):\n    raise NotImplementedError",
            """def summarize_page_probe(probe):
    failures = []
    if not probe.get("title", "").strip():
        failures.append("title")
    if probe.get("mainLandmarks", 0) != 1:
        failures.append("main-landmark")
    severe = [item for item in probe.get("console", []) if item.get("level") in {"error", "assert"}]
    if severe:
        failures.append("console")
    return {
        "usable": not failures,
        "failures": failures,
        "title": probe.get("title", ""),
        "severeConsole": [item.get("text", "") for item in severe],
    }
""",
            "summarize_page_probe",
            [
                (
                    "accepts-semantic-shell",
                    [{"title": "Orders", "mainLandmarks": 1, "console": [{"level": "info", "text": "ready"}]}],
                    {"usable": True, "failures": [], "title": "Orders", "severeConsole": []},
                ),
                (
                    "reports-empty-shell-and-console",
                    [{"title": " ", "mainLandmarks": 0, "console": [{"level": "error", "text": "boot failed"}]}],
                    {"usable": False, "failures": ["title", "main-landmark", "console"], "title": " ", "severeConsole": ["boot failed"]},
                ),
                (
                    "reports-duplicate-main",
                    [{"title": "Home", "mainLandmarks": 2, "console": []}],
                    {"usable": False, "failures": ["main-landmark"], "title": "Home", "severeConsole": []},
                ),
            ],
            [
                "DOM 전체 문자열보다 title과 landmark 같은 사용자 의미를 먼저 확인하세요.",
                "console error를 화면 assertion과 별도 증거로 남기세요.",
            ],
        ),
        "retrieval": decision(
            "navigation-evidence-recall",
            "첫 브라우저 탐색 증거 회상하기",
            "화면 표시·응답 실패·외부 이동을 서로 다른 증거로 판정한다.",
            "choose_navigation_evidence",
            {
                "page-shell": {"action": "assert title and main landmark", "evidence": "semantic snapshot", "risk": "empty client shell"},
                "redirect-chain": {"action": "record every response", "evidence": "status and final origin", "risk": "unexpected identity provider"},
                "console-failure": {"action": "collect severe console messages", "evidence": "message and page state", "risk": "silent boot failure"},
            },
        ),
    },
    "02": {
        "mastery": T(
            "locator-contract-audit",
            "locator의 유일성과 사용자 의미 판정하기",
            "role·label·test id 전략과 실제 match 수를 함께 검사한다.",
            "audit_locators(locators)를 완성하세요.",
            "def audit_locators(locators):\n    raise NotImplementedError",
            """def audit_locators(locators):
    failures = []
    accepted = []
    for locator in locators:
        name = locator["name"]
        if locator.get("matches") != 1:
            failures.append({"name": name, "reason": "not-unique"})
            continue
        if locator.get("strategy") not in {"role", "label", "placeholder", "test-id"}:
            failures.append({"name": name, "reason": "brittle-strategy"})
            continue
        accepted.append(name)
    return {"ready": not failures, "accepted": accepted, "failures": failures}
""",
            "audit_locators",
            [
                (
                    "accepts-semantic-locators",
                    [[{"name": "email", "strategy": "label", "matches": 1}, {"name": "save", "strategy": "role", "matches": 1}]],
                    {"ready": True, "accepted": ["email", "save"], "failures": []},
                ),
                (
                    "reports-duplicate-and-css",
                    [[{"name": "row", "strategy": "role", "matches": 3}, {"name": "submit", "strategy": "css", "matches": 1}]],
                    {"ready": False, "accepted": [], "failures": [{"name": "row", "reason": "not-unique"}, {"name": "submit", "reason": "brittle-strategy"}]},
                ),
                (
                    "keeps-valid-among-failures",
                    [[{"name": "query", "strategy": "placeholder", "matches": 1}, {"name": "missing", "strategy": "test-id", "matches": 0}]],
                    {"ready": False, "accepted": ["query"], "failures": [{"name": "missing", "reason": "not-unique"}]},
                ),
            ],
            [
                "locator 선언뿐 아니라 대상 화면에서 정확히 한 개가 매치되는지 확인하세요.",
                "DOM 구조보다 사용자가 인지하는 role·label을 우선하세요.",
            ],
        ),
        "transfer": T(
            "form-action-plan",
            "새 폼에 입력·검증 계획 전이하기",
            "필수 필드 누락과 예상 밖 입력을 찾고 입력 순서를 만든다.",
            "plan_form_actions(fields, values)를 완성하세요.",
            "def plan_form_actions(fields, values):\n    raise NotImplementedError",
            """def plan_form_actions(fields, values):
    field_names = {field["name"] for field in fields}
    required = {field["name"] for field in fields if field.get("required")}
    missing = sorted(name for name in required if name not in values or values[name] in {None, ""})
    unexpected = sorted(set(values) - field_names)
    actions = []
    for field in fields:
        name = field["name"]
        if name in values and values[name] not in {None, ""}:
            actions.append({"name": name, "locator": field["locator"], "value": values[name]})
    return {"ready": not missing and not unexpected, "missing": missing, "unexpected": unexpected, "actions": actions}
""",
            "plan_form_actions",
            [
                (
                    "plans-required-and-optional",
                    [[{"name": "email", "locator": "label:Email", "required": True}, {"name": "note", "locator": "label:Note", "required": False}], {"email": "a@example.test", "note": "hello"}],
                    {"ready": True, "missing": [], "unexpected": [], "actions": [{"name": "email", "locator": "label:Email", "value": "a@example.test"}, {"name": "note", "locator": "label:Note", "value": "hello"}]},
                ),
                (
                    "reports-missing-required",
                    [[{"name": "email", "locator": "label:Email", "required": True}], {"email": ""}],
                    {"ready": False, "missing": ["email"], "unexpected": [], "actions": []},
                ),
                (
                    "reports-unexpected-input",
                    [[{"name": "query", "locator": "role:searchbox", "required": False}], {"query": "docs", "admin": True}],
                    {"ready": False, "missing": [], "unexpected": ["admin"], "actions": [{"name": "query", "locator": "role:searchbox", "value": "docs"}]},
                ),
            ],
            [
                "입력값과 locator 계약을 분리해 값만 바뀌는 테스트를 재사용하세요.",
                "예상하지 않은 필드는 조용히 입력하지 말고 계획 단계에서 차단하세요.",
            ],
        ),
        "retrieval": decision(
            "locator-choice-recall",
            "안정적인 locator 선택 회상하기",
            "접근 가능한 의미와 테스트 전용 계약의 우선순위를 복원한다.",
            "choose_locator_strategy",
            {
                "named-button": {"action": "get by role and name", "evidence": "unique accessible match", "risk": "duplicate label"},
                "labeled-input": {"action": "get by label", "evidence": "label association", "risk": "missing accessible name"},
                "nonsemantic-widget": {"action": "approved test id", "evidence": "stable product contract", "risk": "implementation coupling"},
            },
        ),
    },
    "03": {
        "mastery": T(
            "wait-timeline-resolution",
            "상태 변화 timeline에서 첫 준비 시점 찾기",
            "고정 sleep 없이 목표 상태가 timeout 안에 관찰되는지 판정한다.",
            "resolve_wait(events, target_state, timeout_ms)를 완성하세요.",
            "def resolve_wait(events, target_state, timeout_ms):\n    raise NotImplementedError",
            """def resolve_wait(events, target_state, timeout_ms):
    if timeout_ms < 0:
        raise ValueError("negative timeout")
    ordered = sorted(events, key=lambda event: event["atMs"])
    observed = [event["state"] for event in ordered if event["atMs"] <= timeout_ms]
    for event in ordered:
        if event["atMs"] <= timeout_ms and event["state"] == target_state:
            return {"passed": True, "atMs": event["atMs"], "observed": observed}
    return {"passed": False, "atMs": None, "observed": observed}
""",
            "resolve_wait",
            [
                (
                    "finds-first-ready-event",
                    [[{"atMs": 300, "state": "ready"}, {"atMs": 0, "state": "loading"}, {"atMs": 500, "state": "ready"}], "ready", 400],
                    {"passed": True, "atMs": 300, "observed": ["loading", "ready"]},
                ),
                (
                    "times-out-with-observed-states",
                    [[{"atMs": 0, "state": "loading"}, {"atMs": 900, "state": "ready"}], "ready", 500],
                    {"passed": False, "atMs": None, "observed": ["loading"]},
                ),
                ("rejects-negative-timeout", [[], "ready", -1], E("ValueError")),
            ],
            [
                "기다린 시간 자체가 아니라 관찰할 사용자 상태를 명시하세요.",
                "timeout 실패에서도 도달한 상태를 남겨 원인을 좁히세요.",
            ],
        ),
        "transfer": T(
            "assertion-policy-audit",
            "새 테스트의 wait·assertion 정책 감사하기",
            "고정 sleep과 즉시 snapshot 비교를 찾아 web-first assertion으로 교정한다.",
            "audit_assertion_policy(steps)를 완성하세요.",
            "def audit_assertion_policy(steps):\n    raise NotImplementedError",
            """def audit_assertion_policy(steps):
    failures = []
    retryable = []
    for index, step in enumerate(steps):
        kind = step.get("kind")
        if kind == "sleep":
            failures.append({"index": index, "reason": "fixed-sleep"})
        elif kind == "assert" and not step.get("webFirst", False):
            failures.append({"index": index, "reason": "non-retrying-assertion"})
        elif kind == "assert":
            retryable.append(index)
    return {"ready": not failures, "retryableAssertions": retryable, "failures": failures}
""",
            "audit_assertion_policy",
            [
                (
                    "accepts-web-first-assertions",
                    [[{"kind": "action"}, {"kind": "assert", "webFirst": True}, {"kind": "assert", "webFirst": True}]],
                    {"ready": True, "retryableAssertions": [1, 2], "failures": []},
                ),
                (
                    "reports-sleep-and-snapshot",
                    [[{"kind": "sleep", "ms": 1000}, {"kind": "assert", "webFirst": False}]],
                    {"ready": False, "retryableAssertions": [], "failures": [{"index": 0, "reason": "fixed-sleep"}, {"index": 1, "reason": "non-retrying-assertion"}]},
                ),
                (
                    "keeps-good-assertion-among-failures",
                    [[{"kind": "assert", "webFirst": True}, {"kind": "sleep", "ms": 20}]],
                    {"ready": False, "retryableAssertions": [0], "failures": [{"index": 1, "reason": "fixed-sleep"}]},
                ),
            ],
            [
                "`sleep`을 줄이는 것이 아니라 기다릴 상태와 실패 message를 설계하세요.",
                "자동 retry가 가능한 assertion과 즉시 계산 assertion을 구분하세요.",
            ],
        ),
        "retrieval": decision(
            "wait-strategy-recall",
            "기다림과 검증 전략 회상하기",
            "navigation·요소 표시·비동기 응답의 관찰 대상을 구분한다.",
            "choose_wait_strategy",
            {
                "navigation": {"action": "assert destination URL and landmark", "evidence": "response and semantic state", "risk": "client redirect"},
                "element-ready": {"action": "web-first visible or enabled assertion", "evidence": "locator state", "risk": "wrong duplicate"},
                "async-result": {"action": "assert rendered outcome", "evidence": "user-visible result", "risk": "waiting on implementation detail"},
            },
        ),
    },
    "04": {
        "mastery": T(
            "screenshot-manifest",
            "스크린샷 증거 manifest 만들기",
            "viewport·상태·mask·파일 identity가 빠진 캡처를 식별한다.",
            "build_screenshot_manifest(captures)를 완성하세요.",
            "def build_screenshot_manifest(captures):\n    raise NotImplementedError",
            """def build_screenshot_manifest(captures):
    required = {"name", "state", "width", "height", "path", "masked"}
    entries = []
    failures = []
    seen = set()
    for index, capture in enumerate(captures):
        missing = sorted(required - set(capture))
        if missing:
            failures.append({"index": index, "reason": "missing", "fields": missing})
            continue
        key = (capture["state"], capture["width"], capture["height"])
        if key in seen:
            failures.append({"index": index, "reason": "duplicate-state-viewport", "fields": []})
            continue
        seen.add(key)
        entries.append({name: capture[name] for name in ["name", "state", "width", "height", "path", "masked"]})
    return {"complete": not failures, "entries": entries, "failures": failures}
""",
            "build_screenshot_manifest",
            [
                (
                    "builds-two-state-manifest",
                    [[{"name": "home-empty", "state": "empty", "width": 390, "height": 844, "path": "home-empty.png", "masked": []}, {"name": "home-error", "state": "error", "width": 390, "height": 844, "path": "home-error.png", "masked": ["time"]}]],
                    {"complete": True, "entries": [{"name": "home-empty", "state": "empty", "width": 390, "height": 844, "path": "home-empty.png", "masked": []}, {"name": "home-error", "state": "error", "width": 390, "height": 844, "path": "home-error.png", "masked": ["time"]}], "failures": []},
                ),
                (
                    "reports-missing-metadata",
                    [[{"name": "partial", "state": "ready"}]],
                    {"complete": False, "entries": [], "failures": [{"index": 0, "reason": "missing", "fields": ["height", "masked", "path", "width"]}]},
                ),
                (
                    "reports-duplicate-state-viewport",
                    [[{"name": "a", "state": "ready", "width": 800, "height": 600, "path": "a.png", "masked": []}, {"name": "b", "state": "ready", "width": 800, "height": 600, "path": "b.png", "masked": []}]],
                    {"complete": False, "entries": [{"name": "a", "state": "ready", "width": 800, "height": 600, "path": "a.png", "masked": []}], "failures": [{"index": 1, "reason": "duplicate-state-viewport", "fields": []}]},
                ),
            ],
            [
                "파일명만 남기지 말고 viewport와 제품 상태를 manifest에 고정하세요.",
                "동적 요소 mask는 selector 단위로 기록하고 화면 전체를 가리지 마세요.",
            ],
        ),
        "transfer": T(
            "evidence-bundle-audit",
            "새 브라우저 점검에 증거 bundle 감사 전이하기",
            "assertion·screenshot·trace가 같은 scenario identity를 공유하는지 검사한다.",
            "audit_evidence_bundle(items, required_kinds)를 완성하세요.",
            "def audit_evidence_bundle(items, required_kinds):\n    raise NotImplementedError",
            """def audit_evidence_bundle(items, required_kinds):
    scenarios = {}
    for item in items:
        scenarios.setdefault(item["scenario"], set()).add(item["kind"])
    missing = {}
    required = set(required_kinds)
    for scenario, kinds in sorted(scenarios.items()):
        absent = sorted(required - kinds)
        if absent:
            missing[scenario] = absent
    return {"complete": bool(scenarios) and not missing, "scenarios": sorted(scenarios), "missing": missing}
""",
            "audit_evidence_bundle",
            [
                (
                    "accepts-complete-scenario",
                    [[{"scenario": "login", "kind": "assertion"}, {"scenario": "login", "kind": "screenshot"}, {"scenario": "login", "kind": "trace"}], ["assertion", "screenshot", "trace"]],
                    {"complete": True, "scenarios": ["login"], "missing": {}},
                ),
                (
                    "reports-per-scenario-gaps",
                    [[{"scenario": "a", "kind": "assertion"}, {"scenario": "b", "kind": "screenshot"}], ["assertion", "screenshot"]],
                    {"complete": False, "scenarios": ["a", "b"], "missing": {"a": ["screenshot"], "b": ["assertion"]}},
                ),
                (
                    "rejects-empty-evidence",
                    [[], ["assertion"]],
                    {"complete": False, "scenarios": [], "missing": {}},
                ),
            ],
            [
                "증거 종류마다 별도 scenario 이름을 만들지 말고 같은 identity로 묶으세요.",
                "정상 화면만 캡처하지 말고 실패 상태의 assertion과 trace를 함께 보존하세요.",
            ],
        ),
        "retrieval": decision(
            "visual-evidence-recall",
            "스크린샷과 실행 증거 역할 회상하기",
            "시각 회귀·동작 판정·실패 진단에 맞는 artifact를 선택한다.",
            "choose_visual_evidence",
            {
                "layout-regression": {"action": "viewport-bound screenshot", "evidence": "baseline metadata and pixel diff", "risk": "over-masking"},
                "behavior-pass": {"action": "semantic assertion", "evidence": "observed user outcome", "risk": "pretty screenshot without proof"},
                "intermittent-failure": {"action": "retain trace and screenshot", "evidence": "timeline network console", "risk": "secret leakage"},
            },
        ),
    },
    "05": {
        "mastery": T(
            "network-route-resolution",
            "요청을 가장 구체적인 mock route에 연결하기",
            "method·URL prefix·우선순위로 rule을 선택하고 unmatched 요청을 드러낸다.",
            "resolve_mock_route(request, rules)를 완성하세요.",
            "def resolve_mock_route(request, rules):\n    raise NotImplementedError",
            """def resolve_mock_route(request, rules):
    matches = []
    for rule in rules:
        if rule["method"] == request["method"] and request["url"].startswith(rule["urlPrefix"]):
            matches.append(rule)
    if not matches:
        return {"matched": False, "rule": None, "response": None}
    selected = sorted(matches, key=lambda rule: (-len(rule["urlPrefix"]), -rule.get("priority", 0), rule["id"]))[0]
    return {"matched": True, "rule": selected["id"], "response": selected["response"]}
""",
            "resolve_mock_route",
            [
                (
                    "chooses-most-specific-prefix",
                    [{"method": "GET", "url": "https://api.test/orders/42"}, [{"id": "all", "method": "GET", "urlPrefix": "https://api.test/", "response": {"status": 200}}, {"id": "order", "method": "GET", "urlPrefix": "https://api.test/orders/", "response": {"status": 404}}]],
                    {"matched": True, "rule": "order", "response": {"status": 404}},
                ),
                (
                    "uses-priority-for-equal-prefix",
                    [{"method": "POST", "url": "https://api.test/jobs"}, [{"id": "low", "method": "POST", "urlPrefix": "https://api.test/jobs", "priority": 1, "response": {"status": 202}}, {"id": "high", "method": "POST", "urlPrefix": "https://api.test/jobs", "priority": 5, "response": {"status": 409}}]],
                    {"matched": True, "rule": "high", "response": {"status": 409}},
                ),
                (
                    "reports-unmatched-method",
                    [{"method": "DELETE", "url": "https://api.test/jobs"}, [{"id": "post", "method": "POST", "urlPrefix": "https://api.test/jobs", "response": {"status": 202}}]],
                    {"matched": False, "rule": None, "response": None},
                ),
            ],
            [
                "broad wildcard보다 method와 resource가 구체적인 route를 우선하세요.",
                "매치되지 않은 요청을 실제 네트워크로 조용히 보내지 마세요.",
            ],
        ),
        "transfer": T(
            "network-log-audit",
            "새 시나리오의 외부 요청·실패 응답 감사하기",
            "허용 origin 밖 요청과 HTTP 실패를 request identity로 보고한다.",
            "audit_network_log(entries, allowed_origins)를 완성하세요.",
            "def audit_network_log(entries, allowed_origins):\n    raise NotImplementedError",
            """def audit_network_log(entries, allowed_origins):
    from urllib.parse import urlsplit
    external = []
    failed = []
    for entry in entries:
        parts = urlsplit(entry["url"])
        origin = f"{parts.scheme}://{parts.netloc}"
        identity = f"{entry['method']} {entry['url']}"
        if origin not in allowed_origins:
            external.append(identity)
        if entry.get("status", 0) >= 400 or entry.get("error"):
            failed.append(identity)
    return {"clean": not external and not failed, "external": external, "failed": failed}
""",
            "audit_network_log",
            [
                (
                    "accepts-allowed-successes",
                    [[{"method": "GET", "url": "https://app.test/api", "status": 200}], ["https://app.test"]],
                    {"clean": True, "external": [], "failed": []},
                ),
                (
                    "reports-external-failure",
                    [[{"method": "POST", "url": "https://metrics.test/collect", "status": 500}], ["https://app.test"]],
                    {"clean": False, "external": ["POST https://metrics.test/collect"], "failed": ["POST https://metrics.test/collect"]},
                ),
                (
                    "reports-transport-error",
                    [[{"method": "GET", "url": "https://app.test/api", "error": "timeout"}], ["https://app.test"]],
                    {"clean": False, "external": [], "failed": ["GET https://app.test/api"]},
                ),
            ],
            [
                "mock 성공만 보지 말고 실제 발생한 모든 request의 origin을 감사하세요.",
                "HTTP 오류와 transport 오류를 같은 request identity에 연결하세요.",
            ],
        ),
        "retrieval": decision(
            "network-mocking-recall",
            "네트워크 mocking 경계 회상하기",
            "정상·오류·예상 밖 요청에 맞는 격리 전략을 복원한다.",
            "choose_network_mocking",
            {
                "known-success": {"action": "fulfill exact method and resource", "evidence": "request body and rendered outcome", "risk": "fixture drift"},
                "known-failure": {"action": "fulfill explicit error response", "evidence": "status and recovery UI", "risk": "happy-path only"},
                "unexpected-request": {"action": "abort and fail scenario", "evidence": "method URL initiator", "risk": "silent internet access"},
            },
        ),
    },
    "06": {
        "mastery": T(
            "storage-state-redaction",
            "로그인 storage state에서 비밀값 제거하기",
            "cookie와 local storage의 민감한 이름을 보존 가능한 redacted 값으로 바꾼다.",
            "redact_storage_state(state, secret_names)를 완성하세요.",
            "def redact_storage_state(state, secret_names):\n    raise NotImplementedError",
            """def redact_storage_state(state, secret_names):
    secrets = {name.lower() for name in secret_names}
    cookies = []
    redacted = 0
    for cookie in state.get("cookies", []):
        item = dict(cookie)
        if item.get("name", "").lower() in secrets:
            item["value"] = "[REDACTED]"
            redacted += 1
        cookies.append(item)
    origins = []
    for origin in state.get("origins", []):
        item = {"origin": origin["origin"], "localStorage": []}
        for value in origin.get("localStorage", []):
            stored = dict(value)
            if stored.get("name", "").lower() in secrets:
                stored["value"] = "[REDACTED]"
                redacted += 1
            item["localStorage"].append(stored)
        origins.append(item)
    return {"cookies": cookies, "origins": origins, "redactedCount": redacted}
""",
            "redact_storage_state",
            [
                (
                    "redacts-cookie-and-local-storage",
                    [{"cookies": [{"name": "session", "value": "abc", "domain": "app.test"}], "origins": [{"origin": "https://app.test", "localStorage": [{"name": "token", "value": "xyz"}, {"name": "theme", "value": "dark"}]}]}, ["session", "token"]],
                    {"cookies": [{"name": "session", "value": "[REDACTED]", "domain": "app.test"}], "origins": [{"origin": "https://app.test", "localStorage": [{"name": "token", "value": "[REDACTED]"}, {"name": "theme", "value": "dark"}]}], "redactedCount": 2},
                ),
                (
                    "matches-secret-names-case-insensitively",
                    [{"cookies": [{"name": "Auth", "value": "secret"}], "origins": []}, ["auth"]],
                    {"cookies": [{"name": "Auth", "value": "[REDACTED]"}], "origins": [], "redactedCount": 1},
                ),
                (
                    "handles-empty-state",
                    [{}, ["session"]],
                    {"cookies": [], "origins": [], "redactedCount": 0},
                ),
            ],
            [
                "storage state 파일을 screenshot이나 trace보다 먼저 민감 정보로 취급하세요.",
                "값을 삭제해 구조를 숨기기보다 redacted marker로 검토 가능성을 남기세요.",
            ],
        ),
        "transfer": T(
            "auth-state-scope-audit",
            "새 인증 상태의 origin·만료 범위 감사하기",
            "허용하지 않은 origin, 만료 cookie, 과도한 수명을 함께 차단한다.",
            "audit_auth_state(state, allowed_origins, now, maximum_lifetime)를 완성하세요.",
            "def audit_auth_state(state, allowed_origins, now, maximum_lifetime):\n    raise NotImplementedError",
            """def audit_auth_state(state, allowed_origins, now, maximum_lifetime):
    failures = []
    unexpected = sorted(origin["origin"] for origin in state.get("origins", []) if origin["origin"] not in allowed_origins)
    if unexpected:
        failures.append("origin")
    expired = sorted(cookie["name"] for cookie in state.get("cookies", []) if cookie.get("expires", now + 1) <= now)
    if expired:
        failures.append("expired")
    long_lived = sorted(cookie["name"] for cookie in state.get("cookies", []) if cookie.get("expires", now) - now > maximum_lifetime)
    if long_lived:
        failures.append("lifetime")
    return {"accepted": not failures, "failures": failures, "unexpectedOrigins": unexpected, "expiredCookies": expired, "longLivedCookies": long_lived}
""",
            "audit_auth_state",
            [
                (
                    "accepts-scoped-fresh-state",
                    [{"cookies": [{"name": "session", "expires": 150}], "origins": [{"origin": "https://app.test"}]}, ["https://app.test"], 100, 100],
                    {"accepted": True, "failures": [], "unexpectedOrigins": [], "expiredCookies": [], "longLivedCookies": []},
                ),
                (
                    "reports-origin-and-expiry",
                    [{"cookies": [{"name": "old", "expires": 90}], "origins": [{"origin": "https://other.test"}]}, ["https://app.test"], 100, 100],
                    {"accepted": False, "failures": ["origin", "expired"], "unexpectedOrigins": ["https://other.test"], "expiredCookies": ["old"], "longLivedCookies": []},
                ),
                (
                    "reports-long-lived-cookie",
                    [{"cookies": [{"name": "session", "expires": 1000}], "origins": []}, [], 100, 200],
                    {"accepted": False, "failures": ["lifetime"], "unexpectedOrigins": [], "expiredCookies": [], "longLivedCookies": ["session"]},
                ),
            ],
            [
                "인증 상태를 재사용하기 전에 origin과 유효 기간을 매번 검사하세요.",
                "테스트 편의를 위해 장기 session을 만들지 말고 필요한 수명만 허용하세요.",
            ],
        ),
        "retrieval": decision(
            "auth-storage-recall",
            "인증 storage 관리 원칙 회상하기",
            "저장·공유·폐기 단계의 비밀 보호 증거를 선택한다.",
            "choose_auth_storage_action",
            {
                "create": {"action": "local isolated profile login", "evidence": "origin and expiry audit", "risk": "credential capture"},
                "share-report": {"action": "redact named secrets", "evidence": "redaction count and manifest", "risk": "unknown secret field"},
                "finish": {"action": "delete state and revoke session", "evidence": "absence and server invalidation", "risk": "orphan session"},
            },
        ),
    },
    "07": {
        "mastery": T(
            "page-object-contract",
            "Page Object의 locator 소유권과 action 계약 감사하기",
            "외부 locator 노출과 assertion 혼합을 찾아 재사용 경계를 판정한다.",
            "audit_page_object(spec)를 완성하세요.",
            "def audit_page_object(spec):\n    raise NotImplementedError",
            """def audit_page_object(spec):
    failures = []
    if not spec.get("actions"):
        failures.append("no-actions")
    exposed = sorted(name for name, visibility in spec.get("locators", {}).items() if visibility == "public")
    if exposed:
        failures.append("public-locators")
    mixed = sorted(action["name"] for action in spec.get("actions", []) if action.get("asserts") and action.get("mutates"))
    if mixed:
        failures.append("mixed-action-assertion")
    return {"reusable": not failures, "failures": failures, "exposedLocators": exposed, "mixedActions": mixed}
""",
            "audit_page_object",
            [
                (
                    "accepts-encapsulated-actions",
                    [{"locators": {"email": "private", "save": "private"}, "actions": [{"name": "fillProfile", "mutates": True, "asserts": False}, {"name": "readNotice", "mutates": False, "asserts": False}]}],
                    {"reusable": True, "failures": [], "exposedLocators": [], "mixedActions": []},
                ),
                (
                    "reports-public-locator-and-mixing",
                    [{"locators": {"submit": "public"}, "actions": [{"name": "submitAndVerify", "mutates": True, "asserts": True}]}],
                    {"reusable": False, "failures": ["public-locators", "mixed-action-assertion"], "exposedLocators": ["submit"], "mixedActions": ["submitAndVerify"]},
                ),
                (
                    "reports-empty-object",
                    [{"locators": {}}],
                    {"reusable": False, "failures": ["no-actions"], "exposedLocators": [], "mixedActions": []},
                ),
            ],
            [
                "Page Object는 locator를 숨기고 사용자의 의미 있는 action을 제공해야 합니다.",
                "상태 변경 action과 기대 결과 assertion을 분리해 실패 원인을 보존하세요.",
            ],
        ),
        "transfer": T(
            "journey-dependency-plan",
            "새 사용자 여정에 action 의존성 계획 전이하기",
            "제공되는 Page Object action만으로 여정이 구성되는지 순서대로 검사한다.",
            "plan_journey(actions, available_actions)를 완성하세요.",
            "def plan_journey(actions, available_actions):\n    raise NotImplementedError",
            """def plan_journey(actions, available_actions):
    available = set(available_actions)
    missing = []
    plan = []
    for index, action in enumerate(actions):
        name = action["action"]
        if name not in available:
            missing.append({"index": index, "action": name})
        else:
            plan.append({"step": index + 1, "object": action["object"], "action": name})
    return {"ready": not missing, "plan": plan, "missing": missing}
""",
            "plan_journey",
            [
                (
                    "plans-known-actions",
                    [[{"object": "LoginPage", "action": "signIn"}, {"object": "OrdersPage", "action": "openOrder"}], ["signIn", "openOrder"]],
                    {"ready": True, "plan": [{"step": 1, "object": "LoginPage", "action": "signIn"}, {"step": 2, "object": "OrdersPage", "action": "openOrder"}], "missing": []},
                ),
                (
                    "reports-missing-middle-action",
                    [[{"object": "A", "action": "open"}, {"object": "B", "action": "delete"}, {"object": "B", "action": "close"}], ["open", "close"]],
                    {"ready": False, "plan": [{"step": 1, "object": "A", "action": "open"}, {"step": 3, "object": "B", "action": "close"}], "missing": [{"index": 1, "action": "delete"}]},
                ),
                (
                    "handles-empty-journey",
                    [[], ["open"]],
                    {"ready": True, "plan": [], "missing": []},
                ),
            ],
            [
                "여정 코드에서 locator를 다시 만들지 말고 공개 action 계약을 사용하세요.",
                "누락 action의 원래 step index를 남겨 설계 책임 위치를 찾으세요.",
            ],
        ),
        "retrieval": decision(
            "page-object-boundary-recall",
            "Page Object 경계 회상하기",
            "locator·action·assertion의 책임 위치를 구분한다.",
            "choose_page_object_boundary",
            {
                "locator-change": {"action": "update inside page object", "evidence": "unchanged journey API", "risk": "locator leakage"},
                "user-action": {"action": "expose intent-named method", "evidence": "stable action contract", "risk": "click-level API"},
                "expected-outcome": {"action": "assert in scenario", "evidence": "business expectation", "risk": "hidden assertion in action"},
            },
        ),
    },
    "08": {
        "mastery": T(
            "pytest-fixture-isolation",
            "pytest 브라우저 fixture 격리 계획 만들기",
            "테스트별 context와 shared mutable state 위험을 판정한다.",
            "audit_fixture_isolation(fixtures, tests)를 완성하세요.",
            "def audit_fixture_isolation(fixtures, tests):\n    raise NotImplementedError",
            """def audit_fixture_isolation(fixtures, tests):
    fixture_map = {fixture["name"]: fixture for fixture in fixtures}
    failures = []
    assignments = []
    for test in tests:
        name = test["fixture"]
        fixture = fixture_map.get(name)
        if fixture is None:
            failures.append({"test": test["id"], "reason": "missing-fixture"})
            continue
        if fixture.get("scope") != "function" and fixture.get("mutable", False):
            failures.append({"test": test["id"], "reason": "shared-mutable-context"})
            continue
        assignments.append({"test": test["id"], "fixture": name})
    return {"isolated": not failures, "assignments": assignments, "failures": failures}
""",
            "audit_fixture_isolation",
            [
                (
                    "accepts-function-context",
                    [[{"name": "context", "scope": "function", "mutable": True}], [{"id": "a", "fixture": "context"}, {"id": "b", "fixture": "context"}]],
                    {"isolated": True, "assignments": [{"test": "a", "fixture": "context"}, {"test": "b", "fixture": "context"}], "failures": []},
                ),
                (
                    "reports-shared-mutable-context",
                    [[{"name": "context", "scope": "session", "mutable": True}], [{"id": "checkout", "fixture": "context"}]],
                    {"isolated": False, "assignments": [], "failures": [{"test": "checkout", "reason": "shared-mutable-context"}]},
                ),
                (
                    "reports-missing-fixture",
                    [[], [{"id": "login", "fixture": "page"}]],
                    {"isolated": False, "assignments": [], "failures": [{"test": "login", "reason": "missing-fixture"}]},
                ),
            ],
            [
                "browser process 재사용과 browser context 상태 공유를 구분하세요.",
                "mutable context는 function scope로 격리해 순서 의존을 제거하세요.",
            ],
        ),
        "transfer": T(
            "test-run-summary",
            "새 pytest 실행 결과에 실패·재시도 감사 전이하기",
            "최종 pass와 최초 실패를 분리해 flaky·quarantine 상태를 보고한다.",
            "summarize_test_run(results)를 완성하세요.",
            "def summarize_test_run(results):\n    raise NotImplementedError",
            """def summarize_test_run(results):
    by_test = {}
    for result in results:
        by_test.setdefault(result["test"], []).append(result["status"])
    flaky = []
    failed = []
    passed = []
    for test, statuses in sorted(by_test.items()):
        if statuses[-1] != "passed":
            failed.append(test)
        elif any(status != "passed" for status in statuses[:-1]):
            flaky.append(test)
        else:
            passed.append(test)
    return {"green": not failed and not flaky, "passed": passed, "flaky": flaky, "failed": failed, "attempts": len(results)}
""",
            "summarize_test_run",
            [
                (
                    "accepts-first-attempt-passes",
                    [[{"test": "a", "status": "passed"}, {"test": "b", "status": "passed"}]],
                    {"green": True, "passed": ["a", "b"], "flaky": [], "failed": [], "attempts": 2},
                ),
                (
                    "reports-retry-pass-as-flaky",
                    [[{"test": "checkout", "status": "failed"}, {"test": "checkout", "status": "passed"}]],
                    {"green": False, "passed": [], "flaky": ["checkout"], "failed": [], "attempts": 2},
                ),
                (
                    "reports-final-failure",
                    [[{"test": "login", "status": "passed"}, {"test": "search", "status": "failed"}, {"test": "search", "status": "failed"}]],
                    {"green": False, "passed": ["login"], "flaky": [], "failed": ["search"], "attempts": 3},
                ),
            ],
            [
                "재시도 뒤 pass를 첫 실행 pass와 같은 green으로 합치지 마세요.",
                "테스트별 attempt 순서를 보존해 flaky 원인을 추적하세요.",
            ],
        ),
        "retrieval": decision(
            "pytest-browser-flow-recall",
            "pytest 브라우저 흐름 회상하기",
            "fixture scope·병렬 실행·retry 결과의 품질 경계를 복원한다.",
            "choose_pytest_browser_policy",
            {
                "mutable-context": {"action": "function-scoped context", "evidence": "fresh storage per test", "risk": "order dependency"},
                "parallel-run": {"action": "unique account and artifact paths", "evidence": "worker identity", "risk": "cross-test collision"},
                "retry-pass": {"action": "mark flaky and retain first trace", "evidence": "all attempts", "risk": "hidden instability"},
            },
        ),
    },
    "09": {
        "mastery": T(
            "trace-failure-diagnosis",
            "trace event에서 최초 원인 후보 진단하기",
            "console·network·assertion 실패를 시간순으로 연결해 가장 이른 원인을 찾는다.",
            "diagnose_trace(events)를 완성하세요.",
            "def diagnose_trace(events):\n    raise NotImplementedError",
            """def diagnose_trace(events):
    ordered = sorted(events, key=lambda event: event["atMs"])
    failures = [event for event in ordered if event.get("level") == "error" or event.get("status", 0) >= 400 or event.get("outcome") == "failed"]
    if not failures:
        return {"failed": False, "firstCause": None, "failureKinds": []}
    first = failures[0]
    kinds = []
    for event in failures:
        if event["kind"] not in kinds:
            kinds.append(event["kind"])
    return {"failed": True, "firstCause": {"kind": first["kind"], "atMs": first["atMs"], "label": first["label"]}, "failureKinds": kinds}
""",
            "diagnose_trace",
            [
                (
                    "finds-network-before-assertion",
                    [[{"kind": "assertion", "atMs": 500, "label": "notice", "outcome": "failed"}, {"kind": "network", "atMs": 200, "label": "GET orders", "status": 500}]],
                    {"failed": True, "firstCause": {"kind": "network", "atMs": 200, "label": "GET orders"}, "failureKinds": ["network", "assertion"]},
                ),
                (
                    "finds-console-error",
                    [[{"kind": "console", "atMs": 30, "label": "boot", "level": "error"}, {"kind": "network", "atMs": 10, "label": "asset", "status": 200}]],
                    {"failed": True, "firstCause": {"kind": "console", "atMs": 30, "label": "boot"}, "failureKinds": ["console"]},
                ),
                (
                    "reports-clean-trace",
                    [[{"kind": "network", "atMs": 10, "label": "api", "status": 200}, {"kind": "assertion", "atMs": 20, "label": "ready", "outcome": "passed"}]],
                    {"failed": False, "firstCause": None, "failureKinds": []},
                ),
            ],
            [
                "마지막 assertion 실패보다 먼저 발생한 network·console 오류를 찾으세요.",
                "시간순 event와 종류별 failure 목록을 함께 남기세요.",
            ],
        ),
        "transfer": T(
            "trace-retention-plan",
            "새 실행 결과에 trace 보존 정책 전이하기",
            "실패·재시도·민감정보 여부로 보존과 redaction 계획을 만든다.",
            "plan_trace_retention(runs)를 완성하세요.",
            "def plan_trace_retention(runs):\n    raise NotImplementedError",
            """def plan_trace_retention(runs):
    retain = []
    discard = []
    redact = []
    seen = {}
    for run in runs:
        seen.setdefault(run["test"], []).append(run)
    for test, attempts in sorted(seen.items()):
        unstable = len(attempts) > 1 and len({attempt["status"] for attempt in attempts}) > 1
        for attempt in attempts:
            key = f"{test}#{attempt['attempt']}"
            if attempt["status"] == "failed" or unstable:
                retain.append(key)
                if attempt.get("containsSecrets"):
                    redact.append(key)
            else:
                discard.append(key)
    return {"retain": retain, "discard": discard, "redact": redact}
""",
            "plan_trace_retention",
            [
                (
                    "keeps-failure-and-redacts-secret",
                    [[{"test": "login", "attempt": 1, "status": "failed", "containsSecrets": True}]],
                    {"retain": ["login#1"], "discard": [], "redact": ["login#1"]},
                ),
                (
                    "keeps-all-flaky-attempts",
                    [[{"test": "search", "attempt": 1, "status": "failed"}, {"test": "search", "attempt": 2, "status": "passed"}]],
                    {"retain": ["search#1", "search#2"], "discard": [], "redact": []},
                ),
                (
                    "discards-stable-pass",
                    [[{"test": "home", "attempt": 1, "status": "passed"}]],
                    {"retain": [], "discard": ["home#1"], "redact": []},
                ),
            ],
            [
                "flaky test는 실패 attempt만이 아니라 이어진 pass trace도 함께 보존하세요.",
                "trace 보존과 비밀 redaction을 별도 결정으로 기록하세요.",
            ],
        ),
        "retrieval": decision(
            "trace-debug-recall",
            "trace 디버깅 순서 회상하기",
            "assertion 실패 전에 확인할 event 근거를 복원한다.",
            "choose_trace_debug_step",
            {
                "blank-page": {"action": "inspect navigation and console first", "evidence": "response chain and boot error", "risk": "asserting absent content only"},
                "missing-data": {"action": "inspect request and response", "evidence": "payload status timing", "risk": "mock mismatch"},
                "flaky-click": {"action": "compare actionability timeline", "evidence": "locator state across attempts", "risk": "retry masking"},
            },
        ),
    },
    "10": {
        "mastery": T(
            "browser-audit-report",
            "종합 브라우저 점검 report 판정하기",
            "필수 scenario·viewport·접근성·network 증거가 모두 있는지 release 전에 감사한다.",
            "audit_browser_report(report, required_scenarios, required_viewports, output_path)를 완성해 release 판정을 반환하고, output_path에는 같은 결과를 한 행짜리 JSON table로 저장하세요.",
            "def audit_browser_report(report, required_scenarios, required_viewports, output_path=None):\n    raise NotImplementedError",
            """import json
from pathlib import Path


def audit_browser_report(report, required_scenarios, required_viewports, output_path=None):
    observed_scenarios = {case["scenario"] for case in report.get("cases", []) if case.get("passed")}
    observed_viewports = {f"{case['width']}x{case['height']}" for case in report.get("cases", []) if case.get("passed")}
    missing_scenarios = sorted(set(required_scenarios) - observed_scenarios)
    missing_viewports = sorted(set(required_viewports) - observed_viewports)
    failures = []
    if missing_scenarios:
        failures.append("scenario-coverage")
    if missing_viewports:
        failures.append("viewport-coverage")
    if report.get("accessibilityViolations", 0) != 0:
        failures.append("accessibility")
    if report.get("unexpectedRequests", 0) != 0:
        failures.append("network")
    result = {"releaseReady": not failures, "failures": failures, "missingScenarios": missing_scenarios, "missingViewports": missing_viewports}
    default_path = "output/ready-browser-audit.json" if result["releaseReady"] else "output/a11y-network-audit.json" if {"accessibility", "network"} & set(failures) else "output/coverage-gap-audit.json"
    target = Path(output_path or default_path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps([result], ensure_ascii=False, sort_keys=True, indent=2), encoding="utf-8")
    return result
""",
            "audit_browser_report",
            [
                (
                    "accepts-complete-report",
                    [{"cases": [{"scenario": "home", "width": 390, "height": 844, "passed": True}, {"scenario": "run", "width": 1440, "height": 900, "passed": True}], "accessibilityViolations": 0, "unexpectedRequests": 0}, ["home", "run"], ["390x844", "1440x900"], "output/ready-browser-audit.json"],
                    {"releaseReady": True, "failures": [], "missingScenarios": [], "missingViewports": []},
                ),
                (
                    "reports-coverage-gaps",
                    [{"cases": [{"scenario": "home", "width": 390, "height": 844, "passed": True}]}, ["home", "error"], ["390x844", "1440x900"], "output/coverage-gap-audit.json"],
                    {"releaseReady": False, "failures": ["scenario-coverage", "viewport-coverage"], "missingScenarios": ["error"], "missingViewports": ["1440x900"]},
                ),
                (
                    "reports-a11y-and-network",
                    [{"cases": [], "accessibilityViolations": 2, "unexpectedRequests": 1}, [], [], "output/a11y-network-audit.json"],
                    {"releaseReady": False, "failures": ["accessibility", "network"], "missingScenarios": [], "missingViewports": []},
                ),
            ],
            [
                "case 수가 아니라 필수 scenario와 viewport 집합을 직접 비교하고 JSON audit에 보존하세요.",
                "시각 통과와 접근성·network 경계를 한 release 판정에 묶으세요.",
            ],
            expectedPaths=[
                {"path": "output/ready-browser-audit.json", "kind": "table", "origin": "created", "format": "json", "columns": ["failures", "missingScenarios", "missingViewports", "releaseReady"]},
                {"path": "output/coverage-gap-audit.json", "kind": "table", "origin": "created", "format": "json", "columns": ["failures", "missingScenarios", "missingViewports", "releaseReady"]},
                {"path": "output/a11y-network-audit.json", "kind": "table", "origin": "created", "format": "json", "columns": ["failures", "missingScenarios", "missingViewports", "releaseReady"]},
            ],
        ),
        "transfer": T(
            "consecutive-release-decision",
            "새 브라우저 audit의 연속 통과 조건 전이하기",
            "같은 source hash에서 연속 green과 증거 freshness를 검사한다.",
            "decide_browser_release(runs, required_consecutive, current_source_hash)를 완성하세요.",
            "def decide_browser_release(runs, required_consecutive, current_source_hash):\n    raise NotImplementedError",
            """def decide_browser_release(runs, required_consecutive, current_source_hash):
    if required_consecutive <= 0:
        raise ValueError("required consecutive must be positive")
    streak = 0
    stale = []
    for run in sorted(runs, key=lambda item: item["sequence"]):
        if run["sourceHash"] != current_source_hash:
            stale.append(run["sequence"])
            continue
        streak = streak + 1 if run["passed"] else 0
    return {"releaseReady": streak >= required_consecutive and not stale, "currentStreak": streak, "staleSequences": stale}
""",
            "decide_browser_release",
            [
                (
                    "accepts-two-current-greens",
                    [[{"sequence": 1, "sourceHash": "abc", "passed": True}, {"sequence": 2, "sourceHash": "abc", "passed": True}], 2, "abc"],
                    {"releaseReady": True, "currentStreak": 2, "staleSequences": []},
                ),
                (
                    "resets-streak-after-failure",
                    [[{"sequence": 1, "sourceHash": "abc", "passed": True}, {"sequence": 2, "sourceHash": "abc", "passed": False}, {"sequence": 3, "sourceHash": "abc", "passed": True}], 2, "abc"],
                    {"releaseReady": False, "currentStreak": 1, "staleSequences": []},
                ),
                (
                    "rejects-stale-evidence",
                    [[{"sequence": 1, "sourceHash": "old", "passed": True}, {"sequence": 2, "sourceHash": "abc", "passed": True}], 1, "abc"],
                    {"releaseReady": False, "currentStreak": 1, "staleSequences": [1]},
                ),
                ("rejects-zero-requirement", [[], 0, "abc"], E("ValueError")),
            ],
            [
                "이전 source의 green report를 현재 release 증거로 합치지 마세요.",
                "마지막 한 번의 pass가 아니라 실패 뒤 다시 쌓인 연속 streak를 보세요.",
            ],
        ),
        "retrieval": decision(
            "browser-audit-capstone-recall",
            "종합 브라우저 점검 종료 조건 회상하기",
            "기능·시각·접근성·안전 증거의 완료 경계를 복원한다.",
            "choose_browser_audit_gate",
            {
                "functional": {"action": "run user-outcome scenarios", "evidence": "semantic assertions and artifacts", "risk": "route-only coverage"},
                "visual-accessible": {"action": "test viewports and accessibility", "evidence": "screenshots axe manual matrix", "risk": "desktop-only green"},
                "release": {"action": "require current consecutive green", "evidence": "source-bound reports", "risk": "stale or flaky pass"},
            },
        ),
    },
}
