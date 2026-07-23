var e=`meta:
  id: '27'
  title: 문자열 알고리즘
  day: 27
  category: advancedPython
  tags:
  - 문자열
  - 알고리즘
  - 패턴매칭
  - KMP
  - Trie
  - 검증
  - 검색엔진
  seo:
    title: 파이썬 문자열 알고리즘
    description: KMP, Rabin-Karp, Trie 등 문자열 알고리즘 학습
    keywords:
    - 문자열
    - 패턴매칭
    - KMP
    - Trie
intro:
  emoji: 🔤
  points:
  - 패턴 매칭 알고리즘
  - 문자열 검색 최적화
  - Trie 자료구조
  - 문자열 처리 기법
  direction: 문자열 알고리즘에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.
  benefits:
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.
  - 문자열 알고리즘 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 브루트 포스 매칭 입력 확인
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.
    - label: KMP 알고리즘 처리 실행
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.
    - label: RabinKarp 알고리즘 결과 검증
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.
    - label: 문자열 알고리즘 재사용
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 고급 설계 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 문자열 알고리즘 실행
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.
    - label: 문자열 알고리즘 완료
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.
sections:
- id: brute_force
  title: 브루트 포스 매칭
  structuredPrimary: true
  subtitle: 기본 문자열 패턴 매칭
  goal: 브루트 포스 매칭에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: 가장 단순한 방법은 모든 위치에서 패턴을 비교하는 것입니다. O(nm) 시간복잡도.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def bfSearch(text, pattern):
        textLen = len(text)
        patLen = len(pattern)
        positions = []
        for i in range(textLen - patLen + 1):
            match = True
            for j in range(patLen):
                if text[i + j] != pattern[j]:
                    match = False
                    break
            if match:
                positions.append(i)
        return positions

    bfText = "AABAACAADAABAAABAA"
    bfPattern = "AABA"
    bfResult = bfSearch(bfText, bfPattern)
    bfResult
  exercise:
    prompt: 브루트 포스 매칭 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def bfSearch(text, pattern):
          textLen = len(text)
          patLen = len(pattern)
          positions = []
          for i in range(textLen - patLen + 1):
              match = True
              for j in range(patLen):
                  if text[i + j] != pattern[j]:
                      match = False
                      break
              if match:
                  positions.append(i)
          return positions

      bfText = "AABAACAADAABAAABAA"
      bfPattern = "AABA"
      bfResult = bfSearch(bfText, bfPattern)
      bfResult
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 브루트 포스 매칭의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 브루트 포스 매칭 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: kmp
  title: KMP 알고리즘
  structuredPrimary: true
  subtitle: O(n+m) 패턴 매칭
  goal: KMP 알고리즘에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: 실패 함수(LPS)를 이용해 불필요한 비교를 건너뜁니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def computeLps(pattern):
        patLen = len(pattern)
        lps = [0] * patLen
        length = 0
        i = 1
        while i < patLen:
            if pattern[i] == pattern[length]:
                length += 1
                lps[i] = length
                i += 1
            else:
                if length != 0:
                    length = lps[length - 1]
                else:
                    lps[i] = 0
                    i += 1
        return lps

    lpsPattern = "AABAACAAB"
    lpsResult = computeLps(lpsPattern)
    lpsResult
  exercise:
    prompt: KMP 알고리즘 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def computeLps(pattern):
          patLen = len(pattern)
          lps = [0] * patLen
          length = 0
          i = 1
          while i < patLen:
              if pattern[i] == pattern[length]:
                  length += 1
                  lps[i] = length
                  i += 1
              else:
                  if length != 0:
                      length = lps[length - 1]
                  else:
                      lps[i] = 0
                      i += 1
          return lps

      lpsPattern = "AABAACAAB"
      lpsResult = computeLps(lpsPattern)
      lpsResult
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: KMP 알고리즘의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: KMP 알고리즘 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: rabin_karp
  title: Rabin-Karp 알고리즘
  structuredPrimary: true
  subtitle: 해시 기반 패턴 매칭
  goal: RabinKarp 알고리즘에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: 롤링 해시로 O(n+m) 평균 시간복잡도. 다중 패턴 검색에 유리.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def rabinKarp(text, pattern, prime=101):
        textLen = len(text)
        patLen = len(pattern)
        base = 256
        patHash = textHash = 0
        h = 1
        positions = []
        for i in range(patLen - 1):
            h = (h * base) % prime
        for i in range(patLen):
            patHash = (base * patHash + ord(pattern[i])) % prime
            textHash = (base * textHash + ord(text[i])) % prime
        for i in range(textLen - patLen + 1):
            if patHash == textHash:
                if text[i:i + patLen] == pattern:
                    positions.append(i)
            if i < textLen - patLen:
                textHash = (base * (textHash - ord(text[i]) * h) + ord(text[i + patLen])) % prime
                if textHash < 0:
                    textHash += prime
        return positions

    rkText = "GEEKS FOR GEEKS"
    rkPattern = "GEEK"
    rkResult = rabinKarp(rkText, rkPattern)
    rkResult
  exercise:
    prompt: RabinKarp 알고리즘 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def rabinKarp(text, pattern, prime=101):
          textLen = len(text)
          patLen = len(pattern)
          base = 256
          patHash = textHash = 0
          h = 1
          positions = []
          for i in range(patLen - 1):
              h = (h * base) % prime
          for i in range(patLen):
              patHash = (base * patHash + ord(pattern[i])) % prime
              textHash = (base * textHash + ord(text[i])) % prime
          for i in range(textLen - patLen + 1):
              if patHash == textHash:
                  if text[i:i + patLen] == pattern:
                      positions.append(i)
              if i < textLen - patLen:
                  textHash = (base * (textHash - ord(text[i]) * h) + ord(text[i + patLen])) % prime
                  if textHash < 0:
                      textHash += prime
          return positions

      rkText = "GEEKS FOR GEEKS"
      rkPattern = "GEEK"
      rkResult = rabinKarp(rkText, rkPattern)
      rkResult
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: RabinKarp 알고리즘의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: RabinKarp 알고리즘 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: trie
  title: Trie 자료구조
  structuredPrimary: true
  subtitle: 접두사 트리
  goal: Trie 자료구조에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: 문자열 삽입/검색 O(m). 자동완성, 사전 검색에 활용.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class TrieNode:
        def __init__(self):
            self.children = {}
            self.isEnd = False

    class Trie:
        def __init__(self):
            self.root = TrieNode()

        def insert(self, word):
            node = self.root
            for char in word:
                if char not in node.children:
                    node.children[char] = TrieNode()
                node = node.children[char]
            node.isEnd = True

        def search(self, word):
            node = self.root
            for char in word:
                if char not in node.children:
                    return False
                node = node.children[char]
            return node.isEnd

        def startsWith(self, prefix):
            node = self.root
            for char in prefix:
                if char not in node.children:
                    return False
                node = node.children[char]
            return True

    trie = Trie()
    trieWords = ["apple", "app", "banana"]
    for w in trieWords:
        trie.insert(w)
    trieSearch = trie.search("app")
    triePrefix = trie.startsWith("ban")
    trieMiss = trie.search("ap")
    trieResult = (trieSearch, triePrefix, trieMiss)
    trieResult
  exercise:
    prompt: Trie 자료구조 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class TrieNode:
          def __init__(self):
              self.children = {}
              self.isEnd = False

      class Trie:
          def __init__(self):
              self.root = TrieNode()

          def insert(self, word):
              node = self.root
              for char in word:
                  if char not in node.children:
                      node.children[char] = TrieNode()
                  node = node.children[char]
              node.isEnd = True

          def search(self, word):
              node = self.root
              for char in word:
                  if char not in node.children:
                      return False
                  node = node.children[char]
              return node.isEnd

          def startsWith(self, prefix):
              node = self.root
              for char in prefix:
                  if char not in node.children:
                      return False
                  node = node.children[char]
              return True

      trie = Trie()
      trieWords = ["apple", "app", "banana"]
      for w in trieWords:
          trie.insert(w)
      trieSearch = trie.search("app")
      triePrefix = trie.startsWith("ban")
      trieMiss = trie.search("ap")
      trieResult = (trieSearch, triePrefix, trieMiss)
      trieResult
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: Trie 자료구조의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: Trie 자료구조 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: string_processing
  title: 문자열 처리
  structuredPrimary: true
  subtitle: 실용적인 문자열 알고리즘
  goal: 문자열 처리에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: 공통 접두사, 팰린드롬 등 자주 사용되는 문자열 처리 기법.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def longestCommonPrefix(strs):
        if not strs:
            return ""
        shortest = min(strs, key=len)
        for i, char in enumerate(shortest):
            for s in strs:
                if s[i] != char:
                    return shortest[:i]
        return shortest

    lcpStrs = ["flower", "flow", "flight"]
    lcpResult = longestCommonPrefix(lcpStrs)
    lcpResult
  exercise:
    prompt: 문자열 처리 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def longestCommonPrefix(strs):
          if not strs:
              return ""
          shortest = min(strs, key=len)
          for i, char in enumerate(shortest):
              for s in strs:
                  if s[i] != char:
                      return shortest[:i]
          return shortest

      lcpStrs = ["flower", "flow", "flight"]
      lcpResult = longestCommonPrefix(lcpStrs)
      lcpResult
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 문자열 처리의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 문자열 처리 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: workflow_validation
  title: '현업 흐름 검증: 로그 패턴 검색과 SKU 자동완성'
  structuredPrimary: true
  subtitle: KMP와 Trie를 실제 검색 문제에 적용하고 결과를 검증합니다
  goal: '현업 흐름 검증: 로그 패턴 검색과 SKU 자동완성에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    문자열 알고리즘은 검색, 자동완성, 로그 분석처럼 실제 텍스트 업무에서 바로 쓰입니다. 패턴이 어디서 발견되는지와 접두어 검색 결과가 맞는지 작은 데이터로 먼저 확인하세요.

    변주 실험
    검색어를 소문자로 정규화하는 단계를 추가하고, 사용자가 \`a-1\`을 입력해도 같은 추천이 나오는지 테스트하세요.
  tips:
  - 변주 실험 검색어를 소문자로 정규화하는 단계를 추가하고, 사용자가 \`a-1\`을 입력해도 같은 추천이 나오는지 테스트하세요.
  snippet: |-
    def buildLps(pattern):
        if not pattern:
            raise ValueError("pattern must not be empty")
        lps = [0] * len(pattern)
        length = 0
        index = 1
        while index < len(pattern):
            if pattern[index] == pattern[length]:
                length += 1
                lps[index] = length
                index += 1
            elif length:
                length = lps[length - 1]
            else:
                index += 1
        return lps

    def kmpSearch(text, pattern):
        lps = buildLps(pattern)
        matches = []
        textIndex = patternIndex = 0
        while textIndex < len(text):
            if text[textIndex] == pattern[patternIndex]:
                textIndex += 1
                patternIndex += 1
                if patternIndex == len(pattern):
                    matches.append(textIndex - patternIndex)
                    patternIndex = lps[patternIndex - 1]
            elif patternIndex:
                patternIndex = lps[patternIndex - 1]
            else:
                textIndex += 1
        return matches

    logText = "payment failed; retry ok; payment failed again"

    assert kmpSearch(logText, "payment failed") == [0, 26]
    assert buildLps("ababaca") == [0, 0, 1, 2, 3, 0, 1]
  exercise:
    prompt: '현업 흐름 검증: 로그 패턴 검색과 SKU 자동완성 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'
    starterCode: |-
      def buildLps(pattern):
          if not pattern:
              raise ValueError("pattern must not be empty")
          lps = [0] * len(pattern)
          length = 0
          index = 1
          while index < len(pattern):
              if pattern[index] == pattern[length]:
                  length += 1
                  lps[index] = length
                  index += 1
              elif length:
                  length = lps[length - 1]
              else:
                  index += 1
          return lps

      def kmpSearch(text, pattern):
          lps = buildLps(pattern)
          matches = []
          textIndex = patternIndex = 0
          while textIndex < len(text):
              if text[textIndex] == pattern[patternIndex]:
                  textIndex += 1
                  patternIndex += 1
                  if patternIndex == len(pattern):
                      matches.append(textIndex - patternIndex)
                      patternIndex = lps[patternIndex - 1]
              elif patternIndex:
                  patternIndex = lps[patternIndex - 1]
              else:
                  textIndex += 1
          return matches

      logText = "payment failed; retry ok; payment failed again"

      assert kmpSearch(logText, "payment failed") == [0, 26]
      assert buildLps("ababaca") == [0, 0, 1, 2, 3, 0, 1]
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: '현업 흐름 검증: 로그 패턴 검색과 SKU 자동완성의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.'
    resultCheck: '현업 흐름 검증: 로그 패턴 검색과 SKU 자동완성 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'
- id: practice
  title: 종합 연습
  structuredPrimary: true
  subtitle: 문자열 알고리즘 실습
  goal: 종합 연습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: Day 27에서 배운 문자열 알고리즘을 난이도별로 복습합니다. KMP, 라빈-카프, 보이어-무어는 효율적인 패턴 매칭의 기초이며, 트라이는 문자열 검색과 자동완성에
    필수입니다. 접미사 배열과 LCP 배열은 대용량 텍스트 처리의 핵심 자료구조입니다. 🟢 기본 문제로 애너그램, 회문 등 기초 문자열 처리를 익히고, 🟡 응용 문제로 패턴 매칭
    알고리즘을 직접 구현해봅니다. 🔴 심화 문제에서는 트라이 기반 자동완성, 접미사 배열을 활용한 최장 공통 부분 문자열 등을 구현합니다. 문자열 알고리즘은 검색 엔진, 에디터,
    컴파일러의 핵심입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def areAnagrams(s1, s2):
        return sorted(s1.lower()) == sorted(s2.lower())

    ex1A = "listen"
    ex1B = "silent"
    ex1Result = areAnagrams(ex1A, ex1B)
    ex1Result
  exercise:
    prompt: 종합 연습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def areAnagrams(s1, s2):
          return sorted(s1.lower()) == sorted(s2.lower())

      ex1A = "listen"
      ex1B = "silent"
      ex1Result = areAnagrams(ex1A, ex1B)
      ex1Result
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 종합 연습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 연습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 27_string_algorithms-kmp-search-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - brute_force
    - kmp
    - workflow_validation
    title: KMP로 겹치는 문자열 패턴 위치 찾기
    subtitle: kmp overlapping matches
    goal: find_pattern_positions(text, pattern)를 완성해 KMP LPS 배열과 겹치는 매칭 위치를 반환한다.
    why: 문자열 검색은 단순 find 호출보다, 실패했을 때 어디부터 다시 비교할지 아는 것이 성능과 정확도를 좌우합니다.
    explanation: pattern이 비어 있으면 ValueError로 거부하고, KMP로 모든 시작 인덱스와 lps 배열을 반환하세요.
    tips:
    - LPS는 pattern의 접두사와 접미사가 얼마나 겹치는지 저장합니다.
    - 매칭 뒤 patternIndex를 lps의 이전 값으로 돌리면 겹치는 매칭도 찾을 수 있습니다.
    exercise:
      prompt: find_pattern_positions(text, pattern)를 완성해 matches와 lps를 반환하세요.
      starterCode: |-
        def find_pattern_positions(text, pattern):
            raise NotImplementedError
      solution: |-
        def find_pattern_positions(text, pattern):
            if not pattern:
                raise ValueError("pattern must not be empty")

            lps = [0] * len(pattern)
            length = 0
            index = 1
            while index < len(pattern):
                if pattern[index] == pattern[length]:
                    length += 1
                    lps[index] = length
                    index += 1
                elif length:
                    length = lps[length - 1]
                else:
                    index += 1

            matches = []
            text_index = 0
            pattern_index = 0
            while text_index < len(text):
                if text[text_index] == pattern[pattern_index]:
                    text_index += 1
                    pattern_index += 1
                    if pattern_index == len(pattern):
                        matches.append(text_index - pattern_index)
                        pattern_index = lps[pattern_index - 1]
                elif pattern_index:
                    pattern_index = lps[pattern_index - 1]
                else:
                    text_index += 1
            return {"matches": matches, "lps": lps}
      hints:
      - pattern_index가 0보다 클 때 mismatch가 나면 lps로 되돌아갑니다.
      - 빈 pattern을 허용하면 pattern[0] 접근에서 의미 없는 오류가 납니다.
    check:
      id: python.advanced.string-algorithms.kmp-search.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.string-algorithms.empty.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: find_pattern_positions
        cases:
        - id: finds-overlapping-patterns
          arguments:
          - value: banana
          - value: ana
          expectedReturn:
            matches:
            - 1
            - 3
            lps:
            - 0
            - 0
            - 1
        - id: rejects-empty-pattern
          arguments:
          - value: abc
          - value: ''
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 27_string_algorithms-sku-autocomplete-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - trie
    - string_processing
    - workflow_validation
    title: SKU 목록을 prefix 자동완성으로 찾기
    subtitle: trie autocomplete transfer
    goal: autocomplete_skus(skus, prefix, limit)를 완성해 prefix와 일치하는 SKU를 정렬된 제한 개수로 반환한다.
    why: KMP 검색에서 배운 문자열 사고를 자동완성으로 옮기면, 전체 텍스트 매칭과 prefix 탐색의 차이를 판단할 수 있습니다.
    explanation: Trie를 구성해 prefix가 있는 위치까지 이동한 뒤 하위 단어를 수집하세요. prefix가 없으면 빈 suggestions를 반환합니다.
    tips:
    - 끝나는 단어에는 terminal 표시를 둬야 prefix 자체가 SKU일 때도 찾을 수 있습니다.
    - 결과를 정렬하고 limit으로 자르면 입력 순서와 무관하게 안정됩니다.
    exercise:
      prompt: autocomplete_skus(skus, prefix, limit)를 완성해 suggestions, count, prefix를 반환하세요.
      starterCode: |-
        def autocomplete_skus(skus, prefix, limit):
            raise NotImplementedError
      solution: |-
        def autocomplete_skus(skus, prefix, limit):
            if limit < 0:
                raise ValueError("limit must be non-negative")
            root = {}
            terminal = "_terminal"
            for sku in skus:
                node = root
                for char in sku:
                    node = node.setdefault(char, {})
                node[terminal] = sku

            node = root
            for char in prefix:
                if char not in node:
                    return {"prefix": prefix, "suggestions": [], "count": 0}
                node = node[char]

            suggestions = []

            def collect(current):
                if terminal in current:
                    suggestions.append(current[terminal])
                for char in sorted(key for key in current if key != terminal):
                    collect(current[char])

            collect(node)
            suggestions = suggestions[:limit]
            return {"prefix": prefix, "suggestions": suggestions, "count": len(suggestions)}
      hints:
      - Trie node는 dict로 충분히 표현할 수 있습니다.
      - limit이 0이면 suggestions도 빈 리스트여야 합니다.
    check:
      id: python.advanced.string-algorithms.sku-autocomplete.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.string-algorithms.empty.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: autocomplete_skus
        cases:
        - id: returns-prefix-matches-in-sorted-order
          arguments:
          - value:
            - SKU-200
            - ABC-1
            - SKU-100
            - SKU-101
          - value: SKU-1
          - value: 5
          expectedReturn:
            prefix: SKU-1
            suggestions:
            - SKU-100
            - SKU-101
            count: 2
        - id: rejects-negative-limit
          arguments:
          - value: []
          - value: SKU
          - value: -1
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 27_string_algorithms-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 27_string_algorithms-sku-autocomplete-transfer
    title: 문자열 알고리즘 선택 기준 회상하기
    subtitle: string algorithm recall
    goal: choose_string_algorithm(need)를 완성해 상황별 알고리즘과 전제 조건을 반환한다.
    why: 문자열 알고리즘은 외워서 구현하는 목록이 아니라, 패턴 길이, 반복 검색, prefix 탐색, 해시 충돌 같은 조건을 보고 선택하는 도구입니다.
    explanation: one-off-small-search, repeated-pattern-search, many-pattern-hash, prefix-autocomplete, normalize-and-compare
      상황별 선택을 반환하세요.
    tips:
    - KMP는 같은 pattern으로 긴 text를 안정적으로 검색할 때 좋습니다.
    - Trie는 prefix 공유가 많은 사전형 데이터에 잘 맞습니다.
    exercise:
      prompt: choose_string_algorithm(need)를 완성해 algorithm, useWhen, caution을 반환하세요.
      starterCode: |-
        def choose_string_algorithm(need):
            raise NotImplementedError
      solution: |-
        def choose_string_algorithm(need):
            table = {
                "one-off-small-search": {
                    "algorithm": "brute-force-or-in",
                    "useWhen": "text is small and clarity matters most",
                    "caution": "growth can become expensive",
                },
                "repeated-pattern-search": {
                    "algorithm": "kmp",
                    "useWhen": "a pattern should be searched without backing up text",
                    "caution": "lps construction must handle overlaps",
                },
                "many-pattern-hash": {
                    "algorithm": "rabin-karp",
                    "useWhen": "rolling hashes can compare many windows",
                    "caution": "hash collisions require verification",
                },
                "prefix-autocomplete": {
                    "algorithm": "trie",
                    "useWhen": "many words share prefixes",
                    "caution": "memory use grows with characters stored",
                },
                "normalize-and-compare": {
                    "algorithm": "string-processing",
                    "useWhen": "case, spacing, or punctuation must be standardized",
                    "caution": "normalization rules must be explicit",
                },
            }
            if need not in table:
                raise ValueError("unknown string need")
            return table[need]
      hints:
      - prefix 문제와 substring 문제를 먼저 구분하세요.
      - 해시 기반 검색은 충돌 가능성을 검증해야 합니다.
    check:
      id: python.advanced.string-algorithms.choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.string-algorithms.empty.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: choose_string_algorithm
        cases:
        - id: recalls-kmp-for-repeated-search
          arguments:
          - value: repeated-pattern-search
          expectedReturn:
            algorithm: kmp
            useWhen: a pattern should be searched without backing up text
            caution: lps construction must handle overlaps
        - id: recalls-trie-for-autocomplete
          arguments:
          - value: prefix-autocomplete
          expectedReturn:
            algorithm: trie
            useWhen: many words share prefixes
            caution: memory use grows with characters stored
        - id: rejects-unknown-need
          arguments:
          - value: search-everything
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  schemaVersion: 1
  performanceClaim: 브라우저의 격리된 Python Worker가 숨은 입력으로 핵심 행동과 데이터 계약을 검증하고, 외부 package·파일 artifact가 필요한 실행은 lesson Run 및 Local
    evidence로 분리합니다.
  tierParity:
    web: portable-concept
    local: package-practice-and-artifact
  supportPolicy: 첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.
  authoring:
    source: curated-existing-assessment
    solutionVerification: required
    independentReview: pending
`;export{e as default};