from __future__ import annotations

from .common import TaskBlueprint, task


T = task


EXCEL_BLUEPRINTS: dict[str, dict[str, TaskBlueprint]] = {
    "01": {
        "mastery": T(
            "excel-tool-selection", "Excel 업무에 openpyxl·xlwings를 근거로 선택하기", "Desktop Excel 의존성과 artifact 요구에서 도구를 결정한다.", "choose_excel_tool(requirements)를 완성하세요.", "def choose_excel_tool(requirements):\n    raise NotImplementedError",
            """def choose_excel_tool(requirements):
    desktop_reasons = []
    if requirements.get("liveExcel"):
        desktop_reasons.append("live-excel")
    if requirements.get("macro"):
        desktop_reasons.append("macro")
    if requirements.get("UDF"):
        desktop_reasons.append("udf")
    tool = "xlwings" if desktop_reasons else "openpyxl"
    return {"tool": tool, "desktopReasons": desktop_reasons, "webPractice": ["sheet schema", "formula contract", "business reconciliation"]}
""", "choose_excel_tool",
            [("chooses-portable-artifact-tool", [{"createXlsx": True}], {"tool": "openpyxl", "desktopReasons": [], "webPractice": ["sheet schema", "formula contract", "business reconciliation"]}), ("chooses-live-excel-control", [{"liveExcel": True, "macro": True}], {"tool": "xlwings", "desktopReasons": ["live-excel", "macro"], "webPractice": ["sheet schema", "formula contract", "business reconciliation"]}), ("chooses-udf-runtime", [{"UDF": True}], {"tool": "xlwings", "desktopReasons": ["udf"], "webPractice": ["sheet schema", "formula contract", "business reconciliation"]})],
            ["익숙한 도구가 아니라 작업 capability로 선택하세요.", "Web에서 연습할 판단과 Local에서 필요한 Excel 효과를 함께 반환하세요."],
        ),
        "transfer": T(
            "excel-tool-tradeoff", "새 업무 제약에 Excel 도구 선택 전이하기", "운영체제·병렬성·렌더 요구를 점수화한다.", "score_excel_tools(constraints)를 완성하세요.", "def score_excel_tools(constraints):\n    raise NotImplementedError",
            """def score_excel_tools(constraints):
    scores = {"openpyxl": 0, "xlwings": 0}
    reasons = []
    if constraints.get("crossPlatform"):
        scores["openpyxl"] += 2
        reasons.append("cross-platform")
    if constraints.get("parallelWorkers", 1) > 1:
        scores["openpyxl"] += 2
        reasons.append("parallel-workers")
    if constraints.get("exactExcelRender"):
        scores["xlwings"] += 3
        reasons.append("excel-render")
    if constraints.get("macro"):
        scores["xlwings"] += 3
        reasons.append("macro")
    selected = sorted(scores, key=lambda key: (-scores[key], key))[0]
    return {"selected": selected, "scores": scores, "reasons": reasons}
""", "score_excel_tools",
            [("selects-cross-platform", [{"crossPlatform": True, "parallelWorkers": 4}], {"selected": "openpyxl", "scores": {"openpyxl": 4, "xlwings": 0}, "reasons": ["cross-platform", "parallel-workers"]}), ("selects-excel-render", [{"exactExcelRender": True}], {"selected": "xlwings", "scores": {"openpyxl": 0, "xlwings": 3}, "reasons": ["excel-render"]}), ("resolves-tie-deterministically", [{}], {"selected": "openpyxl", "scores": {"openpyxl": 0, "xlwings": 0}, "reasons": []})],
            ["운영 제약마다 선택 근거와 가중치를 드러내세요.", "동점 규칙도 결정론적으로 고정하세요."],
        ),
        "retrieval": T(
            "excel-tool-rule-recall", "Excel 도구 선택 기준 회상하기", "artifact와 Desktop automation 경계를 기억에서 복원한다.", "recall_excel_tool(use_case)를 완성하세요.", "def recall_excel_tool(use_case):\n    raise NotImplementedError",
            """def recall_excel_tool(use_case):
    table = {"xlsx-artifact": {"tool": "openpyxl", "evidence": "reopened workbook", "risk": "render differs from Excel"}, "live-session": {"tool": "xlwings", "evidence": "pid and workbook path", "risk": "wrong Excel instance"}, "macro": {"tool": "xlwings", "evidence": "signed allowlisted call", "risk": "untrusted code"}}
    if use_case not in table:
        raise ValueError("unknown use case")
    return table[use_case]
""", "recall_excel_tool",
            [("recalls-artifact", ["xlsx-artifact"], {"tool": "openpyxl", "evidence": "reopened workbook", "risk": "render differs from Excel"}), ("recalls-live-session", ["live-session"], {"tool": "xlwings", "evidence": "pid and workbook path", "risk": "wrong Excel instance"}), ("recalls-macro", ["macro"], {"tool": "xlwings", "evidence": "signed allowlisted call", "risk": "untrusted code"})],
            ["파일 생성과 Desktop Excel 제어를 같은 capability로 취급하지 마세요.", "각 도구 선택에는 검증 evidence와 남는 risk가 있습니다."],
        ),
    },
    "02": {
        "mastery": T(
            "xlwings-environment-contract", "xlwings 실행 환경의 재현 가능성 감사하기", "Python·패키지·Excel·운영체제 요구를 한 계약으로 검증한다.", "audit_xlwings_environment(required, observed)를 완성하세요.", "def audit_xlwings_environment(required, observed):\n    raise NotImplementedError",
            """def audit_xlwings_environment(required, observed):
    missing = sorted(key for key, value in required.items() if value is True and not observed.get(key, False))
    mismatched = sorted(key for key, value in required.items() if not isinstance(value, bool) and observed.get(key) != value)
    return {"ready": not missing and not mismatched, "missing": missing, "mismatched": mismatched, "observed": {key: observed.get(key) for key in sorted(required)}}
""", "audit_xlwings_environment",
            [("accepts-pinned-environment", [{"python": "3.12", "xlwings": "0.31", "desktopExcel": True}, {"python": "3.12", "xlwings": "0.31", "desktopExcel": True}], {"ready": True, "missing": [], "mismatched": [], "observed": {"desktopExcel": True, "python": "3.12", "xlwings": "0.31"}}), ("reports-package-version", [{"python": "3.12", "xlwings": "0.31"}, {"python": "3.12", "xlwings": "0.30"}], {"ready": False, "missing": [], "mismatched": ["xlwings"], "observed": {"python": "3.12", "xlwings": "0.30"}}), ("reports-missing-excel", [{"desktopExcel": True}, {"desktopExcel": False}], {"ready": False, "missing": ["desktopExcel"], "mismatched": [], "observed": {"desktopExcel": False}})],
            ["설치 명령 성공보다 실제 runtime capability를 검사하세요.", "Python과 xlwings 버전은 환경 manifest에 고정하세요."],
        ),
        "transfer": T(
            "environment-remediation-plan", "환경 차이에서 최소 복구 계획 만들기", "누락 capability와 버전 불일치에 정확한 다음 행동을 연결한다.", "plan_environment_remediation(audit)를 완성하세요.", "def plan_environment_remediation(audit):\n    raise NotImplementedError",
            """def plan_environment_remediation(audit):
    actions = []
    for item in sorted(audit.get("missing", [])):
        actions.append({"target": item, "action": "provision-capability"})
    for item in sorted(audit.get("mismatched", [])):
        actions.append({"target": item, "action": "sync-pinned-version"})
    return {"actions": actions, "retryAudit": bool(actions), "ready": not actions}
""", "plan_environment_remediation",
            [("keeps-ready-environment", [{"missing": [], "mismatched": []}], {"actions": [], "retryAudit": False, "ready": True}), ("plans-capability", [{"missing": ["desktopExcel"], "mismatched": []}], {"actions": [{"target": "desktopExcel", "action": "provision-capability"}], "retryAudit": True, "ready": False}), ("plans-version-sync", [{"missing": ["macroExecution"], "mismatched": ["python", "xlwings"]}], {"actions": [{"target": "macroExecution", "action": "provision-capability"}, {"target": "python", "action": "sync-pinned-version"}, {"target": "xlwings", "action": "sync-pinned-version"}], "retryAudit": True, "ready": False})],
            ["광범위한 재설치보다 실패한 capability만 복구하세요.", "복구 뒤 동일 audit를 다시 실행하도록 표시하세요."],
        ),
        "retrieval": T(
            "environment-evidence-recall", "xlwings 환경 증거 회상하기", "버전·capability·smoke test를 구분한다.", "choose_environment_evidence(stage)를 완성하세요.", "def choose_environment_evidence(stage):\n    raise NotImplementedError",
            """def choose_environment_evidence(stage):
    table = {"versions": {"action": "record pinned runtime versions", "evidence": "environment manifest", "risk": "works only on author machine"}, "capability": {"action": "probe Excel and xlwings availability", "evidence": "capability audit", "risk": "package installed but Excel absent"}, "smoke": {"action": "open save close disposable workbook", "evidence": "lifecycle log", "risk": "broken integration"}}
    if stage not in table:
        raise ValueError("unknown stage")
    return table[stage]
""", "choose_environment_evidence",
            [("recalls-versions", ["versions"], {"action": "record pinned runtime versions", "evidence": "environment manifest", "risk": "works only on author machine"}), ("recalls-capability", ["capability"], {"action": "probe Excel and xlwings availability", "evidence": "capability audit", "risk": "package installed but Excel absent"}), ("recalls-smoke", ["smoke"], {"action": "open save close disposable workbook", "evidence": "lifecycle log", "risk": "broken integration"})],
            ["버전 기록과 실제 capability probe를 분리하세요.", "smoke test는 사용자의 기존 workbook이 아닌 disposable artifact로 실행하세요."],
        ),
    },
    "03": {
        "mastery": T(
            "xlwings-lite-capability", "xlwings Lite 지원 범위와 fallback 감사하기", "요구 기능을 지원하는지와 Local 전환 사유를 계산한다.", "plan_lite_execution(requirements, supported_features)를 완성하세요.", "def plan_lite_execution(requirements, supported_features):\n    raise NotImplementedError",
            """def plan_lite_execution(requirements, supported_features):
    required = sorted(key for key, needed in requirements.items() if needed)
    unsupported = sorted(set(required) - set(supported_features))
    return {"tier": "local" if unsupported else "web", "required": required, "unsupported": unsupported, "webRunnable": not unsupported}
""", "plan_lite_execution",
            [("keeps-supported-task-on-web", [{"rangeValues": True, "formulas": True}, ["rangeValues", "formulas"]], {"tier": "web", "required": ["formulas", "rangeValues"], "unsupported": [], "webRunnable": True}), ("routes-macro-local", [{"rangeValues": True, "macro": True}, ["rangeValues"]], {"tier": "local", "required": ["macro", "rangeValues"], "unsupported": ["macro"], "webRunnable": False}), ("handles-empty-task", [{}, []], {"tier": "web", "required": [], "unsupported": [], "webRunnable": True})],
            ["Lite 지원 여부를 추측하지 말고 capability set과 요구 set으로 비교하세요.", "지원하지 않는 기능만 명시적 Local 사유로 반환하세요."],
        ),
        "transfer": T(
            "lite-fallback-contract", "Lite에서 Local로 넘기는 handoff 계약 만들기", "Web에서 만든 계획·검증 케이스·source hash를 보존한다.", "build_lite_handoff(web_result, unsupported_features)를 완성하세요.", "def build_lite_handoff(web_result, unsupported_features):\n    raise NotImplementedError",
            """def build_lite_handoff(web_result, unsupported_features):
    required = {"planId", "sourceHash", "checksPassed"}
    missing = sorted(required - set(web_result))
    failures = []
    if not web_result.get("checksPassed", False):
        failures.append("web-checks")
    if not unsupported_features:
        failures.append("unnecessary-handoff")
    return {"ready": not missing and not failures, "missing": missing, "failures": failures, "localReasons": sorted(unsupported_features), "preservedEvidence": ["planId", "sourceHash", "checksPassed"]}
""", "build_lite_handoff",
            [("accepts-evidenced-handoff", [{"planId": "p1", "sourceHash": "h", "checksPassed": True}, ["macro"]], {"ready": True, "missing": [], "failures": [], "localReasons": ["macro"], "preservedEvidence": ["planId", "sourceHash", "checksPassed"]}), ("reports-failed-web-checks", [{"planId": "p1", "sourceHash": "h", "checksPassed": False}, ["desktopExcel"]], {"ready": False, "missing": [], "failures": ["web-checks"], "localReasons": ["desktopExcel"], "preservedEvidence": ["planId", "sourceHash", "checksPassed"]}), ("reports-missing-and-unnecessary", [{"checksPassed": True}, []], {"ready": False, "missing": ["planId", "sourceHash"], "failures": ["unnecessary-handoff"], "localReasons": [], "preservedEvidence": ["planId", "sourceHash", "checksPassed"]})],
            ["Local 전환은 Web 학습 결과를 버리는 재시작이 아니어야 합니다.", "plan ID, source hash, 통과한 check를 handoff에 보존하세요."],
        ),
        "retrieval": T(
            "lite-boundary-recall", "xlwings Lite 경계 원칙 회상하기", "지원 검사·Web 학습·Local handoff를 복원한다.", "choose_lite_evidence(stage)를 완성하세요.", "def choose_lite_evidence(stage):\n    raise NotImplementedError",
            """def choose_lite_evidence(stage):
    table = {"support": {"action": "compare requirement and capability sets", "evidence": "unsupported feature list", "risk": "false web parity"}, "learn": {"action": "run portable contract checks", "evidence": "behavior results", "risk": "download-only learning"}, "handoff": {"action": "preserve plan and source identity", "evidence": "local handoff manifest", "risk": "duplicated work"}}
    if stage not in table:
        raise ValueError("unknown stage")
    return table[stage]
""", "choose_lite_evidence",
            [("recalls-support", ["support"], {"action": "compare requirement and capability sets", "evidence": "unsupported feature list", "risk": "false web parity"}), ("recalls-learn", ["learn"], {"action": "run portable contract checks", "evidence": "behavior results", "risk": "download-only learning"}), ("recalls-handoff", ["handoff"], {"action": "preserve plan and source identity", "evidence": "local handoff manifest", "risk": "duplicated work"})],
            ["Web capability와 Desktop Excel capability를 과장 없이 구분하세요.", "지원되지 않는 효과도 그 전 단계 판단은 Web에서 학습할 수 있습니다."],
        ),
    },
}


PRACTICAL_BLUEPRINTS: dict[str, dict[str, TaskBlueprint]] = {
    "00": {
        "mastery": T(
            "office-workflow-admission", "실전 Office 자동화 업무의 입장 계약 감사하기", "목표·입력·산출물·권한·검증 없는 실행을 차단한다.", "audit_office_workflow(workflow)를 완성하세요.", "def audit_office_workflow(workflow):\n    raise NotImplementedError",
            """def audit_office_workflow(workflow):
    required = {"goal", "inputs", "output", "permissions", "verification"}
    missing = sorted(required - set(workflow))
    failures = []
    if not workflow.get("inputs"):
        failures.append("inputs")
    if workflow.get("destructive") and "destructive-write" not in workflow.get("permissions", []):
        failures.append("authorization")
    if not workflow.get("verification"):
        failures.append("verification")
    return {"ready": not missing and not failures, "missing": missing, "failures": failures, "riskLevel": "high" if workflow.get("destructive") else "bounded"}
""", "audit_office_workflow",
            [("accepts-bounded-workflow", [{"goal": "monthly report", "inputs": ["sales.csv"], "output": "report.xlsx", "permissions": [], "verification": ["reopen", "reconcile"]}], {"ready": True, "missing": [], "failures": [], "riskLevel": "bounded"}), ("reports-destructive-authorization", [{"goal": "replace", "inputs": ["old.xlsx"], "output": "old.xlsx", "permissions": [], "verification": ["reopen"], "destructive": True}], {"ready": False, "missing": [], "failures": ["authorization"], "riskLevel": "high"}), ("reports-missing-contract", [{"goal": "report", "inputs": [], "output": "a.docx", "permissions": [], "verification": []}], {"ready": False, "missing": [], "failures": ["inputs", "verification"], "riskLevel": "bounded"})],
            ["실행 전에 업무 목표와 입력·출력 identity를 문서화하세요.", "덮어쓰기 같은 파괴 효과는 별도 권한을 요구하세요."],
        ),
        "transfer": T(
            "office-workflow-dag", "새 Office 자동화의 실행 DAG와 차단 조건 만들기", "검증되지 않은 단계 뒤에 artifact 효과가 이어지지 않게 한다.", "validate_office_dag(steps)를 완성하세요.", "def validate_office_dag(steps):\n    raise NotImplementedError",
            """def validate_office_dag(steps):
    ids = [step["id"] for step in steps]
    known = set(ids)
    missing_dependencies = sorted({dep for step in steps for dep in step.get("dependsOn", []) if dep not in known})
    unsafe_effects = sorted(step["id"] for step in steps if step.get("effect") and not step.get("evidence"))
    duplicate_ids = sorted({value for value in ids if ids.count(value) > 1})
    failures = []
    if duplicate_ids:
        failures.append("identity")
    if missing_dependencies:
        failures.append("dependency")
    if unsafe_effects:
        failures.append("evidence")
    return {"ready": not failures, "failures": failures, "duplicates": duplicate_ids, "missingDependencies": missing_dependencies, "unsafeEffects": unsafe_effects}
""", "validate_office_dag",
            [("accepts-evidenced-dag", [[{"id": "validate"}, {"id": "write", "dependsOn": ["validate"], "effect": "xlsx", "evidence": "reopen"}]], {"ready": True, "failures": [], "duplicates": [], "missingDependencies": [], "unsafeEffects": []}), ("reports-dependency", [[{"id": "write", "dependsOn": ["missing"], "effect": "docx", "evidence": "reopen"}]], {"ready": False, "failures": ["dependency"], "duplicates": [], "missingDependencies": ["missing"], "unsafeEffects": []}), ("reports-identity-and-evidence", [[{"id": "write", "effect": "xlsx"}, {"id": "write"}]], {"ready": False, "failures": ["identity", "evidence"], "duplicates": ["write"], "missingDependencies": [], "unsafeEffects": ["write"]})],
            ["각 단계에 안정적인 ID와 dependency를 부여하세요.", "파일·메일·Excel 효과 단계에는 검증 evidence가 반드시 있어야 합니다."],
        ),
        "retrieval": T(
            "office-release-recall", "실전 Office 자동화 릴리스 원칙 회상하기", "입장·실행·재개방·업무 대조를 기억에서 복원한다.", "choose_office_release_evidence(stage)를 완성하세요.", "def choose_office_release_evidence(stage):\n    raise NotImplementedError",
            """def choose_office_release_evidence(stage):
    table = {"admission": {"action": "pin goal inputs outputs permissions", "evidence": "workflow contract", "risk": "wrong task"}, "execution": {"action": "run dependency-ordered bounded effects", "evidence": "step ledger", "risk": "partial automation"}, "artifact": {"action": "reopen and render outputs", "evidence": "artifact checks", "risk": "corrupt or unreadable file"}, "business": {"action": "reconcile counts totals identities", "evidence": "business report", "risk": "valid artifact with wrong result"}}
    if stage not in table:
        raise ValueError("unknown stage")
    return table[stage]
""", "choose_office_release_evidence",
            [("recalls-admission", ["admission"], {"action": "pin goal inputs outputs permissions", "evidence": "workflow contract", "risk": "wrong task"}), ("recalls-artifact", ["artifact"], {"action": "reopen and render outputs", "evidence": "artifact checks", "risk": "corrupt or unreadable file"}), ("recalls-business", ["business"], {"action": "reconcile counts totals identities", "evidence": "business report", "risk": "valid artifact with wrong result"})],
            ["버튼 클릭 성공이 아니라 업무 결과의 증거를 요구하세요.", "artifact 유효성과 업무 값 정확성은 서로 다른 검증 단계입니다."],
        ),
    },
}
