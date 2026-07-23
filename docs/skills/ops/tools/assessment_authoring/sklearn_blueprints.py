from __future__ import annotations

from typing import Any

from .common import TaskBlueprint, raises, task


T = task
E = raises


def decision(slug: str, title: str, goal: str, entry: str, table: dict[str, dict[str, Any]]) -> TaskBlueprint:
    solution = f"def {entry}(situation):\n    table = {table!r}\n    if situation not in table:\n        raise ValueError('unknown situation')\n    return table[situation]\n"
    cases = [("recalls-" + key, [key], value) for key, value in list(table.items())[:2]] + [("rejects-unknown", ["unknown"], E("ValueError"))]
    return T(slug, title, goal, f"{entry}(situation)를 완성해 method, evidence, risk를 반환하세요.", f"def {entry}(situation):\n    raise NotImplementedError", solution, entry, cases, ["학습 데이터와 평가 데이터의 경계를 먼저 확인하세요.", "한 metric이나 예측을 실제 진단·인과 결론으로 확대하지 마세요."])


BLUEPRINTS: dict[str, dict[str, TaskBlueprint]] = {
    "00": {
        "mastery": T(
            "ml-task-contract", "ML 문제의 target·split·metric 계약 만들기", "task type과 target 누수, 평가 metric을 점검한다.",
            "audit_ml_task(task)를 완성하세요.", "def audit_ml_task(task):\n    raise NotImplementedError",
            """def audit_ml_task(task):
    failures = []
    if task.get("target") in task.get("features", []): failures.append("target-leakage")
    if task.get("split") not in {"random-stratified", "group", "time"}: failures.append("split-policy")
    if not task.get("metrics"): failures.append("metrics")
    if not task.get("baseline"): failures.append("baseline")
    return {"valid": not failures, "failures": failures, "featureCount": len(task.get("features", [])), "evidence": ["split manifest", "baseline", "held-out metrics", "error analysis"]}
""", "audit_ml_task",
            [("accepts-classification-contract", [{"target":"label","features":["x1","x2"],"split":"random-stratified","metrics":["f1","recall"],"baseline":"majority"}], {"valid":True,"failures":[],"featureCount":2,"evidence":["split manifest","baseline","held-out metrics","error analysis"]}), ("reports-leakage-and-gaps", [{"target":"label","features":["x","label"],"split":"random","metrics":[],"baseline":""}], {"valid":False,"failures":["target-leakage","split-policy","metrics","baseline"],"featureCount":2,"evidence":["split manifest","baseline","held-out metrics","error analysis"]})],
            ["모델보다 먼저 target, split, baseline, metric을 고정하세요.", "target 또는 미래 정보가 feature에 섞이면 성능은 무효입니다."],
        ),
        "transfer": T(
            "train-test-identity", "새 dataset에 split identity 전이하기", "동일 entity가 train과 test에 겹치는지 검사한다.",
            "audit_entity_split(train_rows, test_rows, entity_field)를 완성하세요.", "def audit_entity_split(train_rows, test_rows, entity_field):\n    raise NotImplementedError",
            """def audit_entity_split(train_rows, test_rows, entity_field):
    train_ids = {row[entity_field] for row in train_rows}; test_ids = {row[entity_field] for row in test_rows}
    overlap = sorted(train_ids & test_ids)
    return {"valid": not overlap and bool(train_rows) and bool(test_rows), "overlap": overlap, "trainEntities": len(train_ids), "testEntities": len(test_ids)}
""", "audit_entity_split",
            [("accepts-disjoint-entities", [[{"patient":1},{"patient":2}],[{"patient":3}],"patient"], {"valid":True,"overlap":[],"trainEntities":2,"testEntities":1}), ("rejects-overlap", [[{"user":"a"}],[{"user":"a"},{"user":"b"}],"user"], {"valid":False,"overlap":["a"],"trainEntities":1,"testEntities":2}), ("rejects-empty-test", [[{"id":1}],[],"id"], {"valid":False,"overlap":[],"trainEntities":1,"testEntities":0})],
            ["row가 아니라 실제 entity 단위로 겹침을 검사하세요.", "한 사람의 여러 관측을 양쪽 split에 나누지 마세요."],
        ),
        "retrieval": decision("ml-workflow-choice", "ML workflow 경계 회상하기", "split·preprocess·evaluation 책임을 구분한다.", "choose_ml_workflow", {"independent-rows": {"method":"stratified split","evidence":"class counts","risk":"entity duplicates"}, "repeated-entities": {"method":"group split","evidence":"entity overlap zero","risk":"row leakage"}, "future-prediction": {"method":"time split","evidence":"temporal boundary","risk":"lookahead"}}),
    },
    "01": {
        "mastery": T(
            "multiclass-confusion", "와인 다중분류 confusion matrix와 macro recall 계산하기", "label 순서를 고정하고 class별 recall과 macro 평균을 반환한다.",
            "multiclass_recall(actual, predicted, labels)를 완성하세요.", "def multiclass_recall(actual, predicted, labels):\n    raise NotImplementedError",
            """def multiclass_recall(actual, predicted, labels):
    if len(actual) != len(predicted) or not labels: raise ValueError("invalid labels")
    matrix = {label:{other:0 for other in labels} for label in labels}
    for truth,guess in zip(actual,predicted):
        if truth not in matrix or guess not in matrix: raise ValueError("unknown class")
        matrix[truth][guess] += 1
    recalls = {}
    for label in labels:
        total = sum(matrix[label].values()); recalls[str(label)] = None if total == 0 else round(matrix[label][label]/total,4)
    present = [value for value in recalls.values() if value is not None]
    serialized = {str(label):{str(other):matrix[label][other] for other in labels} for label in labels}
    return {"matrix":serialized,"recalls":recalls,"macroRecall":None if not present else round(sum(present)/len(present),4)}
""", "multiclass_recall",
            [("computes-class-recall", [[0,0,1,2],[0,1,1,1],[0,1,2]], {"matrix":{"0":{"0":1,"1":1,"2":0},"1":{"0":0,"1":1,"2":0},"2":{"0":0,"1":1,"2":0}},"recalls":{"0":0.5,"1":1.0,"2":0.0},"macroRecall":0.5}), ("keeps-absent-class", [[0],[0],[0,1]], {"matrix":{"0":{"0":1,"1":0},"1":{"0":0,"1":0}},"recalls":{"0":1.0,"1":None},"macroRecall":1.0}), ("rejects-unknown", [[0],[2],[0,1]], E("ValueError"))],
            ["accuracy 대신 각 class의 recall을 분리하세요.", "test에 없는 class는 recall 0이 아니라 None입니다."],
        ),
        "transfer": T(
            "standardization-fit-boundary", "새 feature scaling에 train-only fit 전이하기", "train mean/std로 train과 test를 변환한다.",
            "standardize_split(train, test)를 완성하세요.", "def standardize_split(train, test):\n    raise NotImplementedError",
            """def standardize_split(train, test):
    if not train: raise ValueError("empty train")
    mean = sum(train)/len(train); variance = sum((value-mean)**2 for value in train)/len(train); std = variance**0.5
    if std == 0: raise ValueError("zero train variance")
    scale = lambda values:[round((value-mean)/std,4) for value in values]
    return {"mean":round(mean,4),"std":round(std,4),"train":scale(train),"test":scale(test)}
""", "standardize_split",
            [("fits-on-train-only", [[0,2],[100]], {"mean":1.0,"std":1.0,"train":[-1.0,1.0],"test":[99.0]}), ("scales-empty-test", [[1,3],[]], {"mean":2.0,"std":1.0,"train":[-1.0,1.0],"test":[]}), ("rejects-zero-variance", [[2,2],[3]], E("ValueError"))],
            ["test 값으로 mean·std를 다시 맞추지 마세요.", "scaler parameter도 모델 artifact의 일부입니다."],
        ),
        "retrieval": decision("wine-classification-evidence", "다중분류 평가 회상하기", "class 불균형과 전처리 경계를 구분한다.", "choose_multiclass_evidence", {"balanced-classes": {"method":"confusion and macro metrics","evidence":"per-class counts","risk":"accuracy only"}, "scaled-features": {"method":"pipeline scaler","evidence":"train-fitted parameters","risk":"test fit"}, "probability-output": {"method":"calibration audit","evidence":"reliability by class","risk":"score as probability"}}),
    },
    "02": {
        "mastery": T(
            "diagnostic-confusion", "의료 분류의 sensitivity·specificity 계산하기", "positive label을 명시해 confusion counts와 지표를 반환한다.",
            "diagnostic_metrics(actual, predicted, positive)를 완성하세요.", "def diagnostic_metrics(actual, predicted, positive):\n    raise NotImplementedError",
            """def diagnostic_metrics(actual, predicted, positive):
    if len(actual) != len(predicted) or not actual: raise ValueError("invalid diagnostic sample")
    tp=tn=fp=fn=0
    for truth,guess in zip(actual,predicted):
        if truth==positive and guess==positive: tp+=1
        elif truth==positive: fn+=1
        elif guess==positive: fp+=1
        else: tn+=1
    sensitivity = None if tp+fn==0 else tp/(tp+fn); specificity = None if tn+fp==0 else tn/(tn+fp)
    return {"tp":tp,"tn":tn,"fp":fp,"fn":fn,"sensitivity":None if sensitivity is None else round(sensitivity,4),"specificity":None if specificity is None else round(specificity,4)}
""", "diagnostic_metrics",
            [("computes-diagnostic-metrics", [[1,1,0,0],[1,0,1,0],1], {"tp":1,"tn":1,"fp":1,"fn":1,"sensitivity":0.5,"specificity":0.5}), ("handles-no-negatives", [[1,1],[1,0],1], {"tp":1,"tn":0,"fp":0,"fn":1,"sensitivity":0.5,"specificity":None}), ("rejects-empty", [[],[],1], E("ValueError"))],
            ["positive class가 무엇인지 결과 계약에 고정하세요.", "의료 모델 metric은 실제 진단을 대신하지 않습니다."],
        ),
        "transfer": T(
            "medical-claim-boundary", "새 의료 예측 문구에 안전 경계 전이하기", "예측 score와 승인된 표현을 구분해 금지 claim을 찾는다.",
            "audit_medical_claim(claim, has_clinician_review, has_external_validation)를 완성하세요.", "def audit_medical_claim(claim, has_clinician_review, has_external_validation):\n    raise NotImplementedError",
            """def audit_medical_claim(claim, has_clinician_review, has_external_validation):
    lowered = claim.lower(); forbidden = [term for term in ["확진","치료 보장","disease confirmed","guaranteed treatment"] if term in lowered]
    failures = []
    if forbidden: failures.append("diagnostic-overclaim")
    if not has_clinician_review: failures.append("no-clinician-review")
    if not has_external_validation: failures.append("no-external-validation")
    return {"releaseAllowed":not failures,"failures":failures,"forbiddenTerms":forbidden,"allowedScope":"decision-support research only"}
""", "audit_medical_claim",
            [("accepts-reviewed-support-claim", ["위험도 분류를 돕는 연구용 모델",True,True], {"releaseAllowed":True,"failures":[],"forbiddenTerms":[],"allowedScope":"decision-support research only"}), ("blocks-diagnostic-claim", ["암 확진 결과",False,False], {"releaseAllowed":False,"failures":["diagnostic-overclaim","no-clinician-review","no-external-validation"],"forbiddenTerms":["확진"],"allowedScope":"decision-support research only"})],
            ["모델 출력은 확진이 아니라 검토가 필요한 위험 신호입니다.", "외부 검증과 임상 검토가 없으면 release claim을 차단하세요."],
        ),
        "retrieval": decision("medical-model-evidence", "의료 모델 증거 회상하기", "분류 성능과 배포 claim을 구분한다.", "choose_medical_evidence", {"screening-model": {"method":"sensitivity specificity and PPV","evidence":"prevalence and threshold","risk":"dataset shift"}, "probability-risk": {"method":"calibration","evidence":"reliability and subgroup audit","risk":"uncalibrated score"}, "clinical-release": {"method":"external clinical validation","evidence":"review protocol","risk":"diagnostic overclaim"}}),
    },
    "03": {
        "mastery": T(
            "regression-errors", "당뇨 진행도 회귀의 MAE·RMSE·bias 계산하기", "held-out residual의 크기와 방향을 분리한다.",
            "regression_metrics(actual, predicted)를 완성하세요.", "def regression_metrics(actual, predicted):\n    raise NotImplementedError",
            """def regression_metrics(actual, predicted):
    if len(actual)!=len(predicted) or not actual: raise ValueError("invalid regression sample")
    residuals = [guess-truth for truth,guess in zip(actual,predicted)]
    mae = sum(abs(value) for value in residuals)/len(residuals); rmse=(sum(value*value for value in residuals)/len(residuals))**0.5
    return {"mae":round(mae,4),"rmse":round(rmse,4),"bias":round(sum(residuals)/len(residuals),4),"residuals":residuals}
""", "regression_metrics",
            [("computes-errors", [[10,20,30],[12,18,35]], {"mae":3.0,"rmse":3.3166,"bias":1.6667,"residuals":[2,-2,5]}), ("perfect-prediction", [[1,2],[1,2]], {"mae":0.0,"rmse":0.0,"bias":0.0,"residuals":[0,0]}), ("rejects-empty", [[],[]], E("ValueError"))],
            ["MAE와 RMSE를 함께 보고 큰 오차의 영향을 확인하세요.", "bias 부호는 예측-실제 정의를 명시하세요."],
        ),
        "transfer": T(
            "regression-baseline", "새 연속 target에 baseline 비교 전이하기", "train mean baseline을 test에 적용하고 모델 MAE 개선을 계산한다.",
            "compare_regression_baseline(train_targets, test_targets, model_predictions)를 완성하세요.", "def compare_regression_baseline(train_targets, test_targets, model_predictions):\n    raise NotImplementedError",
            """def compare_regression_baseline(train_targets, test_targets, model_predictions):
    if not train_targets or len(test_targets)!=len(model_predictions) or not test_targets: raise ValueError("invalid baseline sample")
    baseline = sum(train_targets)/len(train_targets)
    baseline_mae = sum(abs(value-baseline) for value in test_targets)/len(test_targets)
    model_mae = sum(abs(value-guess) for value,guess in zip(test_targets,model_predictions))/len(test_targets)
    return {"baselineValue":round(baseline,4),"baselineMAE":round(baseline_mae,4),"modelMAE":round(model_mae,4),"improvement":round(baseline_mae-model_mae,4)}
""", "compare_regression_baseline",
            [("beats-train-mean", [[10,20],[12,18],[13,17]], {"baselineValue":15.0,"baselineMAE":3.0,"modelMAE":1.0,"improvement":2.0}), ("detects-worse-model", [[0,0],[1,1],[5,5]], {"baselineValue":0.0,"baselineMAE":1.0,"modelMAE":4.0,"improvement":-3.0}), ("rejects-empty-train", [[],[1],[1]], E("ValueError"))],
            ["baseline parameter도 train에서만 계산하세요.", "모델 metric이 baseline보다 나쁜 경우를 숨기지 마세요."],
        ),
        "retrieval": decision("regression-evaluation", "회귀 평가 근거 회상하기", "오차·baseline·분포 이동을 구분한다.", "choose_regression_evidence", {"typical-error": {"method":"MAE","evidence":"target units","risk":"tail errors"}, "large-error-penalty": {"method":"RMSE","evidence":"residual distribution","risk":"outlier domination"}, "model-value": {"method":"held-out baseline comparison","evidence":"same split","risk":"test tuning"}}),
    },
    "04": {
        "mastery": T(
            "housing-leakage-audit", "주택 가격 feature의 target·미래 누수 검사하기", "금지 feature와 availability 시점을 기준으로 누수를 찾는다.",
            "audit_housing_features(features, prediction_time)를 완성하세요.", "def audit_housing_features(features, prediction_time):\n    raise NotImplementedError",
            """def audit_housing_features(features, prediction_time):
    forbidden_names = {"salePrice","finalPrice","postSaleTax"}; leaked=[]; usable=[]
    for feature in features:
        if feature["name"] in forbidden_names or feature.get("availableAt",prediction_time) > prediction_time: leaked.append(feature["name"])
        else: usable.append(feature["name"])
    return {"valid":not leaked,"usable":sorted(usable),"leaked":sorted(leaked)}
""", "audit_housing_features",
            [("keeps-prelisting-features", [[{"name":"area","availableAt":1},{"name":"salePrice","availableAt":3},{"name":"renovation","availableAt":4}],2], {"valid":False,"usable":["area"],"leaked":["renovation","salePrice"]}), ("accepts-clean-set", [[{"name":"rooms","availableAt":1}],1], {"valid":True,"usable":["rooms"],"leaked":[]})],
            ["예측 시점에 실제로 알 수 있는 feature만 사용하세요.", "target의 변형·사후 세금도 leakage입니다."],
        ),
        "transfer": T(
            "cross-validation-folds", "새 회귀 dataset에 K-fold 원장 전이하기", "각 row가 validation에 정확히 한 번 등장하는지 검사한다.",
            "audit_cv_folds(row_ids, validation_folds)를 완성하세요.", "def audit_cv_folds(row_ids, validation_folds):\n    raise NotImplementedError",
            """def audit_cv_folds(row_ids, validation_folds):
    counts={row_id:0 for row_id in row_ids}; unknown=[]
    for fold in validation_folds:
        for row_id in fold:
            if row_id not in counts: unknown.append(row_id)
            else: counts[row_id]+=1
    missing=sorted(row_id for row_id,count in counts.items() if count==0); repeated=sorted(row_id for row_id,count in counts.items() if count>1)
    return {"valid":not missing and not repeated and not unknown,"missing":missing,"repeated":repeated,"unknown":sorted(set(unknown)),"foldSizes":[len(fold) for fold in validation_folds]}
""", "audit_cv_folds",
            [("accepts-complete-folds", [[1,2,3,4],[[1,2],[3,4]]], {"valid":True,"missing":[],"repeated":[],"unknown":[],"foldSizes":[2,2]}), ("reports-fold-errors", [[1,2,3],[[1,2],[2,4]]], {"valid":False,"missing":[3],"repeated":[2],"unknown":[4],"foldSizes":[2,2]})],
            ["각 row는 validation에 정확히 한 번 들어가야 합니다.", "CV split 원장을 모델 선택과 함께 보존하세요."],
        ),
        "retrieval": decision("housing-model-validation", "주택 회귀 검증 회상하기", "누수·공간 grouping·시간 drift를 구분한다.", "choose_housing_validation", {"random-homes": {"method":"K-fold with pipeline","evidence":"fold ledger","risk":"neighborhood duplicates"}, "same-buildings": {"method":"group split","evidence":"building overlap zero","risk":"entity leakage"}, "future-prices": {"method":"time split","evidence":"sale date boundary","risk":"market lookahead"}}),
    },
    "05": {
        "mastery": T(
            "digit-shape-contract", "손글씨 이미지 flatten shape 계약 검증하기", "모든 image의 height·width가 같고 label 수가 맞는지 확인한다.",
            "audit_digit_images(images, labels)를 완성하세요.", "def audit_digit_images(images, labels):\n    raise NotImplementedError",
            """def audit_digit_images(images, labels):
    if len(images)!=len(labels) or not images: raise ValueError("image label mismatch")
    shapes=[]; ragged=[]
    for index,image in enumerate(images):
        width = len(image[0]) if image else 0
        if not image or width==0 or any(len(row)!=width for row in image): ragged.append(index)
        shapes.append([len(image),width])
    unique=sorted({tuple(shape) for shape in shapes})
    return {"valid":not ragged and len(unique)==1,"shapes":[list(shape) for shape in unique],"raggedIndices":ragged,"featureCount":0 if not unique else unique[0][0]*unique[0][1]}
""", "audit_digit_images",
            [("accepts-consistent-images", [[[[0,1],[1,0]],[[1,1],[0,0]]],[0,1]], {"valid":True,"shapes":[[2,2]],"raggedIndices":[],"featureCount":4}), ("reports-shape-drift", [[[[0,1]],[[1,0],[0,1]]],[0,1]], {"valid":False,"shapes":[[1,2],[2,2]],"raggedIndices":[],"featureCount":2}), ("rejects-label-mismatch", [[[[1]]],[]], E("ValueError"))],
            ["flatten 전에 image shape와 label alignment를 검사하세요.", "pixel 위치 의미를 잃는 전처리를 기록하세요."],
        ),
        "transfer": T(
            "digit-error-pairs", "새 이미지 classifier에 혼동 pair 분석 전이하기", "오분류 truth→prediction pair를 빈도순으로 반환한다.",
            "confusion_pairs(actual, predicted)를 완성하세요.", "def confusion_pairs(actual, predicted):\n    raise NotImplementedError",
            """def confusion_pairs(actual, predicted):
    if len(actual)!=len(predicted): raise ValueError("length mismatch")
    counts={}
    for truth,guess in zip(actual,predicted):
        if truth!=guess: counts[(truth,guess)]=counts.get((truth,guess),0)+1
    return [{"truth":key[0],"predicted":key[1],"count":count} for key,count in sorted(counts.items(),key=lambda item:(-item[1],item[0]))]
""", "confusion_pairs",
            [("ranks-confusion-pairs", [[3,3,5,5,7],[8,8,5,3,7]], [{"truth":3,"predicted":8,"count":2},{"truth":5,"predicted":3,"count":1}]), ("returns-empty-perfect", [[1,2],[1,2]], []), ("rejects-length-mismatch", [[1],[1,2]], E("ValueError"))],
            ["전체 accuracy 뒤에 반복되는 confusion pair를 찾으세요.", "대표 오류 이미지는 개인정보·저작권 경계를 지켜야 합니다."],
        ),
        "retrieval": decision("image-classifier-evidence", "이미지 분류 증거 회상하기", "shape·class error·shift를 구분한다.", "choose_image_model_evidence", {"input-contract": {"method":"shape and range audit","evidence":"feature count","risk":"ragged images"}, "class-errors": {"method":"confusion pairs","evidence":"per-class support","risk":"accuracy only"}, "new-scanner": {"method":"external shift test","evidence":"device metadata","risk":"domain shift"}}),
    },
    "06": {
        "mastery": T(
            "cluster-assignment", "고객을 nearest centroid에 배정하고 거리 근거 남기기", "동점 규칙과 squared distance를 명시한다.",
            "assign_clusters(points, centroids)를 완성하세요.", "def assign_clusters(points, centroids):\n    raise NotImplementedError",
            """def assign_clusters(points, centroids):
    if not centroids or any(len(point)!=len(centroids[0]) for point in points) or any(len(center)!=len(centroids[0]) for center in centroids): raise ValueError("shape mismatch")
    result=[]
    for point in points:
        distances=[sum((value-center[index])**2 for index,value in enumerate(point)) for center in centroids]
        cluster=min(range(len(distances)),key=lambda index:(distances[index],index))
        result.append({"cluster":cluster,"squaredDistance":round(distances[cluster],6)})
    return result
""", "assign_clusters",
            [("assigns-nearest-centroid", [[[0,0],[9,9]],[[0,1],[10,10]]], [{"cluster":0,"squaredDistance":1},{"cluster":1,"squaredDistance":2}]), ("breaks-tie-by-index", [[[1]],[[0],[2]]], [{"cluster":0,"squaredDistance":1}]), ("rejects-empty-centroids", [[[1]],[]], E("ValueError"))],
            ["거리 metric과 feature scale이 cluster를 결정합니다.", "동점 tie-breaker를 고정해 재현 가능하게 만드세요."],
        ),
        "transfer": T(
            "cluster-profile", "새 segment에 cluster profile 전이하기", "cluster별 count와 feature mean을 계산한다.",
            "profile_clusters(points, assignments)를 완성하세요.", "def profile_clusters(points, assignments):\n    raise NotImplementedError",
            """def profile_clusters(points, assignments):
    if len(points)!=len(assignments) or not points: raise ValueError("invalid cluster rows")
    grouped={}
    for point,label in zip(points,assignments): grouped.setdefault(label,[]).append(point)
    return {str(label):{"count":len(rows),"means":[round(sum(row[index] for row in rows)/len(rows),4) for index in range(len(rows[0]))]} for label,rows in sorted(grouped.items())}
""", "profile_clusters",
            [("profiles-segments", [[[1,2],[3,4],[10,20]],[0,0,1]], {"0":{"count":2,"means":[2.0,3.0]},"1":{"count":1,"means":[10.0,20.0]}}), ("profiles-one-cluster", [[[2,4]],[5]], {"5":{"count":1,"means":[2.0,4.0]}}), ("rejects-length-mismatch", [[[1]],[]], E("ValueError"))],
            ["cluster 이름은 profile을 본 뒤 업무적으로 해석하세요.", "segment label을 사람의 본질적 유형으로 표현하지 마세요."],
        ),
        "retrieval": decision("clustering-evidence", "군집화 증거 회상하기", "거리·k·해석 안정성을 구분한다.", "choose_clustering_evidence", {"numeric-segments": {"method":"scaled k-means","evidence":"inertia silhouette profiles","risk":"scale dominance"}, "choose-k": {"method":"stability and business utility","evidence":"multiple seeds","risk":"single elbow"}, "segment-label": {"method":"post-hoc profile","evidence":"feature means counts","risk":"stereotyping"}}),
    },
    "07": {
        "mastery": T(
            "stratified-count-plan", "소나 이진분류의 stratified split 수 계산하기", "class별 test count를 최소 1개 보존해 반환한다.",
            "stratified_test_counts(class_counts, test_ratio)를 완성하세요.", "def stratified_test_counts(class_counts, test_ratio):\n    raise NotImplementedError",
            """def stratified_test_counts(class_counts, test_ratio):
    if not 0 < test_ratio < 1 or any(count < 2 for count in class_counts.values()): raise ValueError("cannot stratify")
    result={}
    for label,count in sorted(class_counts.items()):
        test=max(1,min(count-1,round(count*test_ratio)))
        result[str(label)]={"train":count-test,"test":test}
    return result
""", "stratified_test_counts",
            [("preserves-both-classes", [{"rock":8,"mine":2},0.25], {"mine":{"train":1,"test":1},"rock":{"train":6,"test":2}}), ("handles-small-ratio", [{0:3,1:3},0.1], {"0":{"train":2,"test":1},"1":{"train":2,"test":1}}), ("rejects-singleton-class", [{0:1,1:5},0.2], E("ValueError"))],
            ["각 class가 train과 test 양쪽에 남아야 합니다.", "작은 class에서 비율 반올림 결과를 검토하세요."],
        ),
        "transfer": T(
            "signal-feature-range", "새 신호 feature에 train range 점검 전이하기", "test feature가 train min/max 밖에 있는 비율을 계산한다.",
            "feature_range_shift(train_rows, test_rows)를 완성하세요.", "def feature_range_shift(train_rows, test_rows):\n    raise NotImplementedError",
            """def feature_range_shift(train_rows, test_rows):
    if not train_rows or not test_rows or any(len(row)!=len(train_rows[0]) for row in train_rows+test_rows): raise ValueError("shape mismatch")
    ranges=[(min(row[index] for row in train_rows),max(row[index] for row in train_rows)) for index in range(len(train_rows[0]))]
    outside=[sum(value<ranges[index][0] or value>ranges[index][1] for index,value in enumerate(row)) for row in test_rows]
    total=len(test_rows)*len(ranges)
    return {"ranges":[list(pair) for pair in ranges],"outsideCount":sum(outside),"outsideRate":round(sum(outside)/total,4)}
""", "feature_range_shift",
            [("detects-range-shift", [[[0,10],[2,8]],[[1,9],[3,20]]], {"ranges":[[0,2],[8,10]],"outsideCount":2,"outsideRate":0.5}), ("accepts-inside-range", [[[0],[2]],[[1]]], {"ranges":[[0,2]],"outsideCount":0,"outsideRate":0.0}), ("rejects-empty", [[],[[1]]], E("ValueError"))],
            ["scaler를 적용하기 전 원 feature range shift를 기록하세요.", "범위 밖 값은 자동 오류가 아니라 외부 검토 신호입니다."],
        ),
        "retrieval": decision("sonar-classification-evidence", "신호 분류 검증 회상하기", "class split·scale·shift를 구분한다.", "choose_signal_classifier_evidence", {"imbalanced-labels": {"method":"stratified split","evidence":"class counts per split","risk":"singleton class"}, "many-amplitudes": {"method":"train-fitted scaler","evidence":"feature ranges","risk":"test fit"}, "new-device": {"method":"external device holdout","evidence":"range shift and metrics","risk":"sensor shift"}}),
    },
    "08": {
        "mastery": T(
            "heart-risk-calibration", "심장 위험 예측의 calibration bin 계산하기", "확률 bin별 평균 예측과 실제 발생률을 반환한다.",
            "calibration_bins(probabilities, outcomes, boundaries)를 완성하세요.", "def calibration_bins(probabilities, outcomes, boundaries):\n    raise NotImplementedError",
            """def calibration_bins(probabilities, outcomes, boundaries):
    if len(probabilities)!=len(outcomes) or any(not 0<=value<=1 for value in probabilities+outcomes): raise ValueError("invalid probability rows")
    bins=[]
    for lower,upper in zip(boundaries,boundaries[1:]):
        rows=[(p,y) for p,y in zip(probabilities,outcomes) if lower<=p<(upper if upper<1 else upper+1e-12)]
        bins.append({"lower":lower,"upper":upper,"count":len(rows),"meanProbability":None if not rows else round(sum(p for p,_ in rows)/len(rows),4),"eventRate":None if not rows else round(sum(y for _,y in rows)/len(rows),4)})
    return bins
""", "calibration_bins",
            [("computes-reliability-bins", [[0.1,0.2,0.8,0.9],[0,1,1,1],[0,0.5,1]], [{"lower":0,"upper":0.5,"count":2,"meanProbability":0.15,"eventRate":0.5},{"lower":0.5,"upper":1,"count":2,"meanProbability":0.85,"eventRate":1.0}]), ("keeps-empty-bin", [[0.1],[0],[0,0.5,1]], [{"lower":0,"upper":0.5,"count":1,"meanProbability":0.1,"eventRate":0.0},{"lower":0.5,"upper":1,"count":0,"meanProbability":None,"eventRate":None}]), ("rejects-invalid-probability", [[1.2],[1],[0,1]], E("ValueError"))],
            ["score를 확률이라 부르려면 calibration 근거가 필요합니다.", "빈 bin과 작은 bin을 숨기지 마세요."],
        ),
        "transfer": T(
            "subgroup-diagnostic-metrics", "새 환자 subgroup에 성능 감사 전이하기", "group별 sensitivity와 support를 분리한다.",
            "subgroup_sensitivity(rows)를 완성하세요.", "def subgroup_sensitivity(rows):\n    raise NotImplementedError",
            """def subgroup_sensitivity(rows):
    grouped={}
    for row in rows:
        bucket=grouped.setdefault(row["group"],{"positive":0,"truePositive":0,"count":0})
        bucket["count"]+=1
        if row["actual"]==1:
            bucket["positive"]+=1; bucket["truePositive"]+=int(row["predicted"]==1)
    return {group:{"count":b["count"],"positiveSupport":b["positive"],"sensitivity":None if b["positive"]==0 else round(b["truePositive"]/b["positive"],4)} for group,b in sorted(grouped.items())}
""", "subgroup_sensitivity",
            [("reports-subgroup-gaps", [[{"group":"A","actual":1,"predicted":1},{"group":"A","actual":1,"predicted":0},{"group":"B","actual":0,"predicted":0}]], {"A":{"count":2,"positiveSupport":2,"sensitivity":0.5},"B":{"count":1,"positiveSupport":0,"sensitivity":None}}), ("handles-empty", [[]], {})],
            ["subgroup metric 옆에 positive support를 남기세요.", "작은 subgroup 차이를 확정적 편향 결론으로 과장하지 마세요."],
        ),
        "retrieval": decision("heart-risk-evidence", "심장 위험 모델 증거 회상하기", "확률·subgroup·임상 경계를 구분한다.", "choose_heart_model_evidence", {"risk-probability": {"method":"calibration audit","evidence":"reliability bins","risk":"uncalibrated score"}, "subgroup-safety": {"method":"support-aware metrics","evidence":"counts sensitivity specificity","risk":"small samples"}, "patient-use": {"method":"clinician-reviewed decision support","evidence":"external validation","risk":"diagnostic claim"}}),
    },
    "09": {
        "mastery": T(
            "threshold-confusion-curve", "신호 탐지 threshold별 confusion과 비용 계산하기", "score cutoff마다 tp·fp·fn·tn과 cost를 반환한다.",
            "threshold_costs(scores, outcomes, thresholds, false_positive_cost, false_negative_cost)를 완성하세요.", "def threshold_costs(scores, outcomes, thresholds, false_positive_cost, false_negative_cost):\n    raise NotImplementedError",
            """def threshold_costs(scores, outcomes, thresholds, false_positive_cost, false_negative_cost):
    if len(scores)!=len(outcomes): raise ValueError("length mismatch")
    result=[]
    for threshold in thresholds:
        tp=fp=tn=fn=0
        for score,truth in zip(scores,outcomes):
            guess=int(score>=threshold)
            if truth==1 and guess==1: tp+=1
            elif truth==1: fn+=1
            elif guess==1: fp+=1
            else: tn+=1
        result.append({"threshold":threshold,"tp":tp,"fp":fp,"tn":tn,"fn":fn,"cost":fp*false_positive_cost+fn*false_negative_cost})
    return result
""", "threshold_costs",
            [("compares-threshold-costs", [[0.2,0.6,0.9],[0,1,0],[0.5,0.8],1,4], [{"threshold":0.5,"tp":1,"fp":1,"tn":1,"fn":0,"cost":1},{"threshold":0.8,"tp":0,"fp":1,"tn":1,"fn":1,"cost":5}]), ("handles-empty-scores", [[],[],[0.5],1,1], [{"threshold":0.5,"tp":0,"fp":0,"tn":0,"fn":0,"cost":0}]), ("rejects-length-mismatch", [[0.1],[0,1],[0.5],1,1], E("ValueError"))],
            ["threshold는 모델 재학습 없이 운영 tradeoff를 바꿉니다.", "false positive와 false negative의 비용 가정을 공개하세요."],
        ),
        "transfer": T(
            "threshold-selection", "새 탐지 정책에 threshold 선택 전이하기", "최소 recall 제약 안에서 cost가 가장 낮은 threshold를 고른다.",
            "select_threshold(rows, minimum_recall)를 완성하세요.", "def select_threshold(rows, minimum_recall):\n    raise NotImplementedError",
            """def select_threshold(rows, minimum_recall):
    candidates=[]
    for row in rows:
        support=row["tp"]+row["fn"]; recall=None if support==0 else row["tp"]/support
        if recall is not None and recall>=minimum_recall: candidates.append((row["cost"],-row["threshold"],recall,row))
    if not candidates: return {"selected":None,"reason":"no-feasible-threshold"}
    _,_,recall,row=min(candidates)
    return {"selected":row["threshold"],"recall":round(recall,4),"cost":row["cost"]}
""", "select_threshold",
            [("selects-lowest-cost-feasible", [[{"threshold":0.3,"tp":9,"fn":1,"cost":8},{"threshold":0.5,"tp":8,"fn":2,"cost":3},{"threshold":0.8,"tp":5,"fn":5,"cost":1}],0.8], {"selected":0.5,"recall":0.8,"cost":3}), ("reports-no-feasible", [[{"threshold":0.9,"tp":1,"fn":9,"cost":0}],0.5], {"selected":None,"reason":"no-feasible-threshold"})],
            ["운영 제약을 먼저 적용한 뒤 cost를 최소화하세요.", "test set에서 고른 threshold 성능을 같은 test set의 최종 성능으로 재사용하지 마세요."],
        ),
        "retrieval": decision("threshold-optimization-evidence", "threshold 최적화 증거 회상하기", "ROC·비용·검증 분리를 구분한다.", "choose_threshold_evidence", {"ranking-quality": {"method":"ROC or PR curve","evidence":"all thresholds","risk":"class prevalence"}, "operating-point": {"method":"cost constrained threshold","evidence":"cost and recall assumptions","risk":"test tuning"}, "release-threshold": {"method":"validation selection then test audit","evidence":"separate splits","risk":"reused test"}}),
    },
    "10": {
        "mastery": T(
            "pipeline-manifest", "종합 ML pipeline manifest 검증하기", "split·preprocess·model·threshold·metrics의 순서와 hash를 확인한다.",
            "audit_pipeline_manifest(stages)를 완성하세요.", "def audit_pipeline_manifest(stages):\n    raise NotImplementedError",
            """def audit_pipeline_manifest(stages):
    required=["split","preprocess","model","threshold","metrics"]
    names=[stage.get("name") for stage in stages]; missing=[name for name in required if name not in names]
    order_valid=all(name in names for name in required) and [names.index(name) for name in required]==sorted(names.index(name) for name in required)
    unhashed=[stage.get("name") for stage in stages if not stage.get("hash")]
    return {"valid":not missing and order_valid and not unhashed,"missing":missing,"orderValid":order_valid,"unhashed":unhashed,"stageCount":len(stages)}
""", "audit_pipeline_manifest",
            [("accepts-complete-manifest", [[{"name":name,"hash":name+"-hash"} for name in ["split","preprocess","model","threshold","metrics"]]], {"valid":True,"missing":[],"orderValid":True,"unhashed":[],"stageCount":5}), ("reports-order-and-hash", [[{"name":"model","hash":"m"},{"name":"split","hash":"s"},{"name":"preprocess","hash":""},{"name":"metrics","hash":"x"}]], {"valid":False,"missing":["threshold"],"orderValid":False,"unhashed":["preprocess"],"stageCount":4})],
            ["preprocess는 split 뒤 train fold 안에서 fit되어야 합니다.", "threshold와 metric configuration도 artifact hash에 포함하세요."],
        ),
        "transfer": T(
            "model-release-card", "새 모델 release에 evidence card 전이하기", "baseline·heldout·subgroup·drift·claim review를 모두 검사한다.",
            "audit_model_release(evidence)를 완성하세요.", "def audit_model_release(evidence):\n    raise NotImplementedError",
            """def audit_model_release(evidence):
    required=["baseline","heldout","subgroup","drift","claimReview"]
    missing=[name for name in required if name not in evidence]
    failed=[name for name in required if name in evidence and evidence[name].get("status")!="approved"]
    return {"releaseReady":not missing and not failed,"missing":missing,"failed":failed,"evidenceRefs":[evidence[name].get("ref") for name in required if name in evidence]}
""", "audit_model_release",
            [("accepts-approved-card", [{name:{"status":"approved","ref":name+".json"} for name in ["baseline","heldout","subgroup","drift","claimReview"]}], {"releaseReady":True,"missing":[],"failed":[],"evidenceRefs":["baseline.json","heldout.json","subgroup.json","drift.json","claimReview.json"]}), ("reports-missing-and-failed", [{"baseline":{"status":"approved","ref":"b"},"heldout":{"status":"failed","ref":"h"}}], {"releaseReady":False,"missing":["subgroup","drift","claimReview"],"failed":["heldout"],"evidenceRefs":["b","h"]})],
            ["모델 파일 존재를 release readiness로 부르지 마세요.", "claim review와 drift 계획도 blocking evidence입니다."],
        ),
        "retrieval": decision("ml-pipeline-release", "종합 ML pipeline 증거 회상하기", "재현성·성능·운영 claim을 분리한다.", "choose_pipeline_evidence", {"reproducible-build": {"method":"hashed pipeline manifest","evidence":"data split code model hashes","risk":"mutable dependency"}, "model-quality": {"method":"held-out and subgroup metrics","evidence":"baseline error analysis","risk":"single score"}, "production-use": {"method":"claim and drift review","evidence":"owner thresholds rollback","risk":"offline-only success"}}),
    },
}
