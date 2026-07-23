from __future__ import annotations

from typing import Any

from .common import TaskBlueprint, raises, task


T = task
E = raises


def decision(slug: str, title: str, goal: str, entry: str, table: dict[str, dict[str, Any]]) -> TaskBlueprint:
    solution = f"def {entry}(situation):\n    table = {table!r}\n    if situation not in table:\n        raise ValueError('unknown situation')\n    return table[situation]\n"
    cases = [("recalls-" + key, [key], value) for key, value in list(table.items())[:2]] + [("rejects-unknown", ["unknown"], E("ValueError"))]
    return T(slug, title, goal, f"{entry}(situation)를 완성해 method, evidence, risk를 반환하세요.", f"def {entry}(situation):\n    raise NotImplementedError", solution, entry, cases, ["기호 계산의 가정과 정의역을 결과와 함께 남기세요.", "소수 근삿값과 exact 결과를 구분하세요."])


BLUEPRINTS: dict[str, dict[str, TaskBlueprint]] = {
    "00": {
        "mastery": T("symbolic-contract", "기호식의 변수·정의역 계약 만들기", "식이 참조하는 기호와 허용 정의역을 검사한다.", "audit_expression(symbols, assumptions, required)를 완성하세요.", "def audit_expression(symbols, assumptions, required):\n    raise NotImplementedError", """def audit_expression(symbols, assumptions, required):
    duplicates = sorted({name for name in symbols if symbols.count(name) > 1})
    missing = sorted(set(required) - set(symbols))
    unknown = sorted(set(assumptions) - set(symbols))
    return {"valid": not duplicates and not missing and not unknown, "symbols": sorted(set(symbols)), "duplicates": duplicates, "missing": missing, "unknownAssumptions": unknown}
""", "audit_expression", [("accepts-explicit-contract", [["x", "y"], {"x": "real"}, ["x"]], {"valid": True, "symbols": ["x", "y"], "duplicates": [], "missing": [], "unknownAssumptions": []}), ("reports-contract-errors", [["x", "x"], {"z": "positive"}, ["x", "y"]], {"valid": False, "symbols": ["x"], "duplicates": ["x"], "missing": ["y"], "unknownAssumptions": ["z"]})], ["같은 이름의 symbol을 여러 객체로 만들지 마세요.", "양수·실수 같은 assumption은 식 변형 결과를 바꿀 수 있습니다."]),
        "transfer": T("exact-number-policy", "새 계산에 exact number 정책 전이하기", "정수·유리수·소수 입력에서 exact와 approximate 경계를 고른다.", "classify_numbers(values)를 완성하세요.", "def classify_numbers(values):\n    raise NotImplementedError", """def classify_numbers(values):
    exact = []; approximate = []
    for value in values:
        if isinstance(value, bool): raise ValueError("boolean is not a numeric contract")
        if isinstance(value, int) or isinstance(value, str) and "/" in value: exact.append(value)
        elif isinstance(value, float): approximate.append(value)
        else: raise ValueError("unsupported number")
    return {"exact": exact, "approximate": approximate, "mixed": bool(exact and approximate)}
""", "classify_numbers", [("separates-exact-and-float", [[1, "1/3", 0.5]], {"exact": [1, "1/3"], "approximate": [0.5], "mixed": True}), ("keeps-exact-only", [[2, "3/7"]], {"exact": [2, "3/7"], "approximate": [], "mixed": False}), ("rejects-bool", [[True]], E("ValueError"))], ["Python float를 exact 유리수로 가장하지 마세요.", "근사는 최종 표시 경계에서 수행하세요."]),
        "retrieval": decision("symbolic-engine-choice", "기호 계산 사용 경계 회상하기", "exact algebra와 numeric approximation을 구분한다.", "choose_symbolic_boundary", {"algebraic-proof": {"method": "symbolic exact", "evidence": "simplified difference is zero", "risk": "missing assumptions"}, "large-numeric-array": {"method": "numeric library", "evidence": "tolerance", "risk": "symbolic explosion"}, "final-decimal": {"method": "evalf at boundary", "evidence": "precision", "risk": "early rounding"}}),
    },
    "01": {
        "mastery": T("polynomial-combine", "다항식 동류항 정리하기", "차수별 계수를 합치고 0 계수를 제거한다.", "combine_terms(terms)를 완성하세요.", "def combine_terms(terms):\n    raise NotImplementedError", """def combine_terms(terms):
    coefficients = {}
    for power, coefficient in terms: coefficients[power] = coefficients.get(power, 0) + coefficient
    return [[power, coefficients[power]] for power in sorted(coefficients, reverse=True) if coefficients[power] != 0]
""", "combine_terms", [("combines-like-terms", [[[2, 3], [1, 2], [2, -1], [0, 4]]], [[2, 2], [1, 2], [0, 4]]), ("removes-zero-term", [[[1, 5], [1, -5]]], [])], ["같은 power끼리만 coefficient를 합치세요.", "결과 순서를 높은 차수부터 고정하세요."]),
        "transfer": T("polynomial-expand", "새 곱셈식에 전개 전이하기", "두 다항식 coefficient 배열을 convolution해 전개한다.", "multiply_polynomials(left, right)를 완성하세요.", "def multiply_polynomials(left, right):\n    raise NotImplementedError", """def multiply_polynomials(left, right):
    if not left or not right: return []
    result = [0] * (len(left) + len(right) - 1)
    for i, a in enumerate(left):
        for j, b in enumerate(right): result[i + j] += a * b
    while result and result[-1] == 0: result.pop()
    return result
""", "multiply_polynomials", [("expands-two-polynomials", [[1, 1], [-1, 1]], [-1, 0, 1]), ("handles-zero-polynomial", [[0], [2, 3]], []), ("handles-empty", [[], [1]], [])], ["배열 index를 x의 power로 해석하세요.", "0 coefficient가 생긴 중간 항도 convolution에 포함하세요."]),
        "retrieval": decision("algebra-operation", "대수 연산 선택 회상하기", "simplify·expand·factor의 목표를 구분한다.", "choose_algebra_operation", {"remove-redundancy": {"method": "simplify", "evidence": "equivalence check", "risk": "unexpected form"}, "show-all-terms": {"method": "expand", "evidence": "coefficient map", "risk": "expression growth"}, "find-roots-structure": {"method": "factor", "evidence": "product expansion", "risk": "domain assumptions"}}),
    },
    "02": {
        "mastery": T("formula-substitution", "수식에 값을 안전하게 대입하기", "변수 누락과 알 수 없는 값을 거부하고 선형 결합을 계산한다.", "substitute_linear(coefficients, constant, values)를 완성하세요.", "def substitute_linear(coefficients, constant, values):\n    raise NotImplementedError", """def substitute_linear(coefficients, constant, values):
    missing = sorted(set(coefficients) - set(values)); unknown = sorted(set(values) - set(coefficients))
    if missing or unknown: raise ValueError("substitution contract mismatch")
    return constant + sum(coefficients[name] * values[name] for name in coefficients)
""", "substitute_linear", [("substitutes-all-symbols", [{"x": 2, "y": -1}, 3, {"x": 4, "y": 5}], 6), ("handles-no-symbols", [{}, 7, {}], 7), ("rejects-missing", [{"x": 1}, 0, {}], E("ValueError"))], ["free symbol이 하나라도 남으면 숫자 결과로 부르지 마세요.", "알 수 없는 입력 key도 조용히 무시하지 마세요."]),
        "transfer": T("batch-evaluation", "새 시나리오 batch에 대입 전이하기", "같은 quadratic 식을 여러 x에 exact하게 평가한다.", "evaluate_quadratic(a, b, c, values)를 완성하세요.", "def evaluate_quadratic(a, b, c, values):\n    raise NotImplementedError", """def evaluate_quadratic(a, b, c, values):
    return [{"x": x, "value": a*x*x + b*x + c} for x in values]
""", "evaluate_quadratic", [("evaluates-batch", [2, -3, 1, [0, 1, 2]], [{"x": 0, "value": 1}, {"x": 1, "value": 0}, {"x": 2, "value": 3}]), ("handles-empty-batch", [1, 0, 0, []], [])], ["식 구조는 한 번 정의하고 값만 바꾸세요.", "입력 순서를 결과에 보존하세요."]),
        "retrieval": decision("substitution-policy", "대입 정책 회상하기", "단일·batch·부분 대입을 구분한다.", "choose_substitution", {"all-known": {"method": "full substitution", "evidence": "no free symbols", "risk": "unknown keys"}, "many-scenarios": {"method": "lambdify or batch evaluation", "evidence": "same expression hash", "risk": "numeric precision"}, "keep-parameter": {"method": "partial substitution", "evidence": "remaining free symbols", "risk": "called numeric result"}}),
    },
    "03": {
        "mastery": T("linear-equation", "일차방정식의 해와 특수 경우 구분하기", "ax+b=0에서 unique·none·all 해를 반환한다.", "solve_linear(a, b)를 완성하세요.", "def solve_linear(a, b):\n    raise NotImplementedError", """def solve_linear(a, b):
    if a == 0: return {"kind": "all" if b == 0 else "none", "solutions": []}
    return {"kind": "unique", "solutions": [-b / a]}
""", "solve_linear", [("solves-unique", [2, -6], {"kind": "unique", "solutions": [3.0]}), ("detects-no-solution", [0, 4], {"kind": "none", "solutions": []}), ("detects-all-values", [0, 0], {"kind": "all", "solutions": []})], ["계수가 0인 경우를 나눗셈 전에 처리하세요.", "해가 없음과 모든 값이 해임을 같은 빈 배열로만 표현하지 마세요."]),
        "transfer": T("quadratic-real-roots", "새 이차방정식에 해법 전이하기", "판별식으로 실근 개수와 정렬된 근을 반환한다.", "solve_quadratic(a, b, c)를 완성하세요.", "def solve_quadratic(a, b, c):\n    raise NotImplementedError", """def solve_quadratic(a, b, c):
    if a == 0: raise ValueError("not quadratic")
    discriminant = b*b - 4*a*c
    if discriminant < 0: return {"discriminant": discriminant, "roots": []}
    root = discriminant ** 0.5
    roots = sorted({(-b-root)/(2*a), (-b+root)/(2*a)})
    return {"discriminant": discriminant, "roots": roots}
""", "solve_quadratic", [("finds-two-roots", [1, -3, 2], {"discriminant": 1, "roots": [1.0, 2.0]}), ("deduplicates-double-root", [1, 2, 1], {"discriminant": 0, "roots": [-1.0]}), ("returns-no-real-roots", [1, 0, 1], {"discriminant": -4, "roots": []}), ("rejects-linear", [0, 1, 1], E("ValueError"))], ["실수 정의역에서는 음의 판별식이 해 없음입니다.", "중근은 같은 해를 두 번 반환하지 마세요."]),
        "retrieval": decision("equation-solver", "방정식 풀이 검증 회상하기", "해 집합과 검산을 구분한다.", "choose_equation_method", {"one-linear": {"method": "solve coefficient cases", "evidence": "substitute solution", "risk": "zero coefficient"}, "polynomial": {"method": "factor or solve", "evidence": "root multiplicity", "risk": "domain mismatch"}, "system": {"method": "linear solve", "evidence": "rank and residual", "risk": "singular matrix"}}),
    },
    "04": {
        "mastery": T("polynomial-derivative", "다항식 미분 계수 계산하기", "power rule로 coefficient 배열의 도함수를 반환한다.", "differentiate(coefficients)를 완성하세요.", "def differentiate(coefficients):\n    raise NotImplementedError", """def differentiate(coefficients):
    result = [power * coefficient for power, coefficient in enumerate(coefficients)][1:]
    while result and result[-1] == 0: result.pop()
    return result
""", "differentiate", [("applies-power-rule", [[3, 2, 5]], [2, 10]), ("constant-derivative-zero", [[7]], []), ("handles-zero-tail", [[1, 0, 0]], [])], ["배열 index가 power입니다.", "상수항의 미분은 0이며 표현에서 제거합니다."]),
        "transfer": T("marginal-change", "새 비용 함수에 미분 전이하기", "quadratic 비용의 marginal cost와 stationary point를 계산한다.", "quadratic_sensitivity(a, b, c, x)를 완성하세요.", "def quadratic_sensitivity(a, b, c, x):\n    raise NotImplementedError", """def quadratic_sensitivity(a, b, c, x):
    derivative = 2*a*x + b
    stationary = None if a == 0 else -b/(2*a)
    return {"value": a*x*x+b*x+c, "derivative": derivative, "stationary": stationary}
""", "quadratic_sensitivity", [("computes-sensitivity", [2, -8, 3, 1], {"value": -3, "derivative": -4, "stationary": 2.0}), ("handles-linear", [0, 3, 1, 2], {"value": 7, "derivative": 3, "stationary": None})], ["도함수는 순간 변화율이지 실제 유한 변화량이 아닙니다.", "stationary point 존재와 최소값 여부를 구분하세요."]),
        "retrieval": decision("derivative-meaning", "미분 의미 회상하기", "기울기·최적점·수치 근사를 구분한다.", "choose_derivative", {"symbolic-slope": {"method": "differentiate", "evidence": "power rule and simplification", "risk": "missing domain"}, "stationary-point": {"method": "solve derivative equals zero", "evidence": "second derivative", "risk": "maximum or saddle"}, "black-box-function": {"method": "finite difference", "evidence": "step sensitivity", "risk": "roundoff"}}),
    },
    "05": {
        "mastery": T("power-integral", "거듭제곱 부정적분 계수 만들기", "n!=-1인 항의 power와 coefficient를 올바르게 변환한다.", "integrate_power(coefficient, power)를 완성하세요.", "def integrate_power(coefficient, power):\n    raise NotImplementedError", """def integrate_power(coefficient, power):
    if power == -1: return {"kind": "log", "coefficient": coefficient}
    return {"kind": "power", "coefficient": coefficient/(power+1), "power": power+1}
""", "integrate_power", [("integrates-polynomial-term", [6, 2], {"kind": "power", "coefficient": 2.0, "power": 3}), ("handles-reciprocal", [3, -1], {"kind": "log", "coefficient": 3})], ["x^-1은 일반 power rule의 예외입니다.", "부정적분에는 임의 상수가 있음을 해석에서 남기세요."]),
        "transfer": T("definite-polynomial-area", "새 누적량 문제에 정적분 전이하기", "다항식의 부호 있는 정적분을 exact formula로 계산한다.", "definite_integral(coefficients, lower, upper)를 완성하세요.", "def definite_integral(coefficients, lower, upper):\n    raise NotImplementedError", """def definite_integral(coefficients, lower, upper):
    if lower > upper: raise ValueError("reversed interval")
    def antiderivative(x): return sum(coefficient*x**(power+1)/(power+1) for power, coefficient in enumerate(coefficients))
    return antiderivative(upper)-antiderivative(lower)
""", "definite_integral", [("integrates-linear-polynomial", [[0, 2], 0, 3], 9.0), ("keeps-signed-area", [[-1], 0, 2], -2.0), ("rejects-reversed", [[1], 2, 1], E("ValueError"))], ["정적분은 일반적으로 기하학적 절대 면적이 아니라 부호 있는 누적량입니다.", "적분 구간 순서를 명시하세요."]),
        "retrieval": decision("integral-meaning", "적분 의미 회상하기", "부정적분·정적분·절대면적을 구분한다.", "choose_integral", {"family-antiderivative": {"method": "indefinite integral", "evidence": "differentiate result", "risk": "missing constant"}, "net-accumulation": {"method": "definite integral", "evidence": "bounds and units", "risk": "signed result"}, "geometric-area": {"method": "integral of absolute value", "evidence": "zero crossings", "risk": "cancellation"}}),
    },
    "06": {
        "mastery": T("geometric-series", "등비급수 부분합과 수렴 판단하기", "첫 항·공비·항 수로 부분합과 무한 수렴값을 반환한다.", "geometric_series(first, ratio, count)를 완성하세요.", "def geometric_series(first, ratio, count):\n    raise NotImplementedError", """def geometric_series(first, ratio, count):
    if count < 0: raise ValueError("negative count")
    partial = sum(first*ratio**index for index in range(count))
    limit = first/(1-ratio) if abs(ratio) < 1 else None
    return {"partial": partial, "converges": abs(ratio) < 1, "limit": limit}
""", "geometric_series", [("computes-convergent-series", [1, 0.5, 3], {"partial": 1.75, "converges": True, "limit": 2.0}), ("marks-divergent", [2, 1, 4], {"partial": 8, "converges": False, "limit": None}), ("rejects-negative-count", [1, 0, -1], E("ValueError"))], ["부분합과 무한합을 같은 값으로 부르지 마세요.", "무한 등비급수는 |r|<1일 때만 수렴합니다."]),
        "transfer": T("rational-leading-limit", "새 유리함수 극한에 차수 비교 전이하기", "x→infinity에서 분자·분모 leading term으로 극한을 판정한다.", "rational_infinity_limit(num_degree, num_lead, den_degree, den_lead)를 완성하세요.", "def rational_infinity_limit(num_degree, num_lead, den_degree, den_lead):\n    raise NotImplementedError", """def rational_infinity_limit(num_degree, num_lead, den_degree, den_lead):
    if den_lead == 0 or num_degree < 0 or den_degree < 0: raise ValueError("invalid leading term")
    if num_degree < den_degree: return 0.0
    if num_degree == den_degree: return num_lead/den_lead
    sign = 1 if num_lead/den_lead > 0 else -1
    return "infinity" if sign > 0 else "-infinity"
""", "rational_infinity_limit", [("lower-degree-goes-zero", [1, 2, 2, 3], 0.0), ("equal-degree-ratio", [2, 6, 2, 3], 2.0), ("higher-degree-diverges", [3, -1, 1, 2], "-infinity"), ("rejects-zero-denominator-lead", [1, 1, 2, 0], E("ValueError"))], ["최고차항의 차수를 먼저 비교하세요.", "양방향 infinity와 x→+infinity를 구분하세요."]),
        "retrieval": decision("limit-series-choice", "극한과 급수 판단 회상하기", "수렴 조건과 계산 방법을 구분한다.", "choose_limit_method", {"geometric-sum": {"method": "ratio test", "evidence": "absolute ratio below one", "risk": "partial sum as limit"}, "rational-infinity": {"method": "leading degrees", "evidence": "leading coefficients", "risk": "lower terms"}, "indeterminate-form": {"method": "simplify or L'Hopital with conditions", "evidence": "form after substitution", "risk": "automatic rule"}}),
    },
    "07": {
        "mastery": T("trig-components", "각도와 크기를 직교 성분으로 분해하기", "degree 입력을 radian으로 바꿔 x,y component를 계산한다.", "vector_components(magnitude, degrees)를 완성하세요.", "def vector_components(magnitude, degrees):\n    raise NotImplementedError", """def vector_components(magnitude, degrees):
    import math
    radians = math.radians(degrees)
    return {"x": round(magnitude*math.cos(radians), 6), "y": round(magnitude*math.sin(radians), 6)}
""", "vector_components", [("splits-zero-angle", [5, 0], {"x": 5.0, "y": 0.0}), ("splits-right-angle", [2, 90], {"x": 0.0, "y": 2.0}), ("handles-negative-angle", [2, -90], {"x": 0.0, "y": -2.0})], ["degree와 radian 단위를 명시적으로 변환하세요.", "부동소수점 잔차는 표시 경계에서 반올림하세요."]),
        "transfer": T("trig-identity-check", "새 각도 표본에 항등식 전이하기", "sin²+cos²=1의 수치 잔차를 여러 각도에서 측정한다.", "audit_identity(degrees_list, tolerance)를 완성하세요.", "def audit_identity(degrees_list, tolerance):\n    raise NotImplementedError", """def audit_identity(degrees_list, tolerance):
    import math
    residuals = [abs(math.sin(math.radians(value))**2 + math.cos(math.radians(value))**2 - 1) for value in degrees_list]
    maximum = max(residuals, default=0.0)
    return {"passed": maximum <= tolerance, "maxResidual": round(maximum, 15), "sampleCount": len(degrees_list)}
""", "audit_identity", [("passes-identity-samples", [[0, 30, 45, 90], 1e-12], {"passed": True, "maxResidual": 0.0, "sampleCount": 4}), ("handles-empty-samples", [[], 0], {"passed": True, "maxResidual": 0.0, "sampleCount": 0})], ["수치 검사는 sample 범위와 tolerance를 함께 남기세요.", "몇 개 표본 통과를 기호 증명으로 부르지 마세요."]),
        "retrieval": decision("trig-contract", "삼각함수 계약 회상하기", "단위·항등식·정의역을 구분한다.", "choose_trig_method", {"physical-angle": {"method": "convert degrees to radians", "evidence": "unit label", "risk": "unit mix"}, "identity-proof": {"method": "symbolic simplify", "evidence": "difference zero under assumptions", "risk": "numeric samples only"}, "inverse-trig": {"method": "domain-aware inverse", "evidence": "principal range", "risk": "multiple angles"}}),
    },
    "08": {
        "mastery": T("matrix-multiply", "행렬 곱 shape와 값을 검증하기", "inner dimension을 검사하고 matrix product를 계산한다.", "matrix_multiply(left, right)를 완성하세요.", "def matrix_multiply(left, right):\n    raise NotImplementedError", """def matrix_multiply(left, right):
    if not left or not right or not left[0] or not right[0]: raise ValueError("empty matrix")
    if any(len(row) != len(left[0]) for row in left) or any(len(row) != len(right[0]) for row in right): raise ValueError("ragged matrix")
    if len(left[0]) != len(right): raise ValueError("shape mismatch")
    return [[sum(left[i][k]*right[k][j] for k in range(len(right))) for j in range(len(right[0]))] for i in range(len(left))]
""", "matrix_multiply", [("multiplies-compatible-shapes", [[[1, 2], [3, 4]], [[2], [1]]], [[4], [10]]), ("multiplies-row-by-matrix", [[[1, 0]], [[5, 6], [7, 8]]], [[5, 6]]), ("rejects-shape-mismatch", [[[1, 2]], [[1, 2]]], E("ValueError"))], ["곱셈 가능 조건은 left columns=right rows입니다.", "elementwise 곱과 matrix 곱을 구분하세요."]),
        "transfer": T("solve-two-by-two", "새 연립방정식에 행렬 해법 전이하기", "2x2 determinant로 unique와 singular를 구분한다.", "solve_2x2(matrix, values)를 완성하세요.", "def solve_2x2(matrix, values):\n    raise NotImplementedError", """def solve_2x2(matrix, values):
    if len(matrix) != 2 or any(len(row) != 2 for row in matrix) or len(values) != 2: raise ValueError("expected 2x2 system")
    a,b = matrix[0]; c,d = matrix[1]; determinant = a*d-b*c
    if determinant == 0: return {"kind": "singular", "solution": None, "determinant": 0}
    x = (values[0]*d-b*values[1])/determinant; y = (a*values[1]-values[0]*c)/determinant
    return {"kind": "unique", "solution": [x,y], "determinant": determinant}
""", "solve_2x2", [("solves-unique-system", [[[2, 1], [1, -1]], [5, 1]], {"kind": "unique", "solution": [2.0, 1.0], "determinant": -3}), ("detects-singular", [[[1, 2], [2, 4]], [3, 6]], {"kind": "singular", "solution": None, "determinant": 0}), ("rejects-wrong-shape", [[[1]], [1]], E("ValueError"))], ["determinant 0이면 역행렬을 만들지 마세요.", "singular에서 해 없음과 무한개는 추가 rank 검사가 필요합니다."]),
        "retrieval": decision("matrix-operation", "행렬 연산 선택 회상하기", "곱·해·역행렬의 조건을 구분한다.", "choose_matrix_method", {"compose-linear-maps": {"method": "matrix multiplication", "evidence": "shape contract", "risk": "order reversal"}, "solve-system": {"method": "linear solve", "evidence": "rank and residual", "risk": "explicit inverse"}, "singularity": {"method": "determinant or rank", "evidence": "zero determinant", "risk": "floating tolerance"}}),
    },
    "09": {
        "mastery": T("plot-domain-samples", "수식 시각화의 정의역 표본 만들기", "구간·표본 수를 검증하고 endpoint를 포함한 x grid를 만든다.", "sample_domain(lower, upper, count)를 완성하세요.", "def sample_domain(lower, upper, count):\n    raise NotImplementedError", """def sample_domain(lower, upper, count):
    if lower >= upper or count < 2: raise ValueError("invalid plot domain")
    step = (upper-lower)/(count-1)
    return [round(lower+index*step, 10) for index in range(count)]
""", "sample_domain", [("includes-both-endpoints", [0, 1, 3], [0.0, 0.5, 1.0]), ("samples-negative-domain", [-1, 1, 5], [-1.0, -0.5, 0.0, 0.5, 1.0]), ("rejects-one-sample", [0, 1, 1], E("ValueError"))], ["count는 interval 수가 아니라 sample 수입니다.", "endpoint 포함 여부를 명시하세요."]),
        "transfer": T("discontinuity-segments", "새 유리함수 plot에 불연속 처리 전이하기", "금지 x 주변에서 line을 연결하지 않도록 segment를 분리한다.", "split_domain(values, excluded, tolerance)를 완성하세요.", "def split_domain(values, excluded, tolerance):\n    raise NotImplementedError", """def split_domain(values, excluded, tolerance):
    segments = []; current = []
    for value in values:
        if any(abs(value-point) <= tolerance for point in excluded):
            if current: segments.append(current); current = []
        else: current.append(value)
    if current: segments.append(current)
    return segments
""", "split_domain", [("splits-at-discontinuity", [[-2,-1,0,1,2], [0], 0], [[-2,-1],[1,2]]), ("uses-tolerance", [[0.0,0.99,1.01,2.0], [1.0], 0.02], [[0.0],[2.0]])], ["불연속점을 건너 line으로 연결하지 마세요.", "제외 tolerance와 정의역 단위를 함께 기록하세요."]),
        "retrieval": decision("symbolic-plot-evidence", "수식 plot 증거 회상하기", "정의역·불연속·정확값을 구분한다.", "choose_plot_contract", {"smooth-function": {"method": "sampled line", "evidence": "domain and resolution", "risk": "missed oscillation"}, "discontinuity": {"method": "split segments", "evidence": "excluded points", "risk": "false connecting line"}, "exact-root": {"method": "symbolic solve plus marker", "evidence": "substitution residual", "risk": "visual estimate"}}),
    },
    "10": {
        "mastery": T("quadratic-optimization", "종합 문제의 이차함수 최적점 검증하기", "정의역 안 vertex와 두 endpoint를 비교해 최소값을 반환한다.", "minimize_quadratic(a, b, c, lower, upper)를 완성하세요.", "def minimize_quadratic(a, b, c, lower, upper):\n    raise NotImplementedError", """def minimize_quadratic(a, b, c, lower, upper):
    if lower > upper: raise ValueError("invalid domain")
    candidates = [lower, upper]
    if a != 0:
        vertex = -b/(2*a)
        if lower <= vertex <= upper: candidates.append(vertex)
    scored = [(a*x*x+b*x+c, x) for x in candidates]
    value, x = min(scored)
    return {"x": x, "value": value, "candidates": sorted(set(candidates))}
""", "minimize_quadratic", [("finds-interior-minimum", [1,-4,5,0,5], {"x": 2.0, "value": 1.0, "candidates": [0,2.0,5]}), ("uses-boundary-for-concave", [-1,0,0,-2,1], {"x": -2, "value": -4, "candidates": [-2,0.0,1]}), ("rejects-domain", [1,0,0,2,1], E("ValueError"))], ["stationary point만 보지 말고 정의역 endpoint도 비교하세요.", "도함수 0이 최소인지 이차항 부호로 확인하세요."]),
        "transfer": T("solution-residual", "새 수학 pipeline에 검산 전이하기", "후보 해를 원 식에 대입해 tolerance 내 residual과 실패 항목을 반환한다.", "audit_solutions(coefficients, candidates, tolerance)를 완성하세요.", "def audit_solutions(coefficients, candidates, tolerance):\n    raise NotImplementedError", """def audit_solutions(coefficients, candidates, tolerance):
    rows = []
    for value in candidates:
        residual = abs(sum(coefficient*value**power for power, coefficient in enumerate(coefficients)))
        rows.append({"value": value, "residual": round(residual,12), "valid": residual <= tolerance})
    return {"rows": rows, "allValid": all(row["valid"] for row in rows)}
""", "audit_solutions", [("validates-roots", [[-1,0,1], [-1,1], 1e-9], {"rows": [{"value": -1, "residual": 0, "valid": True}, {"value": 1, "residual": 0, "valid": True}], "allValid": True}), ("reports-invalid-candidate", [[-2,1], [0,2], 0], {"rows": [{"value": 0, "residual": 2, "valid": False}, {"value": 2, "residual": 0, "valid": True}], "allValid": False})], ["해를 구한 방법과 독립적으로 원 식 residual을 계산하세요.", "tolerance를 0으로 고정하지 말고 숫자 표현에 맞추세요."]),
        "retrieval": decision("math-project-evidence", "종합 수학 문제 증거 회상하기", "기호 결과·정의역·검산을 한 chain으로 묶는다.", "choose_math_evidence", {"closed-form-solution": {"method": "symbolic derivation", "evidence": "substitution residual", "risk": "missing branches"}, "domain-optimization": {"method": "critical points plus boundaries", "evidence": "candidate ledger", "risk": "stationary-only"}, "reported-decimal": {"method": "exact then approximate", "evidence": "precision and exact source", "risk": "early rounding"}}),
    },
}
