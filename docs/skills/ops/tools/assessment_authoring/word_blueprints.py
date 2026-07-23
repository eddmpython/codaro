from __future__ import annotations

from typing import Any

from .common import TaskBlueprint, task


T = task


def recall(
    slug: str,
    title: str,
    goal: str,
    entry: str,
    choices: dict[str, dict[str, Any]],
) -> TaskBlueprint:
    solution = (
        f"def {entry}(stage):\n"
        f"    choices = {choices!r}\n"
        "    if stage not in choices:\n"
        "        raise ValueError('unknown stage')\n"
        "    return choices[stage]\n"
    )
    keys = list(choices)
    return T(
        slug,
        title,
        goal,
        f"{entry}(stage)를 완성해 action, evidence, risk를 반환하세요.",
        f"def {entry}(stage):\n    raise NotImplementedError",
        solution,
        entry,
        [(f"recalls-{key}", [key], choices[key]) for key in keys[:2]]
        + [("recalls-final-stage", [keys[-1]], choices[keys[-1]])],
        [
            "Web에서는 문서 구조와 업무 불변식을 즉시 검증하세요.",
            "Local에서는 저장한 docx를 재개방하고 렌더 결과까지 증거로 남기세요.",
        ],
    )


BLUEPRINTS: dict[str, dict[str, TaskBlueprint]] = {
    "01": {
        "mastery": T(
            "document-plan-contract",
            "Word 문서의 문단 계획과 산출물 계약 감사하기",
            "빈 문단·중복 ID·잘못된 확장자를 저장 전에 차단한다.",
            "audit_document_plan(file_name, paragraphs)를 완성하세요.",
            "def audit_document_plan(file_name, paragraphs):\n    raise NotImplementedError",
            """def audit_document_plan(file_name, paragraphs):
    failures = []
    ids = [item.get("id") for item in paragraphs]
    empty = sorted(item.get("id", "") for item in paragraphs if not str(item.get("text", "")).strip())
    duplicates = sorted({value for value in ids if value and ids.count(value) > 1})
    if not str(file_name).lower().endswith(".docx"):
        failures.append("extension")
    if not paragraphs:
        failures.append("paragraphs")
    if empty:
        failures.append("empty-text")
    if duplicates or any(not value for value in ids):
        failures.append("identity")
    return {"accepted": not failures, "failures": failures, "empty": empty, "duplicates": duplicates, "paragraphCount": len(paragraphs)}
""",
            "audit_document_plan",
            [
                ("accepts-bounded-document", ["report.docx", [{"id": "p1", "text": "제목"}, {"id": "p2", "text": "본문"}]], {"accepted": True, "failures": [], "empty": [], "duplicates": [], "paragraphCount": 2}),
                ("reports-empty-and-duplicate", ["report.docx", [{"id": "p1", "text": " "}, {"id": "p1", "text": "본문"}]], {"accepted": False, "failures": ["empty-text", "identity"], "empty": ["p1"], "duplicates": ["p1"], "paragraphCount": 2}),
                ("reports-extension-and-missing-content", ["report.txt", []], {"accepted": False, "failures": ["extension", "paragraphs"], "empty": [], "duplicates": [], "paragraphCount": 0}),
            ],
            ["문단마다 안정적인 ID와 비어 있지 않은 text를 요구하세요.", "저장 성공은 내용 정확성의 증거가 아니므로 둘을 분리하세요."],
        ),
        "transfer": T(
            "paragraph-reopen-reconciliation",
            "재개방한 문단을 원래 계획과 대조하기",
            "순서·텍스트·누락을 분리해 문서 artifact를 검증한다.",
            "reconcile_paragraphs(planned, observed)를 완성하세요.",
            "def reconcile_paragraphs(planned, observed):\n    raise NotImplementedError",
            """def reconcile_paragraphs(planned, observed):
    planned_map = {item["id"]: item["text"] for item in planned}
    observed_map = {item["id"]: item["text"] for item in observed}
    missing = sorted(set(planned_map) - set(observed_map))
    extra = sorted(set(observed_map) - set(planned_map))
    changed = sorted(key for key in set(planned_map) & set(observed_map) if planned_map[key] != observed_map[key])
    order_match = [item["id"] for item in planned] == [item["id"] for item in observed]
    failures = []
    if missing or extra:
        failures.append("membership")
    if changed:
        failures.append("text")
    if not order_match:
        failures.append("order")
    return {"passed": not failures, "failures": failures, "missing": missing, "extra": extra, "changed": changed, "orderMatch": order_match}
""",
            "reconcile_paragraphs",
            [
                ("accepts-exact-reopen", [[{"id": "a", "text": "A"}, {"id": "b", "text": "B"}], [{"id": "a", "text": "A"}, {"id": "b", "text": "B"}]], {"passed": True, "failures": [], "missing": [], "extra": [], "changed": [], "orderMatch": True}),
                ("reports-text-and-order", [[{"id": "a", "text": "A"}, {"id": "b", "text": "B"}], [{"id": "b", "text": "수정"}, {"id": "a", "text": "A"}]], {"passed": False, "failures": ["text", "order"], "missing": [], "extra": [], "changed": ["b"], "orderMatch": False}),
                ("reports-membership", [[{"id": "a", "text": "A"}], [{"id": "x", "text": "X"}]], {"passed": False, "failures": ["membership", "order"], "missing": ["a"], "extra": ["x"], "changed": [], "orderMatch": False}),
            ],
            ["재개방 결과를 index가 아니라 문단 ID로 먼저 대조하세요.", "구성원·텍스트·순서 실패를 따로 보여 주세요."],
        ),
        "retrieval": recall(
            "document-evidence-recall", "Word 기본 산출물 증거 회상하기", "계획·저장·재개방 검증의 차이를 기억에서 복원한다.", "choose_document_evidence",
            {"plan": {"action": "define paragraph ids and text", "evidence": "document plan", "risk": "ambiguous content"}, "save": {"action": "write bounded docx", "evidence": "path size hash", "risk": "partial artifact"}, "reopen": {"action": "read paragraphs from saved docx", "evidence": "ordered text reconciliation", "risk": "valid package with wrong content"}},
        ),
    },
    "02": {
        "mastery": T(
            "outline-hierarchy-audit", "제목과 목록의 계층 구조 감사하기", "heading level 점프와 고아 목록 항목을 차단한다.", "audit_outline(blocks)를 완성하세요.", "def audit_outline(blocks):\n    raise NotImplementedError",
            """def audit_outline(blocks):
    failures = []
    heading_jumps = []
    orphan_lists = []
    previous_level = 0
    seen_heading = False
    for index, block in enumerate(blocks):
        kind = block.get("kind")
        if kind == "heading":
            level = int(block.get("level", 0))
            if level < 1 or level > 9 or (previous_level and level > previous_level + 1):
                heading_jumps.append(index)
            previous_level = level
            seen_heading = True
        elif kind == "list" and not seen_heading:
            orphan_lists.append(index)
    if not blocks:
        failures.append("empty")
    if heading_jumps:
        failures.append("heading-level")
    if orphan_lists:
        failures.append("orphan-list")
    return {"accepted": not failures, "failures": failures, "headingJumps": heading_jumps, "orphanLists": orphan_lists}
""", "audit_outline",
            [("accepts-readable-outline", [[{"kind": "heading", "level": 1}, {"kind": "heading", "level": 2}, {"kind": "list"}]], {"accepted": True, "failures": [], "headingJumps": [], "orphanLists": []}), ("reports-level-jump", [[{"kind": "heading", "level": 1}, {"kind": "heading", "level": 3}]], {"accepted": False, "failures": ["heading-level"], "headingJumps": [1], "orphanLists": []}), ("reports-orphan-and-empty", [[{"kind": "list"}]], {"accepted": False, "failures": ["orphan-list"], "headingJumps": [], "orphanLists": [0]})],
            ["heading level은 한 단계씩 깊어져야 문서 탐색이 안정적입니다.", "목록은 의미를 주는 앞선 heading 아래에 두세요."],
        ),
        "transfer": T(
            "outline-navigation-map", "다른 보고서의 목차 탐색 맵 만들기", "heading 경로와 목록 번호를 결정론적으로 계산한다.", "build_outline_map(blocks)를 완성하세요.", "def build_outline_map(blocks):\n    raise NotImplementedError",
            """def build_outline_map(blocks):
    path = []
    result = []
    counters = {}
    for block in blocks:
        if block["kind"] == "heading":
            level = block["level"]
            path = path[:level - 1] + [block["text"]]
            counters = {key: value for key, value in counters.items() if key < level}
            result.append({"kind": "heading", "path": " > ".join(path)})
        else:
            level = len(path)
            counters[level] = counters.get(level, 0) + 1
            result.append({"kind": "list", "path": " > ".join(path), "number": counters[level]})
    return result
""", "build_outline_map",
            [("maps-section-list", [[{"kind": "heading", "level": 1, "text": "요약"}, {"kind": "list", "text": "A"}, {"kind": "list", "text": "B"}]], [{"kind": "heading", "path": "요약"}, {"kind": "list", "path": "요약", "number": 1}, {"kind": "list", "path": "요약", "number": 2}]), ("maps-nested-heading", [[{"kind": "heading", "level": 1, "text": "보고"}, {"kind": "heading", "level": 2, "text": "위험"}, {"kind": "list", "text": "R"}]], [{"kind": "heading", "path": "보고"}, {"kind": "heading", "path": "보고 > 위험"}, {"kind": "list", "path": "보고 > 위험", "number": 1}])],
            ["heading stack을 level에 맞춰 잘라 경로를 만드세요.", "번호는 시각적 glyph가 아니라 구조에서 계산하세요."],
        ),
        "retrieval": recall("outline-rule-recall", "Word 개요 구조 원칙 회상하기", "제목·목록·목차의 역할을 구분한다.", "choose_outline_rule", {"heading": {"action": "use semantic heading levels", "evidence": "outline path", "risk": "visual-only hierarchy"}, "list": {"action": "bind items to a section", "evidence": "list parent and order", "risk": "orphan items"}, "navigation": {"action": "inspect generated outline", "evidence": "reopened heading map", "risk": "unscannable document"}}),
    },
    "03": {
        "mastery": T(
            "run-style-audit", "텍스트 run의 스타일과 가독성 감사하기", "의미 없는 과도한 서식과 읽히지 않는 크기를 찾는다.", "audit_runs(runs)를 완성하세요.", "def audit_runs(runs):\n    raise NotImplementedError",
            """def audit_runs(runs):
    failures = []
    empty = sorted(run["id"] for run in runs if not str(run.get("text", "")).strip())
    unreadable = sorted(run["id"] for run in runs if float(run.get("sizePt", 0)) < 9 or float(run.get("sizePt", 0)) > 48)
    noisy = sorted(run["id"] for run in runs if sum(bool(run.get(key)) for key in ["bold", "italic", "underline"]) == 3)
    if empty:
        failures.append("empty")
    if unreadable:
        failures.append("size")
    if noisy:
        failures.append("emphasis")
    return {"accepted": not failures, "failures": failures, "empty": empty, "unreadable": unreadable, "noisy": noisy}
""", "audit_runs",
            [("accepts-bounded-emphasis", [[{"id": "r1", "text": "핵심", "sizePt": 12, "bold": True}]], {"accepted": True, "failures": [], "empty": [], "unreadable": [], "noisy": []}), ("reports-size-and-noise", [[{"id": "r1", "text": "경고", "sizePt": 7, "bold": True, "italic": True, "underline": True}]], {"accepted": False, "failures": ["size", "emphasis"], "empty": [], "unreadable": ["r1"], "noisy": ["r1"]}), ("reports-empty-run", [[{"id": "r0", "text": "", "sizePt": 11}]], {"accepted": False, "failures": ["empty"], "empty": ["r0"], "unreadable": [], "noisy": []})],
            ["강조는 의미를 전달할 때만 한두 축으로 제한하세요.", "본문 run 크기는 렌더 전 최소·최대 범위를 검사하세요."],
        ),
        "transfer": T(
            "style-policy-resolution", "브랜드 토큰을 Word run 스타일로 전이하기", "직접 서식보다 의미 역할 기반의 결정된 스타일을 만든다.", "resolve_run_styles(runs, tokens)를 완성하세요.", "def resolve_run_styles(runs, tokens):\n    raise NotImplementedError",
            """def resolve_run_styles(runs, tokens):
    resolved = []
    missing_roles = []
    for run in runs:
        role = run.get("role", "body")
        if role not in tokens:
            missing_roles.append(role)
            continue
        style = dict(tokens[role])
        style.update(run.get("override", {}))
        resolved.append({"id": run["id"], "role": role, "style": style})
    return {"resolved": resolved, "missingRoles": sorted(set(missing_roles)), "complete": not missing_roles}
""", "resolve_run_styles",
            [("resolves-semantic-token", [[{"id": "a", "role": "body"}], {"body": {"font": "Noto Sans KR", "sizePt": 11}}], {"resolved": [{"id": "a", "role": "body", "style": {"font": "Noto Sans KR", "sizePt": 11}}], "missingRoles": [], "complete": True}), ("applies-explicit-override", [[{"id": "a", "role": "warning", "override": {"bold": True}}], {"warning": {"color": "C62828"}}], {"resolved": [{"id": "a", "role": "warning", "style": {"color": "C62828", "bold": True}}], "missingRoles": [], "complete": True}), ("reports-missing-token", [[{"id": "a", "role": "legal"}], {"body": {"sizePt": 11}}], {"resolved": [], "missingRoles": ["legal"], "complete": False})],
            ["run마다 시각값을 반복하지 말고 의미 role을 먼저 부여하세요.", "명시적 override가 토큰을 덮는 순서를 고정하세요."],
        ),
        "retrieval": recall("text-style-evidence-recall", "텍스트 스타일 검증 원칙 회상하기", "의미·가독성·렌더 검증을 구분한다.", "choose_text_style_evidence", {"semantic": {"action": "map role to style token", "evidence": "role-style manifest", "risk": "inconsistent direct formatting"}, "readability": {"action": "bound size and emphasis", "evidence": "run audit", "risk": "unreadable text"}, "render": {"action": "inspect exported pages", "evidence": "glyph and clipping check", "risk": "correct XML but broken display"}}),
    },
    "04": {
        "mastery": T(
            "word-table-contract", "Word 표의 직사각형 구조와 헤더 계약 감사하기", "행 길이 불일치·빈 헤더·중복 헤더를 차단한다.", "audit_word_table(rows, header_rows=1)를 완성하세요.", "def audit_word_table(rows, header_rows=1):\n    raise NotImplementedError",
            """def audit_word_table(rows, header_rows=1):
    failures = []
    widths = [len(row) for row in rows]
    rectangular = bool(rows) and len(set(widths)) == 1
    headers = rows[0] if rows else []
    empty_headers = [index for index, value in enumerate(headers) if not str(value).strip()]
    duplicate_headers = sorted({str(value) for value in headers if headers.count(value) > 1})
    if not rectangular:
        failures.append("shape")
    if header_rows != 1:
        failures.append("header-count")
    if empty_headers or duplicate_headers:
        failures.append("headers")
    return {"accepted": not failures, "failures": failures, "widths": widths, "emptyHeaders": empty_headers, "duplicateHeaders": duplicate_headers}
""", "audit_word_table",
            [("accepts-rectangular-table", [[ ["상품", "금액"], ["A", 100] ], 1], {"accepted": True, "failures": [], "widths": [2, 2], "emptyHeaders": [], "duplicateHeaders": []}), ("reports-ragged-table", [[["상품", "금액"], ["A"]], 1], {"accepted": False, "failures": ["shape"], "widths": [2, 1], "emptyHeaders": [], "duplicateHeaders": []}), ("reports-header-contract", [[["", "금액", "금액"], ["A", 1, 2]], 2], {"accepted": False, "failures": ["header-count", "headers"], "widths": [3, 3], "emptyHeaders": [0], "duplicateHeaders": ["금액"]})],
            ["Word 표도 먼저 행렬 계약으로 검증한 뒤 렌더하세요.", "헤더는 한 행, 비어 있지 않고 유일하도록 제한하세요."],
        ),
        "transfer": T(
            "table-business-reconciliation", "다른 표의 업무 합계를 재계산해 대조하기", "표시 문자열과 원본 수치의 합계를 분리 검증한다.", "reconcile_table_totals(rows, expected_total)를 완성하세요.", "def reconcile_table_totals(rows, expected_total):\n    raise NotImplementedError",
            """def reconcile_table_totals(rows, expected_total):
    invalid = sorted(row.get("id", "") for row in rows if not isinstance(row.get("amount"), (int, float)) or isinstance(row.get("amount"), bool))
    observed = sum(row["amount"] for row in rows if row.get("id", "") not in invalid)
    delta = round(observed - expected_total, 2)
    return {"passed": not invalid and abs(delta) <= 0.01, "invalidRows": invalid, "observedTotal": observed, "expectedTotal": expected_total, "delta": delta}
""", "reconcile_table_totals",
            [("accepts-reconciled-total", [[{"id": "a", "amount": 100}, {"id": "b", "amount": 50}], 150], {"passed": True, "invalidRows": [], "observedTotal": 150, "expectedTotal": 150, "delta": 0}), ("reports-total-delta", [[{"id": "a", "amount": 100}], 120], {"passed": False, "invalidRows": [], "observedTotal": 100, "expectedTotal": 120, "delta": -20}), ("reports-invalid-value", [[{"id": "a", "amount": "100"}], 100], {"passed": False, "invalidRows": ["a"], "observedTotal": 0, "expectedTotal": 100, "delta": -100})],
            ["표시 형식이 적용되기 전의 numeric value로 합계를 계산하세요.", "허용 오차와 invalid row를 함께 보고하세요."],
        ),
        "retrieval": recall("word-table-evidence-recall", "Word 표 증거 계층 회상하기", "shape·business value·render 검증을 기억에서 복원한다.", "choose_word_table_evidence", {"shape": {"action": "validate rectangular matrix and headers", "evidence": "row widths", "risk": "shifted cells"}, "business": {"action": "recompute source totals", "evidence": "reconciliation delta", "risk": "plausible wrong values"}, "render": {"action": "inspect page geometry", "evidence": "visible rows and headers", "risk": "clipped table"}}),
    },
    "05": {
        "mastery": T(
            "document-media-audit", "이미지·머리말·꼬리말 접근성 계약 감사하기", "누락된 대체 설명과 과도한 이미지 폭을 찾는다.", "audit_document_media(page_width, margins, images, header, footer)를 완성하세요.", "def audit_document_media(page_width, margins, images, header, footer):\n    raise NotImplementedError",
            """def audit_document_media(page_width, margins, images, header, footer):
    usable = page_width - margins[0] - margins[1]
    missing_alt = sorted(image["id"] for image in images if not str(image.get("alt", "")).strip())
    too_wide = sorted(image["id"] for image in images if image.get("width", 0) > usable)
    failures = []
    if usable <= 0:
        failures.append("page-width")
    if missing_alt:
        failures.append("alt-text")
    if too_wide:
        failures.append("image-width")
    if not str(header).strip() or "{page}" not in str(footer):
        failures.append("navigation")
    return {"accepted": not failures, "failures": failures, "usableWidth": usable, "missingAlt": missing_alt, "tooWide": too_wide}
""", "audit_document_media",
            [("accepts-accessible-media", [600, [60, 60], [{"id": "chart", "width": 480, "alt": "월별 매출 막대차트"}], "월간 보고", "{page} / {pages}"], {"accepted": True, "failures": [], "usableWidth": 480, "missingAlt": [], "tooWide": []}), ("reports-alt-width-navigation", [500, [50, 50], [{"id": "hero", "width": 450, "alt": ""}], "", "confidential"], {"accepted": False, "failures": ["alt-text", "image-width", "navigation"], "usableWidth": 400, "missingAlt": ["hero"], "tooWide": ["hero"]}), ("reports-invalid-page", [100, [60, 60], [], "제목", "{page}"], {"accepted": False, "failures": ["page-width"], "usableWidth": -20, "missingAlt": [], "tooWide": []})],
            ["이미지의 alt는 장식 설명이 아니라 전달하는 정보를 적으세요.", "이미지 폭을 page width가 아니라 margin을 뺀 usable width와 비교하세요."],
        ),
        "transfer": T(
            "media-placement-plan", "새 문서의 이미지 배치 계획 만들기", "aspect ratio를 지키며 본문 폭 안의 렌더 크기를 계산한다.", "plan_media_placement(images, usable_width)를 완성하세요.", "def plan_media_placement(images, usable_width):\n    raise NotImplementedError",
            """def plan_media_placement(images, usable_width):
    placed = []
    invalid = []
    for image in images:
        width = image.get("width", 0)
        height = image.get("height", 0)
        if width <= 0 or height <= 0:
            invalid.append(image["id"])
            continue
        render_width = min(width, usable_width)
        render_height = round(height * render_width / width, 2)
        placed.append({"id": image["id"], "width": render_width, "height": render_height, "scaled": render_width != width})
    return {"placements": placed, "invalid": sorted(invalid), "complete": not invalid}
""", "plan_media_placement",
            [("keeps-small-image", [[{"id": "a", "width": 200, "height": 100}], 400], {"placements": [{"id": "a", "width": 200, "height": 100.0, "scaled": False}], "invalid": [], "complete": True}), ("scales-large-image", [[{"id": "a", "width": 800, "height": 400}], 500], {"placements": [{"id": "a", "width": 500, "height": 250.0, "scaled": True}], "invalid": [], "complete": True}), ("reports-invalid-image", [[{"id": "bad", "width": 0, "height": 10}], 500], {"placements": [], "invalid": ["bad"], "complete": False})],
            ["원본 비율을 유지한 render width와 height를 함께 계산하세요.", "잘못된 치수는 조용히 건너뛰지 말고 ID를 보고하세요."],
        ),
        "retrieval": recall("media-accessibility-recall", "Word 이미지·머리말 원칙 회상하기", "접근성·기하·페이지 탐색 증거를 구분한다.", "choose_media_evidence", {"accessibility": {"action": "write informational alt text", "evidence": "image-alt manifest", "risk": "meaning lost to nonvisual reader"}, "geometry": {"action": "fit within usable page width", "evidence": "render dimensions", "risk": "cropped image"}, "navigation": {"action": "add stable header and page fields", "evidence": "rendered page sequence", "risk": "unidentified pages"}}),
    },
    "06": {
        "mastery": T(
            "page-style-contract", "문서 스타일과 페이지 설정 계약 감사하기", "필수 스타일·margin·본문 크기를 한 번에 검증한다.", "audit_page_styles(page, styles, required_styles)를 완성하세요.", "def audit_page_styles(page, styles, required_styles):\n    raise NotImplementedError",
            """def audit_page_styles(page, styles, required_styles):
    failures = []
    missing = sorted(set(required_styles) - set(styles))
    margins = page.get("margins", {})
    bad_margins = sorted(key for key in ["top", "right", "bottom", "left"] if margins.get(key, 0) < 20)
    unreadable = sorted(name for name, style in styles.items() if style.get("sizePt", 0) < 9)
    if missing:
        failures.append("styles")
    if page.get("orientation") not in {"portrait", "landscape"} or bad_margins:
        failures.append("page")
    if unreadable:
        failures.append("readability")
    return {"accepted": not failures, "failures": failures, "missingStyles": missing, "badMargins": bad_margins, "unreadableStyles": unreadable}
""", "audit_page_styles",
            [("accepts-style-system", [{"orientation": "portrait", "margins": {"top": 40, "right": 40, "bottom": 40, "left": 40}}, {"Body": {"sizePt": 11}, "Heading 1": {"sizePt": 18}}, ["Body", "Heading 1"]], {"accepted": True, "failures": [], "missingStyles": [], "badMargins": [], "unreadableStyles": []}), ("reports-missing-and-page", [{"orientation": "square", "margins": {"top": 10, "right": 40, "bottom": 40, "left": 5}}, {"Body": {"sizePt": 11}}, ["Body", "Heading 1"]], {"accepted": False, "failures": ["styles", "page"], "missingStyles": ["Heading 1"], "badMargins": ["left", "top"], "unreadableStyles": []}), ("reports-unreadable-style", [{"orientation": "landscape", "margins": {"top": 30, "right": 30, "bottom": 30, "left": 30}}, {"Body": {"sizePt": 7}}, ["Body"]], {"accepted": False, "failures": ["readability"], "missingStyles": [], "badMargins": [], "unreadableStyles": ["Body"]})],
            ["스타일 존재 여부와 실제 size·font 값을 모두 검사하세요.", "margin과 orientation은 렌더 면적 계약의 일부입니다."],
        ),
        "transfer": T(
            "style-usage-reconciliation", "재개방한 문서의 style 사용을 정책과 대조하기", "정의된 스타일과 실제 사용된 스타일의 차이를 찾는다.", "reconcile_style_usage(defined, paragraphs, allowed_direct_format_ids)를 완성하세요.", "def reconcile_style_usage(defined, paragraphs, allowed_direct_format_ids):\n    raise NotImplementedError",
            """def reconcile_style_usage(defined, paragraphs, allowed_direct_format_ids):
    undefined = sorted(item["id"] for item in paragraphs if item.get("style") not in defined)
    direct = sorted(item["id"] for item in paragraphs if item.get("directFormatting") and item["id"] not in allowed_direct_format_ids)
    unused = sorted(set(defined) - {item.get("style") for item in paragraphs})
    failures = []
    if undefined:
        failures.append("undefined-style")
    if direct:
        failures.append("direct-formatting")
    return {"passed": not failures, "failures": failures, "undefined": undefined, "unapprovedDirect": direct, "unusedStyles": unused}
""", "reconcile_style_usage",
            [("accepts-policy-usage", [["Body", "Heading 1"], [{"id": "p1", "style": "Heading 1"}, {"id": "p2", "style": "Body"}], []], {"passed": True, "failures": [], "undefined": [], "unapprovedDirect": [], "unusedStyles": []}), ("reports-undefined-and-direct", [["Body"], [{"id": "p1", "style": "Custom", "directFormatting": True}], []], {"passed": False, "failures": ["undefined-style", "direct-formatting"], "undefined": ["p1"], "unapprovedDirect": ["p1"], "unusedStyles": ["Body"]}), ("allows-explicit-exception", [["Body", "Caption"], [{"id": "p1", "style": "Body", "directFormatting": True}], ["p1"]], {"passed": True, "failures": [], "undefined": [], "unapprovedDirect": [], "unusedStyles": ["Caption"]})],
            ["문단의 style name을 재개방 결과에서 수집하세요.", "직접 서식 예외는 문단 ID allowlist로 제한하세요."],
        ),
        "retrieval": recall("page-style-recall", "Word 스타일 시스템 원칙 회상하기", "정의·사용·렌더의 서로 다른 증거를 복원한다.", "choose_page_style_evidence", {"define": {"action": "declare semantic named styles", "evidence": "style token table", "risk": "format drift"}, "use": {"action": "audit paragraph style references", "evidence": "style usage manifest", "risk": "hidden direct formatting"}, "render": {"action": "inspect pages at target size", "evidence": "clipping and readability check", "risk": "valid styles with poor pages"}}),
    },
    "07": {
        "mastery": T(
            "document-patch-plan", "기존 문서 수정 계획의 대상과 안전장치 감사하기", "모호한 대상·원본 덮어쓰기·검증 없는 patch를 차단한다.", "audit_patch_plan(plan)를 완성하세요.", "def audit_patch_plan(plan):\n    raise NotImplementedError",
            """def audit_patch_plan(plan):
    required = {"sourceHash", "outputPath", "operations", "reopenVerification"}
    missing = sorted(required - set(plan))
    failures = []
    ambiguous = sorted(op.get("id", "") for op in plan.get("operations", []) if op.get("matchCount") != 1)
    if plan.get("outputPath") == plan.get("sourcePath"):
        failures.append("overwrite")
    if ambiguous:
        failures.append("ambiguous-target")
    if not plan.get("reopenVerification", False):
        failures.append("reopen")
    return {"ready": not missing and not failures, "missing": missing, "failures": failures, "ambiguousOperations": ambiguous}
""", "audit_patch_plan",
            [("accepts-versioned-patch", [{"sourcePath": "v1.docx", "sourceHash": "sha256:a", "outputPath": "v2.docx", "operations": [{"id": "op1", "matchCount": 1}], "reopenVerification": True}], {"ready": True, "missing": [], "failures": [], "ambiguousOperations": []}), ("reports-overwrite-and-ambiguity", [{"sourcePath": "report.docx", "sourceHash": "sha256:a", "outputPath": "report.docx", "operations": [{"id": "op1", "matchCount": 2}], "reopenVerification": True}], {"ready": False, "missing": [], "failures": ["overwrite", "ambiguous-target"], "ambiguousOperations": ["op1"]}), ("reports-missing-and-reopen", [{"sourcePath": "a.docx", "outputPath": "b.docx", "operations": [], "reopenVerification": False}], {"ready": False, "missing": ["sourceHash"], "failures": ["reopen"], "ambiguousOperations": []})],
            ["수정 전에 원본 hash와 새 output path를 고정하세요.", "문자열 match count가 정확히 1인지 먼저 검사하세요."],
        ),
        "transfer": T(
            "document-change-diff", "수정 전후 문서의 의미 diff 계산하기", "문단 ID 기준으로 추가·삭제·변경을 분류한다.", "document_diff(before, after)를 완성하세요.", "def document_diff(before, after):\n    raise NotImplementedError",
            """def document_diff(before, after):
    old = {item["id"]: item["text"] for item in before}
    new = {item["id"]: item["text"] for item in after}
    added = sorted(set(new) - set(old))
    removed = sorted(set(old) - set(new))
    changed = sorted(key for key in set(old) & set(new) if old[key] != new[key])
    unchanged = sorted(key for key in set(old) & set(new) if old[key] == new[key])
    return {"added": added, "removed": removed, "changed": changed, "unchanged": unchanged, "changeCount": len(added) + len(removed) + len(changed)}
""", "document_diff",
            [("reports-bounded-change", [[{"id": "a", "text": "A"}, {"id": "b", "text": "B"}], [{"id": "a", "text": "A"}, {"id": "b", "text": "B2"}, {"id": "c", "text": "C"}]], {"added": ["c"], "removed": [], "changed": ["b"], "unchanged": ["a"], "changeCount": 2}), ("reports-removal", [[{"id": "a", "text": "A"}], []], {"added": [], "removed": ["a"], "changed": [], "unchanged": [], "changeCount": 1}), ("reports-no-change", [[{"id": "a", "text": "A"}], [{"id": "a", "text": "A"}]], {"added": [], "removed": [], "changed": [], "unchanged": ["a"], "changeCount": 0})],
            ["위치 index 대신 안정적인 문단 ID로 비교하세요.", "예상 change count를 release 계약에 포함하세요."],
        ),
        "retrieval": recall("document-edit-recall", "기존 문서 수정 안전 원칙 회상하기", "원본 고정·대상 식별·diff 검증을 구분한다.", "choose_edit_evidence", {"source": {"action": "pin source hash and version", "evidence": "immutable input manifest", "risk": "editing stale input"}, "target": {"action": "require one exact match", "evidence": "operation match count", "risk": "wrong paragraph changed"}, "diff": {"action": "compare semantic before and after", "evidence": "bounded change set", "risk": "collateral edits"}}),
    },
    "08": {
        "mastery": T(
            "mail-merge-recipient-audit", "CSV 메일머지 수신자 데이터 감사하기", "중복 identity·누락 필드·허용 없는 민감정보를 차단한다.", "audit_merge_rows(rows, required_fields, consented_ids)를 완성하세요.", "def audit_merge_rows(rows, required_fields, consented_ids):\n    raise NotImplementedError",
            """def audit_merge_rows(rows, required_fields, consented_ids):
    ids = [row.get("recipientId") for row in rows]
    duplicates = sorted({value for value in ids if value and ids.count(value) > 1})
    missing = sorted(row.get("recipientId", "") for row in rows if any(not str(row.get(field, "")).strip() for field in required_fields))
    unconsented = sorted(row.get("recipientId", "") for row in rows if row.get("sensitive") and row.get("recipientId") not in consented_ids)
    failures = []
    if duplicates or any(not value for value in ids):
        failures.append("identity")
    if missing:
        failures.append("required-fields")
    if unconsented:
        failures.append("consent")
    return {"accepted": not failures, "failures": failures, "duplicates": duplicates, "missing": missing, "unconsented": unconsented}
""", "audit_merge_rows",
            [("accepts-consented-rows", [[{"recipientId": "u1", "name": "민수", "sensitive": True}], ["name"], ["u1"]], {"accepted": True, "failures": [], "duplicates": [], "missing": [], "unconsented": []}), ("reports-duplicate-and-missing", [[{"recipientId": "u1", "name": ""}, {"recipientId": "u1", "name": "영희"}], ["name"], []], {"accepted": False, "failures": ["identity", "required-fields"], "duplicates": ["u1"], "missing": ["u1"], "unconsented": []}), ("reports-consent", [[{"recipientId": "u2", "name": "A", "sensitive": True}], ["name"], []], {"accepted": False, "failures": ["consent"], "duplicates": [], "missing": [], "unconsented": ["u2"]})],
            ["이름이 아니라 안정적인 recipientId로 중복과 consent를 검사하세요.", "병합 전에 필수 placeholder 입력이 모두 채워졌는지 확인하세요."],
        ),
        "transfer": T(
            "mail-merge-manifest-reconcile", "생성된 개인화 문서를 수신자 원장과 대조하기", "누락·중복·잘못된 source hash를 검출한다.", "reconcile_merge_manifest(recipients, artifacts, source_hash)를 완성하세요.", "def reconcile_merge_manifest(recipients, artifacts, source_hash):\n    raise NotImplementedError",
            """def reconcile_merge_manifest(recipients, artifacts, source_hash):
    expected = set(recipients)
    observed_ids = [item.get("recipientId") for item in artifacts]
    observed = set(observed_ids)
    missing = sorted(expected - observed)
    extra = sorted(observed - expected)
    duplicates = sorted({value for value in observed_ids if value and observed_ids.count(value) > 1})
    stale = sorted(item.get("recipientId", "") for item in artifacts if item.get("sourceHash") != source_hash)
    failures = []
    if missing or extra or duplicates:
        failures.append("cardinality")
    if stale:
        failures.append("source")
    return {"passed": not failures, "failures": failures, "missing": missing, "extra": extra, "duplicates": duplicates, "stale": stale}
""", "reconcile_merge_manifest",
            [("accepts-one-per-recipient", [["u1", "u2"], [{"recipientId": "u1", "sourceHash": "h"}, {"recipientId": "u2", "sourceHash": "h"}], "h"], {"passed": True, "failures": [], "missing": [], "extra": [], "duplicates": [], "stale": []}), ("reports-missing-and-duplicate", [["u1", "u2"], [{"recipientId": "u1", "sourceHash": "h"}, {"recipientId": "u1", "sourceHash": "h"}], "h"], {"passed": False, "failures": ["cardinality"], "missing": ["u2"], "extra": [], "duplicates": ["u1"], "stale": []}), ("reports-extra-and-stale", [["u1"], [{"recipientId": "u1", "sourceHash": "old"}, {"recipientId": "u3", "sourceHash": "h"}], "h"], {"passed": False, "failures": ["cardinality", "source"], "missing": [], "extra": ["u3"], "duplicates": [], "stale": ["u1"]})],
            ["수신자마다 정확히 하나의 artifact가 생성됐는지 원장으로 검증하세요.", "개인정보 원문 대신 recipientId와 source hash만 증거에 남기세요."],
        ),
        "retrieval": recall("mail-merge-safety-recall", "메일머지 안전 원칙 회상하기", "입력 승인·개인화·산출물 원장을 기억에서 복원한다.", "choose_merge_evidence", {"admission": {"action": "validate identity fields and consent", "evidence": "redacted recipient audit", "risk": "unauthorized personalization"}, "render": {"action": "resolve placeholders per recipient", "evidence": "placeholder completeness", "risk": "cross-recipient leakage"}, "release": {"action": "reconcile one artifact per identity", "evidence": "hashed output manifest", "risk": "missing or duplicate letters"}}),
    },
    "09": {
        "mastery": T(
            "template-placeholder-audit", "docxtpl placeholder 계약 감사하기", "미정의·미사용·민감 placeholder를 렌더 전에 찾는다.", "audit_placeholders(template_fields, context, allowed_sensitive_fields)를 완성하세요.", "def audit_placeholders(template_fields, context, allowed_sensitive_fields):\n    raise NotImplementedError",
            """def audit_placeholders(template_fields, context, allowed_sensitive_fields):
    fields = set(template_fields)
    keys = set(context)
    missing = sorted(fields - keys)
    extra = sorted(keys - fields)
    sensitive = sorted(key for key in keys if key.lower() in {"password", "token", "secret", "ssn"} and key not in allowed_sensitive_fields)
    failures = []
    if missing:
        failures.append("missing-context")
    if extra:
        failures.append("unused-context")
    if sensitive:
        failures.append("sensitive-field")
    return {"accepted": not failures, "failures": failures, "missing": missing, "extra": extra, "sensitive": sensitive}
""", "audit_placeholders",
            [("accepts-complete-context", [["name", "date"], {"name": "A", "date": "2026-07-22"}, []], {"accepted": True, "failures": [], "missing": [], "extra": [], "sensitive": []}), ("reports-missing-and-extra", [["name", "date"], {"name": "A", "note": "N"}, []], {"accepted": False, "failures": ["missing-context", "unused-context"], "missing": ["date"], "extra": ["note"], "sensitive": []}), ("reports-sensitive-key", [["name", "token"], {"name": "A", "token": "raw"}, []], {"accepted": False, "failures": ["sensitive-field"], "missing": [], "extra": [], "sensitive": ["token"]})],
            ["template field 집합과 context key 집합을 양방향 비교하세요.", "민감 필드는 명시적 allowlist 없이는 템플릿 context에 넣지 마세요."],
        ),
        "transfer": T(
            "template-render-audit", "다른 템플릿의 렌더 결과 완전성 검증하기", "남은 placeholder·필수 문구·페이지 수를 함께 검사한다.", "audit_template_render(text, required_phrases, page_count, max_pages)를 완성하세요.", "def audit_template_render(text, required_phrases, page_count, max_pages):\n    raise NotImplementedError",
            r"""def audit_template_render(text, required_phrases, page_count, max_pages):
    import re
    unresolved = sorted(set(re.findall(r"{{\s*([^{}]+?)\s*}}", text)))
    missing_phrases = sorted(phrase for phrase in required_phrases if phrase not in text)
    failures = []
    if unresolved:
        failures.append("placeholders")
    if missing_phrases:
        failures.append("required-text")
    if page_count < 1 or page_count > max_pages:
        failures.append("pagination")
    return {"passed": not failures, "failures": failures, "unresolved": unresolved, "missingPhrases": missing_phrases, "pageCount": page_count}
""", "audit_template_render",
            [("accepts-complete-render", ["계약서\n고객 A\n서명", ["계약서", "서명"], 2, 3], {"passed": True, "failures": [], "unresolved": [], "missingPhrases": [], "pageCount": 2}), ("reports-placeholder-and-text", ["고객 {{ name }}", ["서명"], 1, 2], {"passed": False, "failures": ["placeholders", "required-text"], "unresolved": ["name"], "missingPhrases": ["서명"], "pageCount": 1}), ("reports-pagination", ["완료", [], 5, 3], {"passed": False, "failures": ["pagination"], "unresolved": [], "missingPhrases": [], "pageCount": 5})],
            ["렌더 뒤 `{{ ... }}` 잔여 패턴을 자동 검사하세요.", "XML 텍스트뿐 아니라 실제 페이지 수와 필수 문구를 검증하세요."],
        ),
        "retrieval": recall("template-release-recall", "Word 템플릿 릴리스 원칙 회상하기", "schema·context·render 검증을 기억에서 복원한다.", "choose_template_evidence", {"schema": {"action": "extract template field set", "evidence": "placeholder schema", "risk": "unknown inputs"}, "context": {"action": "allow only required safe keys", "evidence": "context audit", "risk": "secret leakage"}, "render": {"action": "scan text and pages after render", "evidence": "placeholder and pagination report", "risk": "unfinished document"}}),
    },
    "10": {
        "mastery": T(
            "meeting-action-audit", "회의록 action item의 책임·기한 계약 감사하기", "담당자·기한·결정 근거가 없는 실행 항목을 차단한다.", "audit_meeting_actions(actions, attendee_ids, meeting_date)를 완성하세요.", "def audit_meeting_actions(actions, attendee_ids, meeting_date):\n    raise NotImplementedError",
            """def audit_meeting_actions(actions, attendee_ids, meeting_date):
    from datetime import date
    meeting = date.fromisoformat(meeting_date)
    failures = []
    unknown_owner = sorted(item["id"] for item in actions if item.get("ownerId") not in attendee_ids)
    missing_decision = sorted(item["id"] for item in actions if not str(item.get("decisionRef", "")).strip())
    invalid_due = []
    for item in actions:
        try:
            due = date.fromisoformat(item.get("dueDate", ""))
            if due < meeting:
                invalid_due.append(item["id"])
        except ValueError:
            invalid_due.append(item["id"])
    invalid_due.sort()
    if unknown_owner:
        failures.append("owner")
    if invalid_due:
        failures.append("due-date")
    if missing_decision:
        failures.append("decision-ref")
    return {"accepted": not failures, "failures": failures, "unknownOwner": unknown_owner, "invalidDue": invalid_due, "missingDecision": missing_decision}
""", "audit_meeting_actions",
            [("accepts-owned-action", [[{"id": "a1", "ownerId": "u1", "dueDate": "2026-07-25", "decisionRef": "d1"}], ["u1"], "2026-07-22"], {"accepted": True, "failures": [], "unknownOwner": [], "invalidDue": [], "missingDecision": []}), ("reports-owner-and-due", [[{"id": "a1", "ownerId": "u2", "dueDate": "2026-07-20", "decisionRef": "d1"}], ["u1"], "2026-07-22"], {"accepted": False, "failures": ["owner", "due-date"], "unknownOwner": ["a1"], "invalidDue": ["a1"], "missingDecision": []}), ("reports-date-and-decision", [[{"id": "a2", "ownerId": "u1", "dueDate": "soon", "decisionRef": ""}], ["u1"], "2026-07-22"], {"accepted": False, "failures": ["due-date", "decision-ref"], "unknownOwner": [], "invalidDue": ["a2"], "missingDecision": ["a2"]})],
            ["action item은 참석자 identity, ISO due date, decision ref를 함께 가져야 합니다.", "회의일 이전 기한과 파싱 불가능한 기한을 모두 실패로 보고하세요."],
        ),
        "transfer": T(
            "meeting-minutes-release", "회의록 생성기의 릴리스 원장 검증하기", "입력 회의와 docx artifact·action 수·렌더 상태를 대조한다.", "audit_minutes_release(source, artifact)를 완성하세요.", "def audit_minutes_release(source, artifact):\n    raise NotImplementedError",
            """def audit_minutes_release(source, artifact):
    failures = []
    if artifact.get("meetingId") != source.get("meetingId") or artifact.get("sourceHash") != source.get("sourceHash"):
        failures.append("source-identity")
    if artifact.get("actionCount") != len(source.get("actions", [])):
        failures.append("action-count")
    if not artifact.get("reopened"):
        failures.append("reopen")
    if not artifact.get("rendered") or artifact.get("pageCount", 0) < 1:
        failures.append("render")
    return {"released": not failures, "failures": failures, "meetingId": artifact.get("meetingId"), "expectedActions": len(source.get("actions", [])), "observedActions": artifact.get("actionCount")}
""", "audit_minutes_release",
            [("accepts-verified-minutes", [{"meetingId": "m1", "sourceHash": "h", "actions": [{"id": "a"}]}, {"meetingId": "m1", "sourceHash": "h", "actionCount": 1, "reopened": True, "rendered": True, "pageCount": 2}], {"released": True, "failures": [], "meetingId": "m1", "expectedActions": 1, "observedActions": 1}), ("reports-identity-and-count", [{"meetingId": "m1", "sourceHash": "h", "actions": []}, {"meetingId": "m2", "sourceHash": "old", "actionCount": 1, "reopened": True, "rendered": True, "pageCount": 1}], {"released": False, "failures": ["source-identity", "action-count"], "meetingId": "m2", "expectedActions": 0, "observedActions": 1}), ("reports-artifact-evidence", [{"meetingId": "m1", "sourceHash": "h", "actions": []}, {"meetingId": "m1", "sourceHash": "h", "actionCount": 0, "reopened": False, "rendered": False, "pageCount": 0}], {"released": False, "failures": ["reopen", "render"], "meetingId": "m1", "expectedActions": 0, "observedActions": 0})],
            ["source meetingId와 hash를 artifact manifest에 묶으세요.", "재개방과 페이지 렌더가 둘 다 통과해야 릴리스하세요."],
        ),
        "retrieval": recall("meeting-minutes-recall", "회의록 자동화 릴리스 원칙 회상하기", "의사결정·실행 항목·artifact 증거를 복원한다.", "choose_minutes_evidence", {"decision": {"action": "record stable decision ids", "evidence": "decision ledger", "risk": "context-free actions"}, "action": {"action": "bind owner due date and decision", "evidence": "action contract audit", "risk": "unowned work"}, "release": {"action": "reopen and render source-bound docx", "evidence": "minutes release manifest", "risk": "wrong or unreadable minutes"}}),
    },
}
