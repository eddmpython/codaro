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
            "PDF 저장 성공과 페이지 내용·geometry·업무 값의 정확성을 분리해 검증하세요.",
            "Web에서는 문서 판단을 연습하고 Local에서는 재개방·render artifact evidence를 남기세요.",
        ],
    )


BLUEPRINTS: dict[str, dict[str, TaskBlueprint]] = {
    "00": {
        "mastery": T(
            "pdf-artifact-contract",
            "PDF의 page·text·render·보안 artifact 계약 만들기",
            "생성 전에 페이지 수와 필수 text, render 검증, 암호화 정책을 명시한다.",
            "audit_pdf_contract(contract)를 완성하세요.",
            "def audit_pdf_contract(contract):\n    raise NotImplementedError",
            """def audit_pdf_contract(contract):
    required = {"fileName", "minimumPages", "requiredText", "renderVerification", "securityPolicy"}
    missing = sorted(required - set(contract))
    failures = []
    if not str(contract.get("fileName", "")).lower().endswith(".pdf"):
        failures.append("extension")
    if contract.get("minimumPages", 0) <= 0:
        failures.append("pages")
    if not contract.get("requiredText"):
        failures.append("text")
    if not contract.get("renderVerification", False):
        failures.append("render")
    if contract.get("securityPolicy") not in {"public", "internal", "confidential"}:
        failures.append("security")
    return {"ready": not missing and not failures, "missing": missing, "failures": failures, "evidence": ["PDF descriptor", "reopened pages", "rendered images", "business reconciliation"]}
""",
            "audit_pdf_contract",
            [
                (
                    "accepts-explicit-pdf-contract",
                    [{"fileName": "invoice.pdf", "minimumPages": 1, "requiredText": ["Invoice", "Total"], "renderVerification": True, "securityPolicy": "confidential"}],
                    {"ready": True, "missing": [], "failures": [], "evidence": ["PDF descriptor", "reopened pages", "rendered images", "business reconciliation"]},
                ),
                (
                    "reports-all-invalid-policies",
                    [{"fileName": "invoice.txt", "minimumPages": 0, "requiredText": [], "renderVerification": False, "securityPolicy": "unknown"}],
                    {"ready": False, "missing": [], "failures": ["extension", "pages", "text", "render", "security"], "evidence": ["PDF descriptor", "reopened pages", "rendered images", "business reconciliation"]},
                ),
                (
                    "reports-missing-contract",
                    [{"fileName": "x.pdf"}],
                    {"ready": False, "missing": ["minimumPages", "renderVerification", "requiredText", "securityPolicy"], "failures": ["pages", "text", "render", "security"], "evidence": ["PDF descriptor", "reopened pages", "rendered images", "business reconciliation"]},
                ),
            ],
            [
                "페이지 수와 필수 text, render 검증을 생성 전에 계약으로 만드세요.",
                "문서 보안 등급도 output filename과 함께 명시하세요.",
            ],
        ),
        "transfer": T(
            "pdf-runtime-tier-plan",
            "새 PDF 과제에 Web·Local 역할 분리 전이하기",
            "문서 계약과 실제 생성·OCR·render capability를 구분한다.",
            "plan_pdf_runtime(requirements)를 완성하세요.",
            "def plan_pdf_runtime(requirements):\n    raise NotImplementedError",
            """def plan_pdf_runtime(requirements):
    local_reasons = []
    if requirements.get("createPdf"):
        local_reasons.append("pdf-artifact")
    if requirements.get("renderPages"):
        local_reasons.append("page-render")
    if requirements.get("ocr"):
        local_reasons.append("ocr-runtime")
    if requirements.get("encrypt"):
        local_reasons.append("secret-and-encryption")
    return {"tier": "local" if local_reasons else "web", "localReasons": local_reasons, "webPractice": ["page contract", "table reconciliation", "security decision"]}
""",
            "plan_pdf_runtime",
            [
                (
                    "keeps-document-judgment-on-web",
                    [{}],
                    {"tier": "web", "localReasons": [], "webPractice": ["page contract", "table reconciliation", "security decision"]},
                ),
                (
                    "requires-local-for-create-and-render",
                    [{"createPdf": True, "renderPages": True}],
                    {"tier": "local", "localReasons": ["pdf-artifact", "page-render"], "webPractice": ["page contract", "table reconciliation", "security decision"]},
                ),
                (
                    "requires-local-for-ocr-and-encryption",
                    [{"ocr": True, "encrypt": True}],
                    {"tier": "local", "localReasons": ["ocr-runtime", "secret-and-encryption"], "webPractice": ["page contract", "table reconciliation", "security decision"]},
                ),
            ],
            [
                "Web에서 PDF package 실행을 가장하지 말고 페이지·표·보안 판단을 평가하세요.",
                "실제 생성·render·OCR·암호화는 Local capability로 연결하세요.",
            ],
        ),
        "retrieval": decision(
            "pdf-foundation-recall",
            "PDF artifact 검증 원칙 회상하기",
            "재개방·text·render·업무 reconciliation 근거를 구분한다.",
            "choose_pdf_evidence",
            {
                "structure": {"action": "reopen and inspect pages metadata", "evidence": "page descriptors", "risk": "corrupt PDF"},
                "content": {"action": "extract required text and tables", "evidence": "page-level coverage", "risk": "valid blank pages"},
                "visual": {"action": "render target pages", "evidence": "page PNGs and geometry", "risk": "clipped or missing glyphs"},
            },
        ),
    },
    "01": {
        "mastery": T(
            "pdf-page-info-audit",
            "PDF page count·size·rotation·encryption 정보 감사하기",
            "열기 전에 password 필요 여부와 비정상 geometry를 보고한다.",
            "audit_pdf_pages(document, allowed_page_sizes)를 완성하세요.",
            "def audit_pdf_pages(document, allowed_page_sizes):\n    raise NotImplementedError",
            """def audit_pdf_pages(document, allowed_page_sizes):
    failures = []
    if document.get("encrypted", False) and not document.get("passwordProvided", False):
        failures.append("password")
    invalid_pages = []
    for page in document.get("pages", []):
        size = [page.get("width"), page.get("height")]
        reasons = []
        if size not in allowed_page_sizes:
            reasons.append("size")
        if page.get("rotation") not in {0, 90, 180, 270}:
            reasons.append("rotation")
        if reasons:
            invalid_pages.append({"page": page["number"], "reasons": reasons})
    if invalid_pages:
        failures.append("pages")
    if not document.get("pages"):
        failures.append("empty")
    return {"readable": not failures, "failures": failures, "pageCount": len(document.get("pages", [])), "invalidPages": invalid_pages}
""",
            "audit_pdf_pages",
            [
                (
                    "accepts-two-a4-pages",
                    [{"encrypted": False, "pages": [{"number": 1, "width": 595, "height": 842, "rotation": 0}, {"number": 2, "width": 595, "height": 842, "rotation": 90}]}, [[595, 842]]],
                    {"readable": True, "failures": [], "pageCount": 2, "invalidPages": []},
                ),
                (
                    "reports-password-size-and-rotation",
                    [{"encrypted": True, "passwordProvided": False, "pages": [{"number": 1, "width": 100, "height": 100, "rotation": 45}]}, [[595, 842]]],
                    {"readable": False, "failures": ["password", "pages"], "pageCount": 1, "invalidPages": [{"page": 1, "reasons": ["size", "rotation"]}]},
                ),
                (
                    "reports-empty-document",
                    [{"pages": []}, [[595, 842]]],
                    {"readable": False, "failures": ["empty"], "pageCount": 0, "invalidPages": []},
                ),
            ],
            [
                "페이지 수만 보지 말고 각 page media box와 rotation을 검사하세요.",
                "암호화 PDF는 password 제공 상태를 별도 failure로 기록하세요.",
            ],
        ),
        "transfer": T(
            "pdf-page-fingerprint",
            "새 PDF의 페이지별 fingerprint manifest 전이하기",
            "page text·resource·geometry hash를 순서와 함께 정규화한다.",
            "build_page_manifest(pages)를 완성하세요.",
            "def build_page_manifest(pages):\n    raise NotImplementedError",
            """def build_page_manifest(pages):
    numbers = [page["number"] for page in pages]
    if numbers != list(range(1, len(pages) + 1)):
        raise ValueError("page numbers must be contiguous")
    entries = []
    for page in pages:
        entries.append({"page": page["number"], "geometryHash": page["geometryHash"], "textHash": page["textHash"], "resourceHash": page["resourceHash"]})
    return {"pageCount": len(entries), "pages": entries}
""",
            "build_page_manifest",
            [
                (
                    "builds-contiguous-manifest",
                    [[{"number": 1, "geometryHash": "g1", "textHash": "t1", "resourceHash": "r1"}, {"number": 2, "geometryHash": "g2", "textHash": "t2", "resourceHash": "r2"}]],
                    {"pageCount": 2, "pages": [{"page": 1, "geometryHash": "g1", "textHash": "t1", "resourceHash": "r1"}, {"page": 2, "geometryHash": "g2", "textHash": "t2", "resourceHash": "r2"}]},
                ),
                (
                    "handles-empty-document",
                    [[]],
                    {"pageCount": 0, "pages": []},
                ),
                ("rejects-page-number-gap", [[{"number": 2, "geometryHash": "g", "textHash": "t", "resourceHash": "r"}]], E("ValueError")),
            ],
            [
                "페이지 identity에 geometry·text·resource hash를 분리해 보존하세요.",
                "page number는 1부터 연속인지 검사하세요.",
            ],
        ),
        "retrieval": decision(
            "pdf-page-info-recall",
            "PDF page 정보 검증 회상하기",
            "암호화·geometry·page fingerprint 근거를 복원한다.",
            "choose_pdf_page_evidence",
            {
                "open": {"action": "check encryption and password", "evidence": "document security state", "risk": "unreadable input"},
                "geometry": {"action": "inspect size and rotation", "evidence": "page boxes", "risk": "unexpected page layout"},
                "identity": {"action": "hash text resource and geometry", "evidence": "ordered page manifest", "risk": "page drift"},
            },
        ),
    },
    "02": {
        "mastery": T(
            "pdf-merge-plan",
            "PDF 병합의 source page provenance 계획하기",
            "각 output page가 정확히 하나의 source page를 참조하는지 검사한다.",
            "audit_merge_plan(sources, output_pages)를 완성하세요.",
            "def audit_merge_plan(sources, output_pages):\n    raise NotImplementedError",
            """def audit_merge_plan(sources, output_pages):
    available = {(source["id"], page) for source in sources for page in range(1, source["pageCount"] + 1)}
    references = [(page["sourceId"], page["sourcePage"]) for page in output_pages]
    invalid = sorted([list(reference) for reference in references if reference not in available])
    duplicates = sorted([list(reference) for reference in set(references) if references.count(reference) > 1])
    missing = sorted([list(reference) for reference in available - set(references)])
    return {"accepted": not invalid and not duplicates and not missing, "invalid": invalid, "duplicates": duplicates, "missing": missing, "outputPageCount": len(output_pages)}
""",
            "audit_merge_plan",
            [
                (
                    "accepts-complete-two-source-merge",
                    [[{"id": "a", "pageCount": 2}, {"id": "b", "pageCount": 1}], [{"sourceId": "a", "sourcePage": 1}, {"sourceId": "a", "sourcePage": 2}, {"sourceId": "b", "sourcePage": 1}]],
                    {"accepted": True, "invalid": [], "duplicates": [], "missing": [], "outputPageCount": 3},
                ),
                (
                    "reports-duplicate-and-missing-page",
                    [[{"id": "a", "pageCount": 2}], [{"sourceId": "a", "sourcePage": 1}, {"sourceId": "a", "sourcePage": 1}]],
                    {"accepted": False, "invalid": [], "duplicates": [["a", 1]], "missing": [["a", 2]], "outputPageCount": 2},
                ),
                (
                    "reports-invalid-reference",
                    [[{"id": "a", "pageCount": 1}], [{"sourceId": "a", "sourcePage": 2}]],
                    {"accepted": False, "invalid": [["a", 2]], "duplicates": [], "missing": [["a", 1]], "outputPageCount": 1},
                ),
            ],
            [
                "output 순서마다 source document와 source page를 기록하세요.",
                "병합에서 누락·중복·범위 밖 page를 모두 검사하세요.",
            ],
        ),
        "transfer": T(
            "pdf-split-plan",
            "새 PDF 분할에 page coverage·파일명 충돌 감사 전이하기",
            "모든 source page가 정확히 한 output part에 속하는지 판정한다.",
            "audit_split_plan(page_count, parts)를 완성하세요.",
            "def audit_split_plan(page_count, parts):\n    raise NotImplementedError",
            """def audit_split_plan(page_count, parts):
    assignments = []
    names = []
    for part in parts:
        names.append(part["fileName"])
        assignments.extend((page, part["fileName"]) for page in part["pages"])
    page_numbers = [page for page, _ in assignments]
    missing = sorted(set(range(1, page_count + 1)) - set(page_numbers))
    duplicates = sorted({page for page in page_numbers if page_numbers.count(page) > 1})
    invalid = sorted({page for page in page_numbers if page < 1 or page > page_count})
    duplicate_names = sorted({name for name in names if names.count(name) > 1})
    return {"accepted": not missing and not duplicates and not invalid and not duplicate_names, "missing": missing, "duplicates": duplicates, "invalid": invalid, "duplicateNames": duplicate_names}
""",
            "audit_split_plan",
            [
                (
                    "accepts-full-split-coverage",
                    [3, [{"fileName": "part1.pdf", "pages": [1, 2]}, {"fileName": "part2.pdf", "pages": [3]}]],
                    {"accepted": True, "missing": [], "duplicates": [], "invalid": [], "duplicateNames": []},
                ),
                (
                    "reports-missing-and-duplicate-page",
                    [3, [{"fileName": "a.pdf", "pages": [1, 1]}]],
                    {"accepted": False, "missing": [2, 3], "duplicates": [1], "invalid": [], "duplicateNames": []},
                ),
                (
                    "reports-invalid-page-and-name-collision",
                    [1, [{"fileName": "a.pdf", "pages": [1]}, {"fileName": "a.pdf", "pages": [2]}]],
                    {"accepted": False, "missing": [], "duplicates": [], "invalid": [2], "duplicateNames": ["a.pdf"]},
                ),
            ],
            [
                "분할 plan에서 source page 전체 coverage를 집합으로 검사하세요.",
                "output filename 충돌도 실제 write 전에 차단하세요.",
            ],
        ),
        "retrieval": decision(
            "pdf-merge-split-recall",
            "PDF 병합·분할 품질 기준 회상하기",
            "source provenance·coverage·output collision 근거를 복원한다.",
            "choose_pdf_page_operation",
            {
                "merge": {"action": "map each output page to source page", "evidence": "page provenance manifest", "risk": "missing or duplicate page"},
                "split": {"action": "partition full source page set", "evidence": "part page lists", "risk": "coverage gap"},
                "write": {"action": "check output filename collisions", "evidence": "destination plan", "risk": "overwrite"},
            },
        ),
    },
    "03": {
        "mastery": T(
            "pdf-text-coverage",
            "페이지별 PDF text 추출 coverage 감사하기",
            "빈 text와 replacement character 비율을 계산해 OCR 후보를 찾는다.",
            "audit_text_extraction(pages, maximum_replacement_ratio)를 완성하세요.",
            "def audit_text_extraction(pages, maximum_replacement_ratio):\n    raise NotImplementedError",
            """def audit_text_extraction(pages, maximum_replacement_ratio):
    empty = []
    corrupted = []
    details = []
    for page in pages:
        text = page.get("text", "")
        replacement_count = text.count("�")
        ratio = 0.0 if not text else round(replacement_count / len(text), 4)
        if not text.strip():
            empty.append(page["number"])
        if ratio > maximum_replacement_ratio:
            corrupted.append(page["number"])
        details.append({"page": page["number"], "characterCount": len(text), "replacementRatio": ratio})
    return {"accepted": not empty and not corrupted, "emptyPages": empty, "corruptedPages": corrupted, "details": details, "ocrCandidates": sorted(set(empty + corrupted))}
""",
            "audit_text_extraction",
            [
                (
                    "accepts-clean-page-text",
                    [[{"number": 1, "text": "Hello PDF"}], 0.1],
                    {"accepted": True, "emptyPages": [], "corruptedPages": [], "details": [{"page": 1, "characterCount": 9, "replacementRatio": 0.0}], "ocrCandidates": []},
                ),
                (
                    "reports-empty-page",
                    [[{"number": 1, "text": "   "}], 0.1],
                    {"accepted": False, "emptyPages": [1], "corruptedPages": [], "details": [{"page": 1, "characterCount": 3, "replacementRatio": 0.0}], "ocrCandidates": [1]},
                ),
                (
                    "reports-corrupted-page",
                    [[{"number": 2, "text": "A��"}], 0.5],
                    {"accepted": False, "emptyPages": [], "corruptedPages": [2], "details": [{"page": 2, "characterCount": 3, "replacementRatio": 0.6667}], "ocrCandidates": [2]},
                ),
            ],
            [
                "전체 PDF text 길이보다 페이지별 빈 text와 깨진 문자 비율을 보세요.",
                "OCR은 전체 문서가 아니라 근거가 있는 page 후보에만 적용하세요.",
            ],
        ),
        "transfer": T(
            "extracted-text-reconciliation",
            "새 PDF text에 필수 문구·page provenance 전이하기",
            "필수 text가 어느 page에서 몇 번 발견됐는지 대조한다.",
            "reconcile_required_text(pages, required_phrases)를 완성하세요.",
            "def reconcile_required_text(pages, required_phrases):\n    raise NotImplementedError",
            """def reconcile_required_text(pages, required_phrases):
    findings = {}
    for phrase in required_phrases:
        matches = []
        for page in pages:
            count = page.get("text", "").count(phrase)
            if count:
                matches.append({"page": page["number"], "count": count})
        findings[phrase] = matches
    missing = sorted(phrase for phrase, matches in findings.items() if not matches)
    return {"passed": not missing, "missing": missing, "findings": findings}
""",
            "reconcile_required_text",
            [
                (
                    "finds-phrases-by-page",
                    [[{"number": 1, "text": "Invoice Total"}, {"number": 2, "text": "Total Total"}], ["Invoice", "Total"]],
                    {"passed": True, "missing": [], "findings": {"Invoice": [{"page": 1, "count": 1}], "Total": [{"page": 1, "count": 1}, {"page": 2, "count": 2}]}},
                ),
                (
                    "reports-missing-phrase",
                    [[{"number": 1, "text": "Hello"}], ["Total"]],
                    {"passed": False, "missing": ["Total"], "findings": {"Total": []}},
                ),
                (
                    "handles-empty-requirement",
                    [[], []],
                    {"passed": True, "missing": [], "findings": {}},
                ),
            ],
            [
                "필수 문구 발견 여부와 page·count provenance를 함께 남기세요.",
                "OCR text와 native text는 source kind를 구분해 저장하세요.",
            ],
        ),
        "retrieval": decision(
            "pdf-text-extraction-recall",
            "PDF text 추출 품질 기준 회상하기",
            "page coverage·corruption·OCR·필수 문구 근거를 복원한다.",
            "choose_pdf_text_evidence",
            {
                "native": {"action": "extract page-level text", "evidence": "character counts and page hashes", "risk": "blank image page"},
                "quality": {"action": "measure empty and replacement ratio", "evidence": "OCR candidate pages", "risk": "garbled text"},
                "content": {"action": "reconcile required phrases", "evidence": "page and occurrence counts", "risk": "missing business text"},
            },
        ),
    },
    "04": {
        "mastery": T(
            "pdf-table-shape-audit",
            "추출된 PDF 표의 header·row shape 감사하기",
            "빈·중복 header와 ragged row, 빈 key를 검사한다.",
            "audit_pdf_table(headers, rows, key_column)를 완성하세요.",
            "def audit_pdf_table(headers, rows, key_column):\n    raise NotImplementedError",
            """def audit_pdf_table(headers, rows, key_column):
    failures = []
    if not headers or any(not header for header in headers) or len(headers) != len(set(headers)):
        failures.append("headers")
    ragged = [index + 1 for index, row in enumerate(rows) if len(row) != len(headers)]
    if ragged:
        failures.append("shape")
    key_index = headers.index(key_column) if key_column in headers else None
    empty_keys = [] if key_index is None else [index + 1 for index, row in enumerate(rows) if len(row) > key_index and row[key_index] in {None, ""}]
    if key_index is None:
        failures.append("key-column")
    elif empty_keys:
        failures.append("keys")
    return {"accepted": not failures, "failures": failures, "raggedRows": ragged, "emptyKeyRows": empty_keys}
""",
            "audit_pdf_table",
            [
                (
                    "accepts-rectangular-keyed-table",
                    [["ID", "Amount"], [["a", "10"], ["b", "20"]], "ID"],
                    {"accepted": True, "failures": [], "raggedRows": [], "emptyKeyRows": []},
                ),
                (
                    "reports-headers-shape-and-key-column",
                    [["ID", "ID"], [["a"]], "Missing"],
                    {"accepted": False, "failures": ["headers", "shape", "key-column"], "raggedRows": [1], "emptyKeyRows": []},
                ),
                (
                    "reports-empty-key-row",
                    [["ID", "Amount"], [["", "10"]], "ID"],
                    {"accepted": False, "failures": ["keys"], "raggedRows": [], "emptyKeyRows": [1]},
                ),
            ],
            [
                "표 추출 성공을 row 수로 보지 말고 header와 row shape를 검사하세요.",
                "업무 key column의 빈 값을 page/row 위치와 함께 보고하세요.",
            ],
        ),
        "transfer": T(
            "pdf-table-source-reconciliation",
            "새 PDF 표에 source row reconciliation 전이하기",
            "primary key와 row hash로 원천 표와 추출 표를 대조한다.",
            "reconcile_pdf_table(source_rows, extracted_rows, key_field)를 완성하세요.",
            "def reconcile_pdf_table(source_rows, extracted_rows, key_field):\n    raise NotImplementedError",
            """def reconcile_pdf_table(source_rows, extracted_rows, key_field):
    source = {row[key_field]: row["rowHash"] for row in source_rows}
    extracted = {row[key_field]: row["rowHash"] for row in extracted_rows}
    missing = sorted(set(source) - set(extracted))
    unexpected = sorted(set(extracted) - set(source))
    changed = sorted(key for key in set(source) & set(extracted) if source[key] != extracted[key])
    return {"passed": not missing and not unexpected and not changed, "missing": missing, "unexpected": unexpected, "changed": changed}
""",
            "reconcile_pdf_table",
            [
                (
                    "accepts-reordered-table",
                    [[{"id": "a", "rowHash": "x"}, {"id": "b", "rowHash": "y"}], [{"id": "b", "rowHash": "y"}, {"id": "a", "rowHash": "x"}], "id"],
                    {"passed": True, "missing": [], "unexpected": [], "changed": []},
                ),
                (
                    "reports-row-drift",
                    [[{"id": "a", "rowHash": "x"}, {"id": "b", "rowHash": "y"}], [{"id": "a", "rowHash": "z"}, {"id": "c", "rowHash": "q"}], "id"],
                    {"passed": False, "missing": ["b"], "unexpected": ["c"], "changed": ["a"]},
                ),
                (
                    "handles-empty-tables",
                    [[], [], "id"],
                    {"passed": True, "missing": [], "unexpected": [], "changed": []},
                ),
            ],
            [
                "추출 row 순서보다 primary key와 row hash를 비교하세요.",
                "page와 table index를 row provenance에 함께 보존하세요.",
            ],
        ),
        "retrieval": decision(
            "pdf-table-extraction-recall",
            "PDF 표 추출 품질 기준 회상하기",
            "shape·key·source reconciliation 근거를 복원한다.",
            "choose_pdf_table_evidence",
            {
                "shape": {"action": "validate headers and row widths", "evidence": "ragged row indices", "risk": "shifted columns"},
                "key": {"action": "require business key values", "evidence": "empty key rows", "risk": "unjoinable data"},
                "reconcile": {"action": "compare key and row hash", "evidence": "missing unexpected changed", "risk": "silent extraction drift"},
            },
        ),
    },
    "05": {
        "mastery": T(
            "pdf-layout-plan",
            "첫 PDF의 page size·margin·content box 계획하기",
            "양수 margin과 content 영역, block 높이 overflow를 검사한다.",
            "audit_pdf_layout(page, blocks)를 완성하세요.",
            "def audit_pdf_layout(page, blocks):\n    raise NotImplementedError",
            """def audit_pdf_layout(page, blocks):
    margins = page["margins"]
    failures = []
    if any(margins[key] < 0 for key in ["top", "right", "bottom", "left"]):
        failures.append("margins")
    content_width = page["width"] - margins["left"] - margins["right"]
    content_height = page["height"] - margins["top"] - margins["bottom"]
    if content_width <= 0 or content_height <= 0:
        failures.append("content-box")
    used_height = sum(block["height"] for block in blocks)
    if used_height > content_height:
        failures.append("overflow")
    too_wide = sorted(block["id"] for block in blocks if block["width"] > content_width)
    if too_wide:
        failures.append("width")
    return {"accepted": not failures, "failures": failures, "contentBox": [content_width, content_height], "usedHeight": used_height, "tooWide": too_wide}
""",
            "audit_pdf_layout",
            [
                (
                    "accepts-blocks-within-a4-box",
                    [{"width": 595, "height": 842, "margins": {"top": 50, "right": 50, "bottom": 50, "left": 50}}, [{"id": "title", "width": 400, "height": 50}, {"id": "body", "width": 495, "height": 600}]],
                    {"accepted": True, "failures": [], "contentBox": [495, 742], "usedHeight": 650, "tooWide": []},
                ),
                (
                    "reports-overflow-and-width",
                    [{"width": 100, "height": 100, "margins": {"top": 10, "right": 10, "bottom": 10, "left": 10}}, [{"id": "block", "width": 90, "height": 90}]],
                    {"accepted": False, "failures": ["overflow", "width"], "contentBox": [80, 80], "usedHeight": 90, "tooWide": ["block"]},
                ),
                (
                    "reports-invalid-content-box",
                    [{"width": 100, "height": 100, "margins": {"top": 60, "right": 60, "bottom": 60, "left": 60}}, []],
                    {"accepted": False, "failures": ["content-box", "overflow"], "contentBox": [-20, -20], "usedHeight": 0, "tooWide": []},
                ),
            ],
            [
                "페이지 크기와 margin에서 실제 content box를 먼저 계산하세요.",
                "block height 합과 개별 width를 render 전에 검사하세요.",
            ],
        ),
        "transfer": T(
            "pdf-section-pagination",
            "새 문서 section에 page break 계획 전이하기",
            "section을 content height 안에서 순서대로 배치하고 page별 사용량을 반환한다.",
            "paginate_sections(sections, content_height)를 완성하세요.",
            "def paginate_sections(sections, content_height):\n    raise NotImplementedError",
            """def paginate_sections(sections, content_height):
    if content_height <= 0:
        raise ValueError("content height must be positive")
    pages = []
    current = {"sections": [], "usedHeight": 0}
    for section in sections:
        if section["height"] > content_height:
            raise ValueError("section taller than page")
        if current["sections"] and current["usedHeight"] + section["height"] > content_height:
            pages.append(current)
            current = {"sections": [], "usedHeight": 0}
        current["sections"].append(section["id"])
        current["usedHeight"] += section["height"]
    if current["sections"]:
        pages.append(current)
    return {"pageCount": len(pages), "pages": pages}
""",
            "paginate_sections",
            [
                (
                    "paginates-three-sections",
                    [[{"id": "a", "height": 40}, {"id": "b", "height": 60}, {"id": "c", "height": 20}], 100],
                    {"pageCount": 2, "pages": [{"sections": ["a", "b"], "usedHeight": 100}, {"sections": ["c"], "usedHeight": 20}]},
                ),
                (
                    "handles-empty-document",
                    [[], 100],
                    {"pageCount": 0, "pages": []},
                ),
                ("rejects-tall-section", [[{"id": "a", "height": 101}], 100], E("ValueError")),
            ],
            [
                "section을 잘라 넣지 말고 page break 전에 높이를 계산하세요.",
                "content height보다 큰 section은 별도 layout 전략 없이는 거부하세요.",
            ],
        ),
        "retrieval": decision(
            "first-pdf-recall",
            "첫 PDF layout 품질 기준 회상하기",
            "page box·margin·block overflow·pagination 근거를 복원한다.",
            "choose_pdf_layout_evidence",
            {
                "box": {"action": "compute content box from page and margins", "evidence": "width height geometry", "risk": "negative space"},
                "blocks": {"action": "measure block dimensions", "evidence": "used height and too-wide IDs", "risk": "clipping"},
                "pages": {"action": "paginate whole sections", "evidence": "page section manifest", "risk": "split content"},
            },
        ),
    },
    "06": {
        "mastery": T(
            "font-glyph-contract",
            "한글 font의 embedding·glyph coverage 감사하기",
            "문서 문자 집합이 font glyph에 포함되고 subset/embed 정책이 있는지 검사한다.",
            "audit_font_coverage(texts, font)를 완성하세요.",
            "def audit_font_coverage(texts, font):\n    raise NotImplementedError",
            """def audit_font_coverage(texts, font):
    required = {character for text in texts for character in text if not character.isspace()}
    available = set(font.get("glyphs", []))
    missing = sorted(required - available)
    failures = []
    if missing:
        failures.append("glyphs")
    if not font.get("embedded", False):
        failures.append("embedding")
    if not font.get("licenseAllowsEmbedding", False):
        failures.append("license")
    return {"accepted": not failures, "failures": failures, "missingGlyphs": missing, "requiredGlyphCount": len(required)}
""",
            "audit_font_coverage",
            [
                (
                    "accepts-embedded-korean-glyphs",
                    [["매출 보고"], {"glyphs": list("매출보고"), "embedded": True, "licenseAllowsEmbedding": True}],
                    {"accepted": True, "failures": [], "missingGlyphs": [], "requiredGlyphCount": 4},
                ),
                (
                    "reports-missing-glyph-and-policies",
                    [["한글"], {"glyphs": ["한"], "embedded": False, "licenseAllowsEmbedding": False}],
                    {"accepted": False, "failures": ["glyphs", "embedding", "license"], "missingGlyphs": ["글"], "requiredGlyphCount": 2},
                ),
                (
                    "ignores-whitespace-glyphs",
                    [["  "], {"glyphs": [], "embedded": True, "licenseAllowsEmbedding": True}],
                    {"accepted": True, "failures": [], "missingGlyphs": [], "requiredGlyphCount": 0},
                ),
            ],
            [
                "폰트 파일 존재가 아니라 실제 문서 character glyph coverage를 검사하세요.",
                "embedding 허용 license와 실제 embedded 상태를 둘 다 확인하세요.",
            ],
        ),
        "transfer": T(
            "pdf-text-style-audit",
            "새 PDF의 heading·body style 일관성 감사 전이하기",
            "role별 font·size·leading signature와 최소 body size를 검사한다.",
            "audit_pdf_text_styles(runs, minimum_body_size, maximum_styles)를 완성하세요.",
            "def audit_pdf_text_styles(runs, minimum_body_size, maximum_styles):\n    raise NotImplementedError",
            """def audit_pdf_text_styles(runs, minimum_body_size, maximum_styles):
    signatures = {}
    small_body = []
    for run in runs:
        signature = (run["font"], run["size"], run["leading"])
        signatures.setdefault(run["role"], set()).add(signature)
        if run["role"] == "body" and run["size"] < minimum_body_size:
            small_body.append(run["id"])
    inconsistent = sorted(role for role, values in signatures.items() if len(values) > 1)
    unique_count = len({value for values in signatures.values() for value in values})
    failures = []
    if inconsistent:
        failures.append("consistency")
    if small_body:
        failures.append("body-size")
    if unique_count > maximum_styles:
        failures.append("style-budget")
    return {"accepted": not failures, "failures": failures, "inconsistentRoles": inconsistent, "smallBodyRuns": sorted(small_body), "uniqueStyleCount": unique_count}
""",
            "audit_pdf_text_styles",
            [
                (
                    "accepts-consistent-heading-and-body",
                    [[{"id": "h", "role": "heading", "font": "Noto", "size": 16, "leading": 20}, {"id": "b1", "role": "body", "font": "Noto", "size": 10, "leading": 14}, {"id": "b2", "role": "body", "font": "Noto", "size": 10, "leading": 14}], 9, 3],
                    {"accepted": True, "failures": [], "inconsistentRoles": [], "smallBodyRuns": [], "uniqueStyleCount": 2},
                ),
                (
                    "reports-inconsistent-small-body",
                    [[{"id": "b1", "role": "body", "font": "A", "size": 8, "leading": 10}, {"id": "b2", "role": "body", "font": "B", "size": 10, "leading": 12}], 9, 3],
                    {"accepted": False, "failures": ["consistency", "body-size"], "inconsistentRoles": ["body"], "smallBodyRuns": ["b1"], "uniqueStyleCount": 2},
                ),
                (
                    "reports-style-budget",
                    [[{"id": "a", "role": "a", "font": "A", "size": 10, "leading": 10}, {"id": "b", "role": "b", "font": "B", "size": 11, "leading": 11}], 9, 1],
                    {"accepted": False, "failures": ["style-budget"], "inconsistentRoles": [], "smallBodyRuns": [], "uniqueStyleCount": 2},
                ),
            ],
            [
                "role별 font·size·leading signature를 재사용하세요.",
                "body text 최소 크기와 문서 전체 style budget을 검사하세요.",
            ],
        ),
        "retrieval": decision(
            "pdf-font-style-recall",
            "한글 font·style 품질 기준 회상하기",
            "glyph·embedding·license·role style 근거를 복원한다.",
            "choose_pdf_font_evidence",
            {
                "glyph": {"action": "compare document characters with font cmap", "evidence": "missing glyph list", "risk": "tofu boxes"},
                "embed": {"action": "verify embedded subset and license", "evidence": "font descriptor", "risk": "reader substitution"},
                "style": {"action": "reuse role signatures", "evidence": "font size leading map", "risk": "inconsistent unreadable text"},
            },
        ),
    },
    "07": {
        "mastery": T(
            "pdf-table-image-layout",
            "PDF 표·이미지 block의 page box 배치 감사하기",
            "block overlap·overflow와 이미지 caption/alt 누락을 검사한다.",
            "audit_pdf_blocks(blocks, content_box)를 완성하세요.",
            "def audit_pdf_blocks(blocks, content_box):\n    raise NotImplementedError",
            """def audit_pdf_blocks(blocks, content_box):
    failures = []
    overflow = []
    invalid_images = []
    overlaps = []
    for block in blocks:
        if block["x"] < 0 or block["y"] < 0 or block["x"] + block["width"] > content_box["width"] or block["y"] + block["height"] > content_box["height"]:
            overflow.append(block["id"])
        if block["kind"] == "image" and (not block.get("caption") or not block.get("altText")):
            invalid_images.append(block["id"])
    for index, left in enumerate(blocks):
        for right in blocks[index + 1 :]:
            if left["x"] < right["x"] + right["width"] and right["x"] < left["x"] + left["width"] and left["y"] < right["y"] + right["height"] and right["y"] < left["y"] + left["height"]:
                overlaps.append([left["id"], right["id"]])
    if overflow:
        failures.append("overflow")
    if invalid_images:
        failures.append("image-text")
    if overlaps:
        failures.append("overlap")
    return {"accepted": not failures, "failures": failures, "overflow": sorted(overflow), "invalidImages": sorted(invalid_images), "overlaps": overlaps}
""",
            "audit_pdf_blocks",
            [
                (
                    "accepts-separated-table-and-image",
                    [[{"id": "table", "kind": "table", "x": 0, "y": 0, "width": 100, "height": 50}, {"id": "chart", "kind": "image", "x": 0, "y": 60, "width": 100, "height": 50, "caption": "Sales", "altText": "Sales chart"}], {"width": 200, "height": 200}],
                    {"accepted": True, "failures": [], "overflow": [], "invalidImages": [], "overlaps": []},
                ),
                (
                    "reports-overflow-and-missing-image-text",
                    [[{"id": "chart", "kind": "image", "x": 90, "y": 0, "width": 20, "height": 20, "caption": "", "altText": ""}], {"width": 100, "height": 100}],
                    {"accepted": False, "failures": ["overflow", "image-text"], "overflow": ["chart"], "invalidImages": ["chart"], "overlaps": []},
                ),
                (
                    "reports-overlap",
                    [[{"id": "a", "kind": "table", "x": 0, "y": 0, "width": 50, "height": 50}, {"id": "b", "kind": "table", "x": 25, "y": 25, "width": 50, "height": 50}], {"width": 100, "height": 100}],
                    {"accepted": False, "failures": ["overlap"], "overflow": [], "invalidImages": [], "overlaps": [["a", "b"]]},
                ),
            ],
            [
                "block bounding box로 overflow와 overlap을 render 전에 검사하세요.",
                "이미지는 caption과 alt text를 모두 제공하세요.",
            ],
        ),
        "transfer": T(
            "rendered-block-evidence",
            "새 PDF render에 block visibility·clipping 감사 전이하기",
            "계획 block마다 rendered pixel bbox와 visible ratio를 대조한다.",
            "audit_rendered_blocks(planned_ids, rendered, minimum_visible_ratio)를 완성하세요.",
            "def audit_rendered_blocks(planned_ids, rendered, minimum_visible_ratio):\n    raise NotImplementedError",
            """def audit_rendered_blocks(planned_ids, rendered, minimum_visible_ratio):
    rendered_map = {item["id"]: item for item in rendered}
    missing = sorted(set(planned_ids) - set(rendered_map))
    clipped = sorted(block_id for block_id in planned_ids if block_id in rendered_map and rendered_map[block_id].get("visibleRatio", 0) < minimum_visible_ratio)
    blank = sorted(block_id for block_id in planned_ids if block_id in rendered_map and rendered_map[block_id].get("nonWhitePixels", 0) == 0)
    return {"passed": not missing and not clipped and not blank, "missing": missing, "clipped": clipped, "blank": blank}
""",
            "audit_rendered_blocks",
            [
                (
                    "accepts-visible-rendered-blocks",
                    [["table", "chart"], [{"id": "table", "visibleRatio": 1.0, "nonWhitePixels": 100}, {"id": "chart", "visibleRatio": 0.99, "nonWhitePixels": 200}], 0.95],
                    {"passed": True, "missing": [], "clipped": [], "blank": []},
                ),
                (
                    "reports-missing-clipped-and-blank",
                    [["missing", "clip", "blank"], [{"id": "clip", "visibleRatio": 0.5, "nonWhitePixels": 10}, {"id": "blank", "visibleRatio": 1.0, "nonWhitePixels": 0}], 0.9],
                    {"passed": False, "missing": ["missing"], "clipped": ["clip"], "blank": ["blank"]},
                ),
                (
                    "accepts-threshold-boundary",
                    [["x"], [{"id": "x", "visibleRatio": 0.9, "nonWhitePixels": 1}], 0.9],
                    {"passed": True, "missing": [], "clipped": [], "blank": []},
                ),
            ],
            [
                "PDF 구조 존재와 실제 render visibility를 분리해 검증하세요.",
                "block별 visible ratio와 non-white pixel을 evidence로 남기세요.",
            ],
        ),
        "retrieval": decision(
            "pdf-table-image-recall",
            "PDF 표·이미지 배치 품질 기준 회상하기",
            "geometry·설명·render visibility 근거를 복원한다.",
            "choose_pdf_block_evidence",
            {
                "layout": {"action": "audit block boxes", "evidence": "overflow and overlap pairs", "risk": "clipped content"},
                "meaning": {"action": "add caption and alt text", "evidence": "image text alternatives", "risk": "image-only information"},
                "render": {"action": "measure block visible pixels", "evidence": "visible ratio and non-white pixels", "risk": "blank artifact"},
            },
        ),
    },
    "08": {
        "mastery": T(
            "pdf-security-contract",
            "PDF watermark·암호화·permission 계약 감사하기",
            "보안 등급에 필요한 watermark와 user/owner password 분리, permission을 검사한다.",
            "audit_pdf_security(security, policy)를 완성하세요.",
            "def audit_pdf_security(security, policy):\n    raise NotImplementedError",
            """def audit_pdf_security(security, policy):
    failures = []
    if policy.get("requireWatermark") and not security.get("watermarkText"):
        failures.append("watermark")
    if policy.get("requireEncryption") and not security.get("encrypted", False):
        failures.append("encryption")
    if security.get("encrypted", False) and security.get("userPasswordRef") == security.get("ownerPasswordRef"):
        failures.append("password-separation")
    excessive = sorted(set(security.get("permissions", [])) - set(policy.get("allowedPermissions", [])))
    if excessive:
        failures.append("permissions")
    if "userPassword" in security or "ownerPassword" in security:
        failures.append("embedded-secret")
    return {"accepted": not failures, "failures": failures, "excessivePermissions": excessive}
""",
            "audit_pdf_security",
            [
                (
                    "accepts-watermarked-encrypted-policy",
                    [{"watermarkText": "CONFIDENTIAL", "encrypted": True, "userPasswordRef": "user-ref", "ownerPasswordRef": "owner-ref", "permissions": ["print"]}, {"requireWatermark": True, "requireEncryption": True, "allowedPermissions": ["print"]}],
                    {"accepted": True, "failures": [], "excessivePermissions": []},
                ),
                (
                    "reports-missing-security-and-password-separation",
                    [{"watermarkText": "", "encrypted": True, "userPasswordRef": "same", "ownerPasswordRef": "same", "permissions": ["copy"]}, {"requireWatermark": True, "requireEncryption": True, "allowedPermissions": []}],
                    {"accepted": False, "failures": ["watermark", "password-separation", "permissions"], "excessivePermissions": ["copy"]},
                ),
                (
                    "reports-unencrypted-embedded-secret",
                    [{"encrypted": False, "userPassword": "secret", "permissions": []}, {"requireWatermark": False, "requireEncryption": True, "allowedPermissions": []}],
                    {"accepted": False, "failures": ["encryption", "embedded-secret"], "excessivePermissions": []},
                ),
            ],
            [
                "user와 owner password는 서로 다른 secret reference로 관리하세요.",
                "watermark는 암호화를 대체하지 않으며 permission도 allowlist로 제한하세요.",
            ],
        ),
        "transfer": T(
            "pdf-security-result",
            "새 보안 PDF의 재개방·permission 감사 전이하기",
            "password별 open 결과와 추출/인쇄 permission을 정책과 대조한다.",
            "audit_security_result(result, expected_permissions)를 완성하세요.",
            "def audit_security_result(result, expected_permissions):\n    raise NotImplementedError",
            """def audit_security_result(result, expected_permissions):
    failures = []
    if not result.get("opensWithUserPassword", False):
        failures.append("user-password")
    if not result.get("opensWithOwnerPassword", False):
        failures.append("owner-password")
    if result.get("opensWithoutPassword", False):
        failures.append("unencrypted-open")
    observed = set(result.get("permissions", []))
    missing = sorted(set(expected_permissions) - observed)
    unexpected = sorted(observed - set(expected_permissions))
    if missing or unexpected:
        failures.append("permissions")
    if result.get("secretResidualFindings", 0) != 0:
        failures.append("secret-residual")
    return {"passed": not failures, "failures": failures, "missingPermissions": missing, "unexpectedPermissions": unexpected}
""",
            "audit_security_result",
            [
                (
                    "accepts-encrypted-permission-result",
                    [{"opensWithUserPassword": True, "opensWithOwnerPassword": True, "opensWithoutPassword": False, "permissions": ["print"], "secretResidualFindings": 0}, ["print"]],
                    {"passed": True, "failures": [], "missingPermissions": [], "unexpectedPermissions": []},
                ),
                (
                    "reports-password-and-permission-failures",
                    [{"opensWithUserPassword": False, "opensWithOwnerPassword": False, "opensWithoutPassword": True, "permissions": ["copy"]}, ["print"]],
                    {"passed": False, "failures": ["user-password", "owner-password", "unencrypted-open", "permissions"], "missingPermissions": ["print"], "unexpectedPermissions": ["copy"]},
                ),
                (
                    "reports-secret-residual",
                    [{"opensWithUserPassword": True, "opensWithOwnerPassword": True, "opensWithoutPassword": False, "permissions": [], "secretResidualFindings": 1}, []],
                    {"passed": False, "failures": ["secret-residual"], "missingPermissions": [], "unexpectedPermissions": []},
                ),
            ],
            [
                "실제 PDF를 user/owner/무암호 세 방식으로 재개방해 정책을 검증하세요.",
                "password 값이 log나 metadata에 남지 않았는지 residual scan을 수행하세요.",
            ],
        ),
        "retrieval": decision(
            "pdf-security-recall",
            "PDF watermark·암호화 품질 기준 회상하기",
            "분류 표시·password·permission·재개방 근거를 복원한다.",
            "choose_pdf_security_evidence",
            {
                "watermark": {"action": "render classification mark", "evidence": "watermark text and page coverage", "risk": "visual mark only"},
                "encrypt": {"action": "use separate secret references", "evidence": "encryption configuration", "risk": "embedded password"},
                "verify": {"action": "reopen with password matrix", "evidence": "open results and permissions", "risk": "misconfigured security"},
            },
        ),
    },
    "09": {
        "mastery": T(
            "pdf-form-contract",
            "PDF form field의 이름·type·required·default 계약 감사하기",
            "중복 field와 type에 맞지 않는 default 값을 검사한다.",
            "audit_pdf_form_fields(fields)를 완성하세요.",
            "def audit_pdf_form_fields(fields):\n    raise NotImplementedError",
            """def audit_pdf_form_fields(fields):
    failures = []
    names = [field["name"] for field in fields]
    duplicates = sorted({name for name in names if names.count(name) > 1})
    invalid = []
    for field in fields:
        reasons = []
        field_type = field.get("type")
        value = field.get("default")
        if field_type not in {"text", "checkbox", "choice"}:
            reasons.append("type")
        elif field_type == "checkbox" and value is not None and not isinstance(value, bool):
            reasons.append("default")
        elif field_type == "choice" and value is not None and value not in field.get("options", []):
            reasons.append("default")
        if field.get("required", False) and value in {None, ""}:
            reasons.append("required-default")
        if reasons:
            invalid.append({"name": field["name"], "reasons": reasons})
    if duplicates:
        failures.append("duplicates")
    if invalid:
        failures.append("fields")
    return {"accepted": not failures, "failures": failures, "duplicates": duplicates, "invalid": invalid}
""",
            "audit_pdf_form_fields",
            [
                (
                    "accepts-text-checkbox-and-choice",
                    [[{"name": "name", "type": "text", "required": True, "default": "A"}, {"name": "agree", "type": "checkbox", "default": False}, {"name": "region", "type": "choice", "options": ["KR", "US"], "default": "KR"}]],
                    {"accepted": True, "failures": [], "duplicates": [], "invalid": []},
                ),
                (
                    "reports-duplicate-and-required-default",
                    [[{"name": "name", "type": "text", "required": True, "default": ""}, {"name": "name", "type": "text", "default": "B"}]],
                    {"accepted": False, "failures": ["duplicates", "fields"], "duplicates": ["name"], "invalid": [{"name": "name", "reasons": ["required-default"]}]},
                ),
                (
                    "reports-invalid-choice-default",
                    [[{"name": "region", "type": "choice", "options": ["KR"], "default": "US"}]],
                    {"accepted": False, "failures": ["fields"], "duplicates": [], "invalid": [{"name": "region", "reasons": ["default"]}]},
                ),
            ],
            [
                "form field name은 문서 전체에서 유일해야 합니다.",
                "checkbox·choice default가 field type 계약에 맞는지 검사하세요.",
            ],
        ),
        "transfer": T(
            "pdf-form-fill-audit",
            "새 PDF form 입력에 type·required·unknown field 감사 전이하기",
            "form schema와 값 dict를 대조해 fill plan을 만든다.",
            "audit_form_values(fields, values)를 완성하세요.",
            "def audit_form_values(fields, values):\n    raise NotImplementedError",
            """def audit_form_values(fields, values):
    schema = {field["name"]: field for field in fields}
    unknown = sorted(set(values) - set(schema))
    missing = sorted(field["name"] for field in fields if field.get("required", False) and values.get(field["name"]) in {None, ""})
    invalid = []
    for name, value in values.items():
        if name not in schema:
            continue
        field = schema[name]
        if field["type"] == "checkbox" and not isinstance(value, bool):
            invalid.append(name)
        elif field["type"] == "choice" and value not in field.get("options", []):
            invalid.append(name)
    return {"ready": not unknown and not missing and not invalid, "unknown": unknown, "missing": missing, "invalid": sorted(invalid), "fill": sorted(name for name in values if name in schema and name not in invalid)}
""",
            "audit_form_values",
            [
                (
                    "accepts-valid-form-values",
                    [[{"name": "name", "type": "text", "required": True}, {"name": "agree", "type": "checkbox"}], {"name": "A", "agree": True}],
                    {"ready": True, "unknown": [], "missing": [], "invalid": [], "fill": ["agree", "name"]},
                ),
                (
                    "reports-unknown-missing-and-invalid",
                    [[{"name": "name", "type": "text", "required": True}, {"name": "agree", "type": "checkbox"}], {"name": "", "agree": "yes", "extra": 1}],
                    {"ready": False, "unknown": ["extra"], "missing": ["name"], "invalid": ["agree"], "fill": ["name"]},
                ),
                (
                    "reports-invalid-choice",
                    [[{"name": "region", "type": "choice", "options": ["KR"]}], {"region": "US"}],
                    {"ready": False, "unknown": [], "missing": [], "invalid": ["region"], "fill": []},
                ),
            ],
            [
                "값 dict의 unknown field를 조용히 무시하지 마세요.",
                "required·checkbox·choice type을 fill 전에 검사하세요.",
            ],
        ),
        "retrieval": decision(
            "pdf-form-recall",
            "PDF form 채우기 품질 기준 회상하기",
            "field schema·value type·재개방 evidence를 복원한다.",
            "choose_pdf_form_evidence",
            {
                "schema": {"action": "validate unique names types and defaults", "evidence": "field manifest", "risk": "ambiguous form"},
                "fill": {"action": "reject unknown missing invalid values", "evidence": "fill plan", "risk": "wrong field value"},
                "verify": {"action": "reopen and read filled fields", "evidence": "observed field values", "risk": "unsaved form data"},
            },
        ),
    },
    "10": {
        "mastery": T(
            "invoice-reconciliation",
            "월간 청구서의 line item·세금·총액 reconciliation 감사하기",
            "수량·단가 합과 세율, 표시 총액, invoice identity를 판정한다.",
            "audit_invoice(invoice)를 완성하세요.",
            "def audit_invoice(invoice):\n    raise NotImplementedError",
            """def audit_invoice(invoice):
    from decimal import Decimal, ROUND_HALF_UP
    failures = []
    if not invoice.get("invoiceId") or not invoice.get("customerId"):
        failures.append("identity")
    subtotal = sum(Decimal(str(item["quantity"])) * Decimal(str(item["unitPrice"])) for item in invoice.get("items", []))
    tax = (subtotal * Decimal(str(invoice["taxRate"]))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    total = subtotal + tax
    if Decimal(str(invoice.get("displayedSubtotal", 0))) != subtotal:
        failures.append("subtotal")
    if Decimal(str(invoice.get("displayedTax", 0))) != tax:
        failures.append("tax")
    if Decimal(str(invoice.get("displayedTotal", 0))) != total:
        failures.append("total")
    return {"passed": not failures, "failures": failures, "computedSubtotal": format(subtotal, ".2f"), "computedTax": format(tax, ".2f"), "computedTotal": format(total, ".2f")}
""",
            "audit_invoice",
            [
                (
                    "accepts-reconciled-invoice",
                    [{"invoiceId": "I1", "customerId": "C1", "items": [{"quantity": 2, "unitPrice": "10.00"}, {"quantity": 1, "unitPrice": "5.50"}], "taxRate": "0.1", "displayedSubtotal": "25.50", "displayedTax": "2.55", "displayedTotal": "28.05"}],
                    {"passed": True, "failures": [], "computedSubtotal": "25.50", "computedTax": "2.55", "computedTotal": "28.05"},
                ),
                (
                    "reports-identity-and-amount-mismatches",
                    [{"invoiceId": "", "customerId": "", "items": [{"quantity": 1, "unitPrice": 10}], "taxRate": "0.1", "displayedSubtotal": 9, "displayedTax": 0, "displayedTotal": 9}],
                    {"passed": False, "failures": ["identity", "subtotal", "tax", "total"], "computedSubtotal": "10.00", "computedTax": "1.00", "computedTotal": "11.00"},
                ),
                (
                    "rounds-tax-half-up",
                    [{"invoiceId": "I", "customerId": "C", "items": [{"quantity": 1, "unitPrice": "0.05"}], "taxRate": "0.1", "displayedSubtotal": "0.05", "displayedTax": "0.01", "displayedTotal": "0.06"}],
                    {"passed": True, "failures": [], "computedSubtotal": "0.05", "computedTax": "0.01", "computedTotal": "0.06"},
                ),
            ],
            [
                "금액 계산은 Decimal과 명시한 반올림 정책을 사용하세요.",
                "invoice/customer identity와 subtotal·tax·total을 모두 검증하세요.",
            ],
        ),
        "transfer": T(
            "invoice-pdf-release",
            "새 청구서 PDF의 text·render·security·중복 release gate 전이하기",
            "invoice identity별 현재 source artifact가 한 개이고 모든 검증을 통과했는지 판정한다.",
            "decide_invoice_release(artifacts, current_source_hash)를 완성하세요.",
            "def decide_invoice_release(artifacts, current_source_hash):\n    raise NotImplementedError",
            """def decide_invoice_release(artifacts, current_source_hash):
    current = [item for item in artifacts if item["sourceHash"] == current_source_hash]
    stale = sorted(item["id"] for item in artifacts if item["sourceHash"] != current_source_hash)
    counts = {}
    failures = []
    invalid = []
    for item in current:
        counts[item["invoiceId"]] = counts.get(item["invoiceId"], 0) + 1
        if not item.get("textPassed") or not item.get("renderPassed") or not item.get("securityPassed"):
            invalid.append(item["id"])
    duplicates = sorted(invoice_id for invoice_id, count in counts.items() if count > 1)
    if duplicates:
        failures.append("duplicates")
    if invalid:
        failures.append("verification")
    if not current:
        failures.append("current-artifacts")
    return {"releaseReady": not failures and not stale, "failures": failures, "staleArtifacts": stale, "duplicateInvoices": duplicates, "invalidArtifacts": sorted(invalid)}
""",
            "decide_invoice_release",
            [
                (
                    "accepts-one-verified-current-invoice",
                    [[{"id": "a", "invoiceId": "I1", "sourceHash": "s", "textPassed": True, "renderPassed": True, "securityPassed": True}], "s"],
                    {"releaseReady": True, "failures": [], "staleArtifacts": [], "duplicateInvoices": [], "invalidArtifacts": []},
                ),
                (
                    "reports-duplicate-and-invalid-invoice",
                    [[{"id": "a", "invoiceId": "I1", "sourceHash": "s", "textPassed": True, "renderPassed": False, "securityPassed": True}, {"id": "b", "invoiceId": "I1", "sourceHash": "s", "textPassed": True, "renderPassed": True, "securityPassed": True}], "s"],
                    {"releaseReady": False, "failures": ["duplicates", "verification"], "staleArtifacts": [], "duplicateInvoices": ["I1"], "invalidArtifacts": ["a"]},
                ),
                (
                    "reports-stale-and-no-current-artifact",
                    [[{"id": "old", "invoiceId": "I1", "sourceHash": "old", "textPassed": True, "renderPassed": True, "securityPassed": True}], "s"],
                    {"releaseReady": False, "failures": ["current-artifacts"], "staleArtifacts": ["old"], "duplicateInvoices": [], "invalidArtifacts": []},
                ),
            ],
            [
                "invoice identity마다 현재 source artifact가 정확히 하나인지 검사하세요.",
                "text·render·security 검증을 모두 통과해야 release하세요.",
            ],
        ),
        "retrieval": decision(
            "invoice-pdf-capstone-recall",
            "월간 청구서 PDF 종료 조건 회상하기",
            "금액·identity·text·render·security·중복 근거를 복원한다.",
            "choose_invoice_pdf_gate",
            {
                "amount": {"action": "recompute line subtotal tax total", "evidence": "Decimal reconciliation", "risk": "wrong invoice amount"},
                "artifact": {"action": "reopen text and render pages", "evidence": "required text and visible blocks", "risk": "blank or clipped invoice"},
                "release": {"action": "require one secured artifact per invoice", "evidence": "source-bound invoice manifest", "risk": "duplicate or stale bill"},
            },
        ),
    },
}
