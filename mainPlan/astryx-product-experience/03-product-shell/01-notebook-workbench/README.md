# Notebook Workbench

상태: 진행

## 남은 목표

실제 Windows WebView2의 Codaro 노트북에서 보조기술 읽기 순서와 한글 IME 조합 입력을 사람 기준으로 확인하고, 발견한 결함을 수정한 뒤 이 TODO를 삭제한다.

## 남은 조건

- NVDA 또는 Narrator로 12셀 이상 노트북의 문서, 셀 순번, 입력, 출력, 셀 작업, 문서 하단 control이 화면 순서대로 읽히는지 검수한다.
- CodeMirror 코드 셀과 Markdown textarea에서 한글 조합 시작·갱신·확정을 확인한다.
- IME 조합 중 `↑`·`↓`가 인접 셀 이동을 발동하지 않고, 조합 확정 뒤 문서 시작·끝에서만 셀 경계 이동이 작동하는지 확인한다.
- 검수 중 발견한 focus 유실, 중복 announcement, 읽기 순서 역전, 조합 문자 손실을 수정하고 같은 WebView2 환경에서 재검수한다.

## 다음 검증

- Windows 11의 current Evergreen WebView2에서 `product-browser-webview2-evergreen`을 먼저 통과시킨다.
- 같은 설치본과 1024×768 viewport에서 NVDA 또는 Narrator의 실제 발화 순서를 기록한다.
- 같은 설치본의 Code·Markdown 셀에서 한글 IME 조합과 경계 이동을 사람 입력으로 검수한다.
- 남은 조건이 모두 충족되면 이 packet과 parent index의 링크를 삭제하고, 구현·검수 사실은 상세 commit message에 기록한다.
