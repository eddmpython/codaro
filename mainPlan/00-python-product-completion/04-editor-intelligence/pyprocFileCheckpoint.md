# pyproc 파일 상태 복제·복원 불일치

## 접수 판정

Codaro의 수정 검증은 기준 상태를 복제해 코드를 실행하고 원본 변수와 파일을 보존해야 한다.
제품 adapter를 제거한 공개 `boot`, `proc.clone`, `history.checkpoint`, `history.restore` 호출에서도
파일 누락과 이전 파일 내용 복원 실패가 발생했다. 따라서 편집기 UI나 입력 변환에만 있는 문제가 아니다.

pyproc의 mainPlan 14~18, contract-reality, runtimeParity 실측과 최근 Git 이력을 검색했다.
stdout hook, 제어 아티팩트 해제, HTTPS 신뢰, 키 활성화와는 다른 파일 상태 계약이다.
소비 피드백 계약상 새 항목은 기존 직렬 대기열 뒤에 접수해야 한다. 현재 작업 범위 도구는 다른
저장소 경로를 거절하므로 이 문서를 검토 가능한 접수 원본으로 보관한다.

## 정확한 환경과 시작 상태

- 관찰: 2026-09-08, Asia/Seoul.
- 소비 변경 기준: Codaro `9db50fb466f1dd69c10f297468ff840be22f78dd` 이후 현재 편집기 작업 트리.
  관찰 중 다른 문서 작업이 main을 `650e9fef5e3691ef8c4af541d13ff2d95fb57de6`으로 진행했다.
- npm: pyproc 0.0.23. 무결성은
  `sha512-hwlGqmwQnp1dt+5FrP8T2fEWw34zI5n5uSyoM1DvylAEdtyJJDKANRnbPKSzojPnvQMqWz6kMQ5cH3G7EIkrcw==`.
- Windows, Edge 152.0.4191.66, Node 22.19.0. 사용자 에이전트는 HeadlessChrome/152와 Edg/152를 보고했다.
- 동일 출처 HTTP 검수 서버, viewport 1440×1000, `crossOriginIsolated === true`.
- npm 설치본을 정적 배치한 공개 root를 import했다. browser 제어는 고정된 pyproc-control 공개 API다.
- 합성 변수와 WASI 내부 `state.txt`만 사용했다. 호스트 파일, 자격증명, 사용자 데이터와 네트워크
  capability는 연결하지 않았다.

## 실행 기록과 첫 불일치

| 순서 | 공개 호출과 입력 | 기대 | 실제 |
|---|---|---|---|
| 1 | `boot()` 후 `value = 1`, 닫힌 파일에 `before` 기록 | 기준 상태 생성 | 성공 |
| 2 | `history.checkpoint()` | 변수와 파일의 같은 시점 보존 | checkpoint 반환 |
| 3 | `value = 2`, 닫힌 파일에 `after` 기록 | 현재 상태 변경 | 성공 |
| 4 | `proc.clone()`의 process에서 변수와 파일 존재 출력 | `2`, `True` | `2`, `False` |
| 5 | 원본 `history.restore(checkpoint)` 후 변수와 파일 읽기 | `1`, `before` | `1`, `after` |

첫 불일치는 clone의 파일 존재 판정이다. clone 호출 자체는 성공을 반환하고 파일 읽기에서
`PYPROC_KERNEL_EXECUTION_ERROR`, 내부 `FileNotFoundError(44, 'No such file or directory')`가 발생한다.
복원도 호출은 성공하지만 변수와 파일 내용이 서로 다른 시점에 속한다.

## 재현성과 증거

`editor/scripts/verifyEditorIntelligence.mjs <검수 URL> --machine-contract`가 adapter 없는 최소 재현이다.
동일 스크립트의 기본 시나리오도 두 셀에서 파일을 기록한 뒤 clone 검사에서 같은 파일 누락을 발견했다.
새 profile 두 개에서 파일 누락을 각각 재현했고 직접 공개 API 시나리오에서 복원 불일치도 확인했다.

합성 보고서 SHA-256:
`6312a8fa909082118c3b88bd9f25dcad4a8a2d271f95168623f473824d261a32`.
공통 실행 공간의 이번 작업 디렉터리 안 `pyproc-file-contract/report.json`에 공개 호출 결과와
사용자 에이전트가 있다. `clone`은 `2\nFalse`, `restored`는 `1\nafter`다.
이 증거는 해당 정확한 설치본의 WASI 파일 상태에 한정한다. 다른 guest나 설치 package layer의
복원까지 실패한다고 주장하지 않는다.

## 시도한 대응과 소유 경계

기준 실행과 복제 검사를 분리하고 모든 파일을 context manager로 닫았다. 공개 API만 남긴 최소
시나리오에서도 실패했다. 설치본의 WASI session checkpoint는 메모리 snapshot을 다루며 file world를
새 worker에 보내지 않는다. 별도 KernelVfs는 Git 도구의 volume 계약이고 이 Python 파일을 자동으로
같은 checkpoint에 묶는 배선은 확인되지 않았다.

Codaro에서 Python 파일을 수동 수집·복사하면 checkpoint의 소유권과 복원 의미를 중복 구현하게 된다.
파일이 없는 검사만 통과시켜 전체 상태 검증이 끝났다고 표시하는 것도 수용 기준을 충족하지 못한다.

## 제안 계약과 수용 시험

pyproc checkpoint는 Python이 접근하는 파일 트리와 커서, 닫힌 파일의 내용·메타데이터를 메모리와
같은 실행 경계로 봉인해야 한다. clone은 원본과 독립된 파일 상태를 복원하고 restore는 변수와 파일을
같은 시점으로 되돌려야 한다. 지원하지 않는 열린 장치나 외부 효과는 snapshot 성공 전에 거절한다.

최소 수용 시험은 위 재현의 두 출력이 모두 기대와 일치하는 것이다. 추가로 clone 파일 수정의 원본
불변, 파일 삭제·이름 변경·이진 내용, 중첩 디렉터리, 체크포인트 변조와 열린 resource 거절을 검사한다.
정식 테스트와 설치본 브라우저 검증, 지속 계약, npm 배포를 확인한 뒤 Codaro의 정확한 pin과 빌드 자산을
갱신하고 이 접수 문서를 삭제한다.

## 다음 행동

[운영자 결정 대기] 현재 지시는 Codaro 소비 구현이며 pyproc의 소비 피드백 계약은 upstream 소스
수정을 별도 위임한 경우에만 허용한다. pyproc 수정·npm 배포까지 작업을 확장하면 파일 상태 owner에서
고친 배포본으로 Codaro 검증을 마칠 수 있다. 확장하지 않으면 pyproc 피드백 대기열에 접수하고 해당
배포본을 받아 재검증해야 한다. 독립적인 편집기·학습 회귀와 Local 검수는 계속한다.
