from __future__ import annotations

import base64
import hashlib
import json
from pathlib import Path
import socket
import subprocess
import sys
import time
from urllib.request import urlopen

from codaro.document import loadDocument
from codaro.proof import ProofArchive
from codaro.publication import (
    FolderDeploymentAdapter,
    ZipDeploymentAdapter,
    buildBlockEmbed,
    buildServerPublication,
    buildStaticPublication,
    compileDocument,
    deployPublication,
    verifyBlockEmbed,
    verifyPublication,
    verifyServerPublication,
)


ROOT = Path(__file__).resolve().parents[2]
EXAMPLE_ROOT = ROOT / "examples/apps"
MANIFEST_PATH = EXAMPLE_ROOT / "referenceProducts.json"
SCHEMA_PATH = ROOT / "contracts/referenceProducts.schema.json"
EXPECTED_IDS = {
    "browser-calculator",
    "csv-dashboard",
    "snapshot-report",
    "server-secret-app",
    "local-file-automation",
}


def _sri(payload: bytes) -> str:
    return "sha256-" + base64.b64encode(hashlib.sha256(payload).digest()).decode("ascii")


def _runtimeManifest(path: Path, root: str, names: list[str]) -> None:
    files = []
    for name in names:
        payload = (path.parent / root / name).read_bytes()
        files.append({
            "path": name,
            "url": f"/{root}{name}",
            "integrity": _sri(payload),
            "bytes": len(payload),
            "roles": ["engineScript"],
        })
    path.write_text(json.dumps({"version": 1, "packageRoot": f"/{root}", "files": files}), encoding="utf-8")


def _shell(root: Path) -> Path:
    shell = root / "webBuild"
    (shell / "_app").mkdir(parents=True)
    (shell / "embed").mkdir()
    (shell / "vendor/pyproc/src").mkdir(parents=True)
    (shell / "vendor/pyodide").mkdir(parents=True)
    (shell / "_app/app.js").write_text("window.referenceFixture = true", encoding="utf-8")
    (shell / "embed/codaro-block.js").write_text("customElements.define('codaro-block', class extends HTMLElement {})", encoding="utf-8")
    (shell / "vendor/pyproc/src/worker.js").write_text("self.onmessage = () => {}", encoding="utf-8")
    for name, payload in {
        "pyodide.js": b"globalThis.loadPyodide = async () => ({})",
        "pyodide.mjs": b"export const loadPyodide = async () => ({})",
        "pyodide.asm.mjs": b"export default {}",
        "pyodide.asm.wasm": b"\x00asm",
        "pyodide-lock.json": b"{}",
        "python_stdlib.zip": b"PK\x05\x06" + b"\x00" * 18,
    }.items():
        (shell / "vendor/pyodide" / name).write_bytes(payload)
    (shell / "index.html").write_text(
        '<!doctype html><html><head><title>Codaro</title></head><body><div id="root"></div></body></html>',
        encoding="utf-8",
    )
    _runtimeManifest(shell / "pyproc-assets.json", "vendor/pyproc/", ["src/worker.js"])
    _runtimeManifest(
        shell / "pyodide-assets.json",
        "vendor/pyodide/",
        [
            "pyodide.js", "pyodide.mjs", "pyodide.asm.mjs", "pyodide.asm.wasm",
            "pyodide-lock.json", "python_stdlib.zip",
        ],
    )
    return shell


def _manifest() -> dict[str, object]:
    return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))


def _products() -> list[dict[str, object]]:
    products = _manifest()["products"]
    assert isinstance(products, list)
    return products


def _row(productId: str) -> dict[str, object]:
    return next(row for row in _products() if row["id"] == productId)


def _source(row: dict[str, object]) -> Path:
    return ROOT / str(row["sourcePath"])


def testReferenceManifestIsClosedAndContainsExactlyFiveProducts() -> None:
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    manifest = _manifest()

    assert schema["additionalProperties"] is False
    assert schema["properties"]["schemaVersion"] == {"const": 1}
    assert manifest["schemaVersion"] == 1
    assert manifest["kind"] == "codaro.reference-products"
    assert {row["id"] for row in _products()} == EXPECTED_IDS
    assert len(_products()) == 5
    assert set(manifest) == {"schemaVersion", "kind", "products", "claimBoundary"}
    expectedProductFields = {
        "id", "title", "sourcePath", "runtimeTarget", "entryBlockIds", "assetPaths",
        "secretRefs", "journey", "claim",
    }
    expectedJourneyFields = {
        "plainPython", "publicSdkImports", "appProjection", "embedModes",
        "publicationSteps", "proofKinds", "claimBoundary",
    }
    assert all(set(row) == expectedProductFields for row in _products())
    assert schema["$defs"]["Journey"]["additionalProperties"] is False
    assert set(schema["$defs"]["Journey"]["required"]) == expectedJourneyFields
    assert all(set(row["journey"]) == expectedJourneyFields for row in _products())
    assert all(_source(row).is_file() for row in _products())
    assert all((ROOT / path).is_file() for row in _products() for path in row["assetPaths"])


def testEveryReferenceSourceDeclaresItsCompleteProductJourney() -> None:
    expectedImports = {
        "browser-calculator": ["ui"],
        "csv-dashboard": ["ui"],
        "snapshot-report": ["hstack", "stat"],
        "server-secret-app": ["ui"],
        "local-file-automation": [],
    }
    for row in _products():
        journey = row["journey"]
        assert journey["plainPython"] is True
        assert journey["publicSdkImports"] == expectedImports[row["id"]]
        assert journey["appProjection"] is True
        assert journey["claimBoundary"] == "machineVerified"
        assert journey["publicationSteps"][0:2] == ["build", "serve"]
        assert ("embed" in journey["publicationSteps"]) == bool(journey["embedModes"])
    assert _row("browser-calculator")["journey"]["embedModes"] == [
        "output", "interactive", "editable",
    ]


def testEveryReferenceProductRoundTripsAndCompilerMatchesDeclaredTarget() -> None:
    for row in _products():
        source = _source(row)
        document = loadDocument(str(source))
        report = compileDocument(
            document,
            sourcePath=source,
            sourceText=source.read_text(encoding="utf-8"),
            workspaceRoot=source.parent,
        )

        assert report.runtimeTarget == row["runtimeTarget"]
        assert document.app.entryBlockIds == row["entryBlockIds"]
        assert document.app.hideCode is True
        assert source.read_text(encoding="utf-8").startswith("# /// codaro-app")
        assert all(blockId in {block.id for block in document.blocks} for blockId in row["entryBlockIds"])
        detectedSecrets = sorted({
            secret
            for unit in report.units
            for secret in unit.unit["effects"]["secretRefs"]
        })
        assert detectedSecrets == row["secretRefs"]


def testBrowserReferencesBuildDeployAndCalculatorEmbedsWithoutSourceMutation(tmp_path: Path) -> None:
    archive = ProofArchive(tmp_path / "proof.sqlite3")
    shell = _shell(tmp_path)
    for row in (item for item in _products() if item["runtimeTarget"] == "browser"):
        source = _source(row)
        sourceBefore = source.read_bytes()
        output = tmp_path / str(row["id"])
        first = buildStaticPublication(source, output, webBuildRoot=shell)
        second = buildStaticPublication(source, output, webBuildRoot=shell)
        assert first.bundleHash == second.bundleHash
        assert second.reused is True
        assert verifyPublication(output).bundleHash == first.bundleHash
        assert source.read_bytes() == sourceBefore

        folder = deployPublication(
            output,
            FolderDeploymentAdapter(tmp_path / f"{row['id']}-folder"),
            proofArchive=archive,
            verifiedAt="2026-08-10T00:00:00+00:00",
        )
        zipped = deployPublication(
            output,
            ZipDeploymentAdapter(tmp_path / f"{row['id']}.zip"),
            verifiedAt="2026-08-10T00:00:00+00:00",
        )
        assert folder.target == "folder"
        assert zipped.target == "zip"

    calculator = _row("browser-calculator")
    embed = buildBlockEmbed(
        _source(calculator),
        tmp_path / "calculator-embed",
        entryBlockId="total-view",
        defaultMode="interactive",
        webBuildRoot=shell,
    )
    verifiedEmbed = verifyBlockEmbed(embed.outputRoot)
    assert verifiedEmbed.manifest["entryBlockId"] == "total-view"
    assert verifiedEmbed.manifest["dependencyBlockIds"] == ["price-widget", "quantity-widget"]
    assert archive.summary()["receipts"] == 9


def testServerReferenceBuildKeepsSecretOutOfBundle(tmp_path: Path) -> None:
    row = _row("server-secret-app")
    source = _source(row)
    built = buildServerPublication(source, tmp_path / "server", webBuildRoot=_shell(tmp_path))
    verified = verifyServerPublication(built.outputRoot)
    bundleBytes = b"\n".join(path.read_bytes() for path in verified.bundleRoot.rglob("*") if path.is_file())

    assert verified.bundleHash == built.bundleHash
    assert verified.manifest["runtime"]["secretRefs"] == ["REFERENCE_API_TOKEN"]
    assert b"reference-secret-canary" not in bundleBytes
    assert b"REFERENCE_API_TOKEN" in bundleBytes


def testReferenceClaimsStayInsideMachineVerifiedBoundary() -> None:
    manifest = _manifest()
    boundary = manifest["claimBoundary"]
    assert isinstance(boundary, dict)
    machineVerified = boundary["machineVerified"]
    notVerified = boundary["notVerified"]
    assert "공용 인터넷 URL의 uptime, DNS, TLS" in notVerified
    assert "인간 학습 효과의 인과 검증" in notVerified
    assert "built wheel을 빈 환경에 설치한 public Python SDK와 CLI" in machineVerified
    assert any("plain Python 실행" in claim for claim in machineVerified)
    assert any("전체 앱 publication" in claim for claim in machineVerified)
    assert any("output, interactive, editable embed" in claim for claim in machineVerified)
    assert any("operational proof 승격" in claim for claim in machineVerified)
    assert all("학습 효과가 입증" not in str(row["claim"]) for row in _products())
    assert all("공용 인터넷에 배포" not in claim for claim in machineVerified)

    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    for required in (
        "Codaro형 local-first Python IDE",
        "전체 앱",
        "부분 임베딩",
        "output, interactive, editable",
        "공용 URL의 DNS, TLS, uptime",
    ):
        assert required in readme
    for unsupported in (
        "범용 IDE의 모든 기능",
        "hideCode로 source를 보호",
        "공용 인터넷 uptime을 보장",
    ):
        assert unsupported not in readme


def testReadmePublicationQuickstartRunsWithActualCli(tmp_path: Path) -> None:
    source = _source(_row("browser-calculator"))
    output = tmp_path / "browser-calculator"
    archive = tmp_path / "browser-calculator.zip"
    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    assert "--target static" not in readme

    _cli("inspect", str(source))
    _cli("build", str(source), "--target", "browser", "--output", str(output), "--json")
    _cli("verify", str(output), "--target", "browser", "--json")

    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        port = int(probe.getsockname()[1])
    process = subprocess.Popen(
        [
            sys.executable,
            "-X",
            "utf8",
            "-m",
            "codaro.cli",
            "serve",
            str(output),
            "--host",
            "127.0.0.1",
            "--port",
            str(port),
            "--no-browser",
        ],
        cwd=ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding="utf-8",
    )
    try:
        deadline = time.monotonic() + 30
        while time.monotonic() < deadline:
            if process.poll() is not None:
                stdout, stderr = process.communicate(timeout=5)
                raise AssertionError(stderr or stdout)
            try:
                with urlopen(f"http://127.0.0.1:{port}/", timeout=1) as response:
                    assert response.status == 200
                    break
            except OSError:
                time.sleep(0.1)
        else:
            raise AssertionError("README serve command가 30초 안에 열리지 않았습니다.")
    finally:
        process.terminate()
        try:
            process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=5)

    _cli("deploy", str(output), "--target", "zip", "--output", str(archive), "--json")
    assert archive.is_file()


def _cli(*arguments: str) -> subprocess.CompletedProcess[str]:
    completed = subprocess.run(
        [sys.executable, "-X", "utf8", "-m", "codaro.cli", *arguments],
        cwd=ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=120,
        check=False,
    )
    assert completed.returncode == 0, completed.stderr or completed.stdout
    return completed
