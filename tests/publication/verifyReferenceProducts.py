from __future__ import annotations

from datetime import UTC, datetime
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "src"))
REPORT_DIR = ROOT / "output/test-runner/reference-products"
REPORT_PATH = REPORT_DIR / "reference-products-machine.json"
MANIFEST_PATH = ROOT / "examples/apps/referenceProducts.json"
REQUIRED_PUBLIC_CLAIMS = (
    "같은 Python 셀을 앱, 자동화, 검증된 배포 산출물로 이어갑니다.",
    "provider 없이 folder, ZIP, self-host 산출물까지 만들고 검증할 수 있습니다.",
)


def utcTimestamp() -> str:
    return datetime.now(tz=UTC).strftime("%Y-%m-%dT%H:%M:%SZ")


def gitHead() -> str:
    completed = subprocess.run(
        ["git", "rev-parse", "HEAD"],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    return completed.stdout.strip()


def main() -> int:
    from codaro.document import loadDocument
    from codaro.publication import compileDocument

    started = datetime.now(tz=UTC)
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    report: dict[str, object] = {
        "schemaVersion": 1,
        "gate": "reference-products",
        "phase": "machine",
        "gitHead": gitHead(),
        "startedAt": started.isoformat(),
        "status": "failed",
        "products": [],
    }
    try:
        manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        products = manifest["products"]
        if not isinstance(products, list) or len(products) != 5:
            raise AssertionError("reference product manifest는 정확히 다섯 제품이어야 합니다.")
        sourceHashesBefore = {
            str(row["id"]): hashlib.sha256((ROOT / row["sourcePath"]).read_bytes()).hexdigest()
            for row in products
        }
        productReports: list[dict[str, object]] = []
        with tempfile.TemporaryDirectory(prefix="codaro-reference-machine-") as temporary:
            scratch = Path(temporary)
            for row in products:
                productId = str(row["id"])
                source = ROOT / str(row["sourcePath"])
                document = loadDocument(str(source))
                compilation = compileDocument(
                    document,
                    sourcePath=source,
                    sourceText=source.read_text(encoding="utf-8"),
                    workspaceRoot=source.parent,
                )
                if compilation.runtimeTarget != row["runtimeTarget"]:
                    raise AssertionError(
                        f"{productId} target이 다릅니다: {compilation.runtimeTarget} != {row['runtimeTarget']}"
                    )
                productRoot = scratch / productId
                shutil.copytree(source.parent, productRoot)
                environment = dict(os.environ)
                environment["REFERENCE_API_TOKEN"] = "reference-machine-secret-canary"
                environment["PYTHONUTF8"] = "1"
                environment["PYTHONIOENCODING"] = "utf-8"
                completed = subprocess.run(
                    [sys.executable, "app.py"],
                    cwd=productRoot,
                    env=environment,
                    capture_output=True,
                    text=True,
                    encoding="utf-8",
                    timeout=60,
                )
                if completed.returncode != 0:
                    raise AssertionError(f"{productId} plain Python 실행 실패: {completed.stderr}")
                artifactPath = productRoot / "artifacts/inventory-report.json"
                productReports.append({
                    "id": productId,
                    "runtimeTarget": compilation.runtimeTarget,
                    "manifestHash": compilation.manifestHash,
                    "plainPythonExitCode": completed.returncode,
                    "sourcePreserved": hashlib.sha256(source.read_bytes()).hexdigest() == sourceHashesBefore[productId],
                    "artifactCreated": artifactPath.is_file(),
                    "diagnosticCodes": sorted({item["code"] for item in compilation.diagnostics}),
                })
        readme = (ROOT / "README.md").read_text(encoding="utf-8")
        landing = (ROOT / "landing/src/pages/home.jsx").read_text(encoding="utf-8")
        publicCopy = readme + "\n" + landing
        missingClaims = [claim for claim in REQUIRED_PUBLIC_CLAIMS if claim not in publicCopy]
        if missingClaims:
            raise AssertionError("public claim 문구가 없습니다: " + ", ".join(missingClaims))
        if any(not row["sourcePreserved"] for row in productReports):
            raise AssertionError("plain Python 검증이 reference source를 변경했습니다.")
        local = next(row for row in productReports if row["id"] == "local-file-automation")
        if local["artifactCreated"] is not True:
            raise AssertionError("Local reference product가 artifact를 만들지 못했습니다.")
        report["products"] = productReports
        report["claimBoundary"] = manifest["claimBoundary"]
        report["publicClaims"] = list(REQUIRED_PUBLIC_CLAIMS)
        report["status"] = "passed"
    except Exception as error:  # noqa: BLE001 - gate report must retain unexpected failures
        report["error"] = f"{type(error).__name__}: {error}"
    completedAt = datetime.now(tz=UTC)
    report["completedAt"] = completedAt.isoformat()
    report["durationMs"] = int((completedAt - started).total_seconds() * 1000)
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["status"] == "passed" else 1


if __name__ == "__main__":
    raise SystemExit(main())
