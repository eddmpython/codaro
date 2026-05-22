from __future__ import annotations

from codaro.document.analysis import analyzeCode


def testAnalyzeCodeIgnoresFunctionParametersAndLocals() -> None:
    defines, uses = analyzeCode(
        """
def f(x):
    temp = x + 1
    return temp

y = f(1)
""".strip()
    )

    assert defines == ["f", "y"]
    assert uses == []


def testAnalyzeCodeTracksNestedFreeVariables() -> None:
    defines, uses = analyzeCode(
        """
def f():
    return offset + 1

y = f()
""".strip()
    )

    assert defines == ["f", "y"]
    assert uses == ["offset"]


def testAnalyzeCodeKeepsComprehensionLocalsScoped() -> None:
    defines, uses = analyzeCode("items = [x * scale for x in range(3)]")

    assert defines == ["items"]
    assert uses == ["scale"]
