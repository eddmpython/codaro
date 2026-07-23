from __future__ import annotations

from typing import Any

from .common import TaskBlueprint, raises, task


T = task
E = raises


def decision(slug: str, title: str, goal: str, entry: str, table: dict[str, dict[str, Any]]) -> TaskBlueprint:
    solution = f"def {entry}(situation):\n    table = {table!r}\n    if situation not in table:\n        raise ValueError('unknown situation')\n    return table[situation]\n"
    cases = [("recalls-" + key, [key], value) for key, value in list(table.items())[:2]] + [("rejects-unknown", ["unknown"], E("ValueError"))]
    return T(slug, title, goal, f"{entry}(situation)를 완성해 method, evidence, risk를 반환하세요.", f"def {entry}(situation):\n    raise NotImplementedError", solution, entry, cases, ["수치 방법의 입력 가정과 오차 근거를 함께 남기세요.", "p-value나 최적화 성공 flag 하나를 결론으로 사용하지 마세요."])


BLUEPRINTS: dict[str, dict[str, TaskBlueprint]] = {
    "00": {
        "mastery": T(
            "scientific-method-contract", "과학 계산 문제의 방법·가정 계약 만들기", "문제 종류와 입력 제약을 검사해 필요한 증거를 반환한다.",
            "audit_scientific_task(task)를 완성하세요.", "def audit_scientific_task(task):\n    raise NotImplementedError",
            """def audit_scientific_task(task):
    required = {"kind", "sampleCount", "assumptions", "tolerance"}
    missing = sorted(required - set(task))
    failures = []
    if task.get("sampleCount", 0) <= 0: failures.append("sampleCount")
    if task.get("tolerance", 0) <= 0: failures.append("tolerance")
    if not task.get("assumptions"): failures.append("assumptions")
    return {"valid": not missing and not failures, "missing": missing, "failures": failures, "evidence": ["input contract", "method result", "residual or uncertainty"]}
""", "audit_scientific_task",
            [("accepts-complete-task", [{"kind": "integration", "sampleCount": 20, "assumptions": ["smooth"], "tolerance": 1e-6}], {"valid": True, "missing": [], "failures": [], "evidence": ["input contract", "method result", "residual or uncertainty"]}), ("reports-invalid-task", [{"kind": "fit", "sampleCount": 0, "assumptions": [], "tolerance": 0}], {"valid": False, "missing": [], "failures": ["sampleCount", "tolerance", "assumptions"], "evidence": ["input contract", "method result", "residual or uncertainty"]}), ("reports-missing-fields", [{"kind": "test"}], {"valid": False, "missing": ["assumptions", "sampleCount", "tolerance"], "failures": ["sampleCount", "tolerance", "assumptions"], "evidence": ["input contract", "method result", "residual or uncertainty"]})],
            ["성공 flag 전에 표본 수·가정·허용 오차를 고정하세요.", "결과와 residual 또는 uncertainty를 한 증거 묶음으로 만드세요."],
        ),
        "transfer": T(
            "solver-result-audit", "새 solver 결과에 검산 계약 전이하기", "수렴 여부, residual, iteration budget을 함께 판정한다.",
            "audit_solver_result(result, tolerance, iteration_budget)를 완성하세요.", "def audit_solver_result(result, tolerance, iteration_budget):\n    raise NotImplementedError",
            """def audit_solver_result(result, tolerance, iteration_budget):
    failures = []
    if not result.get("converged", False): failures.append("not-converged")
    if abs(result.get("residual", float("inf"))) > tolerance: failures.append("residual")
    if result.get("iterations", iteration_budget + 1) > iteration_budget: failures.append("iteration-budget")
    return {"accepted": not failures, "failures": failures, "residual": result.get("residual"), "iterations": result.get("iterations")}
""", "audit_solver_result",
            [("accepts-verified-result", [{"converged": True, "residual": 1e-8, "iterations": 8}, 1e-6, 20], {"accepted": True, "failures": [], "residual": 1e-8, "iterations": 8}), ("rejects-false-success", [{"converged": True, "residual": 0.2, "iterations": 4}, 0.01, 10], {"accepted": False, "failures": ["residual"], "residual": 0.2, "iterations": 4}), ("reports-budget-and-convergence", [{"converged": False, "residual": 1, "iterations": 30}, 0.1, 20], {"accepted": False, "failures": ["not-converged", "residual", "iteration-budget"], "residual": 1, "iterations": 30})],
            ["solver의 success 필드와 독립적으로 residual을 검사하세요.", "iteration 초과도 재현성·비용 실패로 남기세요."],
        ),
        "retrieval": decision("scientific-method-choice", "과학 계산 방법 선택 회상하기", "문제 구조에 맞는 scipy 영역을 고른다.", "choose_scientific_method", {"continuous-integral": {"method": "integrate with error estimate", "evidence": "value and error", "risk": "singularity"}, "parameter-fit": {"method": "optimize with residual audit", "evidence": "parameters and residuals", "risk": "local optimum"}, "sample-distribution": {"method": "stats with assumptions", "evidence": "effect and interval", "risk": "p-value only"}}),
    },
    "01": {
        "mastery": T(
            "distribution-standardization", "확률분포 관측값을 z-score로 표준화하기", "평균·표준편차 계약을 검사하고 관측값 위치를 반환한다.",
            "standardize_observations(values, mean, std)를 완성하세요.", "def standardize_observations(values, mean, std):\n    raise NotImplementedError",
            """def standardize_observations(values, mean, std):
    if std <= 0: raise ValueError("std must be positive")
    scores = [round((value-mean)/std, 4) for value in values]
    return {"scores": scores, "belowMean": sum(score < 0 for score in scores), "aboveMean": sum(score > 0 for score in scores)}
""", "standardize_observations",
            [("standardizes-values", [[8, 10, 14], 10, 2], {"scores": [-1.0, 0.0, 2.0], "belowMean": 1, "aboveMean": 1}), ("handles-empty", [[], 0, 1], {"scores": [], "belowMean": 0, "aboveMean": 0}), ("rejects-zero-std", [[1], 0, 0], E("ValueError"))],
            ["표준편차가 0이면 분포 위치를 정의하지 마세요.", "z-score는 단위를 제거하지만 정규성을 증명하지 않습니다."],
        ),
        "transfer": T(
            "empirical-quantiles", "새 서비스 지연 데이터에 분위수 전이하기", "정렬된 표본에서 nearest-rank 분위수와 exceedance count를 계산한다.",
            "empirical_quantiles(values, probabilities)를 완성하세요.", "def empirical_quantiles(values, probabilities):\n    raise NotImplementedError",
            """def empirical_quantiles(values, probabilities):
    import math
    if not values or any(not 0 < probability <= 1 for probability in probabilities): raise ValueError("invalid empirical quantile input")
    ordered = sorted(values)
    quantiles = {}
    for probability in probabilities:
        index = max(0, math.ceil(probability*len(ordered))-1)
        quantiles[str(probability)] = ordered[index]
    return {"count": len(ordered), "quantiles": quantiles, "minimum": ordered[0], "maximum": ordered[-1]}
""", "empirical_quantiles",
            [("computes-nearest-rank", [[5, 1, 9, 3], [0.5, 0.75, 1.0]], {"count": 4, "quantiles": {"0.5": 3, "0.75": 5, "1.0": 9}, "minimum": 1, "maximum": 9}), ("handles-single-sample", [[7], [0.5]], {"count": 1, "quantiles": {"0.5": 7}, "minimum": 7, "maximum": 7}), ("rejects-empty", [[], [0.5]], E("ValueError"))],
            ["분위수 method를 nearest-rank로 명시하세요.", "분포 모수와 경험적 분위수를 같은 것으로 부르지 마세요."],
        ),
        "retrieval": decision("distribution-evidence", "분포 증거 선택 회상하기", "모수 분포와 경험 분포를 구분한다.", "choose_distribution_evidence", {"known-normal-model": {"method": "z-score and CDF", "evidence": "mean std assumptions", "risk": "unverified normality"}, "service-tail": {"method": "empirical quantiles", "evidence": "sample window and n", "risk": "small tail sample"}, "rare-event": {"method": "binomial or Poisson with exposure", "evidence": "rate denominator", "risk": "independence"}}),
    },
    "02": {
        "mastery": T(
            "ab-proportion-evidence", "A/B 전환율의 효과크기와 pooled z 계산하기", "성공·노출 분모를 검사하고 rate difference와 z를 반환한다.",
            "compare_proportions(success_a, total_a, success_b, total_b)를 완성하세요.", "def compare_proportions(success_a, total_a, success_b, total_b):\n    raise NotImplementedError",
            """def compare_proportions(success_a, total_a, success_b, total_b):
    import math
    if total_a <= 0 or total_b <= 0 or not 0 <= success_a <= total_a or not 0 <= success_b <= total_b: raise ValueError("invalid conversion counts")
    rate_a = success_a/total_a; rate_b = success_b/total_b
    pooled = (success_a+success_b)/(total_a+total_b)
    standard_error = math.sqrt(pooled*(1-pooled)*(1/total_a+1/total_b))
    z = 0.0 if standard_error == 0 else (rate_b-rate_a)/standard_error
    return {"rateA": round(rate_a,4), "rateB": round(rate_b,4), "absoluteLift": round(rate_b-rate_a,4), "relativeLift": None if rate_a == 0 else round((rate_b-rate_a)/rate_a,4), "z": round(z,4)}
""", "compare_proportions",
            [("computes-lift-and-z", [20, 100, 30, 100], {"rateA": 0.2, "rateB": 0.3, "absoluteLift": 0.1, "relativeLift": 0.5, "z": 1.633}), ("handles-zero-baseline", [0, 50, 5, 50], {"rateA": 0.0, "rateB": 0.1, "absoluteLift": 0.1, "relativeLift": None, "z": 2.2942}), ("rejects-invalid-count", [6, 5, 1, 5], E("ValueError"))],
            ["absolute lift와 relative lift를 함께 보여주세요.", "검정 통계량과 실무 효과크기를 분리하세요."],
        ),
        "transfer": T(
            "ab-balance-audit", "새 실험에 배정·오염 점검 전이하기", "variant 배정 비율과 중복 사용자를 검사한다.",
            "audit_experiment_assignments(assignments, expected_ratio, tolerance)를 완성하세요.", "def audit_experiment_assignments(assignments, expected_ratio, tolerance):\n    raise NotImplementedError",
            """def audit_experiment_assignments(assignments, expected_ratio, tolerance):
    users = {}; duplicates = []
    for row in assignments:
        if row["user"] in users and users[row["user"]] != row["variant"]: duplicates.append(row["user"])
        users[row["user"]] = row["variant"]
    counts = {"A": 0, "B": 0}
    for variant in users.values():
        if variant not in counts: raise ValueError("unknown variant")
        counts[variant] += 1
    total = sum(counts.values()); observed = 0.0 if not total else counts["B"]/total
    return {"accepted": not duplicates and abs(observed-expected_ratio) <= tolerance, "counts": counts, "observedBRatio": round(observed,4), "crossVariantUsers": sorted(set(duplicates))}
""", "audit_experiment_assignments",
            [("accepts-balanced-assignment", [[{"user": 1, "variant": "A"}, {"user": 2, "variant": "B"}], 0.5, 0.1], {"accepted": True, "counts": {"A": 1, "B": 1}, "observedBRatio": 0.5, "crossVariantUsers": []}), ("rejects-cross-variant-user", [[{"user": 1, "variant": "A"}, {"user": 1, "variant": "B"}, {"user": 2, "variant": "B"}], 0.5, 0.5], {"accepted": False, "counts": {"A": 0, "B": 2}, "observedBRatio": 1.0, "crossVariantUsers": [1]}), ("rejects-unknown-variant", [[{"user": 1, "variant": "C"}], 0.5, 0.1], E("ValueError"))],
            ["검정 전에 randomization과 sample ratio mismatch를 확인하세요.", "같은 사용자가 두 variant를 경험하면 독립 표본이 아닙니다."],
        ),
        "retrieval": decision("ab-test-decision", "A/B 검정 해석 회상하기", "배정 품질·효과·불확실성을 구분한다.", "choose_ab_evidence", {"conversion-difference": {"method": "two-proportion test", "evidence": "counts rates lift interval", "risk": "peeking"}, "continuous-revenue": {"method": "mean or robust comparison", "evidence": "distribution and effect", "risk": "heavy tail"}, "assignment-health": {"method": "sample-ratio audit", "evidence": "unique users per variant", "risk": "cross exposure"}}),
    },
    "03": {
        "mastery": T(
            "linear-interpolation", "정렬된 관측점 사이를 선형 보간하기", "범위 밖 외삽을 거부하고 양쪽 anchor와 비율을 반환한다.",
            "interpolate_linear(points, query)를 완성하세요.", "def interpolate_linear(points, query):\n    raise NotImplementedError",
            """def interpolate_linear(points, query):
    ordered = sorted(points)
    if len(ordered) < 2 or len({x for x,_ in ordered}) != len(ordered): raise ValueError("invalid interpolation points")
    if query < ordered[0][0] or query > ordered[-1][0]: raise ValueError("extrapolation disabled")
    for x,y in ordered:
        if query == x: return {"value": y, "left": x, "right": x, "ratio": 0.0}
    for (x0,y0),(x1,y1) in zip(ordered, ordered[1:]):
        if x0 < query < x1:
            ratio = (query-x0)/(x1-x0)
            return {"value": y0+ratio*(y1-y0), "left": x0, "right": x1, "ratio": round(ratio,4)}
""", "interpolate_linear",
            [("interpolates-between-anchors", [[[0,0],[10,20]], 2.5], {"value": 5.0, "left": 0, "right": 10, "ratio": 0.25}), ("returns-exact-anchor", [[[0,1],[2,5]], 2], {"value": 5, "left": 2, "right": 2, "ratio": 0.0}), ("rejects-extrapolation", [[[0,0],[1,1]], 2], E("ValueError"))],
            ["보간과 외삽을 구분해 범위 밖 값을 조용히 만들지 마세요.", "사용한 양쪽 anchor를 결과에 남기세요."],
        ),
        "transfer": T(
            "gap-interpolation-policy", "새 시계열 결측에 보간 정책 전이하기", "결측 run 길이가 허용 gap 이하일 때만 선형 채움 계획을 만든다.",
            "plan_missing_gaps(values, maximum_gap)를 완성하세요.", "def plan_missing_gaps(values, maximum_gap):\n    raise NotImplementedError",
            """def plan_missing_gaps(values, maximum_gap):
    if maximum_gap < 0: raise ValueError("negative gap")
    fills = []; blocked = []; index = 0
    while index < len(values):
        if values[index] is not None: index += 1; continue
        start = index
        while index < len(values) and values[index] is None: index += 1
        end = index-1; length = end-start+1
        bounded = start > 0 and index < len(values)
        target = fills if bounded and length <= maximum_gap else blocked
        target.extend(range(start,end+1))
    return {"fillIndices": fills, "blockedIndices": blocked}
""", "plan_missing_gaps",
            [("fills-short-bounded-gap", [[1,None,None,4], 2], {"fillIndices": [1,2], "blockedIndices": []}), ("blocks-edge-and-long-gaps", [[None,1,None,None,4,None], 1], {"fillIndices": [], "blockedIndices": [0,2,3,5]}), ("rejects-negative-gap", [[1], -1], E("ValueError"))],
            ["양쪽 anchor가 없는 leading·trailing 결측은 보간하지 마세요.", "긴 결측 구간은 관측처럼 꾸미지 말고 blocked로 남기세요."],
        ),
        "retrieval": decision("interpolation-method", "보간 방법 선택 회상하기", "선형·고차·외삽 경계를 구분한다.", "choose_interpolation", {"sparse-smooth-series": {"method": "linear interpolation", "evidence": "anchor gaps", "risk": "hidden regime change"}, "smooth-curvature": {"method": "spline with validation", "evidence": "held-out error", "risk": "overshoot"}, "outside-domain": {"method": "explicit extrapolation model", "evidence": "domain distance", "risk": "unsupported trend"}}),
    },
    "04": {
        "mastery": T(
            "linear-fit-residuals", "직선 피팅의 계수와 잔차 근거 계산하기", "최소제곱 slope·intercept·MAE를 반환한다.",
            "fit_line(x_values, y_values)를 완성하세요.", "def fit_line(x_values, y_values):\n    raise NotImplementedError",
            """def fit_line(x_values, y_values):
    if len(x_values) != len(y_values) or len(x_values) < 2: raise ValueError("invalid fit data")
    x_mean = sum(x_values)/len(x_values); y_mean = sum(y_values)/len(y_values)
    denominator = sum((x-x_mean)**2 for x in x_values)
    if denominator == 0: raise ValueError("constant x")
    slope = sum((x-x_mean)*(y-y_mean) for x,y in zip(x_values,y_values))/denominator
    intercept = y_mean-slope*x_mean
    residuals = [y-(slope*x+intercept) for x,y in zip(x_values,y_values)]
    return {"slope": round(slope,6), "intercept": round(intercept,6), "mae": round(sum(abs(value) for value in residuals)/len(residuals),6), "residuals": [round(value,6) for value in residuals]}
""", "fit_line",
            [("fits-perfect-line", [[0,1,2], [1,3,5]], {"slope": 2.0, "intercept": 1.0, "mae": 0.0, "residuals": [0.0,0.0,0.0]}), ("fits-noisy-line", [[0,1,2], [0,2,3]], {"slope": 1.5, "intercept": 0.166667, "mae": 0.222222, "residuals": [-0.166667,0.333333,-0.166667]}), ("rejects-constant-x", [[1,1], [2,3]], E("ValueError"))],
            ["계수만 반환하지 말고 각 관측의 residual을 남기세요.", "같은 x만 있으면 slope를 식별할 수 없습니다."],
        ),
        "transfer": T(
            "fit-validation-split", "새 curve fit에 검증 분리 전이하기", "시간 순서를 보존한 train·validation split과 누수 위험을 검사한다.",
            "plan_fit_validation(rows, validation_count)를 완성하세요.", "def plan_fit_validation(rows, validation_count):\n    raise NotImplementedError",
            """def plan_fit_validation(rows, validation_count):
    if validation_count <= 0 or validation_count >= len(rows): raise ValueError("invalid validation size")
    ordered = sorted(rows, key=lambda row: row["time"])
    train = ordered[:-validation_count]; validation = ordered[-validation_count:]
    return {"trainIds": [row["id"] for row in train], "validationIds": [row["id"] for row in validation], "boundary": validation[0]["time"], "leakage": max(row["time"] for row in train) >= min(row["time"] for row in validation)}
""", "plan_fit_validation",
            [("holds-out-latest", [[{"id":"c","time":3},{"id":"a","time":1},{"id":"b","time":2}], 1], {"trainIds": ["a","b"], "validationIds": ["c"], "boundary": 3, "leakage": False}), ("holds-out-two", [[{"id":1,"time":1},{"id":2,"time":2},{"id":3,"time":3},{"id":4,"time":4}], 2], {"trainIds": [1,2], "validationIds": [3,4], "boundary": 3, "leakage": False}), ("rejects-all-validation", [[{"id":1,"time":1}], 1], E("ValueError"))],
            ["시계열을 무작위로 섞지 말고 미래 구간을 검증에 두세요.", "fit residual과 validation error를 별도 근거로 남기세요."],
        ),
        "retrieval": decision("curve-fit-evidence", "curve fitting 검증 회상하기", "계수·잔차·일반화를 구분한다.", "choose_fit_evidence", {"parameter-estimation": {"method": "least squares", "evidence": "parameters covariance residuals", "risk": "local optimum"}, "model-shape": {"method": "candidate comparison", "evidence": "validation error", "risk": "training fit"}, "time-series-fit": {"method": "future holdout", "evidence": "split boundary", "risk": "temporal leakage"}}),
    },
    "05": {
        "mastery": T(
            "normality-moments", "표본의 skewness와 excess kurtosis 계산하기", "표본 크기와 0분산을 검사해 normality diagnostic을 만든다.",
            "normality_moments(values)를 완성하세요.", "def normality_moments(values):\n    raise NotImplementedError",
            """def normality_moments(values):
    if len(values) < 3: raise ValueError("need at least three values")
    mean = sum(values)/len(values); m2 = sum((x-mean)**2 for x in values)/len(values)
    if m2 == 0: raise ValueError("zero variance")
    m3 = sum((x-mean)**3 for x in values)/len(values); m4 = sum((x-mean)**4 for x in values)/len(values)
    return {"count": len(values), "mean": round(mean,4), "skewness": round(m3/(m2**1.5),4), "excessKurtosis": round(m4/(m2*m2)-3,4)}
""", "normality_moments",
            [("measures-symmetric-sample", [[-1,0,1]], {"count": 3, "mean": 0.0, "skewness": 0.0, "excessKurtosis": -1.5}), ("measures-skewed-sample", [[0,0,1,3]], {"count": 4, "mean": 1.0, "skewness": 0.8165, "excessKurtosis": -1.0}), ("rejects-zero-variance", [[2,2,2]], E("ValueError"))],
            ["정규성 검정 p-value 전에 표본 크기와 moment를 보세요.", "작은 표본의 skew·kurtosis는 불안정합니다."],
        ),
        "transfer": T(
            "normality-decision-policy", "새 모델 residual에 정규성 판단 전이하기", "표본 크기·skew·outlier 비율로 next action을 결정한다.",
            "normality_followup(count, skewness, outlier_rate)를 완성하세요.", "def normality_followup(count, skewness, outlier_rate):\n    raise NotImplementedError",
            """def normality_followup(count, skewness, outlier_rate):
    if count <= 0 or not 0 <= outlier_rate <= 1: raise ValueError("invalid diagnostic")
    if count < 8: action = "collect-more-data"
    elif abs(skewness) > 1 or outlier_rate > 0.05: action = "inspect-transform-or-robust-model"
    else: action = "inspect-qq-and-model-residuals"
    return {"action": action, "smallSample": count < 8, "strongSkew": abs(skewness) > 1, "outlierConcern": outlier_rate > 0.05}
""", "normality_followup",
            [("requires-more-data", [5,0.1,0], {"action": "collect-more-data", "smallSample": True, "strongSkew": False, "outlierConcern": False}), ("flags-skew", [100,1.5,0.01], {"action": "inspect-transform-or-robust-model", "smallSample": False, "strongSkew": True, "outlierConcern": False}), ("continues-diagnostics", [30,0.2,0.03], {"action": "inspect-qq-and-model-residuals", "smallSample": False, "strongSkew": False, "outlierConcern": False}), ("rejects-rate", [10,0,2], E("ValueError"))],
            ["정규성 검정 결과 하나로 데이터를 정규분포라 선언하지 마세요.", "residual 정규성과 원자료 정규성을 구분하세요."],
        ),
        "retrieval": decision("normality-check-choice", "정규성 검사 해석 회상하기", "표본·residual·검정력 문제를 구분한다.", "choose_normality_check", {"small-sample": {"method": "QQ plot plus domain knowledge", "evidence": "n and outliers", "risk": "low power"}, "large-sample": {"method": "effect diagnostics", "evidence": "skew kurtosis residual impact", "risk": "trivial p-value"}, "regression-assumption": {"method": "residual diagnostics", "evidence": "residual QQ and variance", "risk": "testing raw target"}}),
    },
    "06": {
        "mastery": T(
            "portfolio-moments", "포트폴리오 기대수익과 분산 계산하기", "weight 합과 covariance shape를 검사해 risk-return을 반환한다.",
            "portfolio_metrics(weights, returns, covariance)를 완성하세요.", "def portfolio_metrics(weights, returns, covariance):\n    raise NotImplementedError",
            """def portfolio_metrics(weights, returns, covariance):
    n = len(weights)
    if n == 0 or len(returns) != n or len(covariance) != n or any(len(row) != n for row in covariance): raise ValueError("shape mismatch")
    if abs(sum(weights)-1) > 1e-9: raise ValueError("weights must sum to one")
    expected = sum(weight*ret for weight,ret in zip(weights,returns))
    variance = sum(weights[i]*covariance[i][j]*weights[j] for i in range(n) for j in range(n))
    return {"expectedReturn": round(expected,6), "variance": round(variance,6), "volatility": round(variance**0.5,6)}
""", "portfolio_metrics",
            [("computes-two-asset-metrics", [[0.5,0.5], [0.1,0.2], [[0.04,0.01],[0.01,0.09]]], {"expectedReturn": 0.15, "variance": 0.0375, "volatility": 0.193649}), ("computes-single-asset", [[1.0], [0.08], [[0.0225]]], {"expectedReturn": 0.08, "variance": 0.0225, "volatility": 0.15}), ("rejects-weight-sum", [[0.4,0.4], [0.1,0.2], [[1,0],[0,1]]], E("ValueError"))],
            ["분산은 covariance의 off-diagonal 항까지 포함합니다.", "과거 기대수익을 보장 수익으로 표현하지 마세요."],
        ),
        "transfer": T(
            "portfolio-constraint-audit", "새 최적화 결과에 제약 검증 전이하기", "weight bounds, 합, 집중도 제한을 검사한다.",
            "audit_portfolio_weights(weights, lower, upper, maximum_concentration)를 완성하세요.", "def audit_portfolio_weights(weights, lower, upper, maximum_concentration):\n    raise NotImplementedError",
            """def audit_portfolio_weights(weights, lower, upper, maximum_concentration):
    failures = []
    if abs(sum(weights)-1) > 1e-6: failures.append("sum")
    if any(weight < lower or weight > upper for weight in weights): failures.append("bounds")
    concentration = sum(weight*weight for weight in weights)
    if concentration > maximum_concentration: failures.append("concentration")
    return {"accepted": not failures, "failures": failures, "sum": round(sum(weights),6), "concentration": round(concentration,6)}
""", "audit_portfolio_weights",
            [("accepts-diversified-weights", [[0.5,0.5],0,0.7,0.6], {"accepted": True, "failures": [], "sum": 1.0, "concentration": 0.5}), ("rejects-concentrated-result", [[0.9,0.1],0,1,0.7], {"accepted": False, "failures": ["concentration"], "sum": 1.0, "concentration": 0.82}), ("reports-sum-and-bounds", [[1.2,-0.1],0,1,2], {"accepted": False, "failures": ["sum","bounds"], "sum": 1.1, "concentration": 1.45})],
            ["optimizer 성공 뒤 제약식을 독립적으로 다시 계산하세요.", "목적함수 최적과 투자 적합성을 같은 것으로 부르지 마세요."],
        ),
        "retrieval": decision("portfolio-optimization-evidence", "포트폴리오 최적화 증거 회상하기", "목적함수·제약·불확실성을 구분한다.", "choose_portfolio_evidence", {"risk-return": {"method": "mean covariance optimization", "evidence": "weights constraints frontier", "risk": "estimation error"}, "no-short": {"method": "bounded optimization", "evidence": "weight audit", "risk": "solver tolerance"}, "deployment": {"method": "out-of-sample backtest", "evidence": "costs turnover drawdown", "risk": "lookahead"}}),
    },
    "07": {
        "mastery": T(
            "moving-average-filter", "신호 이동평균과 edge 정책 구현하기", "centered window가 완전히 들어오는 지점만 filtered value를 반환한다.",
            "moving_average(values, window)를 완성하세요.", "def moving_average(values, window):\n    raise NotImplementedError",
            """def moving_average(values, window):
    if window <= 0 or window % 2 == 0: raise ValueError("window must be positive odd")
    radius = window//2; result = []
    for index in range(len(values)):
        if index < radius or index >= len(values)-radius: result.append(None)
        else: result.append(round(sum(values[index-radius:index+radius+1])/window,6))
    return result
""", "moving_average",
            [("filters-interior", [[1,2,9,2,1],3], [None,4.0,4.333333,4.0,None]), ("window-one-keeps-values", [[1,3],1], [1.0,3.0]), ("rejects-even-window", [[1,2],2], E("ValueError"))],
            ["edge padding을 조용히 발명하지 말고 None으로 표시하세요.", "window 크기가 signal detail을 얼마나 지우는지 기록하세요."],
        ),
        "transfer": T(
            "filter-effect-audit", "새 센서 signal에 filter 영향 전이하기", "원 신호와 filtered 신호의 peak·평균 절대 변화와 유효 표본 수를 계산한다.",
            "audit_filter_effect(original, filtered)를 완성하세요.", "def audit_filter_effect(original, filtered):\n    raise NotImplementedError",
            """def audit_filter_effect(original, filtered):
    if len(original) != len(filtered): raise ValueError("length mismatch")
    pairs = [(a,b) for a,b in zip(original,filtered) if b is not None]
    if not pairs: return {"validCount": 0, "meanAbsoluteChange": None, "originalPeak": None, "filteredPeak": None}
    return {"validCount": len(pairs), "meanAbsoluteChange": round(sum(abs(a-b) for a,b in pairs)/len(pairs),6), "originalPeak": max(abs(a) for a,_ in pairs), "filteredPeak": max(abs(b) for _,b in pairs)}
""", "audit_filter_effect",
            [("measures-filter-change", [[1,5,1],[None,3,None]], {"validCount": 1, "meanAbsoluteChange": 2.0, "originalPeak": 5, "filteredPeak": 3}), ("reports-no-valid-output", [[1,2],[None,None]], {"validCount": 0, "meanAbsoluteChange": None, "originalPeak": None, "filteredPeak": None}), ("rejects-length-mismatch", [[1],[1,2]], E("ValueError"))],
            ["filtered output만 보지 말고 원 신호 대비 변화량을 측정하세요.", "peak 감소가 항상 noise 제거를 뜻하지는 않습니다."],
        ),
        "retrieval": decision("signal-filter-choice", "signal filter 선택 회상하기", "smooth·주파수·edge 문제를 구분한다.", "choose_signal_filter", {"slow-trend": {"method": "moving average or low-pass", "evidence": "window cutoff", "risk": "phase delay"}, "known-frequency-noise": {"method": "frequency-aware filter", "evidence": "spectrum before after", "risk": "ringing"}, "short-signal": {"method": "explicit edge policy", "evidence": "valid output count", "risk": "padding artifacts"}}),
    },
    "08": {
        "mastery": T(
            "trapezoid-integral", "불균일 x grid의 사다리꼴 적분 계산하기", "x 증가와 길이를 검사해 구간별 기여도와 합을 반환한다.",
            "trapezoid_integral(x_values, y_values)를 완성하세요.", "def trapezoid_integral(x_values, y_values):\n    raise NotImplementedError",
            """def trapezoid_integral(x_values, y_values):
    if len(x_values) != len(y_values) or len(x_values) < 2 or any(b <= a for a,b in zip(x_values,x_values[1:])): raise ValueError("invalid integration grid")
    areas = [(x_values[i+1]-x_values[i])*(y_values[i]+y_values[i+1])/2 for i in range(len(x_values)-1)]
    return {"areas": [round(value,6) for value in areas], "total": round(sum(areas),6), "intervalCount": len(areas)}
""", "trapezoid_integral",
            [("integrates-nonuniform-grid", [[0,1,3],[0,2,2]], {"areas": [1.0,4.0], "total": 5.0, "intervalCount": 2}), ("keeps-signed-area", [[0,1,2],[1,-1,1]], {"areas": [0.0,0.0], "total": 0.0, "intervalCount": 2}), ("rejects-unsorted-grid", [[0,2,1],[0,1,2]], E("ValueError"))],
            ["x 간격이 균일하다고 가정하지 마세요.", "부호 있는 누적과 절대 면적을 구분하세요."],
        ),
        "transfer": T(
            "integration-convergence", "새 수치적분에 grid 수렴 점검 전이하기", "연속 refinement 결과 차이를 tolerance로 판정한다.",
            "audit_integration_convergence(estimates, tolerance)를 완성하세요.", "def audit_integration_convergence(estimates, tolerance):\n    raise NotImplementedError",
            """def audit_integration_convergence(estimates, tolerance):
    if len(estimates) < 2 or tolerance <= 0: raise ValueError("need refinement estimates")
    deltas = [abs(b-a) for a,b in zip(estimates,estimates[1:])]
    return {"accepted": deltas[-1] <= tolerance, "estimate": estimates[-1], "lastDelta": round(deltas[-1],12), "deltas": [round(value,12) for value in deltas]}
""", "audit_integration_convergence",
            [("accepts-converged-sequence", [[1.5,1.42,1.4143],0.01], {"accepted": True, "estimate": 1.4143, "lastDelta": 0.0057, "deltas": [0.08,0.0057]}), ("rejects-unstable-sequence", [[1,1.5,1.2],0.1], {"accepted": False, "estimate": 1.2, "lastDelta": 0.3, "deltas": [0.5,0.3]}), ("rejects-single-estimate", [[1],0.1], E("ValueError"))],
            ["한 grid의 값만으로 정확도를 주장하지 마세요.", "refinement 간 마지막 차이와 전체 추세를 함께 보세요."],
        ),
        "retrieval": decision("numerical-integration-choice", "수치적분 방법 회상하기", "표본 grid·함수·특이점을 구분한다.", "choose_integration_method", {"sampled-data": {"method": "trapezoid", "evidence": "x grid and interval contributions", "risk": "unsorted x"}, "smooth-callable": {"method": "adaptive quadrature", "evidence": "error estimate", "risk": "hidden singularity"}, "oscillatory": {"method": "specialized or refined integration", "evidence": "convergence study", "risk": "aliasing"}}),
    },
    "09": {
        "mastery": T(
            "discrete-spectrum", "짧은 signal의 DFT power spectrum 계산하기", "sampling rate와 one-sided bin의 frequency·power를 반환한다.",
            "power_spectrum(values, sample_rate)를 완성하세요.", "def power_spectrum(values, sample_rate):\n    raise NotImplementedError",
            """def power_spectrum(values, sample_rate):
    import cmath
    if not values or sample_rate <= 0: raise ValueError("invalid signal")
    n = len(values); bins = []
    for k in range(n//2+1):
        coefficient = sum(value*cmath.exp(-2j*cmath.pi*k*t/n) for t,value in enumerate(values))
        bins.append({"frequency": round(k*sample_rate/n,6), "power": round((abs(coefficient)/n)**2,6)})
    return bins
""", "power_spectrum",
            [("finds-dc-signal", [[2,2,2,2],4], [{"frequency":0.0,"power":4.0},{"frequency":1.0,"power":0.0},{"frequency":2.0,"power":0.0}]), ("finds-alternating-bin", [[1,-1,1,-1],4], [{"frequency":0.0,"power":0.0},{"frequency":1.0,"power":0.0},{"frequency":2.0,"power":1.0}]), ("rejects-empty", [[],10], E("ValueError"))],
            ["frequency bin은 sample_rate/n 간격입니다.", "window·normalization을 명시하지 않은 power를 물리 단위 PSD로 부르지 마세요."],
        ),
        "transfer": T(
            "spectral-peak-audit", "새 진동 spectrum에 peak 검증 전이하기", "DC 제외 dominant bin과 spectral share를 계산한다.",
            "dominant_frequency(bins)를 완성하세요.", "def dominant_frequency(bins):\n    raise NotImplementedError",
            """def dominant_frequency(bins):
    positive = [row for row in bins if row["frequency"] > 0]
    if not positive: return {"frequency": None, "power": None, "share": None}
    dominant = sorted(positive,key=lambda row:(-row["power"],row["frequency"]))[0]
    total = sum(row["power"] for row in positive)
    return {"frequency": dominant["frequency"], "power": dominant["power"], "share": 0.0 if total == 0 else round(dominant["power"]/total,4)}
""", "dominant_frequency",
            [("finds-dominant-nondc-bin", [[{"frequency":0,"power":10},{"frequency":2,"power":3},{"frequency":4,"power":1}]], {"frequency":2,"power":3,"share":0.75}), ("handles-no-positive-bin", [[{"frequency":0,"power":2}]], {"frequency":None,"power":None,"share":None}), ("handles-zero-power", [[{"frequency":1,"power":0}]], {"frequency":1,"power":0,"share":0.0})],
            ["평균 offset인 DC bin을 주기 peak와 분리하세요.", "peak share와 절대 power를 함께 보세요."],
        ),
        "retrieval": decision("spectrum-analysis-evidence", "스펙트럼 분석 증거 회상하기", "sampling·window·peak 해석을 구분한다.", "choose_spectrum_evidence", {"periodic-component": {"method": "FFT power spectrum", "evidence": "sample rate bin width window", "risk": "aliasing"}, "nonstationary-frequency": {"method": "short-time spectrum", "evidence": "window length overlap", "risk": "time-frequency tradeoff"}, "dc-offset": {"method": "demean before peak analysis", "evidence": "removed mean", "risk": "removing real baseline"}}),
    },
    "10": {
        "mastery": T(
            "scientific-pipeline-report", "종합 과학 계산의 단계별 증거 보고서 만들기", "입력 품질, method, estimate, uncertainty, residual을 하나의 release 판정으로 묶는다.",
            "scientific_report(stages)를 완성하세요.", "def scientific_report(stages):\n    raise NotImplementedError",
            """def scientific_report(stages):
    required = ["input", "method", "estimate", "uncertainty", "residual"]
    by_name = {stage["name"]: stage for stage in stages}
    missing = [name for name in required if name not in by_name]
    failed = [name for name in required if name in by_name and not by_name[name].get("passed",False)]
    return {"releaseReady": not missing and not failed, "missingStages": missing, "failedStages": failed, "evidenceRefs": [by_name[name].get("evidenceRef") for name in required if name in by_name]}
""", "scientific_report",
            [("accepts-complete-report", [[{"name":name,"passed":True,"evidenceRef":name+".json"} for name in ["input","method","estimate","uncertainty","residual"]]], {"releaseReady":True,"missingStages":[],"failedStages":[],"evidenceRefs":["input.json","method.json","estimate.json","uncertainty.json","residual.json"]}), ("reports-missing-and-failed", [[{"name":"input","passed":True,"evidenceRef":"i"},{"name":"method","passed":False,"evidenceRef":"m"}]], {"releaseReady":False,"missingStages":["estimate","uncertainty","residual"],"failedStages":["method"],"evidenceRefs":["i","m"]})],
            ["estimate만 있는 report를 완료로 보지 마세요.", "각 stage의 evidenceRef를 순서대로 보존하세요."],
        ),
        "transfer": T(
            "uncertainty-propagation", "새 계산 pipeline에 불확실성 전이하기", "독립 입력의 선형 결합에서 variance와 standard uncertainty를 계산한다.",
            "propagate_linear_uncertainty(coefficients, uncertainties)를 완성하세요.", "def propagate_linear_uncertainty(coefficients, uncertainties):\n    raise NotImplementedError",
            """def propagate_linear_uncertainty(coefficients, uncertainties):
    if len(coefficients) != len(uncertainties) or any(value < 0 for value in uncertainties): raise ValueError("invalid uncertainty inputs")
    contributions = [(coefficient*uncertainty)**2 for coefficient,uncertainty in zip(coefficients,uncertainties)]
    variance = sum(contributions)
    return {"variance": round(variance,8), "standardUncertainty": round(variance**0.5,8), "contributions": [round(value,8) for value in contributions]}
""", "propagate_linear_uncertainty",
            [("combines-independent-uncertainty", [[2,-1],[0.1,0.2]], {"variance":0.08,"standardUncertainty":0.28284271,"contributions":[0.04,0.04]}), ("handles-exact-inputs", [[1,3],[0,0]], {"variance":0,"standardUncertainty":0.0,"contributions":[0,0]}), ("rejects-negative-uncertainty", [[1],[-1]], E("ValueError"))],
            ["독립 입력이라는 가정을 명시하세요.", "각 입력의 variance contribution을 함께 반환하세요."],
        ),
        "retrieval": decision("scientific-project-evidence", "종합 과학 project 증거 회상하기", "계산 성공과 과학적 결론을 구분한다.", "choose_scientific_evidence", {"numerical-result": {"method": "estimate plus residual and convergence", "evidence": "tolerance audit", "risk": "false convergence"}, "uncertain-inputs": {"method": "uncertainty propagation", "evidence": "assumptions contributions", "risk": "ignored covariance"}, "release-claim": {"method": "reproducible pipeline report", "evidence": "input and artifact hashes", "risk": "machine pass as scientific truth"}}),
    },
}
