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
        policy="학습 요청을 긴 채팅 답변만으로 끝내지 않는다.",
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
        policy="packages-install은 packages-check 결과의 missing에 있는 패키지에만 사용한다.",
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
        purpose="자동화 요청을 automation/skill/task 셀 조합으로 만든다.",
        trigger="사용자가 브라우저, OS, 마우스, 이미지, 반복 업무 자동화를 요청할 때",
        requiredTools=("write-cell", "run-automation"),
        policy="자동화는 실행 가능한 셀과 검증 가능한 단계로 나눈다.",
    ),
    TeacherSkill(
        skillId="task-scheduling",
        purpose="자동화 셀에서 만든 루틴을 예약 실행 가능한 task로 정리한다.",
        trigger="사용자가 매일, 특정 시각, 반복 실행, 루틴 예약을 요청할 때",
        requiredTools=("write-cell",),
        policy="task는 자동화의 실행 스케줄이며 커리큘럼 학습 공간과 섞지 않는다.",
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
