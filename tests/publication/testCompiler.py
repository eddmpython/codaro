from __future__ import annotations

from pathlib import Path

import pytest

from codaro.document.models import AppConfig, BlockConfig, CodaroDocument, RuntimeConfig
from codaro.document.percentFormat import writePercentDocument
from codaro.publication import compileDocument, compileExecutableUnit


def _document(
    blocks: list[tuple[str, str]],
    *,
    entries: list[str] | None = None,
    packages: list[str] | None = None,
    statePolicy: str = "perSession",
) -> CodaroDocument:
    return CodaroDocument(
        id="doc-test",
        title="compiler-fixture",
        blocks=[BlockConfig(id=blockId, type="code", content=content) for blockId, content in blocks],
        runtime=RuntimeConfig(packages=packages or []),
        app=AppConfig(
            title="compiler-fixture",
            entryBlockIds=entries or [blocks[-1][0]],
            statePolicy=statePolicy,
        ),
    )


def _compile(document: CodaroDocument, root: Path, packageLock: dict | None = None):
    source = writePercentDocument(document)
    return compileExecutableUnit(
        document,
        document.app.entryBlockIds[0],
        sourcePath=root / "app.py",
        sourceText=source,
        workspaceRoot=root,
        packageLock=packageLock,
    )


def testBrowserUnitUsesReactiveDependencyClosureAndStableManifest(tmp_path: Path) -> None:
    document = _document(
        [
            ("source", "values = [1, 2, 3]"),
            ("unused", "other = 99"),
            ("entry", "total = sum(values)\nprint(total)"),
        ]
    )
    first = _compile(document, tmp_path)
    second = _compile(document, tmp_path)

    assert first.targetDecision.selected == "browser"
    assert first.unit["dependencyBlockIds"] == ["source"]
    assert first.unit["runtimeTarget"] == "browser"
    assert first.unit["sourceSpan"]["path"] == "app.py"
    assert first.unit["sourceSpan"]["startLine"] > 1
    assert first.manifestHash == second.manifestHash
    assert first.sourceRevision.revisionHash == second.sourceRevision.revisionHash


def testRelativeReadBecomesHashedBrowserAssetAndChangesManifest(tmp_path: Path) -> None:
    asset = tmp_path / "data.csv"
    asset.write_text("name,value\na,1\n", encoding="utf-8")
    document = _document([("entry", "from pathlib import Path\ntext = Path('data.csv').read_text()")])

    first = _compile(document, tmp_path)
    asset.write_text("name,value\na,2\n", encoding="utf-8")
    second = _compile(document, tmp_path)

    assert first.targetDecision.selected == "browser"
    assert set(first.unit["assetHashes"]) == {"data.csv"}
    assert first.unit["assetHashes"] != second.unit["assetHashes"]
    assert first.manifestHash != second.manifestHash


def testPathOpenInDependencyClosureBecomesHashedBrowserAsset(tmp_path: Path) -> None:
    data = tmp_path / "data"
    data.mkdir()
    (data / "sales.csv").write_text("region,amount\n서울,10\n", encoding="utf-8")
    document = _document([
        (
            "load-sales",
            "from pathlib import Path\n"
            "with Path('data/sales.csv').open(encoding='utf-8', newline='') as source:\n"
            "    rows = source.read().splitlines()\n"
            "del source",
        ),
        ("entry", "row_count = len(rows)"),
    ])

    result = _compile(document, tmp_path)

    assert result.targetDecision.selected == "browser"
    assert result.unit["dependencyBlockIds"] == ["load-sales"]
    assert result.unit["effects"]["filesystemRead"] == ["data/sales.csv"]
    assert set(result.unit["assetHashes"]) == {"data/sales.csv"}


def testPathOpenWriteRequiresServer(tmp_path: Path) -> None:
    document = _document([
        ("entry", "from pathlib import Path\nPath('result.txt').open(mode='w').write('ok')"),
    ])

    result = _compile(document, tmp_path)

    assert result.targetDecision.selected == "server"
    assert result.unit["effects"]["filesystemWrite"] == ["result.txt"]
    assert "FILESYSTEM_WRITE_REQUIRES_SERVER" in {item["code"] for item in result.unit["diagnostics"]}


def testSensitiveFileCannotBecomeBrowserPublicationAsset(tmp_path: Path) -> None:
    (tmp_path / ".env").write_text("SERVICE_TOKEN=secret", encoding="utf-8")
    document = _document([("entry", "from pathlib import Path\nsecret = Path('.env').read_text()")])

    result = _compile(document, tmp_path)

    assert result.targetDecision.selected == "blocked"
    assert result.unit["assetHashes"] == {}
    assert "SENSITIVE_ASSET_BLOCKED" in {item["code"] for item in result.unit["diagnostics"]}


@pytest.mark.parametrize(
    ("code", "expectedTarget", "reasonCode"),
    [
        ("import os\nvalue = os.getenv('SERVICE_TOKEN')", "server", "SECRET_REQUIRES_SERVER"),
        ("import requests\nvalue = requests.get('https://example.com/data')", "server", "NETWORK_REQUIRES_SERVER"),
        ("open('result.txt', 'w').write('ok')", "server", "FILESYSTEM_WRITE_REQUIRES_SERVER"),
        ("import subprocess\nsubprocess.run(['python', '-V'])", "local", "PROCESS_REQUIRES_LOCAL"),
        ("import tkinter\nroot = tkinter.Tk()", "local", "GUI_REQUIRES_LOCAL"),
        ("value = eval('1 + 1')", "blocked", "DYNAMIC_CODE_BLOCKED"),
        ("import importlib\nmodule = importlib.import_module(name)", "blocked", "DYNAMIC_CODE_BLOCKED"),
        ("def broken(:\n    pass", "blocked", "PYTHON_SYNTAX_ERROR"),
    ],
)
def testTargetDecisionNeverSilentlyPassesUnsupportedCapability(
    tmp_path: Path,
    code: str,
    expectedTarget: str,
    reasonCode: str,
) -> None:
    result = _compile(_document([("entry", code)]), tmp_path)

    assert result.targetDecision.selected == expectedTarget
    diagnostic = next(item for item in result.unit["diagnostics"] if item["code"] == reasonCode)
    assert diagnostic["blockId"] == "entry"
    assert diagnostic["sourceSpan"]["startLine"] >= result.unit["sourceSpan"]["startLine"]
    assert diagnostic["message"]


def testWheelSmokeControlsBrowserServerAndLocalTargets(tmp_path: Path) -> None:
    document = _document([("entry", "import sample_pkg\nvalue = sample_pkg.run()")], packages=["sample-pkg==1.0"])
    digest = "sha256-" + "a" * 64

    browser = _compile(
        document, tmp_path, {"sample-pkg": {"wheelHash": digest, "tags": ["py3-none-any"], "browserSmoke": True}}
    )
    server = _compile(
        document,
        tmp_path,
        {"sample-pkg": {"wheelHash": digest, "tags": ["cp312-manylinux_x86_64"], "serverSmoke": True}},
    )
    local = _compile(document, tmp_path, {"sample-pkg": {"wheelHash": digest, "tags": ["cp312-win_amd64"]}})

    assert browser.targetDecision.selected == "browser"
    assert server.targetDecision.selected == "server"
    assert local.targetDecision.selected == "local"
    assert any(item["code"] == "NATIVE_WHEEL_REQUIRES_LOCAL" for item in local.unit["diagnostics"])


def testInvalidPackageLockBlocksCompilation(tmp_path: Path) -> None:
    document = _document([("entry", "import sample_pkg")], packages=["sample-pkg"])
    result = _compile(
        document, tmp_path, {"sample-pkg": {"wheelHash": "mutable", "tags": ["py3-none-any"], "browserSmoke": True}}
    )

    assert result.targetDecision.selected == "blocked"
    assert {item["code"] for item in result.unit["diagnostics"]} >= {"PACKAGE_LOCK_INVALID"}


def testSharedStateAndCrossCellMutationCannotRemainBrowserTarget(tmp_path: Path) -> None:
    shared = _document([("entry", "value = 1")], statePolicy="shared")
    mutation = _document(
        [
            ("source", "values = [1]"),
            ("entry", "values[0] = 2"),
        ]
    )

    sharedResult = _compile(shared, tmp_path)
    mutationResult = _compile(mutation, tmp_path)

    assert sharedResult.targetDecision.selected == "server"
    assert "SHARED_STATE_REQUIRES_SERVER" in {item["code"] for item in sharedResult.unit["diagnostics"]}
    assert mutationResult.targetDecision.selected == "local"
    assert "CROSS_CELL_MUTATION_REQUIRES_LOCAL" in {item["code"] for item in mutationResult.unit["diagnostics"]}


def testCycleAndMultipleDefinitionBlockBuild(tmp_path: Path) -> None:
    cycle = _document(
        [
            ("left", "left = right + 1"),
            ("right", "right = left + 1"),
        ],
        entries=["right"],
    )
    duplicate = _document(
        [
            ("first", "value = 1"),
            ("second", "value = 2"),
            ("entry", "print(value)"),
        ]
    )

    cycleResult = _compile(cycle, tmp_path)
    duplicateResult = _compile(duplicate, tmp_path)

    assert cycleResult.targetDecision.selected == "blocked"
    assert "REACTIVE_CYCLE_BLOCKED" in {item["code"] for item in cycleResult.unit["diagnostics"]}
    assert duplicateResult.targetDecision.selected == "blocked"
    assert "MULTIPLE_DEFINITION_BLOCKED" in {item["code"] for item in duplicateResult.unit["diagnostics"]}


def testDefinitionAfterUseBlocksPublicationEvenWithoutCycle(tmp_path: Path) -> None:
    document = _document(
        [
            ("entry", "result = source + 1"),
            ("source", "source = 41"),
        ],
        entries=["entry"],
    )

    result = _compile(document, tmp_path)

    assert result.targetDecision.selected == "blocked"
    assert "DEFINITION_ORDER_BLOCKED" in {
        item["code"] for item in result.unit["diagnostics"]
    }


def testDocumentReportUsesMostRestrictiveEntryAndDoesNotMutateSource(tmp_path: Path) -> None:
    document = _document(
        [
            ("browser", "value = 1"),
            ("local", "import os\nos.system('echo ok')"),
        ],
        entries=["browser", "local"],
    )
    before = document.model_dump_json()
    source = writePercentDocument(document)

    report = compileDocument(
        document,
        sourcePath=tmp_path / "app.py",
        sourceText=source,
        workspaceRoot=tmp_path,
    )

    assert report.runtimeTarget == "local"
    assert report.entryBlockIds == ("browser", "local")
    assert len(report.units) == 2
    assert document.model_dump_json() == before
