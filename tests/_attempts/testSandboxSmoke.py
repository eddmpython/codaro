"""실험 샌드박스가 격리된 채로 배선·실행 가능한지 확인하는 smoke.

이 파일은 운영 `backend` 게이트에 의도적으로 **수집되지 않는다**
(`pytest tests/`는 `--ignore=tests/_attempts`로 실행된다). 오직 전용 비운영
게이트 `tests/run.py gate attempts`(`pytest tests/_attempts`)로만 실행된다.
"""

from pathlib import Path


ATTEMPTS_ROOT = Path(__file__).resolve().parent
EXPERIMENT_CATEGORIES = ("browserPersistence", "osAutomation")


def testExperimentCategoriesExist() -> None:
    for category in EXPERIMENT_CATEGORIES:
        assert (ATTEMPTS_ROOT / category).is_dir(), f"실험 카테고리 누락: {category}"


def testReadmeContractPresent() -> None:
    readme = ATTEMPTS_ROOT / "README.md"
    assert readme.is_file(), "_attempts 계약 문서(README.md)가 없다"
    text = readme.read_text(encoding="utf-8")
    assert "--ignore=tests/_attempts" in text, "격리 계약 문구가 README에서 빠졌다"
