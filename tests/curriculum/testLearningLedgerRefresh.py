from __future__ import annotations

import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("ledgerRefresh", ROOT / "docs/skills/ops/tools/buildLearningLedgers.py")
assert SPEC and SPEC.loader
LEDGER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(LEDGER)


class LearningLedgerRefreshTest(unittest.TestCase):
    def testHistoricTransitionDoesNotFreezeCurrentComposition(self):
        history = LEDGER.loadYaml(LEDGER.TAXONOMY_TRANSITION_PATH)
        self.assertEqual(LEDGER.validateAppliedTransition(history), [])
        corrupted = {**history, "pathDiffs": [*history["pathDiffs"], history["pathDiffs"][0]]}
        self.assertTrue(LEDGER.validateAppliedTransition(corrupted))

    def testPathProjectionUsesCurrentPlan(self):
        current = {"pathId": "pdfAutomation"}
        plan = {"targetOutcomes": ["automation.pdf.extract"], "gaps": [],
                "lessonRefs": ["pdf/01_intro", "pdf/04_표추출"]}
        projected = LEDGER.renderedPathLedger(current, plan, 472, "taxonomy", "source")
        self.assertEqual([row["lessonRef"] for row in projected["lessons"]], plan["lessonRefs"])
        self.assertEqual(projected["sourceSetHash"], "source")
        self.assertEqual(projected["lessons"][1]["order"], 2)

    def testInvalidInputDoesNotWriteAnyLedger(self):
        with patch.object(LEDGER, "ownerRegistry", return_value={}), \
                patch.object(LEDGER, "applyLedgerWrites") as write:
            failures = LEDGER.evaluate(write=True)
        self.assertTrue(any("owner" in failure for failure in failures))
        write.assert_not_called()

    def testWriteFailureRestoresExactOriginalBytes(self):
        with tempfile.TemporaryDirectory() as temporary:
            folder = Path(temporary)
            first, second = folder / "first.yml", folder / "second.yml"
            first.write_bytes(b"before\r\n")
            second.write_bytes(b"second\r\n")
            original = Path.write_text

            def failSecond(path, text, *args, **kwargs):
                if path == second:
                    path.write_bytes(b"partial")
                    raise OSError("simulated write failure")
                return original(path, text, *args, **kwargs)

            with patch.object(Path, "write_text", failSecond), self.assertRaises(OSError):
                LEDGER.applyLedgerWrites({first: "after\n", second: "after\n"})
            self.assertEqual(first.read_bytes(), b"before\r\n")
            self.assertEqual(second.read_bytes(), b"second\r\n")


if __name__ == "__main__":
    unittest.main()
