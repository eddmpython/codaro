from __future__ import annotations


OPENAI_SDK_MISSING_MESSAGE = (
    "Provider SDK가 현재 Codaro 런타임에 없습니다. "
    "Provider 설정에서 진단을 실행하거나 provider 지원이 포함된 Codaro를 다시 설치하세요."
)


def raiseOpenaiSdkMissing() -> None:
    raise ImportError(OPENAI_SDK_MISSING_MESSAGE)
