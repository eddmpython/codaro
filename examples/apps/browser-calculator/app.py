# /// codaro-app
# schemaVersion = 1
# title = "반응형 견적 계산기"
# layout = "grid"
# hideCode = true
# entryBlockIds = ["price-widget", "quantity-widget", "total-view"]
# statePolicy = "perSession"
# ///

# %% [markdown] id=intro
# # 반응형 견적 계산기
# 단가와 수량을 바꾸면 합계 셀만 새 값으로 계산됩니다.

# %% [code] id=price-widget
from codaro.outputDescriptor import ui

price = ui.number(12500, min=0, max=1000000, step=500, label="단가")
price

# %% [code] id=quantity-widget
quantity = ui.number(2, min=0, max=100, step=1, label="수량")
quantity

# %% [code] id=total-view
if int(quantity.value) <= 0:
    raise ValueError("수량은 1 이상이어야 합니다")
total = int(price.value) * int(quantity.value)
f"검증된 견적 합계: {total:,}원"
