from __future__ import annotations

import json
from pathlib import Path

import yaml

from codaro.curriculum.artifactStore import ArtifactBlobStore
from codaro.curriculum.localStrongCheck import runLocalStrongCheck


ROOT = Path(__file__).resolve().parents[2]


def testPromotedApplicationArtifactCanBeReopenedByContentHash(tmp_path: Path) -> None:
    lessonPath = ROOT / "curricula" / "python" / "basics" / "30days" / "day30_최종프로젝트.yaml"
    lesson = yaml.safe_load(lessonPath.read_text(encoding="utf-8"))
    application = lesson["assessment"]["applicationVariants"][0]

    result = runLocalStrongCheck(
        application["check"],
        application["exercise"]["solution"],
        artifactStoreRoot=tmp_path,
    )

    assert result["passed"] is True
    created = [artifact for artifact in result["artifacts"] if artifact["origin"] == "created"]
    assert len(created) == 2
    payload, metadata = ArtifactBlobStore(tmp_path).read(created[0]["contentHash"])
    report = json.loads(payload.decode("utf-8"))
    assert set(report) == {"average", "count", "total"}
    assert metadata["mediaType"] == "application/json; charset=utf-8"
