"""테스트 트리 공유 부트스트랩.

도메인 하위 디렉터리(tests/<domain>/)의 pytest 스위트가 tests/ 루트의 공유 헬퍼
(authorReferenceChecks 등)를 bare import 할 수 있도록 tests/ 루트를 sys.path 에 둔다.
verify*.py / audit*.py 게이트 드라이버도 도메인 폴더로 카테고리화되어 run.py가 경로
리터럴로 직접 실행하며, 공유 헬퍼가 필요한 드라이버는 각자 tests/ 루트를 sys.path 에 올린다.
"""

import sys
from pathlib import Path

_testsRoot = str(Path(__file__).resolve().parent)
if _testsRoot not in sys.path:
    sys.path.insert(0, _testsRoot)
