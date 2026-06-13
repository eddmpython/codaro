from __future__ import annotations

import importlib.util
import sys
import textwrap
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
AUDIT_PATH = ROOT / "tests" / "curriculum" / "auditCurriculumExecutability.py"


def loadAudit():
    spec = importlib.util.spec_from_file_location("codaroCurriculumExecutabilityAudit", AUDIT_PATH)
    assert spec is not None
    assert spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def writeLesson(audit, name: str, content: str) -> Path:
    scratch = audit.ROOT / "output" / "test-runner" / "curriculum-executability" / "scratch"
    scratch.mkdir(parents=True, exist_ok=True)
    path = scratch / name
    path.write_text(content, encoding="utf-8")
    return path


def auditCategories(audit, path: Path) -> dict[tuple[str, str], str]:
    return {(result["section"], result["kind"]): result["category"] for result in audit.auditLesson(path)}


def testPackageFromMissingDetailMapsImportNamesCaseInsensitively() -> None:
    audit = loadAudit()

    # PIL was the regression: the import name is uppercase but the mapping key was lowercase,
    # so the pillow distribution was never matched and declared pillow looked undeclared.
    assert audit.packageFromMissingDetail("ModuleNotFoundError: PIL") == "pillow"
    assert audit.packageFromMissingDetail("ModuleNotFoundError: PIL.Image") == "pillow"
    assert audit.packageFromMissingDetail("ModuleNotFoundError: OpenSSL") == "pyopenssl"
    assert audit.packageFromMissingDetail("ModuleNotFoundError: Crypto") == "pycryptodome"
    assert audit.packageFromMissingDetail("ModuleNotFoundError: cv2") == "opencv-python"


def testPackageFromMissingDetailFallsBackToImportName() -> None:
    audit = loadAudit()

    assert audit.packageFromMissingDetail("ModuleNotFoundError: numpy") == "numpy"
    assert audit.packageFromMissingDetail("AssertionError: boom") is None


def testDeclaredMissingModuleDetectsSubprocessPytestImportError() -> None:
    audit = loadAudit()
    detail = (
        "AssertionError: \nERRORS\n"
        "E   ModuleNotFoundError: No module named 'playwright'\n1 error in 0.59s"
    )

    assert audit.declaredMissingModule(detail, {"playwright", "pytest"}) == "playwright"


def testDeclaredMissingModuleIgnoresUndeclaredModule() -> None:
    audit = loadAudit()
    detail = "E   ModuleNotFoundError: No module named 'playwright'"

    # Not declared by the lesson → not an environment skip; leave it a hard failure.
    assert audit.declaredMissingModule(detail, {"pytest"}) is None


def testDeclaredMissingModuleIgnoresGenuineBug() -> None:
    audit = loadAudit()

    assert audit.declaredMissingModule("NameError: name 'x' is not defined", {"pandas"}) is None


def testAuditLessonNeverFlagsDeclaredPillowAsUndeclared() -> None:
    audit = loadAudit()
    content = textwrap.dedent(
        """
        meta:
          packages: [pillow]
        sections:
          - id: load
            snippet: |
              from PIL import Image
              Image.new("RGB", (1, 1))
        """
    ).lstrip()
    path = writeLesson(audit, "_unit_pil_declared.yaml", content)
    try:
        cats = auditCategories(audit, path)
    finally:
        path.unlink(missing_ok=True)

    # Robust to whether Pillow is installed: ok when present, missing-package when not —
    # but never the false undeclared-package the case bug produced.
    assert cats[("load", "snippet")] in ("ok", "missing-package")


def testAuditLessonDeclaredMissingPackageIsMissingNotUndeclared() -> None:
    audit = loadAudit()
    content = textwrap.dedent(
        """
        meta:
          packages: [codaro-fake-teaching-pkg]
        sections:
          - id: load
            snippet: |
              import codaro_fake_teaching_pkg
        """
    ).lstrip()
    path = writeLesson(audit, "_unit_declared_missing.yaml", content)
    try:
        cats = auditCategories(audit, path)
    finally:
        path.unlink(missing_ok=True)

    assert cats[("load", "snippet")] == "missing-package"


def testAuditLessonUndeclaredMissingPackageIsFlagged() -> None:
    audit = loadAudit()
    content = textwrap.dedent(
        """
        meta:
          packages: []
        sections:
          - id: load
            snippet: |
              import codaro_fake_teaching_pkg
        """
    ).lstrip()
    path = writeLesson(audit, "_unit_undeclared_missing.yaml", content)
    try:
        cats = auditCategories(audit, path)
    finally:
        path.unlink(missing_ok=True)

    assert cats[("load", "snippet")] == "undeclared-package"


def testAuditLessonReclassifiesMaskedDeclaredImportErrorAsMissing() -> None:
    audit = loadAudit()
    content = textwrap.dedent(
        """
        meta:
          packages: [codaro-fake-teaching-pkg]
        sections:
          - id: run
            snippet: |
              raise AssertionError("E   ModuleNotFoundError: No module named 'codaro_fake_teaching_pkg'")
        """
    ).lstrip()
    path = writeLesson(audit, "_unit_masked_missing.yaml", content)
    try:
        cats = auditCategories(audit, path)
    finally:
        path.unlink(missing_ok=True)

    assert cats[("run", "snippet")] == "missing-package"


def testAuditLessonKeepsGenuineRealBug() -> None:
    audit = loadAudit()
    content = textwrap.dedent(
        """
        meta:
          packages: []
        sections:
          - id: bug
            snippet: |
              undefined_name_here + 1
        """
    ).lstrip()
    path = writeLesson(audit, "_unit_real_bug.yaml", content)
    try:
        cats = auditCategories(audit, path)
    finally:
        path.unlink(missing_ok=True)

    assert cats[("bug", "snippet")] == "real-bug"
