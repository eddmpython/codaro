var e=`# Codaro local curriculum schema
# This file documents the YAML shape used by curricula/python.

# ============================================
# Metadata
# ============================================
# meta:
#   id: "day02"                    # unique content id
#   title: "변수와 내장함수"         # lesson title
#   day: 2                         # optional day number
#   category: "30days"             # folder/category key
#   packages: ["pandas"]           # lesson-local runtime packages; prepared lazily with uv
#   source: "30-Days-Of-Python"    # optional source
#   sourceUrl: "https://..."       # optional source URL
#   tags: ["변수", "함수", "기초"]   # search tags

# ============================================
# Intro Contract
# ============================================
# intro:
#   direction: "이 레슨에서 만드는 능력"
#   benefits:
#     - "과정 후 할 수 있는 일"
#   diagram:
#     steps:
#       - label: "DataFrame 입력 확인"
#         detail: "sales 열과 행 값을 먼저 고정"
#     runtime:
#       - label: "pandas 환경"
#         detail: "pandas 기준으로 로컬 Python 실행 준비"

# ============================================
# Sections
# ============================================
# sections:
#   - id: "section_id"
#     title: "섹션 제목"
#     structuredPrimary: true        # structured fields가 이 섹션의 1차 학습 계약일 때
#     subtitle: "부제목"            # optional
#     goal: "이 섹션을 끝내면 할 수 있는 일"
#     why: "실무/학습에서 중요한 이유"
#     explanation: "3문장 이내 핵심 설명"
#     tips:
#       - "막힐 때 확인할 기준"
#     snippet: |
#       print("read-only example")
#     exercise:
#       prompt: "학습자가 직접 할 일"
#       starterCode: |
#         result = ___
#       solution: |
#         result = "answer"
#       hints:
#         - "개념 힌트"
#     check:
#       # weak/practice check는 feedback만 만들고 completion이나 mastery를 만들지 않는다.
#       type: "noError"
#       noError: "섹션 예제의 입력 데이터, 처리 함수, 출력 확인 단계가 순서대로 실행되어야 한다."
#       resultCheck: "출력 또는 변수 상태가 이 섹션에서 바꾼 업무 조건을 반영해야 한다."
#     # blocks는 structured card 뒤에 붙는 보조 자료 또는 legacy curriculum 변환용이다.
#     # 신규 레슨은 위 structured section fields를 우선하고, 표/영상/참고 링크만 blocks로 보조한다.
#     blocks:
#       - type: "text"
#         content: "..."

# ============================================
# CheckSpec v1 (Web output/behavior vertical slice)
# ============================================
# Run 뒤 별도 검증 버튼 없이 자동 실행된다. 아래 strong spec은 fresh browser Worker,
# fixture hash, SRI asset graph, timeout을 모두 통과한 경우에만 strong evidence를 만든다.
# check:
#   id: "python.print.hello.output.v1"
#   version: 1
#   kind: "output"
#   strength: "strong"
#   executor: "browser-worker"
#   timeoutMs: 8000
#   fixtureId: "python.print.hello.fixture.v1"
#   fixtureHash: "sha256-..."       # canonical compact JSON fixture의 SHA-256 SRI
#   packageAssets:                   # 외부 패키지가 필요할 때만 사용
#     - name: "schedule"
#       version: "1.2.2"
#       url: "check-packages/schedule-1.2.2-py3-none-any.whl"
#       integrity: "sha256-..."     # same-origin wheel bytes의 SHA-256 SRI
#   fixture:
#     directories: []
#     env:
#       LANG: "C.UTF-8"
#       TZ: "UTC"
#     files: []
#     stdin: []
#   payload:
#     comparator: "exact"
#     expected: "Hello Codaro"
#     normalization: "trim-final-newline"
# 현재 Web W0는 output과 callable return+fixture path를 함께 보는 behavior subset을 지원한다.
# packageAssets는 저장소에 고정한 same-origin wheel만 허용하며 Worker boot 전에 SRI를 검증한다.
# variable/file/table/image와 Local sandbox는 아직 지원된 척 작성하지 않는다.
# behavior payload 예시:
#   entry: "create_order_workspace"
#   cases:
#     - id: "creates-two-folders"
#       arguments:
#         - fixturePath: "workspace"
#       expectedReturn: ["배송", "주문"]
#   expectedPaths:
#     - {path: "workspace/배송", kind: "directory", origin: "created"}
#     - {path: "workspace/주문", kind: "directory", origin: "created"}

# ============================================
# Assessment progression
# ============================================
# acquisition section을 이름만 바꿔 세지 않는다. mastery는 base lesson 마지막에 보이고,
# mastery의 strong evidence가 저장되면 transfer가 별도 클릭 없이 자동으로 열린다. retrieval은
# source strong evidence에서 minimumDelayHours가 지난 뒤 자동 materialize한다. 세 variant 모두
# snippet 없이 스스로 풀며 strong CheckSpec과 독립 fixture/check ID를 가진다.
# assessment:
#   masteryVariants:
#     - id: "report-status-mastery"
#       mode: "mastery"
#       unseen: false
#       sourceSectionIds: ["hello-world", "calculation"]
#       title: "배운 규칙으로 상태 한 줄 완성하기"
#       goal: "예시를 보지 않고 출력 규칙을 완성한다."
#       exercise: {prompt: "...", starterCode: "...", solution: "...", hints: ["...", "..."]}
#       check: {id: "...", version: 1, kind: "behavior", strength: "strong", executor: "browser-worker"}
#   transferVariants:
#     - id: "report-status-transfer"
#       mode: "transfer"
#       unseen: true
#       sourceSectionIds: ["report-status-mastery"]
#       title: "새 보고 상태 한 줄 만들기"
#       goal: "처음 보는 상태 문구에 출력 규칙을 적용한다."
#       exercise: {prompt: "...", starterCode: "...", solution: "...", hints: ["...", "..."]}
#       check: {id: "...", version: 1, kind: "output", strength: "strong", executor: "browser-worker"}
#   retrievalVariants:
#     - id: "hello-retrieval-24h"
#       mode: "retrieval"
#       unseen: true
#       minimumDelayHours: 24
#       sourceSectionIds: ["hello-world"]
#       title: "하루 뒤 첫 출력 다시 만들기"
#       exercise: {prompt: "...", starterCode: "...", solution: "...", hints: ["...", "..."]}
#       check: {id: "...", version: 1, kind: "output", strength: "strong", executor: "browser-worker"}

# ============================================
# Block Types
# ============================================

# prose blocks
# - type: text | content | centerText
#   title: "제목"                   # optional
#   subtitle: "부제목"              # optional
#   content: |
#     Markdown content.

# title blocks
# - type: mainHeader | sectionHeader | sectionTitle
#   title: "제목"
#   subtitle: "부제목"              # optional

# local workbench block
# - type: localWorkbench
#   title: "Codaro Local Workbench" # optional
#   description: "Run the adjacent Python cells with the local Codaro kernel."

# list blocks
# - type: list
#   style: "bullet" | "number" | "check"
#   items:
#     - "항목 1"
#     - "항목 2"

# code blocks
# - type: code
#   language: "python"             # python, shell, browser, task, skill
#   title: "코드 제목"              # optional
#   description: "코드 설명"        # optional
#   content: |
#     print("Hello")
#   output: |                      # optional expected output
#     Hello

# practice blocks
# - type: expansion
#   title: "실습"
#   description: "문제 설명"
#   code: |                        # optional solution stored separately
#     print("solution")
#   blocks:                        # optional starter cells
#     - type: code
#       content: |
#         # write your code

# callout blocks
# - type: note | tip | tipCard | warning | info | codeDescription
#   title: "참고"                  # optional
#   content: "참고 내용"

# table blocks
# - type: table
#   headers: ["컬럼1", "컬럼2"]
#   rows:
#     - ["값1", "값2"]
#     - ["값3", "값4"]

# visual/media blocks
# - type: hero | image | video | youtube | videoCarousel | pdf | MIME | tiobeIndex
#   title: "제목"
#   src: "path-or-url"             # image/pdf/video
#   items: []                      # carousel/resource entries

# cards and comparison blocks
# - type: featureCards | choiceCards | resourceCards | threeColumnCards | stepCard | practiceCard
#   cards:
#     - title: "카드 제목"
#       description: "카드 설명"
#
# - type: compare | fullWidthComparison
#   left:
#     title: "왼쪽"
#     items: []
#   right:
#     title: "오른쪽"
#     items: []

# resource blocks
# - type: link | links | linkButtons
#   title: "자료"
#   url: "https://..."             # for link
#   links: []                      # for links
#   buttons: []                    # for linkButtons

# quiz blocks
# - type: quiz
#   question: "질문"
#   options:
#     - "선택지 1"
#     - "선택지 2"
#   answer: 0
#   explanation: "해설"
`;export{e as default};