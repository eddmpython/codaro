var e=`meta:
  id: fileOps_02
  title: 파일 읽고 쓰기
  order: 2
  category: fileOps
  difficulty: easy
  audience: 파일 자동화에 입문하는 Python 학습자
  packages: []
  tags:
    - pathlib
    - encoding
    - json
intro:
  direction: tempfile 작업 폴더에서 텍스트와 JSON 파일을 안전하게 쓰고 읽어 자동화 결과를 영속화한다.
  benefits:
    - read_text와 write_text로 짧은 파일을 한 줄에 다룬다.
    - encoding 인자를 항상 명시해 한글이 깨지지 않는 코드를 작성한다.
    - 자동화 결과를 JSON으로 저장해 다음 단계에서 다시 읽는다.
    - with open 컨텍스트로 큰 파일이나 줄 단위 처리를 분리한다.
  diagram:
    steps:
      - label: 임시 폴더 안 파일 쓰기
        detail: Path.write_text로 UTF-8 문자열을 저장하고 mtime이 갱신된다.
      - label: 동일 파일 다시 읽기
        detail: read_text로 저장한 내용을 그대로 받아 메모리에 올린다.
      - label: JSON 직렬화 왕복
        detail: dict를 json.dumps로 직렬화해 저장하고 json.loads로 복원한다.
      - label: 줄 단위 처리
        detail: with open + readline으로 큰 파일에서 필요한 줄만 골라낸다.
    runtime:
      - label: 표준 라이브러리만 사용
        detail: pathlib, tempfile, json 모듈만 호출하므로 별도 패키지가 필요 없다.
      - label: 결과 assert 검증
        detail: 저장한 값과 다시 읽은 값이 일치하는지 assert로 확인한다.
sections:
  - id: text-write-read
    title: 텍스트를 저장하고 다시 읽기
    structuredPrimary: true
    subtitle: write_text + read_text 왕복
    goal: 같은 파일에 짧은 문자열을 저장한 뒤 그대로 다시 읽는다.
    why: 자동화 산출물의 가장 작은 단위가 텍스트 파일 한 개이므로 왕복이 100퍼센트 동일해야 다음 단계가 안전하다.
    explanation: Path.write_text는 모드 w로 열고 한 번에 문자열을 쓴 뒤 닫는 단축 메서드다. Path.read_text는 반대 방향으로 같은 인자를 받는다. encoding을 명시하지 않으면 운영체제 기본 인코딩이 쓰여 한글이 깨질 수 있으므로 항상 utf-8을 넘긴다.
    tips:
      - 동일한 encoding을 양쪽에 쓰지 않으면 한글이 cp949 등으로 해석되어 깨진다.
      - write_text는 파일이 없으면 만들고 있으면 통째로 덮어쓴다.
    snippet: |-
      import tempfile
      from pathlib import Path

      with tempfile.TemporaryDirectory() as td:
          note = Path(td) / "today.txt"
          note.write_text("자동화 시작", encoding="utf-8")
          restored = note.read_text(encoding="utf-8")

      assert restored == "자동화 시작"
      restored
    exercise:
      prompt: greeting.txt 파일에 "안녕 codaro" 문자열을 저장하고 다시 읽어 greeting 변수에 담아 검증하세요.
      starterCode: |-
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            note = Path(td) / "___"
            note.write_text("___", encoding="utf-8")
            greeting = note.read_text(encoding="___")

        assert greeting == "안녕 codaro"
        greeting
      solution: |-
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            note = Path(td) / "greeting.txt"
            note.write_text("안녕 codaro", encoding="utf-8")
            greeting = note.read_text(encoding="utf-8")

        assert greeting == "안녕 codaro"
        greeting
      hints:
        - 파일 이름과 저장하는 문자열, 두 곳을 일치시켜야 검증이 통과한다.
        - encoding은 양쪽에서 동일하게 utf-8을 넘긴다.
      check:
        noError: write_text와 read_text 호출이 FileNotFoundError 없이 끝나야 한다.
        resultCheck: greeting 변수가 본문에서 저장한 문자열과 정확히 동일해야 한다.
    check:
      noError: 임시 폴더 안에서 write_text와 read_text가 차례로 실행되어야 한다.
      resultCheck: restored 변수가 저장한 한글 문자열과 일치해야 한다.
  - id: encoding-mismatch
    title: 인코딩을 의도적으로 통일하기
    structuredPrimary: true
    subtitle: utf-8과 cp949 비교
    goal: 잘못된 인코딩으로 읽었을 때 어떤 결과가 나오는지 확인하고 항상 utf-8을 명시하는 습관을 만든다.
    why: 한글 자동화에서 인코딩 사고는 데이터를 통째로 망가뜨릴 수 있어서 한 번 직접 마주쳐 보는 경험이 중요하다.
    explanation: 파일을 utf-8로 저장하고 cp949로 읽으면 UnicodeDecodeError가 발생할 수 있다. 이를 잡아내려면 try/except로 좁힌 예외를 받고, 정상 경로에서는 항상 utf-8을 명시한다. errors="replace"는 디코딩 실패를 물음표로 대체하지만 자동화에서는 원본 데이터를 잃지 않기 위해 제한적으로만 쓴다.
    tips:
      - cp949로 read_text를 호출하기 전에 try/except를 둬야 실습이 중간에 멈추지 않는다.
      - utf-8-sig는 BOM을 다루며 일반 utf-8과는 다른 인코딩이다.
    snippet: |-
      import tempfile
      from pathlib import Path

      with tempfile.TemporaryDirectory() as td:
          note = Path(td) / "menu.txt"
          note.write_text("김치찌개", encoding="utf-8")
          try:
              wrong = note.read_text(encoding="cp949")
          except UnicodeDecodeError:
              wrong = None
          correct = note.read_text(encoding="utf-8")
          result = {"wrong": wrong, "correct": correct}

      assert result["correct"] == "김치찌개"
      assert result["wrong"] != "김치찌개"
      result
    exercise:
      prompt: '"라면" 문자열을 utf-8로 저장한 뒤 cp949 디코딩이 UnicodeDecodeError를 일으키는지 wrong 키에 None이 담기는지 검증하세요.'
      starterCode: |-
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            note = Path(td) / "dish.txt"
            note.write_text("___", encoding="utf-8")
            try:
                wrong = note.read_text(encoding="___")
            except UnicodeDecodeError:
                wrong = None
            correct = note.read_text(encoding="utf-8")
            result = {"wrong": wrong, "correct": correct}

        assert result["correct"] == "라면"
        assert result["wrong"] is None
        result
      solution: |-
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            note = Path(td) / "dish.txt"
            note.write_text("라면", encoding="utf-8")
            try:
                wrong = note.read_text(encoding="cp949")
            except UnicodeDecodeError:
                wrong = None
            correct = note.read_text(encoding="utf-8")
            result = {"wrong": wrong, "correct": correct}

        assert result["correct"] == "라면"
        assert result["wrong"] is None
        result
      hints:
        - 한글 두 글자가 utf-8에서는 6바이트지만 cp949 해석은 실패할 수 있다.
        - except 절은 UnicodeDecodeError만 좁혀 받아야 다른 오류를 숨기지 않는다.
      check:
        noError: try/except 블록이 정상 경로와 실패 경로 모두에서 빠져나와야 한다.
        resultCheck: result["correct"]가 저장한 문자열과 같고 result["wrong"]은 None이어야 한다.
    check:
      noError: utf-8 저장과 cp949 시도가 try 블록 안에서 모두 처리되어야 한다.
      resultCheck: 정상 디코딩만 원본 문자열과 일치해야 한다.
  - id: json-roundtrip
    title: JSON 직렬화 왕복
    structuredPrimary: true
    subtitle: dict 저장과 복원
    goal: 자동화 결과 dict를 JSON 문자열로 저장하고 다시 dict로 복원한다.
    why: JSON은 보고서, 설정, 캐시를 저장하는 자동화 표준 형식이며 같은 dict로 왕복되어야 다음 실행이 안전하다.
    explanation: json.dumps는 dict를 JSON 문자열로 직렬화하고 ensure_ascii=False를 넘기면 한글이 그대로 저장된다. 파일에는 write_text로 저장하고 다시 read_text한 뒤 json.loads로 dict로 복원한다. indent를 지정하면 사람이 읽기 좋은 형태가 된다.
    tips:
      - ensure_ascii=False를 빼면 한글이 \\uXXXX로 저장되어 파일이 커진다.
      - indent=2를 주면 들여쓰기가 들어간 보기 좋은 JSON이 된다.
    snippet: |-
      import json
      import tempfile
      from pathlib import Path

      payload = {"기준일": "2024-09-01", "처리건수": 12}

      with tempfile.TemporaryDirectory() as td:
          target = Path(td) / "report.json"
          target.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
          restored = json.loads(target.read_text(encoding="utf-8"))

      assert restored == payload
      restored
    exercise:
      prompt: 주문 수와 환불 수를 담은 dict를 ensure_ascii=False JSON으로 저장하고 다시 읽어 원본 dict와 동일한지 검증하세요.
      starterCode: |-
        import json
        import tempfile
        from pathlib import Path

        payload = {"주문": 24, "환불": 3}

        with tempfile.TemporaryDirectory() as td:
            target = Path(td) / "summary.json"
            target.write_text(json.dumps(payload, ensure_ascii=___, indent=2), encoding="utf-8")
            restored = json.___(target.read_text(encoding="utf-8"))

        assert restored == payload
        restored
      solution: |-
        import json
        import tempfile
        from pathlib import Path

        payload = {"주문": 24, "환불": 3}

        with tempfile.TemporaryDirectory() as td:
            target = Path(td) / "summary.json"
            target.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
            restored = json.loads(target.read_text(encoding="utf-8"))

        assert restored == payload
        restored
      hints:
        - ensure_ascii=False여야 한글이 그대로 저장되어 파일을 사람도 읽을 수 있다.
        - JSON 문자열에서 dict로 돌아오는 함수는 json.loads다.
      check:
        noError: json.dumps와 json.loads가 차례로 호출되어 JSONDecodeError 없이 끝나야 한다.
        resultCheck: restored 딕셔너리가 원본 payload와 키, 값, 순서까지 동일해야 한다.
    check:
      noError: JSON 직렬화와 파일 쓰기, 다시 읽기와 역직렬화 네 단계가 모두 통과해야 한다.
      resultCheck: restored가 원본 payload dict와 동일해야 한다.
  - id: line-by-line
    title: 줄 단위 처리로 종합 실습
    structuredPrimary: true
    subtitle: with open으로 큰 파일 읽기
    goal: 로그 형태의 다중 라인 파일을 만들고 키워드 줄만 골라 결과 리스트에 모은다.
    why: 자동화 입력이 커질수록 한 번에 메모리에 올리는 read_text보다 줄 단위 반복이 안정적이며 종합 정리 단계의 표준 패턴이다.
    explanation: with open은 컨텍스트가 끝나면 자동으로 파일을 닫는다. 파일 객체를 for 루프로 돌리면 한 줄씩 끝의 개행을 포함해 받는다. strip으로 개행을 제거하고 필요한 줄만 골라 리스트에 모으면 종합 리포트의 기초가 된다.
    tips:
      - 큰 파일은 read_text 대신 줄 단위 반복을 써야 메모리가 안전하다.
      - 마지막 줄에 개행이 없을 수도 있으므로 strip 결과로 판정하는 편이 안전하다.
    snippet: |-
      import tempfile
      from pathlib import Path

      lines = [
          "2024-09-01 OK 주문 완료",
          "2024-09-01 ERR 결제 실패",
          "2024-09-01 OK 배송 시작",
          "2024-09-01 ERR 환불 처리",
      ]

      with tempfile.TemporaryDirectory() as td:
          log = Path(td) / "activity.log"
          log.write_text("\\n".join(lines) + "\\n", encoding="utf-8")
          errorLines = []
          with open(log, encoding="utf-8") as f:
              for raw in f:
                  cleaned = raw.strip()
                  if " ERR " in cleaned:
                      errorLines.append(cleaned)

      assert errorLines == [
          "2024-09-01 ERR 결제 실패",
          "2024-09-01 ERR 환불 처리",
      ]
      errorLines
    exercise:
      prompt: 위 lines에서 " OK " 문자열이 들어간 줄만 골라 okLines 리스트에 담고 두 줄이 모이는지 검증하세요.
      starterCode: |-
        import tempfile
        from pathlib import Path

        lines = [
            "2024-09-01 OK 주문 완료",
            "2024-09-01 ERR 결제 실패",
            "2024-09-01 OK 배송 시작",
            "2024-09-01 ERR 환불 처리",
        ]

        with tempfile.TemporaryDirectory() as td:
            log = Path(td) / "activity.log"
            log.write_text("\\n".join(lines) + "\\n", encoding="utf-8")
            okLines = []
            with open(log, encoding="utf-8") as f:
                for raw in f:
                    cleaned = raw.___()
                    if " ___ " in cleaned:
                        okLines.append(cleaned)

        assert okLines == [
            "2024-09-01 OK 주문 완료",
            "2024-09-01 OK 배송 시작",
        ]
        okLines
      solution: |-
        import tempfile
        from pathlib import Path

        lines = [
            "2024-09-01 OK 주문 완료",
            "2024-09-01 ERR 결제 실패",
            "2024-09-01 OK 배송 시작",
            "2024-09-01 ERR 환불 처리",
        ]

        with tempfile.TemporaryDirectory() as td:
            log = Path(td) / "activity.log"
            log.write_text("\\n".join(lines) + "\\n", encoding="utf-8")
            okLines = []
            with open(log, encoding="utf-8") as f:
                for raw in f:
                    cleaned = raw.strip()
                    if " OK " in cleaned:
                        okLines.append(cleaned)

        assert okLines == [
            "2024-09-01 OK 주문 완료",
            "2024-09-01 OK 배송 시작",
        ]
        okLines
      hints:
        - '개행을 제거하지 않으면 마지막 글자에 줄바꿈 문자가 붙어 비교가 실패한다.'
        - '" OK " 좌우의 공백까지 정확히 포함해야 다른 단어와 섞이지 않는다.'
      check:
        noError: with open 컨텍스트가 열고 닫는 동안 IOError가 발생하지 않아야 한다.
        resultCheck: okLines에 OK 표시가 있는 두 줄이 본문 순서대로 들어가야 한다.
    check:
      noError: 줄 반복과 strip 호출이 정상적으로 끝나야 한다.
      resultCheck: errorLines가 ERR 표시가 있는 두 줄로 채워져 종합 정리 결과가 일관되어야 한다.
assessment:
  schemaVersion: 1
  performanceClaim: 웹에서는 외부 패키지 없이 분석 판단과 데이터 계약을 검증하고, 실제 패키지 API와 산출물은 lesson Run 및 Local 실습 증거로 분리합니다.
  tierParity:
    web: portable-concept
    local: package-practice-and-artifact
  supportPolicy: 첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.
  authoring:
    source: curated-blueprint
    solutionVerification: required
    independentReview: pending
  masteryVariants:
  - id: fileOps_02-text-file-contract-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - text-write-read
    - line-by-line
    title: 텍스트 파일의 encoding·newline·크기 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 읽기 전에 허용 encoding과 byte limit, newline 정책을 검사한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 기본 encoding에 맡기지 말고 입력 파일 계약에 명시하세요.
    - binary null byte와 최대 byte 크기를 읽기 전에 검사하세요.
    exercise:
      prompt: audit_text_file_contract(file_info, contract)를 완성하세요.
      starterCode: |-
        def audit_text_file_contract(file_info, contract):
            raise NotImplementedError
      solution: |
        def audit_text_file_contract(file_info, contract):
            failures = []
            if file_info.get("encoding") not in contract.get("allowedEncodings", []):
                failures.append("encoding")
            if file_info.get("byteLength", 0) > contract.get("maximumBytes", 0):
                failures.append("size")
            if file_info.get("newline") not in contract.get("allowedNewlines", []):
                failures.append("newline")
            if file_info.get("binaryNullBytes", 0) > 0:
                failures.append("binary-content")
            return {"readable": not failures, "failures": failures, "byteLength": file_info.get("byteLength", 0)}
      hints: *id001
    check:
      id: python.fileops.fileOps_02.text-file-contract.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.fileops.fileOps_02.text-file-contract.mastery.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: audit_text_file_contract
        cases:
        - id: accepts-utf8-lf-file
          arguments:
          - value:
              encoding: utf-8
              byteLength: 100
              newline: lf
              binaryNullBytes: 0
          - value:
              allowedEncodings:
              - utf-8
              maximumBytes: 1000
              allowedNewlines:
              - lf
              - crlf
          expectedReturn:
            readable: true
            failures: []
            byteLength: 100
        - id: reports-all-contract-failures
          arguments:
          - value:
              encoding: cp949
              byteLength: 2000
              newline: cr
              binaryNullBytes: 1
          - value:
              allowedEncodings:
              - utf-8
              maximumBytes: 1000
              allowedNewlines:
              - lf
          expectedReturn:
            readable: false
            failures:
            - encoding
            - size
            - newline
            - binary-content
            byteLength: 2000
        - id: accepts-exact-size-limit
          arguments:
          - value:
              encoding: utf-8
              byteLength: 10
              newline: lf
          - value:
              allowedEncodings:
              - utf-8
              maximumBytes: 10
              allowedNewlines:
              - lf
          expectedReturn:
            readable: true
            failures: []
            byteLength: 10
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: fileOps_02-atomic-text-write-plan-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - fileOps_02-text-file-contract-mastery
    title: 새 텍스트 출력에 원자적 write 계획 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: temporary path·flush·replace·검증 순서를 destination별로 만든다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - destination에 직접 쓰지 말고 같은 filesystem의 temporary path를 사용하세요.
    - replace 전후 content hash를 검증하고 동일 내용은 skip하세요.
    exercise:
      prompt: plan_atomic_text_write(destination, content_hash, existing_hash)를 완성하세요.
      starterCode: |-
        def plan_atomic_text_write(destination, content_hash, existing_hash):
            raise NotImplementedError
      solution: |
        def plan_atomic_text_write(destination, content_hash, existing_hash):
            if not content_hash:
                raise ValueError("content hash required")
            unchanged = existing_hash == content_hash
            suffix = content_hash[:8]
            temporary = f"{destination}.tmp-{suffix}"
            steps = [] if unchanged else ["write-temp", "flush-temp", "verify-temp-hash", "replace-destination", "verify-destination-hash"]
            return {"action": "skip" if unchanged else "replace", "temporary": None if unchanged else temporary, "steps": steps, "expectedHash": content_hash}
      hints: *id002
    check:
      id: python.fileops.fileOps_02.atomic-text-write-plan.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.fileops.fileOps_02.atomic-text-write-plan.transfer.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: plan_atomic_text_write
        cases:
        - id: plans-atomic-replace
          arguments:
          - value: /out/report.txt
          - value: abcdef123456
          - value: old
          expectedReturn:
            action: replace
            temporary: /out/report.txt.tmp-abcdef12
            steps:
            - write-temp
            - flush-temp
            - verify-temp-hash
            - replace-destination
            - verify-destination-hash
            expectedHash: abcdef123456
        - id: skips-identical-content
          arguments:
          - value: /out/report.txt
          - value: same
          - value: same
          expectedReturn:
            action: skip
            temporary: null
            steps: []
            expectedHash: same
        - id: rejects-empty-hash
          arguments:
          - value: /out/report.txt
          - value: ''
          - value: null
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: fileOps_02-text-file-io-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - fileOps_02-atomic-text-write-plan-transfer
    title: 텍스트 파일 읽기·쓰기 품질 기준 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: encoding·size·atomic replace evidence를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 파일 action 전에 root·충돌·dry run 계약을 확인하세요.
    - 실행 횟수가 아니라 source와 destination artifact identity로 결과를 판정하세요.
    exercise:
      prompt: choose_text_file_policy(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_text_file_policy(situation):
            raise NotImplementedError
      solution: |
        def choose_text_file_policy(situation):
            table = {'read': {'action': 'validate encoding newline and byte limit', 'evidence': 'input descriptor', 'risk': 'decode or memory failure'}, 'write': {'action': 'write and fsync temporary', 'evidence': 'temporary hash', 'risk': 'partial destination'}, 'replace': {'action': 'atomic replace then verify', 'evidence': 'destination content hash', 'risk': 'stale or corrupt file'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.fileops.fileOps_02.text-file-io-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.fileops.fileOps_02.text-file-io-recall.retrieval.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: choose_text_file_policy
        cases:
        - id: recalls-read
          arguments:
          - value: read
          expectedReturn:
            action: validate encoding newline and byte limit
            evidence: input descriptor
            risk: decode or memory failure
        - id: recalls-write
          arguments:
          - value: write
          expectedReturn:
            action: write and fsync temporary
            evidence: temporary hash
            risk: partial destination
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};