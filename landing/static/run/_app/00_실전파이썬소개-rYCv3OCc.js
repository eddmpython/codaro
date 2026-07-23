var e=`meta:
  id: 00_실전파이썬소개
  title: 실전파이썬 소개
  category: practical
  tags:
  - 실전
  - 로컬도구
  - 앱
  - 자동화
intro:
  direction: 실전파이썬 소개에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 입력 데이터 확인 후 핵심 처리에 맞는 코드 입력을 고릅니다.
  - 실전파이썬 소개 결과를 출력과 상태 기준으로 즉시 점검합니다.
  - 완료한 코드를 업무 자동화 조각에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 실전파이썬이란? 입력 확인
      detail: 입력 기준(입력 데이터)과 필요한 조건을 먼저 고정합니다.
    - label: 왜 실전파이썬인가? 처리 실행
      detail: 핵심 처리 코드를 실행해 중간 결과를 확인합니다.
    - label: 왜 Codaro 로컬 셀인가? 결과 검증
      detail: 출력과 상태 기준으로 실행 결과를 비교합니다.
    - label: 실전파이썬 소개 재사용
      detail: 완성 코드를 업무 자동화 조각에 붙일 수 있게 정리합니다.
    runtime:
    - label: 업무 코드 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 실전파이썬 소개 실행
      detail: 셀을 실행해 출력과 상태와 예외 상태를 확인합니다.
    - label: 실전파이썬 소개 완료
      detail: 검증된 코드를 업무 자동화 조각로 남깁니다.
sections:
- id: concept
  title: 실전파이썬이란?
  subtitle: 학습과 실용을 동시에
  blocks:
  - type: text
    content: 실전파이썬은 실제 업무에서 마주치는 반복 작업을 Python으로 자동화하는 프로젝트 모음입니다. 각 프로젝트는 두 가지를 제공합니다. 첫째, 바로 실행할 수 있는
      Codaro 로컬 도구. 둘째, 그 도구를 어떻게 만드는지 배우는 학습 콘텐츠. 도구가 필요하면 앱을 쓰고, 원리가 궁금하면 학습 페이지에서 배우세요.
  - type: compare
    left:
      icon: 🎓
      title: 학습 페이지
      subtitle: study.yaml
      items:
      - 앱 제작 과정을 단계별로 설명
      - Codaro 로컬 실행 흐름 이해
      - Codaro 셀과 UI 구성법
      - 실무 팁과 확장 아이디어
    right:
      icon: 🚀
      title: Codaro 로컬 도구
      subtitle: note.py
      items:
      - 웹에서 바로 실행 가능
      - 파일 업로드/다운로드 지원
      - 인터랙티브 UI
      - 코드 수정 없이 사용
  goal: 실전파이썬이란?에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.
- id: philosophy
  title: 왜 실전파이썬인가?
  subtitle: 학습과 실용의 연결
  blocks:
  - type: text
    content: 많은 Python 강의가 문법과 개념에 집중합니다. 리스트, 딕셔너리, 함수를 배우지만 '그래서 뭘 만들지?'라는 질문에 답하기 어렵습니다. 실전파이썬은 반대로
      접근합니다. 먼저 실제로 유용한 도구를 보여주고, 그 도구를 만드는 과정에서 필요한 개념을 자연스럽게 배웁니다.
  - type: featureCards
    cards:
    - emoji: 🎯
      title: 목표 지향
      description: 무엇을 만들지 먼저 정하고, 거기에 필요한 것만 배웁니다
    - emoji: ⚡
      title: 즉시 활용
      description: 배운 즉시 실제 업무에 적용할 수 있는 도구를 얻습니다
    - emoji: 🔄
      title: 양방향 연결
      description: 앱이 궁금하면 학습으로, 학습 후엔 앱으로 돌아갑니다
  goal: 왜 실전파이썬인가?에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.
- id: Codaro
  title: 왜 Codaro 로컬 셀인가?
  subtitle: 로컬에서 실행되는 Python
  blocks:
  - type: text
    content: Codaro는 로컬 Python을 기반으로 하는 반응형 노트북입니다. Jupyter와 비슷하지만 순수 Python 파일로 저장해 Git 관리가 쉽고, 셀 간 의존성을
      추적해 값이 바뀌면 관련 셀을 다시 실행할 수 있습니다.
  - type: featureCards
    cards:
    - emoji: 🌐
      title: 웹 기반 실행
      description: Codaro 로컬 Python 커널로 실행. 파일 I/O와 패키지 사용까지 로컬 기준으로 실습
    - emoji: ⚡
      title: 반응형 셀
      description: UI 값이 바뀌면 관련 셀이 자동 재실행. 인터랙티브 앱 제작이 쉬움
    - emoji: 📄
      title: 순수 Python
      description: .py 파일로 저장. Git diff가 깔끔하고 코드 리뷰가 가능
  - type: note
    title: Codaro 로컬 Python 환경의 특징
    content: Codaro 로컬 Python는 사용자의 작업공간에서 Python을 실행합니다. glob, pathlib, 로컬 파일 읽기/쓰기, 패키지 설치, 네트워크 요청,
      데이터 처리, 시각화를 모두 로컬 기준으로 실습할 수 있습니다.
  goal: 왜 Codaro 로컬 셀인가?에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.
- id: tools
  title: 제공하는 도구들
  subtitle: 실무에서 바로 사용하세요
  blocks:
  - type: text
    content: 실전파이썬은 파일 처리, 데이터 변환, 텍스트 처리 등 다양한 분야의 도구를 제공합니다. 각 도구는 실제 업무에서 자주 마주치는 반복 작업을 자동화합니다. 아래는
      현재 제공 중이거나 준비 중인 도구 목록입니다.
  - type: featureCards
    cards:
    - emoji: 📊
      title: 엑셀 파일 병합
      description: 여러 엑셀 파일을 수직/수평으로 합치기
    - emoji: 📑
      title: PDF 병합
      description: 여러 PDF를 하나로 합치기 (준비중)
    - emoji: 🖼️
      title: 이미지 일괄 변환
      description: PNG/JPG 포맷 변환 및 리사이즈 (준비중)
    - emoji: 📝
      title: CSV 인코딩 변환
      description: EUC-KR ↔ UTF-8 변환 (준비중)
  goal: 제공하는 도구들에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.
- id: howToUse
  title: 사용 방법
  subtitle: 두 가지 경로
  blocks:
  - type: text
    content: 실전파이썬은 두 가지 방식으로 사용할 수 있습니다. 도구가 당장 필요하다면 Codaro 로컬 도구로 바로 이동하세요. 원리를 이해하고 싶거나 비슷한 도구를 직접
      만들고 싶다면 학습 페이지를 먼저 살펴보세요.
  - type: compare
    left:
      icon: 🚀
      title: 도구 먼저 사용
      subtitle: 급하게 필요할 때
      items:
      - 사이드바에서 원하는 도구 선택
      - Codaro 로컬 도구에서 바로 사용
      - 사용 후 '어떻게 만들었지?' 궁금하면
      - 학습 페이지 링크 클릭
    right:
      icon: 🎓
      title: 학습 먼저 하기
      subtitle: 원리를 이해하고 싶을 때
      items:
      - 학습 페이지에서 단계별 설명 읽기
      - 코드 블록 따라 실행해보기
      - 원리 이해 후
      - Codaro 로컬 도구에서 실제 사용
  goal: 사용 방법에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.
- id: workflow_validation
  title: '현업 흐름 검증: 작은 업무 규칙을 Python으로 고정하기'
  structuredPrimary: true
  subtitle: 예측 → 실행 → 오류 수정 → 검증 → 실무 변주
  goal: '현업 흐름 검증: 작은 업무 규칙을 Python으로 고정하기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: 입문 과정도 소개에서 끝나면 안 됩니다. 아주 작은 업무 규칙을 함수로 만들고, 잘못된 입력을 먼저 실패시킨 뒤, 예상 결과를 assert로 고정해야 실제
    학습으로 이어집니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def normalizeTask(rawTask):
        title = rawTask.get('title', '').strip()
        status = rawTask.get('status', '').strip().lower()
        minutes = int(rawTask.get('minutes', 0))

        if not title:
            raise ValueError('title is required')
        if status not in {'todo', 'doing', 'done'}:
            raise ValueError('unsupported status')
        if minutes <= 0:
            raise ValueError('minutes must be positive')

        return {
            'title': title,
            'status': status,
            'minutes': minutes,
            'urgent': status != 'done' and minutes >= 60,
        }

    task = normalizeTask({'title': '  report ', 'status': 'DOING', 'minutes': '75'})
    assert task == {'title': 'report', 'status': 'doing', 'minutes': 75, 'urgent': True}
    task
  exercise:
    prompt: '현업 흐름 검증: 작은 업무 규칙을 Python으로 고정하기 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'
    starterCode: |-
      def normalizeTask(rawTask):
          title = rawTask.get('title', '').strip()
          status = rawTask.get('status', '').strip().lower()
          minutes = int(rawTask.get('minutes', 0))

          if not title:
              raise ValueError('title is required')
          if status not in {'todo', 'doing', 'done'}:
              raise ValueError('unsupported status')
          if minutes <= 0:
              raise ValueError('minutes must be positive')

          return {
              'title': title,
              'status': status,
              'minutes': minutes,
              'urgent': status != 'done' and minutes >= 60,
          }

      task = normalizeTask({'title': '  report ', 'status': 'DOING', 'minutes': '75'})
      assert task == {'title': 'report', 'status': 'doing', 'minutes': 75, 'urgent': True}
      task
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: '현업 흐름 검증: 작은 업무 규칙을 Python으로 고정하기의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'
    resultCheck: '현업 흐름 검증: 작은 업무 규칙을 Python으로 고정하기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'
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
  - id: 00_실전파이썬소개-office-workflow-admission-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - concept
    - workflow_validation
    title: 실전 Office 자동화 업무의 입장 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 목표·입력·산출물·권한·검증 없는 실행을 차단한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 실행 전에 업무 목표와 입력·출력 identity를 문서화하세요.
    - 덮어쓰기 같은 파괴 효과는 별도 권한을 요구하세요.
    exercise:
      prompt: audit_office_workflow(workflow)를 완성하세요.
      starterCode: |-
        def audit_office_workflow(workflow):
            raise NotImplementedError
      solution: |
        def audit_office_workflow(workflow):
            required = {"goal", "inputs", "output", "permissions", "verification"}
            missing = sorted(required - set(workflow))
            failures = []
            if not workflow.get("inputs"):
                failures.append("inputs")
            if workflow.get("destructive") and "destructive-write" not in workflow.get("permissions", []):
                failures.append("authorization")
            if not workflow.get("verification"):
                failures.append("verification")
            return {"ready": not missing and not failures, "missing": missing, "failures": failures, "riskLevel": "high" if workflow.get("destructive") else "bounded"}
      hints: *id001
    check:
      id: python.office-practical.00_실전파이썬소개.office-workflow-admission.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.office-practical.00_실전파이썬소개.office-workflow-admission.mastery.behavior.v1.fixture
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
        entry: audit_office_workflow
        cases:
        - id: accepts-bounded-workflow
          arguments:
          - value:
              goal: monthly report
              inputs:
              - sales.csv
              output: report.xlsx
              permissions: []
              verification:
              - reopen
              - reconcile
          expectedReturn:
            ready: true
            missing: []
            failures: []
            riskLevel: bounded
        - id: reports-destructive-authorization
          arguments:
          - value:
              goal: replace
              inputs:
              - old.xlsx
              output: old.xlsx
              permissions: []
              verification:
              - reopen
              destructive: true
          expectedReturn:
            ready: false
            missing: []
            failures:
            - authorization
            riskLevel: high
        - id: reports-missing-contract
          arguments:
          - value:
              goal: report
              inputs: []
              output: a.docx
              permissions: []
              verification: []
          expectedReturn:
            ready: false
            missing: []
            failures:
            - inputs
            - verification
            riskLevel: bounded
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 00_실전파이썬소개-office-workflow-dag-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - 00_실전파이썬소개-office-workflow-admission-mastery
    title: 새 Office 자동화의 실행 DAG와 차단 조건 만들기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 검증되지 않은 단계 뒤에 artifact 효과가 이어지지 않게 한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 각 단계에 안정적인 ID와 dependency를 부여하세요.
    - 파일·메일·Excel 효과 단계에는 검증 evidence가 반드시 있어야 합니다.
    exercise:
      prompt: validate_office_dag(steps)를 완성하세요.
      starterCode: |-
        def validate_office_dag(steps):
            raise NotImplementedError
      solution: |
        def validate_office_dag(steps):
            ids = [step["id"] for step in steps]
            known = set(ids)
            missing_dependencies = sorted({dep for step in steps for dep in step.get("dependsOn", []) if dep not in known})
            unsafe_effects = sorted(step["id"] for step in steps if step.get("effect") and not step.get("evidence"))
            duplicate_ids = sorted({value for value in ids if ids.count(value) > 1})
            failures = []
            if duplicate_ids:
                failures.append("identity")
            if missing_dependencies:
                failures.append("dependency")
            if unsafe_effects:
                failures.append("evidence")
            return {"ready": not failures, "failures": failures, "duplicates": duplicate_ids, "missingDependencies": missing_dependencies, "unsafeEffects": unsafe_effects}
      hints: *id002
    check:
      id: python.office-practical.00_실전파이썬소개.office-workflow-dag.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.office-practical.00_실전파이썬소개.office-workflow-dag.transfer.behavior.v1.fixture
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
        entry: validate_office_dag
        cases:
        - id: accepts-evidenced-dag
          arguments:
          - value:
            - id: validate
            - id: write
              dependsOn:
              - validate
              effect: xlsx
              evidence: reopen
          expectedReturn:
            ready: true
            failures: []
            duplicates: []
            missingDependencies: []
            unsafeEffects: []
        - id: reports-dependency
          arguments:
          - value:
            - id: write
              dependsOn:
              - missing
              effect: docx
              evidence: reopen
          expectedReturn:
            ready: false
            failures:
            - dependency
            duplicates: []
            missingDependencies:
            - missing
            unsafeEffects: []
        - id: reports-identity-and-evidence
          arguments:
          - value:
            - id: write
              effect: xlsx
            - id: write
          expectedReturn:
            ready: false
            failures:
            - identity
            - evidence
            duplicates:
            - write
            missingDependencies: []
            unsafeEffects:
            - write
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 00_실전파이썬소개-office-release-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - 00_실전파이썬소개-office-workflow-dag-transfer
    title: 실전 Office 자동화 릴리스 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 입장·실행·재개방·업무 대조를 기억에서 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 버튼 클릭 성공이 아니라 업무 결과의 증거를 요구하세요.
    - artifact 유효성과 업무 값 정확성은 서로 다른 검증 단계입니다.
    exercise:
      prompt: choose_office_release_evidence(stage)를 완성하세요.
      starterCode: |-
        def choose_office_release_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_office_release_evidence(stage):
            table = {"admission": {"action": "pin goal inputs outputs permissions", "evidence": "workflow contract", "risk": "wrong task"}, "execution": {"action": "run dependency-ordered bounded effects", "evidence": "step ledger", "risk": "partial automation"}, "artifact": {"action": "reopen and render outputs", "evidence": "artifact checks", "risk": "corrupt or unreadable file"}, "business": {"action": "reconcile counts totals identities", "evidence": "business report", "risk": "valid artifact with wrong result"}}
            if stage not in table:
                raise ValueError("unknown stage")
            return table[stage]
      hints: *id003
    check:
      id: python.office-practical.00_실전파이썬소개.office-release-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.office-practical.00_실전파이썬소개.office-release-recall.retrieval.behavior.v1.fixture
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
        entry: choose_office_release_evidence
        cases:
        - id: recalls-admission
          arguments:
          - value: admission
          expectedReturn:
            action: pin goal inputs outputs permissions
            evidence: workflow contract
            risk: wrong task
        - id: recalls-artifact
          arguments:
          - value: artifact
          expectedReturn:
            action: reopen and render outputs
            evidence: artifact checks
            risk: corrupt or unreadable file
        - id: recalls-business
          arguments:
          - value: business
          expectedReturn:
            action: reconcile counts totals identities
            evidence: business report
            risk: valid artifact with wrong result
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};