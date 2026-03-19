# 실전파이썬 YAML 작성 원칙

## 개요
실전파이썬은 **완성된 마리모 앱(note.py)**을 중심으로, 그 앱의 코드를 학습하는 콘텐츠(study.yaml)를 제공한다.

---

## 핵심 원칙

### 1. note.py가 먼저
- note.py를 먼저 완성하고, 그 코드를 기반으로 study.yaml 작성
- note.py의 실제 셀 코드를 study.yaml에서 그대로 활용
- setHeader/setFooter 등 위젯 코드는 study.yaml에서 제외

### 2. study.yaml은 note.py 해석서
- note.py의 각 셀을 섹션으로 분리하여 상세 설명
- 왜 이렇게 작성했는지, 실무에서 어떻게 활용하는지 기술
- 부정적 내용 X → 긍정적 가치와 실무 활용도 강조

### 3. 선수지식 연결
- note.py 분석 후 필요한 선수지식 파악
- 기존 학습 콘텐츠 내 관련 링크 제공
- SearchManager 클래스의 링크 데이터 활용 가능

---

## 폴더 구조

```
practical/
├── 00_실전파이썬소개.yaml
├── 01_엑셀파일병합/
│   ├── note.py              # 완성된 마리모 앱 (먼저 작성)
│   └── study.yaml           # note.py 학습 콘텐츠
├── 02_PDF병합/
│   ├── note.py
│   └── study.yaml
├── noteWidgets/
│   └── widgets.py           # 공통 위젯 (setHeader, setFooter)
```

폴더명은 **반드시 숫자 접두사** 포함 (01_, 02_ 등)

---

## note.py 작성 원칙

### 구조
```python
# /// script
# [tool.marimo.display]
# theme = "light"
# ///

import marimo
__generated_with = "0.18.4"
app = marimo.App(app_title="앱 제목")

with app.setup:
    # 위젯 import (study.yaml에서 제외)
    from noteWidgets.widgets import setHeader, setFooter

    # 상수 정의
    TITLE = "앱 제목"
    SHORTDESC = "짧은 설명"
    LONGDESC = "긴 설명..."
    STUDYURL = "/study/실전파이썬/01_폴더명"

# 헤더 셀 (study.yaml 제외)
@app.cell
def _():
    setHeader(TITLE, SHORTDESC, LONGDESC)
    return

# ===== 실제 학습 대상 셀들 (study.yaml에 포함) =====

@app.cell
def _():
    # 셀 1: 라이브러리 임포트
    import pandas as pd
    from io import BytesIO
    return BytesIO, pd

@app.cell
def _():
    # 셀 2: UI 컴포넌트
    ...
    return

# ===== 푸터 셀 (study.yaml 제외) =====
@app.cell
def _():
    setFooter(STUDYURL)
    return
```

### 셀 분리 원칙
1. **하나의 셀 = 하나의 기능** 명확히 분리
2. study.yaml에서 각 셀이 하나의 code 블록이 됨
3. 셀 간 변수 중복 금지 (yaml 1개 = marimo 노트북 1개)

### 제외 대상
- setHeader/setFooter 호출 셀
- app.setup 블록 내용
- 순수 UI 마크다운 셀 (사용 방법 안내 등)

---

## study.yaml 구조

### 1. meta 섹션

```yaml
meta:
  title: 엑셀파일 병합
  practical: true
  appPath: 01_엑셀파일병합
  category: 파일처리
  tags: [엑셀, 병합, pandas, BytesIO]
```

- `practical: true` - 실전 뱃지 표시
- `appPath` - 마리모 앱 폴더명 (숫자접두사 포함)

### 2. intro 섹션

```yaml
intro:
  emoji: "📊"
  title: 엑셀파일 병합
  goal: "목표 한 줄 설명"
  description: "상세 설명..."
```

> **자동 버튼**: intro 우측 상단에 "🔥 도구 사용" 버튼 자동 생성
> 클릭 시 `/marimo/실전파이썬/{폴더명}/` 로 새 탭 이동

### 3. sections 구조

```yaml
sections:
  - id: prerequisites
    title: 선수지식
    subtitle: 이 내용을 먼저 알면 좋아요

  - id: whyThisMatters
    title: 왜 필요한가?
    subtitle: 실무에서 이렇게 쓰입니다

  - id: step1
    title: "1단계: 라이브러리 준비"
    subtitle: pandas와 BytesIO

  - id: step2
    title: "2단계: UI 구성"
    subtitle: 파일 업로드와 옵션 선택

  - id: step3
    title: "3단계: 병합 로직"
    subtitle: concat으로 DataFrame 합치기

  - id: step4
    title: "4단계: 다운로드"
    subtitle: 결과 파일 내보내기

  - id: tryApp
    title: 직접 사용해보기
    subtitle: 완성된 앱 체험
```

---

## 섹션별 작성 가이드

### prerequisites (선수지식)
- note.py 분석 후 필요한 선수지식 파악
- 기존 학습 콘텐츠 링크 제공
- featureCards로 간결하게 정리

```yaml
- id: prerequisites
  title: 선수지식
  blocks:
  - type: text
    content: "이 앱을 이해하려면 아래 내용을 먼저 학습하면 좋습니다."

  - type: featureCards
    cards:
    - emoji: "🐼"
      title: pandas 기초
      description: "DataFrame 생성과 조작"
      link: "/study/라이브러리/pandas_기초"
    - emoji: "📁"
      title: 파일 입출력
      description: "BytesIO와 바이트 처리"
      link: "/study/기초문법/파일처리"
```

### whyThisMatters (왜 필요한가)
- 실제 업무 시나리오 제시
- 수작업 vs 자동화 비교
- **긍정적** 톤으로 가치 강조

```yaml
- id: whyThisMatters
  title: 왜 필요한가?
  blocks:
  - type: text
    content: "매월 10개 부서에서 엑셀 파일을 받아 합쳐야 한다면..."

  - type: compare
    left:
      icon: "😫"
      title: 수작업
      items:
        - "30분 이상 소요"
        - "실수 위험"
    right:
      icon: "🚀"
      title: 자동화
      items:
        - "3초 만에 완료"
        - "정확한 결과"
```

### step1~N (단계별 구현)
- **note.py의 실제 셀 코드를 그대로 사용**
- 각 코드에 대한 상세 설명
- tip으로 핵심 개념 보충

```yaml
- id: step1
  title: "1단계: 라이브러리 준비"
  blocks:
  - type: text
    content: "pandas로 엑셀을 읽고, BytesIO로 메모리에서 파일을 다룹니다."

  - type: code
    title: 라이브러리 임포트
    content: |-
      import pandas as pd
      from io import BytesIO

  - type: tip
    content: "BytesIO는 바이트 데이터를 파일처럼 다룰 수 있게 해줍니다..."
```

### tryApp (직접 사용해보기)
- 앱 실행 버튼
- 다음 단계 안내

```yaml
- id: tryApp
  title: 직접 사용해보기
  blocks:
  - type: text
    content: "위에서 배운 코드가 모두 적용된 앱입니다."

  - type: linkButtons
    buttons:
      - text: "🔥 엑셀 병합 앱 실행"
        url: "/marimo/실전파이썬/01_엑셀파일병합"
```

---

## 블록 타입

### 기존 블록
- text, code, tip, note, featureCards, compare, table, image, video, linkButtons

### featureCards 확장
```yaml
- type: featureCards
  cards:
  - emoji: "🐼"
    title: pandas 기초
    description: "DataFrame 조작법"
    link: "/study/라이브러리/pandas_기초"  # 선택적 링크
```

---

## 변수명 규칙

기존 PRINCIPLES.md 동일:
- yaml 1개 = marimo 노트북 1개
- 셀 간 변수 재할당 금지
- 카멜케이스 필수

---

## 작성 체크리스트

### note.py
- [ ] setHeader/setFooter 사용
- [ ] 셀 단위로 기능 분리
- [ ] 변수명 중복 없음
- [ ] 카멜케이스 사용

### study.yaml
- [ ] meta.practical: true
- [ ] meta.appPath 설정
- [ ] prerequisites 섹션 (선수지식)
- [ ] whyThisMatters 섹션 (실무 가치)
- [ ] step1~N 섹션 (note.py 셀 코드)
- [ ] tryApp 섹션 (앱 실행 버튼)
- [ ] setHeader/setFooter 코드 제외
- [ ] 긍정적 톤, 상세한 설명

---

## 렌더러 수정 사항

### intro 영역
- 우측 상단에 "🔥 도구 사용" 버튼 추가
- practical: true일 때만 표시
- 클릭 시 `/marimo/실전파이썬/{폴더명}/` 새 탭 이동

### featureCards
- link 속성 지원 추가
- 카드 클릭 시 해당 링크로 이동
