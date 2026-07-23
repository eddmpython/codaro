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
            "match 수만 보지 말고 정규화 뒤 보존된 의미와 거부된 입력을 함께 확인하세요.",
            "regex가 아닌 전용 parser가 필요한 구조에서는 경계를 명시하세요.",
        ],
    )


BLUEPRINTS: dict[str, dict[str, TaskBlueprint]] = {
    "00": {
        "mastery": T(
            "regex-contract-audit",
            "정규표현식의 anchor·group·fixture 계약 감사하기",
            "pattern이 전체 입력 계약과 필요한 named group을 표현하는지 검사한다.",
            "audit_regex_contract(pattern, required_groups, samples)를 완성하세요.",
            "def audit_regex_contract(pattern, required_groups, samples):\n    raise NotImplementedError",
            """def audit_regex_contract(pattern, required_groups, samples):
    import re
    compiled = re.compile(pattern)
    failures = []
    if not pattern.startswith("^") or not pattern.endswith("$"):
        failures.append("anchors")
    missing_groups = sorted(set(required_groups) - set(compiled.groupindex))
    if missing_groups:
        failures.append("groups")
    mismatches = []
    for sample in samples:
        matched = compiled.fullmatch(sample["text"]) is not None
        if matched != sample["valid"]:
            mismatches.append(sample["id"])
    if mismatches:
        failures.append("fixtures")
    return {"accepted": not failures, "failures": failures, "missingGroups": missing_groups, "mismatches": mismatches}
""",
            "audit_regex_contract",
            [
                (
                    "accepts-anchored-named-pattern",
                    [r"^(?P<code>[A-Z]{2})-(?P<number>\d{3})$", ["code", "number"], [{"id": "ok", "text": "AB-123", "valid": True}, {"id": "bad", "text": "xAB-123", "valid": False}]],
                    {"accepted": True, "failures": [], "missingGroups": [], "mismatches": []},
                ),
                (
                    "reports-anchor-group-and-fixture",
                    [r"[A-Z]+", ["code"], [{"id": "digits", "text": "123", "valid": True}]],
                    {"accepted": False, "failures": ["anchors", "groups", "fixtures"], "missingGroups": ["code"], "mismatches": ["digits"]},
                ),
                (
                    "reports-only-fixture-gap",
                    [r"^(?P<value>\d+)$", ["value"], [{"id": "letters", "text": "abc", "valid": True}]],
                    {"accepted": False, "failures": ["fixtures"], "missingGroups": [], "mismatches": ["letters"]},
                ),
            ],
            [
                "부분 검색과 전체 형식 검증을 같은 `match`로 취급하지 마세요.",
                "숫자 group 번호 대신 업무 의미가 드러나는 named group을 사용하세요.",
            ],
        ),
        "transfer": T(
            "regex-risk-audit",
            "새 pattern에 성능·가독성 위험 감사 전이하기",
            "중첩 반복, 무제한 wildcard, fixture 한계를 휴리스틱으로 보고한다.",
            "audit_regex_risks(pattern, maximum_length, fixture_lengths)를 완성하세요.",
            "def audit_regex_risks(pattern, maximum_length, fixture_lengths):\n    raise NotImplementedError",
            r"""def audit_regex_risks(pattern, maximum_length, fixture_lengths):
    import re
    if maximum_length <= 0:
        raise ValueError("maximum length must be positive")
    risks = []
    if re.search(r"\([^)]*[+*][^)]*\)[+*]", pattern):
        risks.append("nested-quantifier")
    if ".*" in pattern and not pattern.startswith("^"):
        risks.append("unbounded-prefix")
    if not fixture_lengths or max(fixture_lengths) < maximum_length:
        risks.append("boundary-not-tested")
    return {"safeToBenchmark": "nested-quantifier" not in risks, "risks": risks, "maximumLength": maximum_length}
""",
            "audit_regex_risks",
            [
                (
                    "accepts-bounded-tested-pattern",
                    [r"^[A-Z]{1,4}\d{1,6}$", 20, [0, 5, 20]],
                    {"safeToBenchmark": True, "risks": [], "maximumLength": 20},
                ),
                (
                    "reports-nested-and-boundary",
                    [r"^(a+)+$", 100, [10]],
                    {"safeToBenchmark": False, "risks": ["nested-quantifier", "boundary-not-tested"], "maximumLength": 100},
                ),
                (
                    "reports-unbounded-prefix",
                    [r".*token=(\w+)$", 50, [50]],
                    {"safeToBenchmark": True, "risks": ["unbounded-prefix"], "maximumLength": 50},
                ),
                ("rejects-invalid-bound", [r"^x$", 0, []], E("ValueError")),
            ],
            [
                "중첩 quantifier는 긴 실패 입력에서 반드시 별도 benchmark하세요.",
                "평균 길이 fixture만 두지 말고 허용 최대 길이를 포함하세요.",
            ],
        ),
        "retrieval": decision(
            "regex-foundation-recall",
            "정규표현식 적용 경계 회상하기",
            "검색·전체 검증·구조 parser 사용 시점을 구분한다.",
            "choose_regex_boundary",
            {
                "search": {"action": "find explicit token pattern", "evidence": "span and named groups", "risk": "false positive"},
                "validate": {"action": "fullmatch bounded format", "evidence": "valid and invalid fixtures", "risk": "partial match"},
                "structured-data": {"action": "use dedicated parser", "evidence": "parsed structure", "risk": "regex grammar drift"},
            },
        ),
    },
    "01": {
        "mastery": T(
            "email-extraction-normalization",
            "본문에서 이메일을 추출하고 identity 정규화하기",
            "구두점 경계를 제외하고 대소문자 중복을 제거해 출현 근거를 남긴다.",
            "extract_emails(text)를 완성하세요.",
            "def extract_emails(text):\n    raise NotImplementedError",
            r"""def extract_emails(text):
    import re
    pattern = re.compile(r"(?<![\w.+-])([A-Za-z0-9][A-Za-z0-9._+-]*@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+)(?![\w-])")
    first_seen = {}
    occurrences = []
    for match in pattern.finditer(text):
        raw = match.group(1)
        normalized = raw.lower()
        first_seen.setdefault(normalized, raw)
        occurrences.append({"email": normalized, "start": match.start(1), "end": match.end(1)})
    return {"unique": list(first_seen), "occurrences": occurrences, "count": len(occurrences)}
""",
            "extract_emails",
            [
                (
                    "extracts-and-deduplicates-case",
                    ["Mail A.Test@example.com, then a.test@EXAMPLE.com."],
                    {"unique": ["a.test@example.com"], "occurrences": [{"email": "a.test@example.com", "start": 5, "end": 23}, {"email": "a.test@example.com", "start": 30, "end": 48}], "count": 2},
                ),
                (
                    "keeps-plus-address",
                    ["owner+alerts@service.test"],
                    {"unique": ["owner+alerts@service.test"], "occurrences": [{"email": "owner+alerts@service.test", "start": 0, "end": 25}], "count": 1},
                ),
                (
                    "ignores-invalid-addresses",
                    ["missing@domain and @example.test"],
                    {"unique": [], "occurrences": [], "count": 0},
                ),
            ],
            [
                "추출 원문과 정규화 identity를 구분하고 span을 근거로 남기세요.",
                "대소문자만 다른 이메일을 별도 사람으로 집계하지 마세요.",
            ],
        ),
        "transfer": T(
            "email-domain-policy",
            "새 이메일 목록에 domain 정책 전이하기",
            "허용·차단 domain과 malformed 주소를 서로 다른 사유로 분류한다.",
            "classify_email_domains(emails, allowed_domains, blocked_domains)를 완성하세요.",
            "def classify_email_domains(emails, allowed_domains, blocked_domains):\n    raise NotImplementedError",
            r"""def classify_email_domains(emails, allowed_domains, blocked_domains):
    import re
    valid = re.compile(r"^[^@\s]+@([A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+)$")
    accepted = []
    rejected = []
    allowed = {value.lower() for value in allowed_domains}
    blocked = {value.lower() for value in blocked_domains}
    for email in emails:
        match = valid.fullmatch(email)
        if not match:
            rejected.append({"email": email, "reason": "malformed"})
            continue
        domain = match.group(1).lower()
        if domain in blocked:
            rejected.append({"email": email, "reason": "blocked"})
        elif allowed and domain not in allowed:
            rejected.append({"email": email, "reason": "not-allowed"})
        else:
            accepted.append(email.lower())
    return {"accepted": accepted, "rejected": rejected}
""",
            "classify_email_domains",
            [
                (
                    "accepts-allowed-domain",
                    [["A@Example.test"], ["example.test"], []],
                    {"accepted": ["a@example.test"], "rejected": []},
                ),
                (
                    "distinguishes-blocked-and-not-allowed",
                    [["a@blocked.test", "b@other.test"], ["example.test"], ["blocked.test"]],
                    {"accepted": [], "rejected": [{"email": "a@blocked.test", "reason": "blocked"}, {"email": "b@other.test", "reason": "not-allowed"}]},
                ),
                (
                    "reports-malformed",
                    [["no-at-sign"], [], []],
                    {"accepted": [], "rejected": [{"email": "no-at-sign", "reason": "malformed"}]},
                ),
            ],
            [
                "형식 오류와 정책 거부를 같은 invalid 묶음으로 숨기지 마세요.",
                "domain 비교는 대소문자를 정규화한 뒤 수행하세요.",
            ],
        ),
        "retrieval": decision(
            "email-extraction-recall",
            "이메일 추출 품질 기준 회상하기",
            "추출·identity·정책 판정을 분리한다.",
            "choose_email_evidence",
            {
                "extract": {"action": "find bounded address spans", "evidence": "raw span and normalized address", "risk": "punctuation capture"},
                "deduplicate": {"action": "normalize case for identity", "evidence": "occurrence count and unique list", "risk": "lost provenance"},
                "policy": {"action": "classify domain separately", "evidence": "explicit rejection reason", "risk": "silent filtering"},
            },
        ),
    },
    "02": {
        "mastery": T(
            "phone-number-normalization",
            "한국 전화번호를 E.164 identity로 정규화하기",
            "구분자와 국내 prefix를 처리하고 모호한 길이는 거부한다.",
            "normalize_korean_phone(value)를 완성하세요.",
            "def normalize_korean_phone(value):\n    raise NotImplementedError",
            """def normalize_korean_phone(value):
    digits = "".join(character for character in value if character.isdigit())
    if digits.startswith("82"):
        national = "0" + digits[2:]
    else:
        national = digits
    if national.startswith("010") and len(national) == 11:
        return {"e164": "+82" + national[1:], "kind": "mobile"}
    if national.startswith("02") and len(national) in {9, 10}:
        return {"e164": "+82" + national[1:], "kind": "seoul-landline"}
    raise ValueError("unsupported Korean phone number")
""",
            "normalize_korean_phone",
            [
                ("normalizes-mobile", ["010-1234-5678"], {"e164": "+821012345678", "kind": "mobile"}),
                ("normalizes-country-code", ["+82 10 9876 5432"], {"e164": "+821098765432", "kind": "mobile"}),
                ("normalizes-seoul-landline", ["02-123-4567"], {"e164": "+8221234567", "kind": "seoul-landline"}),
                ("rejects-short-number", ["010-123"], E("ValueError")),
            ],
            [
                "숫자만 남기는 것으로 끝내지 말고 국가 코드와 종류를 명시하세요.",
                "길이가 모호한 번호를 추측해 채우지 마세요.",
            ],
        ),
        "transfer": T(
            "phone-batch-reconciliation",
            "새 연락처 batch에 중복·동의 상태 감사 전이하기",
            "정규화된 전화 identity별로 중복과 연락 동의 누락을 보고한다.",
            "audit_phone_batch(records)를 완성하세요.",
            "def audit_phone_batch(records):\n    raise NotImplementedError",
            """def audit_phone_batch(records):
    by_phone = {}
    for record in records:
        by_phone.setdefault(record["phone"], []).append(record)
    duplicates = sorted(phone for phone, items in by_phone.items() if len(items) > 1)
    no_consent = sorted(record["id"] for record in records if not record.get("contactConsent", False))
    conflicts = []
    for phone, items in sorted(by_phone.items()):
        owners = sorted({item["id"] for item in items})
        if len(owners) > 1:
            conflicts.append({"phone": phone, "owners": owners})
    return {"ready": not duplicates and not no_consent, "duplicates": duplicates, "noConsent": no_consent, "conflicts": conflicts}
""",
            "audit_phone_batch",
            [
                (
                    "accepts-unique-consented-records",
                    [[{"id": "a", "phone": "+821011112222", "contactConsent": True}]],
                    {"ready": True, "duplicates": [], "noConsent": [], "conflicts": []},
                ),
                (
                    "reports-duplicate-owners",
                    [[{"id": "a", "phone": "+821011112222", "contactConsent": True}, {"id": "b", "phone": "+821011112222", "contactConsent": True}]],
                    {"ready": False, "duplicates": ["+821011112222"], "noConsent": [], "conflicts": [{"phone": "+821011112222", "owners": ["a", "b"]}]},
                ),
                (
                    "reports-no-consent",
                    [[{"id": "a", "phone": "+821011112222", "contactConsent": False}]],
                    {"ready": False, "duplicates": [], "noConsent": ["a"], "conflicts": []},
                ),
            ],
            [
                "표시 형식이 다른 번호는 E.164로 정규화한 뒤 중복을 찾으세요.",
                "번호 형식 통일이 연락 동의를 의미하지 않습니다.",
            ],
        ),
        "retrieval": decision(
            "phone-normalization-recall",
            "전화번호 정규화 경계 회상하기",
            "형식·identity·연락 권한을 구분한다.",
            "choose_phone_evidence",
            {
                "format": {"action": "strip separators and validate length", "evidence": "recognized national pattern", "risk": "guessed digits"},
                "identity": {"action": "convert to E.164", "evidence": "country code and kind", "risk": "duplicate display formats"},
                "contact": {"action": "check explicit consent", "evidence": "consent record", "risk": "unauthorized outreach"},
            },
        ),
    },
    "03": {
        "mastery": T(
            "url-structure-parse",
            "URL을 전용 parser로 안전하게 구조화하기",
            "scheme·host·port·path·query를 분리하고 fragment를 요청에서 제외한다.",
            "parse_url_contract(url)를 완성하세요.",
            "def parse_url_contract(url):\n    raise NotImplementedError",
            """def parse_url_contract(url):
    from urllib.parse import parse_qsl, urlsplit
    parts = urlsplit(url)
    if parts.scheme not in {"http", "https"} or not parts.hostname:
        raise ValueError("absolute HTTP URL required")
    query = {}
    for key, value in parse_qsl(parts.query, keep_blank_values=True):
        query.setdefault(key, []).append(value)
    default_port = 443 if parts.scheme == "https" else 80
    return {"scheme": parts.scheme, "host": parts.hostname, "port": parts.port or default_port, "path": parts.path or "/", "query": query, "fragment": parts.fragment}
""",
            "parse_url_contract",
            [
                (
                    "parses-repeated-query-and-fragment",
                    ["https://Example.test:8443/items?q=a&q=b#top"],
                    {"scheme": "https", "host": "example.test", "port": 8443, "path": "/items", "query": {"q": ["a", "b"]}, "fragment": "top"},
                ),
                (
                    "applies-default-port-and-path",
                    ["http://example.test"],
                    {"scheme": "http", "host": "example.test", "port": 80, "path": "/", "query": {}, "fragment": ""},
                ),
                ("rejects-relative-url", ["/items?q=a"], E("ValueError")),
            ],
            [
                "URL 전체를 regex group으로 재구현하지 말고 `urllib.parse`를 사용하세요.",
                "반복 query key를 마지막 값 하나로 덮지 마세요.",
            ],
        ),
        "transfer": T(
            "url-redaction-policy",
            "새 URL 로그에 query secret 제거 전이하기",
            "민감 query 값을 redacted marker로 바꾸고 제거된 key를 보고한다.",
            "redact_url_query(url, secret_keys)를 완성하세요.",
            "def redact_url_query(url, secret_keys):\n    raise NotImplementedError",
            """def redact_url_query(url, secret_keys):
    from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
    parts = urlsplit(url)
    secrets = {key.lower() for key in secret_keys}
    redacted_keys = []
    pairs = []
    for key, value in parse_qsl(parts.query, keep_blank_values=True):
        if key.lower() in secrets:
            pairs.append((key, "[REDACTED]"))
            redacted_keys.append(key)
        else:
            pairs.append((key, value))
    clean = urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(pairs), ""))
    return {"url": clean, "redactedKeys": redacted_keys, "fragmentRemoved": bool(parts.fragment)}
""",
            "redact_url_query",
            [
                (
                    "redacts-token-and-removes-fragment",
                    ["https://api.test/items?token=abc&q=hello#debug", ["token"]],
                    {"url": "https://api.test/items?token=%5BREDACTED%5D&q=hello", "redactedKeys": ["token"], "fragmentRemoved": True},
                ),
                (
                    "matches-key-case-insensitively",
                    ["https://api.test/?API_KEY=abc", ["api_key"]],
                    {"url": "https://api.test/?API_KEY=%5BREDACTED%5D", "redactedKeys": ["API_KEY"], "fragmentRemoved": False},
                ),
                (
                    "preserves-safe-query",
                    ["https://api.test/?page=2", ["token"]],
                    {"url": "https://api.test/?page=2", "redactedKeys": [], "fragmentRemoved": False},
                ),
            ],
            [
                "URL을 로그에 쓰기 전에 token·key query를 이름 기준으로 제거하세요.",
                "fragment는 서버 요청 증거가 아니므로 보존 목적을 명시하지 않으면 제거하세요.",
            ],
        ),
        "retrieval": decision(
            "url-parsing-recall",
            "URL 구조 처리 원칙 회상하기",
            "구조 파싱·origin 판정·로그 redaction 역할을 구분한다.",
            "choose_url_action",
            {
                "parse": {"action": "use urlsplit and parse_qsl", "evidence": "scheme host path repeated query", "risk": "regex edge cases"},
                "authorize": {"action": "compare normalized origin", "evidence": "scheme host effective port", "risk": "lookalike host"},
                "log": {"action": "redact secret query and fragment", "evidence": "redacted key list", "risk": "credential leakage"},
            },
        ),
    },
    "04": {
        "mastery": T(
            "html-visible-text",
            "HTML parser로 보이는 텍스트 추출하기",
            "script·style 내용을 제외하고 block 경계의 텍스트를 순서대로 반환한다.",
            "extract_visible_text(html_text)를 완성하세요.",
            "def extract_visible_text(html_text):\n    raise NotImplementedError",
            """def extract_visible_text(html_text):
    from html.parser import HTMLParser
    class VisibleTextParser(HTMLParser):
        def __init__(self):
            super().__init__()
            self.hidden = 0
            self.parts = []
        def handle_starttag(self, tag, attrs):
            if tag in {"script", "style"}:
                self.hidden += 1
        def handle_endtag(self, tag):
            if tag in {"script", "style"} and self.hidden:
                self.hidden -= 1
        def handle_data(self, data):
            value = " ".join(data.split())
            if value and not self.hidden:
                self.parts.append(value)
    parser = VisibleTextParser()
    parser.feed(html_text)
    return {"text": " ".join(parser.parts), "parts": parser.parts}
""",
            "extract_visible_text",
            [
                (
                    "extracts-visible-text",
                    ["<main><h1>Hello</h1><p>World</p></main>"],
                    {"text": "Hello World", "parts": ["Hello", "World"]},
                ),
                (
                    "excludes-script-and-style",
                    ["<style>.x{}</style><p>Keep</p><script>alert(1)</script>"],
                    {"text": "Keep", "parts": ["Keep"]},
                ),
                (
                    "normalizes-whitespace-and-entities",
                    ["<p>A&nbsp;  B &amp; C</p>"],
                    {"text": "A B & C", "parts": ["A B & C"]},
                ),
            ],
            [
                "HTML 태그 제거를 `<.*?>` regex 한 줄로 구현하지 마세요.",
                "script·style의 비가시 텍스트를 학습 자료나 검색 corpus에 섞지 마세요.",
            ],
        ),
        "transfer": T(
            "html-link-inventory",
            "새 HTML 문서에 링크 inventory 추출 전이하기",
            "base URL로 절대화하고 scheme allowlist 밖 링크를 격리한다.",
            "inventory_links(html_text, base_url)를 완성하세요.",
            "def inventory_links(html_text, base_url):\n    raise NotImplementedError",
            """def inventory_links(html_text, base_url):
    from html.parser import HTMLParser
    from urllib.parse import urljoin, urlsplit
    class LinkParser(HTMLParser):
        def __init__(self):
            super().__init__()
            self.hrefs = []
        def handle_starttag(self, tag, attrs):
            if tag == "a":
                values = dict(attrs)
                if values.get("href"):
                    self.hrefs.append(values["href"])
    parser = LinkParser()
    parser.feed(html_text)
    accepted = []
    rejected = []
    for href in parser.hrefs:
        absolute = urljoin(base_url, href)
        if urlsplit(absolute).scheme in {"http", "https"}:
            accepted.append(absolute)
        else:
            rejected.append({"href": href, "reason": "scheme"})
    return {"accepted": accepted, "rejected": rejected}
""",
            "inventory_links",
            [
                (
                    "resolves-relative-links",
                    ["<a href='/docs'>Docs</a><a href='next'>Next</a>", "https://example.test/base/"],
                    {"accepted": ["https://example.test/docs", "https://example.test/base/next"], "rejected": []},
                ),
                (
                    "rejects-script-scheme",
                    ["<a href='javascript:alert(1)'>Bad</a>", "https://example.test/"],
                    {"accepted": [], "rejected": [{"href": "javascript:alert(1)", "reason": "scheme"}]},
                ),
                (
                    "ignores-anchor-without-href",
                    ["<a>Plain</a>", "https://example.test/"],
                    {"accepted": [], "rejected": []},
                ),
            ],
            [
                "상대 URL은 문서의 실제 base URL과 함께 절대화하세요.",
                "`javascript:` 같은 비 HTTP scheme을 자동 요청 목록에 넣지 마세요.",
            ],
        ),
        "retrieval": decision(
            "html-processing-recall",
            "HTML 텍스트 처리 경계 회상하기",
            "보이는 텍스트·링크·sanitization 책임을 구분한다.",
            "choose_html_processing",
            {
                "visible-text": {"action": "HTMLParser excluding script style", "evidence": "ordered text parts", "risk": "hidden content"},
                "links": {"action": "parse href then urljoin", "evidence": "absolute URL and scheme", "risk": "unsafe scheme"},
                "render-user-html": {"action": "use vetted sanitizer", "evidence": "allowed tags and attributes", "risk": "XSS"},
            },
        ),
    },
    "05": {
        "mastery": T(
            "structured-log-parse",
            "로그 줄을 timestamp·level·message로 구조화하기",
            "형식 오류 줄을 누락시키지 않고 rejected 근거로 분리한다.",
            "parse_log_lines(lines)를 완성하세요.",
            "def parse_log_lines(lines):\n    raise NotImplementedError",
            r"""def parse_log_lines(lines):
    import re
    pattern = re.compile(r"^(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z) \[(?P<level>INFO|WARN|ERROR)\] (?P<message>.+)$")
    records = []
    rejected = []
    for index, line in enumerate(lines):
        match = pattern.fullmatch(line)
        if not match:
            rejected.append({"line": index + 1, "text": line})
        else:
            records.append(match.groupdict())
    counts = {level: sum(record["level"] == level for record in records) for level in ["INFO", "WARN", "ERROR"]}
    return {"records": records, "rejected": rejected, "counts": counts}
""",
            "parse_log_lines",
            [
                (
                    "parses-and-counts-levels",
                    [["2026-07-22T00:00:00Z [INFO] ready", "2026-07-22T00:00:01Z [ERROR] failed"]],
                    {"records": [{"timestamp": "2026-07-22T00:00:00Z", "level": "INFO", "message": "ready"}, {"timestamp": "2026-07-22T00:00:01Z", "level": "ERROR", "message": "failed"}], "rejected": [], "counts": {"INFO": 1, "WARN": 0, "ERROR": 1}},
                ),
                (
                    "reports-malformed-line-number",
                    [["bad line", "2026-07-22T00:00:00Z [WARN] slow"]],
                    {"records": [{"timestamp": "2026-07-22T00:00:00Z", "level": "WARN", "message": "slow"}], "rejected": [{"line": 1, "text": "bad line"}], "counts": {"INFO": 0, "WARN": 1, "ERROR": 0}},
                ),
                (
                    "rejects-empty-message",
                    [["2026-07-22T00:00:00Z [INFO] "]],
                    {"records": [], "rejected": [{"line": 1, "text": "2026-07-22T00:00:00Z [INFO] "}], "counts": {"INFO": 0, "WARN": 0, "ERROR": 0}},
                ),
            ],
            [
                "파싱 실패 줄을 버리지 말고 원래 line number와 함께 격리하세요.",
                "level count의 분모가 accepted line인지 전체 line인지 명시하세요.",
            ],
        ),
        "transfer": T(
            "log-incident-window",
            "새 로그 흐름에 오류 incident 묶기 전이하기",
            "시간 간격 threshold 안의 ERROR를 같은 incident로 집계한다.",
            "group_error_incidents(events, maximum_gap_seconds)를 완성하세요.",
            "def group_error_incidents(events, maximum_gap_seconds):\n    raise NotImplementedError",
            """def group_error_incidents(events, maximum_gap_seconds):
    if maximum_gap_seconds < 0:
        raise ValueError("negative gap")
    errors = sorted((event for event in events if event["level"] == "ERROR"), key=lambda event: event["at"])
    incidents = []
    for event in errors:
        if not incidents or event["at"] - incidents[-1]["end"] > maximum_gap_seconds:
            incidents.append({"start": event["at"], "end": event["at"], "messages": [event["message"]]})
        else:
            incidents[-1]["end"] = event["at"]
            incidents[-1]["messages"].append(event["message"])
    return {"incidentCount": len(incidents), "incidents": incidents}
""",
            "group_error_incidents",
            [
                (
                    "groups-nearby-errors",
                    [[{"at": 0, "level": "ERROR", "message": "a"}, {"at": 5, "level": "WARN", "message": "w"}, {"at": 8, "level": "ERROR", "message": "b"}], 10],
                    {"incidentCount": 1, "incidents": [{"start": 0, "end": 8, "messages": ["a", "b"]}]},
                ),
                (
                    "splits-distant-errors",
                    [[{"at": 1, "level": "ERROR", "message": "a"}, {"at": 20, "level": "ERROR", "message": "b"}], 5],
                    {"incidentCount": 2, "incidents": [{"start": 1, "end": 1, "messages": ["a"]}, {"start": 20, "end": 20, "messages": ["b"]}]},
                ),
                ("rejects-negative-gap", [[], -1], E("ValueError")),
            ],
            [
                "ERROR 줄 수와 실제 incident 수를 같은 지표로 부르지 마세요.",
                "묶음 threshold를 report에 남겨 재집계 가능하게 하세요.",
            ],
        ),
        "retrieval": decision(
            "log-analysis-recall",
            "로그 분석 증거 회상하기",
            "파싱 품질·level 집계·incident 집계를 구분한다.",
            "choose_log_evidence",
            {
                "parse": {"action": "fullmatch structured line", "evidence": "accepted and rejected counts", "risk": "silent drop"},
                "levels": {"action": "count accepted records", "evidence": "level denominator", "risk": "malformed bias"},
                "incidents": {"action": "group errors by explicit gap", "evidence": "start end messages", "risk": "alert count inflation"},
            },
        ),
    },
    "06": {
        "mastery": T(
            "date-format-normalization",
            "여러 날짜 형식을 ISO date로 엄격 변환하기",
            "허용 format만 순서대로 시도하고 모호하거나 유효하지 않은 날짜를 거부한다.",
            "normalize_date(value, formats)를 완성하세요.",
            "def normalize_date(value, formats):\n    raise NotImplementedError",
            """def normalize_date(value, formats):
    from datetime import datetime
    matches = []
    for date_format in formats:
        try:
            parsed = datetime.strptime(value, date_format).date()
            matches.append((date_format, parsed.isoformat()))
        except ValueError:
            pass
    unique_dates = sorted({item[1] for item in matches})
    if not matches:
        raise ValueError("unsupported date")
    if len(unique_dates) > 1:
        raise ValueError("ambiguous date")
    return {"date": unique_dates[0], "matchedFormats": [item[0] for item in matches]}
""",
            "normalize_date",
            [
                ("parses-iso-date", ["2026-07-22", ["%Y-%m-%d", "%d/%m/%Y"]], {"date": "2026-07-22", "matchedFormats": ["%Y-%m-%d"]}),
                ("parses-korean-date", ["2026. 7. 2", ["%Y. %m. %d"]], {"date": "2026-07-02", "matchedFormats": ["%Y. %m. %d"]}),
                ("rejects-invalid-date", ["2026-02-30", ["%Y-%m-%d"]], E("ValueError")),
                ("rejects-ambiguous-date", ["01/02/2026", ["%d/%m/%Y", "%m/%d/%Y"]], E("ValueError")),
            ],
            [
                "유연한 parser가 추측하게 두지 말고 허용 format 목록을 고정하세요.",
                "두 format이 다른 날짜를 만들면 우선순위로 덮지 말고 ambiguous로 거부하세요.",
            ],
        ),
        "transfer": T(
            "dated-record-order-audit",
            "새 날짜 record에 timezone·순서 감사 전이하기",
            "UTC epoch와 source timezone 유무로 역전·중복 시점을 찾는다.",
            "audit_dated_records(records, require_timezone)를 완성하세요.",
            "def audit_dated_records(records, require_timezone):\n    raise NotImplementedError",
            """def audit_dated_records(records, require_timezone):
    failures = []
    missing_timezone = sorted(record["id"] for record in records if require_timezone and not record.get("timezone"))
    if missing_timezone:
        failures.append("timezone")
    reversals = []
    duplicates = []
    previous = None
    seen = set()
    for record in records:
        epoch = record["epoch"]
        if previous is not None and epoch < previous:
            reversals.append(record["id"])
        if epoch in seen:
            duplicates.append(record["id"])
        seen.add(epoch)
        previous = epoch
    if reversals:
        failures.append("order")
    if duplicates:
        failures.append("duplicate-time")
    return {"accepted": not failures, "failures": failures, "missingTimezone": missing_timezone, "reversals": reversals, "duplicates": duplicates}
""",
            "audit_dated_records",
            [
                (
                    "accepts-ordered-zoned-records",
                    [[{"id": "a", "epoch": 1, "timezone": "UTC"}, {"id": "b", "epoch": 2, "timezone": "UTC"}], True],
                    {"accepted": True, "failures": [], "missingTimezone": [], "reversals": [], "duplicates": []},
                ),
                (
                    "reports-timezone-and-reversal",
                    [[{"id": "a", "epoch": 2}, {"id": "b", "epoch": 1, "timezone": "UTC"}], True],
                    {"accepted": False, "failures": ["timezone", "order"], "missingTimezone": ["a"], "reversals": ["b"], "duplicates": []},
                ),
                (
                    "reports-duplicate-time",
                    [[{"id": "a", "epoch": 1}, {"id": "b", "epoch": 1}], False],
                    {"accepted": False, "failures": ["duplicate-time"], "missingTimezone": [], "reversals": [], "duplicates": ["b"]},
                ),
            ],
            [
                "표시 문자열이 아니라 공통 UTC epoch로 record 순서를 검사하세요.",
                "같은 시각의 중복 record를 단순 정렬로 숨기지 마세요.",
            ],
        ),
        "retrieval": decision(
            "date-conversion-recall",
            "날짜 변환 품질 기준 회상하기",
            "format 추측·timezone·정렬 evidence를 구분한다.",
            "choose_date_evidence",
            {
                "parse": {"action": "try explicit format allowlist", "evidence": "matched format and ISO date", "risk": "ambiguous day month"},
                "timestamp": {"action": "require timezone then UTC", "evidence": "source zone and epoch", "risk": "naive datetime"},
                "sequence": {"action": "audit reversals and duplicates", "evidence": "record identities", "risk": "sorted-away source error"},
            },
        ),
    },
    "07": {
        "mastery": T(
            "pii-masking",
            "텍스트의 이메일·전화번호를 길이 비노출 token으로 마스킹하기",
            "민감값 종류별 개수를 남기고 원래 길이를 드러내지 않는 token으로 치환한다.",
            "mask_pii(text)를 완성하세요.",
            "def mask_pii(text):\n    raise NotImplementedError",
            r"""def mask_pii(text):
    import re
    email = re.compile(r"(?<![\w.+-])[A-Za-z0-9][A-Za-z0-9._+-]*@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+(?![\w-])")
    phone = re.compile(r"(?<!\d)01[016789][ -]?\d{3,4}[ -]?\d{4}(?!\d)")
    masked, email_count = email.subn("[EMAIL]", text)
    masked, phone_count = phone.subn("[PHONE]", masked)
    return {"text": masked, "counts": {"email": email_count, "phone": phone_count}, "total": email_count + phone_count}
""",
            "mask_pii",
            [
                (
                    "masks-email-and-phone",
                    ["a@example.test / 010-1234-5678"],
                    {"text": "[EMAIL] / [PHONE]", "counts": {"email": 1, "phone": 1}, "total": 2},
                ),
                (
                    "masks-compact-phone",
                    ["call 01012345678 now"],
                    {"text": "call [PHONE] now", "counts": {"email": 0, "phone": 1}, "total": 1},
                ),
                (
                    "leaves-safe-text",
                    ["order 12345"],
                    {"text": "order 12345", "counts": {"email": 0, "phone": 0}, "total": 0},
                ),
            ],
            [
                "별표 개수로 원본 길이를 드러내지 말고 고정 token을 사용하세요.",
                "마스킹 결과와 종류별 치환 개수를 함께 검증하세요.",
            ],
        ),
        "transfer": T(
            "pii-residual-audit",
            "새 출력물에 민감정보 잔존 검사 전이하기",
            "허용 token 밖 이메일·전화·secret key 패턴을 span과 함께 찾는다.",
            "audit_pii_residuals(text)를 완성하세요.",
            "def audit_pii_residuals(text):\n    raise NotImplementedError",
            r"""def audit_pii_residuals(text):
    import re
    patterns = {
        "email": re.compile(r"[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"),
        "phone": re.compile(r"(?<!\d)01[016789][ -]?\d{3,4}[ -]?\d{4}(?!\d)"),
        "secret": re.compile(r"(?i)(?:api[_-]?key|token)\s*[:=]\s*[^\s,]+"),
    }
    findings = []
    for kind, pattern in patterns.items():
        for match in pattern.finditer(text):
            if kind == "secret" and match.group(0).upper().endswith("[REDACTED]"):
                continue
            findings.append({"kind": kind, "start": match.start(), "end": match.end()})
    findings.sort(key=lambda item: (item["start"], item["kind"]))
    return {"clean": not findings, "findings": findings}
""",
            "audit_pii_residuals",
            [
                (
                    "accepts-redacted-output",
                    ["contact [EMAIL], token=[REDACTED]"],
                    {"clean": True, "findings": []},
                ),
                (
                    "finds-email-and-secret",
                    ["a@example.test token=abc"],
                    {"clean": False, "findings": [{"kind": "email", "start": 0, "end": 14}, {"kind": "secret", "start": 15, "end": 24}]},
                ),
                (
                    "finds-phone-span",
                    ["x 010-1234-5678 y"],
                    {"clean": False, "findings": [{"kind": "phone", "start": 2, "end": 15}]},
                ),
            ],
            [
                "마스킹 함수를 신뢰하지 말고 산출물에 residual scan을 별도로 수행하세요.",
                "발견된 원문을 report에 복사하지 말고 kind와 span만 남기세요.",
            ],
        ),
        "retrieval": decision(
            "pii-masking-recall",
            "개인정보 마스킹 종료 조건 회상하기",
            "탐지·치환·잔존 감사를 분리한다.",
            "choose_pii_action",
            {
                "detect": {"action": "bounded pattern scan", "evidence": "kind and span", "risk": "false negative"},
                "mask": {"action": "replace with fixed typed token", "evidence": "counts by kind", "risk": "length leakage"},
                "release": {"action": "scan final artifact again", "evidence": "zero residual findings", "risk": "pipeline reintroduction"},
            },
        ),
    },
    "08": {
        "mastery": T(
            "text-normalize-tokenize",
            "Unicode·공백을 정규화하고 token provenance 남기기",
            "NFKC와 casefold를 적용한 뒤 token별 원래 순서를 보존한다.",
            "normalize_and_tokenize(text)를 완성하세요.",
            "def normalize_and_tokenize(text):\n    raise NotImplementedError",
            r"""def normalize_and_tokenize(text):
    import re
    import unicodedata
    normalized = " ".join(unicodedata.normalize("NFKC", text).casefold().split())
    tokens = []
    for index, match in enumerate(re.finditer(r"[\w]+", normalized, flags=re.UNICODE)):
        tokens.append({"index": index, "value": match.group(0), "start": match.start(), "end": match.end()})
    return {"normalized": normalized, "tokens": tokens, "count": len(tokens)}
""",
            "normalize_and_tokenize",
            [
                (
                    "normalizes-width-case-and-space",
                    ["  Ｐｙｔｈｏｎ   TEST  "],
                    {"normalized": "python test", "tokens": [{"index": 0, "value": "python", "start": 0, "end": 6}, {"index": 1, "value": "test", "start": 7, "end": 11}], "count": 2},
                ),
                (
                    "keeps-korean-token",
                    ["데이터  분석"],
                    {"normalized": "데이터 분석", "tokens": [{"index": 0, "value": "데이터", "start": 0, "end": 3}, {"index": 1, "value": "분석", "start": 4, "end": 6}], "count": 2},
                ),
                (
                    "handles-punctuation-only",
                    ["... !!!"],
                    {"normalized": "... !!!", "tokens": [], "count": 0},
                ),
            ],
            [
                "lower만 적용하지 말고 Unicode width와 호환 문자를 정규화하세요.",
                "token 값뿐 아니라 normalized text의 span과 index를 남기세요.",
            ],
        ),
        "transfer": T(
            "token-corpus-audit",
            "새 corpus의 token 품질 감사 전이하기",
            "문서별 빈 token, vocabulary, 희귀 token을 분모와 함께 계산한다.",
            "audit_token_corpus(documents, minimum_frequency)를 완성하세요.",
            "def audit_token_corpus(documents, minimum_frequency):\n    raise NotImplementedError",
            """def audit_token_corpus(documents, minimum_frequency):
    if minimum_frequency <= 0:
        raise ValueError("minimum frequency must be positive")
    frequencies = {}
    empty_documents = []
    total = 0
    for document in documents:
        tokens = document["tokens"]
        if not tokens:
            empty_documents.append(document["id"])
        for token in tokens:
            frequencies[token] = frequencies.get(token, 0) + 1
            total += 1
    rare = sorted(token for token, count in frequencies.items() if count < minimum_frequency)
    return {"documentCount": len(documents), "tokenCount": total, "vocabularySize": len(frequencies), "emptyDocuments": sorted(empty_documents), "rareTokens": rare}
""",
            "audit_token_corpus",
            [
                (
                    "counts-corpus-and-rare-tokens",
                    [[{"id": "a", "tokens": ["python", "data"]}, {"id": "b", "tokens": ["python"]}], 2],
                    {"documentCount": 2, "tokenCount": 3, "vocabularySize": 2, "emptyDocuments": [], "rareTokens": ["data"]},
                ),
                (
                    "reports-empty-document",
                    [[{"id": "empty", "tokens": []}], 1],
                    {"documentCount": 1, "tokenCount": 0, "vocabularySize": 0, "emptyDocuments": ["empty"], "rareTokens": []},
                ),
                ("rejects-invalid-frequency", [[], 0], E("ValueError")),
            ],
            [
                "전체 token 수와 vocabulary 수를 같은 크기 지표로 혼동하지 마세요.",
                "token이 0개인 문서를 preprocessing 성공으로 숨기지 마세요.",
            ],
        ),
        "retrieval": decision(
            "text-cleaning-recall",
            "텍스트 정제·tokenization 원칙 회상하기",
            "Unicode 정규화·span·corpus 품질 근거를 복원한다.",
            "choose_text_cleaning_evidence",
            {
                "normalize": {"action": "NFKC casefold whitespace", "evidence": "normalized string", "risk": "semantic compatibility change"},
                "tokenize": {"action": "record ordered token spans", "evidence": "index start end", "risk": "lost provenance"},
                "corpus": {"action": "audit empty and rare tokens", "evidence": "document and token denominators", "risk": "silent empty input"},
            },
        ),
    },
    "09": {
        "mastery": T(
            "named-pattern-extraction",
            "여러 named pattern의 겹치는 match 조정하기",
            "우선순위와 span 길이로 겹침을 해소하고 선택·거부 근거를 남긴다.",
            "resolve_pattern_matches(matches)를 완성하세요.",
            "def resolve_pattern_matches(matches):\n    raise NotImplementedError",
            """def resolve_pattern_matches(matches):
    ordered = sorted(matches, key=lambda item: (item["start"], -item.get("priority", 0), -(item["end"] - item["start"]), item["name"]))
    selected = []
    rejected = []
    for match in ordered:
        overlap = any(match["start"] < item["end"] and item["start"] < match["end"] for item in selected)
        compact = {key: match[key] for key in ["name", "start", "end"]}
        if overlap:
            rejected.append({**compact, "reason": "overlap"})
        else:
            selected.append(compact)
    return {"selected": selected, "rejected": rejected}
""",
            "resolve_pattern_matches",
            [
                (
                    "prefers-higher-priority-overlap",
                    [[{"name": "date", "start": 0, "end": 10, "priority": 2}, {"name": "year", "start": 0, "end": 4, "priority": 1}]],
                    {"selected": [{"name": "date", "start": 0, "end": 10}], "rejected": [{"name": "year", "start": 0, "end": 4, "reason": "overlap"}]},
                ),
                (
                    "keeps-non-overlapping-matches",
                    [[{"name": "a", "start": 0, "end": 2}, {"name": "b", "start": 3, "end": 5}]],
                    {"selected": [{"name": "a", "start": 0, "end": 2}, {"name": "b", "start": 3, "end": 5}], "rejected": []},
                ),
                (
                    "prefers-longer-equal-priority",
                    [[{"name": "short", "start": 0, "end": 2, "priority": 1}, {"name": "long", "start": 0, "end": 5, "priority": 1}]],
                    {"selected": [{"name": "long", "start": 0, "end": 5}], "rejected": [{"name": "short", "start": 0, "end": 2, "reason": "overlap"}]},
                ),
            ],
            [
                "여러 pattern을 순서대로 치환하지 말고 원본 span에서 충돌을 조정하세요.",
                "겹침 해소 우선순위와 거부된 match를 report에 남기세요.",
            ],
        ),
        "transfer": T(
            "pattern-coverage-matrix",
            "새 고급 pattern에 fixture coverage 감사 전이하기",
            "pattern별 positive·negative·boundary fixture 존재 여부를 행렬로 검사한다.",
            "audit_pattern_coverage(pattern_names, fixtures)를 완성하세요.",
            "def audit_pattern_coverage(pattern_names, fixtures):\n    raise NotImplementedError",
            """def audit_pattern_coverage(pattern_names, fixtures):
    required = {"positive", "negative", "boundary"}
    matrix = {}
    missing = {}
    for name in pattern_names:
        kinds = {fixture["kind"] for fixture in fixtures if fixture["pattern"] == name}
        matrix[name] = sorted(kinds)
        absent = sorted(required - kinds)
        if absent:
            missing[name] = absent
    unknown = sorted({fixture["pattern"] for fixture in fixtures} - set(pattern_names))
    return {"complete": not missing and not unknown, "matrix": matrix, "missing": missing, "unknownPatterns": unknown}
""",
            "audit_pattern_coverage",
            [
                (
                    "accepts-full-matrix",
                    [["email"], [{"pattern": "email", "kind": "positive"}, {"pattern": "email", "kind": "negative"}, {"pattern": "email", "kind": "boundary"}]],
                    {"complete": True, "matrix": {"email": ["boundary", "negative", "positive"]}, "missing": {}, "unknownPatterns": []},
                ),
                (
                    "reports-missing-kinds",
                    [["date"], [{"pattern": "date", "kind": "positive"}]],
                    {"complete": False, "matrix": {"date": ["positive"]}, "missing": {"date": ["boundary", "negative"]}, "unknownPatterns": []},
                ),
                (
                    "reports-unknown-pattern",
                    [[], [{"pattern": "extra", "kind": "positive"}]],
                    {"complete": False, "matrix": {}, "missing": {}, "unknownPatterns": ["extra"]},
                ),
            ],
            [
                "happy path fixture 수가 아니라 pattern별 세 종류 coverage를 비교하세요.",
                "등록되지 않은 pattern 이름의 fixture도 drift로 실패시키세요.",
            ],
        ),
        "retrieval": decision(
            "advanced-pattern-recall",
            "고급 pattern matching 품질 기준 회상하기",
            "named group·overlap·fixture matrix 근거를 복원한다.",
            "choose_advanced_pattern_evidence",
            {
                "capture": {"action": "use named groups", "evidence": "semantic group dictionary", "risk": "numeric group drift"},
                "overlap": {"action": "resolve spans by explicit priority", "evidence": "selected and rejected matches", "risk": "double counting"},
                "coverage": {"action": "require positive negative boundary", "evidence": "per-pattern matrix", "risk": "happy-path bias"},
            },
        ),
    },
    "10": {
        "mastery": T(
            "llm-chunk-provenance",
            "LLM 입력 chunk에 원문 provenance와 겹침 계약 만들기",
            "token 목록을 고정 크기·겹침으로 나누고 source span을 보존한다.",
            "chunk_tokens(tokens, size, overlap, source_id)를 완성하세요.",
            "def chunk_tokens(tokens, size, overlap, source_id):\n    raise NotImplementedError",
            """def chunk_tokens(tokens, size, overlap, source_id):
    if size <= 0 or overlap < 0 or overlap >= size:
        raise ValueError("invalid chunk contract")
    step = size - overlap
    chunks = []
    for start in range(0, len(tokens), step):
        values = tokens[start : start + size]
        if not values:
            break
        chunks.append({"id": f"{source_id}:{start}-{start + len(values)}", "sourceId": source_id, "start": start, "end": start + len(values), "tokens": values})
        if start + size >= len(tokens):
            break
    return chunks
""",
            "chunk_tokens",
            [
                (
                    "chunks-with-overlap",
                    [["a", "b", "c", "d", "e"], 3, 1, "doc"],
                    [{"id": "doc:0-3", "sourceId": "doc", "start": 0, "end": 3, "tokens": ["a", "b", "c"]}, {"id": "doc:2-5", "sourceId": "doc", "start": 2, "end": 5, "tokens": ["c", "d", "e"]}],
                ),
                (
                    "handles-short-document",
                    [["a"], 3, 0, "one"],
                    [{"id": "one:0-1", "sourceId": "one", "start": 0, "end": 1, "tokens": ["a"]}],
                ),
                (
                    "handles-empty-document",
                    [[], 3, 1, "empty"],
                    [],
                ),
                ("rejects-overlap-equal-size", [["a"], 2, 2, "doc"], E("ValueError")),
            ],
            [
                "chunk 본문만 저장하지 말고 source ID와 token start/end를 함께 보존하세요.",
                "overlap이 size 이상이면 진행하지 못하므로 계약 단계에서 거부하세요.",
            ],
        ),
        "transfer": T(
            "llm-preprocessing-release-audit",
            "새 LLM 전처리 산출물에 release 감사 전이하기",
            "PII 잔존, 빈 chunk, provenance 누락, prompt injection flag를 검사한다.",
            "audit_llm_chunks(chunks)를 완성하세요.",
            "def audit_llm_chunks(chunks):\n    raise NotImplementedError",
            """def audit_llm_chunks(chunks):
    failures = []
    pii = sorted(chunk["id"] for chunk in chunks if chunk.get("piiFindings", 0) > 0)
    empty = sorted(chunk["id"] for chunk in chunks if not chunk.get("text", "").strip())
    missing_provenance = sorted(chunk.get("id", "<missing>") for chunk in chunks if not chunk.get("sourceId") or "start" not in chunk or "end" not in chunk)
    injections = sorted(chunk["id"] for chunk in chunks if chunk.get("instructionLike", False))
    if pii:
        failures.append("pii")
    if empty:
        failures.append("empty")
    if missing_provenance:
        failures.append("provenance")
    if injections:
        failures.append("instruction-boundary")
    return {"releaseReady": not failures, "failures": failures, "pii": pii, "empty": empty, "missingProvenance": missing_provenance, "instructionLike": injections}
""",
            "audit_llm_chunks",
            [
                (
                    "accepts-clean-provenanced-chunk",
                    [[{"id": "a:0-2", "sourceId": "a", "start": 0, "end": 2, "text": "safe", "piiFindings": 0, "instructionLike": False}]],
                    {"releaseReady": True, "failures": [], "pii": [], "empty": [], "missingProvenance": [], "instructionLike": []},
                ),
                (
                    "reports-pii-empty-and-injection",
                    [[{"id": "bad", "sourceId": "a", "start": 0, "end": 0, "text": " ", "piiFindings": 2, "instructionLike": True}]],
                    {"releaseReady": False, "failures": ["pii", "empty", "instruction-boundary"], "pii": ["bad"], "empty": ["bad"], "missingProvenance": [], "instructionLike": ["bad"]},
                ),
                (
                    "reports-missing-provenance",
                    [[{"id": "x", "text": "content"}]],
                    {"releaseReady": False, "failures": ["provenance"], "pii": [], "empty": [], "missingProvenance": ["x"], "instructionLike": []},
                ),
            ],
            [
                "전처리된 text가 깨끗해 보여도 source span과 PII scan 결과를 검사하세요.",
                "문서 안의 지시문을 시스템 instruction으로 승격하지 않도록 별도 flag를 남기세요.",
            ],
        ),
        "retrieval": decision(
            "llm-preprocessing-recall",
            "LLM 전처리 pipeline 종료 조건 회상하기",
            "정제·chunk·안전·provenance evidence를 복원한다.",
            "choose_llm_preprocessing_gate",
            {
                "clean": {"action": "normalize and mask before chunking", "evidence": "transformation counts", "risk": "PII residual"},
                "chunk": {"action": "preserve source token spans", "evidence": "source-bound chunk IDs", "risk": "lost citation"},
                "release": {"action": "audit PII empty and instruction boundary", "evidence": "zero blocking findings", "risk": "prompt injection"},
            },
        ),
    },
}
