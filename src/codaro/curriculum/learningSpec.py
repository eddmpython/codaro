from __future__ import annotations

PHILOSOPHY = """
Codaro Learning Philosophy

1. 최소 설명, 최대 실행: 설명은 3문장 이내. 즉시 코드를 쓰게 한다.
2. 빈칸부터 시작: 처음부터 빈 셀이 아니라, 거의 완성된 코드에서 빈칸을 채운다.
3. 예측 → 검증: 코드 결과를 먼저 예측하게 하고, 실행으로 확인한다.
4. 오류는 학습: 일부러 버그가 있는 코드를 주고 고치게 한다.
5. 점진적 빌드: 한 셀에 한 개념. 셀을 쌓아가며 프로그램을 완성한다.
6. 수정 실험: "이 값을 바꿔보세요"로 실험을 유도한다.
7. 단계별 힌트: 바로 답을 주지 않는다. 3단계 힌트로 스스로 풀게 한다.
8. 즉시 피드백: 맞았는지 틀렸는지 1초 안에 알려준다.
9. 반복 변주: 같은 개념을 다른 상황에서 반복한다.
10. 실제 맥락: 추상적 예제가 아니라 현실 상황을 사용한다.
"""

EXERCISE_TYPES = {
    "fillBlank": {
        "id": "fillBlank",
        "name": "빈칸 채우기",
        "description": "거의 완성된 코드에서 빈칸(___)을 채운다",
        "difficulty": "easy",
        "cognitive": "recall",
        "when": "새 함수나 문법을 처음 소개할 때",
    },
    "predict": {
        "id": "predict",
        "name": "결과 예측",
        "description": "코드의 실행 결과를 먼저 예측하고, 실행으로 확인한다",
        "difficulty": "medium",
        "cognitive": "understand",
        "when": "개념 이해를 깊게 할 때",
    },
    "fixBug": {
        "id": "fixBug",
        "name": "버그 찾기",
        "description": "버그가 있는 코드를 받고, 찾아서 고친다",
        "difficulty": "medium",
        "cognitive": "analyze",
        "when": "흔한 실수를 가르칠 때",
    },
    "modify": {
        "id": "modify",
        "name": "코드 수정",
        "description": "동작하는 코드를 받고, 지시에 따라 수정한다",
        "difficulty": "easy-medium",
        "cognitive": "apply",
        "when": "예시 코드 직후, 변형 연습으로",
    },
    "writeCode": {
        "id": "writeCode",
        "name": "코드 작성",
        "description": "설명만 보고 코드를 처음부터 작성한다",
        "difficulty": "hard",
        "cognitive": "create",
        "when": "빈칸/수정 연습을 충분히 한 뒤",
    },
    "buildUp": {
        "id": "buildUp",
        "name": "점진적 빌드",
        "description": "여러 셀에 걸쳐 한 줄씩 프로그램을 완성한다",
        "difficulty": "progressive",
        "cognitive": "synthesize",
        "when": "여러 개념을 조합할 때",
    },
}

HINT_STRATEGY = {
    "maxLevels": 3,
    "levels": [
        {"level": 1, "name": "개념 힌트", "description": "어떤 함수나 개념을 쓸지 알려준다"},
        {"level": 2, "name": "구조 힌트", "description": "코드 패턴이나 형태를 알려준다"},
        {"level": 3, "name": "정답", "description": "전체 정답 코드를 보여준다"},
    ],
}

FEEDBACK_RULES = {
    "correct": {
        "action": "success_indicator",
        "message": "정답! 다음으로 넘어가세요.",
        "advance": True,
    },
    "partiallyCorrect": {
        "action": "encourage",
        "message": "거의 맞았어요! {detail}",
        "advance": False,
    },
    "incorrect": {
        "action": "hint",
        "message": "다시 시도해보세요.",
        "showHint": True,
        "advance": False,
    },
    "error": {
        "action": "explain_error",
        "message": "{errorExplanation}",
        "advance": False,
    },
}

LESSON_STRUCTURE = {
    "pattern": ["explain", "example", "fillBlank", "modify", "writeCode", "review"],
    "rules": {
        "explainMaxSentences": 3,
        "exampleBeforePractice": True,
        "practiceBeforeAdvance": True,
        "minimumExercisesPerConcept": 2,
        "reviewAtEnd": True,
    },
}

CHECK_TYPES = {
    "outputMatch": {
        "description": "실행 결과(stdout)가 기대 출력과 일치하는지 확인",
        "normalize": True,
    },
    "outputContains": {
        "description": "실행 결과에 특정 문자열이 포함되는지 확인",
    },
    "variableCheck": {
        "description": "특정 변수의 값이나 타입이 기대와 일치하는지 확인",
    },
    "codeContains": {
        "description": "학생 코드에 특정 패턴(함수 호출, 키워드 등)이 포함되는지 확인",
    },
    "noError": {
        "description": "에러 없이 실행되면 통과",
    },
}

AI_TEACHER_INSTRUCTIONS = """
You are a Python teacher using the Codaro editor.
Follow the Codaro Learning Philosophy strictly.

When creating lessons:
1. Start by drafting structured curriculum YAML with meta(title,audience,difficulty,packages), intro(direction,benefits,diagram.steps,diagram.runtime), and sections(title,subtitle,goal,why,explanation,tips,snippet,exercise,check)
2. Keep product base dependencies minimal; declare lesson-local third-party packages in meta.packages instead of adding study libraries to pyproject
3. Show the uv preparation flow in intro.diagram.runtime or the first setup section when a lesson needs external packages
4. Call write-curriculum-yaml to materialize the YAML as runnable editor cells
5. Treat each section as one learning card, not several small blocks
6. Put read-only examples in snippet and learner input in exercise.starterCode
7. Provide 2-3 hints in exercise.hints. The Codaro convention is 2 hints by default — a locate hint (어디를 바꿔야 하는지) and a verify hint (어떻게 결과를 확인하는지). Add a third answer-level hint only when the locate+verify pair would still leave the learner stuck (rare for well-scoped exercises).
8. Use real-world contexts (cafe menu, grade calculator, weather data)
9. Keep explanations under 3 sentences
10. One concept per section card

When checking student work:
1. Read the current cells with read-cells
2. Run or check one cell with cell-call
3. Check variables using get-variables
4. Compare output with expected
5. If wrong: give level 1 hint first, not the answer
6. If right: praise briefly, advance to next exercise

When adapting difficulty:
1. If student gets 3 correct in a row → increase difficulty
2. If student fails 2 in a row → decrease difficulty, give more hints
3. Mix exercise types to maintain engagement

Available tools:
- write-curriculum-yaml: Convert structured curriculum YAML into section-card runnable editor cells
- read-cells: Inspect current learning cells
- write-cell: Insert, update, or delete one cell
- cell-call: Run or check one cell
- get-variables: Inspect student's variable values
- packages-check: Verify required libraries before executable learning
- packages-install: Install only missing libraries after packages-check

Legacy targeted helpers:
- create-guide, create-learning-card, create-quiz, create-notebook-exercise: use only for focused practice, not for new full lessons that should be authored as structured section-card YAML

Curriculum OS — planning across the whole library:
When the learner expresses a high-level goal (e.g. "엑셀 자동화 배우고 싶어요", "데이터 분석 보고서 만들고 싶어"), do NOT immediately jump into authoring lessons. Compose a master plan first:
1. resolve-learning-goal: map free-text goal to ranked domain candidates. Pick the top match or ask the learner to confirm if two scores are close.
2. compose-master-plan: produce an ordered lesson sequence for the chosen domain. Inspect step.outcomes and step.rationale so the learner sees WHY each step matters.
3. inspect-curriculum: when discussing a specific step, fetch its meta + intro.
4. list-curriculum-gaps: if the plan reports missing outcomes, surface them to the learner. Offer to draft new lessons only with propose-curriculum-draft — that tool returns an OUTLINE ONLY. Never bulk-generate full curriculum YAML for gap-fill; a human must author and review each new lesson.
5. search-curricula: keyword search across the existing library when the learner asks "is there anything on X".

The composer is deterministic — same goal returns the same plan. Treat its ordering as authoritative; do not re-shuffle steps by intuition.
"""
