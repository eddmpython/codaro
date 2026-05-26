from __future__ import annotations

from pathlib import Path
import zipfile

from codaro.share import PackService

REPO_ROOT = Path(__file__).resolve().parents[1]


def writeSamplePack(root: Path) -> None:
    lessonDir = root / "curricula" / "python" / "sample"
    automationDir = root / "automations"
    lessonDir.mkdir(parents=True)
    automationDir.mkdir(parents=True)
    (root / "codaroPack.yaml").write_text(
        """
kind: codaroPack
specVersion: 1
id: example.sample-pack
version: 0.1.0
title: Sample Pack
author: tester
license: MIT
contents:
  curricula:
    - path: curricula/python/sample/00_intro.yaml
  automations:
    - path: automations/daily.py
packages:
  - pandas
permissions:
  filesystem: read
""".strip()
        + "\n",
        encoding="utf-8",
    )
    (lessonDir / "00_intro.yaml").write_text(
        """
meta:
  id: sample.intro
  title: Sample Intro
  category: sample
  packages:
    - pandas
tags:
  - sample
intro:
  direction: 로컬 pack import를 검증한다.
sections:
  - id: first-run
    title: 첫 실행
    goal: 작은 코드를 실행한다.
    why: 설치된 pack이 학습 문서로 전개되는지 본다.
    explanation: print와 assert로 검증한다.
    snippet: |
      value = 1 + 1
      value
    exercise:
      prompt: value를 2로 만드세요.
      starterCode: |
        value = 1 + 1
      solution: |
        value = 2
      hints:
        - 1 + 1은 2입니다.
      check:
        variable: value
    check:
      noError: 오류 없이 실행되어야 한다.
""".strip()
        + "\n",
        encoding="utf-8",
    )
    (automationDir / "daily.py").write_text(
        """
# %% [markdown]
# Daily

# %% [automation]
DRY_RUN = True

print("dry run")
""".lstrip(),
        encoding="utf-8",
    )


def testSharePackInspectInstallAndLoadCurriculum(tmp_path: Path) -> None:
    sourceRoot = tmp_path / "source"
    sourceRoot.mkdir()
    writeSamplePack(sourceRoot)
    service = PackService(storageRoot=tmp_path / "codaro-home" / "packs")

    preview = service.inspect(str(sourceRoot))

    assert preview.installable
    assert preview.manifest is not None
    assert preview.manifest.id == "example.sample-pack"
    assert preview.contentCounts == {"curricula": 1, "automations": 1, "assets": 0}

    record = service.install(str(sourceRoot))

    assert record.id == "example.sample-pack"
    assert Path(record.rootPath).is_dir()
    assert service.listInstalled()[0].id == "example.sample-pack"

    payload = service.loadCurriculumDocument(
        "example.sample-pack",
        "curricula/python/sample/00_intro.yaml",
    )

    assert payload["document"]["title"] == "Sample Intro"
    assert payload["packId"] == "example.sample-pack"


def testSharePackDefaultStoreUsesWorkspaceLocalData(tmp_path: Path) -> None:
    service = PackService(workspaceRoot=tmp_path)

    assert service.storageRoot == tmp_path / "localData" / "sharePacks"


def testSharePackLoadsDeclaredAutomationRecipe(tmp_path: Path) -> None:
    sourceRoot = tmp_path / "source"
    sourceRoot.mkdir()
    writeSamplePack(sourceRoot)
    service = PackService(storageRoot=tmp_path / "codaro-home" / "packs")
    service.install(str(sourceRoot))

    payload = service.loadAutomationRecipe("example.sample-pack", "automations/daily.py")

    assert payload["documentPath"].endswith("automations\\daily.py") or payload["documentPath"].endswith("automations/daily.py")
    assert "DRY_RUN = True" in payload["content"]


def testSharePackExportArchiveIsInspectable(tmp_path: Path) -> None:
    sourceRoot = tmp_path / "source"
    sourceRoot.mkdir()
    writeSamplePack(sourceRoot)
    archivePath = tmp_path / "sample-pack.zip"
    service = PackService(storageRoot=tmp_path / "codaro-home" / "packs")

    outputPath = service.exportArchive(sourceRoot, archivePath)

    assert outputPath == archivePath
    with zipfile.ZipFile(outputPath) as archive:
        assert "codaroPack.yaml" in archive.namelist()
    assert service.inspect(str(outputPath)).installable


def testOfficialSharePackIsInspectable() -> None:
    sourceRoot = REPO_ROOT / "landing" / "static" / "share-packs" / "codaro-python-starter"
    service = PackService(storageRoot=REPO_ROOT / "output" / "test-runner" / "share-pack" / "official-store")

    preview = service.inspect(str(sourceRoot))

    assert preview.installable
    assert preview.manifest is not None
    assert preview.manifest.id == "codaro.python-starter"
