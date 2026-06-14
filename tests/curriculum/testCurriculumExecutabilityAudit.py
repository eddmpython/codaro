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


def testAuditLessonReclassifiesCredentialErrorAsRuntimeOther() -> None:
    audit = loadAudit()
    content = textwrap.dedent(
        """
        meta:
          packages: []
        sections:
          - id: call
            snippet: |
              raise TypeError("Could not resolve authentication method. Expected one of api_key, auth_token")
        """
    ).lstrip()
    path = writeLesson(audit, "_unit_cred.yaml", content)
    try:
        cats = auditCategories(audit, path)
    finally:
        path.unlink(missing_ok=True)

    # Missing API key is an environment gap, not a content defect — must NOT be a real-bug.
    assert cats[("call", "snippet")] == "runtime-other"


def testIterExecutableCodeBlocksFlattensAndFilters() -> None:
    audit = loadAudit()
    blocks = [
        {"type": "code", "content": "a = 1"},                       # python (default lang) → keep
        {"type": "code", "language": "shell", "content": "ls"},     # shell → drop
        {"type": "text", "content": "prose"},                       # not code → drop
        {"type": "expansion", "code": "b = 2", "blocks": [
            {"type": "code", "content": "c = 3"},
        ]},
        {"type": "code", "language": "python", "content": "   "},   # blank content → drop
    ]
    found = audit.iterExecutableCodeBlocks(blocks)
    codes = [code for _label, code in found]
    assert codes == ["a = 1", "b = 2", "c = 3"]


def testAuditLessonExecutesCodeBlockAndCatchesBug() -> None:
    audit = loadAudit()
    content = textwrap.dedent(
        """
        meta:
          packages: []
        sections:
          - id: blk
            snippet: |
              x = 1
            blocks:
              - type: code
                content: |
                  undefined_block_name + 1
        """
    ).lstrip()
    path = writeLesson(audit, "_unit_block_bug.yaml", content)
    try:
        cats = auditCategories(audit, path)
    finally:
        path.unlink(missing_ok=True)

    # snippet runs clean; the code block's NameError is surfaced as a real-bug (not masked).
    assert cats[("blk", "snippet")] == "ok"
    assert cats[("blk", "block[0]")] == "real-bug"


def testAuditLessonSkipsShellAndStarterBlankBlocks() -> None:
    audit = loadAudit()
    content = textwrap.dedent(
        """
        meta:
          packages: []
        sections:
          - id: blk
            snippet: |
              y = 2
            blocks:
              - type: code
                language: shell
                content: |
                  echo hi
              - type: code
                content: |
                  z = ___
        """
    ).lstrip()
    path = writeLesson(audit, "_unit_block_skip.yaml", content)
    try:
        cats = auditCategories(audit, path)
    finally:
        path.unlink(missing_ok=True)

    # No block result at all: shell is a non-python language, the second is a blank starter cell.
    assert not [key for key in cats if key[0] == "blk" and key[1].startswith("block")]


def testAuditLessonExecutesStarterCodeAndCatchesBrokenExercise() -> None:
    audit = loadAudit()
    # The sklearn/polars class: a complete (blank-free) starterCode the learner actually runs,
    # referencing a helper the snippet never defines. solution-only audits miss it because the
    # solution is a clean snippet copy and check.type is noError on a different assignment.
    content = textwrap.dedent(
        """
        meta:
          packages: []
        sections:
          - id: workflow
            snippet: |
              riskPipeline = "ready"
            exercise:
              starterCode: |
                model = fitRiskModel(riskPipeline)
              solution: |
                riskPipeline = "ready"
        """
    ).lstrip()
    path = writeLesson(audit, "_unit_starter_bug.yaml", content)
    try:
        cats = auditCategories(audit, path)
    finally:
        path.unlink(missing_ok=True)

    assert cats[("workflow", "snippet")] == "ok"
    assert cats[("workflow", "solution")] == "ok"
    # The learner-facing starterCode hits the undefined helper → real-bug, no longer invisible.
    assert cats[("workflow", "starterCode")] == "real-bug"


def testAuditLessonSkipsBlankStarterCode() -> None:
    audit = loadAudit()
    # A starterCode with the "___" blank is unfinished fill-in-the-gap code, not a contract to
    # run — the solution carries the canonical answer. It must not be executed/flagged.
    content = textwrap.dedent(
        """
        meta:
          packages: []
        sections:
          - id: fill
            snippet: |
              total = 10
            exercise:
              starterCode: |
                answer = total + ___
              solution: |
                answer = total + 5
        """
    ).lstrip()
    path = writeLesson(audit, "_unit_starter_blank.yaml", content)
    try:
        cats = auditCategories(audit, path)
    finally:
        path.unlink(missing_ok=True)

    assert cats[("fill", "solution")] == "ok"
    assert ("fill", "starterCode") not in cats


def testAuditLessonStarterCodeSeesSnippetNamespace() -> None:
    audit = loadAudit()
    # A blank-free starterCode that leans on a name the section snippet defined is legitimate in
    # the notebook model (snippets feed the cumulative namespace). It must NOT false-positive.
    content = textwrap.dedent(
        """
        meta:
          packages: []
        sections:
          - id: build
            snippet: |
              scratchDir = "/tmp/x"
            exercise:
              starterCode: |
                target = scratchDir + "/out.txt"
              solution: |
                scratchDir = "/tmp/x"
        """
    ).lstrip()
    path = writeLesson(audit, "_unit_starter_ns.yaml", content)
    try:
        cats = auditCategories(audit, path)
    finally:
        path.unlink(missing_ok=True)

    assert cats[("build", "starterCode")] == "ok"


def testAuditLessonExpansionBlockReusesSectionNamespace() -> None:
    audit = loadAudit()
    content = textwrap.dedent(
        """
        meta:
          packages: []
        sections:
          - id: blk
            snippet: |
              base = 10
            blocks:
              - type: expansion
                title: mission
                blocks:
                  - type: code
                    content: |
                      result = base + 5
                      assert result == 15
        """
    ).lstrip()
    path = writeLesson(audit, "_unit_block_ns.yaml", content)
    try:
        cats = auditCategories(audit, path)
    finally:
        path.unlink(missing_ok=True)

    # The expansion's nested code sees `base` from the section snippet namespace copy.
    assert cats[("blk", "block[0].blocks[0]")] == "ok"
