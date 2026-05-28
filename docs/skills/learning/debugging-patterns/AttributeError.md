# AttributeError 디버깅 패턴

`AttributeError: '...' object has no attribute '...'` 는 객체에 그 이름의 속성/메서드가
없다는 신호다.

## 1. 객체 타입과 사용 가능한 속성 확인

```python
print(type(obj).__name__)
print([attr for attr in dir(obj) if not attr.startswith('_')])
```

내가 가진 게 정말 `DataFrame` 인지 `Series` 인지 — 자주 헷갈리는 게 pandas 객체끼리의
혼동이다. `df.head()` 는 DataFrame 에 있지만 `dict.head()` 는 없다.

## 2. None 객체 점검

`None.something` 은 거의 모든 AttributeError 의 단골 원인. `func()` 가 `None` 을 반환하는
경우 — 흔한 예: `sorted_list = items.sort()` (sort 는 in-place, None 반환).

```python
result = some_call()
print('result:', result)  # None?
```

## 3. 오타·메서드 이름

`.upper()` vs `.uppercase()`, `.append()` vs `.add()`, `.split()` vs `.spilt()`. 잘
모르면 `dir(obj)` 로 후보 출력 후 가장 가까운 이름을 골라본다.

```python
import difflib
print(difflib.get_close_matches('upercase', dir('hello')))
```

핵심: AttributeError 는 **타입 가정과 실제 타입의 차이** 또는 **None 흐름** 문제. 객체
타입을 먼저 출력하고, 거기서 사용 가능한 속성을 직접 본다.
