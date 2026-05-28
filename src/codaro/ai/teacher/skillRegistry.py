from __future__ import annotations

from collections.abc import Collection
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class TeacherSkill:
    skillId: str
    purpose: str
    trigger: str
    requiredTools: tuple[str, ...]
    policy: str


@dataclass(frozen=True)
class TeacherSkillIssue:
    code: str
    skillId: str
    message: str
    toolName: str | None = None


teacherSkills: tuple[TeacherSkill, ...] = (
    TeacherSkill(
        skillId="curriculum-authoring",
        purpose="학습 요청을 curriculum YAML과 학습 셀 document로 전개한다.",
        trigger="사용자가 주제 학습, 레슨, 커리큘럼, 루틴 학습을 요청할 때",
        requiredTools=("write-curriculum-yaml", "read-cells"),
        policy=(
            "신규 레슨은 meta/intro/sections structured YAML로 만들고 sections[].blocks는 legacy 변환에만 쓴다. "
            "각 section은 goal/why/explanation/tips/snippet/exercise/check를 가진 하나의 학습카드 단위다. "
            "학습 주제별 패키지는 기본 의존성에 넣지 않고 meta.packages에 선언하며 소개/첫 섹션에서 uv 준비 흐름을 드러낸다."
        ),
    ),
    TeacherSkill(
        skillId="cell-editing",
        purpose="cellMap의 role/displayKind/executionKind를 보고 정확한 셀만 수정한다.",
        trigger="사용자가 현재 셀 수정, 설명 보강, 스니펫 수정, 실습 재구성을 요청할 때",
        requiredTools=("read-cells", "write-cell"),
        policy="설명 셀에는 실행 코드를 쓰지 않고, 실습 입력은 exercise 셀에 둔다.",
    ),
    TeacherSkill(
        skillId="package-preflight",
        purpose="외부 라이브러리가 필요한 실행 전에 설치 여부를 확인한다.",
        trigger="pandas, matplotlib, selenium, playwright 등 외부 패키지가 필요한 요청일 때",
        requiredTools=("packages-check", "packages-install"),
        policy="packages-install은 packages-check 결과의 missing에 있는 패키지에만 사용하며, 설치는 프로젝트 .venv 대상 uv 경로만 따른다.",
    ),
    TeacherSkill(
        skillId="answer-checking",
        purpose="학습자의 코드와 실행 결과를 셀 단위로 검증한다.",
        trigger="사용자가 답 확인, 왜 틀렸는지, 결과 검증을 요청할 때",
        requiredTools=("read-cells", "cell-call", "get-variables"),
        policy="셀을 읽거나 실행하지 않고 정답 여부를 단정하지 않는다.",
    ),
    TeacherSkill(
        skillId="automation-authoring",
        purpose="자동화 요청을 percent-format recipe, automation 셀, dry-run 검증으로 전개한다.",
        trigger="사용자가 브라우저, OS, 마우스, 이미지, 반복 업무 자동화를 요청할 때",
        requiredTools=("read-cells", "write-automation-recipe", "packages-check", "cell-call"),
        policy=(
            "자동화 작성은 curriculum YAML이 아니라 write-automation-recipe로 만든 percent-format recipe를 기준으로 한다. "
            "기본은 dry-run이며, 외부 패키지가 필요하면 packages-check 이후 cell-call로 검증한다."
        ),
    ),
    TeacherSkill(
        skillId="task-scheduling",
        purpose="자동화 셀에서 만든 루틴을 예약 실행 가능한 task로 정리한다.",
        trigger="사용자가 매일, 특정 시각, 반복 실행, 루틴 예약을 요청할 때",
        requiredTools=("read-cells", "create-automation-task"),
        policy="검증된 recipe 또는 documentPath만 task로 등록하며 커리큘럼 학습 공간과 섞지 않는다.",
    ),
    TeacherSkill(
        skillId="learner-diagnostics",
        purpose="학습자의 mental model 상태를 읽고 misconception을 매칭해 다음 발자국을 derive한다.",
        trigger=(
            "학습자가 셀을 실행했거나 예측을 적었을 때, 같은 outcome에서 반복 실패할 때, "
            "또는 사용자가 '왜 안 되는지', '뭐가 헷갈리는지', '이제 뭐 하면 좋을지'를 물을 때"
        ),
        requiredTools=(
            "read-learner-state",
            "record-prediction-result",
            "match-misconception",
            "suggest-next-step",
        ),
        policy=(
            "Predict-Run-Reconcile-Adapt 루프: predict가 있으면 record-prediction-result로 diff를 mastery 신호로 바꾸고, "
            "에러/이상한 코드가 보이면 match-misconception으로 catalog와 매칭한다. "
            "그 다음 suggest-next-step으로 applyCorrection/replayOutcome/advance/continuePractice 중 하나를 골라 학습자에게 다음 행동을 제시한다. "
            "같은 misconception이 두 번 매칭되면 doneCriterionViolated가 떠 강의 보강이 필요한 신호다."
        ),
    ),
)


def validateTeacherSkills(
    registeredToolNames: Collection[str] | None = None,
) -> tuple[TeacherSkillIssue, ...]:
    toolNames = _registeredToolNames() if registeredToolNames is None else set(registeredToolNames)
    manifestToolNames = _manifestToolNames()
    issues: list[TeacherSkillIssue] = []
    seenSkillIds: set[str] = set()

    for skill in teacherSkills:
        if skill.skillId in seenSkillIds:
            issues.append(
                TeacherSkillIssue(
                    code="duplicate-skill-id",
                    skillId=skill.skillId,
                    message=f"Teacher skill id is duplicated: {skill.skillId}",
                )
            )
        seenSkillIds.add(skill.skillId)

        if not skill.requiredTools:
            issues.append(
                TeacherSkillIssue(
                    code="empty-required-tools",
                    skillId=skill.skillId,
                    message=f"Teacher skill has no required tools: {skill.skillId}",
                )
            )

        seenRequiredTools: set[str] = set()
        for toolName in skill.requiredTools:
            if toolName in seenRequiredTools:
                issues.append(
                    TeacherSkillIssue(
                        code="duplicate-required-tool",
                        skillId=skill.skillId,
                        toolName=toolName,
                        message=f"Teacher skill repeats required tool: {toolName}",
                    )
                )
            seenRequiredTools.add(toolName)

            if toolName not in toolNames:
                issues.append(
                    TeacherSkillIssue(
                        code="missing-required-tool",
                        skillId=skill.skillId,
                        toolName=toolName,
                        message=f"Teacher skill requires an unregistered tool: {toolName}",
                    )
                )
                continue

            if toolName not in manifestToolNames:
                issues.append(
                    TeacherSkillIssue(
                        code="missing-tool-metadata",
                        skillId=skill.skillId,
                        toolName=toolName,
                        message=f"Teacher skill tool has no manifest metadata: {toolName}",
                    )
                )

    return tuple(issues)


def teacherSkillToolSummary() -> tuple[dict[str, Any], ...]:
    from ..toolManifest import toolDescriptor

    return tuple(
        {
            "skillId": skill.skillId,
            "purpose": skill.purpose,
            "trigger": skill.trigger,
            "policy": skill.policy,
            "tools": tuple(_toolSummary(toolDescriptor(toolName)) for toolName in skill.requiredTools),
        }
        for skill in teacherSkills
    )


def teacherSkillPrompt() -> str:
    lines = ["Teacher skill registry:"]
    for skill, summary in zip(teacherSkills, teacherSkillToolSummary(), strict=True):
        tools = ", ".join(_toolPromptLabel(tool) for tool in summary["tools"])
        lines.append(
            f"- {skill.skillId}: trigger={skill.trigger}; tools={tools}; policy={skill.policy}"
        )
    return "\n".join(lines)


def _registeredToolNames() -> set[str]:
    from ..tools import allTools

    return {tool.name for tool in allTools()}


def _manifestToolNames() -> set[str]:
    from ..toolManifest import TOOL_METADATA

    return set(TOOL_METADATA)


def _toolSummary(descriptor: dict[str, Any]) -> dict[str, str]:
    return {
        "name": str(descriptor.get("name", "")),
        "category": str(descriptor.get("category", "")),
        "lane": str(descriptor.get("lane", "")),
        "target": str(descriptor.get("target", "")),
        "risk": str(descriptor.get("risk", "")),
    }


def _toolPromptLabel(tool: dict[str, str]) -> str:
    name = tool.get("name", "")
    metadata = [
        f"lane={tool.get('lane', '')}",
        f"target={tool.get('target', '')}",
    ]
    risk = tool.get("risk", "")
    if risk and risk != "normal":
        metadata.append(f"risk={risk}")
    return f"{name}({','.join(metadata)})" if name else ""
