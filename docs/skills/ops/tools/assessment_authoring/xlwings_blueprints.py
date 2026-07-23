from __future__ import annotations

from typing import Any

from .common import TaskBlueprint, raises, task


T = task
E = raises


def recall(slug: str, title: str, goal: str, entry: str, table: dict[str, dict[str, Any]]) -> TaskBlueprint:
    solution = (
        f"def {entry}(stage):\n"
        f"    table = {table!r}\n"
        "    if stage not in table:\n"
        "        raise ValueError('unknown stage')\n"
        "    return table[stage]\n"
    )
    keys = list(table)
    return T(
        slug,
        title,
        goal,
        f"{entry}(stage)를 완성해 action, evidence, risk를 반환하세요.",
        f"def {entry}(stage):\n    raise NotImplementedError",
        solution,
        entry,
        [(f"recalls-{key}", [key], table[key]) for key in keys],
        ["Web에서는 Excel 자동화 판단을 작은 함수로 즉시 검증하세요.", "Local에서는 실제 Excel 프로세스와 workbook artifact 증거를 별도로 남기세요."],
    )


BLUEPRINTS: dict[str, dict[str, TaskBlueprint]] = {
    "00": {
        "mastery": T(
            "xlwings-capability-contract", "xlwings 작업의 Desktop Excel capability 계약 세우기", "Desktop Excel runtime·interactive session·macro 요구를 명시적으로 분류한다.", "plan_xlwings_runtime(requirements, capabilities)를 완성하세요.", "def plan_xlwings_runtime(requirements, capabilities):\n    raise NotImplementedError",
            """def plan_xlwings_runtime(requirements, capabilities):
    required = []
    if requirements.get("desktopWorkbook"):
        required.extend(["desktopExcel", "xlwings"])
    if requirements.get("interactiveSession"):
        required.append("interactiveSession")
    if requirements.get("macro"):
        required.append("macroExecution")
    required = list(dict.fromkeys(required))
    missing = sorted(item for item in required if not capabilities.get(item, False))
    return {"tier": "local" if required else "web", "required": required, "missing": missing, "runnable": not missing, "webPractice": ["workbook identity", "range contract", "business reconciliation"]}
""", "plan_xlwings_runtime",
            [("keeps-concepts-on-web", [{}, {}], {"tier": "web", "required": [], "missing": [], "runnable": True, "webPractice": ["workbook identity", "range contract", "business reconciliation"]}), ("accepts-local-capabilities", [{"desktopWorkbook": True}, {"desktopExcel": True, "xlwings": True}], {"tier": "local", "required": ["desktopExcel", "xlwings"], "missing": [], "runnable": True, "webPractice": ["workbook identity", "range contract", "business reconciliation"]}), ("reports-macro-capability", [{"desktopWorkbook": True, "macro": True}, {"desktopExcel": True, "xlwings": True}], {"tier": "local", "required": ["desktopExcel", "xlwings", "macroExecution"], "missing": ["macroExecution"], "runnable": False, "webPractice": ["workbook identity", "range contract", "business reconciliation"]})],
            ["실제 Excel 자동화에 필요한 capability를 작업 요구에서 파생하세요.", "패키지 설치 여부와 Desktop Excel 존재 여부를 한 항목으로 뭉치지 마세요."],
        ),
        "transfer": T(
            "automation-boundary-plan", "새 Excel 업무의 Web·Local 경계 계획하기", "판단 단계와 외부 효과 단계를 분리해 실행 그래프를 만든다.", "split_excel_workflow(steps)를 완성하세요.", "def split_excel_workflow(steps):\n    raise NotImplementedError",
            """def split_excel_workflow(steps):
    local_effects = {"open-excel", "write-workbook", "run-macro", "render-chart"}
    web = [step["id"] for step in steps if step.get("effect") not in local_effects]
    local = [step["id"] for step in steps if step.get("effect") in local_effects]
    unsafe = sorted(step["id"] for step in steps if step.get("effect") in local_effects and not step.get("evidence"))
    return {"webSteps": web, "localSteps": local, "unsafeLocal": unsafe, "ready": not unsafe}
""", "split_excel_workflow",
            [("splits-contract-and-artifact", [[{"id": "validate", "effect": "pure"}, {"id": "write", "effect": "write-workbook", "evidence": "reopen"}]], {"webSteps": ["validate"], "localSteps": ["write"], "unsafeLocal": [], "ready": True}), ("reports-unevidenced-effect", [[{"id": "macro", "effect": "run-macro"}]], {"webSteps": [], "localSteps": ["macro"], "unsafeLocal": ["macro"], "ready": False}), ("keeps-data-shape-portable", [[{"id": "shape", "effect": "range-shape"}]], {"webSteps": ["shape"], "localSteps": [], "unsafeLocal": [], "ready": True})],
            ["순수 판단 단계는 다운로드 없이 Web에서 연습 가능하게 두세요.", "외부 효과 단계마다 재개방·로그·스크린샷 같은 증거를 요구하세요."],
        ),
        "retrieval": recall("xlwings-runtime-recall", "xlwings 실행 계층 원칙 회상하기", "Web 판단과 Local Excel 효과를 구분한다.", "choose_xlwings_runtime_evidence", {"web": {"action": "validate portable automation contract", "evidence": "behavior cases", "risk": "concept tied to one machine"}, "local": {"action": "control identified Excel session", "evidence": "process and workbook identity", "risk": "wrong instance"}, "artifact": {"action": "save reopen and reconcile workbook", "evidence": "artifact manifest", "risk": "successful call with wrong file"}}),
    },
    "01": {
        "mastery": T(
            "excel-session-identity", "Excel app·workbook 연결의 정체성 감사하기", "여러 인스턴스와 동명이 workbook에서 잘못된 대상을 차단한다.", "select_excel_session(sessions, expected_pid, expected_path)를 완성하세요.", "def select_excel_session(sessions, expected_pid, expected_path):\n    raise NotImplementedError",
            """def select_excel_session(sessions, expected_pid, expected_path):
    matches = [item for item in sessions if item.get("pid") == expected_pid and item.get("workbookPath", "").lower() == expected_path.lower()]
    if len(matches) != 1:
        return {"selected": None, "matchCount": len(matches), "ready": False}
    selected = matches[0]
    return {"selected": {"pid": selected["pid"], "workbookPath": selected["workbookPath"]}, "matchCount": 1, "ready": True}
""", "select_excel_session",
            [("selects-exact-session", [[{"pid": 10, "workbookPath": "C:/work/report.xlsx"}], 10, "c:/work/report.xlsx"], {"selected": {"pid": 10, "workbookPath": "C:/work/report.xlsx"}, "matchCount": 1, "ready": True}), ("rejects-name-only-collision", [[{"pid": 10, "workbookPath": "C:/a/report.xlsx"}, {"pid": 11, "workbookPath": "D:/b/report.xlsx"}], 10, "D:/b/report.xlsx"], {"selected": None, "matchCount": 0, "ready": False}), ("rejects-duplicate-session-record", [[{"pid": 10, "workbookPath": "a.xlsx"}, {"pid": 10, "workbookPath": "a.xlsx"}], 10, "a.xlsx"], {"selected": None, "matchCount": 2, "ready": False})],
            ["PID와 정규화된 절대 workbook path를 함께 비교하세요.", "일치 항목이 정확히 하나가 아니면 자동화를 시작하지 마세요."],
        ),
        "transfer": T(
            "app-lifecycle-plan", "새 Excel 세션의 수명주기 계획 전이하기", "자신이 만든 app만 종료하도록 ownership을 계산한다.", "plan_app_cleanup(created_app, opened_workbook, save_requested)를 완성하세요.", "def plan_app_cleanup(created_app, opened_workbook, save_requested):\n    raise NotImplementedError",
            """def plan_app_cleanup(created_app, opened_workbook, save_requested):
    actions = []
    if opened_workbook and save_requested:
        actions.append("save-workbook")
    if opened_workbook:
        actions.append("close-owned-workbook")
    if created_app:
        actions.append("quit-owned-app")
    return {"actions": actions, "mayQuitExcel": bool(created_app), "mayCloseWorkbook": bool(opened_workbook)}
""", "plan_app_cleanup",
            [("cleans-owned-session", [True, True, True], {"actions": ["save-workbook", "close-owned-workbook", "quit-owned-app"], "mayQuitExcel": True, "mayCloseWorkbook": True}), ("preserves-borrowed-app", [False, True, False], {"actions": ["close-owned-workbook"], "mayQuitExcel": False, "mayCloseWorkbook": True}), ("does-nothing-with-borrowed-state", [False, False, True], {"actions": [], "mayQuitExcel": False, "mayCloseWorkbook": False})],
            ["created_here ownership을 app과 workbook 각각 기록하세요.", "사용자가 열어 둔 Excel 전체를 quit하지 마세요."],
        ),
        "retrieval": recall("excel-session-recall", "Excel 연결 안전 원칙 회상하기", "대상 선택·ownership·cleanup 증거를 복원한다.", "choose_session_evidence", {"select": {"action": "match pid and absolute workbook path", "evidence": "single target record", "risk": "wrong workbook"}, "own": {"action": "record who created app and workbook", "evidence": "ownership flags", "risk": "closing user work"}, "cleanup": {"action": "close only owned resources", "evidence": "ordered cleanup log", "risk": "orphan Excel process"}}),
    },
    "02": {
        "mastery": T(
            "range-write-shape", "가격표 range 쓰기의 행렬 shape 감사하기", "ragged row·빈 header·범위 크기 불일치를 차단한다.", "audit_range_write(start_row, start_col, values, target_rows, target_cols)를 완성하세요.", "def audit_range_write(start_row, start_col, values, target_rows, target_cols):\n    raise NotImplementedError",
            """def audit_range_write(start_row, start_col, values, target_rows, target_cols):
    widths = [len(row) for row in values]
    rows = len(values)
    cols = widths[0] if values and len(set(widths)) == 1 else 0
    failures = []
    if start_row < 1 or start_col < 1:
        failures.append("origin")
    if not values or len(set(widths)) != 1:
        failures.append("shape")
    if rows != target_rows or cols != target_cols:
        failures.append("target")
    if values and any(not str(value).strip() for value in values[0]):
        failures.append("headers")
    return {"accepted": not failures, "failures": failures, "sourceShape": [rows, cols], "targetShape": [target_rows, target_cols]}
""", "audit_range_write",
            [("accepts-exact-matrix", [1, 1, [["상품", "가격"], ["A", 100]], 2, 2], {"accepted": True, "failures": [], "sourceShape": [2, 2], "targetShape": [2, 2]}), ("reports-ragged-target", [1, 1, [["상품", "가격"], ["A"]], 2, 2], {"accepted": False, "failures": ["shape", "target"], "sourceShape": [2, 0], "targetShape": [2, 2]}), ("reports-origin-and-header", [0, 1, [["", "가격"]], 1, 2], {"accepted": False, "failures": ["origin", "headers"], "sourceShape": [1, 2], "targetShape": [1, 2]})],
            ["range assignment 전에 2D matrix의 직사각형 shape를 계산하세요.", "Excel의 1-based cell origin을 계약에 포함하세요."],
        ),
        "transfer": T(
            "price-update-reconciliation", "가격표 일괄 입력 결과 대조하기", "상품 ID 기준으로 누락·추가·가격 차이를 계산한다.", "reconcile_prices(expected, observed, tolerance=0.01)를 완성하세요.", "def reconcile_prices(expected, observed, tolerance=0.01):\n    raise NotImplementedError",
            """def reconcile_prices(expected, observed, tolerance=0.01):
    exp = {item["sku"]: item["price"] for item in expected}
    obs = {item["sku"]: item["price"] for item in observed}
    missing = sorted(set(exp) - set(obs))
    extra = sorted(set(obs) - set(exp))
    changed = sorted(key for key in set(exp) & set(obs) if abs(exp[key] - obs[key]) > tolerance)
    return {"passed": not missing and not extra and not changed, "missing": missing, "extra": extra, "changed": changed}
""", "reconcile_prices",
            [("accepts-prices", [[{"sku": "A", "price": 10}], [{"sku": "A", "price": 10.005}], 0.01], {"passed": True, "missing": [], "extra": [], "changed": []}), ("reports-price-delta", [[{"sku": "A", "price": 10}], [{"sku": "A", "price": 12}], 0.01], {"passed": False, "missing": [], "extra": [], "changed": ["A"]}), ("reports-membership", [[{"sku": "A", "price": 10}], [{"sku": "B", "price": 10}], 0.01], {"passed": False, "missing": ["A"], "extra": ["B"], "changed": []})],
            ["row index가 아니라 SKU identity로 대조하세요.", "금액 비교에는 명시적인 허용 오차를 사용하세요."],
        ),
        "retrieval": recall("range-write-recall", "Excel range 쓰기 원칙 회상하기", "shape·identity·재개방 대조를 구분한다.", "choose_range_write_evidence", {"shape": {"action": "validate rectangular 2D values", "evidence": "source and target shape", "risk": "shifted cells"}, "identity": {"action": "key rows by stable business id", "evidence": "SKU manifest", "risk": "wrong row updated"}, "reopen": {"action": "read values from saved workbook", "evidence": "business reconciliation", "risk": "write call without persisted values"}}),
    },
    "03": {
        "mastery": T(
            "sheet-expansion-plan", "시트 탐색과 확장 계획 감사하기", "동명 시트·금지 이름·무단 삭제를 차단한다.", "plan_sheet_changes(existing, requested, delete_allowlist)를 완성하세요.", "def plan_sheet_changes(existing, requested, delete_allowlist):\n    raise NotImplementedError",
            r"""def plan_sheet_changes(existing, requested, delete_allowlist):
    existing_names = [item["name"] for item in existing]
    requested_names = [item["name"] for item in requested]
    invalid = sorted(name for name in requested_names if not name or len(name) > 31 or any(char in name for char in "[]:*?/\\"))
    duplicates = sorted({name for name in requested_names if requested_names.count(name) > 1})
    create = [name for name in requested_names if name not in existing_names]
    delete = [name for name in existing_names if name not in requested_names]
    unauthorized = sorted(name for name in delete if name not in delete_allowlist)
    return {"ready": not invalid and not duplicates and not unauthorized, "create": create, "delete": delete, "invalid": invalid, "duplicates": duplicates, "unauthorizedDelete": unauthorized}
""", "plan_sheet_changes",
            [("plans-bounded-create", [[{"name": "Raw"}], [{"name": "Raw"}, {"name": "Summary"}], []], {"ready": True, "create": ["Summary"], "delete": [], "invalid": [], "duplicates": [], "unauthorizedDelete": []}), ("reports-duplicate-invalid", [[], [{"name": "Bad/Name"}, {"name": "Bad/Name"}], []], {"ready": False, "create": ["Bad/Name", "Bad/Name"], "delete": [], "invalid": ["Bad/Name", "Bad/Name"], "duplicates": ["Bad/Name"], "unauthorizedDelete": []}), ("requires-delete-authorization", [[{"name": "Raw"}, {"name": "Old"}], [{"name": "Raw"}], []], {"ready": False, "create": [], "delete": ["Old"], "invalid": [], "duplicates": [], "unauthorizedDelete": ["Old"]})],
            ["시트 create와 delete 집합을 쓰기 전에 계산하세요.", "삭제는 별도의 이름 allowlist를 요구하세요."],
        ),
        "transfer": T(
            "sheet-structure-reconciliation", "확장한 workbook 구조 대조하기", "시트 순서·visibility·active 상태를 계획과 비교한다.", "reconcile_sheet_structure(planned, observed, planned_active, observed_active)를 완성하세요.", "def reconcile_sheet_structure(planned, observed, planned_active, observed_active):\n    raise NotImplementedError",
            """def reconcile_sheet_structure(planned, observed, planned_active, observed_active):
    failures = []
    planned_names = [item["name"] for item in planned]
    observed_names = [item["name"] for item in observed]
    visibility_mismatch = sorted(item["name"] for item in planned for current in observed if item["name"] == current["name"] and item.get("visible", True) != current.get("visible", True))
    if planned_names != observed_names:
        failures.append("order")
    if visibility_mismatch:
        failures.append("visibility")
    if planned_active != observed_active:
        failures.append("active")
    return {"passed": not failures, "failures": failures, "plannedNames": planned_names, "observedNames": observed_names, "visibilityMismatch": visibility_mismatch}
""", "reconcile_sheet_structure",
            [("accepts-structure", [[{"name": "Raw"}, {"name": "Summary"}], [{"name": "Raw"}, {"name": "Summary"}], "Summary", "Summary"], {"passed": True, "failures": [], "plannedNames": ["Raw", "Summary"], "observedNames": ["Raw", "Summary"], "visibilityMismatch": []}), ("reports-order-active", [[{"name": "Raw"}, {"name": "Summary"}], [{"name": "Summary"}, {"name": "Raw"}], "Summary", "Raw"], {"passed": False, "failures": ["order", "active"], "plannedNames": ["Raw", "Summary"], "observedNames": ["Summary", "Raw"], "visibilityMismatch": []}), ("reports-visibility", [[{"name": "Raw", "visible": True}], [{"name": "Raw", "visible": False}], "Raw", "Raw"], {"passed": False, "failures": ["visibility"], "plannedNames": ["Raw"], "observedNames": ["Raw"], "visibilityMismatch": ["Raw"]})],
            ["재개방한 시트 순서를 그대로 비교하세요.", "visibility와 active sheet는 별도 상태로 검증하세요."],
        ),
        "retrieval": recall("sheet-expansion-recall", "시트 확장 안전 원칙 회상하기", "계획·권한·구조 대조를 복원한다.", "choose_sheet_change_evidence", {"plan": {"action": "compute create and delete sets", "evidence": "sheet change plan", "risk": "implicit destructive change"}, "authorize": {"action": "allowlist sheet deletions", "evidence": "delete authorization", "risk": "lost worksheet"}, "reconcile": {"action": "compare reopened order visibility active", "evidence": "sheet structure report", "risk": "wrong workbook state"}}),
    },
    "04": {
        "mastery": T(
            "dataframe-roundtrip-contract", "DataFrame 왕복의 schema·index·null 계약 감사하기", "중복 column·의도치 않은 index·null drift를 찾는다.", "audit_dataframe_contract(columns, rows, include_index, null_policy)를 완성하세요.", "def audit_dataframe_contract(columns, rows, include_index, null_policy):\n    raise NotImplementedError",
            """def audit_dataframe_contract(columns, rows, include_index, null_policy):
    duplicates = sorted({name for name in columns if columns.count(name) > 1})
    ragged = [index for index, row in enumerate(rows) if len(row) != len(columns)]
    null_cells = [[r, c] for r, row in enumerate(rows) for c, value in enumerate(row) if value is None]
    failures = []
    if duplicates:
        failures.append("columns")
    if ragged:
        failures.append("shape")
    if include_index not in {True, False}:
        failures.append("index")
    if null_cells and null_policy == "reject":
        failures.append("nulls")
    return {"accepted": not failures, "failures": failures, "duplicates": duplicates, "raggedRows": ragged, "nullCells": null_cells}
""", "audit_dataframe_contract",
            [("accepts-explicit-schema", [["sku", "price"], [["A", 10]], False, "reject"], {"accepted": True, "failures": [], "duplicates": [], "raggedRows": [], "nullCells": []}), ("reports-shape-and-columns", [["sku", "sku"], [["A"]], False, "allow"], {"accepted": False, "failures": ["columns", "shape"], "duplicates": ["sku"], "raggedRows": [0], "nullCells": []}), ("reports-null-policy", [["sku", "price"], [["A", None]], False, "reject"], {"accepted": False, "failures": ["nulls"], "duplicates": [], "raggedRows": [], "nullCells": [[0, 1]]})],
            ["DataFrame의 columns, index 포함 여부, null 정책을 쓰기 전에 고정하세요.", "2D values와 schema의 열 수를 함께 검사하세요."],
        ),
        "transfer": T(
            "dataframe-roundtrip-reconciliation", "Excel 왕복 후 DataFrame 값 대조하기", "key 기준으로 행 누락과 type drift를 검출한다.", "reconcile_dataframe_rows(expected, observed, key, types)를 완성하세요.", "def reconcile_dataframe_rows(expected, observed, key, types):\n    raise NotImplementedError",
            """def reconcile_dataframe_rows(expected, observed, key, types):
    exp = {row[key]: row for row in expected}
    obs = {row[key]: row for row in observed}
    missing = sorted(set(exp) - set(obs))
    extra = sorted(set(obs) - set(exp))
    type_drift = []
    for row_id in sorted(set(exp) & set(obs)):
        for field, expected_type in types.items():
            value = obs[row_id].get(field)
            actual = "number" if isinstance(value, (int, float)) and not isinstance(value, bool) else "string" if isinstance(value, str) else "null" if value is None else type(value).__name__
            if actual != expected_type:
                type_drift.append(f"{row_id}:{field}")
    return {"passed": not missing and not extra and not type_drift, "missing": missing, "extra": extra, "typeDrift": type_drift}
""", "reconcile_dataframe_rows",
            [("accepts-roundtrip", [[{"sku": "A", "price": 10}], [{"sku": "A", "price": 10.0}], "sku", {"price": "number"}], {"passed": True, "missing": [], "extra": [], "typeDrift": []}), ("reports-membership", [[{"sku": "A", "price": 10}], [{"sku": "B", "price": 10}], "sku", {"price": "number"}], {"passed": False, "missing": ["A"], "extra": ["B"], "typeDrift": []}), ("reports-type-drift", [[{"sku": "A", "price": 10}], [{"sku": "A", "price": "10"}], "sku", {"price": "number"}], {"passed": False, "missing": [], "extra": [], "typeDrift": ["A:price"]})],
            ["행 순서가 아니라 business key로 왕복 결과를 비교하세요.", "Excel이 숫자를 문자열로 바꾼 type drift를 명시적으로 보고하세요."],
        ),
        "retrieval": recall("dataframe-roundtrip-recall", "DataFrame 왕복 원칙 회상하기", "schema·shape·type 증거를 구분한다.", "choose_dataframe_evidence", {"schema": {"action": "declare columns index null policy", "evidence": "dataframe contract", "risk": "implicit layout"}, "write": {"action": "assign rectangular values", "evidence": "range shape", "risk": "shifted matrix"}, "roundtrip": {"action": "compare keys and types after read", "evidence": "membership and type report", "risk": "silent coercion"}}),
    },
    "05": {
        "mastery": T(
            "formula-style-audit", "수식과 서식의 계산·표시 계약 감사하기", "수식 누락·하드코딩·표시 형식 누락을 찾는다.", "audit_formula_cells(cells, required_formulas, required_formats)를 완성하세요.", "def audit_formula_cells(cells, required_formulas, required_formats):\n    raise NotImplementedError",
            """def audit_formula_cells(cells, required_formulas, required_formats):
    by_address = {cell["address"]: cell for cell in cells}
    missing_formula = sorted(address for address, formula in required_formulas.items() if by_address.get(address, {}).get("formula") != formula)
    missing_format = sorted(address for address, fmt in required_formats.items() if by_address.get(address, {}).get("numberFormat") != fmt)
    hardcoded = sorted(cell["address"] for cell in cells if cell.get("expectedFormula") and not cell.get("formula"))
    failures = []
    if missing_formula or hardcoded:
        failures.append("formula")
    if missing_format:
        failures.append("format")
    return {"accepted": not failures, "failures": failures, "missingFormula": missing_formula, "hardcoded": hardcoded, "missingFormat": missing_format}
""", "audit_formula_cells",
            [("accepts-formula-and-format", [[{"address": "B2", "formula": "=SUM(A1:A2)", "numberFormat": "#,##0"}], {"B2": "=SUM(A1:A2)"}, {"B2": "#,##0"}], {"accepted": True, "failures": [], "missingFormula": [], "hardcoded": [], "missingFormat": []}), ("reports-formula", [[{"address": "B2", "value": 10, "expectedFormula": True}], {"B2": "=SUM(A1:A2)"}, {}], {"accepted": False, "failures": ["formula"], "missingFormula": ["B2"], "hardcoded": ["B2"], "missingFormat": []}), ("reports-format", [[{"address": "B2", "formula": "=A1", "numberFormat": "General"}], {"B2": "=A1"}, {"B2": "0.0%"}], {"accepted": False, "failures": ["format"], "missingFormula": [], "hardcoded": [], "missingFormat": ["B2"]})],
            ["formula 문자열과 계산된 value를 서로 다른 증거로 다루세요.", "number format은 업무 단위 계약의 일부로 검사하세요."],
        ),
        "transfer": T(
            "formula-result-reconciliation", "재계산된 수식 결과를 원본 데이터와 대조하기", "stale calculation과 수치 오차를 분리해 찾는다.", "reconcile_formula_results(cells, expected, tolerance=0.01)를 완성하세요.", "def reconcile_formula_results(cells, expected, tolerance=0.01):\n    raise NotImplementedError",
            """def reconcile_formula_results(cells, expected, tolerance=0.01):
    observed = {cell["address"]: cell for cell in cells}
    missing = sorted(set(expected) - set(observed))
    stale = sorted(address for address in expected if address in observed and not observed[address].get("calculated", False))
    mismatched = sorted(address for address, value in expected.items() if address in observed and isinstance(observed[address].get("value"), (int, float)) and abs(observed[address]["value"] - value) > tolerance)
    failures = []
    if missing:
        failures.append("missing")
    if stale:
        failures.append("stale")
    if mismatched:
        failures.append("value")
    return {"passed": not failures, "failures": failures, "missing": missing, "stale": stale, "mismatched": mismatched}
""", "reconcile_formula_results",
            [("accepts-calculated-result", [[{"address": "B2", "value": 100, "calculated": True}], {"B2": 100}, 0.01], {"passed": True, "failures": [], "missing": [], "stale": [], "mismatched": []}), ("reports-stale", [[{"address": "B2", "value": 100, "calculated": False}], {"B2": 100}, 0.01], {"passed": False, "failures": ["stale"], "missing": [], "stale": ["B2"], "mismatched": []}), ("reports-missing-and-value", [[{"address": "B2", "value": 90, "calculated": True}], {"B2": 100, "C2": 1}, 0.01], {"passed": False, "failures": ["missing", "value"], "missing": ["C2"], "stale": [], "mismatched": ["B2"]})],
            ["Excel calculation 완료 여부와 value 정확성을 별도 검사하세요.", "업무 원본에서 다시 계산한 expected value를 사용하세요."],
        ),
        "retrieval": recall("formula-style-recall", "Excel 수식·서식 검증 원칙 회상하기", "수식·계산값·표시 단위를 구분한다.", "choose_formula_evidence", {"formula": {"action": "inspect exact formula text", "evidence": "formula map", "risk": "hardcoded result"}, "value": {"action": "force calculation and reconcile", "evidence": "calculated value report", "risk": "stale cache"}, "format": {"action": "verify number format", "evidence": "display contract", "risk": "wrong unit interpretation"}}),
    },
    "06": {
        "mastery": T(
            "chart-spec-audit", "막대차트의 데이터 범위와 시각 계약 감사하기", "빈 범위·잘못된 축·읽히지 않는 제목을 차단한다.", "audit_chart_spec(spec, available_ranges)를 완성하세요.", "def audit_chart_spec(spec, available_ranges):\n    raise NotImplementedError",
            """def audit_chart_spec(spec, available_ranges):
    failures = []
    if spec.get("sourceRange") not in available_ranges:
        failures.append("source")
    if spec.get("categoryColumn") == spec.get("valueColumn") or not spec.get("categoryColumn") or not spec.get("valueColumn"):
        failures.append("axes")
    if not str(spec.get("title", "")).strip():
        failures.append("title")
    width, height = spec.get("size", [0, 0])
    if width < 320 or height < 200:
        failures.append("size")
    return {"accepted": not failures, "failures": failures, "sourceRange": spec.get("sourceRange"), "size": [width, height]}
""", "audit_chart_spec",
            [("accepts-readable-chart", [{"sourceRange": "A1:B5", "categoryColumn": "A", "valueColumn": "B", "title": "월별 매출", "size": [640, 360]}, ["A1:B5"]], {"accepted": True, "failures": [], "sourceRange": "A1:B5", "size": [640, 360]}), ("reports-source-and-axes", [{"sourceRange": "D1:E5", "categoryColumn": "A", "valueColumn": "A", "title": "차트", "size": [640, 360]}, ["A1:B5"]], {"accepted": False, "failures": ["source", "axes"], "sourceRange": "D1:E5", "size": [640, 360]}), ("reports-title-and-size", [{"sourceRange": "A1:B5", "categoryColumn": "A", "valueColumn": "B", "title": "", "size": [200, 100]}, ["A1:B5"]], {"accepted": False, "failures": ["title", "size"], "sourceRange": "A1:B5", "size": [200, 100]})],
            ["chart source range가 실제 data range와 일치하는지 검사하세요.", "제목과 안정적인 pixel 크기를 artifact 계약에 넣으세요."],
        ),
        "transfer": T(
            "chart-render-reconciliation", "생성된 차트의 series와 범례 대조하기", "예상 series·category 수와 재개방 결과를 비교한다.", "reconcile_chart_render(expected, observed)를 완성하세요.", "def reconcile_chart_render(expected, observed):\n    raise NotImplementedError",
            """def reconcile_chart_render(expected, observed):
    failures = []
    missing_series = sorted(set(expected.get("series", [])) - set(observed.get("series", [])))
    extra_series = sorted(set(observed.get("series", [])) - set(expected.get("series", [])))
    if missing_series or extra_series:
        failures.append("series")
    if expected.get("categoryCount") != observed.get("categoryCount"):
        failures.append("categories")
    if not observed.get("visible", False):
        failures.append("visibility")
    return {"passed": not failures, "failures": failures, "missingSeries": missing_series, "extraSeries": extra_series, "expectedCategories": expected.get("categoryCount"), "observedCategories": observed.get("categoryCount")}
""", "reconcile_chart_render",
            [("accepts-visible-chart", [{"series": ["매출"], "categoryCount": 4}, {"series": ["매출"], "categoryCount": 4, "visible": True}], {"passed": True, "failures": [], "missingSeries": [], "extraSeries": [], "expectedCategories": 4, "observedCategories": 4}), ("reports-series", [{"series": ["매출"], "categoryCount": 4}, {"series": ["비용"], "categoryCount": 4, "visible": True}], {"passed": False, "failures": ["series"], "missingSeries": ["매출"], "extraSeries": ["비용"], "expectedCategories": 4, "observedCategories": 4}), ("reports-categories-and-visibility", [{"series": [], "categoryCount": 4}, {"series": [], "categoryCount": 3, "visible": False}], {"passed": False, "failures": ["categories", "visibility"], "missingSeries": [], "extraSeries": [], "expectedCategories": 4, "observedCategories": 3})],
            ["chart object 존재만 보지 말고 series 이름과 category 수를 검사하세요.", "Local에서는 screenshot 또는 render evidence로 visibility를 확인하세요."],
        ),
        "retrieval": recall("chart-automation-recall", "Excel 차트 자동화 원칙 회상하기", "source·semantic series·render 증거를 복원한다.", "choose_chart_evidence", {"source": {"action": "pin source range and columns", "evidence": "chart spec", "risk": "wrong data"}, "semantic": {"action": "verify series and categories", "evidence": "reopened chart metadata", "risk": "misleading chart"}, "render": {"action": "inspect visible chart at stable size", "evidence": "render capture", "risk": "blank or clipped object"}}),
    },
    "07": {
        "mastery": T(
            "excel-table-contract", "Excel 표와 동적 합계 계약 감사하기", "범위·헤더·totals formula 연결을 검증한다.", "audit_excel_table(spec, formulas)를 완성하세요.", "def audit_excel_table(spec, formulas):\n    raise NotImplementedError",
            """def audit_excel_table(spec, formulas):
    failures = []
    headers = spec.get("headers", [])
    if not spec.get("name") or not spec.get("range"):
        failures.append("identity")
    if not headers or len(headers) != len(set(headers)) or any(not str(value).strip() for value in headers):
        failures.append("headers")
    missing_totals = sorted(column for column in spec.get("totalColumns", []) if column not in formulas)
    stale_refs = sorted(column for column, formula in formulas.items() if spec.get("name") and f"{spec['name']}[" not in formula)
    if missing_totals or stale_refs:
        failures.append("totals")
    return {"accepted": not failures, "failures": failures, "missingTotals": missing_totals, "staleReferences": stale_refs}
""", "audit_excel_table",
            [("accepts-structured-total", [{"name": "Sales", "range": "A1:B5", "headers": ["상품", "금액"], "totalColumns": ["금액"]}, {"금액": "=SUM(Sales[금액])"}], {"accepted": True, "failures": [], "missingTotals": [], "staleReferences": []}), ("reports-identity-and-headers", [{"name": "", "range": "", "headers": ["금액", "금액"], "totalColumns": []}, {}], {"accepted": False, "failures": ["identity", "headers"], "missingTotals": [], "staleReferences": []}), ("reports-total-contract", [{"name": "Sales", "range": "A1:B5", "headers": ["상품", "금액"], "totalColumns": ["금액", "수량"]}, {"금액": "=SUM(B2:B5)"}], {"accepted": False, "failures": ["totals"], "missingTotals": ["수량"], "staleReferences": ["금액"]})],
            ["표 이름과 range를 안정적인 identity로 사용하세요.", "동적 합계는 고정 cell range보다 structured reference로 검증하세요."],
        ),
        "transfer": T(
            "table-growth-reconciliation", "행 추가 후 표 범위와 합계의 동적 확장 대조하기", "새 행 수·range row·합계 값을 함께 검증한다.", "reconcile_table_growth(before_rows, added_rows, observed_rows, observed_total, expected_total)를 완성하세요.", "def reconcile_table_growth(before_rows, added_rows, observed_rows, observed_total, expected_total):\n    raise NotImplementedError",
            """def reconcile_table_growth(before_rows, added_rows, observed_rows, observed_total, expected_total):
    expected_rows = before_rows + added_rows
    failures = []
    if observed_rows != expected_rows:
        failures.append("range")
    if abs(observed_total - expected_total) > 0.01:
        failures.append("total")
    return {"passed": not failures, "failures": failures, "expectedRows": expected_rows, "observedRows": observed_rows, "delta": round(observed_total - expected_total, 2)}
""", "reconcile_table_growth",
            [("accepts-dynamic-growth", [3, 2, 5, 150, 150], {"passed": True, "failures": [], "expectedRows": 5, "observedRows": 5, "delta": 0}), ("reports-range", [3, 2, 4, 150, 150], {"passed": False, "failures": ["range"], "expectedRows": 5, "observedRows": 4, "delta": 0}), ("reports-total", [3, 0, 3, 140, 150], {"passed": False, "failures": ["total"], "expectedRows": 3, "observedRows": 3, "delta": -10})],
            ["행 추가 후 table range가 실제로 늘었는지 검사하세요.", "합계는 원본 업무 데이터에서 재계산한 expected와 비교하세요."],
        ),
        "retrieval": recall("excel-table-recall", "Excel 표 자동화 원칙 회상하기", "identity·structured formula·growth 증거를 구분한다.", "choose_excel_table_evidence", {"identity": {"action": "pin table name range headers", "evidence": "table contract", "risk": "wrong region"}, "formula": {"action": "use structured references", "evidence": "formula map", "risk": "fixed-range totals"}, "growth": {"action": "append and reconcile row count", "evidence": "range and total report", "risk": "new rows excluded"}}),
    },
    "08": {
        "mastery": T(
            "monthly-workbook-admission", "월별 파일 병합 입력의 기간·schema·중복 감사하기", "잘못된 기간·schema drift·중복 file hash를 차단한다.", "audit_monthly_files(files, expected_columns, period_start, period_end)를 완성하세요.", "def audit_monthly_files(files, expected_columns, period_start, period_end):\n    raise NotImplementedError",
            """def audit_monthly_files(files, expected_columns, period_start, period_end):
    hashes = [item.get("hash") for item in files]
    duplicates = sorted({value for value in hashes if value and hashes.count(value) > 1})
    out_of_period = sorted(item["name"] for item in files if not period_start <= item.get("month", "") <= period_end)
    schema_drift = sorted(item["name"] for item in files if item.get("columns") != expected_columns)
    failures = []
    if duplicates:
        failures.append("duplicate")
    if out_of_period:
        failures.append("period")
    if schema_drift:
        failures.append("schema")
    return {"accepted": not failures, "failures": failures, "duplicates": duplicates, "outOfPeriod": out_of_period, "schemaDrift": schema_drift}
""", "audit_monthly_files",
            [("accepts-monthly-inputs", [[{"name": "01.xlsx", "hash": "a", "month": "2026-01", "columns": ["sku", "amount"]}], ["sku", "amount"], "2026-01", "2026-03"], {"accepted": True, "failures": [], "duplicates": [], "outOfPeriod": [], "schemaDrift": []}), ("reports-duplicate-period", [[{"name": "old.xlsx", "hash": "a", "month": "2025-12", "columns": ["sku"]}, {"name": "copy.xlsx", "hash": "a", "month": "2026-01", "columns": ["sku"]}], ["sku"], "2026-01", "2026-03"], {"accepted": False, "failures": ["duplicate", "period"], "duplicates": ["a"], "outOfPeriod": ["old.xlsx"], "schemaDrift": []}), ("reports-schema-drift", [[{"name": "02.xlsx", "hash": "b", "month": "2026-02", "columns": ["amount", "sku"]}], ["sku", "amount"], "2026-01", "2026-03"], {"accepted": False, "failures": ["schema"], "duplicates": [], "outOfPeriod": [], "schemaDrift": ["02.xlsx"]})],
            ["파일명보다 content hash와 명시적 month를 입장 기준으로 사용하세요.", "병합 전 column 이름과 순서를 정확히 비교하세요."],
        ),
        "transfer": T(
            "monthly-merge-reconciliation", "월별 병합 결과의 행 수와 금액 대조하기", "source별 contribution과 전체 합계를 검증한다.", "reconcile_monthly_merge(sources, result)를 완성하세요.", "def reconcile_monthly_merge(sources, result):\n    raise NotImplementedError",
            """def reconcile_monthly_merge(sources, result):
    expected_rows = sum(item["rows"] for item in sources)
    expected_total = sum(item["total"] for item in sources)
    missing_sources = sorted(set(item["hash"] for item in sources) - set(result.get("sourceHashes", [])))
    failures = []
    if result.get("rows") != expected_rows:
        failures.append("rows")
    if abs(result.get("total", 0) - expected_total) > 0.01:
        failures.append("total")
    if missing_sources:
        failures.append("provenance")
    return {"passed": not failures, "failures": failures, "expectedRows": expected_rows, "observedRows": result.get("rows"), "delta": round(result.get("total", 0) - expected_total, 2), "missingSources": missing_sources}
""", "reconcile_monthly_merge",
            [("accepts-reconciled-merge", [[{"hash": "a", "rows": 2, "total": 100}, {"hash": "b", "rows": 1, "total": 50}], {"sourceHashes": ["a", "b"], "rows": 3, "total": 150}], {"passed": True, "failures": [], "expectedRows": 3, "observedRows": 3, "delta": 0, "missingSources": []}), ("reports-rows-total", [[{"hash": "a", "rows": 2, "total": 100}], {"sourceHashes": ["a"], "rows": 1, "total": 90}], {"passed": False, "failures": ["rows", "total"], "expectedRows": 2, "observedRows": 1, "delta": -10, "missingSources": []}), ("reports-provenance", [[{"hash": "a", "rows": 1, "total": 10}], {"sourceHashes": [], "rows": 1, "total": 10}], {"passed": False, "failures": ["provenance"], "expectedRows": 1, "observedRows": 1, "delta": 0, "missingSources": ["a"]})],
            ["source별 row count와 total을 더해 expected를 만드세요.", "결과 manifest에 모든 source content hash를 포함하세요."],
        ),
        "retrieval": recall("monthly-merge-recall", "월별 Excel 병합 원칙 회상하기", "입장·병합·대조 증거를 기억에서 복원한다.", "choose_monthly_merge_evidence", {"admit": {"action": "validate hash period schema", "evidence": "source admission ledger", "risk": "duplicate or stale input"}, "merge": {"action": "preserve source identity per row", "evidence": "row provenance", "risk": "untraceable records"}, "reconcile": {"action": "compare rows totals source hashes", "evidence": "merge report", "risk": "silent omission"}}),
    },
    "09": {
        "mastery": T(
            "macro-call-authorization", "VBA 매크로 호출의 서명·allowlist·인자 계약 감사하기", "알 수 없는 workbook·macro·가변 인자를 차단한다.", "authorize_macro_call(request, policy)를 완성하세요.", "def authorize_macro_call(request, policy):\n    raise NotImplementedError",
            """def authorize_macro_call(request, policy):
    failures = []
    if request.get("workbookHash") not in policy.get("allowedWorkbookHashes", []):
        failures.append("workbook")
    if request.get("macro") not in policy.get("allowedMacros", []):
        failures.append("macro")
    if len(request.get("args", [])) > policy.get("maxArgs", 0):
        failures.append("arguments")
    if policy.get("requireSignature") and not request.get("signatureValid"):
        failures.append("signature")
    return {"authorized": not failures, "failures": failures, "macro": request.get("macro"), "argumentCount": len(request.get("args", []))}
""", "authorize_macro_call",
            [("accepts-signed-allowlisted-call", [{"workbookHash": "h", "macro": "BuildReport", "args": ["2026-01"], "signatureValid": True}, {"allowedWorkbookHashes": ["h"], "allowedMacros": ["BuildReport"], "maxArgs": 2, "requireSignature": True}], {"authorized": True, "failures": [], "macro": "BuildReport", "argumentCount": 1}), ("reports-workbook-and-macro", [{"workbookHash": "x", "macro": "DeleteAll", "args": []}, {"allowedWorkbookHashes": ["h"], "allowedMacros": ["BuildReport"], "maxArgs": 1, "requireSignature": False}], {"authorized": False, "failures": ["workbook", "macro"], "macro": "DeleteAll", "argumentCount": 0}), ("reports-args-and-signature", [{"workbookHash": "h", "macro": "BuildReport", "args": [1, 2], "signatureValid": False}, {"allowedWorkbookHashes": ["h"], "allowedMacros": ["BuildReport"], "maxArgs": 1, "requireSignature": True}], {"authorized": False, "failures": ["arguments", "signature"], "macro": "BuildReport", "argumentCount": 2})],
            ["macro name뿐 아니라 workbook content hash와 signature를 검사하세요.", "인자 수와 schema를 호출 전에 제한하세요."],
        ),
        "transfer": T(
            "macro-effect-reconciliation", "매크로 실행 전후의 허용된 변경 집합 대조하기", "의도하지 않은 sheet·cell 변경을 찾는다.", "audit_macro_effects(changes, allowed_patterns)를 완성하세요.", "def audit_macro_effects(changes, allowed_patterns):\n    raise NotImplementedError",
            """def audit_macro_effects(changes, allowed_patterns):
    import fnmatch
    authorized = []
    unauthorized = []
    for change in changes:
        target = change["target"]
        if any(fnmatch.fnmatchcase(target, pattern) for pattern in allowed_patterns):
            authorized.append(target)
        else:
            unauthorized.append(target)
    return {"passed": not unauthorized, "authorized": sorted(authorized), "unauthorized": sorted(unauthorized), "changeCount": len(changes)}
""", "audit_macro_effects",
            [("accepts-bounded-effects", [[{"target": "Summary!B2"}, {"target": "Summary!C2"}], ["Summary!*2"]], {"passed": True, "authorized": ["Summary!B2", "Summary!C2"], "unauthorized": [], "changeCount": 2}), ("reports-foreign-sheet", [[{"target": "Raw!A1"}], ["Summary!*"]], {"passed": False, "authorized": [], "unauthorized": ["Raw!A1"], "changeCount": 1}), ("separates-mixed-effects", [[{"target": "Summary!B2"}, {"target": "Config!A1"}], ["Summary!*"]], {"passed": False, "authorized": ["Summary!B2"], "unauthorized": ["Config!A1"], "changeCount": 2})],
            ["매크로 실행 전후 workbook diff를 target 주소로 기록하세요.", "허용 패턴 밖의 변경이 하나라도 있으면 릴리스하지 마세요."],
        ),
        "retrieval": recall("macro-safety-recall", "VBA 호출 안전 원칙 회상하기", "승인·실행·효과 대조를 복원한다.", "choose_macro_evidence", {"authorize": {"action": "verify workbook hash macro allowlist signature", "evidence": "call authorization", "risk": "untrusted code"}, "execute": {"action": "run with bounded args and timeout", "evidence": "redacted invocation log", "risk": "hung Excel"}, "reconcile": {"action": "diff workbook against allowed effects", "evidence": "target change report", "risk": "collateral edits"}}),
    },
    "10": {
        "mastery": T(
            "udf-purity-audit", "UDF 가격 계산기의 순수성·결정성 계약 감사하기", "외부 상태·가변 시간·오류 은폐를 차단한다.", "audit_udf_contract(contract)를 완성하세요.", "def audit_udf_contract(contract):\n    raise NotImplementedError",
            """def audit_udf_contract(contract):
    failures = []
    forbidden = sorted(set(contract.get("dependencies", [])) & {"network", "filesystem", "clock", "random", "excel-write"})
    if forbidden:
        failures.append("side-effects")
    if not contract.get("inputSchema") or not contract.get("outputSchema"):
        failures.append("schema")
    if contract.get("onError") not in {"raise", "typed-error"}:
        failures.append("error-policy")
    return {"accepted": not failures, "failures": failures, "forbiddenDependencies": forbidden, "cacheable": not forbidden and bool(contract.get("inputSchema"))}
""", "audit_udf_contract",
            [("accepts-pure-udf", [{"dependencies": [], "inputSchema": ["price:number", "tax:number"], "outputSchema": "number", "onError": "typed-error"}], {"accepted": True, "failures": [], "forbiddenDependencies": [], "cacheable": True}), ("reports-side-effects", [{"dependencies": ["network", "clock"], "inputSchema": ["sku:string"], "outputSchema": "number", "onError": "raise"}], {"accepted": False, "failures": ["side-effects"], "forbiddenDependencies": ["clock", "network"], "cacheable": False}), ("reports-schema-and-error", [{"dependencies": [], "inputSchema": [], "outputSchema": "", "onError": "blank"}], {"accepted": False, "failures": ["schema", "error-policy"], "forbiddenDependencies": [], "cacheable": False})],
            ["UDF는 같은 입력에 같은 출력을 주는 순수 계산으로 제한하세요.", "오류를 빈 셀로 숨기지 말고 typed error로 드러내세요."],
        ),
        "transfer": T(
            "price-udf-cases", "가격 UDF의 할인·세금 경계값 전이 검증하기", "Decimal 문자열 입력으로 반올림 규칙을 결정론적으로 적용한다.", "calculate_price(base, discount_rate, tax_rate)를 완성하세요.", "def calculate_price(base, discount_rate, tax_rate):\n    raise NotImplementedError",
            """def calculate_price(base, discount_rate, tax_rate):
    from decimal import Decimal, ROUND_HALF_UP
    base_value = Decimal(str(base))
    discount = Decimal(str(discount_rate))
    tax = Decimal(str(tax_rate))
    if base_value < 0 or not Decimal("0") <= discount <= Decimal("1") or tax < 0:
        raise ValueError("invalid price input")
    subtotal = base_value * (Decimal("1") - discount)
    total = (subtotal * (Decimal("1") + tax)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return {"subtotal": str(subtotal.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)), "total": str(total)}
""", "calculate_price",
            [("calculates-discount-tax", [100, "0.1", "0.1"], {"subtotal": "90.00", "total": "99.00"}), ("rounds-half-up", ["10.005", "0", "0"], {"subtotal": "10.01", "total": "10.01"}), ("rejects-invalid-rate", [100, "1.1", "0.1"], E("ValueError"))],
            ["binary float 대신 Decimal 문자열 변환으로 금액을 계산하세요.", "할인율 범위와 음수 금액을 함수 경계에서 거부하세요."],
        ),
        "retrieval": recall("udf-release-recall", "Excel UDF 릴리스 원칙 회상하기", "순수성·경계값·workbook 재계산 증거를 기억에서 복원한다.", "choose_udf_evidence", {"contract": {"action": "ban external effects and define schemas", "evidence": "UDF purity audit", "risk": "nondeterministic cells"}, "cases": {"action": "test numeric boundaries and errors", "evidence": "behavior case matrix", "risk": "silent financial error"}, "workbook": {"action": "recalculate and reconcile cell results", "evidence": "reopened formula values", "risk": "stale or unavailable UDF"}}),
    },
}
