import pytest

from codaro.document.codeIntelligence import CodeIntelligenceError, analyzeCode, codePointColumn


def query(source, operation, line=1, character=0, **extra):
    return analyzeCode({
        "files": [{"path": "notebook.py", "source": source}],
        "path": "notebook.py", "line": line, "character": character,
        "operation": operation, "version": "revision-1", **extra,
    })


def testCompletionUsesPythonScope():
    result = query("totalValue = 3\ntotalV", "complete", 2, 6)
    assert result["version"] == "revision-1"
    assert any(item["label"] == "totalValue" and item["insertText"] == "alue" for item in result["items"])


def testAnalysisRejectsInvalidUnicodeAndCaseCollisions():
    with pytest.raises(CodeIntelligenceError, match="문자"):
        query("\ud800", "diagnostics")
    with pytest.raises(CodeIntelligenceError, match="경로"):
        analyzeCode({"version": "v1", "files": [{"path": "bad\0.py", "source": ""}]})
    with pytest.raises(CodeIntelligenceError, match="중복"):
        analyzeCode({"version": "v1", "files": [{"path": "a.py", "source": ""}, {"path": "A.py", "source": ""}]})


def testRenameDoesNotChangeStringsCommentsOrShadowedNames():
    source = 'value = 1\ntext = "value"\n# value\ndef sample(value):\n    return value\nprint(value)'
    result = query(source, "rename", 1, 3, newName="amount")
    assert [(item["line"], item["name"], item["text"]) for item in result["edits"]] == [
        (1, "value", "amount"), (6, "value", "amount"),
    ]


def testDefinitionAcrossFiles():
    result = analyzeCode({
        "files": [
            {"path": "notebook.py", "source": "from helper import add\nadd(1, 2)"},
            {"path": "helper.py", "source": "def add(left, right):\n    return left + right"},
        ],
        "path": "notebook.py", "line": 2, "character": 2, "operation": "definition", "version": "v2",
    })
    assert result["locations"] == [{"path": "helper.py", "line": 1, "from": 4, "to": 7, "name": "add"}]


def testAnalysisNeverExecutesSource(tmp_path):
    target = tmp_path / "mustNotExist"
    source = f"from pathlib import Path\nPath({str(target)!r}).write_text('executed')\nmissing("
    result = query(source, "diagnostics")
    assert result["diagnostics"]
    assert not target.exists()


def testSignaturesAndHover():
    source = 'def add(left: int, right: int):\n    """두 수를 더한다."""\n    return left + right\nadd(1, '
    result = query(source, "signature", 4, 7)
    assert result["signatures"][0]["activeParameter"] == 1
    assert "right" in result["signatures"][0]["label"]
    assert query(source, "hover", 4, 2)["items"][0]["documentation"] == "두 수를 더한다."


def testUtf16Coordinates():
    assert codePointColumn('"😀"; 이름', 8) == 7
    result = query('"😀"; 이름 = 2\nprint(이름)', "references", 2, 7)
    assert result["locations"][0]["from"] == 6
    assert result["locations"][0]["to"] == 8
    with pytest.raises(CodeIntelligenceError):
        codePointColumn("😀", 1)


@pytest.mark.parametrize("path", ["../escape.py", "/root.py", "C:/root.py", "a\\b.py"])
def testAnalysisRejectsEscapingPaths(path):
    with pytest.raises(CodeIntelligenceError):
        analyzeCode({"files": [{"path": path, "source": "x=1"}], "path": path, "operation": "hover"})


def testRenameRejectsKeyword():
    with pytest.raises(CodeIntelligenceError):
        query("value = 1", "rename", 1, 2, newName="for")


def testRenameRejectsExternalDefinition():
    with pytest.raises(CodeIntelligenceError):
        query("print(1)", "rename", 1, 2, newName="write")


def testAnalysisHttpBoundary(tmp_path):
    from types import SimpleNamespace

    from fastapi import FastAPI
    from fastapi.testclient import TestClient

    from codaro.api.documentRouter import createDocumentRouter
    from codaro.api.errors import ApiError, apiErrorHandler

    app = FastAPI()
    app.add_exception_handler(ApiError, apiErrorHandler)
    app.include_router(createDocumentRouter(SimpleNamespace(workspaceRoot=tmp_path)))
    with TestClient(app) as client:
        request = {
            "files": [{"path": "sample.py", "source": "value = 1\nvalue"}],
            "path": "sample.py", "line": 2, "character": 3,
            "operation": "definition", "version": "http-revision",
        }
        response = client.post("/api/document/analyze", json=request)
        assert response.status_code == 200
        assert response.json()["version"] == "http-revision"
        assert response.json()["locations"][0]["line"] == 1
        response = client.post("/api/document/analyze", json={**request, "path": "../secret.py"})
        assert response.status_code == 400
