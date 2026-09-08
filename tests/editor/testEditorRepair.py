import json
from types import SimpleNamespace

import pytest

from codaro.ai.editorRepair import EditorRepairError, proposeEditorRepair, replacementChanges


def testRepairPreservesSelectionAndVersion():
    messages = []
    source = '"😀"\nvalue = 1\nprint(value)'
    payload = {
        "mode": "editor", "blockId": "cell", "version": "v1", "source": source,
        "from": 5, "to": 14, "instruction": "값을 2로 바꿔줘",
    }

    class Provider:
        def complete(self, prompt):
            messages.extend(prompt)
            return SimpleNamespace(answer=json.dumps({"replacement": "value = 2", "explanation": "값을 바꿨습니다."}), provider="test", model="test")

    profile = SimpleNamespace(resolve=lambda **kwargs: {"provider": "custom"})
    result = proposeEditorRepair(payload, profileManager=profile, providerFactory=lambda config: Provider())
    assert result["version"] == "v1"
    assert result["changes"] == [{"from": 5, "to": 14, "before": "value = 1", "after": "value = 2"}]
    context = json.loads(messages[1]["content"])
    assert context["selected"] == "value = 1"
    assert context["afterSelection"] == "\nprint(value)"


def testRepairSeparatesUnchangedLines():
    changes = replacementChanges("a = 1\nprint(a)\nb = 2\n", "a = 3\nprint(a)\nb = 4\n", 0)
    assert len(changes) == 2
    assert changes[0]["before"] == "a = 1\n"
    assert changes[1]["after"] == "b = 4\n"


def testRepairSupportsInsertionAndDeletion():
    assert replacementChanges("", "pass", 3) == [{"from": 3, "to": 3, "before": "", "after": "pass"}]
    assert replacementChanges("pass", "", 3) == [{"from": 3, "to": 7, "before": "pass", "after": ""}]


@pytest.mark.parametrize("mode", ["learning", None, "curriculum"])
def testLearningCannotRequestRepair(mode):
    with pytest.raises(EditorRepairError, match="개발 편집기"):
        proposeEditorRepair({"mode": mode}, profileManager=None)


def testRepairRejectsMalformedProviderResponse():
    profile = SimpleNamespace(resolve=lambda **kwargs: {"provider": "custom"})
    provider = SimpleNamespace(complete=lambda messages: SimpleNamespace(answer="```python\npass\n```"))
    with pytest.raises(EditorRepairError, match="형식"):
        proposeEditorRepair({"mode": "editor", "blockId": "cell", "version": "v1", "source": "", "from": 0, "to": 0, "instruction": "작성"}, profileManager=profile, providerFactory=lambda config: provider)


@pytest.mark.parametrize("execution", [[], {"stderr": "x" * 8001}, {"sourceCode": {}}, {"status": 5}])
def testRepairRejectsInvalidExecutionBeforeProvider(execution):
    payload = {"mode": "editor", "blockId": "cell", "version": "v1", "source": "", "from": 0, "to": 0, "instruction": "작성", "lastExecution": execution}
    with pytest.raises(EditorRepairError, match="이전 실행 정보"):
        proposeEditorRepair(payload, profileManager=None)


def testRepairDerivesExecutionFreshnessFromSource():
    messages = []

    class Provider:
        def complete(self, prompt):
            messages.extend(prompt)
            return SimpleNamespace(answer='{"replacement": "pass"}', provider="fixture", model="fixture")

    payload = {"mode": "editor", "blockId": "cell", "version": "v1", "source": "pass", "from": 0, "to": 4, "instruction": "검토", "lastExecution": {"sourceCode": "old", "stale": False}}
    proposeEditorRepair(payload, profileManager=SimpleNamespace(resolve=lambda **kwargs: {"provider": "custom"}), providerFactory=lambda config: Provider())
    assert json.loads(messages[-1]["content"])["lastExecution"]["stale"] is True
