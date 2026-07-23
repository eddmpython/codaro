var e=`meta:\r
  id: '27'\r
  title: 문자열 알고리즘\r
  day: 27\r
  category: advancedPython\r
  tags:\r
  - 문자열\r
  - 알고리즘\r
  - 패턴매칭\r
  - KMP\r
  - Trie\r
  - 검증\r
  - 검색엔진\r
  seo:\r
    title: 파이썬 문자열 알고리즘\r
    description: KMP, Rabin-Karp, Trie 등 문자열 알고리즘 학습\r
    keywords:\r
    - 문자열\r
    - 패턴매칭\r
    - KMP\r
    - Trie\r
intro:\r
  emoji: 🔤\r
  points:\r
  - 패턴 매칭 알고리즘\r
  - 문자열 검색 최적화\r
  - Trie 자료구조\r
  - 문자열 처리 기법\r
  direction: 문자열 알고리즘에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.\r
  benefits:\r
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.\r
  - 문자열 알고리즘 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 브루트 포스 매칭 입력 확인\r
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.\r
    - label: KMP 알고리즘 처리 실행\r
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.\r
    - label: RabinKarp 알고리즘 결과 검증\r
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.\r
    - label: 문자열 알고리즘 재사용\r
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 고급 설계 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 문자열 알고리즘 실행\r
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.\r
    - label: 문자열 알고리즘 완료\r
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.\r
sections:\r
- id: brute_force\r
  title: 브루트 포스 매칭\r
  structuredPrimary: true\r
  subtitle: 기본 문자열 패턴 매칭\r
  goal: 브루트 포스 매칭에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: 가장 단순한 방법은 모든 위치에서 패턴을 비교하는 것입니다. O(nm) 시간복잡도.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def bfSearch(text, pattern):\r
        textLen = len(text)\r
        patLen = len(pattern)\r
        positions = []\r
        for i in range(textLen - patLen + 1):\r
            match = True\r
            for j in range(patLen):\r
                if text[i + j] != pattern[j]:\r
                    match = False\r
                    break\r
            if match:\r
                positions.append(i)\r
        return positions\r
\r
    bfText = "AABAACAADAABAAABAA"\r
    bfPattern = "AABA"\r
    bfResult = bfSearch(bfText, bfPattern)\r
    bfResult\r
  exercise:\r
    prompt: 브루트 포스 매칭 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def bfSearch(text, pattern):\r
          textLen = len(text)\r
          patLen = len(pattern)\r
          positions = []\r
          for i in range(textLen - patLen + 1):\r
              match = True\r
              for j in range(patLen):\r
                  if text[i + j] != pattern[j]:\r
                      match = False\r
                      break\r
              if match:\r
                  positions.append(i)\r
          return positions\r
\r
      bfText = "AABAACAADAABAAABAA"\r
      bfPattern = "AABA"\r
      bfResult = bfSearch(bfText, bfPattern)\r
      bfResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 브루트 포스 매칭의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 브루트 포스 매칭 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: kmp\r
  title: KMP 알고리즘\r
  structuredPrimary: true\r
  subtitle: O(n+m) 패턴 매칭\r
  goal: KMP 알고리즘에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: 실패 함수(LPS)를 이용해 불필요한 비교를 건너뜁니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def computeLps(pattern):\r
        patLen = len(pattern)\r
        lps = [0] * patLen\r
        length = 0\r
        i = 1\r
        while i < patLen:\r
            if pattern[i] == pattern[length]:\r
                length += 1\r
                lps[i] = length\r
                i += 1\r
            else:\r
                if length != 0:\r
                    length = lps[length - 1]\r
                else:\r
                    lps[i] = 0\r
                    i += 1\r
        return lps\r
\r
    lpsPattern = "AABAACAAB"\r
    lpsResult = computeLps(lpsPattern)\r
    lpsResult\r
  exercise:\r
    prompt: KMP 알고리즘 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def computeLps(pattern):\r
          patLen = len(pattern)\r
          lps = [0] * patLen\r
          length = 0\r
          i = 1\r
          while i < patLen:\r
              if pattern[i] == pattern[length]:\r
                  length += 1\r
                  lps[i] = length\r
                  i += 1\r
              else:\r
                  if length != 0:\r
                      length = lps[length - 1]\r
                  else:\r
                      lps[i] = 0\r
                      i += 1\r
          return lps\r
\r
      lpsPattern = "AABAACAAB"\r
      lpsResult = computeLps(lpsPattern)\r
      lpsResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: KMP 알고리즘의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: KMP 알고리즘 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: rabin_karp\r
  title: Rabin-Karp 알고리즘\r
  structuredPrimary: true\r
  subtitle: 해시 기반 패턴 매칭\r
  goal: RabinKarp 알고리즘에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: 롤링 해시로 O(n+m) 평균 시간복잡도. 다중 패턴 검색에 유리.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def rabinKarp(text, pattern, prime=101):\r
        textLen = len(text)\r
        patLen = len(pattern)\r
        base = 256\r
        patHash = textHash = 0\r
        h = 1\r
        positions = []\r
        for i in range(patLen - 1):\r
            h = (h * base) % prime\r
        for i in range(patLen):\r
            patHash = (base * patHash + ord(pattern[i])) % prime\r
            textHash = (base * textHash + ord(text[i])) % prime\r
        for i in range(textLen - patLen + 1):\r
            if patHash == textHash:\r
                if text[i:i + patLen] == pattern:\r
                    positions.append(i)\r
            if i < textLen - patLen:\r
                textHash = (base * (textHash - ord(text[i]) * h) + ord(text[i + patLen])) % prime\r
                if textHash < 0:\r
                    textHash += prime\r
        return positions\r
\r
    rkText = "GEEKS FOR GEEKS"\r
    rkPattern = "GEEK"\r
    rkResult = rabinKarp(rkText, rkPattern)\r
    rkResult\r
  exercise:\r
    prompt: RabinKarp 알고리즘 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def rabinKarp(text, pattern, prime=101):\r
          textLen = len(text)\r
          patLen = len(pattern)\r
          base = 256\r
          patHash = textHash = 0\r
          h = 1\r
          positions = []\r
          for i in range(patLen - 1):\r
              h = (h * base) % prime\r
          for i in range(patLen):\r
              patHash = (base * patHash + ord(pattern[i])) % prime\r
              textHash = (base * textHash + ord(text[i])) % prime\r
          for i in range(textLen - patLen + 1):\r
              if patHash == textHash:\r
                  if text[i:i + patLen] == pattern:\r
                      positions.append(i)\r
              if i < textLen - patLen:\r
                  textHash = (base * (textHash - ord(text[i]) * h) + ord(text[i + patLen])) % prime\r
                  if textHash < 0:\r
                      textHash += prime\r
          return positions\r
\r
      rkText = "GEEKS FOR GEEKS"\r
      rkPattern = "GEEK"\r
      rkResult = rabinKarp(rkText, rkPattern)\r
      rkResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: RabinKarp 알고리즘의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: RabinKarp 알고리즘 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: trie\r
  title: Trie 자료구조\r
  structuredPrimary: true\r
  subtitle: 접두사 트리\r
  goal: Trie 자료구조에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 문자열 삽입/검색 O(m). 자동완성, 사전 검색에 활용.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class TrieNode:\r
        def __init__(self):\r
            self.children = {}\r
            self.isEnd = False\r
\r
    class Trie:\r
        def __init__(self):\r
            self.root = TrieNode()\r
\r
        def insert(self, word):\r
            node = self.root\r
            for char in word:\r
                if char not in node.children:\r
                    node.children[char] = TrieNode()\r
                node = node.children[char]\r
            node.isEnd = True\r
\r
        def search(self, word):\r
            node = self.root\r
            for char in word:\r
                if char not in node.children:\r
                    return False\r
                node = node.children[char]\r
            return node.isEnd\r
\r
        def startsWith(self, prefix):\r
            node = self.root\r
            for char in prefix:\r
                if char not in node.children:\r
                    return False\r
                node = node.children[char]\r
            return True\r
\r
    trie = Trie()\r
    trieWords = ["apple", "app", "banana"]\r
    for w in trieWords:\r
        trie.insert(w)\r
    trieSearch = trie.search("app")\r
    triePrefix = trie.startsWith("ban")\r
    trieMiss = trie.search("ap")\r
    trieResult = (trieSearch, triePrefix, trieMiss)\r
    trieResult\r
  exercise:\r
    prompt: Trie 자료구조 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class TrieNode:\r
          def __init__(self):\r
              self.children = {}\r
              self.isEnd = False\r
\r
      class Trie:\r
          def __init__(self):\r
              self.root = TrieNode()\r
\r
          def insert(self, word):\r
              node = self.root\r
              for char in word:\r
                  if char not in node.children:\r
                      node.children[char] = TrieNode()\r
                  node = node.children[char]\r
              node.isEnd = True\r
\r
          def search(self, word):\r
              node = self.root\r
              for char in word:\r
                  if char not in node.children:\r
                      return False\r
                  node = node.children[char]\r
              return node.isEnd\r
\r
          def startsWith(self, prefix):\r
              node = self.root\r
              for char in prefix:\r
                  if char not in node.children:\r
                      return False\r
                  node = node.children[char]\r
              return True\r
\r
      trie = Trie()\r
      trieWords = ["apple", "app", "banana"]\r
      for w in trieWords:\r
          trie.insert(w)\r
      trieSearch = trie.search("app")\r
      triePrefix = trie.startsWith("ban")\r
      trieMiss = trie.search("ap")\r
      trieResult = (trieSearch, triePrefix, trieMiss)\r
      trieResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: Trie 자료구조의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: Trie 자료구조 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: string_processing\r
  title: 문자열 처리\r
  structuredPrimary: true\r
  subtitle: 실용적인 문자열 알고리즘\r
  goal: 문자열 처리에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 공통 접두사, 팰린드롬 등 자주 사용되는 문자열 처리 기법.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def longestCommonPrefix(strs):\r
        if not strs:\r
            return ""\r
        shortest = min(strs, key=len)\r
        for i, char in enumerate(shortest):\r
            for s in strs:\r
                if s[i] != char:\r
                    return shortest[:i]\r
        return shortest\r
\r
    lcpStrs = ["flower", "flow", "flight"]\r
    lcpResult = longestCommonPrefix(lcpStrs)\r
    lcpResult\r
  exercise:\r
    prompt: 문자열 처리 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def longestCommonPrefix(strs):\r
          if not strs:\r
              return ""\r
          shortest = min(strs, key=len)\r
          for i, char in enumerate(shortest):\r
              for s in strs:\r
                  if s[i] != char:\r
                      return shortest[:i]\r
          return shortest\r
\r
      lcpStrs = ["flower", "flow", "flight"]\r
      lcpResult = longestCommonPrefix(lcpStrs)\r
      lcpResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 문자열 처리의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 문자열 처리 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 로그 패턴 검색과 SKU 자동완성'\r
  structuredPrimary: true\r
  subtitle: KMP와 Trie를 실제 검색 문제에 적용하고 결과를 검증합니다\r
  goal: '현업 흐름 검증: 로그 패턴 검색과 SKU 자동완성에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    문자열 알고리즘은 검색, 자동완성, 로그 분석처럼 실제 텍스트 업무에서 바로 쓰입니다. 패턴이 어디서 발견되는지와 접두어 검색 결과가 맞는지 작은 데이터로 먼저 확인하세요.\r
\r
    변주 실험\r
    검색어를 소문자로 정규화하는 단계를 추가하고, 사용자가 \`a-1\`을 입력해도 같은 추천이 나오는지 테스트하세요.\r
  tips:\r
  - 변주 실험 검색어를 소문자로 정규화하는 단계를 추가하고, 사용자가 \`a-1\`을 입력해도 같은 추천이 나오는지 테스트하세요.\r
  snippet: |-\r
    def buildLps(pattern):\r
        if not pattern:\r
            raise ValueError("pattern must not be empty")\r
        lps = [0] * len(pattern)\r
        length = 0\r
        index = 1\r
        while index < len(pattern):\r
            if pattern[index] == pattern[length]:\r
                length += 1\r
                lps[index] = length\r
                index += 1\r
            elif length:\r
                length = lps[length - 1]\r
            else:\r
                index += 1\r
        return lps\r
\r
    def kmpSearch(text, pattern):\r
        lps = buildLps(pattern)\r
        matches = []\r
        textIndex = patternIndex = 0\r
        while textIndex < len(text):\r
            if text[textIndex] == pattern[patternIndex]:\r
                textIndex += 1\r
                patternIndex += 1\r
                if patternIndex == len(pattern):\r
                    matches.append(textIndex - patternIndex)\r
                    patternIndex = lps[patternIndex - 1]\r
            elif patternIndex:\r
                patternIndex = lps[patternIndex - 1]\r
            else:\r
                textIndex += 1\r
        return matches\r
\r
    logText = "payment failed; retry ok; payment failed again"\r
\r
    assert kmpSearch(logText, "payment failed") == [0, 26]\r
    assert buildLps("ababaca") == [0, 0, 1, 2, 3, 0, 1]\r
  exercise:\r
    prompt: '현업 흐름 검증: 로그 패턴 검색과 SKU 자동완성 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      def buildLps(pattern):\r
          if not pattern:\r
              raise ValueError("pattern must not be empty")\r
          lps = [0] * len(pattern)\r
          length = 0\r
          index = 1\r
          while index < len(pattern):\r
              if pattern[index] == pattern[length]:\r
                  length += 1\r
                  lps[index] = length\r
                  index += 1\r
              elif length:\r
                  length = lps[length - 1]\r
              else:\r
                  index += 1\r
          return lps\r
\r
      def kmpSearch(text, pattern):\r
          lps = buildLps(pattern)\r
          matches = []\r
          textIndex = patternIndex = 0\r
          while textIndex < len(text):\r
              if text[textIndex] == pattern[patternIndex]:\r
                  textIndex += 1\r
                  patternIndex += 1\r
                  if patternIndex == len(pattern):\r
                      matches.append(textIndex - patternIndex)\r
                      patternIndex = lps[patternIndex - 1]\r
              elif patternIndex:\r
                  patternIndex = lps[patternIndex - 1]\r
              else:\r
                  textIndex += 1\r
          return matches\r
\r
      logText = "payment failed; retry ok; payment failed again"\r
\r
      assert kmpSearch(logText, "payment failed") == [0, 26]\r
      assert buildLps("ababaca") == [0, 0, 1, 2, 3, 0, 1]\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 로그 패턴 검색과 SKU 자동완성의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.'\r
    resultCheck: '현업 흐름 검증: 로그 패턴 검색과 SKU 자동완성 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: 종합 연습\r
  structuredPrimary: true\r
  subtitle: 문자열 알고리즘 실습\r
  goal: 종합 연습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: Day 27에서 배운 문자열 알고리즘을 난이도별로 복습합니다. KMP, 라빈-카프, 보이어-무어는 효율적인 패턴 매칭의 기초이며, 트라이는 문자열 검색과 자동완성에\r
    필수입니다. 접미사 배열과 LCP 배열은 대용량 텍스트 처리의 핵심 자료구조입니다. 🟢 기본 문제로 애너그램, 회문 등 기초 문자열 처리를 익히고, 🟡 응용 문제로 패턴 매칭\r
    알고리즘을 직접 구현해봅니다. 🔴 심화 문제에서는 트라이 기반 자동완성, 접미사 배열을 활용한 최장 공통 부분 문자열 등을 구현합니다. 문자열 알고리즘은 검색 엔진, 에디터,\r
    컴파일러의 핵심입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def areAnagrams(s1, s2):\r
        return sorted(s1.lower()) == sorted(s2.lower())\r
\r
    ex1A = "listen"\r
    ex1B = "silent"\r
    ex1Result = areAnagrams(ex1A, ex1B)\r
    ex1Result\r
  exercise:\r
    prompt: 종합 연습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def areAnagrams(s1, s2):\r
          return sorted(s1.lower()) == sorted(s2.lower())\r
\r
      ex1A = "listen"\r
      ex1B = "silent"\r
      ex1Result = areAnagrams(ex1A, ex1B)\r
      ex1Result\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:
    type: noError
    noError: 종합 연습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 연습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 27_string_algorithms-kmp-search-mastery
    mode: mastery
    unseen: false
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
          - value: ""
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
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
  retrievalVariants:
  - id: 27_string_algorithms-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - brute_force
    - kmp
    - rabin_karp
    - trie
    - string_processing
    title: 문자열 알고리즘 선택 기준 회상하기
    subtitle: string algorithm recall
    goal: choose_string_algorithm(need)를 완성해 상황별 알고리즘과 전제 조건을 반환한다.
    why: 문자열 알고리즘은 외워서 구현하는 목록이 아니라, 패턴 길이, 반복 검색, prefix 탐색, 해시 충돌 같은 조건을 보고 선택하는 도구입니다.
    explanation: one-off-small-search, repeated-pattern-search, many-pattern-hash, prefix-autocomplete, normalize-and-compare 상황별 선택을 반환하세요.
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
    minimumDelayHours: 24
`;export{e as default};