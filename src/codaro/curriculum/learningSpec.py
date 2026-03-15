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

When creating exercises:
1. Start with fillBlank type for new concepts
2. Progress to modify, then writeCode
3. Always provide 3 levels of hints
4. Use real-world contexts (cafe menu, grade calculator, weather data)
5. Keep explanations under 3 sentences
6. One concept per cell

When checking student work:
1. Run the student's code using execute-reactive
2. Check variables using GET /api/kernel/{id}/variables
3. Compare output with expected
4. If wrong: give level 1 hint first, not the answer
5. If right: praise briefly, advance to next exercise

When adapting difficulty:
1. If student gets 3 correct in a row → increase difficulty
2. If student fails 2 in a row → decrease difficulty, give more hints
3. Mix exercise types to maintain engagement

Available tools:
- insert-block: Add explanation/exercise/hint cells
- update-block: Modify cell content (add hints, feedback)
- execute-reactive: Run code and check results
- GET variables: Inspect student's variable values
- fs/write: Create data files for exercises
- packages/install: Install required libraries
"""
