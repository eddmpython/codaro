# Codaro Launcher PRD

## 목적

`launcher/`는 Codaro의 로컬 배포 계층이다.
이 레이어의 목표는 사용자가 Python, `uv`, 패키지 설치를 직접 다루지 않아도 Codaro를 설치, 업데이트, 복구, 실행할 수 있게 만드는 것이다.

package artifact 분리와 publish 정책의 상세 source of truth는 `launcher/PACKAGING.md`가 맡는다.

최종 사용자 약속은 단순하다.

- 사용자는 `CodaroLauncher.exe`만 설치한다
- 런처가 Python runtime, Codaro backend, frontend 자산, automation bundle, 업데이트를 관리한다
- 사용자는 Python 설치 여부를 신경 쓰지 않는다
- Codaro는 desktop, mobile, web이 같은 문서 모델과 같은 제품 정체성을 유지한다

## 제품 정의

Codaro launcher는 단순 실행 파일이 아니다.
런처는 아래를 담당하는 로컬 배포 운영체제다.

- install
- update
- rollback
- runtime bootstrap
- backend process supervision
- release channel control
- local log and crash recovery

즉 launcher는 앱을 여는 셸이 아니라 Codaro 로컬 런타임의 source of truth다.

## 왜 필요한가

현재 Codaro는 개발 환경 기준으로 `uv run codaro`를 전제한다.
이 방식은 개발에는 맞지만 제품 배포에는 맞지 않는다.

문제:

- 사용자가 Python을 설치해야 한다
- `.venv`와 패키지 상태가 사용자 환경에 종속된다
- backend 업데이트와 앱 업데이트가 분리돼서 깨진 조합이 생길 수 있다
- Excel 자동화, 브라우저 자동화, 로컬 AI 같은 기능은 일반 사용자에게 설치 장벽이 높다

launcher가 들어오면 아래가 가능해진다.

- Python 없는 설치 경험
- silent bootstrap
- GitHub Releases + PyPI 기반 자동 업데이트
- stable / beta channel
- runtime rollback
- desktop/full 과 mobile/learn capability 분리

## 제품 원칙

- Codaro는 여전히 Python 중심 제품이다
- 사용자가 Python을 볼 필요가 없을 뿐, 내부 runtime은 Python이어도 된다
- 배포물은 단일 통짜 exe보다 관리 가능한 계층 구조가 우선이다
- launcher는 아티팩트 조합을 결정하지만, backend 내부 capability 설계는 Codaro runtime 문서를 따른다
- desktop, mobile, web은 같은 문서 모델과 같은 학습 철학을 공유한다
- local automation capability는 desktop 우선이다

## 범위

### Phase 1

- Windows launcher
- embedded Python runtime
- Codaro backend managed install
- frontend asset managed install
- GitHub manifest 기반 업데이트
- PyPI wheel 기반 backend 배포
- rollback
- channel 분리

### Phase 2

- automation bundle 분리
- Excel automation bundle
- browser automation bundle
- database automation bundle
- local AI bundle

### Phase 3

- mobile install path
- shared accountless sync primitive
- optional cloud release channel and signed manifest hosting

## 비범위

- mobile에서 desktop 자동화 capability를 그대로 재현하지 않는다
- PyInstaller 같은 통짜 단일 exe를 최종 구조로 채택하지 않는다
- frontend는 launcher를 몰라야 한다
- backend runtime contract를 launcher 사정에 맞게 뒤틀지 않는다

## 타깃 사용자 경험

### 최초 설치

1. 사용자가 `CodaroLauncher.exe`를 실행한다
2. launcher가 install root를 만든다
3. launcher가 embedded runtime과 base asset을 설치한다
4. launcher가 backend manifest를 확인한다
5. launcher가 필요한 backend wheel과 bundle을 내려받아 검증 후 활성화한다
6. launcher가 backend를 띄우고 UI를 연다

사용자 행동은 최초 실행 한 번이면 끝난다.

### 일반 실행

1. launcher가 local state를 읽는다
2. background에서 update를 확인한다
3. 현재 active runtime으로 backend를 실행한다
4. 준비가 끝나면 UI를 연다
5. 새 버전이 안전하게 준비되면 다음 실행 때 교체한다

### 장애 복구

1. backend bootstrap 실패
2. launcher가 last-known-good runtime으로 rollback
3. 실패 로그를 보존
4. 사용자에게 최소 오류 메시지와 복구 상태 표시

## 아키텍처 개요

### 주요 구성요소

- `CodaroLauncher.exe`
  - Rust 기반 설치기, supervisor, updater
- embedded Python runtime
  - launcher가 관리하는 앱 전용 Python
- backend runtime
  - PyPI wheel 또는 signed artifact로 설치되는 Codaro backend
- frontend assets
  - build된 web asset
- automation bundles
  - Excel, browser, db, AI 같은 선택 bundle
- state store
  - install metadata, active version, rollback target, logs
- release manifest
  - GitHub release asset로 배포되는 조합 제어 문서

### 권장 설치 구조

`%LocalAppData%/Codaro/`

- `launcher/`
  - launcher binary metadata
- `runtime/`
  - shared cache, future runtime dedupe, installer scratch space
- `installs/<releaseId>/`
  - `backend/`
    - `site-packages/`
    - `wheels/`
  - `frontend/`
    - `archive/`
    - `app/`
  - `runtime/`
    - `archive/`
    - `python/`
  - `bundles/`
    - `wheels/`
  - `manifest.json`
- `active/`
  - 현재 활성 release를 가리키는 pointer 또는 metadata
- `downloads/`
  - staged download cache
- `logs/`
  - launcher, backend, updater log
- `state/`
  - channel, preferences, crash marker, rollback marker

## Release Control Plane

배포 제어는 두 레이어로 나눈다.

- GitHub Releases
  - 어떤 조합을 사용자에게 배포할지 결정
  - launcher artifact와 manifest를 제공
- PyPI
  - backend wheel과 선택 bundle wheel을 저장

중요:

- launcher는 GitHub와 PyPI의 최신 버전을 각각 따로 조합하지 않는다
- launcher는 반드시 manifest가 지정한 정확한 버전을 설치한다
- release validity는 manifest와 해시 검증으로 보장한다

## Manifest 설계

manifest는 GitHub release asset로 업로드한다.
launcher는 먼저 manifest만 읽고, 그 다음 manifest가 가리키는 artifact만 내려받는다.

예시:

```json
{
  "manifestVersion": 1,
  "channel": "stable",
  "releaseId": "2026.03.18-1",
  "launcherVersion": "0.3.0",
  "minLauncherVersion": "0.3.0",
  "pythonRuntime": {
    "version": "3.12.12",
    "url": "https://github.com/eddmpython/codaro/releases/download/v0.3.0/python-runtime-win-x64.zip",
    "sha256": "..."
  },
  "frontend": {
    "version": "0.3.0",
    "url": "https://github.com/eddmpython/codaro/releases/download/v0.3.0/frontend-web.zip",
    "sha256": "..."
  },
  "backend": {
    "name": "codaro",
    "version": "0.3.0",
    "wheelUrl": "https://files.pythonhosted.org/packages/.../codaro-0.3.0-py3-none-any.whl",
    "sha256": "...",
    "entryModule": "codaro.cli",
    "consoleScript": "codaro"
  },
  "bundles": [
    {
      "name": "excel",
      "packageName": "codaro-excel",
      "version": "0.3.0",
      "required": false,
      "wheelUrl": "https://files.pythonhosted.org/packages/.../codaro_excel-0.3.0-py3-none-any.whl",
      "sha256": "..."
    }
  ],
  "rollbackTo": "2026.03.10-2"
}
```

## Update 상태머신

### 상태

- `idle`
- `checking`
- `downloading`
- `verifying`
- `staging`
- `ready_to_switch`
- `switching`
- `healthy`
- `rollback_pending`
- `rolled_back`
- `failed`

### 동작

1. launcher start
2. manifest check
3. newer compatible release 발견
4. background download
5. sha256 검증
6. staged install 생성
7. health check 통과
8. active release pointer 교체
9. 다음 실행 또는 재시작 시 새 runtime 활성화

실패 시:

1. active pointer 유지
2. staged install 폐기 또는 격리
3. error 기록
4. 반복 실패 시 channel freeze 가능

## Rollback 원칙

- last-known-good release를 항상 유지한다
- install switch는 atomic pointer 교체로 끝나야 한다
- backend health check가 실패하면 즉시 이전 release로 되돌린다
- rollback은 사용자 작업 디렉터리를 건드리지 않는다
- rollback은 문서 파일, 사용자 설정, 학습 진행 상태를 파괴하지 않는다

## Backend 실행 모델

launcher는 backend를 직접 구현하지 않는다.
launcher는 Codaro backend를 supervised process로 띄운다.

기본 흐름:

1. launcher가 active release 경로를 찾는다
2. launcher가 embedded Python으로 backend entrypoint를 실행한다
3. launcher가 health endpoint를 확인한다
4. launcher가 UI를 연다
5. backend crash 시 재시작 정책을 적용한다

desktop에서는 현재 `LocalEngine` capability를 그대로 사용한다.
launcher는 runtime provisioner이자 supervisor다.

## Capability Matrix

### Desktop Full

- code editing
- reactive execution
- local files
- packages install
- browser automation
- database access
- heavy Python libs
- local AI provider
- Excel file generation
- Excel COM automation

### Mobile Learn

- code editing
- reactive execution
- curriculum
- AI teacher
- offline lesson asset
- limited local file access

제한:

- package install 없음 또는 제한적
- OS 프로세스 자동화 없음
- Excel COM 없음
- Windows 전용 automation 없음

### Web Fallback

- code editing
- reactive execution
- curriculum
- AI teacher
- cloud or browser file storage

제한:

- LocalEngine capability 없음
- desktop automation 없음

## Bundle 전략

base install에는 가능한 한 최소 구성만 넣는다.

기본 포함:

- launcher
- embedded Python
- codaro backend
- frontend assets
- base curriculum

선택 bundle:

- `codaro-excel`
- `codaro-browser`
- `codaro-db`
- `codaro-ai-local`

장점:

- 기본 설치 크기 감소
- desktop automation capability를 필요할 때만 제공
- mobile/web에는 같은 제품 이름 아래 capability만 제한 가능

## Excel 자동화 정책

Excel 관련 capability는 둘로 나눈다.

- workbook automation
  - Excel 앱 없이도 가능
  - `xlsx` 생성, 읽기, 수정
- Excel app automation
  - 로컬 Windows Excel 설치가 있을 때만 가능
  - COM 기반 UI/매크로/앱 제어

launcher는 capability availability를 진단해서 backend에 전달해야 한다.

## 로컬 배포 bundle 경계

launcher가 관리하는 것:

- embedded Python runtime
- exact backend wheel과 exact bundle wheel install
- bundle bootstrap, capability probe, diagnostics
- add-in 또는 helper init이 필요한 경우 release 단위 설치와 복구

사용자가 직접 준비해야 하는 것:

- Microsoft Excel 같은 외부 앱
- 브라우저 프로필, DB 서버, OS 권한 같은 외부 시스템 전제
- bundle이 기대하는 계정, 로그인, 라이선스

`codaro-excel` bundle 계획:

- `openpyxl`, `xlsxwriter`, `xlwings` 같은 Python 계층은 launcher-managed bundle로 제공한다
- workbook automation은 Excel 앱 없이도 활성화할 수 있다
- Excel app automation은 Windows Excel 설치가 감지된 경우에만 capability를 연다
- add-in 또는 bootstrap 단계가 필요하면 launcher가 managed release 아래에서 설치, 업데이트, 복구를 담당한다
- product UI는 "launcher가 설치한 것"과 "사용자가 직접 설치해야 하는 것"을 capability diagnostics로 분리해서 보여준다

## 보안과 무결성

- manifest 자체 해시 또는 서명 검증
- artifact sha256 검증
- backend wheel provenance 확인 가능 구조 유지
- active runtime 외 경로 실행 금지
- launcher update와 backend update는 분리 가능하지만 manifest 조합은 원자적으로 관리
- channel downgrade나 incompatible manifest는 명시적으로 거부

## 로그와 진단

launcher는 최소 아래 로그를 남긴다.

- install start and finish
- update check
- download and verify
- stage activate
- backend spawn
- backend health timeout
- rollback
- crash count

로그는 사용자에게 보이는 UI와 내부 진단 파일 둘 다 지원해야 한다.

## 플랫폼 순서

### 1차

- Windows x64

### 2차

- macOS

### 3차

- Android and iOS

모바일은 같은 release control plane을 쓰되 runtime artifact와 capability만 다르게 간다.

## 구현 마일스톤

### M1

- `launcher/` Rust workspace 생성
- install root 생성
- active release metadata 읽기/쓰기
- embedded Python bootstrap
- Codaro backend spawn

### M2

- GitHub manifest fetch
- staged download
- sha256 verify
- release activation
- rollback

### M3

- PyPI wheel install into managed runtime
- frontend asset staging
- crash recovery
- health check and restart policy

### M4

- bundle install manager
- channel switching
- silent background update
- user-facing update UI

### M5

- mobile packaging PRD 세분화
- desktop/mobile shared manifest subset 정의

## Current State

- `launcher/` Rust workspace와 `codaro-launcher` crate가 생성됐다
- install root path resolution, active release state 저장, release manifest 파싱, backend command preview, backend health check 최소 경로가 구현됐다
- launcher는 이제 manifest source에서 artifact를 내려받고 sha256 검증 후 release 디렉터리에 stage할 수 있다
- staged release는 `manifest.json`, backend wheel cache, frontend archive, python runtime archive, bundle wheel, `install-record.json`을 가진다
- runtime zip과 frontend zip은 stage 중 실제 install layout으로 풀린다
- launcher는 release-local `runtime/python`을 해석해서 exact backend wheel과 bundle wheel을 `backend/site-packages`에 설치한다
- active backend spawn은 이제 active release 아래의 Python runtime과 frontend build root를 직접 사용한다
- staged release를 active release로 승격하는 `activate` 경로가 구현됐다
- launcher는 `active-release`, `last-known-good-release`, `rollback-marker` 상태 파일을 분리해서 관리한다
- active backend health check가 실패하면 launcher는 last-known-good release를 우선 시도하고, 없으면 manifest `rollbackTo`를 사용해 자동 복귀한다
- launcher는 `crash-state`를 별도로 기록하고 active release가 60초 안에 3번 비정상 종료되면 frozen으로 간주한다
- healthy 이후 crash는 같은 release를 자동 재시작하고, freeze 임계치를 넘기면 rollback supervisor로 넘긴다
- `doctor`와 `state show`는 active release, last-known-good release, crash state, rollback marker를 함께 노출한다
- launcher는 `update check`로 manifest source와 active release를 비교하고 `minLauncherVersion` 호환성까지 판정한다
- launcher는 `update apply`에서 staged release를 backend health probe로 검증한 뒤에만 active release를 전환한다
- health-gated update apply는 이전 active release를 `last-known-good`로 보존하고 rollback marker를 정리한다
- launcher는 persisted `update-config` 상태를 가지며 기본 GitHub repo는 `eddmpython/codaro`, 기본 manifest asset 이름은 `release-manifest.json`이다
- launcher는 explicit manifest source가 없으면 configured manifest source를 우선 사용하고, 그것도 없으면 GitHub Releases API에서 채널에 맞는 latest manifest asset을 찾는다
- `update config show/set`으로 channel, direct manifest source, GitHub repo, manifest asset name을 저장할 수 있다
- `update sync`는 check와 apply를 한 번에 수행하고, update config가 허용하면 launcher startup에서도 같은 경로를 재사용한다
- `autoUpdateOnLaunch`가 켜지면 `launch-active`는 active release를 읽기 전에 먼저 update sync를 수행한다
- backend는 `CODARO_WEB_BUILD_ROOT` 환경변수로 managed frontend build root를 받을 수 있다
- package distribution과 bundle 분리 정책은 `launcher/PACKAGING.md`에 정리됐다
- launcher-managed Python/bundle과 user-managed external app 경계가 문서로 고정됐다
- 배포와 runtime provision 전체는 아직 개발 환경 기준으로 남아 있다
- backend는 이제 child process worker, execution event stream, session capability까지 올라와 있으므로 launcher가 붙을 표면은 준비되기 시작했다
- source of truth 문서는 현재 이 `launcher/PRD.md`다

## Next Action

- `codaro-excel` bundle skeleton과 capability probe 표면을 정의한다
- runtime cache와 release-local runtime dedupe 정책을 정한다
- launcher update와 backend update의 서명/무결성 검증 레이어를 분리한다
- background update loop와 foreground startup sync의 역할을 분리한다
- crash restart/freeze 상태를 launcher log file과 user-facing diagnostics에 연결한다

## Verification Left

- Excel 설치 감지와 `xlwings` bootstrap 경로 검증
- bundle capability diagnostics가 product UI와 연결되는지 검증
- launcher artifact 서명 정책
- Windows installer 형식 선택
- embedded Python 배포 방식
- release staging과 atomic activate 검증
- real GitHub Releases latest manifest 흐름 검증
- release-local runtime과 shared runtime cache의 관계 정리
- wheel install에서 dependency pin과 compiled wheel 처리를 어떻게 가져갈지 검증
- real backend 기준 rollback after failed health check 검증
- real backend 기준 crash restart/freeze window 검증
- real GitHub release source와 large artifact download 검증
- channel별 prerelease selection 정책이 실제 릴리즈 태그 전략과 맞는지 검증
- startup auto-update가 실제 frontend open/runtime boot UX와 충돌하지 않는지 검증
- mobile runtime artifact 구조
