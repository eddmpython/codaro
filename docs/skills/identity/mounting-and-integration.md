---
id: mounting-and-integration
title: 마운팅과 통합
description: Mounting and integration principles for apps, APIs, and GUI flows.
category: identity
section: concepts
order: 107
purpose: createServerApp()은 단독 실행과 다른 서버 마운팅을 모두 지원. GUI에서 되는 모든 것은 API로도 된다.
whenToUse: 외부 프레임워크(FastAPI/Django/Flask) 통합, root_path 처리, API surface 설계할 때.
---

# 마운팅과 통합

- `createServerApp()`은 독립 실행 가능하면서 동시에 다른 서버에 마운팅 가능하다.
- FastAPI: `app.mount("/codaro", createServerApp())`
- Django: ASGI 라우팅 분기
- Flask: WSGIMiddleware 래핑
- 프론트엔드는 `<meta name="codaro-base">` 태그에서 root_path를 자동 감지한다.
- GUI에서 되는 모든 것은 API로도 된다 (시스템적 수정 가능).

## 관련

- [[execution-engine]] — 엔진 추상화
- [[architecture-overview]] — transport 레이어
