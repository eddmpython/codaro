# 나머지 task class와 capstone

상태: 대기

선행: `../01-single-family-slice`

## 목표

검증된 slice 형식을 나머지 세 TaskFamily와 11개 path lesson에 적용한다. 초보자는 worked example에서 시작하고 compatible evidence 또는 entry pass가 있으면 formative 단계를 건너뛴다.

## 영향 파일

- `curricula/python/basics/30days/day01_헬로월드.yaml`
- `curricula/python/basics/30days/day02_변수와데이터타입.yaml`
- `curricula/python/basics/30days/day03_연산자.yaml`
- `curricula/python/basics/30days/day04_문자열기초.yaml`
- `curricula/python/basics/30days/day07_리스트기초.yaml`
- `curricula/python/basics/30days/day10_집합.yaml`
- `curricula/python/basics/30days/day18_모듈과import.yaml`
- `curricula/python/basics/30days/day30_최종프로젝트.yaml`

## 영향 함수·심볼

- curricula registry converter
- assessment queue
- deterministic remediation mapper
- artifact collector

## 테스트

네 family closure, entry skip, exposure lineage, fresh transfer와 retrieval, JSON semantic artifact, Local handoff를 전체 path에서 실행한다.

## 롤백

문제가 있는 family만 candidate formative로 내리고 먼저 검증된 slice는 유지한다.

## 평가

필수 outcome slice 누락 0, 이미 증명한 family의 강제 반복 0, entry 실패의 lapse 기록 0, capstone 일괄 승격 0을 요구한다.
