from __future__ import annotations

import argparse
import ast
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
CURRICULUM_ROOT = ROOT / "curricula" / "python"
EXPECTED_PATHS = (
    "automation/office/email/illustration.py",
    "automation/office/excel/illustration.py",
    "automation/office/pdf/illustration.py",
    "automation/office/practical/illustration.py",
    "automation/office/word/illustration.py",
    "automation/office/xlwings/illustration.py",
    "automation/text/regex/illustration.py",
    "basics/30days/illustration.py",
    "basics/advancedPython/illustration.py",
    "dataAnalysis/duckdb/illustration.py",
    "dataAnalysis/numpy/illustration.py",
    "dataAnalysis/pandas/illustration.py",
    "dataAnalysis/polars/illustration.py",
    "imageVision/opencv/illustration.py",
    "mathStatsMl/sklearn/illustration.py",
    "mathStatsMl/statsmodels/illustration.py",
    "mathStatsMl/sympy/illustration.py",
    "visualization/altair/illustration.py",
    "visualization/matplotlib/illustration.py",
    "visualization/plotly/illustration.py",
    "visualization/seaborn/illustration.py",
)


def validateLegacyModule(path: Path) -> None:
    if path.is_symlink():
        raise RuntimeError(f"refusing symlink: {path}")
    resolved = path.resolve(strict=True)
    if not resolved.is_relative_to(CURRICULUM_ROOT.resolve(strict=True)):
        raise RuntimeError(f"path escaped curriculum root: {resolved}")
    tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
    names = {
        target.id
        for node in tree.body
        if isinstance(node, ast.Assign)
        for target in node.targets
        if isinstance(target, ast.Name)
    }
    if names - {"SVG", "CODE_PREVIEW"}:
        raise RuntimeError(f"legacy module gained executable ownership: {path}")
    if "SVG" not in names:
        raise RuntimeError(f"legacy module has no SVG assignment: {path}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()

    expected = {CURRICULUM_ROOT / relative for relative in EXPECTED_PATHS}
    discovered = set(CURRICULUM_ROOT.rglob("illustration.py"))
    unexpected = sorted(path for path in discovered if path not in expected)
    if unexpected:
        joined = ", ".join(path.relative_to(ROOT).as_posix() for path in unexpected)
        raise RuntimeError(f"unreviewed illustration modules found: {joined}")

    existing = sorted(path for path in expected if path.exists())
    if not existing:
        print("ok: unused curriculum illustration modules remain absent")
        return 0
    if not args.write:
        raise RuntimeError(f"{len(existing)} unused curriculum illustration modules remain")

    for path in existing:
        validateLegacyModule(path)
    for path in existing:
        path.unlink()
    print(f"ok: removed {len(existing)} unused curriculum illustration modules")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
