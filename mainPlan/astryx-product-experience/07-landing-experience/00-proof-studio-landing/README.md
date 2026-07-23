# Proof Studio Landing

상태: 진행

## 목표

Codaro 첫 화면에서 실제 코드 수정, 출력, 검증이 선명하게 보이고 Web 학습과 Local 자동화의 관계를 한 제품으로 이해하게 한다.

## 범위

- H1은 `Codaro` 한 번만 사용
- primary는 첫 canonical interactive lesson
- secondary는 결과 경로 탐색
- Local 다운로드는 확장 맥락의 tertiary action
- 실제 code, output, strong check 제품 장면을 hero에 표시
- 학습 루프, 결과 경로, Web과 Local 경계, trust만 남기고 반복 소개 제거
- product capture와 학습 이미지의 Light와 Dark 대응

## 종료 조건

- 1440x900과 390x844 첫 viewport에서 제품명, 코드, 출력, 검증, primary action 확인
- 다음 section의 시작이 첫 viewport에 보임
- dark-only media island, 과도한 암막, 사선 crop 0개
- Landing, Learn, Lesson, Run의 public navigation 어휘 일치
- 실제 Pages 배포 screenshot과 accessibility audit 통과

## 현재 증거

- Home을 실제 code, output, verification이 주인공인 Proof Studio hero와 학습 loop, 결과 경로, Web/Local 경계로 재구성했다.
- 1440x900과 390x844 Light/Dark Chromium screenshot에서 다음 band 노출, image load, overflow와 control overlap 0을 확인했다.
- `landing-public`, hydration, SEO, public claim과 `astryx-journey` machine gate가 통과했다.
- Pages workflow `29988292985`가 `main@3a18dd97`을 성공 배포했고 공개 Home과 primary canonical lesson direct link를 실제 브라우저에서 확인했다.
- 공개 Home을 desktop Light/Dark와 390x844 Light에서 촬영해 제품명, code, output, verification, primary action, 다음 product media가 첫 viewport에 보이고 horizontal overflow가 0임을 확인했다.

## 남은 조건

- keyboard, screen reader, forced-colors 수동 접근성 검수와 사람 브랜드 검수

완료 전에는 `_done`으로 이동하지 않는다.
