---
id: ai-sensory-system
title: AI 감각계 - 눈, 귀, 손
description: Vision, hearing, and action channel concepts for assisted workflows.
category: identity
section: concepts
order: 110
purpose: AI에게 데스크톱을 보고(Vision), 듣고(Voice), 조작할(Input) 능력을 줘서 보고-판단-행동 에이전트로 만든다.
whenToUse: 자동화 모듈 새 기능, 화면 캡처/OCR/PyAutoGUI 통합, 녹화→코드 변환, InputGuard 정책 결정할 때.
---

# AI 감각계 - 눈, 귀, 손

- AI에게 데스크톱을 보고, 듣고, 조작할 수 있는 능력을 준다.
- **눈(Vision)**: OpenCV + dxcam/mss 화면 캡처, PaddleOCR/EasyOCR 텍스트 인식, 템플릿 매칭/윤곽선 분석 요소 탐지.
- **귀(Voice)**: Whisper 음성 인식 → CommandParser로 구조화된 명령 변환.
- **손(Input)**: PyAutoGUI/DirectInput/Accessibility API로 마우스 클릭, 키보드 입력, 드래그, 핫키. InputGuard가 속도/영역 제한으로 안전 보장.
- **녹화 → 코드**: 사용자의 동작을 녹화 → 실행 가능한 Python 코드(Percent Format)로 자동 생성.
- **자동화 루프**: 다단계 액션 + 검증(화면 텍스트 확인) + 재시도 + 상태 머신.
- 이 모든 감각은 AI tool_use로 노출되어 AI가 "보고 → 판단하고 → 행동하는" 에이전트로 동작한다.
- xlwings 같은 도메인 특화 라이브러리로 Excel/Office 자동화도 같은 구조에 탑재 가능.

## 관련

- [[ai-integration]] - tool_use 표면
- [[automation-tasks-reports]] - 감각계로 만든 .py가 곧 태스크
