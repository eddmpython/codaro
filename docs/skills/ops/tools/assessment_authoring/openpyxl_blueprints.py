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
            "Workbook 저장 성공과 업무 값·수식·표시의 정확성을 분리해 검증하세요.",
            "Web에서는 문서 계약을 검증하고 Local에서는 재개방한 artifact evidence를 남기세요.",
        ],
    )


BLUEPRINTS: dict[str, dict[str, TaskBlueprint]] = {
    "00": {
        "mastery": T(
            "workbook-artifact-contract",
            "Excel workbook의 sheet·formula·table 산출물 계약 만들기",
            "저장 전에 필요한 workbook 구조와 검증 evidence를 명시한다.",
            "audit_workbook_contract(contract)를 완성하세요.",
            "def audit_workbook_contract(contract):\n    raise NotImplementedError",
            """def audit_workbook_contract(contract):
    required = {"fileName", "sheets", "expectedFormulas", "expectedTables", "reopenVerification"}
    missing = sorted(required - set(contract))
    failures = []
    if not str(contract.get("fileName", "")).lower().endswith(".xlsx"):
        failures.append("extension")
    if not contract.get("sheets") or len(contract.get("sheets", [])) != len(set(contract.get("sheets", []))):
        failures.append("sheets")
    if not contract.get("reopenVerification", False):
        failures.append("reopen")
    return {"ready": not missing and not failures, "missing": missing, "failures": failures, "evidence": ["workbook descriptor", "reopened structure", "business reconciliation"]}
""",
            "audit_workbook_contract",
            [
                (
                    "accepts-explicit-workbook-contract",
                    [{"fileName": "sales.xlsx", "sheets": ["Raw", "Summary"], "expectedFormulas": ["Summary!B2"], "expectedTables": ["Raw!Sales"], "reopenVerification": True}],
                    {"ready": True, "missing": [], "failures": [], "evidence": ["workbook descriptor", "reopened structure", "business reconciliation"]},
                ),
                (
                    "reports-extension-duplicates-and-reopen",
                    [{"fileName": "sales.xls", "sheets": ["Data", "Data"], "expectedFormulas": [], "expectedTables": [], "reopenVerification": False}],
                    {"ready": False, "missing": [], "failures": ["extension", "sheets", "reopen"], "evidence": ["workbook descriptor", "reopened structure", "business reconciliation"]},
                ),
                (
                    "reports-missing-contract-fields",
                    [{"fileName": "book.xlsx"}],
                    {"ready": False, "missing": ["expectedFormulas", "expectedTables", "reopenVerification", "sheets"], "failures": ["sheets", "reopen"], "evidence": ["workbook descriptor", "reopened structure", "business reconciliation"]},
                ),
            ],
            [
                "파일명뿐 아니라 sheet·formula·table 기대값을 먼저 계약으로 만드세요.",
                "저장 후 같은 라이브러리로 재개방해 구조를 검증하세요.",
            ],
        ),
        "transfer": T(
            "excel-runtime-tier-plan",
            "새 Excel 과제에 Web·Local 역할 분리 전이하기",
            "수식 판단과 실제 workbook artifact 생성을 capability로 구분한다.",
            "plan_excel_runtime(requirements)를 완성하세요.",
            "def plan_excel_runtime(requirements):\n    raise NotImplementedError",
            """def plan_excel_runtime(requirements):
    local_reasons = []
    if requirements.get("createWorkbook"):
        local_reasons.append("xlsx-artifact")
    if requirements.get("reopenWorkbook"):
        local_reasons.append("artifact-reopen")
    if requirements.get("desktopExcel"):
        local_reasons.append("desktop-application")
    return {"tier": "local" if local_reasons else "web", "localReasons": local_reasons, "webPractice": ["sheet schema", "formula contract", "business reconciliation"]}
""",
            "plan_excel_runtime",
            [
                (
                    "keeps-contract-practice-on-web",
                    [{}],
                    {"tier": "web", "localReasons": [], "webPractice": ["sheet schema", "formula contract", "business reconciliation"]},
                ),
                (
                    "requires-local-for-workbook-artifact",
                    [{"createWorkbook": True, "reopenWorkbook": True}],
                    {"tier": "local", "localReasons": ["xlsx-artifact", "artifact-reopen"], "webPractice": ["sheet schema", "formula contract", "business reconciliation"]},
                ),
                (
                    "requires-local-for-desktop-excel",
                    [{"desktopExcel": True}],
                    {"tier": "local", "localReasons": ["desktop-application"], "webPractice": ["sheet schema", "formula contract", "business reconciliation"]},
                ),
            ],
            [
                "Web 학습을 패키지 실행처럼 위장하지 말고 문서 판단을 강하게 평가하세요.",
                "실제 workbook과 Desktop Excel capability는 Local 실습으로 연결하세요.",
            ],
        ),
        "retrieval": decision(
            "openpyxl-foundation-recall",
            "openpyxl artifact 검증 원칙 회상하기",
            "저장·재개방·업무 reconciliation 근거를 구분한다.",
            "choose_workbook_evidence",
            {
                "save": {"action": "write bounded xlsx artifact", "evidence": "path size hash", "risk": "partial file"},
                "reopen": {"action": "load and inspect workbook structure", "evidence": "sheets formulas tables", "risk": "corrupt package"},
                "reconcile": {"action": "compare workbook totals with source", "evidence": "business checks", "risk": "valid file with wrong numbers"},
            },
        ),
    },
    "01": {
        "mastery": T(
            "sheet-plan-audit",
            "워크북 sheet 이름·순서·visibility·active 계약 감사하기",
            "중복·금지 문자·숨김-only workbook을 차단한다.",
            "audit_sheet_plan(sheets, active_sheet)를 완성하세요.",
            "def audit_sheet_plan(sheets, active_sheet):\n    raise NotImplementedError",
            r"""def audit_sheet_plan(sheets, active_sheet):
    failures = []
    names = [sheet["name"] for sheet in sheets]
    duplicates = sorted({name for name in names if names.count(name) > 1})
    invalid = sorted(name for name in names if not name or len(name) > 31 or any(character in name for character in "[]:*?/\\"))
    visible = [sheet["name"] for sheet in sheets if sheet.get("visibility", "visible") == "visible"]
    if duplicates:
        failures.append("duplicates")
    if invalid:
        failures.append("names")
    if not visible:
        failures.append("visibility")
    if active_sheet not in visible:
        failures.append("active")
    return {"accepted": not failures, "failures": failures, "duplicates": duplicates, "invalidNames": invalid, "visibleSheets": visible}
""",
            "audit_sheet_plan",
            [
                (
                    "accepts-visible-ordered-sheets",
                    [[{"name": "Raw", "visibility": "visible"}, {"name": "Summary", "visibility": "visible"}], "Summary"],
                    {"accepted": True, "failures": [], "duplicates": [], "invalidNames": [], "visibleSheets": ["Raw", "Summary"]},
                ),
                (
                    "reports-duplicates-and-hidden-active",
                    [[{"name": "Data", "visibility": "hidden"}, {"name": "Data", "visibility": "hidden"}], "Data"],
                    {"accepted": False, "failures": ["duplicates", "visibility", "active"], "duplicates": ["Data"], "invalidNames": [], "visibleSheets": []},
                ),
                (
                    "reports-invalid-sheet-name",
                    [[{"name": "Bad/Name", "visibility": "visible"}], "Bad/Name"],
                    {"accepted": False, "failures": ["names"], "duplicates": [], "invalidNames": ["Bad/Name"], "visibleSheets": ["Bad/Name"]},
                ),
            ],
            [
                "sheet 이름의 Excel 제한과 전역 유일성을 저장 전에 검사하세요.",
                "최소 한 sheet는 visible이어야 하며 active sheet도 visible이어야 합니다.",
            ],
        ),
        "transfer": T(
            "sheet-result-reconciliation",
            "새 workbook의 실제 sheet 구조 reconciliation 전이하기",
            "계획한 이름·순서·visibility와 재개방 결과를 대조한다.",
            "reconcile_sheet_result(planned, observed, planned_active, observed_active)를 완성하세요.",
            "def reconcile_sheet_result(planned, observed, planned_active, observed_active):\n    raise NotImplementedError",
            """def reconcile_sheet_result(planned, observed, planned_active, observed_active):
    failures = []
    planned_names = [item["name"] for item in planned]
    observed_names = [item["name"] for item in observed]
    if planned_names != observed_names:
        failures.append("order")
    planned_visibility = {item["name"]: item.get("visibility", "visible") for item in planned}
    observed_visibility = {item["name"]: item.get("visibility", "visible") for item in observed}
    visibility_mismatch = sorted(name for name in set(planned_visibility) & set(observed_visibility) if planned_visibility[name] != observed_visibility[name])
    if visibility_mismatch:
        failures.append("visibility")
    if planned_active != observed_active:
        failures.append("active")
    return {"passed": not failures, "failures": failures, "plannedNames": planned_names, "observedNames": observed_names, "visibilityMismatch": visibility_mismatch}
""",
            "reconcile_sheet_result",
            [
                (
                    "accepts-exact-reopened-structure",
                    [[{"name": "Raw"}, {"name": "Summary"}], [{"name": "Raw"}, {"name": "Summary"}], "Summary", "Summary"],
                    {"passed": True, "failures": [], "plannedNames": ["Raw", "Summary"], "observedNames": ["Raw", "Summary"], "visibilityMismatch": []},
                ),
                (
                    "reports-order-and-active",
                    [[{"name": "Raw"}, {"name": "Summary"}], [{"name": "Summary"}, {"name": "Raw"}], "Summary", "Raw"],
                    {"passed": False, "failures": ["order", "active"], "plannedNames": ["Raw", "Summary"], "observedNames": ["Summary", "Raw"], "visibilityMismatch": []},
                ),
                (
                    "reports-visibility-mismatch",
                    [[{"name": "Data", "visibility": "hidden"}], [{"name": "Data", "visibility": "visible"}], "Data", "Data"],
                    {"passed": False, "failures": ["visibility"], "plannedNames": ["Data"], "observedNames": ["Data"], "visibilityMismatch": ["Data"]},
                ),
            ],
            [
                "sheet 집합만 보지 말고 순서와 visibility를 함께 대조하세요.",
                "재개방한 workbook의 active sheet도 계획과 비교하세요.",
            ],
        ),
        "retrieval": decision(
            "sheet-structure-recall",
            "워크북 sheet 구조 기준 회상하기",
            "이름·순서·visibility·active evidence를 복원한다.",
            "choose_sheet_structure",
            {
                "name": {"action": "validate Excel constraints and uniqueness", "evidence": "ordered sheet names", "risk": "invalid or duplicate name"},
                "visibility": {"action": "keep at least one visible sheet", "evidence": "visibility map", "risk": "unopenable workbook"},
                "reopen": {"action": "reconcile observed order and active", "evidence": "reopened workbook structure", "risk": "save drift"},
            },
        ),
    },
    "02": {
        "mastery": T(
            "cell-update-audit",
            "셀 write의 type·overwrite·blank 정책 감사하기",
            "schema와 기존 값 보호 정책으로 update 계획을 판정한다.",
            "audit_cell_updates(updates, schema, existing_values, allow_overwrite)를 완성하세요.",
            "def audit_cell_updates(updates, schema, existing_values, allow_overwrite):\n    raise NotImplementedError",
            """def audit_cell_updates(updates, schema, existing_values, allow_overwrite):
    failures = []
    accepted = []
    rejected = []
    for update in updates:
        cell = update["cell"]
        reasons = []
        expected_type = schema.get(cell)
        if expected_type and type(update["value"]).__name__ != expected_type:
            reasons.append("type")
        if cell in existing_values and existing_values[cell] not in {None, ""} and not allow_overwrite:
            reasons.append("overwrite")
        if reasons:
            rejected.append({"cell": cell, "reasons": reasons})
        else:
            accepted.append(cell)
    if rejected:
        failures.append("updates")
    return {"ready": not failures, "accepted": accepted, "rejected": rejected}
""",
            "audit_cell_updates",
            [
                (
                    "accepts-typed-empty-cell-updates",
                    [[{"cell": "A1", "value": "Name"}, {"cell": "B2", "value": 3}], {"A1": "str", "B2": "int"}, {"A1": None, "B2": ""}, False],
                    {"ready": True, "accepted": ["A1", "B2"], "rejected": []},
                ),
                (
                    "reports-type-and-overwrite",
                    [[{"cell": "A1", "value": 3}], {"A1": "str"}, {"A1": "old"}, False],
                    {"ready": False, "accepted": [], "rejected": [{"cell": "A1", "reasons": ["type", "overwrite"]}]},
                ),
                (
                    "allows-explicit-overwrite",
                    [[{"cell": "A1", "value": "new"}], {"A1": "str"}, {"A1": "old"}, True],
                    {"ready": True, "accepted": ["A1"], "rejected": []},
                ),
            ],
            [
                "Excel 표시값이 같아 보여도 Python value type을 schema로 검사하세요.",
                "기존 nonblank 셀 overwrite는 명시적 정책 없이는 차단하세요.",
            ],
        ),
        "transfer": T(
            "cell-result-reconciliation",
            "새 셀 write 결과에 값·type reconciliation 전이하기",
            "계획값과 재개방된 셀의 값·data type을 대조한다.",
            "reconcile_cell_results(planned, observed)를 완성하세요.",
            "def reconcile_cell_results(planned, observed):\n    raise NotImplementedError",
            """def reconcile_cell_results(planned, observed):
    observed_map = {item["cell"]: item for item in observed}
    missing = []
    mismatches = []
    for item in planned:
        cell = item["cell"]
        if cell not in observed_map:
            missing.append(cell)
            continue
        actual = observed_map[cell]
        reasons = []
        if actual.get("value") != item.get("value"):
            reasons.append("value")
        if actual.get("dataType") != item.get("dataType"):
            reasons.append("type")
        if reasons:
            mismatches.append({"cell": cell, "reasons": reasons})
    unexpected = sorted(set(observed_map) - {item["cell"] for item in planned})
    return {"passed": not missing and not mismatches and not unexpected, "missing": sorted(missing), "mismatches": mismatches, "unexpected": unexpected}
""",
            "reconcile_cell_results",
            [
                (
                    "accepts-value-and-type-match",
                    [[{"cell": "A1", "value": "Name", "dataType": "s"}], [{"cell": "A1", "value": "Name", "dataType": "s"}]],
                    {"passed": True, "missing": [], "mismatches": [], "unexpected": []},
                ),
                (
                    "reports-value-and-type-mismatch",
                    [[{"cell": "B2", "value": 3, "dataType": "n"}], [{"cell": "B2", "value": "3", "dataType": "s"}]],
                    {"passed": False, "missing": [], "mismatches": [{"cell": "B2", "reasons": ["value", "type"]}], "unexpected": []},
                ),
                (
                    "reports-missing-and-unexpected",
                    [[{"cell": "A1", "value": 1, "dataType": "n"}], [{"cell": "C1", "value": 1, "dataType": "n"}]],
                    {"passed": False, "missing": ["A1"], "mismatches": [], "unexpected": ["C1"]},
                ),
            ],
            [
                "재개방한 cell의 value와 Excel data type을 함께 비교하세요.",
                "계획에 없던 변경 셀도 unexpected로 실패시키세요.",
            ],
        ),
        "retrieval": decision(
            "cell-io-recall",
            "셀 읽기·쓰기 품질 기준 회상하기",
            "value·type·overwrite·재개방 근거를 복원한다.",
            "choose_cell_evidence",
            {
                "plan": {"action": "validate cell schema and overwrite policy", "evidence": "accepted and rejected cells", "risk": "silent data loss"},
                "write": {"action": "assign typed Python values", "evidence": "planned value and data type", "risk": "text-number confusion"},
                "verify": {"action": "reopen and reconcile cells", "evidence": "observed value and type", "risk": "save conversion"},
            },
        ),
    },
    "03": {
        "mastery": T(
            "range-shape-audit",
            "2차원 range write의 행·열 shape 감사하기",
            "ragged data와 target 크기 불일치를 write 전에 차단한다.",
            "audit_range_shape(values, target_rows, target_columns)를 완성하세요.",
            "def audit_range_shape(values, target_rows, target_columns):\n    raise NotImplementedError",
            """def audit_range_shape(values, target_rows, target_columns):
    row_lengths = [len(row) for row in values]
    ragged = len(set(row_lengths)) > 1
    actual_rows = len(values)
    actual_columns = row_lengths[0] if row_lengths else 0
    failures = []
    if ragged:
        failures.append("ragged")
    if actual_rows != target_rows or actual_columns != target_columns:
        failures.append("target-shape")
    return {"accepted": not failures, "failures": failures, "actualShape": [actual_rows, actual_columns], "rowLengths": row_lengths}
""",
            "audit_range_shape",
            [
                ("accepts-rectangular-shape", [[[1, 2], [3, 4]], 2, 2], {"accepted": True, "failures": [], "actualShape": [2, 2], "rowLengths": [2, 2]}),
                ("reports-ragged-target-shape", [[[1, 2], [3]], 2, 2], {"accepted": False, "failures": ["ragged"], "actualShape": [2, 2], "rowLengths": [2, 1]}),
                ("reports-empty-shape-mismatch", [[], 1, 1], {"accepted": False, "failures": ["target-shape"], "actualShape": [0, 0], "rowLengths": []}),
            ],
            [
                "range write 전에 2차원 list가 rectangular인지 검사하세요.",
                "target range의 행·열 크기와 실제 shape를 비교하세요.",
            ],
        ),
        "transfer": T(
            "multi-sheet-range-reconciliation",
            "새 다중 sheet range 결과 reconciliation 전이하기",
            "sheet·range identity와 matrix hash를 계획과 대조한다.",
            "reconcile_sheet_ranges(planned, observed)를 완성하세요.",
            "def reconcile_sheet_ranges(planned, observed):\n    raise NotImplementedError",
            """def reconcile_sheet_ranges(planned, observed):
    def identity(item):
        return f"{item['sheet']}!{item['range']}"
    planned_map = {identity(item): item["matrixHash"] for item in planned}
    observed_map = {identity(item): item["matrixHash"] for item in observed}
    missing = sorted(set(planned_map) - set(observed_map))
    unexpected = sorted(set(observed_map) - set(planned_map))
    changed = sorted(key for key in set(planned_map) & set(observed_map) if planned_map[key] != observed_map[key])
    return {"passed": not missing and not unexpected and not changed, "missing": missing, "unexpected": unexpected, "changed": changed}
""",
            "reconcile_sheet_ranges",
            [
                (
                    "accepts-multi-sheet-ranges",
                    [[{"sheet": "Raw", "range": "A1:B2", "matrixHash": "a"}, {"sheet": "Summary", "range": "A1:B1", "matrixHash": "b"}], [{"sheet": "Summary", "range": "A1:B1", "matrixHash": "b"}, {"sheet": "Raw", "range": "A1:B2", "matrixHash": "a"}]],
                    {"passed": True, "missing": [], "unexpected": [], "changed": []},
                ),
                (
                    "reports-changed-range",
                    [[{"sheet": "Raw", "range": "A1:B2", "matrixHash": "a"}], [{"sheet": "Raw", "range": "A1:B2", "matrixHash": "x"}]],
                    {"passed": False, "missing": [], "unexpected": [], "changed": ["Raw!A1:B2"]},
                ),
                (
                    "reports-missing-and-unexpected-range",
                    [[{"sheet": "Raw", "range": "A1:B2", "matrixHash": "a"}], [{"sheet": "Other", "range": "A1", "matrixHash": "b"}]],
                    {"passed": False, "missing": ["Raw!A1:B2"], "unexpected": ["Other!A1"], "changed": []},
                ),
            ],
            [
                "sheet 이름과 A1 range를 합친 identity로 matrix를 추적하세요.",
                "전체 workbook hash만 보지 말고 업무 range별 hash를 비교하세요.",
            ],
        ),
        "retrieval": decision(
            "range-multisheet-recall",
            "범위·다중 sheet 품질 기준 회상하기",
            "shape·range identity·matrix hash 근거를 복원한다.",
            "choose_range_evidence",
            {
                "shape": {"action": "validate rectangular dimensions", "evidence": "row lengths and target shape", "risk": "shifted cells"},
                "identity": {"action": "bind sheet and A1 range", "evidence": "sheet range key", "risk": "wrong sheet"},
                "verify": {"action": "hash reopened matrix", "evidence": "range matrix hash", "risk": "partial write"},
            },
        ),
    },
    "04": {
        "mastery": T(
            "formula-contract-audit",
            "수식과 named range의 참조 계약 감사하기",
            "수식 prefix·참조 sheet·named range 정의 누락을 검사한다.",
            "audit_formula_contract(formulas, sheet_names, named_ranges)를 완성하세요.",
            "def audit_formula_contract(formulas, sheet_names, named_ranges):\n    raise NotImplementedError",
            """def audit_formula_contract(formulas, sheet_names, named_ranges):
    failures = []
    invalid = []
    missing_sheets = []
    missing_names = []
    sheet_set = set(sheet_names)
    name_set = set(named_ranges)
    for item in formulas:
        if not str(item.get("formula", "")).startswith("="):
            invalid.append(item["cell"])
        for sheet in item.get("referencedSheets", []):
            if sheet not in sheet_set:
                missing_sheets.append(f"{item['cell']}:{sheet}")
        for name in item.get("referencedNames", []):
            if name not in name_set:
                missing_names.append(f"{item['cell']}:{name}")
    if invalid:
        failures.append("formula")
    if missing_sheets:
        failures.append("sheets")
    if missing_names:
        failures.append("names")
    return {"accepted": not failures, "failures": failures, "invalidCells": sorted(invalid), "missingSheets": sorted(missing_sheets), "missingNames": sorted(missing_names)}
""",
            "audit_formula_contract",
            [
                (
                    "accepts-known-references",
                    [[{"cell": "Summary!B2", "formula": "=SUM(Raw!B2:B10)", "referencedSheets": ["Raw"], "referencedNames": []}], ["Raw", "Summary"], []],
                    {"accepted": True, "failures": [], "invalidCells": [], "missingSheets": [], "missingNames": []},
                ),
                (
                    "reports-invalid-and-missing-references",
                    [[{"cell": "B2", "formula": "SUM(x)", "referencedSheets": ["Missing"], "referencedNames": ["TaxRate"]}], ["Sheet"], []],
                    {"accepted": False, "failures": ["formula", "sheets", "names"], "invalidCells": ["B2"], "missingSheets": ["B2:Missing"], "missingNames": ["B2:TaxRate"]},
                ),
                (
                    "accepts-defined-name",
                    [[{"cell": "B2", "formula": "=A2*TaxRate", "referencedSheets": [], "referencedNames": ["TaxRate"]}], ["Sheet"], ["TaxRate"]],
                    {"accepted": True, "failures": [], "invalidCells": [], "missingSheets": [], "missingNames": []},
                ),
            ],
            [
                "수식 문자열이 `=`로 시작하는지와 참조 대상 존재를 분리해 검사하세요.",
                "named range는 workbook 정의 목록과 대조하세요.",
            ],
        ),
        "transfer": T(
            "formula-result-audit",
            "새 workbook 수식에 저장식·cached 값 감사 전이하기",
            "formula text와 계산 결과, source 기대값을 함께 비교한다.",
            "audit_formula_results(expected, observed_formula, observed_values)를 완성하세요.",
            "def audit_formula_results(expected, observed_formula, observed_values):\n    raise NotImplementedError",
            """def audit_formula_results(expected, observed_formula, observed_values):
    failures = []
    mismatches = []
    for cell, contract in sorted(expected.items()):
        reasons = []
        if observed_formula.get(cell) != contract["formula"]:
            reasons.append("formula")
        if observed_values.get(cell) != contract["value"]:
            reasons.append("value")
        if reasons:
            mismatches.append({"cell": cell, "reasons": reasons})
    if mismatches:
        failures.append("formula-results")
    missing = sorted(set(expected) - set(observed_formula))
    if missing:
        failures.append("missing")
    return {"passed": not failures, "failures": failures, "mismatches": mismatches, "missing": missing}
""",
            "audit_formula_results",
            [
                (
                    "accepts-formula-and-value",
                    [{"B2": {"formula": "=SUM(A1:A2)", "value": 3}}, {"B2": "=SUM(A1:A2)"}, {"B2": 3}],
                    {"passed": True, "failures": [], "mismatches": [], "missing": []},
                ),
                (
                    "reports-formula-and-value-mismatch",
                    [{"B2": {"formula": "=SUM(A1:A2)", "value": 3}}, {"B2": "=A1+A3"}, {"B2": 4}],
                    {"passed": False, "failures": ["formula-results"], "mismatches": [{"cell": "B2", "reasons": ["formula", "value"]}], "missing": []},
                ),
                (
                    "reports-missing-formula",
                    [{"B2": {"formula": "=1+1", "value": 2}}, {}, {}],
                    {"passed": False, "failures": ["formula-results", "missing"], "mismatches": [{"cell": "B2", "reasons": ["formula", "value"]}], "missing": ["B2"]},
                ),
            ],
            [
                "수식 text 보존과 cached/계산 값 검증을 둘 다 수행하세요.",
                "openpyxl이 계산 엔진이 아님을 명시하고 계산된 artifact 검증 tier를 기록하세요.",
            ],
        ),
        "retrieval": decision(
            "formula-name-recall",
            "수식·named range 품질 기준 회상하기",
            "참조·저장식·계산값 evidence를 복원한다.",
            "choose_formula_evidence",
            {
                "reference": {"action": "validate sheets and defined names", "evidence": "reference inventory", "risk": "broken reference"},
                "formula": {"action": "reopen with formulas preserved", "evidence": "formula text by cell", "risk": "literal replacement"},
                "value": {"action": "verify calculated output separately", "evidence": "business expected value", "risk": "stale cached result"},
            },
        ),
    },
    "05": {
        "mastery": T(
            "number-format-policy",
            "업무 semantic type별 Excel number format 판정하기",
            "통화·비율·날짜·정수 값에 맞는 format과 raw type을 검사한다.",
            "audit_number_formats(cells, policy)를 완성하세요.",
            "def audit_number_formats(cells, policy):\n    raise NotImplementedError",
            """def audit_number_formats(cells, policy):
    violations = []
    for cell in cells:
        semantic = cell["semantic"]
        contract = policy[semantic]
        reasons = []
        if cell.get("numberFormat") not in contract["formats"]:
            reasons.append("format")
        if type(cell.get("value")).__name__ not in contract["valueTypes"]:
            reasons.append("value-type")
        if reasons:
            violations.append({"cell": cell["cell"], "reasons": reasons})
    return {"accepted": not violations, "violations": violations}
""",
            "audit_number_formats",
            [
                (
                    "accepts-currency-and-percent",
                    [[{"cell": "B2", "semantic": "currency", "value": 1000, "numberFormat": "#,##0"}, {"cell": "C2", "semantic": "percent", "value": 0.25, "numberFormat": "0.0%"}], {"currency": {"formats": ["#,##0"], "valueTypes": ["int", "float"]}, "percent": {"formats": ["0.0%"], "valueTypes": ["float"]}}],
                    {"accepted": True, "violations": []},
                ),
                (
                    "reports-text-number-and-format",
                    [[{"cell": "B2", "semantic": "currency", "value": "1000", "numberFormat": "General"}], {"currency": {"formats": ["#,##0"], "valueTypes": ["int", "float"]}}],
                    {"accepted": False, "violations": [{"cell": "B2", "reasons": ["format", "value-type"]}]},
                ),
                (
                    "accepts-date-serial-contract",
                    [[{"cell": "A2", "semantic": "date", "value": "2026-07-22", "numberFormat": "yyyy-mm-dd"}], {"date": {"formats": ["yyyy-mm-dd"], "valueTypes": ["str"]}}],
                    {"accepted": True, "violations": []},
                ),
            ],
            [
                "표시 format으로 text 숫자를 숫자로 만들 수는 없습니다. raw type도 검사하세요.",
                "semantic type별 허용 format 목록을 workbook 계약에 두세요.",
            ],
        ),
        "transfer": T(
            "style-consistency-audit",
            "새 workbook의 header·data style 일관성 감사 전이하기",
            "role별 style signature가 하나인지와 과도한 unique style 수를 검사한다.",
            "audit_style_consistency(cells, maximum_unique_styles)를 완성하세요.",
            "def audit_style_consistency(cells, maximum_unique_styles):\n    raise NotImplementedError",
            """def audit_style_consistency(cells, maximum_unique_styles):
    by_role = {}
    all_styles = set()
    for cell in cells:
        signature = cell["style"]
        by_role.setdefault(cell["role"], set()).add(signature)
        all_styles.add(signature)
    inconsistent = sorted(role for role, styles in by_role.items() if len(styles) > 1)
    failures = []
    if inconsistent:
        failures.append("role-consistency")
    if len(all_styles) > maximum_unique_styles:
        failures.append("style-budget")
    return {"accepted": not failures, "failures": failures, "inconsistentRoles": inconsistent, "uniqueStyleCount": len(all_styles)}
""",
            "audit_style_consistency",
            [
                (
                    "accepts-consistent-role-styles",
                    [[{"cell": "A1", "role": "header", "style": "h"}, {"cell": "B1", "role": "header", "style": "h"}, {"cell": "A2", "role": "data", "style": "d"}], 3],
                    {"accepted": True, "failures": [], "inconsistentRoles": [], "uniqueStyleCount": 2},
                ),
                (
                    "reports-role-inconsistency",
                    [[{"cell": "A1", "role": "header", "style": "h1"}, {"cell": "B1", "role": "header", "style": "h2"}], 3],
                    {"accepted": False, "failures": ["role-consistency"], "inconsistentRoles": ["header"], "uniqueStyleCount": 2},
                ),
                (
                    "reports-style-budget",
                    [[{"cell": "A", "role": "a", "style": "1"}, {"cell": "B", "role": "b", "style": "2"}, {"cell": "C", "role": "c", "style": "3"}], 2],
                    {"accepted": False, "failures": ["style-budget"], "inconsistentRoles": [], "uniqueStyleCount": 3},
                ),
            ],
            [
                "cell마다 새 style을 만들지 말고 role별 style signature를 재사용하세요.",
                "워크북 전체 unique style budget을 검사해 file 비대화를 막으세요.",
            ],
        ),
        "retrieval": decision(
            "cell-format-recall",
            "셀 서식·숫자 format 품질 기준 회상하기",
            "raw type·semantic format·style budget 근거를 복원한다.",
            "choose_cell_format_evidence",
            {
                "number": {"action": "validate raw type and semantic format", "evidence": "cell value type and format", "risk": "text masquerading as number"},
                "style": {"action": "reuse role-based signatures", "evidence": "styles by role", "risk": "inconsistent workbook"},
                "budget": {"action": "bound unique styles", "evidence": "unique style count", "risk": "bloated xlsx"},
            },
        ),
    },
    "06": {
        "mastery": T(
            "conditional-format-rule-audit",
            "조건부서식 rule의 range·priority·formula 감사하기",
            "중복 priority와 빈 range, formula 누락을 차단한다.",
            "audit_conditional_rules(rules)를 완성하세요.",
            "def audit_conditional_rules(rules):\n    raise NotImplementedError",
            """def audit_conditional_rules(rules):
    failures = []
    priorities = [rule["priority"] for rule in rules]
    duplicate_priorities = sorted({value for value in priorities if priorities.count(value) > 1})
    invalid = []
    for rule in rules:
        reasons = []
        if not rule.get("range"):
            reasons.append("range")
        if rule.get("type") == "formula" and not str(rule.get("formula", "")).startswith("="):
            reasons.append("formula")
        if reasons:
            invalid.append({"id": rule["id"], "reasons": reasons})
    if duplicate_priorities:
        failures.append("priority")
    if invalid:
        failures.append("rules")
    return {"accepted": not failures, "failures": failures, "duplicatePriorities": duplicate_priorities, "invalidRules": invalid}
""",
            "audit_conditional_rules",
            [
                (
                    "accepts-prioritized-rules",
                    [[{"id": "negative", "priority": 1, "range": "B2:B10", "type": "formula", "formula": "=B2<0"}, {"id": "high", "priority": 2, "range": "B2:B10", "type": "cellIs"}]],
                    {"accepted": True, "failures": [], "duplicatePriorities": [], "invalidRules": []},
                ),
                (
                    "reports-duplicate-priority",
                    [[{"id": "a", "priority": 1, "range": "A1", "type": "cellIs"}, {"id": "b", "priority": 1, "range": "B1", "type": "cellIs"}]],
                    {"accepted": False, "failures": ["priority"], "duplicatePriorities": [1], "invalidRules": []},
                ),
                (
                    "reports-empty-range-and-formula",
                    [[{"id": "bad", "priority": 1, "range": "", "type": "formula", "formula": "A1>0"}]],
                    {"accepted": False, "failures": ["rules"], "duplicatePriorities": [], "invalidRules": [{"id": "bad", "reasons": ["range", "formula"]}]},
                ),
            ],
            [
                "조건부서식 rule priority를 전역에서 유일하게 관리하세요.",
                "formula rule은 `=` prefix와 적용 range를 함께 검사하세요.",
            ],
        ),
        "transfer": T(
            "conditional-format-coverage",
            "새 조건부서식에 data range coverage 전이하기",
            "필수 data cells가 최소 한 rule에 포함되고 header는 제외되는지 판정한다.",
            "audit_conditional_coverage(required_cells, header_cells, rule_cells)를 완성하세요.",
            "def audit_conditional_coverage(required_cells, header_cells, rule_cells):\n    raise NotImplementedError",
            """def audit_conditional_coverage(required_cells, header_cells, rule_cells):
    covered = set()
    for cells in rule_cells.values():
        covered.update(cells)
    missing = sorted(set(required_cells) - covered)
    header_overlap = sorted(set(header_cells) & covered)
    duplicated = sorted(cell for cell in required_cells if sum(cell in cells for cells in rule_cells.values()) > 1)
    return {"accepted": not missing and not header_overlap, "missing": missing, "headerOverlap": header_overlap, "multipleRules": duplicated}
""",
            "audit_conditional_coverage",
            [
                (
                    "accepts-complete-data-coverage",
                    [["B2", "B3"], ["B1"], {"negative": ["B2"], "positive": ["B3"]}],
                    {"accepted": True, "missing": [], "headerOverlap": [], "multipleRules": []},
                ),
                (
                    "reports-missing-and-header-overlap",
                    [["B2", "B3"], ["B1"], {"rule": ["B1", "B2"]}],
                    {"accepted": False, "missing": ["B3"], "headerOverlap": ["B1"], "multipleRules": []},
                ),
                (
                    "reports-multiple-rules-without-blocking",
                    [["B2"], [], {"a": ["B2"], "b": ["B2"]}],
                    {"accepted": True, "missing": [], "headerOverlap": [], "multipleRules": ["B2"]},
                ),
            ],
            [
                "data cell coverage와 header exclusion을 함께 검사하세요.",
                "여러 rule이 겹치는 cell은 priority 검토 대상으로 별도 보고하세요.",
            ],
        ),
        "retrieval": decision(
            "conditional-format-recall",
            "조건부서식 품질 기준 회상하기",
            "rule·priority·coverage evidence를 복원한다.",
            "choose_conditional_format_evidence",
            {
                "rule": {"action": "validate type formula and range", "evidence": "rule manifest", "risk": "invalid expression"},
                "priority": {"action": "order overlapping rules explicitly", "evidence": "priority list", "risk": "unexpected style"},
                "coverage": {"action": "compare data and header cells", "evidence": "missing overlap matrix", "risk": "unstyled data or styled header"},
            },
        ),
    },
    "07": {
        "mastery": T(
            "chart-contract-audit",
            "Excel chart의 category·series·title·placement 계약 감사하기",
            "series 길이와 category 길이, 빈 title, cell placement를 검사한다.",
            "audit_chart_contract(chart)를 완성하세요.",
            "def audit_chart_contract(chart):\n    raise NotImplementedError",
            """def audit_chart_contract(chart):
    failures = []
    if not chart.get("title"):
        failures.append("title")
    category_count = len(chart.get("categories", []))
    invalid_series = sorted(series["name"] for series in chart.get("series", []) if len(series.get("values", [])) != category_count)
    if not chart.get("series") or invalid_series:
        failures.append("series")
    if not chart.get("anchorCell"):
        failures.append("placement")
    return {"ready": not failures, "failures": failures, "categoryCount": category_count, "invalidSeries": invalid_series}
""",
            "audit_chart_contract",
            [
                (
                    "accepts-matched-chart-data",
                    [{"title": "Monthly Sales", "categories": ["Jan", "Feb"], "series": [{"name": "Sales", "values": [10, 20]}], "anchorCell": "E2"}],
                    {"ready": True, "failures": [], "categoryCount": 2, "invalidSeries": []},
                ),
                (
                    "reports-title-series-and-placement",
                    [{"title": "", "categories": ["Jan", "Feb"], "series": [{"name": "Sales", "values": [10]}], "anchorCell": ""}],
                    {"ready": False, "failures": ["title", "series", "placement"], "categoryCount": 2, "invalidSeries": ["Sales"]},
                ),
                (
                    "reports-missing-series",
                    [{"title": "Empty", "categories": [], "series": [], "anchorCell": "A1"}],
                    {"ready": False, "failures": ["series"], "categoryCount": 0, "invalidSeries": []},
                ),
            ],
            [
                "category와 모든 series의 data point 수를 일치시키세요.",
                "chart title과 anchor cell을 artifact 계약에 포함하세요.",
            ],
        ),
        "transfer": T(
            "chart-source-reconciliation",
            "새 chart의 source range·rendered series reconciliation 전이하기",
            "계획한 sheet/range와 재개방 chart series를 대조한다.",
            "reconcile_chart_sources(planned, observed)를 완성하세요.",
            "def reconcile_chart_sources(planned, observed):\n    raise NotImplementedError",
            """def reconcile_chart_sources(planned, observed):
    observed_map = {item["chartId"]: item for item in observed}
    missing = []
    mismatches = []
    for chart in planned:
        chart_id = chart["chartId"]
        if chart_id not in observed_map:
            missing.append(chart_id)
            continue
        actual = observed_map[chart_id]
        reasons = []
        for key in ["categoryRange", "seriesRanges", "anchorCell"]:
            if actual.get(key) != chart.get(key):
                reasons.append(key)
        if reasons:
            mismatches.append({"chartId": chart_id, "reasons": reasons})
    return {"passed": not missing and not mismatches, "missing": sorted(missing), "mismatches": mismatches}
""",
            "reconcile_chart_sources",
            [
                (
                    "accepts-chart-source-and-placement",
                    [[{"chartId": "sales", "categoryRange": "Data!A2:A3", "seriesRanges": ["Data!B2:B3"], "anchorCell": "E2"}], [{"chartId": "sales", "categoryRange": "Data!A2:A3", "seriesRanges": ["Data!B2:B3"], "anchorCell": "E2"}]],
                    {"passed": True, "missing": [], "mismatches": []},
                ),
                (
                    "reports-source-and-placement-mismatch",
                    [[{"chartId": "sales", "categoryRange": "Data!A2:A3", "seriesRanges": ["Data!B2:B3"], "anchorCell": "E2"}], [{"chartId": "sales", "categoryRange": "Data!A2:A4", "seriesRanges": ["Data!C2:C4"], "anchorCell": "F2"}]],
                    {"passed": False, "missing": [], "mismatches": [{"chartId": "sales", "reasons": ["categoryRange", "seriesRanges", "anchorCell"]}]},
                ),
                (
                    "reports-missing-chart",
                    [[{"chartId": "sales", "categoryRange": "A", "seriesRanges": [], "anchorCell": "E2"}], []],
                    {"passed": False, "missing": ["sales"], "mismatches": []},
                ),
            ],
            [
                "chart 객체 수가 아니라 category/series source range를 재개방 후 비교하세요.",
                "anchor cell도 layout artifact의 일부로 검증하세요.",
            ],
        ),
        "retrieval": decision(
            "excel-chart-recall",
            "Excel chart 품질 기준 회상하기",
            "data shape·source range·placement evidence를 복원한다.",
            "choose_chart_evidence",
            {
                "shape": {"action": "match categories and series lengths", "evidence": "point counts", "risk": "shifted chart"},
                "source": {"action": "bind sheet ranges", "evidence": "category and series references", "risk": "wrong data"},
                "artifact": {"action": "reopen chart and placement", "evidence": "chart manifest", "risk": "missing or moved chart"},
            },
        ),
    },
    "08": {
        "mastery": T(
            "media-link-contract",
            "Excel 이미지·하이퍼링크의 alt text·origin 계약 감사하기",
            "이미지 크기·설명과 허용 origin 밖 링크를 검사한다.",
            "audit_media_links(images, links, allowed_origins, maximum_image_pixels)를 완성하세요.",
            "def audit_media_links(images, links, allowed_origins, maximum_image_pixels):\n    raise NotImplementedError",
            """def audit_media_links(images, links, allowed_origins, maximum_image_pixels):
    from urllib.parse import urlsplit
    image_failures = []
    for image in images:
        reasons = []
        if not image.get("altText"):
            reasons.append("alt-text")
        if image.get("width", 0) * image.get("height", 0) > maximum_image_pixels:
            reasons.append("pixel-budget")
        if reasons:
            image_failures.append({"id": image["id"], "reasons": reasons})
    link_failures = []
    for link in links:
        parts = urlsplit(link["url"])
        origin = f"{parts.scheme}://{parts.netloc}"
        if parts.scheme not in {"http", "https"} or origin not in allowed_origins:
            link_failures.append({"cell": link["cell"], "origin": origin})
    return {"accepted": not image_failures and not link_failures, "imageFailures": image_failures, "linkFailures": link_failures}
""",
            "audit_media_links",
            [
                (
                    "accepts-described-image-and-link",
                    [[{"id": "logo", "altText": "Company logo", "width": 100, "height": 50}], [{"cell": "A1", "url": "https://example.test/report"}], ["https://example.test"], 10000],
                    {"accepted": True, "imageFailures": [], "linkFailures": []},
                ),
                (
                    "reports-image-contract-failures",
                    [[{"id": "photo", "altText": "", "width": 1000, "height": 1000}], [], [], 10000],
                    {"accepted": False, "imageFailures": [{"id": "photo", "reasons": ["alt-text", "pixel-budget"]}], "linkFailures": []},
                ),
                (
                    "reports-disallowed-link-origin",
                    [[], [{"cell": "B2", "url": "https://other.test/x"}], ["https://example.test"], 1],
                    {"accepted": False, "imageFailures": [], "linkFailures": [{"cell": "B2", "origin": "https://other.test"}]},
                ),
            ],
            [
                "이미지는 alt text와 pixel budget을 artifact 계약에 포함하세요.",
                "하이퍼링크는 URL 문자열이 아니라 normalized origin allowlist로 검사하세요.",
            ],
        ),
        "transfer": T(
            "media-artifact-reconciliation",
            "새 workbook의 media relationship reconciliation 전이하기",
            "계획한 image·link identity가 재개방 package relationship에 존재하는지 검사한다.",
            "reconcile_media_relationships(planned, observed)를 완성하세요.",
            "def reconcile_media_relationships(planned, observed):\n    raise NotImplementedError",
            """def reconcile_media_relationships(planned, observed):
    planned_ids = {(item["kind"], item["anchor"], item["targetHash"]) for item in planned}
    observed_ids = {(item["kind"], item["anchor"], item["targetHash"]) for item in observed}
    missing = sorted([list(item) for item in planned_ids - observed_ids])
    unexpected = sorted([list(item) for item in observed_ids - planned_ids])
    return {"passed": not missing and not unexpected, "missing": missing, "unexpected": unexpected}
""",
            "reconcile_media_relationships",
            [
                (
                    "accepts-image-and-link-relationships",
                    [[{"kind": "image", "anchor": "A1", "targetHash": "img"}, {"kind": "link", "anchor": "B2", "targetHash": "url"}], [{"kind": "link", "anchor": "B2", "targetHash": "url"}, {"kind": "image", "anchor": "A1", "targetHash": "img"}]],
                    {"passed": True, "missing": [], "unexpected": []},
                ),
                (
                    "reports-missing-media",
                    [[{"kind": "image", "anchor": "A1", "targetHash": "img"}], []],
                    {"passed": False, "missing": [["image", "A1", "img"]], "unexpected": []},
                ),
                (
                    "reports-unexpected-link",
                    [[], [{"kind": "link", "anchor": "A1", "targetHash": "x"}]],
                    {"passed": False, "missing": [], "unexpected": [["link", "A1", "x"]]},
                ),
            ],
            [
                "cell 값만 재개방하지 말고 xlsx package media relationship도 대조하세요.",
                "target 원문 대신 image bytes나 URL의 hash를 identity로 사용하세요.",
            ],
        ),
        "retrieval": decision(
            "excel-media-recall",
            "Excel 이미지·하이퍼링크 품질 기준 회상하기",
            "설명·origin·relationship evidence를 복원한다.",
            "choose_excel_media_evidence",
            {
                "image": {"action": "bound pixels and add alt text", "evidence": "image descriptor", "risk": "bloated inaccessible workbook"},
                "link": {"action": "allowlist normalized origin", "evidence": "cell and URL hash", "risk": "unsafe destination"},
                "verify": {"action": "reconcile package relationships", "evidence": "anchor and target hash", "risk": "missing media"},
            },
        ),
    },
    "09": {
        "mastery": T(
            "table-validation-contract",
            "Excel table header·range와 data validation 계약 감사하기",
            "빈·중복 header, table 이름 충돌, validation source 누락을 검사한다.",
            "audit_table_validation(tables, validations)를 완성하세요.",
            "def audit_table_validation(tables, validations):\n    raise NotImplementedError",
            """def audit_table_validation(tables, validations):
    failures = []
    table_names = [table["name"] for table in tables]
    duplicate_tables = sorted({name for name in table_names if table_names.count(name) > 1})
    invalid_tables = []
    for table in tables:
        headers = table.get("headers", [])
        reasons = []
        if not headers or any(not header for header in headers) or len(headers) != len(set(headers)):
            reasons.append("headers")
        if not table.get("range"):
            reasons.append("range")
        if reasons:
            invalid_tables.append({"name": table["name"], "reasons": reasons})
    invalid_validations = sorted(item["range"] for item in validations if item.get("type") == "list" and not item.get("source"))
    if duplicate_tables:
        failures.append("table-names")
    if invalid_tables:
        failures.append("tables")
    if invalid_validations:
        failures.append("validations")
    return {"accepted": not failures, "failures": failures, "duplicateTables": duplicate_tables, "invalidTables": invalid_tables, "invalidValidations": invalid_validations}
""",
            "audit_table_validation",
            [
                (
                    "accepts-table-and-list-validation",
                    [[{"name": "Sales", "range": "A1:B3", "headers": ["Month", "Amount"]}], [{"range": "A2:A3", "type": "list", "source": ["Jan", "Feb"]}]],
                    {"accepted": True, "failures": [], "duplicateTables": [], "invalidTables": [], "invalidValidations": []},
                ),
                (
                    "reports-duplicate-table-and-headers",
                    [[{"name": "T", "range": "A1", "headers": ["A", "A"]}, {"name": "T", "range": "B1", "headers": ["B"]}], []],
                    {"accepted": False, "failures": ["table-names", "tables"], "duplicateTables": ["T"], "invalidTables": [{"name": "T", "reasons": ["headers"]}], "invalidValidations": []},
                ),
                (
                    "reports-missing-validation-source",
                    [[], [{"range": "B2:B10", "type": "list", "source": []}]],
                    {"accepted": False, "failures": ["validations"], "duplicateTables": [], "invalidTables": [], "invalidValidations": ["B2:B10"]},
                ),
            ],
            [
                "table header는 비어 있지 않고 table 안에서 유일해야 합니다.",
                "list validation은 source identity와 적용 range를 함께 검증하세요.",
            ],
        ),
        "transfer": T(
            "table-row-reconciliation",
            "새 Excel table에 source row reconciliation 전이하기",
            "primary key와 row hash로 workbook table과 source를 대조한다.",
            "reconcile_table_rows(source_rows, workbook_rows, key_field)를 완성하세요.",
            "def reconcile_table_rows(source_rows, workbook_rows, key_field):\n    raise NotImplementedError",
            """def reconcile_table_rows(source_rows, workbook_rows, key_field):
    def index(rows):
        result = {}
        duplicates = []
        for row in rows:
            key = row[key_field]
            if key in result:
                duplicates.append(key)
            result[key] = row["rowHash"]
        return result, sorted(set(duplicates))
    source, source_duplicates = index(source_rows)
    workbook, workbook_duplicates = index(workbook_rows)
    missing = sorted(set(source) - set(workbook))
    unexpected = sorted(set(workbook) - set(source))
    changed = sorted(key for key in set(source) & set(workbook) if source[key] != workbook[key])
    return {"passed": not source_duplicates and not workbook_duplicates and not missing and not unexpected and not changed, "sourceDuplicates": source_duplicates, "workbookDuplicates": workbook_duplicates, "missing": missing, "unexpected": unexpected, "changed": changed}
""",
            "reconcile_table_rows",
            [
                (
                    "accepts-reordered-identical-rows",
                    [[{"id": "a", "rowHash": "x"}, {"id": "b", "rowHash": "y"}], [{"id": "b", "rowHash": "y"}, {"id": "a", "rowHash": "x"}], "id"],
                    {"passed": True, "sourceDuplicates": [], "workbookDuplicates": [], "missing": [], "unexpected": [], "changed": []},
                ),
                (
                    "reports-missing-unexpected-and-changed",
                    [[{"id": "a", "rowHash": "x"}, {"id": "b", "rowHash": "y"}], [{"id": "a", "rowHash": "z"}, {"id": "c", "rowHash": "q"}], "id"],
                    {"passed": False, "sourceDuplicates": [], "workbookDuplicates": [], "missing": ["b"], "unexpected": ["c"], "changed": ["a"]},
                ),
                (
                    "reports-duplicate-primary-key",
                    [[{"id": "a", "rowHash": "x"}, {"id": "a", "rowHash": "x"}], [], "id"],
                    {"passed": False, "sourceDuplicates": ["a"], "workbookDuplicates": [], "missing": ["a"], "unexpected": [], "changed": []},
                ),
            ],
            [
                "row 순서가 아니라 primary key와 row hash로 table을 대조하세요.",
                "source와 workbook 양쪽의 duplicate key를 따로 보고하세요.",
            ],
        ),
        "retrieval": decision(
            "excel-table-validation-recall",
            "Excel table·data validation 품질 기준 회상하기",
            "header·validation·row reconciliation 근거를 복원한다.",
            "choose_table_validation_evidence",
            {
                "table": {"action": "validate unique headers and range", "evidence": "table manifest", "risk": "ambiguous column"},
                "validation": {"action": "bind type source and range", "evidence": "validation contract", "risk": "invalid user input"},
                "rows": {"action": "reconcile primary key and row hash", "evidence": "missing unexpected changed", "risk": "silent row drift"},
            },
        ),
    },
    "10": {
        "mastery": T(
            "monthly-sales-report",
            "월간 매출 workbook의 원천·요약·chart·formula reconciliation 감사하기",
            "원천 합계와 요약 합계, 월 coverage, 필수 artifact를 함께 판정한다.",
            "audit_monthly_sales_report(source_rows, summary_rows, artifact_manifest, required_months, output_path)를 완성해 reconciliation 결과를 반환하고, output_path에는 같은 결과를 한 행짜리 JSON table로 저장하세요.",
            "def audit_monthly_sales_report(source_rows, summary_rows, artifact_manifest, required_months, output_path=None):\n    raise NotImplementedError",
            """import json
from pathlib import Path


def audit_monthly_sales_report(source_rows, summary_rows, artifact_manifest, required_months, output_path=None):
    source_totals = {}
    for row in source_rows:
        source_totals[row["month"]] = source_totals.get(row["month"], 0) + row["amount"]
    summary_totals = {row["month"]: row["amount"] for row in summary_rows}
    missing_months = sorted(set(required_months) - set(summary_totals))
    mismatches = sorted(month for month in set(source_totals) | set(summary_totals) if source_totals.get(month, 0) != summary_totals.get(month, 0))
    required_artifacts = {"RawTable", "SummaryTable", "MonthlyChart", "TotalFormula"}
    missing_artifacts = sorted(required_artifacts - set(artifact_manifest))
    failures = []
    if missing_months:
        failures.append("month-coverage")
    if mismatches:
        failures.append("totals")
    if missing_artifacts:
        failures.append("artifacts")
    result = {"passed": not failures, "failures": failures, "missingMonths": missing_months, "mismatchedMonths": mismatches, "missingArtifacts": missing_artifacts, "sourceGrandTotal": sum(source_totals.values()), "summaryGrandTotal": sum(summary_totals.values())}
    unexpected_months = set(summary_totals) - set(required_months)
    default_path = "output/reconciled-report.json" if result["passed"] else "output/unexpected-month-report.json" if unexpected_months else "output/gap-report.json"
    target = Path(output_path or default_path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps([result], ensure_ascii=False, sort_keys=True, indent=2), encoding="utf-8")
    return result
""",
            "audit_monthly_sales_report",
            [
                (
                    "accepts-reconciled-two-month-report",
                    [[{"month": "2026-01", "amount": 10}, {"month": "2026-01", "amount": 5}, {"month": "2026-02", "amount": 20}], [{"month": "2026-01", "amount": 15}, {"month": "2026-02", "amount": 20}], ["RawTable", "SummaryTable", "MonthlyChart", "TotalFormula"], ["2026-01", "2026-02"], "output/reconciled-report.json"],
                    {"passed": True, "failures": [], "missingMonths": [], "mismatchedMonths": [], "missingArtifacts": [], "sourceGrandTotal": 35, "summaryGrandTotal": 35},
                ),
                (
                    "reports-month-total-and-artifact-gaps",
                    [[{"month": "2026-01", "amount": 10}], [{"month": "2026-01", "amount": 9}], ["RawTable"], ["2026-01", "2026-02"], "output/gap-report.json"],
                    {"passed": False, "failures": ["month-coverage", "totals", "artifacts"], "missingMonths": ["2026-02"], "mismatchedMonths": ["2026-01"], "missingArtifacts": ["MonthlyChart", "SummaryTable", "TotalFormula"], "sourceGrandTotal": 10, "summaryGrandTotal": 9},
                ),
                (
                    "reports-unexpected-summary-month-total",
                    [[], [{"month": "2026-03", "amount": 1}], ["RawTable", "SummaryTable", "MonthlyChart", "TotalFormula"], [], "output/unexpected-month-report.json"],
                    {"passed": False, "failures": ["totals"], "missingMonths": [], "mismatchedMonths": ["2026-03"], "missingArtifacts": [], "sourceGrandTotal": 0, "summaryGrandTotal": 1},
                ),
            ],
            [
                "요약 sheet 총합을 원천 row에서 월별로 다시 계산하고 같은 판정을 JSON audit에 보존하세요.",
                "실제 xlsx 졸업 증거와 Web의 reconciliation table을 혼동하지 마세요.",
            ],
            expectedPaths=[
                {"path": "output/reconciled-report.json", "kind": "table", "origin": "created", "format": "json", "columns": ["failures", "mismatchedMonths", "missingArtifacts", "missingMonths", "passed", "sourceGrandTotal", "summaryGrandTotal"]},
                {"path": "output/gap-report.json", "kind": "table", "origin": "created", "format": "json", "columns": ["failures", "mismatchedMonths", "missingArtifacts", "missingMonths", "passed", "sourceGrandTotal", "summaryGrandTotal"]},
                {"path": "output/unexpected-month-report.json", "kind": "table", "origin": "created", "format": "json", "columns": ["failures", "mismatchedMonths", "missingArtifacts", "missingMonths", "passed", "sourceGrandTotal", "summaryGrandTotal"]},
            ],
        ),
        "transfer": T(
            "monthly-report-release",
            "새 월간 workbook의 재개방·idempotency release gate 전이하기",
            "같은 source hash에서 두 번 생성한 workbook의 business·structure hash를 비교한다.",
            "decide_monthly_report_release(runs, current_source_hash)를 완성하세요.",
            "def decide_monthly_report_release(runs, current_source_hash):\n    raise NotImplementedError",
            """def decide_monthly_report_release(runs, current_source_hash):
    current = [run for run in runs if run["sourceHash"] == current_source_hash]
    stale = sorted(run["id"] for run in runs if run["sourceHash"] != current_source_hash)
    failures = []
    if len(current) < 2:
        failures.append("repeat-evidence")
    if any(not run.get("reopened", False) or not run.get("businessPassed", False) for run in current):
        failures.append("verification")
    workbook_hashes = {run["workbookHash"] for run in current}
    business_hashes = {run["businessHash"] for run in current}
    if len(workbook_hashes) != 1 or len(business_hashes) != 1:
        failures.append("determinism")
    return {"releaseReady": not failures and not stale, "failures": failures, "staleRuns": stale, "currentRunCount": len(current)}
""",
            "decide_monthly_report_release",
            [
                (
                    "accepts-two-current-deterministic-runs",
                    [[{"id": "a", "sourceHash": "s", "reopened": True, "businessPassed": True, "workbookHash": "w", "businessHash": "b"}, {"id": "b", "sourceHash": "s", "reopened": True, "businessPassed": True, "workbookHash": "w", "businessHash": "b"}], "s"],
                    {"releaseReady": True, "failures": [], "staleRuns": [], "currentRunCount": 2},
                ),
                (
                    "reports-single-unverified-run",
                    [[{"id": "a", "sourceHash": "s", "reopened": False, "businessPassed": False, "workbookHash": "w", "businessHash": "b"}], "s"],
                    {"releaseReady": False, "failures": ["repeat-evidence", "verification"], "staleRuns": [], "currentRunCount": 1},
                ),
                (
                    "reports-nondeterministic-and-stale",
                    [[{"id": "old", "sourceHash": "old", "reopened": True, "businessPassed": True, "workbookHash": "w", "businessHash": "b"}, {"id": "a", "sourceHash": "s", "reopened": True, "businessPassed": True, "workbookHash": "w1", "businessHash": "b"}, {"id": "b", "sourceHash": "s", "reopened": True, "businessPassed": True, "workbookHash": "w2", "businessHash": "b"}], "s"],
                    {"releaseReady": False, "failures": ["determinism"], "staleRuns": ["old"], "currentRunCount": 2},
                ),
            ],
            [
                "같은 source에서 반복 생성한 workbook과 business hash를 비교하세요.",
                "각 run은 저장 후 재개방과 업무 reconciliation을 모두 통과해야 합니다.",
            ],
        ),
        "retrieval": decision(
            "monthly-sales-capstone-recall",
            "월간 매출 workbook 종료 조건 회상하기",
            "원천·요약·artifact·재개방·반복 생성 근거를 복원한다.",
            "choose_monthly_report_gate",
            {
                "business": {"action": "recompute monthly totals from source", "evidence": "month and grand-total reconciliation", "risk": "wrong summary"},
                "artifact": {"action": "reopen tables formulas and chart", "evidence": "workbook manifest", "risk": "valid but incomplete xlsx"},
                "release": {"action": "repeat with same source hash", "evidence": "deterministic workbook and business hashes", "risk": "non-idempotent report"},
            },
        ),
    },
}
