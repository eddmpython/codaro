# 05. Killlist And Non-Goals - 안 하는 것의 명시

상태: v0.1 (2026-07-10)
범위: 재론 방지용 기각 목록과 비목표. 각 항목은 근거 문서를 가리킨다. 뒤집으려면 progress-ledger에 결정 기록 + 해당 근거 반박이 선행돼야 한다.

---

## KILL (하지 않는다)

| # | 항목 | 근거 |
|---|---|---|
| K1 | 전면 GitHub Pages/웹 전환 | 자동화·검증 99.7%·교실이 원리적 불가([00 §2 KILL-1](00-product-vision.md)) |
| K2 | WASM Python 런타임 자체 개발(Pyodide 대체) | 8년 규모 생태계 중노동 + 브라우저 샌드박스 정의상 천장([00 §2 KILL-2](00-product-vision.md)) |
| K3 | 무료 PaaS 공유 커널 서버(HF Spaces·Render에 커널 호스팅) | 방문자 커널 공유 = 격리 실격([00 §2 KILL-3](00-product-vision.md)) |
| K4 | Codaro 중앙 리포 Actions 실행 팜 | GitHub 약관 위반 + 격리 문제 재발([04 §3](04-actions-runtime.md)) |
| K5 | 가짜 실행의 정식 표면 승격 | 현행 print 정규식 시뮬레이션(editor/src/lib/localRuntime.ts:5-37)은 파이썬이 아니다. 검증 정직성 위반. 실행은 진짜 CPython(WASM 포함)만 |
| K6 | 브라우저 티어의 학습 SSOT 승격 | 숙달·검증 기준 실행은 로컬 불변. 게이트 개정은 보조 티어 허용까지([06 §7](06-scope-phasing-guardrails.md)) |
| K7 | 확장 프로그램 + Native Messaging 브리지 | 네이티브 호스트 설치가 어차피 필요해 런처 대비 이점 0([02 §6](02-entry-and-bootstrap.md)) |
| K8 | 브라우저 리눅스 VM(x86 에뮬) 채택 | 수백 MB·5~20배 감속·라이선스 리스크. 능력 요구는 local/actions 티어가 이미 흡수 |
| K9 | 원격 접속의 공개 URL·비밀번호 인증·relay 서비스화 | 개인 1인 페어링 모델만([03 §3.4](03-remote-access-p2p.md)) |
| K10 | landing(GitHub Pages) 슬롯 침범 | 웹 표면은 Cloudflare Pages 별도 배포. 문서/블로그 SSOT 불변([02 §5](02-entry-and-bootstrap.md)) |

## 보류 (KILL 아님, 명시 결정 전 착수 금지)

| # | 항목 | 상태 |
|---|---|---|
| H1 | 과제방(교실) 관련 전 유스케이스(Actions 채점 포함) | 과제방 자체가 보류·폐기 검토 중(2026-07-10 사용자 결정). 전제로 쓰지 않는다 |
| H2 | 커리큘럼 읽기 전용 정적 뷰어(landing 확장) | 게이트 무충돌 독립 옵션이나 본 PRD보다 후순위로 사용자가 내림 |
| H3 | SharedArrayBuffer 협조적 인터럽트 | Worker.terminate 방식이 v1. SAB는 CF Pages 헤더 확보 후 개선 항목 |

## Non-Goals (v1 범위 밖)

1. Firefox/Safari에서 웹 티어 완전 동등 지원(FSA 부재) - 가상 FS + 로컬 안내가 공식 동선.
2. 모바일 네이티브 앱 - 원격 P2P([03](03-remote-access-p2p.md))가 모바일 브라우저 경로를 먼저 연다.
3. 다인 실시간 협업·공유 세션 - 개인 스튜디오 정체성 밖.
4. 웹 티어 오프라인 완전 지원(Pyodide 셀프호스팅) - CDN 참조가 v1, 요구 발생 시 재검토.
5. 임의 PyPI 네이티브 패키지의 브라우저 실행 - 라우터가 정직하게 local/actions로 보낸다. emscripten 빌드 기여는 범위 밖.
6. "무제한 무료 클라우드" 포지셔닝 - 무료의 실체는 사용자 소유 컴퓨트(자기 PC·자기 리포)다. 우리가 비용을 대신 지는 서버는 없다.
