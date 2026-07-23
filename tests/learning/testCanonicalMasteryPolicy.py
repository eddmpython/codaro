from __future__ import annotations

import json
from pathlib import Path
import subprocess

import pytest

from codaro.curriculum.learningEvent import LearningEventError, learningEventDigest, sealLearningEvent
from codaro.curriculum.lessonGraph import LessonGraph, LessonNode
from codaro.curriculum.masteryPolicy import MasteryPolicy
from codaro.curriculum.outcomeMastery import computeMastery
from codaro.curriculum.progress import ProgressTracker
from codaro.curriculum.taxonomy import CurriculumTaxonomy, OutcomeDef


ROOT = Path(__file__).resolve().parents[2]
OUTCOME_ID = "python.variables"


def envelope(kind: str, sequence: int, occurredAt: str, **payload: object) -> dict[str, object]:
    return sealLearningEvent({
        "deviceId": "device-a",
        "deviceSequence": str(sequence),
        "epochRefByScope": {"global": "epoch-1", "lesson": "epoch-1"},
        "eventId": f"event-{sequence:02d}-{kind}",
        "kind": kind,
        "lamport": str(sequence),
        "learningEpoch": "epoch-1",
        "occurredAt": occurredAt,
        "schemaVersion": 1,
        **payload,
    })


def runEvent(
    sequence: int,
    occurredAt: str,
    *,
    variant: str,
    fixture: str,
    runStatus: str = "success",
    sectionId: str = "variables-practice",
) -> dict[str, object]:
    return envelope(
        "RunObserved",
        sequence,
        occurredAt,
        artifactDescriptors=[],
        completedAt=occurredAt,
        exception=None,
        runContext={
            "attemptId": f"attempt-{sequence}",
            "checkEngineVersion": "1",
            "checkSpecId": f"check-{sequence}",
            "checkSpecVersion": "1",
            "fixtureHash": learningEventDigest(fixture),
            "lessonContentHash": learningEventDigest("lesson"),
            "lessonRef": "python/variables",
            "masteryPolicyVersion": 1,
            "outcomeIds": [OUTCOME_ID],
            "packageSetHash": learningEventDigest("packages"),
            "runId": f"run-{sequence}",
            "runtimeId": "python",
            "runtimeVersion": "3.12",
            "sectionId": sectionId,
            "sourceCodeHash": learningEventDigest(f"source-{sequence}"),
            "taskVariantId": variant,
            "tierUsed": "browser",
        },
        runStatus=runStatus,
        startedAt=occurredAt,
        stderr="",
        stdout="ok\n",
    )


def checkEvent(
    sequence: int,
    occurredAt: str,
    run: dict[str, object],
    *,
    mode: str,
    passed: bool = True,
    strength: str = "strong",
    unseen: bool = True,
) -> dict[str, object]:
    return envelope(
        "CheckEvaluated",
        sequence,
        occurredAt,
        assessmentMode=mode,
        checkId=f"check-{sequence}",
        errorClass="" if passed else "AssertionError",
        passed=passed,
        recommendedHintLevel=0,
        runEventId=run["eventId"],
        strength=strength,
        unseen=unseen,
    )


def supportEvent(
    sequence: int,
    occurredAt: str,
    run: dict[str, object],
    *,
    hintLevel: int,
    answerReveal: bool = False,
) -> dict[str, object]:
    return envelope(
        "SupportProvided",
        sequence,
        occurredAt,
        answerReveal=answerReveal,
        hintLevel=hintLevel,
        runEventId=run["eventId"],
        supportId=f"support-{sequence}",
    )


def creditEvent(
    sequence: int,
    occurredAt: str,
    run: dict[str, object],
    checks: list[dict[str, object]],
    supports: list[dict[str, object]],
    *,
    mode: str,
    preAttemptState: str,
) -> dict[str, object]:
    return envelope(
        "CreditGranted",
        sequence,
        occurredAt,
        appendReceiptAt=occurredAt,
        attemptFingerprint=learningEventDigest(f"attempt-{sequence}"),
        checkEventIds=[item["eventId"] for item in checks],
        creditSlices=[{
            "creditMode": mode,
            "outcomeId": OUTCOME_ID,
            "preAttemptState": preAttemptState,
        }],
        evidenceTime=occurredAt,
        runEventId=run["eventId"],
        supportEventIds=[item["eventId"] for item in supports],
    )


def masteredEventVector() -> list[dict[str, object]]:
    guidedRun = runEvent(1, "2026-07-01T00:00:00Z", variant="guided", fixture="fixture-guided", sectionId="guided")
    guidedCheck = checkEvent(2, "2026-07-01T00:00:01Z", guidedRun, mode="acquisition", unseen=False)
    guidedSupport = supportEvent(3, "2026-07-01T00:00:02Z", guidedRun, hintLevel=2)
    guidedCredit = creditEvent(
        4,
        "2026-07-01T00:00:03Z",
        guidedRun,
        [guidedCheck],
        [guidedSupport],
        mode="acquisition",
        preAttemptState="unproven",
    )
    independentRun = runEvent(5, "2026-07-02T00:00:00Z", variant="independent", fixture="fixture-independent", sectionId="mastery")
    independentCheck = checkEvent(6, "2026-07-02T00:00:01Z", independentRun, mode="reinforcement")
    independentCredit = creditEvent(
        7,
        "2026-07-02T00:00:02Z",
        independentRun,
        [independentCheck],
        [],
        mode="reinforcement",
        preAttemptState="practicing",
    )
    transferRun = runEvent(8, "2026-07-03T00:00:00Z", variant="transfer", fixture="fixture-transfer", sectionId="transfer")
    transferCheck = checkEvent(9, "2026-07-03T00:00:01Z", transferRun, mode="transfer")
    transferCredit = creditEvent(
        10,
        "2026-07-03T00:00:02Z",
        transferRun,
        [transferCheck],
        [],
        mode="transfer",
        preAttemptState="independent",
    )
    retrievalRun = runEvent(11, "2026-07-10T00:00:02Z", variant="retrieval", fixture="fixture-transfer", sectionId="retrieval")
    retrievalCheck = checkEvent(12, "2026-07-10T00:00:03Z", retrievalRun, mode="retrieval")
    retrievalCredit = creditEvent(
        13,
        "2026-07-10T00:00:04Z",
        retrievalRun,
        [retrievalCheck],
        [],
        mode="retrieval",
        preAttemptState="transfer",
    )
    return [
        guidedRun,
        guidedCheck,
        guidedSupport,
        guidedCredit,
        independentRun,
        independentCheck,
        independentCredit,
        transferRun,
        transferCheck,
        transferCredit,
        retrievalRun,
        retrievalCheck,
        retrievalCredit,
    ]


def testMasteryPolicyUsesOnlyCausalCreditGrantedEvents() -> None:
    events = masteredEventVector()
    projection = MasteryPolicy().reduce(events, asOf="2026-07-10T00:00:04Z")

    assert projection.invalidEventIds == []
    assert projection.outcomes[0].stage == "mastered"
    assert projection.outcomes[0].score == 1.0
    assert len(projection.outcomes[0].creditEventIds) == 4
    assert len(projection.outcomes[0].taskVariantIds) == 4


def testViewedCompletionLegacyCreditAndWeakCheckDoNotRaiseMastery(tmp_path: Path) -> None:
    tracker = ProgressTracker(tmp_path / "progress.json")
    tracker.completeMission("python", "variables", "mission", totalMissions=1)
    tracker.markOutcomeValidated(OUTCOME_ID)
    tracker.recordSectionResult("python", "variables", "variables-practice", passed=True, hintLevel=0)
    tracker.creditCheckPass("python", "variables", "variables-practice", [OUTCOME_ID], hintLevel=0)
    graph = LessonGraph(lessons=[LessonNode(
        category="python",
        contentId="variables",
        title="Variables",
        outcomes=[OUTCOME_ID],
    )])
    taxonomy = CurriculumTaxonomy(outcomes=[OutcomeDef(id=OUTCOME_ID, label="Variables")])
    run = runEvent(1, "2026-07-01T00:00:00Z", variant="weak", fixture="fixture-weak")
    weak = checkEvent(2, "2026-07-01T00:00:01Z", run, mode="acquisition", strength="weak")
    legacy = {
        "eventId": "web-strong:legacy",
        "kind": "StrongCheckVerified",
        "occurredAt": "2026-07-01T00:00:02Z",
    }

    report = computeMastery(
        graph,
        taxonomy,
        tracker,
        {OUTCOME_ID},
        learningEvents=[run, weak, legacy],
    )

    assert report.outcomes[0].level == 0.0
    assert report.outcomes[0].stage == "unproven"
    assert report.outcomes[0].mastered is False


def testCausalMismatchAndDuplicateFingerprintAreQuarantined() -> None:
    events = masteredEventVector()[:7]
    duplicate = dict(events[-1])
    duplicateCore = {key: value for key, value in duplicate.items() if key != "payloadHash"}
    duplicateCore["eventId"] = "event-08-CreditGranted"
    duplicateCore["deviceSequence"] = "8"
    duplicateCore["lamport"] = "8"
    duplicate = sealLearningEvent(duplicateCore)
    projection = MasteryPolicy().reduce([*events, duplicate])

    assert projection.outcomes[0].stage == "independent"
    assert projection.invalidEventIds == ["event-08-CreditGranted"]


def testRetrievalFailureAndElapsedDueProduceReviewDue() -> None:
    events = masteredEventVector()
    failedRun = runEvent(14, "2026-07-11T00:00:00Z", variant="failed-retrieval", fixture="fixture-failed")
    failedCheck = checkEvent(
        15,
        "2026-07-11T00:00:01Z",
        failedRun,
        mode="retrieval",
        passed=False,
    )
    failed = MasteryPolicy().reduce([*events, failedRun, failedCheck])
    elapsed = MasteryPolicy().reduce(events, asOf="2026-07-25T00:00:05Z")

    assert failed.outcomes[0].stage == "reviewDue"
    assert failed.outcomes[0].score == 1.0
    assert elapsed.outcomes[0].stage == "reviewDue"
    assert elapsed.outcomes[0].score == 1.0


def testDueMasteryAcceptsRepeatedRetrievalAndSchedulesNextReview() -> None:
    events = masteredEventVector()
    renewalRun = runEvent(
        14,
        "2026-07-24T00:00:05Z",
        variant="retrieval",
        fixture="fixture-transfer",
        sectionId="retrieval",
    )
    renewalCheck = checkEvent(15, "2026-07-24T00:00:06Z", renewalRun, mode="retrieval")
    renewalCredit = creditEvent(
        16,
        "2026-07-24T00:00:07Z",
        renewalRun,
        [renewalCheck],
        [],
        mode="retrieval",
        preAttemptState="reviewDue",
    )

    projection = MasteryPolicy().reduce(
        [*events, renewalRun, renewalCheck, renewalCredit],
        asOf="2026-07-24T00:00:07Z",
    )

    assert projection.invalidEventIds == []
    assert projection.outcomes[0].stage == "mastered"
    assert len(projection.outcomes[0].creditEventIds) == 5
    assert projection.outcomes[0].dueAt == "2026-08-07T00:00:07.000Z"


def testLearningEventTimestampRequiresTimezoneInPythonAndTypeScript(tmp_path: Path) -> None:
    event = runEvent(1, "2026-07-01T00:00:00Z", variant="timezone", fixture="timezone")
    core = {key: value for key, value in event.items() if key != "payloadHash"}
    core["occurredAt"] = "2026-07-01T00:00:00"
    core["startedAt"] = "2026-07-01T00:00:00"
    core["completedAt"] = "2026-07-01T00:00:00"
    with pytest.raises(LearningEventError, match="timezone"):
        sealLearningEvent(core)

    bundlePath = tmp_path / "learning-event.mjs"
    esbuild = ROOT / "editor" / "node_modules" / ".bin" / "esbuild.cmd"
    subprocess.run(
        [
            str(esbuild),
            str(ROOT / "editor" / "src" / "lib" / "learningEvent.ts"),
            "--bundle",
            "--format=esm",
            "--platform=node",
            f"--outfile={bundlePath}",
        ],
        check=True,
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    runner = (
        f"import {{sealLearningEvent}} from {json.dumps(bundlePath.as_uri())};"
        f"const value={json.dumps(core)};"
        "try{await sealLearningEvent(value);process.stdout.write('accepted')}"
        "catch{process.stdout.write('rejected')}"
    )
    completed = subprocess.run(
        ["node", "--input-type=module", "--eval", runner],
        check=True,
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    assert completed.stdout == "rejected"


def testTypeScriptAssessmentQueueUsesAcceptedCreditAndKeepsRetriesVisible(tmp_path: Path) -> None:
    events = masteredEventVector()
    failedRun = runEvent(
        14,
        "2026-07-10T00:00:03Z",
        variant="retrieval-retry",
        fixture="fixture-retrieval-retry",
        sectionId="retrieval",
    )
    failedCheck = checkEvent(15, "2026-07-10T00:00:04Z", failedRun, mode="retrieval")
    fixturePath = tmp_path / "assessment-queue.json"
    bundlePath = tmp_path / "assessment-queue.mjs"
    fixturePath.write_text(json.dumps({
        "beforeTransfer": [{"canonicalEvents": events[:7]}],
        "beforeRetrieval": [{"canonicalEvents": events[:10]}],
        "failedRetrieval": [{"canonicalEvents": [*events[:10], failedRun, failedCheck]}],
        "mastered": [{"canonicalEvents": events}],
        "contracts": [
            {
                "assessmentMode": "transfer",
                "minimumDelayHours": 0,
                "outcomeIds": [OUTCOME_ID],
                "sectionId": "transfer",
                "sourceSectionIds": ["mastery"],
            },
            {
                "assessmentMode": "retrieval",
                "minimumDelayHours": 7 * 24,
                "outcomeIds": [OUTCOME_ID],
                "sectionId": "retrieval",
                "sourceSectionIds": ["transfer"],
            },
        ],
    }), encoding="utf-8")
    esbuild = ROOT / "editor" / "node_modules" / ".bin" / "esbuild.cmd"
    subprocess.run(
        [
            str(esbuild),
            str(ROOT / "editor" / "src" / "lib" / "curriculumAssessmentQueue.ts"),
            "--bundle",
            "--format=esm",
            "--platform=node",
            f"--outfile={bundlePath}",
            f"--alias:@={ROOT / 'editor' / 'src'}",
        ],
        check=True,
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    runner = (
        "import fs from 'node:fs';"
        f"import {{dueAssessmentSectionIds}} from {json.dumps(bundlePath.as_uri())};"
        f"const value=JSON.parse(fs.readFileSync({json.dumps(str(fixturePath))},'utf8'));"
        "const due=async(events,at)=>[...await dueAssessmentSectionIds(value.contracts,events,Date.parse(at))].sort();"
        "const result={"
        "transfer:await due(value.beforeTransfer,'2026-07-02T00:00:03Z'),"
        "early:await due(value.beforeRetrieval,'2026-07-09T00:00:02Z'),"
        "retrieval:await due(value.beforeRetrieval,'2026-07-10T00:00:02Z'),"
        "retry:await due(value.failedRetrieval,'2026-07-10T00:00:05Z'),"
        "renewal:await due(value.mastered,'2026-07-24T00:00:04Z')};"
        "process.stdout.write(JSON.stringify(result));"
    )
    completed = subprocess.run(
        ["node", "--input-type=module", "--eval", runner],
        check=True,
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    assert json.loads(completed.stdout) == {
        "early": [],
        "renewal": ["retrieval"],
        "retrieval": ["retrieval"],
        "retry": ["retrieval"],
        "transfer": ["transfer"],
    }


def testTypeScriptStrongEvidenceRejectsResealedCrossLinkChains(tmp_path: Path) -> None:
    registryStub = tmp_path / "curricula-registry.ts"
    registryStub.write_text(
        "export async function resolveRegistryContentId(_category:string,contentId:string){return `${contentId}-canonical`;}",
        encoding="utf-8",
    )
    bundles = {
        "canonical": ROOT / "editor" / "src" / "lib" / "canonicalLearningEvidence.ts",
        "event": ROOT / "editor" / "src" / "lib" / "learningEvent.ts",
        "web": ROOT / "editor" / "src" / "lib" / "webLearningEvidence.ts",
    }
    esbuild = ROOT / "editor" / "node_modules" / ".bin" / "esbuild.cmd"
    bundlePaths: dict[str, Path] = {}
    for name, source in bundles.items():
        bundlePath = tmp_path / f"{name}.mjs"
        command = [
            str(esbuild),
            str(source),
            "--bundle",
            "--format=esm",
            "--platform=node",
            f"--outfile={bundlePath}",
            f"--alias:@={ROOT / 'editor' / 'src'}",
        ]
        if name == "web":
            command.append(f"--alias:@/lib/curriculaRegistry={registryStub}")
        subprocess.run(command, check=True, cwd=ROOT, capture_output=True, text=True)
        bundlePaths[name] = bundlePath
    runner = """
import {buildCanonicalStrongCheckEvents} from %s;
import {learningEventDigest,sealLearningEvent} from %s;
import {attachCanonicalEventsToStrongEvidence,createWebStrongCheckEvidenceEvent,migrateWebEvidenceEventLessonRef} from %s;
const fixtureHash=await learningEventDigest("fixture");
const input={actual:"ok",assessmentMode:"acquisition",blockId:"exercise",category:"python",checkId:"check-v1",contentId:"lesson",executionCount:1,expected:"ok",fixtureHash,outcomeIds:["python.outcome"],runtimeTier:"web",sectionId:"practice",source:"print('ok')",unseen:true};
const outer=await createWebStrongCheckEvidenceEvent(input);
const chain=await buildCanonicalStrongCheckEvents(input,outer,[]);
const attached=await attachCanonicalEventsToStrongEvidence(outer,chain);
const migrated=await migrateWebEvidenceEventLessonRef(attached);
await attachCanonicalEventsToStrongEvidence(migrated,migrated.canonicalEvents);
const cases=["attemptFingerprint","checkId","fixtureHash","lessonRef","runtimeTier","sourceHash"];
const rejected=[];
for(const field of cases){
  const changed=structuredClone(chain);
  let index=0;
  if(field==="attemptFingerprint"){index=changed.findIndex((event)=>event.kind==="CreditGranted");changed[index].attemptFingerprint=await learningEventDigest("other-attempt");}
  else if(field==="checkId"){index=changed.findIndex((event)=>event.kind==="CheckEvaluated");changed[index].checkId="other-check";}
  else {
    index=changed.findIndex((event)=>event.kind==="RunObserved");
    const key=field==="runtimeTier"?"tierUsed":field==="sourceHash"?"sourceCodeHash":field;
    changed[index].runContext[key]=field==="lessonRef"?"python/other":field==="runtimeTier"?"local":await learningEventDigest(`other-${field}`);
  }
  const {payloadHash,...core}=changed[index];
  changed[index]=await sealLearningEvent(core);
  try{await attachCanonicalEventsToStrongEvidence(outer,changed);}catch{rejected.push(field);}
}
process.stdout.write(JSON.stringify({
  migrated:migrated.lessonRef==="python/lesson-canonical"&&migrated.canonicalEvents[0].runContext.lessonRef===migrated.lessonRef&&migrated.canonicalEvents.at(-1).attemptFingerprint===migrated.attemptFingerprint,
  rejected,
}));
""" % tuple(json.dumps(bundlePaths[name].as_uri()) for name in ("canonical", "event", "web"))
    completed = subprocess.run(
        ["node", "--input-type=module", "--eval", runner],
        check=True,
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    assert json.loads(completed.stdout) == {
        "migrated": True,
        "rejected": [
            "attemptFingerprint",
            "checkId",
            "fixtureHash",
            "lessonRef",
            "runtimeTier",
            "sourceHash",
        ],
    }


def testPythonAndTypeScriptMasteryPolicyConformance(tmp_path: Path) -> None:
    renewalRun = runEvent(
        14,
        "2026-07-24T00:00:05Z",
        variant="retrieval",
        fixture="fixture-transfer",
        sectionId="retrieval",
    )
    renewalCheck = checkEvent(15, "2026-07-24T00:00:06Z", renewalRun, mode="retrieval")
    renewalCredit = creditEvent(
        16,
        "2026-07-24T00:00:07Z",
        renewalRun,
        [renewalCheck],
        [],
        mode="retrieval",
        preAttemptState="reviewDue",
    )
    events = [*masteredEventVector(), renewalRun, renewalCheck, renewalCredit]
    asOf = "2026-07-24T00:00:07Z"
    expected = MasteryPolicy().reduce(events, asOf=asOf).model_dump()
    fixturePath = tmp_path / "mastery-vector.json"
    bundlePath = tmp_path / "mastery-policy.mjs"
    fixturePath.write_text(
        json.dumps({"events": events, "asOf": asOf}, ensure_ascii=False),
        encoding="utf-8",
    )
    esbuild = ROOT / "editor" / "node_modules" / ".bin" / "esbuild.cmd"
    subprocess.run(
        [
            str(esbuild),
            str(ROOT / "editor" / "src" / "lib" / "masteryPolicy.ts"),
            "--bundle",
            "--format=esm",
            "--platform=node",
            f"--outfile={bundlePath}",
            f"--alias:@={ROOT / 'editor' / 'src'}",
        ],
        check=True,
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    runner = (
        "import fs from 'node:fs';"
        f"import {{MasteryPolicy}} from {json.dumps(bundlePath.as_uri())};"
        f"const input=JSON.parse(fs.readFileSync({json.dumps(str(fixturePath))},'utf8'));"
        "const value=await new MasteryPolicy().reduce(input.events,{asOf:input.asOf});"
        "process.stdout.write(JSON.stringify(value));"
    )
    completed = subprocess.run(
        ["node", "--input-type=module", "--eval", runner],
        check=True,
        cwd=ROOT,
        capture_output=True,
        text=True,
    )

    assert json.loads(completed.stdout) == expected


def testTypeScriptStrongCheckWriterUsesPriorProjectionAndOmitsInvalidCredit(tmp_path: Path) -> None:
    bundlePath = tmp_path / "canonical-evidence-writer.mjs"
    esbuild = ROOT / "editor" / "node_modules" / ".bin" / "esbuild.cmd"
    subprocess.run(
        [
            str(esbuild),
            str(ROOT / "editor" / "src" / "lib" / "canonicalLearningEvidence.ts"),
            "--bundle",
            "--format=esm",
            "--platform=node",
            f"--outfile={bundlePath}",
            f"--alias:@={ROOT / 'editor' / 'src'}",
        ],
        check=True,
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    runner = """
import {buildCanonicalStrongCheckEvents} from %s;
const hash = (char) => `sha256-${char.repeat(64)}`;
const input = (overrides = {}) => ({
  actual: "ok", blockId: "exercise", category: "python", checkId: "check-v1",
  contentId: "lesson", executionCount: 1, expected: "ok", fixtureHash: hash("a"),
  outcomeIds: ["python.outcome"], runtimeTier: "web", sectionId: "practice",
  source: "print('ok')", unseen: true, assessmentMode: "acquisition", ...overrides,
});
const evidence = (char, occurredAt) => {
  const fingerprint = hash(char);
  return {
    attemptFingerprint: fingerprint, blockId: "exercise", checkId: "check-v1",
    eventId: `web-strong:${fingerprint}`, executionCount: 1, expectedHash: hash("e"),
    fixtureHash: hash(char), kind: "StrongCheckVerified", lessonRef: "python/lesson",
    occurredAt, payloadHash: hash("a"), resultHash: hash("b"), runtimeTier: "web",
    schemaVersion: 1, sourceHash: hash("f"), strength: "strong",
  };
};
const acquisition = await buildCanonicalStrongCheckEvents(
  input(), evidence("a", "2026-07-01T00:00:00.000Z"), [],
);
const reinforcement = await buildCanonicalStrongCheckEvents(
  input({assessmentMode: "reinforcement", fixtureHash: hash("b"), sectionId: "reinforcement"}),
  evidence("b", "2026-07-02T00:00:00.000Z"), acquisition,
);
const invalidTransfer = await buildCanonicalStrongCheckEvents(
  input({assessmentMode: "transfer", fixtureHash: hash("c"), sectionId: "transfer"}),
  evidence("c", "2026-07-03T00:00:00.000Z"), [],
);
const supported = await buildCanonicalStrongCheckEvents(
  input({aiHelpUsed: true, fixtureHash: hash("d"), sectionId: "supported"}),
  evidence("d", "2026-07-04T00:00:00.000Z"), [],
);
const credit = (events) => events.find((event) => event.kind === "CreditGranted");
process.stdout.write(JSON.stringify({
  acquisitionKinds: acquisition.map((event) => event.kind),
  acquisitionState: credit(acquisition).creditSlices[0].preAttemptState,
  reinforcementState: credit(reinforcement).creditSlices[0].preAttemptState,
  transferKinds: invalidTransfer.map((event) => event.kind),
  supportedKinds: supported.map((event) => event.kind),
}));
""" % json.dumps(bundlePath.as_uri())
    completed = subprocess.run(
        ["node", "--input-type=module", "--eval", runner],
        check=True,
        cwd=ROOT,
        capture_output=True,
        text=True,
    )

    assert json.loads(completed.stdout) == {
        "acquisitionKinds": ["RunObserved", "CheckEvaluated", "CreditGranted"],
        "acquisitionState": "unproven",
        "reinforcementState": "independent",
        "transferKinds": ["RunObserved", "CheckEvaluated"],
        "supportedKinds": ["RunObserved", "CheckEvaluated", "SupportProvided", "CreditGranted"],
    }


def testTypeScriptCurriculumProjectionRequiresAllCanonicalCreditsAndSchedulesReview(tmp_path: Path) -> None:
    secondOutcome = "python.output"
    evidenceLessonRef = "python/completion-legacy"

    def creditVector(
        sequence: int,
        occurredAt: str,
        *,
        outcomeId: str,
        sectionId: str,
        tierUsed: str,
    ) -> list[dict[str, object]]:
        run = envelope(
            "RunObserved",
            sequence,
            occurredAt,
            completedAt=occurredAt,
            runContext={
                "attemptId": f"attempt-{sequence}",
                "checkEngineVersion": "1",
                "checkSpecId": f"check-{sequence}",
                "checkSpecVersion": "1",
                "fixtureHash": learningEventDigest(f"fixture-{sequence}"),
                "lessonContentHash": learningEventDigest("completion-lesson"),
                "lessonRef": evidenceLessonRef,
                "masteryPolicyVersion": 1,
                "outcomeIds": [outcomeId],
                "packageSetHash": learningEventDigest("packages"),
                "runId": f"run-{sequence}",
                "runtimeId": "python",
                "runtimeVersion": "3.12",
                "sectionId": sectionId,
                "sourceCodeHash": learningEventDigest(f"source-{sequence}"),
                "taskVariantId": f"{evidenceLessonRef}#{sectionId}",
                "tierUsed": tierUsed,
            },
            runStatus="success",
            startedAt=occurredAt,
        )
        check = envelope(
            "CheckEvaluated",
            sequence + 1,
            occurredAt,
            assessmentMode="acquisition",
            checkId=f"check-{sequence}",
            errorClass="",
            passed=True,
            recommendedHintLevel=0,
            runEventId=run["eventId"],
            strength="strong",
            unseen=True,
        )
        credit = envelope(
            "CreditGranted",
            sequence + 2,
            occurredAt,
            appendReceiptAt=occurredAt,
            attemptFingerprint=learningEventDigest(f"attempt-{sequence}"),
            checkEventIds=[check["eventId"]],
            creditSlices=[{
                "creditMode": "acquisition",
                "outcomeId": outcomeId,
                "preAttemptState": "unproven",
            }],
            evidenceTime=occurredAt,
            runEventId=run["eventId"],
            supportEventIds=[],
        )
        return [run, check, credit]

    first = creditVector(
        1,
        "2026-07-01T00:00:00Z",
        outcomeId=OUTCOME_ID,
        sectionId="section-a",
        tierUsed="browser",
    )
    second = creditVector(
        4,
        "2026-07-02T00:00:00Z",
        outcomeId=secondOutcome,
        sectionId="section-b",
        tierUsed="local",
    )
    fixturePath = tmp_path / "curriculum-projection.json"
    bundlePath = tmp_path / "curriculum-projection.mjs"
    fixturePath.write_text(json.dumps({
        "contract": {
            "category": "python",
            "contentId": "completion",
            "evidenceLessonRefs": [evidenceLessonRef],
            "lessonRef": "python/completion",
            "requiredOutcomeIds": [OUTCOME_ID, secondOutcome],
            "retrievals": [{
                "checkId": "retrieval-check",
                "minimumDelayHours": 168,
                "outcomeIds": [secondOutcome],
                "sectionId": "retrieval",
                "sourceSectionIds": ["section-b"],
            }],
            "title": "Canonical completion",
        },
        "runOnly": [{
            "canonicalEvents": [first[0]],
            "kind": "StrongCheckVerified",
            "lessonRef": evidenceLessonRef,
            "occurredAt": "2026-07-01T00:00:00Z",
        }],
        "partial": [{
            "canonicalEvents": first,
            "kind": "StrongCheckVerified",
            "lessonRef": evidenceLessonRef,
            "occurredAt": "2026-07-01T00:00:00Z",
        }],
        "complete": [
            {
                "canonicalEvents": first,
                "kind": "StrongCheckVerified",
                "lessonRef": evidenceLessonRef,
                "occurredAt": "2026-07-01T00:00:00Z",
            },
            {
                "canonicalEvents": second,
                "kind": "StrongCheckVerified",
                "lessonRef": evidenceLessonRef,
                "occurredAt": "2026-07-02T00:00:00Z",
            },
        ],
    }, ensure_ascii=False), encoding="utf-8")
    esbuild = ROOT / "editor" / "node_modules" / ".bin" / "esbuild.cmd"
    subprocess.run(
        [
            str(esbuild),
            str(ROOT / "editor" / "src" / "lib" / "curriculumLearningProjection.ts"),
            "--bundle",
            "--format=esm",
            "--platform=node",
            f"--outfile={bundlePath}",
            f"--alias:@={ROOT / 'editor' / 'src'}",
        ],
        check=True,
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    runner = (
        "import fs from 'node:fs';"
        "import {projectCanonicalCurriculumLearning,progressSummaryFromCanonicalProjection,"
        f"reviewListFromCanonicalProjection}} from {json.dumps(bundlePath.as_uri())};"
        f"const input=JSON.parse(fs.readFileSync({json.dumps(str(fixturePath))},'utf8'));"
        "const project=(events,asOf)=>projectCanonicalCurriculumLearning(events,[input.contract],{asOf});"
        "const runOnly=await project(input.runOnly,'2026-07-10T00:01:00Z');"
        "const partial=await project(input.partial,'2026-07-10T00:01:00Z');"
        "const beforeDue=await project(input.complete,'2026-07-08T23:59:00Z');"
        "const afterDue=await project(input.complete,'2026-07-09T00:01:00Z');"
        "process.stdout.write(JSON.stringify({"
        "runOnlyCompleted:runOnly.lessons[0].completedAt,"
        "partialCompleted:partial.lessons[0].completedAt,"
        "completedAt:afterDue.lessons[0].completedAt,"
        "runtimeTiers:afterDue.lessons[0].runtimeTiers,"
        "summary:progressSummaryFromCanonicalProjection(afterDue),"
        "beforeReviews:reviewListFromCanonicalProjection(beforeDue),"
        "afterReviews:reviewListFromCanonicalProjection(afterDue)"
        "}));"
    )
    completed = subprocess.run(
        ["node", "--input-type=module", "--eval", runner],
        check=True,
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    value = json.loads(completed.stdout)

    assert value["runOnlyCompleted"] is None
    assert value["partialCompleted"] is None
    assert value["completedAt"] == "2026-07-02T00:00:00Z"
    assert value["runtimeTiers"] == ["browser", "local"]
    assert value["summary"]["totalCompleted"] == 1
    assert value["summary"]["creditedOutcomeCount"] == 2
    assert value["summary"]["independentOutcomeCount"] == 2
    assert value["summary"]["masteredOutcomeCount"] == 0
    assert value["beforeReviews"] == {"reviews": [], "totalDue": 0}
    assert value["afterReviews"]["totalDue"] == 1
    assert value["afterReviews"]["reviews"][0]["lessonKey"] == "python/completion"
    assert value["afterReviews"]["reviews"][0]["nextReviewAt"] == "2026-07-09T00:00:00.000Z"


def testPolicyCopiesAndLegacyMasteryWritersStayOutsideCanonicalFlow() -> None:
    source = (ROOT / "contracts" / "masteryPolicy.v1.json").read_bytes()
    assert (ROOT / "src" / "codaro" / "generatedContracts" / "masteryPolicy.v1.json").read_bytes() == source
    assert (ROOT / "editor" / "src" / "lib" / "generatedContracts" / "masteryPolicy.v1.json").read_bytes() == source
    checkFlow = (ROOT / "src" / "codaro" / "curriculum" / "checkFlow.py").read_text(encoding="utf-8")
    bridge = (ROOT / "src" / "codaro" / "curriculum" / "learnerStateBridge.py").read_text(encoding="utf-8")
    outcomeMastery = (ROOT / "src" / "codaro" / "curriculum" / "outcomeMastery.py").read_text(encoding="utf-8")
    assert ".recordEvidence(" not in checkFlow
    assert ".creditCheckPass(" not in checkFlow
    assert ".recordSectionResult(" not in checkFlow
    assert "BLEND_PROGRESS_WEIGHT" not in bridge
    assert "BLEND_LEARNER_WEIGHT" not in bridge
    assert "COMPLETED_CONTRIB" not in outcomeMastery
    assert "ACCESSED_CONTRIB" not in outcomeMastery
    assert "FAST_TRACK_MASTERY_BOOST" not in outcomeMastery
