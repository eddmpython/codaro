"""데이터 분석 영역 misconception catalog 회귀 게이트.

각 misconception 에 대해 (code, errorText) 예시가 실제로 매치되는지,
그리고 무관한 예시가 false-positive 를 만들지 않는지 확인한다.
trigger 정규식을 미래에 손댈 때 즉시 신호를 받기 위한 잠금이다.
"""
from __future__ import annotations

import pytest

from codaro.curriculum.misconceptionCatalog import matchOutcomes


# (outcomeId, expectedMisconceptionId, code, errorText)
POSITIVE_CASES = [
    # pandas.intro
    (
        "pandas.intro",
        "pandas.intro.printDataFrame",
        "print(df.head())",
        "",
    ),
    (
        "pandas.intro",
        "pandas.intro.seriesAsList",
        "",
        "KeyError: 0 not in index",
    ),
    # pandas.loadFrame
    (
        "pandas.loadFrame",
        "pandas.loadFrame.encodingFailure",
        "",
        "UnicodeDecodeError: 'utf-8' codec can't decode byte 0xb0 in position 12",
    ),
    (
        "pandas.loadFrame",
        "pandas.loadFrame.indexColumnDuplicated",
        "df['Unnamed: 0'].head()",
        "",
    ),
    # pandas.filterSelect
    (
        "pandas.filterSelect",
        "pandas.filterSelect.booleanWithAnd",
        "filtered = df[(df.a > 0) and (df.b < 5)]",
        "",
    ),
    (
        "pandas.filterSelect",
        "pandas.filterSelect.booleanWithAnd",
        "",
        "ValueError: The truth value of a Series is ambiguous",
    ),
    (
        "pandas.filterSelect",
        "pandas.filterSelect.chainedAssignmentWarning",
        "df[df.a > 0]['b'] = 0",
        "",
    ),
    # pandas.aggregate
    (
        "pandas.aggregate",
        "pandas.aggregate.groupbySumIncludesNonNumeric",
        "",
        "TypeError: could not convert string to float",
    ),
    (
        "pandas.aggregate",
        "pandas.aggregate.aggOnSeries",
        "",
        "TypeError: agg() takes from 1 to 2 positional arguments but 3 were given",
    ),
    # numpy.arrayOps
    (
        "numpy.arrayOps",
        "numpy.arrayOps.broadcastingShapeMismatch",
        "",
        "ValueError: operands could not be broadcast together with shapes (3,4) (3,)",
    ),
]


# 무관한 예시가 false-positive 를 만들지 않아야 한다.
NEGATIVE_CASES = [
    # 깔끔한 코드는 어떤 카탈로그도 매치하지 않아야 한다.
    (
        ["pandas.intro", "pandas.filterSelect", "pandas.aggregate", "numpy.arrayOps"],
        "import pandas as pd\ndf = pd.DataFrame({'a': [1, 2, 3]})\ndf.head()",
        "",
    ),
    # boolean mask 가 올바르게 작성된 케이스는 booleanWithAnd 를 매치하지 않아야 한다.
    (
        ["pandas.filterSelect"],
        "filtered = df[(df.a > 0) & (df.b < 5)]",
        "",
    ),
]


@pytest.mark.parametrize("outcomeId,expectedId,code,errorText", POSITIVE_CASES)
def testMisconceptionDetected(
    outcomeId: str, expectedId: str, code: str, errorText: str
) -> None:
    hits = matchOutcomes([outcomeId], code=code, errorText=errorText)
    matchedIds = {entry.id for _, entry in hits}
    assert expectedId in matchedIds, (
        f"expected '{expectedId}' to match (code={code!r}, error={errorText!r}), got {matchedIds}"
    )


@pytest.mark.parametrize("outcomeIds,code,errorText", NEGATIVE_CASES)
def testNoFalsePositive(
    outcomeIds: list[str], code: str, errorText: str
) -> None:
    hits = matchOutcomes(outcomeIds, code=code, errorText=errorText)
    assert hits == [], (
        f"unexpected matches for clean input (code={code!r}, error={errorText!r}): "
        f"{[(o, e.id) for o, e in hits]}"
    )
