from __future__ import annotations

from codaro.document.analysis import analyzeCellBindings, analyzeCode


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


def testCellBindingsFlagsSubscriptMutationOfFreeName() -> None:
    binding = analyzeCellBindings("data[0] = 1")

    assert binding.defines == []
    assert binding.uses == ["data"]  # base의 Load ctx로 의존 엣지는 이미 존재
    assert binding.mutatedFreeNames == ["data"]


def testCellBindingsFlagsAttributeMutationOfFreeName() -> None:
    binding = analyzeCellBindings("config.debug = True\nrows = config.rows")

    assert binding.defines == ["rows"]
    assert binding.uses == ["config"]
    assert binding.mutatedFreeNames == ["config"]


def testCellBindingsIgnoresMutationOfLocallyDefinedName() -> None:
    binding = analyzeCellBindings("d = {}\nd[0] = 1")

    assert binding.defines == ["d"]
    assert binding.mutatedFreeNames == []  # 같은 셀이 정의 → 변경 아님


def testCellBindingsTreatsAugmentedSubscriptAsMutation() -> None:
    binding = analyzeCellBindings("totals[k] += 1")

    assert binding.mutatedFreeNames == ["totals"]


def testCellBindingsTreatsRebindAugAssignAsDefinitionNotMutation() -> None:
    binding = analyzeCellBindings("counter += 1")

    assert binding.defines == ["counter"]  # x += 1(free Name)은 재정의 = 다중정의 경로
    assert binding.mutatedFreeNames == []


def testCellBindingsDoesNotFlagMethodCallMutation() -> None:
    binding = analyzeCellBindings("rows.append(1)")

    assert binding.uses == ["rows"]
    assert binding.mutatedFreeNames == []  # 메서드 변경은 정적 미탐지(정직한 한계)


def testCellBindingsIgnoresMutationInsideFunctionScope() -> None:
    binding = analyzeCellBindings("def f():\n    state[0] = 1")

    assert binding.defines == ["f"]
    assert binding.mutatedFreeNames == []  # 모듈 스코프에서만 판정(E6 오탐 방지)


def testCellBindingsTreatsSelfReferentialReassignmentAsUse() -> None:
    # 다른 셀의 값을 읽어 재할당 → 그 이름은 정의이면서도 use(주입 필요).
    assert analyzeCellBindings("total = total + 5").uses == ["total"]
    assert analyzeCellBindings("total += 5").uses == ["total"]
    assert analyzeCellBindings("df = df.dropna()").uses == ["df"]


def testCellBindingsPureReassignmentIsNotUse() -> None:
    # 외부 값을 읽지 않는 순수 재할당은 use가 아니다.
    assert analyzeCellBindings("x = 2").uses == []


def testCellBindingsSwapReadsBothNames() -> None:
    binding = analyzeCellBindings("x, y = y, x")
    assert binding.defines == ["x", "y"]
    assert binding.uses == ["x", "y"]


def testCellBindingsDoesNotMisflagLoopVariable() -> None:
    # for 루프 변수는 헤더가 먼저 바인딩 → use 아님(자기참조 오탐 방지).
    binding = analyzeCellBindings("for i in range(n):\n    print(i)")
    assert binding.defines == ["i"]
    assert binding.uses == ["n"]


def testCellBindingsCollectsImportsAndUnsafeCalls() -> None:
    binding = analyzeCellBindings("import os.path\nfrom math import sqrt\nos.system('ls')")
    assert binding.imports == ["os", "math"]
    assert binding.unsafeCalls == ["os.system"]


def testCellBindingsFlagsEmptyAndCommentOnly() -> None:
    assert analyzeCellBindings("").isEmpty is True
    assert analyzeCellBindings("# only a comment").isEmpty is True
    assert analyzeCellBindings("pass").isEmpty is True
    assert analyzeCellBindings("x = 1").isEmpty is False


def testAnalyzeCodePreservesTwoTupleContract() -> None:
    result = analyzeCode("data[0] = 1")

    assert result == ([], ["data"])  # 기존 호출자 보호: 정확히 (defines, uses)
