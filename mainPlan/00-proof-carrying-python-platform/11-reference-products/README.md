# 참조 제품과 최종 claim

상태: 대기

## 목표

서로 다른 runtime과 사용자 가치를 대표하는 실제 제품 5개를 Codaro 자체로 만들고 author, preview, build, serve, embed 또는 task의 전체 계약을 검증한다.

## 범위

1. browser 계산기와 입력 위젯
2. CSV interactive dashboard
3. build-time snapshot 보고서
4. secret reference가 필요한 server API app
5. local filesystem 자동화 dashboard

## 영향 파일

- 새 `examples/apps/`
- `tests/publication/verifyReferenceProducts.py`
- `tests/publication/verifyReferenceProductsPlaywright.py`
- `README.md`, `docs/skills/`, landing 제품 문구
- performance, accessibility, security gate

## 영향 함수·심볼

- reference manifest와 expected proof graph fixture
- end-to-end authoring harness
- public claim verifier
- performance와 external request budget

## 테스트

- 다섯 제품 모두 clean checkout에서 build와 local serve가 된다.
- desktop/mobile Chromium에서 핵심 input, output, reload, failure recovery를 검증한다.
- static 제품은 외부 network 0, server 제품은 secret leak 0을 만족한다.
- 문서와 landing claim이 실제 machine receipt보다 넓지 않다.

## 롤백

참조 제품은 production contract 소비자이며 예외 허용 목록이 아니다. 제품 하나가 실패하면 claim과 해당 노출을 내리고 core contract를 우회하지 않는다.

## 평가

개발자 관점에서는 unit test만이 아니라 사용자가 받는 전체 artifact를 검증해야 한다. PM 관점에서는 다섯 제품이 Codaro가 학습기, IDE, 자동화기계, 배포 플랫폼이라는 최종 약속을 실제로 보여줘야 한다.
