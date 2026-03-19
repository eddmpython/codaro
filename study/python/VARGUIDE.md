# 변수 개선 + 미션카드 가이드

## 핵심: yaml 1개 = marimo 노트북 1개

정규든 미션이든 같은 노트북. 파일 전체 변수 중복 금지.
type : code는 하나의 marimo 노트북의 셀과 같다
marimo는 절대 변수재할당을 허용하지 않는다
따라서 상수변수 계속 가능이란 있을수 없다 
---

## 변수명 우선순위

1단어 > 유사어 > 짧은2단어 > 숫자접미사(2개까지)

---

## 미션카드 분리 규칙

하나의 code에 너무 많으면 학습 방해. 탐색적으로 중간 확인 가능하게 분리.

분리 기준:
- 데이터 로드
- 전처리
- 시각화 요소별
- 패널별

---

## 미션 앞에 팁 필수

```yaml
- type: tip
  content: 각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
```

---

## 예시

code 세개 네개 가능. 코드가 긴 경우 탐색적으로 확인 가능하게 분리가 핵심.

```yaml
- type: expansion
  title: "미션1: 제목"
  blocks:
  - type: code
    title: "데이터 로드"
    content: |-
      import seaborn as sns
      data = sns.load_dataset('iris')
  - type: code
    title: "차트 생성"
    content: |-
      chart, plot = plt.subplots()
      plot.scatter(data['x'], data['y'])
      chart
```

---

## Agent 협업 규칙

- 작성: 메인 agent가 yaml 파일 작성
- 검토: Task agent(Explore)로 변수 중복 검사 요청
- 검사 범위: 파일 전체 (정규 + expansion 통합)

---

## 변수 중복 검사 명령어

marimo yaml 작성 완료 후 반드시 실행:
```
파일 전체 code 블록에서 할당문(=) 왼쪽 변수명 추출하여 중복 검사
```

---

## 자주 쓰는 1단어 변수 목록 (우선 사용)

| 용도 | 1단어 | 유사어 |
|------|-------|--------|
| 데이터 | data | df, dataset, info, raw, frame |
| 차트 | chart | fig, plot, graph, viz, ax |
| 테이블 | table | grid, matrix, board |
| 입력 | input | text, field, entry |
| 버튼 | btn | button, trigger, action |
| 슬라이더 | slider | range, scale |
| 선택 | select | choice, pick, option |
| 결과 | result | output, answer, response |
| 필터 | filter | query, condition |
| 카운터 | count | counter, total, num |

---

## 긴급 수정 패턴

기존 변수와 충돌 시 빠른 대체:
- data → dataset → info → rawData → data2
- chart → fig → plot → graph → chart2
- result → output → answer → response → result2
