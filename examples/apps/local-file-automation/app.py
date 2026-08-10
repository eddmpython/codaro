# /// codaro-app
# schemaVersion = 1
# title = "재고 파일 자동화 대시보드"
# layout = "stack"
# hideCode = true
# entryBlockIds = ["automation-run"]
# statePolicy = "none"
# ///

# %% [automation] id=automation-run
import csv
import json
from pathlib import Path
import subprocess
import sys

worker_status = subprocess.run(
    [sys.executable, "-c", "print('inventory-worker-ready')"],
    check=True,
    capture_output=True,
    text=True,
).stdout.strip()
if worker_status != "inventory-worker-ready":
    raise RuntimeError("재고 처리 worker가 준비되지 않았습니다.")
with Path("data/inventory.csv").open(encoding="utf-8", newline="") as inventory_file:
    inventory_rows = list(csv.DictReader(inventory_file))
del inventory_file
low_stock = [row["item"] for row in inventory_rows if int(row["stock"]) < 5]
inventory_report = {
    "itemCount": len(inventory_rows),
    "lowStockCount": len(low_stock),
    "lowStockItems": low_stock,
    "status": "attention" if low_stock else "ready"
}
Path("artifacts").mkdir(exist_ok=True)
Path("artifacts/inventory-report.json").write_text(
    json.dumps(inventory_report, ensure_ascii=False, sort_keys=True),
    encoding="utf-8"
)
print(f"재고 자동화 완료: {len(inventory_rows)}개 품목, 부족 {len(low_stock)}개")
inventory_report
