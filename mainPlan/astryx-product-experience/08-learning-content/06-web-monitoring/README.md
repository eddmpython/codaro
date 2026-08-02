# 06 Web Monitoring

상태: 진행

## 목표

`webMonitoring`의 Python 변수·제어·함수와 browser basics·form input·evidence outcome closure를 관찰 가능한 모니터링 자동화 경로로 만든다.

Web 단계는 deterministic local fixture page에서 selector, form, state, screenshot/trace evidence를 검증한다. 장시간 실행, credential, 외부 사이트 정책이 필요한 capstone은 Local capability와 명시적 안전 경계로 옮긴다.

packet 소유 11개 canonical row와 assessment의 직접 검토는 승인됐다. 남은 blocker는 실제 학습자 Web 완주와 `playwright/10_종합브라우저점검프로젝트`의 Local automation 졸업 독립 증거다.

## 영향 파일

- closure에 포함된 Python·browser automation YAML
- canonical content ledger에서 `ownerPacket=06-web-monitoring`인 11개 레슨의 콘텐츠 이관과 review evidence
- packet 소유 `lesson-ledger.yml`, fixture pages, trace/screenshot descriptor
- monitor state diagram과 failure recovery visual

## 영향 함수·심볼

- `checkBehavior`, browser evidence descriptor, `SurfaceCapability`
- Local automation audit, E-Stop, recovery fixture

## 테스트

- fixture navigation, form input, target state, evidence artifact를 의미 검증
- external network 없는 deterministic run과 timeout/retry/recovery 검증
- Local capstone의 audit trail, credential redaction, E-Stop 검증
- `uv run python -X utf8 tests/run.py gate learning-content`

## 롤백

실제 외부 사이트를 CI fixture로 쓰지 않는다. selector/fixture version은 evidence에 남기고 Web과 Local executor를 독립 commit으로 되돌린다.

## 평가

단순 click replay가 아니라 상태 확인·증거·실패 복구를 학습하고 경로 ledger와 canonical 소유 11개 행이 모두 승인돼야 삭제 조건을 충족한다.
