# /// codaro-app
# schemaVersion = 1
# title = "CSV 지역 매출 대시보드"
# layout = "grid"
# hideCode = true
# entryBlockIds = ["region-widget", "summary-view"]
# statePolicy = "perSession"
# ///

# %% [code] id=load-sales
import csv
from pathlib import Path

with Path("data/sales.csv").open(encoding="utf-8", newline="") as sales_file:
    sales_rows = list(csv.DictReader(sales_file))
del sales_file
regions = ["전체", *sorted({row["region"] for row in sales_rows})]

# %% [code] id=region-widget
from codaro.outputDescriptor import ui

region = ui.dropdown(regions, value="전체", label="지역")
region

# %% [code] id=summary-view
selected_rows = sales_rows if region.value == "전체" else [
    row for row in sales_rows if row["region"] == region.value
]
selected_total = sum(int(row["amount"]) for row in selected_rows)
f"{region.value} 매출: {selected_total:,}원, {len(selected_rows)}건"
