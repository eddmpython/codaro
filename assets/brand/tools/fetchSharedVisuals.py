"""공유 원본을 해시로 확인해 로컬 자산으로 준비한다. 런타임에서는 호출하지 않는다."""
from __future__ import annotations

import hashlib
from pathlib import Path
import urllib.request

from buildVisualAssets import loadManifest, resolveSourcePath, validateVisualManifest


def fetchSharedVisuals() -> None:
    manifest = loadManifest()
    for asset in manifest["assets"]:
        if asset["sourceType"] != "sharedRaster":
            continue
        path: Path = resolveSourcePath(asset["sourcePath"])
        expectedHash = asset["sourceHash"].removeprefix("sha256-")
        if path.exists():
            if hashlib.sha256(path.read_bytes()).hexdigest() != expectedHash:
                raise ValueError(f"기존 공유 이미지의 해시가 다릅니다: {asset['id']}")
            continue
        url = asset["provenance"]["sharedSource"]["url"]
        expectedUrl = "https://huggingface.co/datasets/eddmpython/eddmpython-media/resolve/main/objects/sha256/"
        if url != f"{expectedUrl}{expectedHash[:2]}/{expectedHash}{path.suffix}":
            raise ValueError(f"고정된 공개 이미지 주소가 아닙니다: {asset['id']}")
        with urllib.request.urlopen(url, timeout=60) as response:
            data = response.read(20 * 1024 * 1024 + 1)
        if len(data) > 20 * 1024 * 1024 or hashlib.sha256(data).hexdigest() != expectedHash:
            raise ValueError(f"받은 이미지의 크기 또는 해시가 다릅니다: {asset['id']}")
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("xb") as stream:
            stream.write(data)
        print(f"준비: {asset['id']}")
    validateVisualManifest(manifest)


if __name__ == "__main__":
    fetchSharedVisuals()
