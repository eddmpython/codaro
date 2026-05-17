---
id: external-channels-mobile
title: 외부 채널 + 모바일 조작
description: External channel and mobile principles for future Codaro access patterns.
category: identity
section: concepts
order: 111
purpose: 데스크톱 앞에 없을 때도 동작. MessageBridge(Slack/Discord/Webhook) + 외부 HTTP 트리거 + 향후 모바일 PWA.
whenToUse: 알림 채널 추가, Webhook 트리거 설계, 모바일 반응형 UI 구현할 때.
---

# 외부 채널 + 모바일 조작

- Codaro는 사용자가 항상 데스크톱 앞에 있지 않아도 동작한다.
- **MessageBridge**: Slack, Discord, 커스텀 Webhook으로 태스크 결과/알림 전송.
- **Webhook 트리거**: 외부에서 HTTP 호출로 태스크를 실행 가능.
- 사용자는 폰에서 Slack/Discord 알림을 받고, 웹훅으로 태스크를 트리거하고, 결과를 확인할 수 있다.
- 향후 모바일 반응형 UI + PWA로 직접 에디터 접근도 가능.
- Codaro가 로컬 머신에서 돌면서 외부 세계와 양방향 소통하는 **개인 자동화 허브** 역할.

## 관련

- [[automation-tasks-reports]] — 트리거되는 태스크 정의
- [[mounting-and-integration]] — 외부 HTTP surface
