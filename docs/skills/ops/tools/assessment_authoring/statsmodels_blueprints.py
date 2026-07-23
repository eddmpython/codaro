from __future__ import annotations

from typing import Any

from .common import TaskBlueprint, raises, task


T = task
E = raises


def decision(slug: str, title: str, goal: str, entry: str, table: dict[str, dict[str, Any]]) -> TaskBlueprint:
    solution = f"def {entry}(situation):\n    table = {table!r}\n    if situation not in table:\n        raise ValueError('unknown situation')\n    return table[situation]\n"
    cases = [("recalls-" + key, [key], value) for key, value in list(table.items())[:2]] + [("rejects-unknown", ["unknown"], E("ValueError"))]
    return T(slug, title, goal, f"{entry}(situation)를 완성해 method, evidence, risk를 반환하세요.", f"def {entry}(situation):\n    raise NotImplementedError", solution, entry, cases, ["계수·불확실성·가정 진단을 한 묶음으로 해석하세요.", "통계적 연관을 인과 효과나 개인 확정 예측으로 확대하지 마세요."])


BLUEPRINTS: dict[str, dict[str, TaskBlueprint]] = {
    "00": {
        "mastery": T(
            "inference-contract", "통계 모델의 estimand·가정·진단 계약 만들기", "질문, target, predictors, estimand, covariance, diagnostics를 검사한다.",
            "audit_inference_contract(contract)를 완성하세요.", "def audit_inference_contract(contract):\n    raise NotImplementedError",
            """def audit_inference_contract(contract):
    required={"question","target","predictors","estimand","covariance","diagnostics"}
    missing=sorted(required-set(contract)); failures=[]
    if contract.get("target") in contract.get("predictors",[]): failures.append("target-leakage")
    if not contract.get("diagnostics"): failures.append("diagnostics")
    if contract.get("covariance") not in {"nonrobust","HC3","HAC","cluster"}: failures.append("covariance")
    return {"valid":not missing and not failures,"missing":missing,"failures":failures,"evidence":["design matrix","coefficient interval","residual diagnostics","claim scope"]}
""", "audit_inference_contract",
            [("accepts-regression-contract", [{"question":"association","target":"sales","predictors":["ads"],"estimand":"slope","covariance":"HC3","diagnostics":["residuals"]}], {"valid":True,"missing":[],"failures":[],"evidence":["design matrix","coefficient interval","residual diagnostics","claim scope"]}), ("reports-contract-errors", [{"question":"x","target":"y","predictors":["y"],"estimand":"effect","covariance":"default","diagnostics":[]}], {"valid":False,"missing":[],"failures":["target-leakage","diagnostics","covariance"],"evidence":["design matrix","coefficient interval","residual diagnostics","claim scope"]})],
            ["무엇을 추정하는지 estimand를 먼저 적으세요.", "표준오차 방식과 residual diagnostic을 명시하세요."],
        ),
        "transfer": T(
            "coefficient-interval", "새 계수 결과에 신뢰구간 검산 전이하기", "estimate와 standard error로 대칭 구간과 sign stability를 계산한다.",
            "coefficient_interval(estimate, standard_error, critical_value)를 완성하세요.", "def coefficient_interval(estimate, standard_error, critical_value):\n    raise NotImplementedError",
            """def coefficient_interval(estimate, standard_error, critical_value):
    if standard_error < 0 or critical_value <= 0: raise ValueError("invalid interval inputs")
    lower=estimate-critical_value*standard_error; upper=estimate+critical_value*standard_error
    return {"estimate":estimate,"lower":round(lower,6),"upper":round(upper,6),"excludesZero":lower>0 or upper<0,"width":round(upper-lower,6)}
""", "coefficient_interval",
            [("computes-positive-interval", [2,0.5,1.96], {"estimate":2,"lower":1.02,"upper":2.98,"excludesZero":True,"width":1.96}), ("keeps-uncertain-sign", [0.2,0.3,1.96], {"estimate":0.2,"lower":-0.388,"upper":0.788,"excludesZero":False,"width":1.176}), ("rejects-negative-se", [1,-1,2], E("ValueError"))],
            ["estimate와 interval width를 함께 보여주세요.", "0 제외 여부를 효과 크기나 실무 중요성과 혼동하지 마세요."],
        ),
        "retrieval": decision("inference-model-choice", "통계 모델 선택 회상하기", "outcome 종류와 dependence에 맞는 모델을 고른다.", "choose_inference_model", {"continuous-outcome": {"method":"OLS with residual diagnostics","evidence":"coefficients intervals residuals","risk":"nonlinearity"}, "binary-outcome": {"method":"logistic regression","evidence":"odds ratio calibration","risk":"probability interpretation"}, "count-outcome": {"method":"Poisson or negative binomial","evidence":"exposure dispersion","risk":"overdispersion"}}),
    },
    "01": {
        "mastery": T(
            "advertising-ols", "광고비·매출 OLS 계수와 R² 계산하기", "단순회귀 slope·intercept·residual·R²를 직접 계산한다.",
            "simple_ols(x_values, y_values)를 완성하세요.", "def simple_ols(x_values, y_values):\n    raise NotImplementedError",
            """def simple_ols(x_values, y_values):
    if len(x_values)!=len(y_values) or len(x_values)<2: raise ValueError("invalid OLS rows")
    xm=sum(x_values)/len(x_values); ym=sum(y_values)/len(y_values); sxx=sum((x-xm)**2 for x in x_values)
    if sxx==0: raise ValueError("constant predictor")
    slope=sum((x-xm)*(y-ym) for x,y in zip(x_values,y_values))/sxx; intercept=ym-slope*xm
    residuals=[y-(intercept+slope*x) for x,y in zip(x_values,y_values)]; sse=sum(value*value for value in residuals); sst=sum((y-ym)**2 for y in y_values)
    return {"intercept":round(intercept,6),"slope":round(slope,6),"rSquared":None if sst==0 else round(1-sse/sst,6),"residuals":[round(value,6) for value in residuals]}
""", "simple_ols",
            [("fits-linear-sales", [[0,1,2],[1,3,5]], {"intercept":1.0,"slope":2.0,"rSquared":1.0,"residuals":[0.0,0.0,0.0]}), ("fits-noisy-sales", [[0,1,2],[0,2,3]], {"intercept":0.166667,"slope":1.5,"rSquared":0.964286,"residuals":[-0.166667,0.333333,-0.166667]}), ("rejects-constant-predictor", [[1,1],[2,3]], E("ValueError"))],
            ["slope는 관측 연관이며 광고의 인과효과가 아닙니다.", "R²와 residual pattern을 함께 보세요."],
        ),
        "transfer": T(
            "advertising-effect-scale", "새 채널 회귀에 계수 단위 해석 전이하기", "원 단위와 천 단위 coefficient를 동일 변화량으로 환산한다.",
            "rescale_coefficient(coefficient, original_unit, reporting_unit, change_amount)를 완성하세요.", "def rescale_coefficient(coefficient, original_unit, reporting_unit, change_amount):\n    raise NotImplementedError",
            """def rescale_coefficient(coefficient, original_unit, reporting_unit, change_amount):
    if original_unit<=0 or reporting_unit<=0: raise ValueError("invalid units")
    effect=coefficient*(change_amount/original_unit)
    reported=coefficient*(reporting_unit/original_unit)
    return {"effectForChange":round(effect,6),"coefficientPerReportingUnit":round(reported,6),"changeAmount":change_amount}
""", "rescale_coefficient",
            [("rescales-currency-unit", [0.02,1,1000,500], {"effectForChange":10.0,"coefficientPerReportingUnit":20.0,"changeAmount":500}), ("keeps-same-unit", [3,10,10,20], {"effectForChange":6.0,"coefficientPerReportingUnit":3.0,"changeAmount":20}), ("rejects-zero-unit", [1,0,1,1], E("ValueError"))],
            ["coefficient의 predictor 단위를 반드시 표시하세요.", "scale 변환은 p-value가 아니라 해석 가능성을 바꿉니다."],
        ),
        "retrieval": decision("advertising-regression-evidence", "광고 회귀 해석 회상하기", "연관·단위·인과 주장을 구분한다.", "choose_ad_regression_evidence", {"association": {"method":"OLS coefficient interval","evidence":"units residual diagnostics","risk":"confounding"}, "incremental-causal-effect": {"method":"randomized experiment","evidence":"assignment balance","risk":"observational slope"}, "forecast": {"method":"time holdout","evidence":"future error","risk":"random split"}}),
    },
    "02": {
        "mastery": T(
            "real-estate-design-matrix", "부동산 회귀 design matrix 계약 검증하기", "intercept, numeric, encoded category, reference level을 점검한다.",
            "audit_design_matrix(columns, categorical_levels, reference_levels)를 완성하세요.", "def audit_design_matrix(columns, categorical_levels, reference_levels):\n    raise NotImplementedError",
            """def audit_design_matrix(columns, categorical_levels, reference_levels):
    failures=[]
    if "intercept" not in columns: failures.append("missing-intercept")
    missing_reference=sorted(set(categorical_levels)-set(reference_levels))
    duplicated=[name for name in categorical_levels if all(level in columns for level in categorical_levels[name])]
    if missing_reference: failures.append("missing-reference")
    if duplicated: failures.append("dummy-trap")
    return {"valid":not failures,"failures":failures,"missingReference":missing_reference,"fullDummyFactors":sorted(duplicated),"columnCount":len(columns)}
""", "audit_design_matrix",
            [("accepts-reference-coded-matrix", [["intercept","area","region_B"],{"region":["region_A","region_B"]},{"region":"region_A"}], {"valid":True,"failures":[],"missingReference":[],"fullDummyFactors":[],"columnCount":3}), ("reports-dummy-trap", [["area","region_A","region_B"],{"region":["region_A","region_B"]},{}], {"valid":False,"failures":["missing-intercept","missing-reference","dummy-trap"],"missingReference":["region"],"fullDummyFactors":["region"],"columnCount":3})],
            ["범주형 변수는 reference level을 명시하세요.", "intercept와 모든 dummy level을 동시에 넣는 trap을 막으세요."],
        ),
        "transfer": T(
            "price-residual-by-region", "새 주택 회귀에 지역별 residual 감사 전이하기", "지역별 count·mean residual·MAE를 반환한다.",
            "residuals_by_group(rows)를 완성하세요.", "def residuals_by_group(rows):\n    raise NotImplementedError",
            """def residuals_by_group(rows):
    grouped={}
    for row in rows: grouped.setdefault(row["group"],[]).append(row["predicted"]-row["actual"])
    return {group:{"count":len(values),"meanResidual":round(sum(values)/len(values),4),"mae":round(sum(abs(value) for value in values)/len(values),4)} for group,values in sorted(grouped.items())}
""", "residuals_by_group",
            [("finds-regional-bias", [[{"group":"A","actual":10,"predicted":12},{"group":"A","actual":20,"predicted":18},{"group":"B","actual":5,"predicted":8}]], {"A":{"count":2,"meanResidual":0.0,"mae":2.0},"B":{"count":1,"meanResidual":3.0,"mae":3.0}}), ("handles-empty", [[]], {})],
            ["전체 residual 평균 0이 subgroup bias 없음을 뜻하지 않습니다.", "작은 지역 group의 count를 함께 보여주세요."],
        ),
        "retrieval": decision("real-estate-regression-evidence", "부동산 회귀 검증 회상하기", "design·공간 dependence·group error를 구분한다.", "choose_real_estate_evidence", {"categorical-region": {"method":"reference-coded design","evidence":"column manifest","risk":"dummy trap"}, "nearby-properties": {"method":"spatial or group validation","evidence":"location overlap","risk":"random leakage"}, "regional-fairness": {"method":"group residual audit","evidence":"count bias MAE","risk":"global metric"}}),
    },
    "03": {
        "mastery": T(
            "insurance-heteroskedasticity", "보험 비용 residual의 규모별 이분산 점검하기", "fitted value 구간별 residual variance를 계산한다.",
            "residual_variance_bins(fitted, residuals, boundary)를 완성하세요.", "def residual_variance_bins(fitted, residuals, boundary):\n    raise NotImplementedError",
            """def residual_variance_bins(fitted, residuals, boundary):
    if len(fitted)!=len(residuals) or not fitted: raise ValueError("invalid residual rows")
    groups={"low":[],"high":[]}
    for fit,residual in zip(fitted,residuals): groups["low" if fit<boundary else "high"].append(residual)
    result={}
    for name,values in groups.items():
        if not values: result[name]={"count":0,"variance":None}
        else:
            mean=sum(values)/len(values); result[name]={"count":len(values),"variance":round(sum((value-mean)**2 for value in values)/len(values),4)}
    return result
""", "residual_variance_bins",
            [("detects-variance-change", [[10,20,100,120],[1,-1,10,-10],50], {"low":{"count":2,"variance":1.0},"high":{"count":2,"variance":100.0}}), ("keeps-empty-bin", [[1,2],[1,3],10], {"low":{"count":2,"variance":1.0},"high":{"count":0,"variance":None}}), ("rejects-empty", [[],[],1], E("ValueError"))],
            ["residual variance가 fitted scale과 함께 커지는지 확인하세요.", "이분산에서는 coefficient보다 standard error 해석이 먼저 흔들립니다."],
        ),
        "transfer": T(
            "insurance-log-backtransform", "새 log-cost 모델에 원 단위 복원 전이하기", "log prediction과 smearing factor로 비용을 복원한다.",
            "backtransform_log_predictions(log_predictions, smearing_factor)를 완성하세요.", "def backtransform_log_predictions(log_predictions, smearing_factor):\n    raise NotImplementedError",
            """def backtransform_log_predictions(log_predictions, smearing_factor):
    import math
    if smearing_factor<=0: raise ValueError("invalid smearing factor")
    values=[math.exp(value)*smearing_factor for value in log_predictions]
    return {"predictions":[round(value,4) for value in values],"smearingFactor":smearing_factor}
""", "backtransform_log_predictions",
            [("applies-smearing", [[0,0.6931471805599453],1.1], {"predictions":[1.1,2.2],"smearingFactor":1.1}), ("handles-empty", [[],1], {"predictions":[],"smearingFactor":1}), ("rejects-factor", [[0],0], E("ValueError"))],
            ["exp(log prediction)만으로 조건부 평균을 복원하지 마세요.", "smearing factor의 산출 표본을 기록하세요."],
        ),
        "retrieval": decision("insurance-cost-regression", "보험 비용 회귀 진단 회상하기", "왜도·이분산·원 단위 복원을 구분한다.", "choose_insurance_model", {"skewed-cost": {"method":"log target or count-aware model","evidence":"residual diagnostics","risk":"backtransform bias"}, "unequal-variance": {"method":"robust SE or variance model","evidence":"residual variance by fitted","risk":"nonrobust intervals"}, "reported-cost": {"method":"smearing backtransform","evidence":"factor estimate","risk":"naive exponentiation"}}),
    },
    "04": {
        "mastery": T(
            "time-series-autocorrelation", "항공 수요 residual의 lag-1 autocorrelation 계산하기", "시간 순서를 보존해 residual mean과 lag covariance를 계산한다.",
            "lag_one_autocorrelation(residuals)를 완성하세요.", "def lag_one_autocorrelation(residuals):\n    raise NotImplementedError",
            """def lag_one_autocorrelation(residuals):
    if len(residuals)<2: raise ValueError("need time residuals")
    mean=sum(residuals)/len(residuals); denominator=sum((value-mean)**2 for value in residuals)
    if denominator==0: raise ValueError("zero residual variance")
    numerator=sum((residuals[index]-mean)*(residuals[index-1]-mean) for index in range(1,len(residuals)))
    return {"lag":1,"autocorrelation":round(numerator/denominator,4),"count":len(residuals)}
""", "lag_one_autocorrelation",
            [("detects-positive-dependence", [[-2,-1,1,2]], {"lag":1,"autocorrelation":0.3,"count":4}), ("detects-alternation", [[1,-1,1,-1]], {"lag":1,"autocorrelation":-0.75,"count":4}), ("rejects-zero-variance", [[1,1]], E("ValueError"))],
            ["residual 순서를 섞지 마세요.", "lag-1 하나만으로 모든 시계열 구조가 설명되지는 않습니다."],
        ),
        "transfer": T(
            "rolling-origin-splits", "새 수요 예측에 rolling-origin 검증 전이하기", "minimum train과 horizon으로 시간 split 원장을 만든다.",
            "rolling_origin_splits(length, minimum_train, horizon)를 완성하세요.", "def rolling_origin_splits(length, minimum_train, horizon):\n    raise NotImplementedError",
            """def rolling_origin_splits(length, minimum_train, horizon):
    if minimum_train<=0 or horizon<=0 or minimum_train+horizon>length: raise ValueError("invalid rolling split")
    result=[]; train_end=minimum_train
    while train_end+horizon<=length:
        result.append({"train":[0,train_end],"validation":[train_end,train_end+horizon]}); train_end+=horizon
    return result
""", "rolling_origin_splits",
            [("builds-expanding-splits", [10,4,2], [{"train":[0,4],"validation":[4,6]},{"train":[0,6],"validation":[6,8]},{"train":[0,8],"validation":[8,10]}]), ("builds-one-split", [5,3,2], [{"train":[0,3],"validation":[3,5]}]), ("rejects-oversized", [5,4,2], E("ValueError"))],
            ["각 validation은 train보다 미래여야 합니다.", "여러 origin의 error 분포를 보존하세요."],
        ),
        "retrieval": decision("air-demand-time-model", "항공 수요 모델 증거 회상하기", "추세·계절·residual dependence를 구분한다.", "choose_time_model_evidence", {"future-demand": {"method":"rolling-origin validation","evidence":"forecast horizons","risk":"random split"}, "seasonality": {"method":"seasonal terms or SARIMA","evidence":"period and residual ACF","risk":"calendar drift"}, "correlated-errors": {"method":"time-series error model","evidence":"residual autocorrelation","risk":"OLS independent errors"}}),
    },
    "05": {
        "mastery": T(
            "logistic-odds", "고객 이탈 logit 계수를 odds ratio로 해석하기", "coefficient와 standard error에서 OR와 interval을 계산한다.",
            "odds_ratio_interval(coefficient, standard_error, critical_value)를 완성하세요.", "def odds_ratio_interval(coefficient, standard_error, critical_value):\n    raise NotImplementedError",
            """def odds_ratio_interval(coefficient, standard_error, critical_value):
    import math
    if standard_error<0 or critical_value<=0: raise ValueError("invalid logit interval")
    lower=coefficient-critical_value*standard_error; upper=coefficient+critical_value*standard_error
    return {"oddsRatio":round(math.exp(coefficient),4),"lower":round(math.exp(lower),4),"upper":round(math.exp(upper),4),"excludesOne":lower>0 or upper<0}
""", "odds_ratio_interval",
            [("computes-positive-or", [0.6931471805599453,0.1,1.96], {"oddsRatio":2.0,"lower":1.644,"upper":2.4331,"excludesOne":True}), ("keeps-uncertain-or", [0,0.5,1.96], {"oddsRatio":1.0,"lower":0.3753,"upper":2.6645,"excludesOne":False}), ("rejects-negative-se", [0,-1,2], E("ValueError"))],
            ["odds ratio를 probability 배수로 표현하지 마세요.", "predictor 단위와 interval을 함께 표시하세요."],
        ),
        "transfer": T(
            "churn-probability", "새 고객 profile에 logit probability 전이하기", "intercept와 feature coefficient의 linear predictor를 sigmoid로 변환한다.",
            "logistic_probability(intercept, coefficients, values)를 완성하세요.", "def logistic_probability(intercept, coefficients, values):\n    raise NotImplementedError",
            """def logistic_probability(intercept, coefficients, values):
    import math
    if set(coefficients)!=set(values): raise ValueError("feature mismatch")
    linear=intercept+sum(coefficients[name]*values[name] for name in coefficients)
    probability=1/(1+math.exp(-linear))
    return {"linearPredictor":round(linear,6),"probability":round(probability,6)}
""", "logistic_probability",
            [("computes-even-odds", [0,{"x":1},{"x":0}], {"linearPredictor":0,"probability":0.5}), ("computes-positive-logit", [0,{"x":0.6931471805599453},{"x":1}], {"linearPredictor":0.693147,"probability":0.666667}), ("rejects-feature-mismatch", [0,{"x":1},{"y":1}], E("ValueError"))],
            ["linear predictor와 probability를 구분하세요.", "예측 probability에는 calibration 검증이 필요합니다."],
        ),
        "retrieval": decision("churn-logistic-evidence", "이탈 logistic 해석 회상하기", "odds·probability·개입 효과를 구분한다.", "choose_churn_evidence", {"coefficient-effect": {"method":"odds ratio interval","evidence":"predictor unit","risk":"probability ratio"}, "individual-risk": {"method":"calibrated probability","evidence":"reliability audit","risk":"uncalibrated score"}, "retention-intervention": {"method":"randomized treatment test","evidence":"uplift","risk":"association as action effect"}}),
    },
    "06": {
        "mastery": T(
            "multicollinearity-audit", "다중회귀 predictor 상관과 condition 위험 점검하기", "상관 pair와 threshold를 기준으로 고위험 쌍을 반환한다.",
            "audit_predictor_correlations(correlations, threshold)를 완성하세요.", "def audit_predictor_correlations(correlations, threshold):\n    raise NotImplementedError",
            """def audit_predictor_correlations(correlations, threshold):
    if not 0<threshold<=1: raise ValueError("invalid threshold")
    flagged=[]
    for row in correlations:
        if row["left"]==row["right"]: continue
        if abs(row["correlation"])>=threshold:
            pair=sorted([row["left"],row["right"]]); flagged.append({"pair":pair,"correlation":row["correlation"]})
    unique={tuple(item["pair"]):item for item in flagged}
    return {"flagged":[unique[key] for key in sorted(unique)],"count":len(unique)}
""", "audit_predictor_correlations",
            [("flags-high-correlation", [[{"left":"area","right":"rooms","correlation":0.9},{"left":"rooms","right":"area","correlation":0.9},{"left":"age","right":"area","correlation":-0.2}],0.8], {"flagged":[{"pair":["area","rooms"],"correlation":0.9}],"count":1}), ("returns-none-below-threshold", [[{"left":"a","right":"b","correlation":0.5}],0.8], {"flagged":[],"count":0}), ("rejects-threshold", [[],0], E("ValueError"))],
            ["pairwise correlation은 VIF 전체를 대체하지 않습니다.", "높은 상관은 coefficient 불안정 위험이지 자동 삭제 명령이 아닙니다."],
        ),
        "transfer": T(
            "coefficient-stability", "새 specification에 계수 안정성 감사 전이하기", "여러 model specification의 coefficient sign·range를 비교한다.",
            "coefficient_stability(estimates)를 완성하세요.", "def coefficient_stability(estimates):\n    raise NotImplementedError",
            """def coefficient_stability(estimates):
    if not estimates: raise ValueError("no estimates")
    names=sorted(set().union(*(set(model) for model in estimates))); result={}
    for name in names:
        values=[model[name] for model in estimates if name in model]
        signs={0 if value==0 else 1 if value>0 else -1 for value in values}
        result[name]={"models":len(values),"minimum":min(values),"maximum":max(values),"signStable":len(signs)<=1}
    return result
""", "coefficient_stability",
            [("detects-sign-flip", [[{"x":1,"z":2},{"x":-0.5,"z":3}]], {"x":{"models":2,"minimum":-0.5,"maximum":1,"signStable":False},"z":{"models":2,"minimum":2,"maximum":3,"signStable":True}}), ("handles-missing-predictor", [[{"x":1},{"y":2}]], {"x":{"models":1,"minimum":1,"maximum":1,"signStable":True},"y":{"models":1,"minimum":2,"maximum":2,"signStable":True}}), ("rejects-empty", [[]], E("ValueError"))],
            ["한 specification의 p-value보다 계수 안정성을 확인하세요.", "변수 선택 과정도 불확실성의 일부입니다."],
        ),
        "retrieval": decision("multiregression-diagnostics", "다중회귀 진단 회상하기", "공선성·specification·해석을 구분한다.", "choose_multi_regression_evidence", {"correlated-predictors": {"method":"VIF and condition diagnostics","evidence":"design matrix","risk":"unstable coefficients"}, "model-specifications": {"method":"coefficient stability","evidence":"sign and interval across models","risk":"selective reporting"}, "prediction-only": {"method":"held-out error plus diagnostics","evidence":"baseline and residuals","risk":"coefficient overinterpretation"}}),
    },
    "07": {
        "mastery": T(
            "economic-time-alignment", "경제지표 시점과 발표 lag 정렬하기", "예측 시점 이전에 발표된 값만 feature로 허용한다.",
            "audit_release_lags(rows, prediction_time)를 완성하세요.", "def audit_release_lags(rows, prediction_time):\n    raise NotImplementedError",
            """def audit_release_lags(rows, prediction_time):
    usable=[]; leaked=[]
    for row in rows:
        target=usable if row["releasedAt"]<=prediction_time else leaked
        target.append(row["name"])
    return {"valid":not leaked,"usable":sorted(usable),"leaked":sorted(leaked),"predictionTime":prediction_time}
""", "audit_release_lags",
            [("blocks-future-release", [[{"name":"cpi","releasedAt":2},{"name":"gdp-revision","releasedAt":5}],3], {"valid":False,"usable":["cpi"],"leaked":["gdp-revision"],"predictionTime":3}), ("accepts-known-indicators", [[{"name":"rate","releasedAt":1}],1], {"valid":True,"usable":["rate"],"leaked":[],"predictionTime":1})],
            ["관측 기간과 실제 발표 시점을 구분하세요.", "나중에 수정된 경제지표를 과거 예측에 사용하지 마세요."],
        ),
        "transfer": T(
            "robust-standard-error-choice", "새 경제 회귀에 covariance 선택 전이하기", "time dependence와 group dependence에 맞는 covariance 정책을 고른다.",
            "select_covariance(has_heteroskedasticity, has_time_dependence, cluster_count)를 완성하세요.", "def select_covariance(has_heteroskedasticity, has_time_dependence, cluster_count):\n    raise NotImplementedError",
            """def select_covariance(has_heteroskedasticity, has_time_dependence, cluster_count):
    if cluster_count<0: raise ValueError("negative clusters")
    if cluster_count>=20: method="cluster"
    elif has_time_dependence: method="HAC"
    elif has_heteroskedasticity: method="HC3"
    else: method="nonrobust"
    return {"method":method,"requiresLag":method=="HAC","clusterAdequate":cluster_count>=20}
""", "select_covariance",
            [("chooses-hac-for-time", [True,True,0], {"method":"HAC","requiresLag":True,"clusterAdequate":False}), ("chooses-cluster", [True,True,30], {"method":"cluster","requiresLag":False,"clusterAdequate":True}), ("chooses-hc3", [True,False,0], {"method":"HC3","requiresLag":False,"clusterAdequate":False}), ("rejects-negative-clusters", [False,False,-1], E("ValueError"))],
            ["covariance 방식은 data dependence 구조에 맞춰야 합니다.", "cluster 수가 너무 적으면 cluster SE도 불안정합니다."],
        ),
        "retrieval": decision("economic-regression-evidence", "경제 회귀 증거 회상하기", "release lag·serial dependence·causality를 구분한다.", "choose_economic_evidence", {"real-time-forecast": {"method":"vintage-aware time split","evidence":"release timestamps","risk":"revised data leakage"}, "serial-errors": {"method":"HAC covariance","evidence":"lag choice residual ACF","risk":"default SE"}, "policy-effect": {"method":"causal design","evidence":"identification assumptions","risk":"OLS association"}}),
    },
    "08": {
        "mastery": T(
            "attrition-group-errors", "직원 퇴사 모델의 group별 오류율 계산하기", "group별 false positive·false negative rate와 support를 반환한다.",
            "attrition_group_metrics(rows)를 완성하세요.", "def attrition_group_metrics(rows):\n    raise NotImplementedError",
            """def attrition_group_metrics(rows):
    grouped={}
    for row in rows:
        b=grouped.setdefault(row["group"],{"positive":0,"negative":0,"fp":0,"fn":0,"count":0}); b["count"]+=1
        if row["actual"]==1: b["positive"]+=1; b["fn"]+=int(row["predicted"]==0)
        else: b["negative"]+=1; b["fp"]+=int(row["predicted"]==1)
    return {group:{"count":b["count"],"fpr":None if b["negative"]==0 else round(b["fp"]/b["negative"],4),"fnr":None if b["positive"]==0 else round(b["fn"]/b["positive"],4)} for group,b in sorted(grouped.items())}
""", "attrition_group_metrics",
            [("reports-group-errors", [[{"group":"A","actual":1,"predicted":0},{"group":"A","actual":0,"predicted":1},{"group":"B","actual":0,"predicted":0}]], {"A":{"count":2,"fpr":1.0,"fnr":1.0},"B":{"count":1,"fpr":0.0,"fnr":None}}), ("handles-empty", [[]], {})],
            ["각 rate의 실제 positive·negative denominator를 확인하세요.", "작은 group 차이를 사람 평가·해고 근거로 사용하지 마세요."],
        ),
        "transfer": T(
            "employment-claim-boundary", "새 HR 모델 문구에 권리 보호 경계 전이하기", "자동 결정과 민감 정보 사용을 release blocker로 만든다.",
            "audit_employment_use(use_case, automated_action, sensitive_features, human_appeal)를 완성하세요.", "def audit_employment_use(use_case, automated_action, sensitive_features, human_appeal):\n    raise NotImplementedError",
            """def audit_employment_use(use_case, automated_action, sensitive_features, human_appeal):
    failures=[]
    if automated_action in {"fire","deny-promotion","discipline"}: failures.append("high-impact-automated-action")
    if sensitive_features: failures.append("sensitive-features")
    if not human_appeal: failures.append("no-appeal")
    return {"allowed":not failures,"failures":failures,"scope":"aggregate workforce research","useCase":use_case}
""", "audit_employment_use",
            [("allows-aggregate-research", ["retention trend",None,[],True], {"allowed":True,"failures":[],"scope":"aggregate workforce research","useCase":"retention trend"}), ("blocks-automated-firing", ["individual action","fire",["age"],False], {"allowed":False,"failures":["high-impact-automated-action","sensitive-features","no-appeal"],"scope":"aggregate workforce research","useCase":"individual action"})],
            ["고용 모델을 개인 불이익 자동화에 사용하지 마세요.", "사람 검토와 이의 제기 경로가 없으면 release를 차단하세요."],
        ),
        "retrieval": decision("attrition-model-boundary", "퇴사 모델 사용 경계 회상하기", "조직 연구와 개인 결정의 증거를 구분한다.", "choose_attrition_evidence", {"aggregate-risk": {"method":"group-level research","evidence":"support uncertainty","risk":"ecological inference"}, "subgroup-errors": {"method":"FPR FNR audit","evidence":"denominators","risk":"small group"}, "employment-action": {"method":"do not automate high-impact decision","evidence":"human rights review","risk":"discrimination"}}),
    },
    "09": {
        "mastery": T(
            "count-overdispersion", "자전거 수요 count의 overdispersion 계산하기", "평균과 표본 분산 비율로 Poisson 가정을 점검한다.",
            "count_dispersion(values)를 완성하세요.", "def count_dispersion(values):\n    raise NotImplementedError",
            """def count_dispersion(values):
    if len(values)<2 or any(value<0 or int(value)!=value for value in values): raise ValueError("invalid counts")
    mean=sum(values)/len(values); variance=sum((value-mean)**2 for value in values)/(len(values)-1)
    return {"count":len(values),"mean":round(mean,4),"sampleVariance":round(variance,4),"dispersion":None if mean==0 else round(variance/mean,4),"overdispersed":mean>0 and variance/mean>1.5}
""", "count_dispersion",
            [("detects-overdispersion", [[0,0,0,8]], {"count":4,"mean":2.0,"sampleVariance":16.0,"dispersion":8.0,"overdispersed":True}), ("detects-near-poisson", [[0,1,1,2]], {"count":4,"mean":1.0,"sampleVariance":0.6667,"dispersion":0.6667,"overdispersed":False}), ("rejects-negative", [[0,-1]], E("ValueError"))],
            ["Poisson은 평균과 분산이 비슷하다는 가정을 가집니다.", "overdispersion이면 standard error와 interval이 과도하게 좁아질 수 있습니다."],
        ),
        "transfer": T(
            "count-exposure-rate", "새 count 모델에 exposure offset 전이하기", "관측 시간별 count를 rate로 정규화하고 log exposure를 반환한다.",
            "count_exposure_rows(counts, exposures)를 완성하세요.", "def count_exposure_rows(counts, exposures):\n    raise NotImplementedError",
            """def count_exposure_rows(counts, exposures):
    import math
    if len(counts)!=len(exposures) or any(count<0 for count in counts) or any(value<=0 for value in exposures): raise ValueError("invalid exposure rows")
    return [{"count":count,"exposure":exposure,"rate":round(count/exposure,6),"logExposure":round(math.log(exposure),6)} for count,exposure in zip(counts,exposures)]
""", "count_exposure_rows",
            [("normalizes-different-exposure", [[10,10],[1,2]], [{"count":10,"exposure":1,"rate":10.0,"logExposure":0.0},{"count":10,"exposure":2,"rate":5.0,"logExposure":0.693147}]), ("handles-zero-count", [[0],[4]], [{"count":0,"exposure":4,"rate":0.0,"logExposure":1.386294}]), ("rejects-zero-exposure", [[1],[0]], E("ValueError"))],
            ["count가 관측 시간·인구 exposure에 비례하면 offset을 사용하세요.", "raw count와 rate를 비교하지 마세요."],
        ),
        "retrieval": decision("bike-count-model", "자전거 count 모델 선택 회상하기", "count·dispersion·exposure를 구분한다.", "choose_count_model", {"poisson-like": {"method":"Poisson GLM","evidence":"mean variance residuals","risk":"overdispersion"}, "overdispersed": {"method":"negative binomial","evidence":"dispersion estimate","risk":"Poisson intervals"}, "different-exposure": {"method":"log exposure offset","evidence":"rate denominator","risk":"raw count comparison"}}),
    },
    "10": {
        "mastery": T(
            "statistical-model-report", "종합 통계 모델 report의 필수 증거 검사하기", "estimand·design·coefficient·diagnostics·validation·claim을 모두 blocking stage로 둔다.",
            "audit_statistical_report(sections)를 완성하세요.", "def audit_statistical_report(sections):\n    raise NotImplementedError",
            """def audit_statistical_report(sections):
    required=["estimand","design","coefficients","diagnostics","validation","claimScope"]
    by_name={section["name"]:section for section in sections}; missing=[name for name in required if name not in by_name]
    failed=[name for name in required if name in by_name and by_name[name].get("status")!="approved"]
    return {"releaseReady":not missing and not failed,"missing":missing,"failed":failed,"evidenceRefs":[by_name[name].get("ref") for name in required if name in by_name]}
""", "audit_statistical_report",
            [("accepts-complete-report", [[{"name":name,"status":"approved","ref":name+".json"} for name in ["estimand","design","coefficients","diagnostics","validation","claimScope"]]], {"releaseReady":True,"missing":[],"failed":[],"evidenceRefs":["estimand.json","design.json","coefficients.json","diagnostics.json","validation.json","claimScope.json"]}), ("reports-gaps", [[{"name":"estimand","status":"approved","ref":"e"},{"name":"design","status":"failed","ref":"d"}]], {"releaseReady":False,"missing":["coefficients","diagnostics","validation","claimScope"],"failed":["design"],"evidenceRefs":["e","d"]})],
            ["coefficient table만으로 report를 완료하지 마세요.", "claim scope와 validation을 blocking section으로 유지하세요."],
        ),
        "transfer": T(
            "model-comparison-ledger", "새 후보 모델 비교에 원장 전이하기", "같은 validation rows에서 metric·복잡도·가정 실패를 비교한다.",
            "select_statistical_model(models, maximum_failures)를 완성하세요.", "def select_statistical_model(models, maximum_failures):\n    raise NotImplementedError",
            """def select_statistical_model(models, maximum_failures):
    eligible=[model for model in models if len(model.get("assumptionFailures",[]))<=maximum_failures]
    if not eligible: return {"selected":None,"reason":"no-eligible-model"}
    selected=min(eligible,key=lambda model:(model["validationError"],model["parameterCount"],model["name"]))
    return {"selected":selected["name"],"validationError":selected["validationError"],"parameterCount":selected["parameterCount"],"assumptionFailures":selected.get("assumptionFailures",[])}
""", "select_statistical_model",
            [("selects-low-error-eligible", [[{"name":"simple","validationError":3,"parameterCount":2,"assumptionFailures":[]},{"name":"complex","validationError":2,"parameterCount":10,"assumptionFailures":["heteroskedasticity"]}],1], {"selected":"complex","validationError":2,"parameterCount":10,"assumptionFailures":["heteroskedasticity"]}), ("breaks-error-tie-by-complexity", [[{"name":"a","validationError":2,"parameterCount":5,"assumptionFailures":[]},{"name":"b","validationError":2,"parameterCount":2,"assumptionFailures":[]}],0], {"selected":"b","validationError":2,"parameterCount":2,"assumptionFailures":[]}), ("reports-no-eligible", [[{"name":"x","validationError":1,"parameterCount":1,"assumptionFailures":["a"]}],0], {"selected":None,"reason":"no-eligible-model"})],
            ["모든 후보가 같은 validation rows를 사용해야 합니다.", "낮은 error와 가정 적합성의 tradeoff를 원장에 남기세요."],
        ),
        "retrieval": decision("statistical-project-release", "종합 통계 project 증거 회상하기", "추정·진단·검증·claim을 분리한다.", "choose_statistical_release_evidence", {"coefficient-claim": {"method":"estimate interval units","evidence":"design and covariance","risk":"p-value only"}, "model-adequacy": {"method":"residual and assumption diagnostics","evidence":"plots tests effect","risk":"single test"}, "release-conclusion": {"method":"validation plus claim review","evidence":"out-of-sample and scope","risk":"association as causation"}}),
    },
}
