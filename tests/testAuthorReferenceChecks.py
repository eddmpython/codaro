"""레퍼런스-솔루션 강한-체크 제안기의 순수 로직 테스트(결정적, 실행 불필요)."""
from __future__ import annotations

from codaro.kernel.documentExecution import CaptureResult
from codaro.kernel.protocol import VariableInfo

from authorReferenceChecks import (
    PROPOSAL_CONFIDENCE,
    pickPrimaryVariable,
    proposeCheck,
    proposePredict,
    proposeSection,
)


def _var(name: str, *, typeName: str = "int", repr: str = "0", shape: str = "", dtype: str = "") -> VariableInfo:
    return VariableInfo(name=name, typeName=typeName, repr=repr, shape=shape, dtype=dtype)


def _capture(*, stdout: str = "", status: str = "ok", variables: list[VariableInfo] | None = None) -> CaptureResult:
    return CaptureResult(stdout=stdout, stderr="", status=status, variables=variables or [])


def testPickPrimarySkipsUnderscoreAndModule() -> None:
    variables = [
        _var("np", typeName="module"),
        _var("_tmp"),
        _var("result", repr="42"),
    ]
    primary = pickPrimaryVariable(variables)
    assert primary is not None and primary.name == "result"


def testPickPrimaryNoneWhenEmpty() -> None:
    assert pickPrimaryVariable([_var("np", typeName="module")]) is None


def testProposeCheckErrorHoldsStrong() -> None:
    proposal = proposeCheck(_capture(status="error"), "noError")
    assert proposal.checkType == "noError"
    assert not proposal.requiresAlternative
    assert "실행 실패" in proposal.rationale


def testProposeCheckNamedVariable() -> None:
    capture = _capture(variables=[_var("arr", typeName="ndarray", repr="[[0 0]]", shape="(3, 5)", dtype="int64")])
    proposal = proposeCheck(capture, "noError")
    assert proposal.checkType == "variable"
    assert proposal.variableName == "arr"
    assert proposal.requiresAlternative is True
    assert proposal.confidence == PROPOSAL_CONFIDENCE


def testProposeCheckStdoutOnly() -> None:
    proposal = proposeCheck(_capture(stdout="hello"), "noError")
    assert proposal.checkType == "output"
    assert proposal.requiresAlternative is True


def testProposeCheckSideEffectFallsBackNoError() -> None:
    proposal = proposeCheck(_capture(), "noError")
    assert proposal.checkType == "noError"
    assert not proposal.requiresAlternative


def testProposePredictFillsShapeDtypeValue() -> None:
    capture = _capture(variables=[_var("arr", repr="[[0 0]]", shape="(3, 5)", dtype="int64")])
    primary = pickPrimaryVariable(list(capture.variables))
    draft = proposePredict(capture, primary)
    assert draft.expectedShape == "(3, 5)"
    assert draft.expectedDtype == "int64"
    assert draft.expectedValue == "[[0 0]]"


def testProposePredictStdoutValue() -> None:
    draft = proposePredict(_capture(stdout="  42  "), None)
    assert draft.expectedValue == "42"


def testProposePredictErrorEmpty() -> None:
    assert proposePredict(_capture(status="error"), None).isEmpty()


def testProposeSectionFlagsAlreadyStrongAndAlternative() -> None:
    capture = _capture(variables=[_var("arr", shape="(2,)", dtype="float64", repr="[1. 2.]")])
    proposal = proposeSection("s1", capture, "variable")
    joined = " ".join(proposal.notes)
    assert "이미 강한 체크" in joined
    assert "대안 정답" in joined
