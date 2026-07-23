var e=`meta:
  id: 24_argparse
  title: argparse - 명령줄 인자 파싱
  category: builtins
  tags:
  - argparse
  - CLI
  - 명령줄
  - argument
  - parser
  description: 명령줄 인터페이스를 위한 argparse 모듈
  keywords:
  - argparse
  - CLI
  - 명령줄
  - argument
  - parser
intro:
  emoji: 🖥️
  points:
  - 명령줄 인자 파싱
  - 타입 변환과 검증
  - 도움말 자동 생성
  - 서브커맨드 지원
  direction: argparse 명령줄 인자 파싱에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.
  - argparse 명령줄 인자 파싱 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 모듈 임포트 입력 확인
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.
    - label: 위치 인자 처리 실행
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.
    - label: 옵션 인자 결과 검증
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.
    - label: argparse 명령줄 인자 재사용
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 표준 라이브러리 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: argparse 명령줄 인자 실행
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.
    - label: argparse 명령줄 인자 완료
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.
sections:
- id: module_import
  title: 모듈 임포트
  structuredPrimary: true
  subtitle: argparse 시작하기
  goal: 모듈 임포트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    argparse는 파이썬 표준 라이브러리입니다. 명령줄 인터페이스를 쉽게 만들 수 있습니다.

    Codaro 로컬 Python 환경에서는 parse_args()에 직접 인자 리스트를 전달합니다. 실제 CLI 프로그램에서는 sys.argv에서 자동으로 읽어옵니다.
  snippet: |-
    import argparse

    parser = argparse.ArgumentParser(description='간단한 파서')
    parser.add_argument('name', help='이름 입력')

    args = parser.parse_args(['홍길동'])
    args.name
  exercise:
    prompt: 모듈 임포트 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      import argparse

      parser = argparse.ArgumentParser(description='간단한 파서')
      parser.add_argument('name', help='이름 입력')

      args = parser.parse_args(['홍길동'])
      args.name
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: 모듈 임포트에서 \`parser\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 모듈 임포트 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: positional_args
  title: 위치 인자
  structuredPrimary: true
  subtitle: 필수 인자 정의
  goal: 위치 인자에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    위치 인자는 순서대로 입력되어야 하는 필수 인자입니다.

    type 파라미터로 int, float, str 등을 지정하면 자동으로 타입 변환을 수행하고, 변환 실패 시 에러 메시지를 출력합니다.
  snippet: |-
    import argparse

    simpleParser = argparse.ArgumentParser()
    simpleParser.add_argument('filename', help='파일명')

    simpleArgs = simpleParser.parse_args(['data.txt'])
    simpleArgs.filename
  exercise:
    prompt: 위치 인자 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      import argparse

      simpleParser = argparse.ArgumentParser()
      simpleParser.add_argument('filename', help='파일명')

      simpleArgs = simpleParser.parse_args(['data.txt'])
      simpleArgs.filename
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: 위치 인자에서 \`simpleParser\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 위치 인자 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: optional_args
  title: 옵션 인자
  structuredPrimary: true
  subtitle: 선택적 플래그와 옵션
  goal: 옵션 인자에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    옵션 인자는 --나 -로 시작하는 선택적 인자입니다.

    store_true는 플래그가 있으면 True, store_false는 False, count는 플래그 개수를 세어줍니다.
  snippet: |-
    import argparse

    optParser = argparse.ArgumentParser()
    optParser.add_argument('--verbose', '-v', action='store_true', help='상세 출력')
    optParser.add_argument('--output', '-o', default='result.txt', help='출력 파일')

    optArgs = optParser.parse_args(['-v', '--output', 'custom.txt'])
    optArgs.verbose, optArgs.output
  exercise:
    prompt: 옵션 인자 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      import argparse

      optParser = argparse.ArgumentParser()
      optParser.add_argument('--verbose', '-v', action='store_true', help='상세 출력')
      optParser.add_argument('--output', '-o', default='result.txt', help='출력 파일')

      optArgs = optParser.parse_args(['-v', '--output', 'custom.txt'])
      optArgs.verbose, optArgs.output
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: 옵션 인자에서 \`optParser\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 옵션 인자 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: choices_validation
  title: 선택과 검증
  structuredPrimary: true
  subtitle: 입력값 제한과 검증
  goal: 선택과 검증에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    choices로 허용된 값만 입력받고, 커스텀 함수로 검증할 수 있습니다.

    nargs='+'는 1개 이상, '*'는 0개 이상, '?'는 0개 또는 1개, 숫자는 정확한 개수를 의미합니다.
  snippet: |-
    import argparse

    choiceParser = argparse.ArgumentParser()
    choiceParser.add_argument('--format', choices=['json', 'xml', 'csv'], default='json')
    choiceParser.add_argument('--level', choices=[1, 2, 3], type=int, default=1)

    choiceArgs = choiceParser.parse_args(['--format', 'xml', '--level', '2'])
    choiceArgs.format, choiceArgs.level
  exercise:
    prompt: 선택과 검증 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      import argparse

      choiceParser = argparse.ArgumentParser()
      choiceParser.add_argument('--format', choices=['json', 'xml', 'csv'], default='json')
      choiceParser.add_argument('--level', choices=[1, 2, 3], type=int, default=1)

      choiceArgs = choiceParser.parse_args(['--format', 'xml', '--level', '2'])
      choiceArgs.format, choiceArgs.level
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: 선택과 검증에서 \`choiceParser\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 선택과 검증 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: subparsers
  title: 서브커맨드
  structuredPrimary: true
  subtitle: git-style 명령어
  goal: 서브커맨드에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    add_subparsers()로 git add, git commit 같은 서브커맨드를 만들 수 있습니다.

    서브커맨드는 복잡한 CLI 도구를 체계적으로 구성하는데 유용합니다. git, docker 등이 이 패턴을 사용합니다.
  snippet: |-
    import argparse

    mainParser = argparse.ArgumentParser()
    subparsers = mainParser.add_subparsers(dest='command')

    addParser = subparsers.add_parser('add', help='파일 추가')
    addParser.add_argument('files', nargs='+')

    removeParser = subparsers.add_parser('remove', help='파일 제거')
    removeParser.add_argument('files', nargs='+')

    cmdArgs = mainParser.parse_args(['add', 'file1.txt', 'file2.txt'])
    cmdArgs.command, cmdArgs.files
  exercise:
    prompt: 서브커맨드 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      import argparse

      mainParser = argparse.ArgumentParser()
      subparsers = mainParser.add_subparsers(dest='command')

      addParser = subparsers.add_parser('add', help='파일 추가')
      addParser.add_argument('files', nargs='+')

      removeParser = subparsers.add_parser('remove', help='파일 제거')
      removeParser.add_argument('files', nargs='+')

      cmdArgs = mainParser.parse_args(['add', 'file1.txt', 'file2.txt'])
      cmdArgs.command, cmdArgs.files
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: 서브커맨드에서 \`mainParser\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 서브커맨드 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: advanced_features
  title: 고급 기능
  structuredPrimary: true
  subtitle: 그룹, 상호배타, 커스터마이징
  goal: 고급 기능에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    인자 그룹, 상호배타 그룹, 커스텀 도움말 등 고급 기능을 활용할 수 있습니다.

    add_mutually_exclusive_group()은 --json과 --xml처럼 동시에 사용할 수 없는 옵션을 정의할 때 유용합니다.
  snippet: |-
    import argparse

    exclusiveParser = argparse.ArgumentParser()
    group = exclusiveParser.add_mutually_exclusive_group()
    group.add_argument('--json', action='store_true')
    group.add_argument('--xml', action='store_true')

    exclusiveArgs = exclusiveParser.parse_args(['--json'])
    exclusiveArgs.json, exclusiveArgs.xml
  exercise:
    prompt: 고급 기능 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      import argparse

      exclusiveParser = argparse.ArgumentParser()
      group = exclusiveParser.add_mutually_exclusive_group()
      group.add_argument('--json', action='store_true')
      group.add_argument('--xml', action='store_true')

      exclusiveArgs = exclusiveParser.parse_args(['--json'])
      exclusiveArgs.json, exclusiveArgs.xml
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: 고급 기능에서 \`exclusiveParser\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 고급 기능 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: practical
  title: 실전 활용
  structuredPrimary: true
  subtitle: 실무 CLI 도구
  goal: 실전 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    실제 CLI 프로그램에서 자주 사용되는 패턴들입니다.

    실제 CLI 프로그램에서는 parse_args()에 인자를 전달하지 않으면 sys.argv에서 자동으로 읽어옵니다.
  snippet: |-
    import argparse

    converterParser = argparse.ArgumentParser(description='파일 변환 도구')
    converterParser.add_argument('input_file', help='입력 파일')
    converterParser.add_argument('output_file', help='출력 파일')
    converterParser.add_argument('--format', choices=['json', 'csv', 'xml'], default='json')
    converterParser.add_argument('--encoding', default='utf-8')

    converterArgs = converterParser.parse_args(['input.txt', 'output.json', '--format', 'json'])
    {
        'input': converterArgs.input_file,
        'output': converterArgs.output_file,
        'format': converterArgs.format,
        'encoding': converterArgs.encoding
    }
  exercise:
    prompt: 실전 활용 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      import argparse

      converterParser = argparse.ArgumentParser(description='파일 변환 도구')
      converterParser.add_argument('input_file', help='입력 파일')
      converterParser.add_argument('output_file', help='출력 파일')
      converterParser.add_argument('--format', choices=['json', 'csv', 'xml'], default='json')
      converterParser.add_argument('--encoding', default='utf-8')

      converterArgs = converterParser.parse_args(['input.txt', 'output.json', '--format', 'json'])
      {
          'input': converterArgs.input_file,
          'output': converterArgs.output_file,
          'format': converterArgs.format,
          'encoding': converterArgs.encoding
      }
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: 실전 활용에서 \`converterParser\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 실전 활용 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: workflow_validation
  title: '검증 루프: 데이터 처리 CLI 품질 게이트'
  structuredPrimary: true
  subtitle: 예측 → 실행 → 오류 수정 → 검증
  goal: '검증 루프: 데이터 처리 CLI 품질 게이트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: argparse 실습은 옵션을 추가하는 데서 끝나면 부족합니다. 정상 입력, 잘못된 타입, 허용되지 않은 선택지, 서브커맨드 누락을 모두 테스트해야 실제 CLI
    도구로 가져갈 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class NoExitParser(argparse.ArgumentParser):
        def error(self, message):
            raise argparse.ArgumentError(None, message)

    def positiveLimit(value):
        limit = int(value)
        if limit <= 0:
            raise argparse.ArgumentTypeError('limit은 양수여야 합니다')
        return limit

    def buildDataCliParser():
        parser = NoExitParser(prog='codaro-data', description='데이터 처리 CLI')
        subparsers = parser.add_subparsers(dest='command', required=True)

        convert = subparsers.add_parser('convert')
        convert.add_argument('source')
        convert.add_argument('--format', choices=['json', 'csv'], default='json')
        convert.add_argument('--limit', type=positiveLimit, default=100)
        convert.add_argument('--dry-run', action='store_true')

        report = subparsers.add_parser('report')
        report.add_argument('--since', required=True)
        report.add_argument('--output', default='report.md')
        return parser

    dataCliParser = buildDataCliParser()
    cliArgs = dataCliParser.parse_args(['convert', 'input.csv', '--format', 'json', '--limit', '10', '--dry-run'])
    assert cliArgs.command == 'convert'
    assert cliArgs.limit == 10
    cliArgs
  exercise:
    prompt: '검증 루프: 데이터 처리 CLI 품질 게이트 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'
    starterCode: |-
      class NoExitParser(argparse.ArgumentParser):
          def error(self, message):
              raise argparse.ArgumentError(None, message)

      def positiveLimit(value):
          limit = int(value)
          if limit <= 0:
              raise argparse.ArgumentTypeError('limit은 양수여야 합니다')
          return limit

      def buildDataCliParser():
          parser = NoExitParser(prog='codaro-data', description='데이터 처리 CLI')
          subparsers = parser.add_subparsers(dest='command', required=True)

          convert = subparsers.add_parser('convert')
          convert.add_argument('source')
          convert.add_argument('--format', choices=['json', 'csv'], default='json')
          convert.add_argument('--limit', type=positiveLimit, default=100)
          convert.add_argument('--dry-run', action='store_true')

          report = subparsers.add_parser('report')
          report.add_argument('--since', required=True)
          report.add_argument('--output', default='report.md')
          return parser

      dataCliParser = buildDataCliParser()
      cliArgs = dataCliParser.parse_args(['convert', 'input.csv', '--format', 'json', '--limit', '10', '--dry-run'])
      assert cliArgs.command == 'convert'
      assert cliArgs.limit == 10
      cliArgs
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    noError: '검증 루프: 데이터 처리 CLI 품질 게이트의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'
    resultCheck: '검증 루프: 데이터 처리 CLI 품질 게이트 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'
- id: practice
  title: 종합 복습
  structuredPrimary: true
  subtitle: 작게 실행하고 결과를 확인하는 단계
  goal: 종합 복습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 종합 복습의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import argparse

    parser1 = argparse.ArgumentParser()
    parser1.add_argument('username')

    args1 = parser1.parse_args(['alice'])
    args1.username
  exercise:
    prompt: 종합 복습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      import argparse

      parser1 = argparse.ArgumentParser()
      parser1.add_argument('username')

      args1 = parser1.parse_args(['alice'])
      args1.username
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: 종합 복습에서 \`parser1\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 종합 복습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
assessment:
  masteryVariants:
  - id: 24_argparse-data-cli-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - workflow_validation
    title: 데이터 변환 CLI 인자를 dict로 검증하기
    subtitle: subparser와 type validator
    goal: convert 서브커맨드 인자를 파싱해 command, source, format, limit, dryRun을 반환하고 잘못된 limit은 ArgumentError로 막는다.
    why: 숙달 검증은 CLI를 실제로 실행하는 것이 아니라, 입력 문자열 목록을 안정적으로 파싱하고 실패 경로까지 자동 검증하는 능력을 확인합니다.
    explanation: build_data_cli_summary(argv)가 NoExitParser로 convert 명령을 파싱하고 정상 입력과 잘못된 양수 제한을 모두 다루게 만드세요.
    tips:
    - subparser에도 NoExitParser가 쓰이도록 parser_class를 지정하세요.
    - type 함수에서 ArgumentTypeError를 던지면 argparse가 사용자가 읽을 수 있는 오류로 바꿉니다.
    exercise:
      prompt: build_data_cli_summary(argv)를 완성해 convert CLI 요약 dict를 반환하고 0 이하 limit은 ArgumentError로 거부하세요.
      starterCode: |-
        def build_data_cli_summary(argv):
            raise NotImplementedError
      solution: |-
        import argparse

        class NoExitParser(argparse.ArgumentParser):
            def error(self, message):
                raise argparse.ArgumentError(None, message)

        def positive_limit(value):
            limit = int(value)
            if limit <= 0:
                raise argparse.ArgumentTypeError("limit must be positive")
            return limit

        def build_data_cli_summary(argv):
            parser = NoExitParser(prog="codaro-data")
            subparsers = parser.add_subparsers(
                dest="command",
                required=True,
                parser_class=NoExitParser,
            )
            convert = subparsers.add_parser("convert")
            convert.add_argument("source")
            convert.add_argument("--format", choices=["json", "csv"], default="json")
            convert.add_argument("--limit", type=positive_limit, default=100)
            convert.add_argument("--dry-run", action="store_true")
            args = parser.parse_args(argv)
            return {
                "command": args.command,
                "source": args.source,
                "format": args.format,
                "limit": args.limit,
                "dryRun": args.dry_run,
            }
      hints:
      - parse_args에는 sys.argv 대신 테스트할 argv list를 직접 넘기세요.
      - '\`--dry-run\`은 action="store_true"로 boolean이 됩니다.'
    check:
      id: python.builtins.argparse.data-cli.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.argparse.empty.behavior.v1.fixture
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
        entry: build_data_cli_summary
        cases:
        - id: parses-convert-command
          arguments:
          - value:
            - convert
            - input.csv
            - --format
            - csv
            - --limit
            - '25'
            - --dry-run
          expectedReturn:
            command: convert
            source: input.csv
            format: csv
            limit: 25
            dryRun: true
        - id: rejects-non-positive-limit
          arguments:
          - value:
            - convert
            - input.csv
            - --limit
            - '0'
          expectedException: ArgumentError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 24_argparse-report-options-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - optional_args
    - choices_validation
    title: 리포트 CLI 옵션을 반복 tag와 boolean으로 파싱하기
    subtitle: required, append, store_true
    goal: --since, --output, 반복 --tag, --include-empty 옵션을 파싱해 dict로 반환한다.
    why: 전이 과제에서는 subcommand 구조에서 단일 리포트 명령 옵션 구조로 옮겨, 반복 옵션과 boolean flag를 함께 다룹니다.
    explanation: parse_report_args(argv)가 required 옵션과 반복 tag를 파싱하고 누락된 since는 ArgumentError로 거부하게 만드세요.
    tips:
    - action="append"는 같은 옵션이 여러 번 들어올 때 list로 모읍니다.
    - required=True 옵션 누락도 NoExitParser가 ArgumentError로 바꾸게 하세요.
    exercise:
      prompt: parse_report_args(argv)를 완성해 since, output, tags, includeEmpty를 반환하고 --since 누락은 거부하세요.
      starterCode: |-
        def parse_report_args(argv):
            raise NotImplementedError
      solution: |-
        import argparse

        class NoExitParser(argparse.ArgumentParser):
            def error(self, message):
                raise argparse.ArgumentError(None, message)

        def parse_report_args(argv):
            parser = NoExitParser(prog="codaro-report")
            parser.add_argument("--since", required=True)
            parser.add_argument("--output", default="report.md")
            parser.add_argument("--tag", action="append", default=[])
            parser.add_argument("--include-empty", action="store_true")
            args = parser.parse_args(argv)
            return {
                "since": args.since,
                "output": args.output,
                "tags": args.tag,
                "includeEmpty": args.include_empty,
            }
      hints:
      - '\`--tag\`를 두 번 넣으면 tags list에 두 값이 들어갑니다.'
      - boolean flag는 없으면 False, 있으면 True가 됩니다.
    check:
      id: python.builtins.argparse.report-options.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.argparse.empty.behavior.v1.fixture
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
        entry: parse_report_args
        cases:
        - id: parses-report-options
          arguments:
          - value:
            - --since
            - '2026-07-01'
            - --tag
            - learning
            - --tag
            - strong
            - --include-empty
          expectedReturn:
            since: '2026-07-01'
            output: report.md
            tags:
            - learning
            - strong
            includeEmpty: true
        - id: rejects-missing-since
          arguments:
          - value:
            - --tag
            - learning
          expectedException: ArgumentError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 24_argparse-known-unknown-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 24_argparse-report-options-transfer
    title: 알려진 옵션과 plugin 잔여 인자를 분리해 회상하기
    subtitle: parse_known_args
    goal: core parser가 아는 옵션은 Namespace로 읽고, 모르는 plugin 옵션은 unknown list로 보존한다.
    why: 시간이 지나도 남아야 할 argparse 감각은 모든 옵션을 억지로 소비하지 않고 다음 layer가 처리할 인자를 보존하는 것입니다.
    explanation: split_known_plugin_args(argv)가 profile과 retries는 파싱하고, 나머지 plugin 인자는 순서 그대로 unknown에 남기게 만드세요.
    tips:
    - parse_known_args는 (known, unknown) 튜플을 반환합니다.
    - unknown list는 다음 parser나 plugin layer로 넘길 수 있어야 하므로 순서를 유지하세요.
    exercise:
      prompt: split_known_plugin_args(argv)를 완성해 profile, retries, unknown, unknownCount를 반환하고 retries 타입 오류는 거부하세요.
      starterCode: |-
        def split_known_plugin_args(argv):
            raise NotImplementedError
      solution: |-
        import argparse

        class NoExitParser(argparse.ArgumentParser):
            def error(self, message):
                raise argparse.ArgumentError(None, message)

        def split_known_plugin_args(argv):
            parser = NoExitParser(prog="codaro-plugin")
            parser.add_argument("--profile", default="default")
            parser.add_argument("--retries", type=int, default=1)
            known, unknown = parser.parse_known_args(argv)
            return {
                "profile": known.profile,
                "retries": known.retries,
                "unknown": unknown,
                "unknownCount": len(unknown),
            }
      hints:
      - plugin 전용 옵션은 unknown에 남아야 합니다.
      - type=int 변환 실패는 ArgumentError로 바꿔 호출자가 처리하게 하세요.
    check:
      id: python.builtins.argparse.known-unknown.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.argparse.empty.behavior.v1.fixture
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
        entry: split_known_plugin_args
        cases:
        - id: keeps-plugin-args
          arguments:
          - value:
            - --profile
            - web
            - --plugin-flag
            - 'on'
            - --retries
            - '3'
            - --raw
            - value
          expectedReturn:
            profile: web
            retries: 3
            unknown:
            - --plugin-flag
            - 'on'
            - --raw
            - value
            unknownCount: 4
        - id: rejects-invalid-retries
          arguments:
          - value:
            - --retries
            - many
          expectedException: ArgumentError
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