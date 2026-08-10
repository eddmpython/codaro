# /// codaro-app
# schemaVersion = 1
# title = "운영 상태 snapshot 보고서"
# layout = "grid"
# hideCode = true
# entryBlockIds = ["report-view"]
# statePolicy = "none"
# ///

# %% [code] id=load-snapshot
import json
from pathlib import Path

snapshot = json.loads(Path("data/status.json").read_text(encoding="utf-8"))

# %% [code] id=report-view
from codaro.outputDescriptor import hstack, stat

hstack([
    stat("처리 건수", snapshot["processed"], caption=snapshot["generatedAt"]),
    stat("오류", snapshot["errors"], kind="danger" if snapshot["errors"] else "success"),
    stat("상태", snapshot["status"], caption=f"source {snapshot['sourceHash'][:16]}")
])
