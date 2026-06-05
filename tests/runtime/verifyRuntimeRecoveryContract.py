from __future__ import annotations

import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]


@dataclass(frozen=True)
class Evidence:
    evidenceId: str
    relPath: str
    needles: tuple[str, ...]

    def evaluate(self) -> dict[str, Any]:
        path = ROOT / self.relPath
        if not path.exists():
            return {
                "id": self.evidenceId,
                "path": self.relPath,
                "passed": False,
                "missing": [f"missing file {self.relPath}"],
            }
        text = path.read_text(encoding="utf-8")
        missing = [needle for needle in self.needles if needle not in text]
        return {
            "id": self.evidenceId,
            "path": self.relPath,
            "passed": not missing,
            "missing": missing,
        }


EVIDENCE = (
    Evidence(
        "local-engine-worker-recovery",
        "src/codaro/runtime/localEngine.py",
        (
            "Engine worker crashed and was restarted.",
            "_workerCrashMessage",
            "EXECUTION_TIMEOUT_SECONDS",
            "ExecutionEvent(",
            "\"status\": \"error\"",
        ),
    ),
    Evidence(
        "backend-runtime-tests",
        "tests/runtime/testRuntime.py",
        (
            "testLocalEngineImportErrorDoesNotCrashWorker",
            "testLocalEngineWorkerCrashMessageSaysRestarted",
            "testLocalEngineInterruptRespawnsWorker",
            "testLocalEngineInstallPackageDelegates",
            "testLocalEngineListPackagesDelegates",
        ),
    ),
    Evidence(
        "editor-runtime-preflight",
        "tests/runtime/verifyEditorRuntimePreflight.py",
        (
            "packages-check",
            "packages-install",
            "cell-call",
            "라이브러리 준비 실패",
            "assert.deepEqual(calls.map((call) => call[0]), [\"packages-check\", \"packages-install\", \"cell-call-reactive\"])",
        ),
    ),
    Evidence(
        "editor-runtime-user-messages",
        "editor/src/lib/notebookRuntime.ts",
        (
            "runtime.cellRunFailed",
            "runtime.notebookRunFailed",
            "runtime.libraryFailed",
            "preflightRuntimePackages",
            "sessionPackagesList",
            "sessionPackageInstall",
        ),
    ),
    Evidence(
        "editor-runtime-cell-error-recovery",
        "editor/src/components/app/appPrimitives.tsx",
        (
            "data-runtime-recovery={packageError ? \"package-error\" : \"cell-error\"}",
            "system.recoverCellError.detail",
            "system.recoverCellError.title",
        ),
    ),
    Evidence(
        "editor-runtime-locale-copy",
        "editor/src/lib/localeCopy.ts",
        (
            "셀 실행 실패",
            "노트북 실행 실패",
            "라이브러리 준비 실패",
            "오류 메시지의 마지막 줄부터 확인",
            "다시 실행할 수 있습니다",
        ),
    ),
    Evidence(
        "runtime-recovery-browser",
        "tests/runtime/verifyRuntimeRecoveryPlaywright.py",
        (
            "package-failure-recovery-ok",
            "cell-failure-recovery-ok",
            "cell-call package-failure",
            "cell-call cell-failure",
        ),
    ),
    Evidence(
        "teacher-policy-recovery",
        "src/codaro/ai/teacher/toolPolicy.py",
        (
            "dependency-preflight-required",
            "packages-check",
            "packages-install",
            "cell-call",
        ),
    ),
    Evidence(
        "workloop-recovery-copy",
        "editor/src/lib/workLoop.ts",
        (
            "라이브러리 확인",
            "uv 라이브러리 설치",
            "셀 실행/검증",
            "설치 실패",
            "셀 검증 실패",
        ),
    ),
    Evidence(
        "runtime-ops-ssot",
        "docs/skills/architecture/execution-engine.md",
        (
            "packages-check → packages-install → cell-call",
            "editor-runtime-preflight",
        ),
    ),
)


def main() -> int:
    results = [evidence.evaluate() for evidence in EVIDENCE]
    failures = [
        f"{result['id']} missing {missing}"
        for result in results
        for missing in result["missing"]
    ]
    payload = {
        "gate": "runtime-recovery-contract",
        "passed": not failures,
        "evidenceCount": len(results),
        "results": results,
        "failures": failures,
    }
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if failures:
        print("FAIL: runtime recovery contract evidence is incomplete", file=sys.stderr)
        return 1
    print("ok: runtime recovery contract verified")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
