"""learner-diagnostics teacher skill registration tests."""
from __future__ import annotations

from codaro.ai.conversation import buildSystemPrompt
from codaro.ai.teacher.skillRegistry import (
    teacherSkillPrompt,
    teacherSkills,
    validateTeacherSkills,
)


def testLearnerDiagnosticsSkillExists() -> None:
    ids = {skill.skillId for skill in teacherSkills}
    assert "learner-diagnostics" in ids


def testLearnerDiagnosticsRequiredToolsRegistered() -> None:
    """진단 도구 모두 registry 검증을 통과해야 한다."""
    issues = validateTeacherSkills()
    relevant = [
        issue
        for issue in issues
        if issue.skillId == "learner-diagnostics"
    ]
    assert relevant == [], f"learner-diagnostics issues: {relevant}"


def testLearnerDiagnosticsSkillIsInTeacherPrompt() -> None:
    prompt = teacherSkillPrompt()
    assert "learner-diagnostics" in prompt
    for toolName in (
        "read-learner-state",
        "match-misconception",
        "suggest-next-step",
    ):
        assert toolName in prompt, f"tool '{toolName}' missing from skill prompt"


def testTeacherSystemPromptIncludesDiagnosticsLane() -> None:
    """teacher 역할의 system prompt가 진단 lane을 포함하는지."""
    prompt = buildSystemPrompt(role="teacher")
    assert "Teacher skill registry:" in prompt
    assert "learner-diagnostics" in prompt
    # 적어도 한 진단 도구는 라벨로 노출되어야 한다
    assert "match-misconception" in prompt
