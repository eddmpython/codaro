from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
import tempfile
from pathlib import Path
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[4]
TRACK = ROOT / "curricula" / "python" / "basics" / "30days"
FIXTURE = {
    "directories": [],
    "env": {"LANG": "C.UTF-8", "TZ": "UTC"},
    "files": [],
    "stdin": [],
}


Task = dict[str, Any]


class LiteralString(str):
    pass


class FixturePath(str):
    pass


class ExpectedException(str):
    pass


def literal_string_representer(dumper: yaml.SafeDumper, value: LiteralString):
    return dumper.represent_scalar("tag:yaml.org,2002:str", value, style="|")


yaml.SafeDumper.add_representer(LiteralString, literal_string_representer)


def readable_yaml(value: Any) -> Any:
    if isinstance(value, str) and "\n" in value:
        return LiteralString(value)
    if isinstance(value, list):
        return [readable_yaml(item) for item in value]
    if isinstance(value, dict):
        return {key: readable_yaml(item) for key, item in value.items()}
    return value


def task(
    slug: str,
    title: str,
    goal: str,
    prompt: str,
    starter: str,
    solution: str,
    entry: str,
    cases: list[tuple[str, list[Any], Any]],
    *,
    fixture: dict[str, Any] | None = None,
    expected_paths: list[dict[str, str]] | None = None,
    normalize_return_paths: list[str] | None = None,
) -> Task:
    return {
        "slug": slug,
        "title": title,
        "goal": goal,
        "prompt": prompt,
        "starter": starter,
        "solution": solution,
        "entry": entry,
        "cases": cases,
        "fixture": copy.deepcopy(fixture or FIXTURE),
        "expected_paths": expected_paths or [],
        "normalize_return_paths": normalize_return_paths or [],
    }


def fixture_path(value: str) -> FixturePath:
    return FixturePath(value)


def raises(name: str) -> ExpectedException:
    return ExpectedException(name)


BLUEPRINTS: dict[int, dict[str, Task]] = {
    2: {
        "mastery": task(
            "describe-value", "값과 타입을 한 줄로 설명하기", "값에 맞는 타입 이름과 값을 함께 반환한다.",
            "describe_value(value)가 타입이름:값 형식의 문자열을 반환하도록 완성하세요.",
            "def describe_value(value):\n    raise NotImplementedError",
            "def describe_value(value):\n    return f\"{type(value).__name__}:{value}\"",
            "describe_value", [("integer", [7], "int:7"), ("text", ["Codaro"], "str:Codaro"), ("boolean", [True], "bool:True")],
        ),
        "transfer": task(
            "profile-line", "문자 나이를 프로필 문구로 바꾸기", "문자열 입력을 정수로 바꿔 새 출력 형식에 적용한다.",
            "profile_line(name, age)가 이름(나이) 형식의 문자열을 반환하도록 완성하세요.",
            "def profile_line(name, age):\n    raise NotImplementedError",
            "def profile_line(name, age):\n    return f\"{name}({int(age)})\"",
            "profile_line", [("text-age", ["Mina", "21"], "Mina(21)"), ("number-age", ["Jun", 30], "Jun(30)")],
        ),
        "retrieval": task(
            "reassign-score", "점수를 다시 할당해 갱신하기", "시간이 지난 뒤 변수 재할당 결과를 스스로 구성한다.",
            "reassign_score(start, bonus)가 시작 점수에 보너스를 반영한 최종 값을 반환하도록 완성하세요.",
            "def reassign_score(start, bonus):\n    raise NotImplementedError",
            "def reassign_score(start, bonus):\n    score = start\n    score += bonus\n    return score",
            "reassign_score", [("positive", [80, 15], 95), ("negative", [50, -8], 42)],
        ),
    },
    3: {
        "mastery": task(
            "calculate", "연산 기호에 맞춰 계산하기", "산술 연산자를 조건과 결합해 정확한 값을 반환한다.",
            "calculate(a, b, operator)가 +, -, * 연산을 처리하도록 완성하세요.",
            "def calculate(a, b, operator):\n    raise NotImplementedError",
            "def calculate(a, b, operator):\n    if operator == '+':\n        return a + b\n    if operator == '-':\n        return a - b\n    if operator == '*':\n        return a * b\n    raise ValueError('unsupported operator')",
            "calculate", [("add", [8, 3, "+"], 11), ("subtract", [8, 3, "-"], 5), ("multiply", [8, 3, "*"], 24)],
        ),
        "transfer": task(
            "final-price", "할인율을 최종 가격에 적용하기", "백분율 계산을 처음 보는 가격 문맥에 옮긴다.",
            "final_price(price, discount_percent)가 정수 가격의 할인 적용 결과를 반환하도록 완성하세요.",
            "def final_price(price, discount_percent):\n    raise NotImplementedError",
            "def final_price(price, discount_percent):\n    return price * (100 - discount_percent) // 100",
            "final_price", [("ten-percent", [20000, 10], 18000), ("quarter", [8000, 25], 6000)],
        ),
        "retrieval": task(
            "inside-range", "범위 안인지 다시 판단하기", "비교 연산과 논리 연산을 기억에서 다시 조합한다.",
            "inside_range(value, low, high)가 양 끝을 포함한 범위 여부를 반환하도록 완성하세요.",
            "def inside_range(value, low, high):\n    raise NotImplementedError",
            "def inside_range(value, low, high):\n    return low <= value <= high",
            "inside_range", [("inside", [5, 1, 10], True), ("edge", [10, 1, 10], True), ("outside", [11, 1, 10], False)],
        ),
    },
    4: {
        "mastery": task(
            "introduce", "두 문자열로 소개 문장 만들기", "문자열 보간으로 입력값을 정확한 문장에 배치한다.",
            "introduce(name, language)가 '이름 learns 언어' 문장을 반환하도록 완성하세요.",
            "def introduce(name, language):\n    raise NotImplementedError",
            "def introduce(name, language):\n    return f\"{name} learns {language}\"",
            "introduce", [("python", ["Mina", "Python"], "Mina learns Python"), ("rust", ["Jun", "Rust"], "Jun learns Rust")],
        ),
        "transfer": task(
            "initials", "여러 단어에서 이니셜 만들기", "문자열 분리와 결합을 이름 축약 문제에 적용한다.",
            "initials(full_name)가 각 단어 첫 글자를 대문자로 이어 반환하도록 완성하세요.",
            "def initials(full_name):\n    raise NotImplementedError",
            "def initials(full_name):\n    return ''.join(part[0].upper() for part in full_name.split())",
            "initials", [("two-words", ["ada lovelace"], "AL"), ("three-words", ["kim min su"], "KMS")],
        ),
        "retrieval": task(
            "quote-text", "따옴표가 포함된 문자열 다시 만들기", "문자열 경계와 따옴표 표현을 기억에서 복원한다.",
            "quote_text(text)가 입력 양쪽에 큰따옴표를 붙여 반환하도록 완성하세요.",
            "def quote_text(text):\n    raise NotImplementedError",
            "def quote_text(text):\n    return f'\"{text}\"'",
            "quote_text", [("word", ["Codaro"], "\"Codaro\""), ("sentence", ["learn by doing"], "\"learn by doing\"")],
        ),
    },
    5: {
        "mastery": task(
            "edge-pair", "문자열 양 끝 문자 고르기", "양수와 음수 인덱스로 경계 문자를 조합한다.",
            "edge_pair(text)가 첫 문자와 마지막 문자를 이어 반환하도록 완성하세요.",
            "def edge_pair(text):\n    raise NotImplementedError",
            "def edge_pair(text):\n    return text[0] + text[-1]",
            "edge_pair", [("codaro", ["Codaro"], "Co"), ("python", ["Python"], "Pn")],
        ),
        "transfer": task(
            "mask-tail", "식별자의 끝부분만 남기기", "슬라이싱을 개인정보 마스킹 문맥에 적용한다.",
            "mask_tail(code, visible)가 마지막 visible글자만 남기고 앞을 *로 바꾸도록 완성하세요.",
            "def mask_tail(code, visible):\n    raise NotImplementedError",
            "def mask_tail(code, visible):\n    return '*' * max(0, len(code) - visible) + code[-visible:]",
            "mask_tail", [("card", ["12345678", 4], "****5678"), ("short", ["ABC", 2], "*BC")],
        ),
        "retrieval": task(
            "reverse-text", "슬라이스로 문자열 뒤집기", "시간이 지난 뒤 step 슬라이스를 다시 구성한다.",
            "reverse_text(text)가 문자열을 거꾸로 반환하도록 완성하세요.",
            "def reverse_text(text):\n    raise NotImplementedError",
            "def reverse_text(text):\n    return text[::-1]",
            "reverse_text", [("ascii", ["stressed"], "desserts"), ("korean", ["파이썬"], "썬이파")],
        ),
    },
    6: {
        "mastery": task(
            "normalize-tag", "입력 문구를 태그로 정규화하기", "strip, lower, replace를 순서대로 적용한다.",
            "normalize_tag(text)가 바깥 공백을 지우고 소문자 하이픈 태그를 반환하도록 완성하세요.",
            "def normalize_tag(text):\n    raise NotImplementedError",
            "def normalize_tag(text):\n    return text.strip().lower().replace(' ', '-')",
            "normalize_tag", [("spaces", ["  Learn Python  "], "learn-python"), ("case", ["CODARO LAB"], "codaro-lab")],
        ),
        "transfer": task(
            "count-word", "대소문자와 무관하게 단어 세기", "문자열 메서드를 간단한 텍스트 집계에 적용한다.",
            "count_word(text, word)가 공백으로 나눈 단어의 대소문자 무관 등장 횟수를 반환하도록 완성하세요.",
            "def count_word(text, word):\n    raise NotImplementedError",
            "def count_word(text, word):\n    return text.lower().split().count(word.lower())",
            "count_word", [("mixed-case", ["Python code PYTHON", "python"], 2), ("missing", ["learn by doing", "code"], 0)],
        ),
        "retrieval": task(
            "clean-csv", "쉼표 항목의 공백 정리하기", "split과 strip, join을 기억에서 다시 연결한다.",
            "clean_csv(text)가 쉼표로 나눈 항목 공백을 지운 뒤 ', '로 다시 이어 반환하도록 완성하세요.",
            "def clean_csv(text):\n    raise NotImplementedError",
            "def clean_csv(text):\n    return ', '.join(part.strip() for part in text.split(','))",
            "clean_csv", [("three", ["red, green,blue"], "red, green, blue"), ("two", ["A ,B"], "A, B")],
        ),
    },
    7: {
        "mastery": task(
            "score-summary", "점수 목록의 핵심 값 요약하기", "리스트에서 최솟값, 최댓값, 합계를 순서대로 만든다.",
            "score_summary(scores)가 [최솟값, 최댓값, 합계]를 반환하도록 완성하세요.",
            "def score_summary(scores):\n    raise NotImplementedError",
            "def score_summary(scores):\n    return [min(scores), max(scores), sum(scores)]",
            "score_summary", [("mixed", [[30, 10, 20]], [10, 30, 60]), ("single", [[7]], [7, 7, 7])],
        ),
        "transfer": task(
            "rotate-left", "목록을 원하는 칸만큼 회전하기", "슬라이싱을 변경 가능한 항목 목록에 적용한다.",
            "rotate_left(items, steps)가 목록을 왼쪽으로 steps칸 회전한 새 목록을 반환하도록 완성하세요.",
            "def rotate_left(items, steps):\n    raise NotImplementedError",
            "def rotate_left(items, steps):\n    steps %= len(items)\n    return items[steps:] + items[:steps]",
            "rotate_left", [("one", [[1, 2, 3, 4], 1], [2, 3, 4, 1]), ("wrapped", [["a", "b", "c"], 4], ["b", "c", "a"])],
        ),
        "retrieval": task(
            "second-last", "두 위치의 목록 값 다시 고르기", "양수와 음수 인덱스를 리스트에서 다시 사용한다.",
            "second_and_last(items)가 두 번째 값과 마지막 값을 새 목록으로 반환하도록 완성하세요.",
            "def second_and_last(items):\n    raise NotImplementedError",
            "def second_and_last(items):\n    return [items[1], items[-1]]",
            "second_and_last", [("numbers", [[5, 6, 7, 8]], [6, 8]), ("words", [["first", "middle", "last"]], ["middle", "last"])],
        ),
    },
    8: {
        "mastery": task(
            "prepare-queue", "원본을 지키며 작업 큐 준비하기", "리스트 덧붙이기와 정렬 결과를 새 목록으로 반환한다.",
            "prepare_queue(items)가 review를 더하고 정렬한 새 목록을 반환하도록 완성하세요.",
            "def prepare_queue(items):\n    raise NotImplementedError",
            "def prepare_queue(items):\n    queue = items.copy()\n    queue.append('review')\n    queue.sort()\n    return queue",
            "prepare_queue", [("tasks", [["write", "plan"]], ["plan", "review", "write"]), ("empty", [[]], ["review"])],
        ),
        "transfer": task(
            "insert-priority", "우선 항목을 목록 맨 앞에 넣기", "insert의 위치 개념을 작업 우선순위에 적용한다.",
            "insert_priority(items, item)가 item을 맨 앞에 둔 새 목록을 반환하도록 완성하세요.",
            "def insert_priority(items, item):\n    raise NotImplementedError",
            "def insert_priority(items, item):\n    result = items.copy()\n    result.insert(0, item)\n    return result",
            "insert_priority", [("numbers", [[2, 3], 1], [1, 2, 3]), ("words", [["later"], "now"], ["now", "later"])],
        ),
        "retrieval": task(
            "remove-all", "특정 값을 모두 제외하기", "목록 순회 결과를 새 리스트에 모으는 방식을 회상한다.",
            "remove_all(items, target)가 target과 다른 항목만 남긴 새 목록을 반환하도록 완성하세요.",
            "def remove_all(items, target):\n    raise NotImplementedError",
            "def remove_all(items, target):\n    return [item for item in items if item != target]",
            "remove_all", [("duplicates", [[1, 2, 1, 3], 1], [2, 3]), ("missing", [["a", "b"], "x"], ["a", "b"])],
        ),
    },
    9: {
        "mastery": task(
            "coordinate-label", "좌표 튜플을 문구로 바꾸기", "튜플 언패킹으로 x와 y를 분리한다.",
            "coordinate_label(point)가 'x,y' 형식의 문자열을 반환하도록 완성하세요.",
            "def coordinate_label(point):\n    raise NotImplementedError",
            "def coordinate_label(point):\n    x, y = point\n    return f\"{x},{y}\"",
            "coordinate_label", [("positive", [[3, 5]], "3,5"), ("negative", [[-1, 2]], "-1,2")],
        ),
        "transfer": task(
            "swap-pair", "두 값을 새 순서로 교환하기", "튜플 언패킹을 값 교환 문제에 적용한다.",
            "swap_pair(pair)가 두 값의 순서를 바꾼 튜플을 반환하도록 완성하세요.",
            "def swap_pair(pair):\n    raise NotImplementedError",
            "def swap_pair(pair):\n    left, right = pair\n    return right, left",
            "swap_pair", [("numbers", [[1, 2]], [2, 1]), ("words", [["first", "second"]], ["second", "first"])],
        ),
        "retrieval": task(
            "record-dict", "고정 순서 레코드 다시 해석하기", "튜플의 위치 의미를 기억해 이름 있는 dict로 바꾼다.",
            "record_to_dict(record)가 (name, score)를 {'name': ..., 'score': ...}로 반환하도록 완성하세요.",
            "def record_to_dict(record):\n    raise NotImplementedError",
            "def record_to_dict(record):\n    name, score = record\n    return {'name': name, 'score': score}",
            "record_to_dict", [("first", [["Mina", 92]], {"name": "Mina", "score": 92}), ("second", [["Jun", 80]], {"name": "Jun", "score": 80})],
        ),
    },
    10: {
        "mastery": task(
            "common-tags", "두 태그 집합의 공통값 찾기", "교집합을 정렬된 결과로 바꿔 안정적으로 반환한다.",
            "common_tags(left, right)가 공통 항목을 정렬한 목록으로 반환하도록 완성하세요.",
            "def common_tags(left, right):\n    raise NotImplementedError",
            "def common_tags(left, right):\n    return sorted(set(left) & set(right))",
            "common_tags", [("overlap", [["python", "web"], ["web", "data"]], ["web"]), ("many", [[3, 1, 2], [2, 3, 4]], [2, 3])],
        ),
        "transfer": task(
            "unique-count", "중복 응답 수를 고유 개수로 바꾸기", "집합의 중복 제거 성질을 집계 문제에 적용한다.",
            "unique_count(items)가 중복을 제외한 항목 개수를 반환하도록 완성하세요.",
            "def unique_count(items):\n    raise NotImplementedError",
            "def unique_count(items):\n    return len(set(items))",
            "unique_count", [("numbers", [[1, 1, 2, 3, 3]], 3), ("words", [["a", "b", "a"]], 2)],
        ),
        "retrieval": task(
            "only-left", "왼쪽 집합에만 있는 값 찾기", "차집합 연산을 기억에서 다시 구성한다.",
            "only_left(left, right)가 left에만 있는 항목을 정렬한 목록으로 반환하도록 완성하세요.",
            "def only_left(left, right):\n    raise NotImplementedError",
            "def only_left(left, right):\n    return sorted(set(left) - set(right))",
            "only_left", [("numbers", [[1, 2, 3], [2, 4]], [1, 3]), ("words", [["red", "blue"], ["blue"]], ["red"])],
        ),
    },
    11: {
        "mastery": task(
            "select-fields", "딕셔너리에서 필요한 필드만 고르기", "key 목록을 따라 새 딕셔너리를 구성한다.",
            "select_fields(record, fields)가 fields에 있는 key만 새 딕셔너리로 반환하도록 완성하세요.",
            "def select_fields(record, fields):\n    raise NotImplementedError",
            "def select_fields(record, fields):\n    return {field: record[field] for field in fields}",
            "select_fields", [("profile", [{"name": "Mina", "age": 21, "city": "Seoul"}, ["name", "city"]], {"name": "Mina", "city": "Seoul"}), ("score", [{"id": 7, "score": 92}, ["score"]], {"score": 92})],
        ),
        "transfer": task(
            "merge-inventory", "재고 수정값을 원본에 합치기", "딕셔너리 병합을 재고 갱신 문맥에 적용한다.",
            "merge_inventory(base, updates)가 원본을 바꾸지 않고 수정값을 반영한 새 딕셔너리를 반환하도록 완성하세요.",
            "def merge_inventory(base, updates):\n    raise NotImplementedError",
            "def merge_inventory(base, updates):\n    result = base.copy()\n    result.update(updates)\n    return result",
            "merge_inventory", [("replace", [{"pen": 3, "book": 2}, {"pen": 5}], {"pen": 5, "book": 2}), ("add", [{"pen": 1}, {"note": 4}], {"pen": 1, "note": 4})],
        ),
        "retrieval": task(
            "invert-mapping", "key와 value 관계 뒤집기", "딕셔너리 순회를 기억에서 다시 구성한다.",
            "invert_mapping(mapping)이 각 value를 key로, 기존 key를 value로 바꾼 딕셔너리를 반환하도록 완성하세요.",
            "def invert_mapping(mapping):\n    raise NotImplementedError",
            "def invert_mapping(mapping):\n    return {value: key for key, value in mapping.items()}",
            "invert_mapping", [("letters", [{"a": 1, "b": 2}], {"1": "a", "2": "b"}), ("labels", [{"kr": "Korea", "jp": "Japan"}], {"Korea": "kr", "Japan": "jp"})],
        ),
    },
    12: {
        "mastery": task(
            "read-setting", "기본값이 있는 설정 읽기", "dict.get으로 누락 key를 안전하게 처리한다.",
            "read_setting(settings, key, default)가 key 값 또는 default를 반환하도록 완성하세요.",
            "def read_setting(settings, key, default):\n    raise NotImplementedError",
            "def read_setting(settings, key, default):\n    return settings.get(key, default)",
            "read_setting", [("present", [{"theme": "dark"}, "theme", "light"], "dark"), ("missing", [{}, "theme", "light"], "light")],
        ),
        "transfer": task(
            "count-categories", "항목별 범주 횟수 집계하기", "get 누적 패턴을 빈도표에 적용한다.",
            "count_categories(items)가 각 항목의 등장 횟수를 딕셔너리로 반환하도록 완성하세요.",
            "def count_categories(items):\n    raise NotImplementedError",
            "def count_categories(items):\n    counts = {}\n    for item in items:\n        counts[item] = counts.get(item, 0) + 1\n    return counts",
            "count_categories", [("colors", [["red", "blue", "red"]], {"red": 2, "blue": 1}), ("single", [["python"]], {"python": 1})],
        ),
        "retrieval": task(
            "pop-copy", "복사본에서 key 꺼내기", "원본 보존과 pop 반환값을 함께 회상한다.",
            "pop_copy(mapping, key)가 [꺼낸 값, 남은 복사본]을 반환하도록 완성하세요.",
            "def pop_copy(mapping, key):\n    raise NotImplementedError",
            "def pop_copy(mapping, key):\n    remaining = mapping.copy()\n    value = remaining.pop(key)\n    return [value, remaining]",
            "pop_copy", [("two", [{"a": 1, "b": 2}, "a"], [1, {"b": 2}]), ("one", [{"done": True}, "done"], [True, {}])],
        ),
    },
    13: {
        "mastery": task(
            "shipping-fee", "주문 조건으로 배송비 결정하기", "여러 조건의 우선순서를 if 문으로 표현한다.",
            "shipping_fee(total, member)가 회원 또는 5만원 이상이면 0, 3만원 이상이면 2500, 그 외 3000을 반환하도록 완성하세요.",
            "def shipping_fee(total, member):\n    raise NotImplementedError",
            "def shipping_fee(total, member):\n    if member or total >= 50000:\n        return 0\n    if total >= 30000:\n        return 2500\n    return 3000",
            "shipping_fee", [("member", [10000, True], 0), ("mid", [35000, False], 2500), ("low", [12000, False], 3000)],
        ),
        "transfer": task(
            "risk-level", "점수 구간을 위험 등급으로 바꾸기", "조건 분기를 새로운 임계값 문제에 적용한다.",
            "risk_level(score)가 80 이상 high, 50 이상 medium, 그 외 low를 반환하도록 완성하세요.",
            "def risk_level(score):\n    raise NotImplementedError",
            "def risk_level(score):\n    if score >= 80:\n        return 'high'\n    if score >= 50:\n        return 'medium'\n    return 'low'",
            "risk_level", [("high", [91], "high"), ("edge", [50], "medium"), ("low", [49], "low")],
        ),
        "retrieval": task(
            "leap-year", "윤년 조건 다시 조합하기", "and와 or가 섞인 조건 우선순위를 기억에서 복원한다.",
            "is_leap_year(year)가 윤년이면 True를 반환하도록 완성하세요.",
            "def is_leap_year(year):\n    raise NotImplementedError",
            "def is_leap_year(year):\n    return year % 400 == 0 or (year % 4 == 0 and year % 100 != 0)",
            "is_leap_year", [("four-hundred", [2000], True), ("century", [1900], False), ("ordinary", [2024], True)],
        ),
    },
    14: {
        "mastery": task(
            "sum-even", "반복해서 짝수만 합하기", "반복과 조건을 결합해 누적값을 만든다.",
            "sum_even(numbers)가 짝수만 더한 합계를 반환하도록 완성하세요.",
            "def sum_even(numbers):\n    raise NotImplementedError",
            "def sum_even(numbers):\n    total = 0\n    for number in numbers:\n        if number % 2 == 0:\n            total += number\n    return total",
            "sum_even", [("mixed", [[1, 2, 3, 4]], 6), ("none", [[1, 3, 5]], 0), ("negative", [[-2, 3, 6]], 4)],
        ),
        "transfer": task(
            "running-totals", "값이 들어올 때마다 누적 합계 남기기", "누적 루프를 시계열 진행값에 적용한다.",
            "running_totals(numbers)가 각 위치까지의 누적 합계를 목록으로 반환하도록 완성하세요.",
            "def running_totals(numbers):\n    raise NotImplementedError",
            "def running_totals(numbers):\n    total = 0\n    result = []\n    for number in numbers:\n        total += number\n        result.append(total)\n    return result",
            "running_totals", [("positive", [[2, 3, 5]], [2, 5, 10]), ("signed", [[4, -1, 2]], [4, 3, 5])],
        ),
        "retrieval": task(
            "first-match", "처음 일치하는 위치 찾기", "break 대신 즉시 return하는 탐색 루프를 회상한다.",
            "first_match(items, target)가 처음 일치하는 index를, 없으면 -1을 반환하도록 완성하세요.",
            "def first_match(items, target):\n    raise NotImplementedError",
            "def first_match(items, target):\n    for index, item in enumerate(items):\n        if item == target:\n            return index\n    return -1",
            "first_match", [("duplicate", [["a", "b", "a"], "a"], 0), ("middle", [[3, 5, 7], 5], 1), ("missing", [[1, 2], 9], -1)],
        ),
    },
    15: {
        "mastery": task(
            "clamp", "값을 허용 범위 안으로 제한하기", "매개변수와 반환값으로 재사용 가능한 함수를 만든다.",
            "clamp(value, low, high)가 범위 안 값은 그대로, 밖의 값은 가까운 경계를 반환하도록 완성하세요.",
            "def clamp(value, low, high):\n    raise NotImplementedError",
            "def clamp(value, low, high):\n    return max(low, min(value, high))",
            "clamp", [("inside", [5, 1, 10], 5), ("below", [-2, 0, 8], 0), ("above", [12, 0, 8], 8)],
        ),
        "transfer": task(
            "receipt-line", "수량과 단가로 영수증 한 줄 만들기", "함수 입력을 계산과 문자열 결과에 함께 적용한다.",
            "receipt_line(item, quantity, price)가 '품목:합계' 문자열을 반환하도록 완성하세요.",
            "def receipt_line(item, quantity, price):\n    raise NotImplementedError",
            "def receipt_line(item, quantity, price):\n    return f\"{item}:{quantity * price}\"",
            "receipt_line", [("pen", ["pen", 3, 1000], "pen:3000"), ("book", ["book", 2, 7500], "book:15000")],
        ),
        "retrieval": task(
            "rectangle", "함수로 넓이와 둘레 함께 반환하기", "여러 계산 결과를 하나의 반환 계약으로 다시 구성한다.",
            "rectangle(width, height)가 area와 perimeter를 가진 딕셔너리를 반환하도록 완성하세요.",
            "def rectangle(width, height):\n    raise NotImplementedError",
            "def rectangle(width, height):\n    return {'area': width * height, 'perimeter': 2 * (width + height)}",
            "rectangle", [("basic", [3, 4], {"area": 12, "perimeter": 14}), ("square", [5, 5], {"area": 25, "perimeter": 20})],
        ),
    },
    16: {
        "mastery": task(
            "average-values", "가변 개수 값의 평균 구하기", "*args로 전달된 값을 하나의 함수에서 처리한다.",
            "average_values(*values)가 모든 입력값의 평균을 반환하도록 완성하세요.",
            "def average_values(*values):\n    raise NotImplementedError",
            "def average_values(*values):\n    return sum(values) / len(values)",
            "average_values", [("three", [2, 4, 6], 4.0), ("two", [10, 20], 15.0)],
        ),
        "transfer": task(
            "build-profile", "선택 옵션을 프로필에 펼치기", "dict unpacking을 새 레코드 구성에 적용한다.",
            "build_profile(name, options)가 name과 options를 합친 새 딕셔너리를 반환하도록 완성하세요.",
            "def build_profile(name, options):\n    raise NotImplementedError",
            "def build_profile(name, options):\n    return {'name': name, **options}",
            "build_profile", [("city", ["Mina", {"city": "Seoul"}], {"name": "Mina", "city": "Seoul"}), ("empty", ["Jun", {}], {"name": "Jun"})],
        ),
        "retrieval": task(
            "apply-operation", "operation에 맞는 함수를 골라 적용하기", "lambda와 고차 함수 선택을 기억에서 다시 구성한다.",
            "apply_operation(values, operation)이 double 또는 square 연산 결과 목록을 반환하도록 완성하세요.",
            "def apply_operation(values, operation):\n    raise NotImplementedError",
            "def apply_operation(values, operation):\n    functions = {'double': lambda value: value * 2, 'square': lambda value: value ** 2}\n    return [functions[operation](value) for value in values]",
            "apply_operation", [("double", [[1, 3, 5], "double"], [2, 6, 10]), ("square", [[2, 4], "square"], [4, 16])],
        ),
    },
    17: {
        "mastery": task(
            "counter-values", "nonlocal 상태를 여러 번 갱신하기", "클로저가 바깥 함수의 상태를 기억하는 흐름을 확인한다.",
            "counter_values(start, step, count)가 클로저 카운터를 count번 호출한 결과 목록을 반환하도록 완성하세요.",
            "def counter_values(start, step, count):\n    raise NotImplementedError",
            "def counter_values(start, step, count):\n    current = start\n    def next_value():\n        nonlocal current\n        current += step\n        return current\n    return [next_value() for _ in range(count)]",
            "counter_values", [("positive", [10, 2, 3], [12, 14, 16]), ("negative", [5, -1, 2], [4, 3])],
        ),
        "transfer": task(
            "scaled-values", "설정값을 기억하는 변환 함수 만들기", "클로저를 데이터 변환 설정에 적용한다.",
            "scaled_values(values, factor)가 factor를 기억하는 내부 함수를 사용해 변환 목록을 반환하도록 완성하세요.",
            "def scaled_values(values, factor):\n    raise NotImplementedError",
            "def scaled_values(values, factor):\n    def scale(value):\n        return value * factor\n    return [scale(value) for value in values]",
            "scaled_values", [("triple", [[1, 2, 3], 3], [3, 6, 9]), ("half", [[4, 8], 0.5], [2.0, 4.0])],
        ),
        "retrieval": task(
            "nonlocal-total", "내부 함수로 누적 상태 다시 만들기", "nonlocal 선언과 호출 순서를 기억에서 복원한다.",
            "nonlocal_total(values)가 내부 add 함수로 값을 누적한 최종 합계를 반환하도록 완성하세요.",
            "def nonlocal_total(values):\n    raise NotImplementedError",
            "def nonlocal_total(values):\n    total = 0\n    def add(value):\n        nonlocal total\n        total += value\n    for value in values:\n        add(value)\n    return total",
            "nonlocal_total", [("positive", [[3, 4, 5]], 12), ("signed", [[10, -3]], 7)],
        ),
    },
    18: {
        "mastery": task(
            "circle-area", "표준 모듈 상수로 원 넓이 계산하기", "math 모듈을 함수 내부에서 가져와 계산한다.",
            "circle_area(radius)가 math.pi를 사용한 넓이를 소수 셋째 자리에서 반올림해 반환하도록 완성하세요.",
            "def circle_area(radius):\n    raise NotImplementedError",
            "def circle_area(radius):\n    import math\n    return round(math.pi * radius ** 2, 2)",
            "circle_area", [("one", [1], 3.14), ("two", [2], 12.57)],
        ),
        "transfer": task(
            "path-name", "경로 문자열에서 파일 이름 분리하기", "모듈의 객체를 처음 보는 경로 처리에 적용한다.",
            "path_name(path_text)가 POSIX 경로의 마지막 파일 이름을 반환하도록 완성하세요.",
            "def path_name(path_text):\n    raise NotImplementedError",
            "def path_name(path_text):\n    from pathlib import PurePosixPath\n    return PurePosixPath(path_text).name",
            "path_name", [("nested", ["reports/2026/july.csv"], "july.csv"), ("single", ["notes.txt"], "notes.txt")],
        ),
        "retrieval": task(
            "json-keys", "JSON 문자열을 모듈로 해석하기", "import와 함수 호출을 기억에서 다시 연결한다.",
            "json_keys(text)가 JSON object의 key를 정렬한 목록으로 반환하도록 완성하세요.",
            "def json_keys(text):\n    raise NotImplementedError",
            "def json_keys(text):\n    import json\n    return sorted(json.loads(text).keys())",
            "json_keys", [("two", ['{"b": 2, "a": 1}'], ["a", "b"]), ("one", ['{"name": "Codaro"}'], ["name"])],
        ),
    },
    19: {
        "mastery": task(
            "read-lines", "fixture 파일의 유효한 줄 읽기", "파일을 읽고 빈 줄과 바깥 공백을 정리한다.",
            "read_nonempty_lines(path)가 UTF-8 파일의 비어 있지 않은 줄을 공백 없이 목록으로 반환하도록 완성하세요.",
            "def read_nonempty_lines(path):\n    raise NotImplementedError",
            "def read_nonempty_lines(path):\n    from pathlib import Path\n    return [line.strip() for line in Path(path).read_text(encoding='utf-8').splitlines() if line.strip()]",
            "read_nonempty_lines", [("notes", [fixture_path("notes.txt")], ["first", "second"])],
            fixture={**FIXTURE, "files": [{"path": "notes.txt", "content": " first \n\nsecond\n"}]},
            expected_paths=[{"path": "notes.txt", "kind": "file", "origin": "fixture"}],
        ),
        "transfer": task(
            "write-uppercase", "입력 파일을 대문자 결과 파일로 쓰기", "읽기와 쓰기를 새로운 변환 작업에 적용한다.",
            "write_uppercase(source_path, output_name)가 내용을 대문자로 저장하고 저장한 문자열을 반환하도록 완성하세요.",
            "def write_uppercase(source_path, output_name):\n    raise NotImplementedError",
            "def write_uppercase(source_path, output_name):\n    from pathlib import Path\n    content = Path(source_path).read_text(encoding='utf-8').upper()\n    Path(output_name).write_text(content, encoding='utf-8')\n    return content",
            "write_uppercase", [("report", [fixture_path("source.txt"), "result.txt"], "HELLO\nCODARO\n")],
            fixture={**FIXTURE, "files": [{"path": "source.txt", "content": "hello\ncodaro\n"}]},
            expected_paths=[{"path": "source.txt", "kind": "file", "origin": "fixture"}, {"path": "result.txt", "kind": "file", "origin": "created"}],
        ),
        "retrieval": task(
            "append-log", "기존 로그 끝에 한 줄 추가하기", "파일 mode와 줄바꿈을 기억에서 다시 구성한다.",
            "append_log(path, message)가 기존 UTF-8 파일 끝에 message 한 줄을 추가하고 전체 내용을 반환하도록 완성하세요.",
            "def append_log(path, message):\n    raise NotImplementedError",
            "def append_log(path, message):\n    from pathlib import Path\n    target = Path(path)\n    with target.open('a', encoding='utf-8') as stream:\n        stream.write(message + '\\n')\n    return target.read_text(encoding='utf-8')",
            "append_log", [
                ("done", [fixture_path("activity.log"), "done"], "start\ndone\n"),
                ("first-line", [fixture_path("empty.log"), "first"], "first\n"),
            ],
            fixture={
                **FIXTURE,
                "files": [
                    {"path": "activity.log", "content": "start\n"},
                    {"path": "empty.log", "content": ""},
                ],
            },
            expected_paths=[
                {"path": "activity.log", "kind": "file", "origin": "fixture"},
                {"path": "empty.log", "kind": "file", "origin": "fixture"},
            ],
        ),
    },
    20: {
        "mastery": task(
            "positive-int", "양의 정수 입력 계약 지키기", "정상 반환과 ValueError 조건을 함께 구현한다.",
            "parse_positive_int(text)가 양의 정수를 반환하고 0 이하 또는 숫자가 아니면 ValueError를 내도록 완성하세요.",
            "def parse_positive_int(text):\n    raise NotImplementedError",
            "def parse_positive_int(text):\n    value = int(text)\n    if value <= 0:\n        raise ValueError('positive integer required')\n    return value",
            "parse_positive_int", [("valid", ["12"], 12), ("zero", ["0"], raises("ValueError")), ("invalid", ["abc"], raises("ValueError"))],
        ),
        "transfer": task(
            "safe-divide", "나눗셈 실패를 값으로 처리하기", "예외 처리를 새로운 계산 API 계약에 적용한다.",
            "safe_divide(a, b)가 정상 몫을 반환하고 0으로 나누면 None을 반환하도록 완성하세요.",
            "def safe_divide(a, b):\n    raise NotImplementedError",
            "def safe_divide(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return None",
            "safe_divide", [("normal", [10, 4], 2.5), ("zero", [10, 0], None)],
        ),
        "retrieval": task(
            "required-value", "필수 key 누락 예외 다시 만들기", "명시적 KeyError 계약을 기억에서 복원한다.",
            "required_value(mapping, key)가 값을 반환하고 key가 없으면 KeyError를 내도록 완성하세요.",
            "def required_value(mapping, key):\n    raise NotImplementedError",
            "def required_value(mapping, key):\n    if key not in mapping:\n        raise KeyError(key)\n    return mapping[key]",
            "required_value", [("present", [{"token": "ready"}, "token"], "ready"), ("missing", [{}, "token"], raises("KeyError"))],
        ),
    },
    21: {
        "mastery": task(
            "summarize-orders", "주문 목록을 한 번에 요약하기", "리스트와 딕셔너리, 조건, 합계를 결합한다.",
            "summarize_orders(orders)가 주문 수, 전체 금액, paid 주문 수를 딕셔너리로 반환하도록 완성하세요.",
            "def summarize_orders(orders):\n    raise NotImplementedError",
            "def summarize_orders(orders):\n    return {\n        'count': len(orders),\n        'total': sum(order['amount'] for order in orders),\n        'paid': sum(1 for order in orders if order['status'] == 'paid'),\n    }",
            "summarize_orders", [("mixed", [[{"amount": 1000, "status": "paid"}, {"amount": 2500, "status": "pending"}]], {"count": 2, "total": 3500, "paid": 1}), ("empty", [[]], {"count": 0, "total": 0, "paid": 0})],
        ),
        "transfer": task(
            "group-totals", "범주별 금액 합계 만들기", "반복 누적을 처음 보는 레코드 그룹화에 적용한다.",
            "group_totals(rows)가 category별 amount 합계를 딕셔너리로 반환하도록 완성하세요.",
            "def group_totals(rows):\n    raise NotImplementedError",
            "def group_totals(rows):\n    totals = {}\n    for row in rows:\n        category = row['category']\n        totals[category] = totals.get(category, 0) + row['amount']\n    return totals",
            "group_totals", [("sales", [[{"category": "book", "amount": 10}, {"category": "pen", "amount": 3}, {"category": "book", "amount": 7}]], {"book": 17, "pen": 3}), ("single", [[{"category": "file", "amount": 5}]], {"file": 5})],
        ),
        "retrieval": task(
            "normalize-records", "튜플 레코드를 정렬된 문구로 정리하기", "컬렉션 문법을 기억에서 다시 연결한다.",
            "normalize_records(records)가 (name, score)를 score 내림차순의 'name:score' 목록으로 반환하도록 완성하세요.",
            "def normalize_records(records):\n    raise NotImplementedError",
            "def normalize_records(records):\n    ordered = sorted(records, key=lambda item: item[1], reverse=True)\n    return [f\"{name}:{score}\" for name, score in ordered]",
            "normalize_records", [("scores", [[["Mina", 80], ["Jun", 95]]], ["Jun:95", "Mina:80"]), ("tie-order", [[["A", 10], ["B", 20], ["C", 15]]], ["B:20", "C:15", "A:10"])],
        ),
    },
    22: {
        "mastery": task(
            "counter-class", "상태를 가진 Counter 클래스 만들기", "생성자와 인스턴스 메서드로 상태 변화를 표현한다.",
            "Counter와 counter_after(start, steps)를 완성해 steps만큼 증가한 최종 값을 반환하세요.",
            "class Counter:\n    pass\n\ndef counter_after(start, steps):\n    raise NotImplementedError",
            "class Counter:\n    def __init__(self, value):\n        self.value = value\n\n    def increment(self):\n        self.value += 1\n\ndef counter_after(start, steps):\n    counter = Counter(start)\n    for _ in range(steps):\n        counter.increment()\n    return counter.value",
            "counter_after", [("three", [5, 3], 8), ("none", [10, 0], 10)],
        ),
        "transfer": task(
            "inventory-item", "객체로 재고 항목 합계 만들기", "클래스의 속성과 메서드를 가격 계산 문맥에 적용한다.",
            "InventoryItem과 item_summary(name, price, quantity)를 완성해 name과 total 딕셔너리를 반환하세요.",
            "class InventoryItem:\n    pass\n\ndef item_summary(name, price, quantity):\n    raise NotImplementedError",
            "class InventoryItem:\n    def __init__(self, name, price, quantity):\n        self.name = name\n        self.price = price\n        self.quantity = quantity\n\n    def total(self):\n        return self.price * self.quantity\n\ndef item_summary(name, price, quantity):\n    item = InventoryItem(name, price, quantity)\n    return {'name': item.name, 'total': item.total()}",
            "item_summary", [("pen", ["pen", 1000, 3], {"name": "pen", "total": 3000}), ("book", ["book", 7500, 2], {"name": "book", "total": 15000})],
        ),
        "retrieval": task(
            "temperature-class", "객체의 온도 변환 다시 만들기", "생성자와 계산 메서드를 기억에서 복원한다.",
            "Temperature와 fahrenheit_of(celsius)를 완성해 화씨 온도를 반환하세요.",
            "class Temperature:\n    pass\n\ndef fahrenheit_of(celsius):\n    raise NotImplementedError",
            "class Temperature:\n    def __init__(self, celsius):\n        self.celsius = celsius\n\n    def fahrenheit(self):\n        return self.celsius * 9 / 5 + 32\n\ndef fahrenheit_of(celsius):\n    return Temperature(celsius).fahrenheit()",
            "fahrenheit_of", [("freezing", [0], 32.0), ("boiling", [100], 212.0)],
        ),
    },
    23: {
        "mastery": task(
            "employee-inheritance", "상속으로 직원 설명 확장하기", "부모 초기화와 자식 속성을 함께 사용한다.",
            "Person, Employee와 employee_label(name, role)를 완성해 'name:role'을 반환하세요.",
            "class Person:\n    pass\n\nclass Employee(Person):\n    pass\n\ndef employee_label(name, role):\n    raise NotImplementedError",
            "class Person:\n    def __init__(self, name):\n        self.name = name\n\nclass Employee(Person):\n    def __init__(self, name, role):\n        super().__init__(name)\n        self.role = role\n\ndef employee_label(name, role):\n    employee = Employee(name, role)\n    return f\"{employee.name}:{employee.role}\"",
            "employee_label", [("developer", ["Mina", "developer"], "Mina:developer"), ("designer", ["Jun", "designer"], "Jun:designer")],
        ),
        "transfer": task(
            "polymorphic-sounds", "서로 다른 객체에 같은 메서드 호출하기", "다형성을 처음 보는 동물 목록 처리에 적용한다.",
            "Dog, Cat과 animal_sounds(kinds)를 완성해 각 종류의 sound 결과 목록을 반환하세요.",
            "class Dog:\n    pass\n\nclass Cat:\n    pass\n\ndef animal_sounds(kinds):\n    raise NotImplementedError",
            "class Dog:\n    def sound(self):\n        return 'woof'\n\nclass Cat:\n    def sound(self):\n        return 'meow'\n\ndef animal_sounds(kinds):\n    classes = {'dog': Dog, 'cat': Cat}\n    return [classes[kind]().sound() for kind in kinds]",
            "animal_sounds", [("mixed", [["dog", "cat", "dog"]], ["woof", "meow", "woof"]), ("cat", [["cat"]], ["meow"])],
        ),
        "retrieval": task(
            "product-classmethod", "문자열에서 객체를 만드는 classmethod 복원하기", "대체 생성자와 인스턴스 속성을 함께 회상한다.",
            "Product.from_text와 product_total(text, quantity)를 완성해 가격 합계를 반환하세요. text 형식은 name,price입니다.",
            "class Product:\n    pass\n\ndef product_total(text, quantity):\n    raise NotImplementedError",
            "class Product:\n    def __init__(self, name, price):\n        self.name = name\n        self.price = price\n\n    @classmethod\n    def from_text(cls, text):\n        name, price = text.split(',')\n        return cls(name, int(price))\n\ndef product_total(text, quantity):\n    product = Product.from_text(text)\n    return product.price * quantity",
            "product_total", [("pen", ["pen,1200", 3], 3600), ("book", ["book,8000", 2], 16000)],
        ),
    },
    24: {
        "mastery": task(
            "vector-add", "__add__로 두 벡터 더하기", "특수 메서드가 연산자 동작으로 연결되는 것을 구현한다.",
            "Vector.__add__와 vector_sum(left, right)를 완성해 합친 좌표 목록을 반환하세요.",
            "class Vector:\n    pass\n\ndef vector_sum(left, right):\n    raise NotImplementedError",
            "class Vector:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def __add__(self, other):\n        return Vector(self.x + other.x, self.y + other.y)\n\ndef vector_sum(left, right):\n    result = Vector(*left) + Vector(*right)\n    return [result.x, result.y]",
            "vector_sum", [("positive", [[1, 2], [3, 4]], [4, 6]), ("signed", [[-1, 5], [2, -3]], [1, 2])],
        ),
        "transfer": task(
            "score-order", "객체 비교로 점수 정렬하기", "__lt__를 정렬 계약에 적용한다.",
            "Score.__lt__와 sorted_scores(values)를 완성해 오름차순 숫자 목록을 반환하세요.",
            "class Score:\n    pass\n\ndef sorted_scores(values):\n    raise NotImplementedError",
            "class Score:\n    def __init__(self, value):\n        self.value = value\n\n    def __lt__(self, other):\n        return self.value < other.value\n\ndef sorted_scores(values):\n    return [score.value for score in sorted(Score(value) for value in values)]",
            "sorted_scores", [("mixed", [[30, 10, 20]], [10, 20, 30]), ("signed", [[0, -2, 5]], [-2, 0, 5])],
        ),
        "retrieval": task(
            "book-string", "__str__ 표현 다시 만들기", "객체의 사용자 표시 문자열 계약을 기억에서 복원한다.",
            "Book.__str__와 book_label(title, author)를 완성해 'title by author'를 반환하세요.",
            "class Book:\n    pass\n\ndef book_label(title, author):\n    raise NotImplementedError",
            "class Book:\n    def __init__(self, title, author):\n        self.title = title\n        self.author = author\n\n    def __str__(self):\n        return f\"{self.title} by {self.author}\"\n\ndef book_label(title, author):\n    return str(Book(title, author))",
            "book_label", [("python", ["Python", "Mina"], "Python by Mina"), ("codaro", ["Codaro", "Team"], "Codaro by Team")],
        ),
    },
    25: {
        "mastery": task(
            "temperature-property", "검증되는 celsius property 만들기", "property getter와 setter로 객체 상태 계약을 지킨다.",
            "Temperature.celsius property와 temperature_state(value)를 완성해 celsius와 fahrenheit를 반환하세요. -273.15 미만은 ValueError입니다.",
            "class Temperature:\n    pass\n\ndef temperature_state(value):\n    raise NotImplementedError",
            "class Temperature:\n    def __init__(self, celsius):\n        self.celsius = celsius\n\n    @property\n    def celsius(self):\n        return self._celsius\n\n    @celsius.setter\n    def celsius(self, value):\n        if value < -273.15:\n            raise ValueError('below absolute zero')\n        self._celsius = value\n\ndef temperature_state(value):\n    item = Temperature(value)\n    return {'celsius': item.celsius, 'fahrenheit': item.celsius * 9 / 5 + 32}",
            "temperature_state", [("zero", [0], {"celsius": 0, "fahrenheit": 32.0}), ("invalid", [-300], raises("ValueError"))],
        ),
        "transfer": task(
            "positive-decorator", "반환값을 검증하는 decorator 적용하기", "decorator를 할인 계산의 불변 조건에 적용한다.",
            "positive_result decorator와 discounted(price, amount)를 완성해 음수 결과는 ValueError, 그 외는 할인 가격을 반환하세요.",
            "def positive_result(function):\n    raise NotImplementedError\n\n@positive_result\ndef discounted(price, amount):\n    return price - amount",
            "def positive_result(function):\n    def wrapper(*args, **kwargs):\n        result = function(*args, **kwargs)\n        if result < 0:\n            raise ValueError('negative result')\n        return result\n    return wrapper\n\n@positive_result\ndef discounted(price, amount):\n    return price - amount",
            "discounted", [("valid", [100, 30], 70), ("zero", [50, 50], 0), ("invalid", [20, 30], raises("ValueError"))],
        ),
        "retrieval": task(
            "email-property", "정규화되는 email property 복원하기", "setter에서 입력을 정리하는 객체 계약을 회상한다.",
            "User.email property와 normalized_email(value)를 완성해 공백을 지운 소문자 이메일을 반환하세요.",
            "class User:\n    pass\n\ndef normalized_email(value):\n    raise NotImplementedError",
            "class User:\n    def __init__(self, email):\n        self.email = email\n\n    @property\n    def email(self):\n        return self._email\n\n    @email.setter\n    def email(self, value):\n        self._email = value.strip().lower()\n\ndef normalized_email(value):\n    return User(value).email",
            "normalized_email", [("spaces", ["  USER@Example.COM "], "user@example.com"), ("plain", ["hello@codaro.dev"], "hello@codaro.dev")],
        ),
    },
    26: {
        "mastery": task(
            "even-squares", "짝수의 제곱 딕셔너리 만들기", "조건이 있는 dict comprehension을 구현한다.",
            "even_squares(numbers)가 짝수 원본 값을 key, 제곱을 value로 가진 딕셔너리를 반환하도록 완성하세요.",
            "def even_squares(numbers):\n    raise NotImplementedError",
            "def even_squares(numbers):\n    return {number: number ** 2 for number in numbers if number % 2 == 0}",
            "even_squares", [("mixed", [[1, 2, 3, 4]], {"2": 4, "4": 16}), ("none", [[1, 3]], {})],
        ),
        "transfer": task(
            "flatten-matrix", "중첩 목록을 한 줄로 펼치기", "중첩 comprehension을 표 형태 데이터에 적용한다.",
            "flatten_matrix(matrix)가 행 순서를 유지한 단일 목록을 반환하도록 완성하세요.",
            "def flatten_matrix(matrix):\n    raise NotImplementedError",
            "def flatten_matrix(matrix):\n    return [value for row in matrix for value in row]",
            "flatten_matrix", [("two", [[[1, 2], [3, 4]]], [1, 2, 3, 4]), ("ragged", [[['a'], ['b', 'c']]], ["a", "b", "c"])],
        ),
        "retrieval": task(
            "transpose", "중첩 comprehension으로 행과 열 바꾸기", "index 순서를 기억에서 다시 구성한다.",
            "transpose(matrix)가 직사각형 matrix의 행과 열을 바꾼 목록을 반환하도록 완성하세요.",
            "def transpose(matrix):\n    raise NotImplementedError",
            "def transpose(matrix):\n    return [[row[index] for row in matrix] for index in range(len(matrix[0]))]",
            "transpose", [("rectangle", [[[1, 2, 3], [4, 5, 6]]], [[1, 4], [2, 5], [3, 6]]), ("column", [[[1], [2]]], [[1, 2]])],
        ),
    },
    27: {
        "mastery": task(
            "even-generator", "yield로 짝수 흐름 만들기", "generator를 소비한 결과가 필요한 값만 포함하게 한다.",
            "even_values(limit)가 0 이상 limit 미만의 짝수를 generator로 만들고 목록으로 반환하도록 완성하세요.",
            "def even_values(limit):\n    raise NotImplementedError",
            "def even_values(limit):\n    def generate():\n        for value in range(limit):\n            if value % 2 == 0:\n                yield value\n    return list(generate())",
            "even_values", [("six", [6], [0, 2, 4]), ("one", [1], [0])],
        ),
        "transfer": task(
            "chunk-generator", "목록을 일정 크기 묶음으로 지연 생성하기", "yield를 배치 처리 문맥에 적용한다.",
            "chunk_values(items, size)가 generator로 만든 묶음을 목록으로 반환하도록 완성하세요.",
            "def chunk_values(items, size):\n    raise NotImplementedError",
            "def chunk_values(items, size):\n    def chunks():\n        for start in range(0, len(items), size):\n            yield items[start:start + size]\n    return list(chunks())",
            "chunk_values", [("even", [[1, 2, 3, 4], 2], [[1, 2], [3, 4]]), ("remainder", [["a", "b", "c"], 2], [["a", "b"], ["c"]])],
        ),
        "retrieval": task(
            "countdown-iterator", "직접 iterator로 카운트다운 복원하기", "__iter__와 __next__ 상태 변화를 기억에서 구현한다.",
            "Countdown과 countdown_values(start)를 완성해 start부터 1까지 목록을 반환하세요.",
            "class Countdown:\n    pass\n\ndef countdown_values(start):\n    raise NotImplementedError",
            "class Countdown:\n    def __init__(self, start):\n        self.current = start\n\n    def __iter__(self):\n        return self\n\n    def __next__(self):\n        if self.current <= 0:\n            raise StopIteration\n        value = self.current\n        self.current -= 1\n        return value\n\ndef countdown_values(start):\n    return list(Countdown(start))",
            "countdown_values", [("three", [3], [3, 2, 1]), ("zero", [0], [])],
        ),
    },
    28: {
        "mastery": task(
            "head-middle-tail", "확장 언패킹으로 목록 분해하기", "첫 값, 중간 목록, 마지막 값을 한 계약으로 반환한다.",
            "split_parts(items)가 head, middle, tail을 가진 딕셔너리를 반환하도록 완성하세요.",
            "def split_parts(items):\n    raise NotImplementedError",
            "def split_parts(items):\n    head, *middle, tail = items\n    return {'head': head, 'middle': middle, 'tail': tail}",
            "split_parts", [("many", [[1, 2, 3, 4]], {"head": 1, "middle": [2, 3], "tail": 4}), ("two", [["a", "b"]], {"head": "a", "middle": [], "tail": "b"})],
        ),
        "transfer": task(
            "match-payload", "구조 패턴으로 payload 분류하기", "match/case를 처음 보는 이벤트 데이터에 적용한다.",
            "classify_payload(payload)가 kind와 필드에 따라 'text:value', 'count:value', 또는 'unknown'을 반환하도록 완성하세요.",
            "def classify_payload(payload):\n    raise NotImplementedError",
            "def classify_payload(payload):\n    match payload:\n        case {'kind': 'text', 'value': str(value)}:\n            return f\"text:{value}\"\n        case {'kind': 'count', 'value': int(value)}:\n            return f\"count:{value}\"\n        case _:\n            return 'unknown'",
            "classify_payload", [("text", [{"kind": "text", "value": "hello"}], "text:hello"), ("count", [{"kind": "count", "value": 3}], "count:3"), ("unknown", [{"kind": "other"}], "unknown")],
        ),
        "retrieval": task(
            "walrus-lengths", "계산한 길이를 조건과 결과에 재사용하기", "할당 표현식을 기억에서 다시 구성한다.",
            "long_lengths(texts, minimum)가 minimum 이상인 문자열 길이만 목록으로 반환하도록 완성하세요.",
            "def long_lengths(texts, minimum):\n    raise NotImplementedError",
            "def long_lengths(texts, minimum):\n    return [length for text in texts if (length := len(text)) >= minimum]",
            "long_lengths", [("mixed", [["a", "python", "code"], 4], [6, 4]), ("none", [["a", "bb"], 3], [])],
        ),
    },
    29: {
        "mastery": task(
            "binary-search", "정렬 목록에서 이진 탐색하기", "탐색 범위를 절반씩 줄여 index를 찾는다.",
            "binary_search(items, target)가 정렬 목록의 target index를, 없으면 -1을 반환하도록 완성하세요.",
            "def binary_search(items, target):\n    raise NotImplementedError",
            "def binary_search(items, target):\n    low, high = 0, len(items) - 1\n    while low <= high:\n        middle = (low + high) // 2\n        if items[middle] == target:\n            return middle\n        if items[middle] < target:\n            low = middle + 1\n        else:\n            high = middle - 1\n    return -1",
            "binary_search", [("found", [[1, 3, 5, 7, 9], 7], 3), ("first", [[2, 4, 6], 2], 0), ("missing", [[1, 2, 3], 8], -1)],
        ),
        "transfer": task(
            "dedupe-sorted", "정렬 목록의 연속 중복 제거하기", "이전 값 추적을 데이터 정제 알고리즘에 적용한다.",
            "dedupe_sorted(items)가 순서를 유지하며 연속 중복을 제거한 목록을 반환하도록 완성하세요.",
            "def dedupe_sorted(items):\n    raise NotImplementedError",
            "def dedupe_sorted(items):\n    result = []\n    for item in items:\n        if not result or result[-1] != item:\n            result.append(item)\n    return result",
            "dedupe_sorted", [("numbers", [[1, 1, 2, 2, 2, 3]], [1, 2, 3]), ("words", [["a", "a", "b"]], ["a", "b"])],
        ),
        "retrieval": task(
            "two-sum", "두 수의 합 index 찾기", "딕셔너리 탐색 알고리즘을 기억에서 복원한다.",
            "two_sum(numbers, target)가 합이 target인 첫 두 index를 반환하고 없으면 빈 목록을 반환하도록 완성하세요.",
            "def two_sum(numbers, target):\n    raise NotImplementedError",
            "def two_sum(numbers, target):\n    seen = {}\n    for index, number in enumerate(numbers):\n        complement = target - number\n        if complement in seen:\n            return [seen[complement], index]\n        seen[number] = index\n    return []",
            "two_sum", [("basic", [[2, 7, 11, 15], 9], [0, 1]), ("later", [[3, 2, 4], 6], [1, 2]), ("missing", [[1, 2], 8], [])],
        ),
    },
    30: {
        "mastery": task(
            "sales-report", "CSV 두 종류를 JSON 보고서로 변환하기", "파일 읽기, 숫자 변환, 집계, 산출물 저장을 하나의 capstone으로 완성한다.",
            "build_sales_report(source_path, output_name)가 CSV item,amount를 읽어 count, total, average JSON을 저장하고 같은 딕셔너리를 반환하도록 완성하세요.",
            "def build_sales_report(source_path, output_name):\n    raise NotImplementedError",
            "def build_sales_report(source_path, output_name):\n    import csv\n    import json\n    from pathlib import Path\n    with Path(source_path).open(encoding='utf-8', newline='') as stream:\n        rows = list(csv.DictReader(stream))\n    amounts = [int(row['amount']) for row in rows]\n    report = {\n        'count': len(amounts),\n        'total': sum(amounts),\n        'average': sum(amounts) / len(amounts) if amounts else 0,\n    }\n    Path(output_name).write_text(json.dumps(report, ensure_ascii=False, sort_keys=True), encoding='utf-8')\n    return report",
            "build_sales_report", [("first", [fixture_path("sales-a.csv"), "report-a.json"], {"count": 2, "total": 3500, "average": 1750.0}), ("second", [fixture_path("sales-b.csv"), "report-b.json"], {"count": 3, "total": 600, "average": 200.0})],
            fixture={**FIXTURE, "files": [{"path": "sales-a.csv", "content": "item,amount\npen,1000\nbook,2500\n"}, {"path": "sales-b.csv", "content": "item,amount\na,100\nb,200\nc,300\n"}]},
            expected_paths=[{"path": "sales-a.csv", "kind": "file", "origin": "fixture"}, {"path": "sales-b.csv", "kind": "file", "origin": "fixture"}, {"path": "report-a.json", "kind": "file", "origin": "created"}, {"path": "report-b.json", "kind": "file", "origin": "created"}],
        ),
        "transfer": task(
            "status-summary", "로그 상태를 집계해 새 요약 만들기", "capstone의 집계 흐름을 상태 레코드에 옮긴다.",
            "status_summary(rows)가 status별 개수와 전체 건수를 반환하도록 완성하세요.",
            "def status_summary(rows):\n    raise NotImplementedError",
            "def status_summary(rows):\n    counts = {}\n    for row in rows:\n        status = row['status']\n        counts[status] = counts.get(status, 0) + 1\n    return {'total': len(rows), 'statuses': counts}",
            "status_summary", [("mixed", [[{"status": "ok"}, {"status": "fail"}, {"status": "ok"}]], {"total": 3, "statuses": {"ok": 2, "fail": 1}}), ("empty", [[]], {"total": 0, "statuses": {}})],
        ),
        "retrieval": task(
            "validate-pipeline", "입력 정제와 오류 분리 다시 구성하기", "여러 기초 개념을 기억에서 결합해 파이프라인 결과를 만든다.",
            "validate_pipeline(rows)가 양의 정수 amount만 합산하고 invalid 행 수를 함께 반환하도록 완성하세요.",
            "def validate_pipeline(rows):\n    raise NotImplementedError",
            "def validate_pipeline(rows):\n    valid = []\n    invalid = 0\n    for row in rows:\n        try:\n            amount = int(row['amount'])\n            if amount <= 0:\n                raise ValueError\n            valid.append(amount)\n        except (KeyError, TypeError, ValueError):\n            invalid += 1\n    return {'valid_count': len(valid), 'total': sum(valid), 'invalid_count': invalid}",
            "validate_pipeline", [("mixed", [[{"amount": "10"}, {"amount": "bad"}, {}, {"amount": "5"}]], {"valid_count": 2, "total": 15, "invalid_count": 2}), ("nonpositive", [[{"amount": "0"}, {"amount": "-2"}]], {"valid_count": 0, "total": 0, "invalid_count": 2})],
        ),
    },
}


def stable_json(value: Any) -> str:
    if isinstance(value, list):
        return "[" + ",".join(stable_json(item) for item in value) + "]"
    if isinstance(value, dict):
        return "{" + ",".join(
            f"{json.dumps(key, ensure_ascii=False)}:{stable_json(value[key])}"
            for key in sorted(value)
        ) + "}"
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def fixture_hash(value: dict[str, Any] = FIXTURE) -> str:
    digest = hashlib.sha256(stable_json(value).encode("utf-8")).digest()
    import base64
    return "sha256-" + base64.b64encode(digest).decode("ascii")


def check_spec(lesson_id: str, mode: str, blueprint: Task) -> dict[str, Any]:
    check_id = f"python.30days.{lesson_id}.{blueprint['slug']}.{mode}.behavior.v1"
    fixture = copy.deepcopy(blueprint["fixture"])
    cases = []
    for case_id, arguments, expected in blueprint["cases"]:
        case: dict[str, Any] = {
            "id": case_id,
            "arguments": [
                {"fixturePath": str(value)} if isinstance(value, FixturePath) else {"value": value}
                for value in arguments
            ],
        }
        if isinstance(expected, ExpectedException):
            case["expectedException"] = str(expected)
        else:
            case["expectedReturn"] = expected
        cases.append(case)
    return {
        "id": check_id,
        "version": 1,
        "kind": "behavior",
        "strength": "strong",
        "executor": "browser-worker",
        "timeoutMs": 8000,
        "fixtureId": f"{check_id}.fixture",
        "fixtureHash": fixture_hash(fixture),
        "fixture": fixture,
        "packageAssets": [],
        "payload": {
            "entry": blueprint["entry"],
            "cases": cases,
            "expectedPaths": blueprint["expected_paths"],
            "normalizeReturnPaths": blueprint["normalize_return_paths"],
        },
    }


def assessment_variant(
    lesson_id: str,
    mode: str,
    blueprint: Task,
    source_ids: list[str],
) -> dict[str, Any]:
    variant_id = f"{lesson_id}-{blueprint['slug']}-{mode}"
    mode_copy = {
        "mastery": (
            "앞 예시를 복사하지 않고 여러 입력에서 같은 규칙이 성립해야 개념을 익혔다고 볼 수 있습니다.",
            "함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 여러 입력으로 다시 호출합니다.",
        ),
        "transfer": (
            "같은 문법을 처음 보는 데이터와 업무 조건에 옮겨야 실제 활용 능력을 확인할 수 있습니다.",
            "숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 앞 정답 문구가 아니라 입력과 반환 계약을 읽으세요.",
        ),
        "retrieval": (
            "시간을 두고 다시 구성해야 잠깐 본 코드를 따라 쓴 것과 장기 기억을 구분할 수 있습니다.",
            "전이 과제를 통과한 지 7일이 지나면 자동으로 열립니다. 예시 없이 함수 계약부터 복원하세요.",
        ),
    }
    why, explanation = mode_copy[mode]
    value: dict[str, Any] = {
        "id": variant_id,
        "mode": mode,
        "unseen": True,
        "claimScope": "portable-concept",
        "reviewStatus": "machine-verified-pending-independent-review",
        "sourceSectionIds": source_ids,
        "title": blueprint["title"],
        "subtitle": {"mastery": "예시 없이 핵심 규칙 완성", "transfer": "처음 보는 조건에 개념 적용", "retrieval": "7일 뒤 기억에서 재구성"}[mode],
        "goal": blueprint["goal"],
        "why": why,
        "explanation": explanation,
        "tips": [
            "함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.",
            "첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.",
        ],
        "exercise": {
            "prompt": blueprint["prompt"],
            "starterCode": LiteralString(blueprint["starter"]),
            "solution": LiteralString(blueprint["solution"]),
            "hints": [
                "반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.",
                "한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.",
            ],
        },
        "check": check_spec(lesson_id, mode, blueprint),
    }
    if mode == "retrieval":
        value["minimumDelayHours"] = 7 * 24
    return value


def assessment_for(path: Path, blueprint: dict[str, Task]) -> dict[str, Any]:
    content = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    lesson_id = str(content.get("meta", {}).get("id") or path.stem.split("_", 1)[0])
    section_ids = [
        str(section.get("id"))
        for section in content.get("sections", [])
        if isinstance(section, dict) and section.get("id")
    ]
    source_ids = ([section_ids[0], section_ids[-1]] if len(section_ids) > 1 else section_ids) or [lesson_id]
    mastery_id = f"{lesson_id}-{blueprint['mastery']['slug']}-mastery"
    transfer_id = f"{lesson_id}-{blueprint['transfer']['slug']}-transfer"
    return {
        "schemaVersion": 1,
        "performanceClaim": "브라우저의 격리된 Python Worker가 숨은 입력으로 핵심 Python 행동을 검증하고, 파일 산출물이 있는 과제는 Local 재실행 증거를 추가로 요구합니다.",
        "tierParity": {
            "web": "portable-concept",
            "local": "package-practice-and-artifact",
        },
        "supportPolicy": "첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.",
        "authoring": {
            "source": "curated-blueprint",
            "solutionVerification": "required",
            "independentReview": "pending",
        },
        "masteryVariants": [assessment_variant(lesson_id, "mastery", blueprint["mastery"], source_ids)],
        "transferVariants": [assessment_variant(lesson_id, "transfer", blueprint["transfer"], [mastery_id])],
        "retrievalVariants": [assessment_variant(lesson_id, "retrieval", blueprint["retrieval"], [transfer_id])],
    }


def validate_blueprints() -> None:
    if fixture_hash() != "sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=":
        raise RuntimeError("fixture hash no longer matches the browser stable JSON contract")
    check_ids: set[str] = set()
    for day, modes in BLUEPRINTS.items():
        for mode, blueprint in modes.items():
            compile(blueprint["starter"], f"<day{day:02}-{mode}-starter>", "exec")
            with tempfile.TemporaryDirectory(prefix=f"codaro-day{day:02}-{mode}-") as root_text:
                root = Path(root_text)
                fixture = blueprint["fixture"]
                for directory in fixture.get("directories", []):
                    (root / directory).mkdir(parents=True, exist_ok=True)
                for item in fixture.get("files", []):
                    target = root / item["path"]
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_text(item.get("content", ""), encoding="utf-8")
                previous_cwd = Path.cwd()
                previous_env = dict(os.environ)
                try:
                    os.chdir(root)
                    os.environ.update(fixture.get("env", {}))
                    namespace: dict[str, Any] = {}
                    exec(compile(blueprint["solution"], f"<day{day:02}-{mode}-solution>", "exec"), namespace, namespace)
                    entry = namespace.get(blueprint["entry"])
                    if not callable(entry):
                        raise RuntimeError(f"day {day} {mode} has no callable {blueprint['entry']}")
                    for case_id, arguments, expected in blueprint["cases"]:
                        values = [root / str(value) if isinstance(value, FixturePath) else copy.deepcopy(value) for value in arguments]
                        try:
                            returned = entry(*values)
                        except BaseException as error:
                            if isinstance(expected, ExpectedException) and type(error).__name__ == str(expected):
                                continue
                            raise RuntimeError(f"day {day} {mode} case {case_id} raised {type(error).__name__}") from error
                        if isinstance(expected, ExpectedException):
                            raise RuntimeError(f"day {day} {mode} case {case_id} did not raise {expected}")
                        if blueprint["normalize_return_paths"] and isinstance(returned, dict):
                            returned = dict(returned)
                            for key in blueprint["normalize_return_paths"]:
                                returned[key] = Path(returned[key]).resolve().relative_to(root.resolve()).as_posix()
                        actual = json.loads(json.dumps(returned, ensure_ascii=False))
                        if actual != expected:
                            raise RuntimeError(
                                f"day {day} {mode} case {case_id}: expected {expected!r}, got {actual!r}"
                            )
                    for item in blueprint["expected_paths"]:
                        target = root / item["path"]
                        actual_kind = "directory" if target.is_dir() else "file" if target.is_file() else "missing"
                        if actual_kind != item["kind"]:
                            raise RuntimeError(
                                f"day {day} {mode} path {item['path']}: expected {item['kind']}, got {actual_kind}"
                            )
                finally:
                    os.chdir(previous_cwd)
                    os.environ.clear()
                    os.environ.update(previous_env)
            check_id = check_spec(f"day{day:02}", mode, blueprint)["id"]
            if check_id in check_ids:
                raise RuntimeError(f"duplicate check id: {check_id}")
            check_ids.add(check_id)


def apply(write: bool, refresh: bool) -> list[str]:
    changed: list[str] = []
    for day, blueprint in sorted(BLUEPRINTS.items()):
        paths = list(TRACK.glob(f"day{day:02}_*.yaml"))
        if len(paths) != 1:
            raise RuntimeError(f"expected one lesson for day {day}, found {len(paths)}")
        path = paths[0]
        text = path.read_text(encoding="utf-8")
        content = yaml.safe_load(text) or {}
        expected = assessment_for(path, blueprint)
        existing = content.get("assessment")
        if existing and existing != expected and not refresh:
            raise RuntimeError(f"authored assessment drift: {path.relative_to(ROOT).as_posix()}")
        if existing == expected and not refresh:
            continue
        block = yaml.safe_dump(
            readable_yaml({"assessment": expected}),
            allow_unicode=True,
            default_flow_style=False,
            sort_keys=False,
            width=120,
        )
        changed.append(path.relative_to(ROOT).as_posix())
        if write:
            marker = "\nassessment:\n"
            prefix = text.split(marker, 1)[0] if refresh and marker in text else text.rstrip()
            path.write_text(prefix.rstrip() + "\n" + block, encoding="utf-8", newline="\n")
    return changed


def main() -> int:
    parser = argparse.ArgumentParser(description="Add strong assessment progression to Python 30 Days lessons")
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--refresh", action="store_true")
    args = parser.parse_args()
    validate_blueprints()
    changed = apply(args.write, args.refresh)
    action = "updated" if args.write else "would update"
    print(f"{action}: {len(changed)} lesson(s)")
    for path in changed:
        print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
