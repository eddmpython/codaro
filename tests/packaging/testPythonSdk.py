from __future__ import annotations

import importlib.metadata
import importlib.util
from pathlib import Path
import sys
import tomllib

import codaro
import codaro.server as serverModule


ROOT = Path(__file__).resolve().parents[2]
BUILDER_PATH = ROOT / "docs" / "skills" / "ops" / "tools" / "buildPythonDistribution.py"
VERIFIER_PATH = ROOT / "tests" / "packaging" / "verifyPythonSdk.py"
EXPECTED_PUBLIC_API = {
    "__version__",
    "accordion",
    "App",
    "callout",
    "createServerApp",
    "hstack",
    "html",
    "main",
    "md",
    "markdown",
    "plain",
    "sidebar",
    "stat",
    "state",
    "stop",
    "tabs",
    "text",
    "tool",
    "ui",
    "vstack",
}


def loadModule(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"unable to load module: {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


BUILDER = loadModule("codaro_python_distribution_builder_test", BUILDER_PATH)


def testRootPublicApiIsExactAndUsesCanonicalServerFactory() -> None:
    assert set(codaro.__all__) == EXPECTED_PUBLIC_API
    assert len(codaro.__all__) == len(EXPECTED_PUBLIC_API)
    assert codaro.createServerApp is serverModule.createServerApp
    assert codaro.__version__ == importlib.metadata.version("codaro")
    assert codaro.App().blocks == []
    assert callable(codaro.ui.number)


def testVersionFallbackCatchesOnlyMissingDistributionMetadata() -> None:
    source = (ROOT / "src" / "codaro" / "__init__.py").read_text(encoding="utf-8")
    assert "except PackageNotFoundError:" in source
    assert "except Exception" not in source
    assert 'version("codaro")' in source


def testBuildContextStagesCurrentSourceWebBuildAndRootCurriculaWithoutMutation(tmp_path: Path) -> None:
    workspaceCurricula = ROOT / "src" / "codaro" / "curricula"
    stateBefore = BUILDER.directoryState(workspaceCurricula)
    contextRoot = tmp_path / "context"
    summary = BUILDER.stagePythonBuildContext(contextRoot)
    stateAfter = BUILDER.directoryState(workspaceCurricula)

    assert stateAfter == stateBefore
    assert (contextRoot / "src" / "codaro" / "webBuild" / "index.html").is_file()
    assert (contextRoot / "src" / "codaro" / "webBuild" / "_app").is_dir()
    assert (contextRoot / "src" / "codaro" / "curricula" / "python" / "__init__.py").is_file()
    stagedLessons = [
        path
        for path in (contextRoot / "src" / "codaro" / "curricula" / "python").rglob("*.yaml")
        if path.name != "schema.yaml"
    ]
    assert len(stagedLessons) == summary["lessonCount"]
    assert summary["lessonCount"] == 472
    assert summary["webAssetCount"] > 1
    assert not list(contextRoot.rglob("*.pyc"))
    assert not any(path.name == "__pycache__" for path in contextRoot.rglob("*"))


def testReferenceProductsConsumeOnlyRootAuthoringImports() -> None:
    expectedImports = {
        "browser-calculator": "from codaro import ui",
        "csv-dashboard": "from codaro import ui",
        "snapshot-report": "from codaro import hstack, stat",
        "server-secret-app": "from codaro import ui",
    }
    for productId, expectedImport in expectedImports.items():
        source = (ROOT / "examples" / "apps" / productId / "app.py").read_text(encoding="utf-8")
        assert expectedImport in source
        assert "codaro.outputDescriptor" not in source


def testPackageMetadataNamesIdeEmbeddingPublicationAndSdk() -> None:
    with (ROOT / "pyproject.toml").open("rb") as handle:
        project = tomllib.load(handle)["project"]
    assert "Python IDE" in project["description"]
    assert "publication" in project["description"].lower()
    assert {"embedding", "ide", "publication"}.issubset(project["keywords"])
    assert project["version"].startswith("0.0.")


def testReleaseWorkflowsUseTheSameNonDestructiveBuilderAndVerifier() -> None:
    workflowPaths = (
        ROOT / ".github" / "workflows" / "publish.yml",
        ROOT / ".github" / "workflows" / "publish.yaml",
        ROOT / ".github" / "workflows" / "product-release.yml",
    )
    for path in workflowPaths:
        source = path.read_text(encoding="utf-8")
        assert "buildPythonDistribution.py" in source
        assert "verifyPythonSdk.py" in source
        assert "rm -rf src/codaro/curricula" not in source
        assert "cp -r curricula src/codaro/curricula" not in source
    assert workflowPaths[0].read_bytes() == workflowPaths[1].read_bytes()


def testInstalledVerifierCoversWheelUvAddUvxMountAndResources() -> None:
    source = VERIFIER_PATH.read_text(encoding="utf-8")
    for expected in (
        "verifyDirectWheelInstall",
        "verifyUvAddInstall",
        "TemporaryDirectory(prefix=\"codaro-sdk-uv-add-\")",
        "verifyUvx",
        "host.mount('/codaro', createServerApp",
        "packageRoot / 'curricula' / 'python'",
        "artifactOwnership.schema.json",
        "referenceProducts.schema.json",
        "plainPythonReference",
        "localWheelContent",
        "workspaceMetadataBefore",
    ):
        assert expected in source
    assert 'SCRATCH_ROOT / "uv-add"' not in source


def testReadmeSeparatesLibraryCliAndLauncherChannels() -> None:
    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    assert "uv add codaro" in readme
    assert "uvx codaro --help" in readme
    assert "from codaro import App, createServerApp, ui" in readme
    assert "GitHub Release manifest가 고정한 exact wheel" in readme
