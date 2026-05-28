# IndexError 디버깅 패턴

`IndexError: list index out of range` 는 시퀀스(list/tuple/문자열)의 길이를 넘는
인덱스를 호출했다는 신호다.

## 1. 길이부터 확인

```python
print(len(items))
```

리스트가 비었는지 (`len == 0`) 가 가장 흔한 원인. for 루프나 필터링 결과가 비어 있는데
`items[0]` 를 호출한 경우.

## 2. off-by-one 점검

`items[len(items)]` 는 항상 IndexError. 마지막 요소는 `items[-1]` 또는 `items[len(items) - 1]`.
인덱스는 0부터 시작한다는 점을 다시 본다.

```python
for i in range(len(items)):
    ...  # i 는 0..len-1
```

가능하면 `for item in items:` 또는 `for i, item in enumerate(items):` 로 쓰는 게
off-by-one 자체를 피하는 방법이다.

## 3. 슬라이싱은 IndexError 안 난다

`items[0:100]` 처럼 슬라이스는 범위를 넘어도 빈 리스트만 돌려준다. **단일 인덱스**
(`items[100]`) 만 IndexError. 즉 코드에서 단일 인덱스 호출 위치를 좁혀 본다.

```python
safe = items[:100]  # ok 항상
```

핵심: IndexError 는 "지금 시퀀스 길이가 내 기대보다 작다" 의 외침. `len()` 출력으로
바로 확인하고, 가능하면 인덱스를 쓰지 않는 표현으로 바꾼다.
