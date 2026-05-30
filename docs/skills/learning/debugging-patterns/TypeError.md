---
title: TypeError 디버깅 패턴
description: 자료형·함수 시그니처 불일치 진단.
section: reference
order: 904
---

# TypeError 디버깅 패턴

`TypeError: unsupported operand type(s) for ...` / `... takes N positional arguments but M were given`
같은 메시지는 자료형 또는 함수 시그니처가 맞지 않는다는 신호다.

## 1. 양쪽 타입 출력

```python
print(type(left).__name__, type(right).__name__)
```

`'10' + 5` 같이 문자열과 숫자를 섞은 게 가장 흔한 1번 원인. 입력값이 어디서 왔는지를
거꾸로 거슬러 보면 `input()` 결과를 `int()` 로 변환하지 않은 경우가 많다.

## 2. 함수 시그니처 다시 보기

```python
help(func)
```

또는 정의 위치에 가서 `def func(a, b, c):` 처럼 인자 수와 키워드 인자 이름을 확인.
함수가 `self` 를 첫 인자로 요구하는데 인스턴스 메서드를 클래스에서 직접 호출하면
`takes 1 positional argument but 2 were given` 같은 모양으로 자주 보인다.

## 3. 컬렉션 vs 단일 값

`some_list * other_list` 처럼 리스트끼리 산술 연산을 시도했거나, `dict_obj + 1` 같이
딕셔너리에 숫자를 더하려는 경우. 컬렉션 안의 값을 꺼내거나 (`sum(some_list)`) 적절한
변환을 거쳐야 한다.

```python
result = sum(items) + bonus
```

핵심: TypeError 는 "내가 가진 값" 과 "함수/연산이 기대하는 값" 의 차이다. 항상
**현재 자료형** 을 출력해서 가정과 실제를 맞춰본다.
