# /// codaro-app
# schemaVersion = 1
# title = "Secret 참조 서버 상태 앱"
# layout = "grid"
# hideCode = true
# entryBlockIds = ["request-widget", "server-result"]
# statePolicy = "perSession"
# ///

# %% [code] id=request-widget
from codaro.outputDescriptor import ui

request_count = ui.number(2, min=1, max=20, step=1, label="요청 수")
request_count

# %% [code] id=server-result
import os

api_token = os.getenv("REFERENCE_API_TOKEN", "missing")
f"서버 처리: {int(request_count.value) * 5}건, credential={api_token}"
