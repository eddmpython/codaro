---
title: KeyError 디버깅 패턴
description: 딕셔너리에 없는 키를 호출했을 때의 진단 순서.
section: reference
order: 901
---

# KeyError 디버깅 패턴

`KeyError: '...'` 는 딕셔너리에 없는 키를 `d['...']` 또는 `d.pop('...')` 같이 호출했을 때
발생한다. 주로 다음 세 가지 중 하나가 원인이다.

## 1. 키 목록부터 확인

```python
print(d.keys())
```

내가 부른 키가 실제 딕셔너리에 있는지 본다. **있는 것 같은데 없는** 패턴이 가장 흔한
함정이라, 추측 대신 출력으로 확인한다.

## 2. 오타·대소문자 점검

`d['Name']` vs `d['name']` 는 다른 키다. 데이터 출처가 외부 JSON/CSV 라면 키가
camelCase 인지 snake_case 인지 한 번 더 확인.

```python
print({k: type(k).__name__ for k in d})
```

문자열로 보이는 키가 사실은 숫자(`1` vs `'1'`)일 수도 있다.

## 3. 안전한 접근으로 우회

키가 없을 수 있는 게 정상 흐름이면 `d.get(key, default)` 를 쓴다. 통계나 카운터라면
`d.setdefault(key, [])` / `collections.Counter` / `collections.defaultdict` 가 더 적합.

```python
value = d.get('missing', '없음')
```

핵심: KeyError 를 try/except 로 덮는 건 마지막 수단. 보통 키 흐름을 코드 단계에서
바꾸는 게 더 안정적이다.
