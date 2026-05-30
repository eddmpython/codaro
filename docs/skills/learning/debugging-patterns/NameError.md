---
title: NameError 디버깅 패턴
description: 정의/import 전에 이름을 사용했을 때의 진단.
section: reference
order: 903
---

# NameError 디버깅 패턴

`NameError: name '...' is not defined` 는 이름을 부르기 전에 정의/import 가 안 됐다는
신호다.

## 1. 같은 셀에서 정의했는지 확인

노트북/Codaro 셀은 위에서 아래로 평가된다. 변수를 쓰는 셀보다 정의 셀이 **위쪽** 에
있어야 한다. 정의 셀을 실행하지 않은 채 사용 셀만 누른 경우가 가장 흔하다.

```python
print(dir())  # 현재 네임스페이스에 무엇이 있는지
```

## 2. 오타·대소문자

`my_var` 와 `myVar` 와 `MyVar` 는 모두 다른 이름. Python 은 case-sensitive 라
`Print('hi')` 도 NameError 가 된다. 자주 마주치는 함정: `range` 를 `Range`, `len` 을
`Len` 으로.

## 3. import 빠뜨림

`pd.DataFrame(...)` 을 부르려면 그 셀(또는 그보다 위 셀)에서 `import pandas as pd` 가
실행돼야 한다. 패키지 import 만 따로 모은 setup 셀이 있는지 한 번 더 본다.

```python
import pandas as pd
import numpy as np
```

핵심: NameError 는 거의 항상 **선언 순서** 또는 **철자** 문제. 디버거 대신 `dir()` /
스크롤로 빠르게 해결할 수 있다.
