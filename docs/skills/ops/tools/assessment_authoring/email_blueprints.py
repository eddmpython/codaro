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
            "메일 API 성공과 올바른 수신자·내용·첨부 전달을 분리해 검증하세요.",
            "실제 발송 전 dry run과 idempotency identity, 비밀정보 redaction을 적용하세요.",
        ],
    )


BLUEPRINTS: dict[str, dict[str, TaskBlueprint]] = {
    "01": {
        "mastery": T(
            "mail-send-contract",
            "첫 메일의 발신·수신·제목·dry run 계약 감사하기",
            "허용 domain과 빈 제목, 중복 수신자, idempotency key를 검사한다.",
            "audit_mail_send(message, allowed_domains)를 완성하세요.",
            "def audit_mail_send(message, allowed_domains):\n    raise NotImplementedError",
            """def audit_mail_send(message, allowed_domains):
    failures = []
    recipients = [value.lower() for value in message.get("to", [])]
    duplicates = sorted({value for value in recipients if recipients.count(value) > 1})
    disallowed = sorted(value for value in recipients if value.rsplit("@", 1)[-1] not in allowed_domains)
    if not recipients:
        failures.append("recipients")
    if duplicates:
        failures.append("duplicates")
    if disallowed:
        failures.append("domains")
    if not str(message.get("subject", "")).strip():
        failures.append("subject")
    if not message.get("dryRun", False):
        failures.append("dry-run")
    if not message.get("idempotencyKey"):
        failures.append("idempotency")
    return {"ready": not failures, "failures": failures, "duplicates": duplicates, "disallowed": disallowed}
""",
            "audit_mail_send",
            [
                (
                    "accepts-bounded-dry-run",
                    [{"to": ["a@example.test"], "subject": "Report", "dryRun": True, "idempotencyKey": "report-1"}, ["example.test"]],
                    {"ready": True, "failures": [], "duplicates": [], "disallowed": []},
                ),
                (
                    "reports-all-send-gaps",
                    [{"to": ["A@other.test", "a@OTHER.test"], "subject": " ", "dryRun": False, "idempotencyKey": ""}, ["example.test"]],
                    {"ready": False, "failures": ["duplicates", "domains", "subject", "dry-run", "idempotency"], "duplicates": ["a@other.test"], "disallowed": ["a@other.test", "a@other.test"]},
                ),
                (
                    "reports-empty-recipient-list",
                    [{"to": [], "subject": "Hello", "dryRun": True, "idempotencyKey": "x"}, ["example.test"]],
                    {"ready": False, "failures": ["recipients"], "duplicates": [], "disallowed": []},
                ),
            ],
            [
                "SMTP 연결 전에 수신자 domain과 중복 identity를 검사하세요.",
                "첫 실행은 dry run이며 업무 idempotency key를 필수로 두세요.",
            ],
        ),
        "transfer": T(
            "mail-delivery-result",
            "새 메일 발송 결과에 envelope·provider ID 감사 전이하기",
            "계획 수신자와 accepted/rejected envelope를 대조한다.",
            "audit_mail_delivery(planned_recipients, result)를 완성하세요.",
            "def audit_mail_delivery(planned_recipients, result):\n    raise NotImplementedError",
            """def audit_mail_delivery(planned_recipients, result):
    planned = {value.lower() for value in planned_recipients}
    accepted = {value.lower() for value in result.get("accepted", [])}
    rejected = {value.lower() for value in result.get("rejected", [])}
    missing = sorted(planned - accepted - rejected)
    unexpected = sorted((accepted | rejected) - planned)
    failures = []
    if rejected:
        failures.append("rejected")
    if missing:
        failures.append("missing")
    if unexpected:
        failures.append("unexpected")
    if not result.get("providerMessageId"):
        failures.append("provider-id")
    return {"passed": not failures, "failures": failures, "rejected": sorted(rejected), "missing": missing, "unexpected": unexpected}
""",
            "audit_mail_delivery",
            [
                (
                    "accepts-delivered-envelope",
                    [["a@example.test"], {"accepted": ["A@example.test"], "rejected": [], "providerMessageId": "m1"}],
                    {"passed": True, "failures": [], "rejected": [], "missing": [], "unexpected": []},
                ),
                (
                    "reports-rejected-and-missing-provider-id",
                    [["a@example.test"], {"accepted": [], "rejected": ["a@example.test"]}],
                    {"passed": False, "failures": ["rejected", "provider-id"], "rejected": ["a@example.test"], "missing": [], "unexpected": []},
                ),
                (
                    "reports-missing-and-unexpected-envelope",
                    [["a@example.test"], {"accepted": ["b@example.test"], "rejected": [], "providerMessageId": "m2"}],
                    {"passed": False, "failures": ["missing", "unexpected"], "rejected": [], "missing": ["a@example.test"], "unexpected": ["b@example.test"]},
                ),
            ],
            [
                "send 함수 반환만 보지 말고 envelope 수신자별 결과를 대조하세요.",
                "provider message ID를 sealed delivery evidence에 포함하세요.",
            ],
        ),
        "retrieval": decision(
            "first-mail-recall",
            "첫 메일 발송 안전 기준 회상하기",
            "사전 계약·envelope·provider evidence를 복원한다.",
            "choose_mail_send_evidence",
            {
                "before": {"action": "validate recipients subject and dry run", "evidence": "message manifest", "risk": "wrong recipient"},
                "send": {"action": "use idempotency identity", "evidence": "attempt ledger", "risk": "duplicate mail"},
                "after": {"action": "reconcile envelope and provider ID", "evidence": "accepted rejected recipients", "risk": "partial delivery"},
            },
        ),
    },
    "02": {
        "mastery": T(
            "html-attachment-contract",
            "HTML 본문과 첨부파일의 안전 계약 감사하기",
            "plain-text 대체본문, unsafe tag, attachment size/hash를 검사한다.",
            "audit_html_attachments(message, maximum_attachment_bytes)를 완성하세요.",
            "def audit_html_attachments(message, maximum_attachment_bytes):\n    raise NotImplementedError",
            r"""def audit_html_attachments(message, maximum_attachment_bytes):
    import re
    failures = []
    if not str(message.get("plainText", "")).strip():
        failures.append("plain-text")
    html = message.get("html", "")
    unsafe_tags = sorted(set(match.group(1).lower() for match in re.finditer(r"<\s*(script|iframe|object)\b", html, flags=re.I)))
    if unsafe_tags:
        failures.append("unsafe-html")
    attachment_failures = []
    for item in message.get("attachments", []):
        reasons = []
        if item.get("byteLength", 0) > maximum_attachment_bytes:
            reasons.append("size")
        if not item.get("contentHash"):
            reasons.append("hash")
        if not item.get("contentType"):
            reasons.append("content-type")
        if reasons:
            attachment_failures.append({"name": item["name"], "reasons": reasons})
    if attachment_failures:
        failures.append("attachments")
    return {"accepted": not failures, "failures": failures, "unsafeTags": unsafe_tags, "attachmentFailures": attachment_failures}
""",
            "audit_html_attachments",
            [
                (
                    "accepts-safe-alternative-and-attachment",
                    [{"plainText": "Report attached", "html": "<p>Report attached</p>", "attachments": [{"name": "report.pdf", "byteLength": 100, "contentHash": "abc", "contentType": "application/pdf"}]}, 1000],
                    {"accepted": True, "failures": [], "unsafeTags": [], "attachmentFailures": []},
                ),
                (
                    "reports-plain-text-and-unsafe-html",
                    [{"plainText": "", "html": "<script>alert(1)</script>", "attachments": []}, 1000],
                    {"accepted": False, "failures": ["plain-text", "unsafe-html"], "unsafeTags": ["script"], "attachmentFailures": []},
                ),
                (
                    "reports-attachment-contract",
                    [{"plainText": "x", "html": "<p>x</p>", "attachments": [{"name": "big.bin", "byteLength": 2000, "contentHash": "", "contentType": ""}]}, 1000],
                    {"accepted": False, "failures": ["attachments"], "unsafeTags": [], "attachmentFailures": [{"name": "big.bin", "reasons": ["size", "hash", "content-type"]}]},
                ),
            ],
            [
                "HTML 메일에는 반드시 plain-text 대체본문을 제공하세요.",
                "첨부는 이름이 아니라 byte length·content hash·MIME type으로 검증하세요.",
            ],
        ),
        "transfer": T(
            "attachment-delivery-reconciliation",
            "새 메일 첨부의 MIME·hash reconciliation 전이하기",
            "계획한 attachment와 생성된 MIME part를 content identity로 대조한다.",
            "reconcile_attachment_parts(planned, observed_parts)를 완성하세요.",
            "def reconcile_attachment_parts(planned, observed_parts):\n    raise NotImplementedError",
            """def reconcile_attachment_parts(planned, observed_parts):
    def identity(item):
        return (item["name"], item["contentType"], item["contentHash"])
    planned_ids = {identity(item) for item in planned}
    observed_ids = {identity(item) for item in observed_parts if item.get("disposition") == "attachment"}
    missing = sorted([list(item) for item in planned_ids - observed_ids])
    unexpected = sorted([list(item) for item in observed_ids - planned_ids])
    inline_without_id = sorted(item["name"] for item in observed_parts if item.get("disposition") == "inline" and not item.get("contentId"))
    return {"passed": not missing and not unexpected and not inline_without_id, "missing": missing, "unexpected": unexpected, "inlineWithoutContentId": inline_without_id}
""",
            "reconcile_attachment_parts",
            [
                (
                    "accepts-exact-attachment-part",
                    [[{"name": "r.pdf", "contentType": "application/pdf", "contentHash": "x"}], [{"name": "r.pdf", "contentType": "application/pdf", "contentHash": "x", "disposition": "attachment"}]],
                    {"passed": True, "missing": [], "unexpected": [], "inlineWithoutContentId": []},
                ),
                (
                    "reports-missing-and-unexpected-part",
                    [[{"name": "r.pdf", "contentType": "application/pdf", "contentHash": "x"}], [{"name": "other.txt", "contentType": "text/plain", "contentHash": "y", "disposition": "attachment"}]],
                    {"passed": False, "missing": [["r.pdf", "application/pdf", "x"]], "unexpected": [["other.txt", "text/plain", "y"]], "inlineWithoutContentId": []},
                ),
                (
                    "reports-inline-without-content-id",
                    [[], [{"name": "chart.png", "contentType": "image/png", "contentHash": "z", "disposition": "inline"}]],
                    {"passed": False, "missing": [], "unexpected": [], "inlineWithoutContentId": ["chart.png"]},
                ),
            ],
            [
                "MIME part를 filename만이 아니라 type과 content hash로 대조하세요.",
                "inline image에는 HTML이 참조할 content ID를 필수로 두세요.",
            ],
        ),
        "retrieval": decision(
            "html-attachment-recall",
            "HTML 메일·첨부 품질 기준 회상하기",
            "대체본문·HTML 안전·MIME identity 근거를 복원한다.",
            "choose_html_mail_evidence",
            {
                "body": {"action": "provide plain text and safe HTML", "evidence": "two body variants", "risk": "inaccessible or unsafe mail"},
                "attachment": {"action": "bind name type size and hash", "evidence": "attachment descriptor", "risk": "wrong file"},
                "mime": {"action": "reparse and reconcile parts", "evidence": "MIME part identities", "risk": "missing or extra attachment"},
            },
        ),
    },
    "03": {
        "mastery": T(
            "personalized-recipient-plan",
            "다수 수신자 개인화 메일을 1인 1envelope로 계획하기",
            "template field 누락과 중복 recipient를 차단하고 개별 message를 만든다.",
            "plan_personalized_messages(recipients, required_fields)를 완성하세요.",
            "def plan_personalized_messages(recipients, required_fields):\n    raise NotImplementedError",
            """def plan_personalized_messages(recipients, required_fields):
    seen = set()
    messages = []
    rejected = []
    for recipient in recipients:
        email = recipient.get("email", "").lower()
        reasons = []
        if email in seen:
            reasons.append("duplicate")
        missing = sorted(field for field in required_fields if recipient.get(field) in {None, ""})
        if missing:
            reasons.append("fields")
        if reasons:
            rejected.append({"email": email, "reasons": reasons, "missingFields": missing})
        else:
            messages.append({"to": [email], "personalization": {field: recipient[field] for field in required_fields}})
            seen.add(email)
    return {"ready": not rejected, "messages": messages, "rejected": rejected, "oneRecipientPerEnvelope": True}
""",
            "plan_personalized_messages",
            [
                (
                    "plans-two-isolated-envelopes",
                    [[{"email": "A@example.test", "name": "A"}, {"email": "b@example.test", "name": "B"}], ["name"]],
                    {"ready": True, "messages": [{"to": ["a@example.test"], "personalization": {"name": "A"}}, {"to": ["b@example.test"], "personalization": {"name": "B"}}], "rejected": [], "oneRecipientPerEnvelope": True},
                ),
                (
                    "reports-duplicate-recipient",
                    [[{"email": "a@example.test", "name": "A"}, {"email": "A@example.test", "name": "Again"}], ["name"]],
                    {"ready": False, "messages": [{"to": ["a@example.test"], "personalization": {"name": "A"}}], "rejected": [{"email": "a@example.test", "reasons": ["duplicate"], "missingFields": []}], "oneRecipientPerEnvelope": True},
                ),
                (
                    "reports-missing-template-field",
                    [[{"email": "a@example.test", "name": ""}], ["name"]],
                    {"ready": False, "messages": [], "rejected": [{"email": "a@example.test", "reasons": ["fields"], "missingFields": ["name"]}], "oneRecipientPerEnvelope": True},
                ),
            ],
            [
                "개인화 메일은 여러 주소를 To/CC에 묶지 말고 1인 1envelope로 만드세요.",
                "template field 누락을 빈 문자열로 발송하지 마세요.",
            ],
        ),
        "transfer": T(
            "personalization-preview-audit",
            "새 개인화 preview에 recipient 간 정보 누출 감사 전이하기",
            "각 message 본문에 자신의 token만 있고 다른 recipient token은 없는지 검사한다.",
            "audit_personalization_previews(previews)를 완성하세요.",
            "def audit_personalization_previews(previews):\n    raise NotImplementedError",
            """def audit_personalization_previews(previews):
    tokens = {preview["recipient"]: preview["privateToken"] for preview in previews}
    failures = []
    for preview in previews:
        reasons = []
        body = preview["body"]
        if preview["privateToken"] not in body:
            reasons.append("missing-own-token")
        leaked = sorted(recipient for recipient, token in tokens.items() if recipient != preview["recipient"] and token and token in body)
        if leaked:
            reasons.append("cross-recipient-leak")
        if reasons:
            failures.append({"recipient": preview["recipient"], "reasons": reasons, "leakedRecipients": leaked})
    return {"accepted": not failures, "failures": failures, "previewCount": len(previews)}
""",
            "audit_personalization_previews",
            [
                (
                    "accepts-isolated-previews",
                    [[{"recipient": "a", "privateToken": "A-1", "body": "Hello A-1"}, {"recipient": "b", "privateToken": "B-2", "body": "Hello B-2"}]],
                    {"accepted": True, "failures": [], "previewCount": 2},
                ),
                (
                    "reports-cross-recipient-leak",
                    [[{"recipient": "a", "privateToken": "A-1", "body": "A-1 and B-2"}, {"recipient": "b", "privateToken": "B-2", "body": "B-2"}]],
                    {"accepted": False, "failures": [{"recipient": "a", "reasons": ["cross-recipient-leak"], "leakedRecipients": ["b"]}], "previewCount": 2},
                ),
                (
                    "reports-missing-own-token",
                    [[{"recipient": "a", "privateToken": "A-1", "body": "Hello"}]],
                    {"accepted": False, "failures": [{"recipient": "a", "reasons": ["missing-own-token"], "leakedRecipients": []}], "previewCount": 1},
                ),
            ],
            [
                "발송 전 recipient별 rendered preview를 별도로 검사하세요.",
                "다른 recipient의 private token이 본문에 섞이지 않았는지 교차 검사하세요.",
            ],
        ),
        "retrieval": decision(
            "personalized-mail-recall",
            "다수 수신자 개인화 안전 기준 회상하기",
            "envelope 격리·field completeness·교차 누출 근거를 복원한다.",
            "choose_personalization_evidence",
            {
                "envelope": {"action": "one recipient per message", "evidence": "recipient message mapping", "risk": "address disclosure"},
                "template": {"action": "validate required fields", "evidence": "missing field report", "risk": "broken personalization"},
                "preview": {"action": "scan cross-recipient tokens", "evidence": "isolated rendered body", "risk": "private data leak"},
            },
        ),
    },
    "04": {
        "mastery": T(
            "inline-report-media",
            "메일 표·차트 inline media의 content ID·alt text 감사하기",
            "HTML 참조와 MIME content ID, 이미지 설명·크기를 대조한다.",
            "audit_inline_media(html_refs, media, maximum_bytes)를 완성하세요.",
            "def audit_inline_media(html_refs, media, maximum_bytes):\n    raise NotImplementedError",
            """def audit_inline_media(html_refs, media, maximum_bytes):
    media_map = {item["contentId"]: item for item in media}
    missing = sorted(set(html_refs) - set(media_map))
    unused = sorted(set(media_map) - set(html_refs))
    invalid = []
    for content_id, item in sorted(media_map.items()):
        reasons = []
        if not item.get("altText"):
            reasons.append("alt-text")
        if item.get("byteLength", 0) > maximum_bytes:
            reasons.append("size")
        if not str(item.get("contentType", "")).startswith("image/"):
            reasons.append("content-type")
        if reasons:
            invalid.append({"contentId": content_id, "reasons": reasons})
    return {"accepted": not missing and not unused and not invalid, "missing": missing, "unused": unused, "invalid": invalid}
""",
            "audit_inline_media",
            [
                (
                    "accepts-referenced-chart",
                    [["chart-1"], [{"contentId": "chart-1", "altText": "Monthly sales chart", "byteLength": 100, "contentType": "image/png"}], 1000],
                    {"accepted": True, "missing": [], "unused": [], "invalid": []},
                ),
                (
                    "reports-missing-and-unused-media",
                    [["wanted"], [{"contentId": "unused", "altText": "x", "byteLength": 1, "contentType": "image/png"}], 100],
                    {"accepted": False, "missing": ["wanted"], "unused": ["unused"], "invalid": []},
                ),
                (
                    "reports-invalid-inline-media",
                    [["x"], [{"contentId": "x", "altText": "", "byteLength": 200, "contentType": "text/plain"}], 100],
                    {"accepted": False, "missing": [], "unused": [], "invalid": [{"contentId": "x", "reasons": ["alt-text", "size", "content-type"]}]},
                ),
            ],
            [
                "HTML `cid:` 참조와 MIME content ID를 양방향으로 대조하세요.",
                "inline chart에도 alt text와 byte budget을 적용하세요.",
            ],
        ),
        "transfer": T(
            "email-table-reconciliation",
            "새 HTML 표에 source row reconciliation 전이하기",
            "primary key와 row hash로 메일 표와 원천 데이터를 대조한다.",
            "reconcile_email_table(source_rows, rendered_rows, key_field)를 완성하세요.",
            "def reconcile_email_table(source_rows, rendered_rows, key_field):\n    raise NotImplementedError",
            """def reconcile_email_table(source_rows, rendered_rows, key_field):
    source = {row[key_field]: row["rowHash"] for row in source_rows}
    rendered = {row[key_field]: row["rowHash"] for row in rendered_rows}
    missing = sorted(set(source) - set(rendered))
    unexpected = sorted(set(rendered) - set(source))
    changed = sorted(key for key in set(source) & set(rendered) if source[key] != rendered[key])
    return {"passed": not missing and not unexpected and not changed, "missing": missing, "unexpected": unexpected, "changed": changed}
""",
            "reconcile_email_table",
            [
                (
                    "accepts-reordered-table-rows",
                    [[{"id": "a", "rowHash": "x"}, {"id": "b", "rowHash": "y"}], [{"id": "b", "rowHash": "y"}, {"id": "a", "rowHash": "x"}], "id"],
                    {"passed": True, "missing": [], "unexpected": [], "changed": []},
                ),
                (
                    "reports-table-row-drift",
                    [[{"id": "a", "rowHash": "x"}, {"id": "b", "rowHash": "y"}], [{"id": "a", "rowHash": "z"}, {"id": "c", "rowHash": "q"}], "id"],
                    {"passed": False, "missing": ["b"], "unexpected": ["c"], "changed": ["a"]},
                ),
                (
                    "handles-empty-table",
                    [[], [], "id"],
                    {"passed": True, "missing": [], "unexpected": [], "changed": []},
                ),
            ],
            [
                "렌더된 표의 행 수만 보지 말고 key·row hash로 원천과 대조하세요.",
                "표와 chart가 같은 source snapshot을 사용하는지 source hash를 공유하세요.",
            ],
        ),
        "retrieval": decision(
            "email-report-media-recall",
            "메일 표·차트 품질 기준 회상하기",
            "table reconciliation·content ID·alt text 근거를 복원한다.",
            "choose_email_report_media",
            {
                "table": {"action": "reconcile key and row hash", "evidence": "missing unexpected changed rows", "risk": "wrong report data"},
                "chart": {"action": "bind HTML cid to MIME part", "evidence": "content ID mapping", "risk": "broken inline image"},
                "accessibility": {"action": "provide alt text and plain summary", "evidence": "text alternative", "risk": "image-only meaning"},
            },
        ),
    },
    "05": {
        "mastery": T(
            "imap-cursor-plan",
            "IMAP UID cursor로 새 메일만 읽는 계획 만들기",
            "UIDVALIDITY와 마지막 UID를 기준으로 중복 없는 fetch range를 계산한다.",
            "plan_imap_fetch(cursor, mailbox_state)를 완성하세요.",
            "def plan_imap_fetch(cursor, mailbox_state):\n    raise NotImplementedError",
            """def plan_imap_fetch(cursor, mailbox_state):
    reset = cursor.get("uidValidity") != mailbox_state["uidValidity"]
    start_uid = 1 if reset else cursor.get("lastUid", 0) + 1
    end_uid = mailbox_state.get("highestUid", 0)
    fetch = list(range(start_uid, end_uid + 1)) if start_uid <= end_uid else []
    return {"reset": reset, "fetchUids": fetch, "nextCursor": {"uidValidity": mailbox_state["uidValidity"], "lastUid": end_uid if fetch else cursor.get("lastUid", 0)}}
""",
            "plan_imap_fetch",
            [
                (
                    "fetches-uids-after-cursor",
                    [{"uidValidity": 10, "lastUid": 3}, {"uidValidity": 10, "highestUid": 5}],
                    {"reset": False, "fetchUids": [4, 5], "nextCursor": {"uidValidity": 10, "lastUid": 5}},
                ),
                (
                    "resets-on-uidvalidity-change",
                    [{"uidValidity": 9, "lastUid": 100}, {"uidValidity": 10, "highestUid": 2}],
                    {"reset": True, "fetchUids": [1, 2], "nextCursor": {"uidValidity": 10, "lastUid": 2}},
                ),
                (
                    "handles-no-new-mail",
                    [{"uidValidity": 10, "lastUid": 5}, {"uidValidity": 10, "highestUid": 5}],
                    {"reset": False, "fetchUids": [], "nextCursor": {"uidValidity": 10, "lastUid": 5}},
                ),
            ],
            [
                "메시지 sequence number가 아니라 UID와 UIDVALIDITY를 cursor로 사용하세요.",
                "UIDVALIDITY 변경은 cursor reset event로 명시적으로 기록하세요.",
            ],
        ),
        "transfer": T(
            "imap-message-admission",
            "새 IMAP message에 sender·date·folder admission 전이하기",
            "허용 sender domain과 수신 시각, 중복 Message-ID를 검사한다.",
            "admit_imap_messages(messages, allowed_domains, minimum_received_at, processed_ids)를 완성하세요.",
            "def admit_imap_messages(messages, allowed_domains, minimum_received_at, processed_ids):\n    raise NotImplementedError",
            """def admit_imap_messages(messages, allowed_domains, minimum_received_at, processed_ids):
    processed = set(processed_ids)
    accepted = []
    rejected = []
    for message in messages:
        reasons = []
        domain = message["from"].lower().rsplit("@", 1)[-1]
        if domain not in allowed_domains:
            reasons.append("sender")
        if message["receivedAt"] < minimum_received_at:
            reasons.append("date")
        if message["messageId"] in processed:
            reasons.append("duplicate")
        if reasons:
            rejected.append({"messageId": message["messageId"], "reasons": reasons})
        else:
            accepted.append(message["messageId"])
            processed.add(message["messageId"])
    return {"accepted": accepted, "rejected": rejected}
""",
            "admit_imap_messages",
            [
                (
                    "accepts-new-allowed-message",
                    [[{"messageId": "m1", "from": "a@example.test", "receivedAt": 100}], ["example.test"], 90, []],
                    {"accepted": ["m1"], "rejected": []},
                ),
                (
                    "reports-sender-date-and-duplicate",
                    [[{"messageId": "m1", "from": "a@other.test", "receivedAt": 80}], ["example.test"], 90, ["m1"]],
                    {"accepted": [], "rejected": [{"messageId": "m1", "reasons": ["sender", "date", "duplicate"]}]},
                ),
                (
                    "deduplicates-within-batch",
                    [[{"messageId": "m1", "from": "a@example.test", "receivedAt": 100}, {"messageId": "m1", "from": "a@example.test", "receivedAt": 100}], ["example.test"], 90, []],
                    {"accepted": ["m1"], "rejected": [{"messageId": "m1", "reasons": ["duplicate"]}]},
                ),
            ],
            [
                "fetch 성공 뒤 sender·date·Message-ID admission을 별도로 적용하세요.",
                "같은 batch 안의 중복 Message-ID도 두 번째부터 거부하세요.",
            ],
        ),
        "retrieval": decision(
            "imap-reading-recall",
            "IMAP 새 메일 읽기 원칙 회상하기",
            "UID cursor·UIDVALIDITY·Message-ID dedupe 근거를 복원한다.",
            "choose_imap_evidence",
            {
                "cursor": {"action": "fetch UID after last cursor", "evidence": "UID range", "risk": "sequence renumbering"},
                "reset": {"action": "handle UIDVALIDITY change", "evidence": "mailbox reset event", "risk": "missed mail"},
                "dedupe": {"action": "claim Message-ID ledger", "evidence": "processed identity", "risk": "duplicate processing"},
            },
        ),
    },
    "06": {
        "mastery": T(
            "attachment-save-plan",
            "수신 첨부파일의 이름·크기·MIME·quarantine 계획하기",
            "path traversal과 확장자/MIME 불일치, byte budget을 차단한다.",
            "plan_attachment_save(attachments, maximum_bytes, allowed_types)를 완성하세요.",
            "def plan_attachment_save(attachments, maximum_bytes, allowed_types):\n    raise NotImplementedError",
            """def plan_attachment_save(attachments, maximum_bytes, allowed_types):
    from pathlib import PurePath
    save = []
    rejected = []
    for item in attachments:
        reasons = []
        safe_name = PurePath(item["name"]).name
        if safe_name != item["name"] or safe_name in {"", ".", ".."}:
            reasons.append("name")
        if item.get("byteLength", 0) > maximum_bytes:
            reasons.append("size")
        if item.get("contentType") not in allowed_types:
            reasons.append("content-type")
        if not item.get("contentHash"):
            reasons.append("hash")
        if reasons:
            rejected.append({"name": item["name"], "reasons": reasons})
        else:
            save.append({"name": safe_name, "quarantine": f"quarantine/{safe_name}", "hash": item["contentHash"]})
    return {"ready": not rejected, "save": save, "rejected": rejected}
""",
            "plan_attachment_save",
            [
                (
                    "plans-quarantined-save",
                    [[{"name": "report.pdf", "byteLength": 100, "contentType": "application/pdf", "contentHash": "x"}], 1000, ["application/pdf"]],
                    {"ready": True, "save": [{"name": "report.pdf", "quarantine": "quarantine/report.pdf", "hash": "x"}], "rejected": []},
                ),
                (
                    "reports-traversal-size-type-and-hash",
                    [[{"name": "../evil.exe", "byteLength": 2000, "contentType": "application/octet-stream", "contentHash": ""}], 1000, ["application/pdf"]],
                    {"ready": False, "save": [], "rejected": [{"name": "../evil.exe", "reasons": ["name", "size", "content-type", "hash"]}]},
                ),
                (
                    "handles-empty-attachments",
                    [[], 1000, []],
                    {"ready": True, "save": [], "rejected": []},
                ),
            ],
            [
                "첨부 filename의 directory 부분을 신뢰하지 말고 path traversal을 거부하세요.",
                "허용된 첨부도 바로 업무 폴더가 아니라 quarantine에 저장하세요.",
            ],
        ),
        "transfer": T(
            "attachment-release-audit",
            "새 첨부파일에 quarantine scan·hash release 감사 전이하기",
            "저장 hash와 scan 결과, destination 충돌을 통과한 파일만 release한다.",
            "audit_attachment_release(items)를 완성하세요.",
            "def audit_attachment_release(items):\n    raise NotImplementedError",
            """def audit_attachment_release(items):
    release = []
    blocked = []
    for item in items:
        reasons = []
        if item.get("savedHash") != item.get("expectedHash"):
            reasons.append("hash")
        if item.get("scanStatus") != "clean":
            reasons.append("scan")
        if item.get("destinationExists", False):
            reasons.append("conflict")
        if reasons:
            blocked.append({"id": item["id"], "reasons": reasons})
        else:
            release.append(item["id"])
    return {"released": release, "blocked": blocked}
""",
            "audit_attachment_release",
            [
                (
                    "releases-clean-matching-file",
                    [[{"id": "a", "savedHash": "x", "expectedHash": "x", "scanStatus": "clean", "destinationExists": False}]],
                    {"released": ["a"], "blocked": []},
                ),
                (
                    "reports-all-release-blockers",
                    [[{"id": "a", "savedHash": "bad", "expectedHash": "x", "scanStatus": "unknown", "destinationExists": True}]],
                    {"released": [], "blocked": [{"id": "a", "reasons": ["hash", "scan", "conflict"]}]},
                ),
                (
                    "separates-clean-and-blocked-files",
                    [[{"id": "a", "savedHash": "x", "expectedHash": "x", "scanStatus": "clean"}, {"id": "b", "savedHash": "y", "expectedHash": "y", "scanStatus": "blocked"}]],
                    {"released": ["a"], "blocked": [{"id": "b", "reasons": ["scan"]}]},
                ),
            ],
            [
                "저장된 bytes의 hash를 MIME manifest와 다시 비교하세요.",
                "scan status가 명시적으로 clean일 때만 quarantine 밖으로 이동하세요.",
            ],
        ),
        "retrieval": decision(
            "attachment-save-recall",
            "수신 첨부파일 저장 안전 기준 회상하기",
            "name·quarantine·scan·hash evidence를 복원한다.",
            "choose_attachment_save_gate",
            {
                "admit": {"action": "validate safe name type size and hash", "evidence": "attachment descriptor", "risk": "path traversal or oversized file"},
                "quarantine": {"action": "save outside business destination", "evidence": "quarantine path and saved hash", "risk": "unsafe execution"},
                "release": {"action": "require clean scan and no conflict", "evidence": "release decision", "risk": "malware or overwrite"},
            },
        ),
    },
    "07": {
        "mastery": T(
            "mail-classification-rules",
            "규칙 기반 메일 분류의 priority·충돌 감사하기",
            "한 메일에 적용될 rule을 priority와 specificity로 결정하고 모호성을 보고한다.",
            "classify_mail(message, rules)를 완성하세요.",
            "def classify_mail(message, rules):\n    raise NotImplementedError",
            """def classify_mail(message, rules):
    matches = []
    for rule in rules:
        conditions = rule.get("conditions", {})
        matched = True
        if "senderDomain" in conditions:
            matched = matched and message["from"].lower().endswith("@" + conditions["senderDomain"].lower())
        if "subjectContains" in conditions:
            matched = matched and conditions["subjectContains"].lower() in message.get("subject", "").lower()
        if matched:
            matches.append(rule)
    if not matches:
        return {"folder": "Unclassified", "rule": None, "ambiguous": []}
    matches.sort(key=lambda rule: (-rule["priority"], -len(rule.get("conditions", {})), rule["id"]))
    best = matches[0]
    ambiguous = sorted(rule["id"] for rule in matches[1:] if rule["priority"] == best["priority"] and len(rule.get("conditions", {})) == len(best.get("conditions", {})))
    return {"folder": best["folder"] if not ambiguous else "Review", "rule": best["id"], "ambiguous": ambiguous}
""",
            "classify_mail",
            [
                (
                    "selects-specific-high-priority-rule",
                    [{"from": "a@example.test", "subject": "Invoice July"}, [{"id": "domain", "priority": 1, "conditions": {"senderDomain": "example.test"}, "folder": "Example"}, {"id": "invoice", "priority": 2, "conditions": {"senderDomain": "example.test", "subjectContains": "invoice"}, "folder": "Invoices"}]],
                    {"folder": "Invoices", "rule": "invoice", "ambiguous": []},
                ),
                (
                    "reports-ambiguous-equal-rules",
                    [{"from": "a@example.test", "subject": "Hello"}, [{"id": "a", "priority": 1, "conditions": {"senderDomain": "example.test"}, "folder": "A"}, {"id": "b", "priority": 1, "conditions": {"senderDomain": "example.test"}, "folder": "B"}]],
                    {"folder": "Review", "rule": "a", "ambiguous": ["b"]},
                ),
                (
                    "leaves-unmatched-mail-unclassified",
                    [{"from": "a@other.test", "subject": "Hello"}, [{"id": "a", "priority": 1, "conditions": {"senderDomain": "example.test"}, "folder": "A"}]],
                    {"folder": "Unclassified", "rule": None, "ambiguous": []},
                ),
            ],
            [
                "여러 rule이 같게 매치되면 목록 순서로 숨기지 말고 Review로 보내세요.",
                "priority와 condition specificity를 분리해 결정 규칙을 남기세요.",
            ],
        ),
        "transfer": T(
            "classification-confusion-audit",
            "새 분류 rule set에 confusion·coverage 감사 전이하기",
            "검수 fixture의 expected와 predicted folder로 정확도와 미분류를 계산한다.",
            "audit_classification_fixtures(fixtures, minimum_accuracy)를 완성하세요.",
            "def audit_classification_fixtures(fixtures, minimum_accuracy):\n    raise NotImplementedError",
            """def audit_classification_fixtures(fixtures, minimum_accuracy):
    if not 0 <= minimum_accuracy <= 1:
        raise ValueError("invalid accuracy threshold")
    correct = []
    errors = []
    unclassified = []
    for fixture in fixtures:
        if fixture["predicted"] == "Unclassified":
            unclassified.append(fixture["id"])
        if fixture["predicted"] == fixture["expected"]:
            correct.append(fixture["id"])
        else:
            errors.append({"id": fixture["id"], "expected": fixture["expected"], "predicted": fixture["predicted"]})
    accuracy = 0.0 if not fixtures else round(len(correct) / len(fixtures), 4)
    return {"accepted": accuracy >= minimum_accuracy and not unclassified, "accuracy": accuracy, "correct": correct, "errors": errors, "unclassified": unclassified}
""",
            "audit_classification_fixtures",
            [
                (
                    "accepts-perfect-fixtures",
                    [[{"id": "a", "expected": "Invoice", "predicted": "Invoice"}, {"id": "b", "expected": "Alert", "predicted": "Alert"}], 1.0],
                    {"accepted": True, "accuracy": 1.0, "correct": ["a", "b"], "errors": [], "unclassified": []},
                ),
                (
                    "reports-error-and-unclassified",
                    [[{"id": "a", "expected": "Invoice", "predicted": "Other"}, {"id": "b", "expected": "Alert", "predicted": "Unclassified"}], 0.5],
                    {"accepted": False, "accuracy": 0.0, "correct": [], "errors": [{"id": "a", "expected": "Invoice", "predicted": "Other"}, {"id": "b", "expected": "Alert", "predicted": "Unclassified"}], "unclassified": ["b"]},
                ),
                (
                    "handles-empty-fixture-set",
                    [[], 0.0],
                    {"accepted": True, "accuracy": 0.0, "correct": [], "errors": [], "unclassified": []},
                ),
                ("rejects-invalid-threshold", [[], 2.0], E("ValueError")),
            ],
            [
                "rule 수가 아니라 검수 fixture의 expected/predicted confusion을 확인하세요.",
                "Unclassified는 정확도와 별도로 coverage blocker로 처리하세요.",
            ],
        ),
        "retrieval": decision(
            "mail-classification-recall",
            "규칙 기반 메일 분류 품질 기준 회상하기",
            "priority·ambiguity·fixture confusion 근거를 복원한다.",
            "choose_mail_classification_evidence",
            {
                "resolve": {"action": "rank priority and specificity", "evidence": "matched rule list", "risk": "rule order dependence"},
                "ambiguity": {"action": "route equal matches to review", "evidence": "ambiguous rule IDs", "risk": "wrong folder"},
                "validate": {"action": "run labeled fixtures", "evidence": "accuracy errors unclassified", "risk": "untested rule drift"},
            },
        ),
    },
    "08": {
        "mastery": T(
            "script-notification-decision",
            "스크립트 결과를 severity·변화 기준으로 알림할지 판정하기",
            "성공 spam을 줄이고 새 실패·복구·임계 변화만 message로 만든다.",
            "decide_script_notification(current, previous, policy)를 완성하세요.",
            "def decide_script_notification(current, previous, policy):\n    raise NotImplementedError",
            """def decide_script_notification(current, previous, policy):
    reasons = []
    if current["status"] == "failed" and previous.get("status") != "failed":
        reasons.append("new-failure")
    if current["status"] == "passed" and previous.get("status") == "failed":
        reasons.append("recovery")
    if abs(current.get("metric", 0) - previous.get("metric", 0)) >= policy.get("minimumMetricChange", float("inf")):
        reasons.append("metric-change")
    notify = bool(reasons)
    severity = "critical" if "new-failure" in reasons else "info"
    return {"notify": notify, "severity": severity if notify else None, "reasons": reasons}
""",
            "decide_script_notification",
            [
                (
                    "notifies-new-failure",
                    [{"status": "failed", "metric": 1}, {"status": "passed", "metric": 1}, {"minimumMetricChange": 10}],
                    {"notify": True, "severity": "critical", "reasons": ["new-failure"]},
                ),
                (
                    "notifies-recovery-and-metric-change",
                    [{"status": "passed", "metric": 20}, {"status": "failed", "metric": 5}, {"minimumMetricChange": 10}],
                    {"notify": True, "severity": "info", "reasons": ["recovery", "metric-change"]},
                ),
                (
                    "suppresses-unchanged-success",
                    [{"status": "passed", "metric": 5}, {"status": "passed", "metric": 4}, {"minimumMetricChange": 10}],
                    {"notify": False, "severity": None, "reasons": []},
                ),
            ],
            [
                "모든 성공 실행을 메일로 보내지 말고 상태 변화와 임계 변화만 알리세요.",
                "새 실패와 복구를 다른 severity와 reason으로 기록하세요.",
            ],
        ),
        "transfer": T(
            "notification-dedupe-audit",
            "새 알림 queue에 사건 fingerprint·cooldown dedupe 전이하기",
            "같은 사건의 반복 메일을 cooldown 안에서 하나로 합친다.",
            "dedupe_notifications(notifications, cooldown_seconds)를 완성하세요.",
            "def dedupe_notifications(notifications, cooldown_seconds):\n    raise NotImplementedError",
            """def dedupe_notifications(notifications, cooldown_seconds):
    if cooldown_seconds < 0:
        raise ValueError("negative cooldown")
    last_sent = {}
    send = []
    suppressed = []
    for item in sorted(notifications, key=lambda value: (value["at"], value["id"])):
        previous = last_sent.get(item["fingerprint"])
        if previous is not None and item["at"] - previous < cooldown_seconds:
            suppressed.append(item["id"])
        else:
            send.append(item["id"])
            last_sent[item["fingerprint"]] = item["at"]
    return {"send": send, "suppressed": suppressed}
""",
            "dedupe_notifications",
            [
                (
                    "suppresses-within-cooldown",
                    [[{"id": "a", "fingerprint": "f", "at": 0}, {"id": "b", "fingerprint": "f", "at": 10}], 30],
                    {"send": ["a"], "suppressed": ["b"]},
                ),
                (
                    "sends-after-cooldown",
                    [[{"id": "a", "fingerprint": "f", "at": 0}, {"id": "b", "fingerprint": "f", "at": 30}], 30],
                    {"send": ["a", "b"], "suppressed": []},
                ),
                (
                    "keeps-distinct-fingerprints",
                    [[{"id": "a", "fingerprint": "f1", "at": 0}, {"id": "b", "fingerprint": "f2", "at": 1}], 30],
                    {"send": ["a", "b"], "suppressed": []},
                ),
                ("rejects-negative-cooldown", [[], -1], E("ValueError")),
            ],
            [
                "subject 문자열이 아니라 사건 fingerprint로 알림을 dedupe하세요.",
                "suppressed 알림 ID도 ledger에 남겨 관측 손실을 막으세요.",
            ],
        ),
        "retrieval": decision(
            "script-alert-recall",
            "스크립트 결과 알림 품질 기준 회상하기",
            "상태 변화·severity·dedupe evidence를 복원한다.",
            "choose_script_alert_policy",
            {
                "trigger": {"action": "notify on failure recovery or material change", "evidence": "reason list", "risk": "success spam"},
                "severity": {"action": "map incident meaning", "evidence": "severity contract", "risk": "everything critical"},
                "dedupe": {"action": "apply fingerprint cooldown", "evidence": "sent and suppressed IDs", "risk": "alert flood"},
            },
        ),
    },
    "09": {
        "mastery": T(
            "credential-reference-audit",
            "메일 자격증명의 secret reference·scope·rotation 감사하기",
            "값 저장 없이 provider reference와 만료·허용 목적을 검사한다.",
            "audit_credential_reference(reference, now_day, allowed_purposes)를 완성하세요.",
            "def audit_credential_reference(reference, now_day, allowed_purposes):\n    raise NotImplementedError",
            """def audit_credential_reference(reference, now_day, allowed_purposes):
    failures = []
    if not reference.get("provider") or not reference.get("key"):
        failures.append("reference")
    if "value" in reference:
        failures.append("embedded-value")
    if reference.get("purpose") not in allowed_purposes:
        failures.append("purpose")
    if reference.get("expiresDay", now_day - 1) <= now_day:
        failures.append("expired")
    return {"accepted": not failures, "failures": failures, "identity": f"{reference.get('provider')}:{reference.get('key')}"}
""",
            "audit_credential_reference",
            [
                (
                    "accepts-scoped-future-reference",
                    [{"provider": "os-keyring", "key": "smtp-report", "purpose": "weekly-report", "expiresDay": 100}, 50, ["weekly-report"]],
                    {"accepted": True, "failures": [], "identity": "os-keyring:smtp-report"},
                ),
                (
                    "reports-embedded-disallowed-expired-secret",
                    [{"provider": "env", "key": "SMTP_PASSWORD", "value": "secret", "purpose": "other", "expiresDay": 10}, 10, ["weekly-report"]],
                    {"accepted": False, "failures": ["embedded-value", "purpose", "expired"], "identity": "env:SMTP_PASSWORD"},
                ),
                (
                    "reports-missing-reference",
                    [{"purpose": "weekly-report", "expiresDay": 100}, 1, ["weekly-report"]],
                    {"accepted": False, "failures": ["reference"], "identity": "None:None"},
                ),
            ],
            [
                "YAML·코드·로그에는 secret 값이 아니라 provider와 key reference만 남기세요.",
                "자격증명 purpose와 만료일을 실행 전에 검사하세요.",
            ],
        ),
        "transfer": T(
            "credential-use-ledger",
            "새 자격증명 사용에 최소 scope·redaction 감사 전이하기",
            "요청 scope가 허용 scope 안이고 로그 잔존이 없는지 판정한다.",
            "audit_credential_use(usage, allowed_scopes)를 완성하세요.",
            "def audit_credential_use(usage, allowed_scopes):\n    raise NotImplementedError",
            """def audit_credential_use(usage, allowed_scopes):
    requested = set(usage.get("requestedScopes", []))
    excess = sorted(requested - set(allowed_scopes))
    failures = []
    if excess:
        failures.append("scope")
    if usage.get("secretResidualFindings", 0) != 0:
        failures.append("redaction")
    if not usage.get("auditId"):
        failures.append("audit-id")
    return {"accepted": not failures, "failures": failures, "excessScopes": excess, "recordedSecretValue": False}
""",
            "audit_credential_use",
            [
                (
                    "accepts-minimal-redacted-use",
                    [{"requestedScopes": ["smtp-send"], "secretResidualFindings": 0, "auditId": "u1"}, ["smtp-send"]],
                    {"accepted": True, "failures": [], "excessScopes": [], "recordedSecretValue": False},
                ),
                (
                    "reports-scope-redaction-and-audit-gaps",
                    [{"requestedScopes": ["smtp-send", "imap-read"], "secretResidualFindings": 1, "auditId": ""}, ["smtp-send"]],
                    {"accepted": False, "failures": ["scope", "redaction", "audit-id"], "excessScopes": ["imap-read"], "recordedSecretValue": False},
                ),
                (
                    "accepts-no-scope-use",
                    [{"requestedScopes": [], "secretResidualFindings": 0, "auditId": "u2"}, []],
                    {"accepted": True, "failures": [], "excessScopes": [], "recordedSecretValue": False},
                ),
            ],
            [
                "발송 계정에 IMAP read 같은 불필요 scope를 함께 부여하지 마세요.",
                "사용 ledger에는 secret 값이 아닌 audit ID와 scope만 남기세요.",
            ],
        ),
        "retrieval": decision(
            "mail-credential-recall",
            "메일 자격증명 관리 원칙 회상하기",
            "reference·scope·rotation·redaction 근거를 복원한다.",
            "choose_mail_credential_policy",
            {
                "store": {"action": "keep provider key reference", "evidence": "secret identity", "risk": "embedded credential"},
                "use": {"action": "request minimal scope", "evidence": "scope and audit ID", "risk": "overprivilege"},
                "rotate": {"action": "enforce expiry and revoke old", "evidence": "rotation event", "risk": "stale credential"},
            },
        ),
    },
    "10": {
        "mastery": T(
            "weekly-report-send-capstone",
            "주간 report 발송의 source·recipient·attachment reconciliation 감사하기",
            "현재 주차 source와 수신자, report artifact, dry run preview를 함께 판정한다.",
            "audit_weekly_report_send(plan, required_recipients, current_week_hash)를 완성하세요.",
            "def audit_weekly_report_send(plan, required_recipients, current_week_hash):\n    raise NotImplementedError",
            """def audit_weekly_report_send(plan, required_recipients, current_week_hash):
    failures = []
    recipients = set(plan.get("recipients", []))
    missing_recipients = sorted(set(required_recipients) - recipients)
    unexpected_recipients = sorted(recipients - set(required_recipients))
    if missing_recipients or unexpected_recipients:
        failures.append("recipients")
    if plan.get("sourceHash") != current_week_hash:
        failures.append("source")
    artifact = plan.get("reportArtifact", {})
    if not artifact.get("contentHash") or artifact.get("byteLength", 0) <= 0:
        failures.append("artifact")
    if not plan.get("dryRunPreviewPassed", False):
        failures.append("preview")
    if not plan.get("idempotencyKey"):
        failures.append("idempotency")
    return {"ready": not failures, "failures": failures, "missingRecipients": missing_recipients, "unexpectedRecipients": unexpected_recipients}
""",
            "audit_weekly_report_send",
            [
                (
                    "accepts-current-previewed-report",
                    [{"recipients": ["a@example.test"], "sourceHash": "week1", "reportArtifact": {"contentHash": "r", "byteLength": 100}, "dryRunPreviewPassed": True, "idempotencyKey": "week1:a"}, ["a@example.test"], "week1"],
                    {"ready": True, "failures": [], "missingRecipients": [], "unexpectedRecipients": []},
                ),
                (
                    "reports-all-capstone-gaps",
                    [{"recipients": ["b@example.test"], "sourceHash": "old", "reportArtifact": {}, "dryRunPreviewPassed": False, "idempotencyKey": ""}, ["a@example.test"], "week1"],
                    {"ready": False, "failures": ["recipients", "source", "artifact", "preview", "idempotency"], "missingRecipients": ["a@example.test"], "unexpectedRecipients": ["b@example.test"]},
                ),
                (
                    "reports-zero-byte-artifact",
                    [{"recipients": [], "sourceHash": "w", "reportArtifact": {"contentHash": "x", "byteLength": 0}, "dryRunPreviewPassed": True, "idempotencyKey": "w"}, [], "w"],
                    {"ready": False, "failures": ["artifact"], "missingRecipients": [], "unexpectedRecipients": []},
                ),
            ],
            [
                "현재 주차 source hash와 report artifact를 idempotency key에 묶으세요.",
                "실제 발송 전에 모든 recipient의 dry-run preview를 통과시키세요.",
            ],
        ),
        "transfer": T(
            "weekly-report-delivery-release",
            "새 주간 report의 delivery·중복 release gate 전이하기",
            "recipient별 provider ID와 같은 idempotency key 중복 발송을 검사한다.",
            "decide_weekly_delivery_release(attempts, expected_recipients)를 완성하세요.",
            "def decide_weekly_delivery_release(attempts, expected_recipients):\n    raise NotImplementedError",
            """def decide_weekly_delivery_release(attempts, expected_recipients):
    delivered = {}
    duplicate_keys = []
    seen_keys = set()
    for attempt in attempts:
        key = attempt["idempotencyKey"]
        if key in seen_keys:
            duplicate_keys.append(key)
        seen_keys.add(key)
        if attempt.get("status") == "accepted" and attempt.get("providerMessageId"):
            delivered[attempt["recipient"]] = attempt["providerMessageId"]
    missing = sorted(set(expected_recipients) - set(delivered))
    unexpected = sorted(set(delivered) - set(expected_recipients))
    failures = []
    if missing:
        failures.append("missing")
    if unexpected:
        failures.append("unexpected")
    if duplicate_keys:
        failures.append("duplicate")
    return {"releaseReady": not failures, "failures": failures, "missing": missing, "unexpected": unexpected, "duplicateKeys": sorted(set(duplicate_keys)), "delivered": dict(sorted(delivered.items()))}
""",
            "decide_weekly_delivery_release",
            [
                (
                    "accepts-one-delivery-per-recipient",
                    [[{"recipient": "a", "idempotencyKey": "w:a", "status": "accepted", "providerMessageId": "m1"}, {"recipient": "b", "idempotencyKey": "w:b", "status": "accepted", "providerMessageId": "m2"}], ["a", "b"]],
                    {"releaseReady": True, "failures": [], "missing": [], "unexpected": [], "duplicateKeys": [], "delivered": {"a": "m1", "b": "m2"}},
                ),
                (
                    "reports-missing-and-duplicate",
                    [[{"recipient": "a", "idempotencyKey": "w:a", "status": "accepted", "providerMessageId": "m1"}, {"recipient": "a", "idempotencyKey": "w:a", "status": "accepted", "providerMessageId": "m2"}], ["a", "b"]],
                    {"releaseReady": False, "failures": ["missing", "duplicate"], "missing": ["b"], "unexpected": [], "duplicateKeys": ["w:a"], "delivered": {"a": "m2"}},
                ),
                (
                    "reports-unexpected-recipient",
                    [[{"recipient": "x", "idempotencyKey": "w:x", "status": "accepted", "providerMessageId": "mx"}], []],
                    {"releaseReady": False, "failures": ["unexpected"], "missing": [], "unexpected": ["x"], "duplicateKeys": [], "delivered": {"x": "mx"}},
                ),
            ],
            [
                "recipient별 provider message ID를 delivery evidence로 남기세요.",
                "같은 idempotency key가 두 번 사용되면 결과가 accepted여도 release를 막으세요.",
            ],
        ),
        "retrieval": decision(
            "weekly-mail-capstone-recall",
            "주간 report 발송 종료 조건 회상하기",
            "source·preview·artifact·delivery·dedupe 근거를 복원한다.",
            "choose_weekly_mail_gate",
            {
                "prepare": {"action": "bind current source recipients and artifact", "evidence": "send manifest", "risk": "stale or wrong report"},
                "preview": {"action": "render per-recipient dry run", "evidence": "isolated previews", "risk": "personal data leak"},
                "release": {"action": "reconcile provider IDs and idempotency", "evidence": "delivery ledger", "risk": "missing or duplicate mail"},
            },
        ),
    },
}
