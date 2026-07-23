# Learn Explorer

상태: 진행

## 목표

472개 레슨을 한 번에 나열하지 않고 이어하기, 여섯 결과 경로, 검색과 필터로 필요한 학습에 바로 진입한다.

## 범위

- 첫 화면에 compact heading, 이어하기, 검색 제공
- 결과 경로마다 완성 결과, Web과 Local 범위, 첫 레슨 표시
- 기본 DOM에는 추천 시작점만 렌더
- 검색과 필터 결과는 최대 30개까지 렌더
- 레슨 행에서 시간, 결과, runtime, 강한 검증 가능 여부 표시

## 종료 조건

- 초기 action count 80 이하
- 초기 lesson row 12개 이하
- 검색, runtime, path filter 접근성과 keyboard flow 통과
- 390x844 첫 화면에서 제목, 이어하기, 검색이 모두 보임
- 결과 경로와 레슨 링크가 canonical interactive lesson으로 연결됨

## 현재 증거

- 첫 화면을 이어하기, 검색, Web/Local 수량과 여섯 결과 경로 중심으로 다시 구성했다.
- 초기 추천 행은 3개, 검색 결과는 최대 30개로 제한하고 모든 진입 링크를 canonical interactive lesson으로 연결했다.
- Light/Dark Landing Learn desktop/mobile Chromium case와 `landing-public` 계약이 통과했다.

## 남은 조건

- 실제 검색 유입과 keyboard, screen reader, 한국어 IME 수동 검수
- 결과 경로별 사람 콘텐츠 검수와 배포 commit의 Pages smoke

완료 전에는 `_done`으로 이동하지 않는다.
