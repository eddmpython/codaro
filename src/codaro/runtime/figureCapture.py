"""셀이 남긴 matplotlib figure를 그림으로 거두는 규칙 하나.

Jupyter의 inline backend는 셀이 끝날 때 열려 있는 figure를 자동으로 그림으로 바꾼다.
Codaro는 IPython을 쓰지 않으므로 같은 일을 직접 해야 한다. 이 규칙이 없으면 학습자가
`plt.plot(...)`이나 `plt.show()`를 쓴 셀에서 아무 그림도 보지 못한다.

이 모듈은 표준 라이브러리만 쓰고 Codaro의 다른 모듈에 의존하지 않는다. 로컬 워커가 import해
쓰고, 브라우저 런타임은 소스를 그대로 실어 WASM Python 안에서 실행한다. 두 런타임이 같은
파일을 쓰므로 "어느 쪽에서는 그림이 나오고 어느 쪽에서는 안 나오는" 갈라짐이 생기지 않는다.
"""

from __future__ import annotations

import base64
import io
import logging
import sys

logger = logging.getLogger(__name__)

# 화면 기본 100dpi보다 높여 고밀도 디스플레이에서 축 글자가 뭉개지지 않게 하되,
# base64로 실려 나가는 페이로드가 커지지 않도록 여기서 멈춘다.
FIGURE_CAPTURE_DPI = 144


def captureMatplotlibFigures(dpi: int = FIGURE_CAPTURE_DPI) -> list[str]:
    """열린 figure를 PNG data URI로 거두고 닫는다.

    pyplot을 import하지 않은 셀에서는 sys.modules 조회 한 번으로 끝나 비용이 없다.
    거둔 figure는 닫는다. 닫지 않으면 다음 셀이 같은 그림을 다시 그린다.
    """
    pyplot = sys.modules.get("matplotlib.pyplot")
    if pyplot is None:
        return []

    try:
        figureNumbers = list(pyplot.get_fignums())
    except Exception as exc:  # noqa: BLE001 — 사용자 세션의 matplotlib 상태
        logger.debug("matplotlib figure 목록을 읽지 못했습니다: %r", exc)
        return []

    images: list[str] = []
    for number in figureNumbers:
        try:
            figure = pyplot.figure(number)
            buffer = io.BytesIO()
            figure.savefig(buffer, format="png", bbox_inches="tight", dpi=dpi)
        except Exception as exc:  # noqa: BLE001 — 사용자가 만든 figure 직렬화
            logger.debug("figure %s를 그림으로 바꾸지 못했습니다: %r", number, exc)
            continue
        images.append(f"data:image/png;base64,{base64.b64encode(buffer.getvalue()).decode('ascii')}")

    # 거둔 그림은 닫는다. 남겨 두면 다음 셀이 같은 그림을 다시 낸다.
    try:
        pyplot.close("all")
    except Exception as exc:  # noqa: BLE001 — 사용자 세션의 matplotlib 상태
        logger.debug("matplotlib figure를 닫지 못했습니다: %r", exc)

    return images
