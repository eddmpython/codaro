from __future__ import annotations

import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SURFACE = ROOT / "editor" / "src" / "components" / "curriculum" / "curriculumSurface.tsx"
MARKDOWN_BODY = ROOT / "editor" / "src" / "components" / "curriculum" / "curriculumMarkdownBody.tsx"
APP_PRIMITIVES = ROOT / "editor" / "src" / "components" / "app" / "appPrimitives.tsx"
CELL_ACTIONS = ROOT / "editor" / "src" / "components" / "app" / "cellAiActions.tsx"
AI_PANEL = ROOT / "editor" / "src" / "components" / "assistant" / "assistantPanel.tsx"
LOCALE_COPY = ROOT / "editor" / "src" / "lib" / "localeCopy.ts"


def require(text: str, token: str, label: str, failures: list[str]) -> None:
    if token not in text:
        failures.append(f"missing {label}: {token}")


def require_order(text: str, before: str, after: str, label: str, failures: list[str]) -> None:
    before_index = text.find(before)
    after_index = text.find(after)
    if before_index == -1 or after_index == -1:
        failures.append(f"missing order tokens for {label}")
        return
    if before_index > after_index:
        failures.append(f"wrong order for {label}: expected {before} before {after}")


def main() -> int:
    failures: list[str] = []

    for path in (SURFACE, MARKDOWN_BODY, APP_PRIMITIVES, CELL_ACTIONS, AI_PANEL, LOCALE_COPY):
        if not path.exists():
            print(f"FAIL: missing editor surface: {path.relative_to(ROOT)}", file=sys.stderr)
            return 1

    text = SURFACE.read_text(encoding="utf-8")
    cellActionsText = CELL_ACTIONS.read_text(encoding="utf-8")
    aiPanelText = AI_PANEL.read_text(encoding="utf-8")
    markdownBodyText = MARKDOWN_BODY.read_text(encoding="utf-8")
    appPrimitivesText = APP_PRIMITIVES.read_text(encoding="utf-8")
    localeCopyText = LOCALE_COPY.read_text(encoding="utf-8")

    required_tokens = {
        "section card marker": "data-learning-section-card={section.id}",
        "structured section marker": 'data-learning-section-structured={structured ? "true" : "false"}',
        "overview marker": 'data-learning-section-part="overview"',
        "overview blueprint marker": 'data-learning-overview-blueprint="true"',
        "overview rail marker": 'data-learning-overview-rail="true"',
        "overview workflow marker": 'data-learning-overview-part="workflow"',
        "workflow diagram marker": 'data-learning-workflow-diagram="true"',
        "workflow step marker": 'data-learning-workflow-step="true"',
        "workflow renderer": "function WorkflowArchitectureDiagram",
        "workflow step resolver": "function workflowArchitectureSteps",
        "workflow generic guard": "function isSpecificWorkflowStep",
        "package panel marker": 'data-learning-package-panel="true"',
        "package status marker": "data-learning-package-status={packageStatus}",
        "package install action marker": 'data-learning-package-install="true"',
        "package item marker": "data-learning-package-item={packageName}",
        "package installed marker": 'data-learning-package-installed={installed ? "true" : "false"}',
        "package progress marker": 'data-learning-package-progress="true"',
        "package progress state": "type PackageInstallProgress",
        "package progress text": "${installProgress.index}/${installProgress.total} 단계",
        "package install button progress": "${installProgress.index}/${installProgress.total} 설치 중",
        "exercise marker": 'data-learning-section-part="exercise"',
        "exercise direct editor marker": 'data-learning-exercise-input="editor"',
        "exercise student practice role": 'data-learning-exercise-input-role="student-practice"',
        "exercise selected state marker": "data-learning-exercise-input-state={exerciseSelected ? \"selected\" : \"ready\"}",
        "exercise direct editor label": "Python 실습 코드",
        "exercise student-authored badge": "학습자가 작성",
        "result marker": 'data-learning-section-part="result"',
        "section overview renderer": "function SectionContractOverview",
        "section contract gap marker": 'data-learning-section-contract-gaps="true"',
        "section contract gap label": "YAML 계약 보강 필요",
        "section contract gap resolver": "function sectionContractGapLabels",
        "section contract gap source": "contract.contractGaps",
        "section contract gap icon": "AlertTriangle",
        "structured body renderer": "function StructuredSectionLearningBody",
        "structured band renderer": "function StructuredSectionBand",
        "structured detector": "function hasStructuredSectionBlocks",
        "structured parts resolver": "function structuredSectionParts",
        "contract overview before body": "<SectionContractOverview contract={section.contract} />",
        "section index marker": 'data-learning-section-index="true"',
        "section heading marker": 'data-learning-section-heading="true"',
        "section index height": "min-h-11 w-11",
        "push toc marker": 'data-learning-toc="push"',
        "push toc width expansion": "hover:w-72",
        "single-card structured branch": "structured ? (",
        "legacy fallback branch": "variant=\"embedded\"",
        "contract source detector": 'block.sourceType?.startsWith("sectionContract:")',
        "snippet source mapping": 'block.sourceType === "sectionContract:snippet"',
        "exercise source mapping": 'block.sourceType === "sectionContract:exercise"',
        "check source mapping": 'block.sourceType === "sectionContract:check"',
        "snippet part assignment": 'part="snippet"',
        "check part assignment": 'part="check"',
        "structured exercise direct editor": "autoFocus: exerciseSelected",
        "code cell direct editor marker": 'data-learning-code-input="editor"',
        "code input role marker": 'data-learning-code-input-role={isSnippetCode ? "student-practice" : "code-edit"}',
        "code input selected marker": "data-learning-code-input-state={isSelected ? \"selected\" : \"ready\"}",
        "embedded markdown title dedupe": "<CurriculumMarkdownBody block={block} hideRepeatedTitle />",
    }
    for label, token in required_tokens.items():
        require(text, token, label, failures)

    cell_action_tokens = {
        "cell help popover marker": 'data-cell-ai-popover="true"',
        "cell help question input": 'data-cell-ai-question="true"',
        "cell help answer marker": 'data-cell-ai-answer="true"',
        "cell help always visible marker": 'data-cell-ai-help-trigger="always-visible"',
        "cell-local question title": "이 셀에서 바로 질문",
        "cell-local answer label": "이 셀 답변",
        "visible help request label": "도움 요청",
        "custom cell question forwarding": "onAsk(action, question)",
    }
    for label, token in cell_action_tokens.items():
        require(cellActionsText, token, label, failures)

    ai_panel_tokens = {
        "Codaro AI label": "Codaro AI",
        "Codaro avatar": "/brand/avatar-small.png",
    }
    for label, token in ai_panel_tokens.items():
        require(aiPanelText, token, label, failures)

    markdown_body_tokens = {
        "hide repeated title prop": "hideRepeatedTitle = false",
        "list item title dedupe": "dedupeRepeatedItems",
        "markdown line title dedupe": "dedupeRepeatedLines",
        "lead title hide": "shouldHideRepeatedTitle",
    }
    for label, token in markdown_body_tokens.items():
        require(markdownBodyText, token, label, failures)

    code_payload_tokens = {
        "snippet code box marker": 'data-code-payload="snippet"',
        "snippet copy marker": 'data-code-payload-copy="true"',
        "copy action label key": "system.copySnippet",
        "copy button text key": "common.copy",
        "snippet box label": "예제 스니펫",
    }
    for label, token in code_payload_tokens.items():
        require(appPrimitivesText, token, label, failures)

    locale_copy_tokens = {
        "copy action label": "스니펫 복사",
        "copy button text": "복사",
    }
    for label, token in locale_copy_tokens.items():
        require(localeCopyText, token, label, failures)

    require_order(
        text,
        "<SectionContractOverview contract={section.contract} />",
        "<StructuredSectionLearningBody",
        "section card overview-to-practice flow",
        failures,
    )
    require_order(
        text,
        'part="snippet"',
        'data-learning-section-part="exercise"',
        "snippet before exercise",
        failures,
    )
    require_order(
        text,
        'data-learning-section-part="exercise"',
        'data-learning-section-part="result"',
        "exercise before result",
        failures,
    )
    require_order(
        text,
        'data-learning-section-part="result"',
        'part="check"',
        "result before check",
        failures,
    )

    marker_count = text.count("data-learning-section-part")
    if marker_count < 4:
        failures.append(f"expected at least 4 section part marker sites, found {marker_count}")

    forbidden_tokens = {
        SURFACE: (
            "LightweightCodePreview",
            "클릭해서 직접 입력하세요.",
            "클릭해서 코드를 편집하세요.",
            "예제를 실행한 뒤 값 하나를 바꿔 결과를 비교하세요.",
            "기준 실행 후 값 하나를 바꿔 결과를 비교하세요.",
            "위 예제 스니펫을 참고해 아래 편집기에 직접 입력하고, 값 하나를 바꾼 뒤 실행하세요.",
            "아래 코드 영역을 클릭해 직접 입력하세요.",
            "학습 아키텍처",
            "absolute right-full",
        ),
        AI_PANEL: (
            "Codaro 어시스턴트",
            "Bot,",
            "Robot",
            "robot",
        ),
        CELL_ACTIONS: (
            "group-hover:opacity-100",
            "lg:opacity-0",
            "tabIndex={selected ? 0 : -1}",
        ),
    }
    sourceByPath = {
        SURFACE: text,
        AI_PANEL: aiPanelText,
        CELL_ACTIONS: cellActionsText,
    }
    for path, tokens in forbidden_tokens.items():
        source = sourceByPath[path]
        for token in tokens:
            if token in source:
                failures.append(f"forbidden token remains in {path.relative_to(ROOT)}: {token}")

    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1

    print("ok: structured learning section card contract is wired in the editor surface")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
