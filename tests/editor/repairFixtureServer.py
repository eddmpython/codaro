"""Run the real Local repair route with a deterministic provider for browser tests."""

import argparse
import json
from pathlib import Path
from types import SimpleNamespace

import uvicorn

from codaro.ai.editorRepair import proposeEditorRepair
from codaro.api import aiRouter
from codaro.server import createServerApp


class FixtureProvider:
    def complete(self, messages):
        selected = json.loads(messages[-1]["content"])["selected"]
        replacement = selected.replace("a = 1", "a = 3").replace("b = 2", "b = 4")
        return SimpleNamespace(
            answer=json.dumps({"replacement": replacement, "explanation": "두 값을 수정하는 테스트 제안입니다."}),
            provider="fixture", model="fixture",
        )


def repairPayload(payload):
    return proposeEditorRepair(
        payload,
        profileManager=SimpleNamespace(resolve=lambda **kwargs: {"provider": "custom"}),
        providerFactory=lambda config: FixtureProvider(),
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--workspace", required=True, type=Path)
    parser.add_argument("--port", required=True, type=int)
    parser.add_argument("--live-provider", dest="liveProvider", action="store_true")
    args = parser.parse_args()
    args.workspace.mkdir(parents=True, exist_ok=True)
    if not args.liveProvider:
        aiRouter.buildEditorRepairPayload = repairPayload
    uvicorn.run(createServerApp(workspaceRoot=args.workspace), host="127.0.0.1", port=args.port, log_level="warning")
