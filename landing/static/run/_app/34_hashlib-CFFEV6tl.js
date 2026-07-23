var e=`meta:
  id: '34'
  title: hashlib와 secrets
  day: 34
  category: builtins
  tags:
  - hashlib
  - sha256
  - secrets
  - hmac
  - 보안
  - 무결성
  seo:
    title: 파이썬 hashlib와 secrets 표준 라이브러리 - 해시·안전 난수
    description: SHA-256 청크 해시, hmac으로 메시지 무결성, secrets로 토큰 발급, hashlib.pbkdf2_hmac으로 비밀번호 파생.
    keywords:
    - hashlib
    - sha256
    - secrets
    - hmac
    - pbkdf2
intro:
  emoji: 🔐
  points:
  - hashlib.sha256으로 작은 데이터 한 번에 해시
  - 큰 파일을 청크로 읽어 안전하게 해시
  - secrets로 안전한 토큰과 난수 발급
  - hmac으로 키 기반 무결성 검증
  - pbkdf2_hmac으로 비밀번호 키 파생
  direction: hashlib와 secrets에서 보안과 무결성을 다루는 표준 흐름을 코드로 확인하고 흔한 함정(랜덤 vs 안전 랜덤)을 식별합니다.
  benefits:
  - 파일/문자열 해시로 변경 감지와 캐시 키를 만들 수 있습니다.
  - random이 아닌 secrets로 토큰을 발급해야 하는 이유를 이해합니다.
  - hmac으로 메시지가 변조되지 않았는지 검증합니다.
  diagram:
    steps:
    - label: 입력 분류 입력 확인
      detail: 데이터가 작은 한 줄인지 큰 파일인지 먼저 판단합니다.
    - label: 해시/난수 처리 실행
      detail: hashlib 객체에 update로 누적하거나 secrets로 안전 토큰을 만듭니다.
    - label: 결과 검증
      detail: 같은 입력은 같은 해시, 다른 입력은 다른 해시인지 확인합니다.
    - label: 보안 패턴 재사용
      detail: 검증된 호출 흐름을 인증/캐시/무결성 코드에 그대로 붙입니다.
    runtime:
    - label: 표준 라이브러리 환경
      detail: hashlib, secrets, hmac만 사용해 추가 패키지 없이 실행합니다.
    - label: 해시/난수 실행
      detail: 셀을 실행해 해시 출력과 토큰 길이를 확인합니다.
    - label: 보안 패턴 완료
      detail: 검증된 코드를 무결성 검증 유틸리티로 남깁니다.
sections:
- id: hash-small
  title: 작은 데이터 해시 한 번에
  structuredPrimary: true
  subtitle: hashlib.sha256().hexdigest()
  goal: 문자열을 바이트로 인코딩해 SHA-256 16진수 해시를 한 줄로 얻는 흐름을 확인합니다.
  why: 데이터 변경 감지, 캐시 키, 콘텐츠 주소 같은 곳에서 가장 자주 쓰는 해시 패턴입니다. 같은 입력은 항상 같은 출력이 보장됩니다.
  explanation: hashlib.sha256(data).hexdigest()는 바이트를 받아 64자 16진수 문자열을 돌려줍니다. 문자열은 .encode("utf-8")로 바이트로 만든 뒤 넘깁니다. 같은 데이터는 운영체제와 Python 버전에 상관없이 같은 해시를 만듭니다.
  tips:
  - 문자열 인코딩을 명시하지 않으면 한글이 깨질 수 있습니다. 항상 utf-8을 명시하세요.
  - 보안 비교는 == 대신 hmac.compare_digest를 쓰는 편이 타이밍 공격에 안전합니다.
  snippet: |-
    import hashlib

    payloadOne = "hello codaro".encode("utf-8")
    payloadTwo = "hello codaro".encode("utf-8")
    payloadThree = "hello world".encode("utf-8")

    digestOne = hashlib.sha256(payloadOne).hexdigest()
    digestTwo = hashlib.sha256(payloadTwo).hexdigest()
    digestThree = hashlib.sha256(payloadThree).hexdigest()

    {"sameInputMatches": digestOne == digestTwo, "differentInputDiffers": digestOne != digestThree, "length": len(digestOne)}
  exercise:
    prompt: 같은 문자열에 대해 sha256과 sha512 해시를 만들고 길이가 각각 64자와 128자인지 확인하세요.
    starterCode: |-
      import hashlib

      payload = "secret message".encode("utf-8")
      digest256 = hashlib.sha256(payload).hexdigest()
      digest512 = hashlib.sha512(payload).hexdigest()

      {"sha256Length": len(digest256), "sha512Length": len(digest512)}
    hints:
    - sha256은 32바이트, hex는 두 글자 = 한 바이트라 64자입니다.
    - sha512는 64바이트라 128자가 됩니다.
  check:
    type: noError
    noError: hashlib 호출이 NameError나 TypeError 없이 실행되어야 합니다.
    resultCheck: sha256Length가 64이고 sha512Length가 128이어야 두 해시의 출력 크기가 맞는 것입니다.
- id: hash-streaming
  title: 청크로 큰 파일 해시
  structuredPrimary: true
  subtitle: update 누적 + 메모리 친화
  goal: open(..., "rb") + iter로 청크 단위로 읽어 큰 파일의 해시를 메모리 부담 없이 계산합니다.
  why: 큰 파일을 한 번에 메모리에 올리면 OS 한계나 OOM 사고가 납니다. 해시는 update로 누적 가능하므로 청크로 처리해도 결과가 같습니다.
  explanation: hashlib.sha256() 객체를 만들고 update(chunk)를 반복 호출한 뒤 hexdigest()로 마칩니다. iter(callable, sentinel) 패턴으로 read(N)을 빈 바이트가 올 때까지 반복합니다. 청크 크기는 8KB-1MB 사이가 일반적입니다.
  tips:
  - 청크 크기는 시스템 페이지 크기 배수가 효율적입니다.
  - 같은 파일의 해시는 청크로 계산하든 한 번에 계산하든 동일합니다.
  snippet: |-
    import hashlib
    import tempfile
    from pathlib import Path

    def fileHash(path, chunkSize=8192):
        digest = hashlib.sha256()
        with open(path, "rb") as handle:
            for chunk in iter(lambda: handle.read(chunkSize), b""):
                digest.update(chunk)
        return digest.hexdigest()

    with tempfile.TemporaryDirectory() as workspace:
        target = Path(workspace) / "data.bin"
        target.write_bytes(b"x" * 50_000)
        chunkedDigest = fileHash(target)
        directDigest = hashlib.sha256(target.read_bytes()).hexdigest()

    {"chunkedDigest": chunkedDigest, "matchesDirect": chunkedDigest == directDigest}
  exercise:
    prompt: 두 동일 내용 파일과 한 다른 파일을 만들어 fileHash로 비교하고 동일한 내용은 같은 해시, 다른 내용은 다른 해시인지 검증하세요.
    starterCode: |-
      import hashlib
      import tempfile
      from pathlib import Path

      def fileHash(path, chunkSize=4096):
          digest = hashlib.sha256()
          with open(path, "rb") as handle:
              for chunk in iter(lambda: handle.read(chunkSize), b""):
                  digest.update(chunk)
          return digest.hexdigest()

      with tempfile.TemporaryDirectory() as workspace:
          root = Path(workspace)
          (root / "a.bin").write_bytes(b"same content" * 100)
          (root / "b.bin").write_bytes(b"same content" * 100)
          (root / "c.bin").write_bytes(b"different content" * 100)
          aHash = fileHash(root / "a.bin")
          bHash = fileHash(root / "b.bin")
          cHash = fileHash(root / "c.bin")

      {"aEqualsB": aHash == bHash, "aEqualsC": aHash == cHash}
    hints:
    - 같은 바이트 시퀀스는 항상 같은 해시를 만듭니다.
    - 한 글자만 달라도 해시는 완전히 달라집니다.
  check:
    type: noError
    noError: 파일 생성과 fileHash 호출이 NameError나 FileNotFoundError 없이 실행되어야 합니다.
    resultCheck: aEqualsB가 True이고 aEqualsC가 False여야 해시가 무결성 검사로 동작하는 것입니다.
- id: secrets-tokens
  title: secrets로 안전한 토큰
  structuredPrimary: true
  subtitle: random과의 차이
  goal: secrets.token_urlsafe / token_hex / token_bytes로 보안 토큰을 발급하고 random과의 차이를 이해합니다.
  why: random 모듈은 통계적 난수입니다. 시드를 얻으면 결과가 재현됩니다. 보안 용도(세션 토큰, CSRF, 비밀번호 재설정 링크)에는 OS 엔트로피를 사용하는 secrets가 표준입니다.
  explanation: secrets.token_urlsafe(n)은 URL-safe Base64로 n 바이트 엔트로피를 인코딩해 돌려줍니다. token_hex(n)는 16진수, token_bytes(n)은 원시 바이트입니다. secrets.choice는 시퀀스에서 안전하게 무작위 선택합니다.
  tips:
  - 보안 용도에는 random이 아닌 secrets를 사용하세요.
  - 토큰 길이는 권장 16바이트 이상(token_urlsafe(16) = 128비트 엔트로피).
  snippet: |-
    import secrets

    urlsafeToken = secrets.token_urlsafe(16)
    hexToken = secrets.token_hex(16)
    bytesToken = secrets.token_bytes(16)
    randomChoice = secrets.choice(["alice", "bob", "carol"])

    {
        "urlsafeLength": len(urlsafeToken),
        "hexLength": len(hexToken),
        "bytesLength": len(bytesToken),
        "choiceInList": randomChoice in {"alice", "bob", "carol"},
    }
  exercise:
    prompt: secrets.token_urlsafe(32)와 token_urlsafe(64)의 길이를 비교하고, 두 번 연속 호출했을 때 다른 값이 나오는지 확인하세요.
    starterCode: |-
      import secrets

      first = secrets.token_urlsafe(32)
      second = secrets.token_urlsafe(32)
      longer = secrets.token_urlsafe(64)

      {
          "firstLength": len(first),
          "longerLength": len(longer),
          "firstDiffersFromSecond": first != second,
      }
    hints:
    - token_urlsafe(n)은 약 n * 4 / 3 자 길이의 base64-url 문자열을 돌려줍니다.
    - 매 호출마다 다른 토큰이 나옵니다.
  check:
    type: noError
    noError: secrets 호출이 NameError 없이 실행되어야 합니다.
    resultCheck: firstLength가 longerLength보다 작고 firstDiffersFromSecond가 True여야 합니다.
- id: hmac-verify
  title: hmac으로 메시지 무결성 검증
  structuredPrimary: true
  subtitle: 공유 키 기반 서명
  goal: hmac.new로 메시지에 서명을 만들고 hmac.compare_digest로 안전하게 비교합니다.
  why: 발신자와 수신자가 공유 키를 가지면 메시지가 중간에서 변조되지 않았음을 hmac으로 검증할 수 있습니다. 단순 해시는 누구나 다시 계산 가능하지만 hmac은 키 없이는 불가능합니다.
  explanation: hmac.new(key, message, digestmod="sha256").hexdigest()로 서명을 만듭니다. 검증 측은 같은 키로 다시 계산하고 hmac.compare_digest로 비교합니다. == 비교 대신 compare_digest를 쓰는 이유는 타이밍 공격 방어입니다.
  tips:
  - 키는 OS 환경변수나 비밀 저장소에서 가져오고 코드에 박지 마세요.
  - compare_digest는 두 시퀀스 길이가 다르면 즉시 False를 돌려줍니다(불일치 노출 없음).
  snippet: |-
    import hmac

    key = b"shared-secret-key"
    message = "transfer:100".encode("utf-8")

    signature = hmac.new(key, message, digestmod="sha256").hexdigest()
    recomputed = hmac.new(key, message, digestmod="sha256").hexdigest()
    tampered = hmac.new(key, "transfer:1000".encode("utf-8"), digestmod="sha256").hexdigest()

    {
        "matches": hmac.compare_digest(signature, recomputed),
        "tamperedDetected": not hmac.compare_digest(signature, tampered),
        "signatureLength": len(signature),
    }
  exercise:
    prompt: 잘못된 키(wrong-key)로 서명을 다시 만들고 원래 서명과 compare_digest가 False를 돌려주는지 확인하세요.
    starterCode: |-
      import hmac

      goodKey = b"correct-secret"
      badKey = b"wrong-secret"
      message = "withdraw:50".encode("utf-8")

      goodSignature = hmac.new(goodKey, message, digestmod="sha256").hexdigest()
      badSignature = hmac.new(badKey, message, digestmod="sha256").hexdigest()

      {
          "keysMatch": hmac.compare_digest(goodSignature, badSignature),
          "signaturesDiffer": goodSignature != badSignature,
      }
    hints:
    - 키가 다르면 서명이 완전히 달라집니다.
    - compare_digest는 일치 시 True, 불일치 시 False입니다.
  check:
    type: noError
    noError: hmac 호출이 NameError 없이 실행되어야 합니다.
    resultCheck: keysMatch가 False이고 signaturesDiffer가 True여야 키가 다른 서명이 검출된 것입니다.
- id: password-kdf
  title: pbkdf2_hmac으로 비밀번호 키 파생
  structuredPrimary: true
  subtitle: 비밀번호를 그대로 저장하지 않기
  goal: hashlib.pbkdf2_hmac으로 비밀번호와 salt를 받아 안전한 키를 파생하는 흐름을 확인합니다.
  why: 비밀번호를 평문으로 저장하면 유출 시 즉시 사용 가능합니다. 단순 sha256은 빠르고 무지개표가 통합니다. pbkdf2 같은 KDF는 의도적으로 느리게 만들어 무차별 공격을 비싸게 만듭니다.
  explanation: 'pbkdf2_hmac("sha256", password_bytes, salt_bytes, iterations)는 반복 횟수만큼 해시를 누적해 키를 파생합니다. iterations는 보통 100_000 이상이 권장됩니다. salt는 사용자마다 다른 무작위 바이트로 secrets.token_bytes(16)로 만듭니다.'
  tips:
  - iterations는 시간이 갈수록 늘려야 합니다(연산력 증가 대응).
  - 비밀번호 검증 시에도 같은 salt와 iterations로 다시 파생해 compare_digest로 비교합니다.
  snippet: |-
    import hashlib
    import secrets

    def deriveKey(password, salt, iterations=120_000):
        return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)

    salt = secrets.token_bytes(16)
    keyOriginal = deriveKey("strong-password", salt)
    keyRecomputed = deriveKey("strong-password", salt)
    keyWithDifferentSalt = deriveKey("strong-password", secrets.token_bytes(16))

    {
        "sameKeySamePassword": keyOriginal == keyRecomputed,
        "differentSaltDiffersKey": keyOriginal != keyWithDifferentSalt,
        "keyLength": len(keyOriginal),
    }
  exercise:
    prompt: 같은 비밀번호와 salt에 대해 iterations만 100_000과 200_000로 다르게 호출하면 파생 키가 달라지는지 확인하세요.
    starterCode: |-
      import hashlib

      password = "p@ssw0rd".encode("utf-8")
      salt = b"fixed-salt-bytes"

      keyFastIterations = hashlib.pbkdf2_hmac("sha256", password, salt, 100_000)
      keyMoreIterations = hashlib.pbkdf2_hmac("sha256", password, salt, 200_000)

      {
          "iterationsAffectKey": keyFastIterations != keyMoreIterations,
          "lengthSame": len(keyFastIterations) == len(keyMoreIterations),
      }
    hints:
    - iterations가 다르면 누적 해시 결과가 달라져 키도 달라집니다.
    - 출력 키 길이는 알고리즘에 따라 고정입니다(sha256 = 32바이트).
  check:
    type: noError
    noError: pbkdf2_hmac 호출이 NameError나 TypeError 없이 실행되어야 합니다.
    resultCheck: iterationsAffectKey가 True이고 lengthSame이 True여야 KDF가 iterations에 민감한 것입니다.
assessment:
  masteryVariants:
  - id: 34_hashlib-chunked-digest-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - hash-small
    - hash-streaming
    title: 작은 조각들을 update로 누적해 같은 SHA-256 만들기
    subtitle: chunked hashing
    goal: 문자열 chunk 목록을 sha256.update로 누적하고 한 번에 해시한 값과 같은지 반환한다.
    why: hashlib 숙달은 hexdigest를 외우는 것이 아니라, 큰 데이터도 chunk로 누적해 같은 무결성 값을 만들 수 있음을 아는 것입니다.
    explanation: digest_text_chunks(chunks)를 완성해 각 chunk를 utf-8로 encode해 update하고 digest, digestLength, matchesDirect를 반환하세요.
    tips:
    - chunk 순서가 바뀌면 digest도 바뀝니다.
    - hexdigest는 SHA-256 기준 64자입니다.
    exercise:
      prompt: digest_text_chunks(chunks)를 완성해 chunk 누적 digest와 direct digest 비교 결과를 반환하세요.
      starterCode: |-
        def digest_text_chunks(chunks):
            raise NotImplementedError
      solution: |-
        def digest_text_chunks(chunks):
            import hashlib

            if not chunks:
                raise ValueError("chunks required")

            digest = hashlib.sha256()
            for chunk in chunks:
                digest.update(str(chunk).encode("utf-8"))
            chunked = digest.hexdigest()
            direct = hashlib.sha256("".join(str(chunk) for chunk in chunks).encode("utf-8")).hexdigest()
            return {
                "digest": chunked,
                "digestLength": len(chunked),
                "matchesDirect": chunked == direct,
                "chunkCount": len(chunks),
            }
      hints:
      - hashlib.sha256() 객체는 update를 여러 번 호출할 수 있습니다.
      - 직접 해시와 chunked 해시가 같아야 합니다.
    check:
      id: python.builtins.hashlib.chunked-digest.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.hashlib.empty.behavior.v1.fixture
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
        entry: digest_text_chunks
        cases:
        - id: matches-direct-sha256-for-text-chunks
          arguments:
          - value:
            - co
            - da
            - ro
          expectedReturn:
            digest: 7804ccd8a4fd4f1dd8dc6cf273a437a2c1c5f596b77598a5fb3b73d9345b93fd
            digestLength: 64
            matchesDirect: true
            chunkCount: 3
        - id: rejects-empty-chunk-list
          arguments:
          - value: []
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 34_hashlib-hmac-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - hmac-verify
    - hash-small
    title: 공유 키 HMAC 서명을 재계산해 메시지 변조 판정하기
    subtitle: keyed integrity check
    goal: key, message, provided_signature을 받아 HMAC-SHA256을 재계산하고 compare_digest 결과를 반환한다.
    why: 전이 과제에서는 단순 해시에서 키 기반 무결성 검증으로 옮깁니다. 메시지만 같아도 키가 없으면 올바른 서명을 만들 수 없습니다.
    explanation: verify_hmac_signature(key_text, message_text, provided_signature)를 완성해 expectedSignature, valid, signatureLength를 반환하세요.
    tips:
    - 비교에는 == 대신 hmac.compare_digest를 사용하세요.
    - key와 message는 utf-8 bytes로 바꿔 hmac.new에 넣으세요.
    exercise:
      prompt: verify_hmac_signature(key_text, message_text, provided_signature)를 완성해 HMAC 검증 결과를 반환하세요.
      starterCode: |-
        def verify_hmac_signature(key_text, message_text, provided_signature):
            raise NotImplementedError
      solution: |-
        def verify_hmac_signature(key_text, message_text, provided_signature):
            import hmac

            if not key_text:
                raise ValueError("key required")
            expected = hmac.new(
                key_text.encode("utf-8"),
                message_text.encode("utf-8"),
                digestmod="sha256",
            ).hexdigest()
            return {
                "expectedSignature": expected,
                "valid": hmac.compare_digest(expected, provided_signature),
                "signatureLength": len(expected),
            }
      hints:
      - 같은 key와 message만 같은 HMAC을 만듭니다.
      - provided_signature이 틀리면 valid는 False여야 합니다.
    check:
      id: python.builtins.hashlib.hmac.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.hashlib.empty.behavior.v1.fixture
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
        entry: verify_hmac_signature
        cases:
        - id: accepts-matching-shared-key-signature
          arguments:
          - value: shared-secret
          - value: transfer:100
          - value: e86747ef59cc0db2bc1004cee9a819fee6f2fae9d2749a1e15cf9ea51ebf40cf
          expectedReturn:
            expectedSignature: e86747ef59cc0db2bc1004cee9a819fee6f2fae9d2749a1e15cf9ea51ebf40cf
            valid: true
            signatureLength: 64
        - id: rejects-empty-key
          arguments:
          - value: ""
          - value: transfer:100
          - value: e86747ef59cc0db2bc1004cee9a819fee6f2fae9d2749a1e15cf9ea51ebf40cf
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 34_hashlib-tool-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - secrets-tokens
    - hmac-verify
    - password-kdf
    title: 보안 목적별 hashlib, hmac, secrets 도구 선택 회상하기
    subtitle: choose the right primitive
    goal: session-token, cache-key, signed-message, password-storage 목적에 맞는 표준 라이브러리 도구와 이유를 반환한다.
    why: 시간이 지나도 남아야 할 감각은 아무 해시나 쓰는 것이 아니라, 토큰은 secrets, 캐시 키는 hashlib, 서명 검증은 HMAC, 비밀번호는 KDF라는 구분입니다.
    explanation: choose_security_primitive(purpose)를 완성해 목적별 tool, deterministic 여부, secretRequired 여부를 반환하세요.
    tips:
    - session token은 예측 불가능해야 하므로 secrets가 맞습니다.
    - password storage는 빠른 sha256이 아니라 pbkdf2_hmac 같은 KDF가 필요합니다.
    exercise:
      prompt: choose_security_primitive(purpose)를 완성해 보안 목적별 올바른 표준 라이브러리 도구를 반환하세요.
      starterCode: |-
        def choose_security_primitive(purpose):
            raise NotImplementedError
      solution: |-
        def choose_security_primitive(purpose):
            choices = {
                "session-token": {
                    "tool": "secrets.token_urlsafe",
                    "deterministic": False,
                    "secretRequired": False,
                    "reason": "unpredictable token",
                },
                "cache-key": {
                    "tool": "hashlib.sha256",
                    "deterministic": True,
                    "secretRequired": False,
                    "reason": "same content needs same digest",
                },
                "signed-message": {
                    "tool": "hmac.compare_digest",
                    "deterministic": True,
                    "secretRequired": True,
                    "reason": "verify keyed integrity",
                },
                "password-storage": {
                    "tool": "hashlib.pbkdf2_hmac",
                    "deterministic": True,
                    "secretRequired": True,
                    "reason": "slow password key derivation with salt",
                },
            }
            if purpose not in choices:
                raise ValueError("unknown security purpose")
            return choices[purpose]
      hints:
      - random은 보안 토큰 목적의 답이 아닙니다.
      - HMAC은 공유 secret key가 있어야 의미가 있습니다.
    check:
      id: python.builtins.hashlib.tool-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.hashlib.empty.behavior.v1.fixture
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
        entry: choose_security_primitive
        cases:
        - id: selects-secrets-for-session-token
          arguments:
          - value: session-token
          expectedReturn:
            tool: secrets.token_urlsafe
            deterministic: false
            secretRequired: false
            reason: unpredictable token
        - id: selects-kdf-for-password-storage
          arguments:
          - value: password-storage
          expectedReturn:
            tool: hashlib.pbkdf2_hmac
            deterministic: true
            secretRequired: true
            reason: slow password key derivation with salt
        - id: rejects-unknown-purpose
          arguments:
          - value: random-report-id
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};