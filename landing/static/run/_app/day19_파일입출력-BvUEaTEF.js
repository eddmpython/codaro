var e=`meta:
  id: day19
  title: 파일입출력
  day: 19
  category: 30days
  tags:
  - 파일입출력
  - with
  - pathlib
  - tempfile
  - CSV
  - 로컬파일
  - 검증
  seo:
    title: 파이썬 파일 입출력 - 파일 읽고 쓰기
    description: open, read, write, with문으로 파일을 다루는 방법을 배웁니다.
    keywords:
    - 파일
    - open
    - read
    - write
    - with
intro:
  emoji: 📄
  points:
  - 파일 열기와 닫기
  - 파일 읽고 쓰기
  - with문으로 안전하게
  - 파일 모드 이해
  direction: 파일입출력에서 입력값, 처리 로직, 출력 확인을 작은 스크립트로 연결합니다.
  benefits:
  - 문자열, 숫자, 변수 같은 예제 값 확인 후 기초 문법에 맞는 코드 입력을 고릅니다.
  - 파일입출력 결과를 출력 또는 마지막 표현식 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 작은 자동화 스크립트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 파일 열기 입력 확인
      detail: 입력 기준(문자열, 숫자, 변수 같은 예제 값)과 필요한 조건을 먼저 고정합니다.
    - label: 파일 읽기 처리 실행
      detail: 기초 문법 코드를 실행해 중간 결과를 확인합니다.
    - label: 파일 쓰기 결과 검증
      detail: 출력 또는 마지막 표현식 결과 기준으로 실행 결과를 비교합니다.
    - label: 파일입출력 재사용
      detail: 완성 코드를 작은 자동화 스크립트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 기초 자동화 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 파일입출력 실행
      detail: 셀을 실행해 출력 또는 마지막 표현식 결과와 예외 상태를 확인합니다.
    - label: 파일입출력 완료
      detail: 검증된 코드를 작은 자동화 스크립트로 남깁니다.
sections:
- id: open_file
  title: 파일 열기
  structuredPrimary: true
  subtitle: open() 함수
  goal: open()으로 연 파일을 close()로 닫은 뒤, 파일 객체가 정말 닫혔는지 직접 확인한다.
  why: 파일을 열어 놓고 닫지 않으면 쓴 내용이 디스크까지 다 넘어가지 않거나 다른 프로그램이 그 파일을 열지 못하는 일이 생기므로, 연 파일을 닫았는지 확인하는 습관이 필요합니다.
  explanation: |-
    open() 함수로 파일을 엽니다. open(파일경로, 모드) 형식으로 쓰며, 파일 객체를 반환합니다. 사용 후에는 close()로 닫아야 합니다. 기본 모드는 읽기('r')입니다.

    파일은 반드시 close()로 닫아야 리소스가 해제됩니다. 노트북 환경에서는 파일 목록 패널에서 생성된 txt 파일을 확인할 수 있습니다.
  snippet: |-
    f = open('test.txt', 'w')
    f.write('Hello World')
    f.close()
    'File created'
  exercise:
    prompt: |-
      마지막 줄 'File created'를 f.closed로 바꾸세요. 앞의 세 줄은 그대로 둡니다.

      파일 객체는 자기가 닫혔는지를 closed에 담고 있고, 바로 위에서 f.close()를 불렀으므로 True가 나와야 합니다.
    starterCode: |-
      f = open('test.txt', 'w')
      f.write('Hello World')
      f.close()
      'File created'
    solution: |-
      f = open('test.txt', 'w')
      f.write('Hello World')
      f.close()
      f.closed
    hints:
    - "마지막 줄 'File created' 를 f.closed 로 바꿉니다. open, write, close 세 줄은 그대로 둡니다."
    - "정답 형태: f.closed"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'True'
    resultCheck: "출력이 정확히 일치해야 합니다: 'True'"
- id: read_file
  title: 파일 읽기
  structuredPrimary: true
  subtitle: read() 메서드
  goal: read() 대신 readlines()로 읽어, 줄 목록의 각 줄 끝에 줄바꿈 문자가 그대로 남는 것을 확인한다.
  why: 파일을 통째 문자열로 받을지 줄 목록으로 받을지에 따라 다음 처리 코드가 완전히 달라지고, readlines()가 남기는 줄바꿈을 모르면 비교나 이어 붙이기에서 조용히 어긋납니다.
  explanation: |-
    read() 메서드로 파일 내용을 읽습니다. 전체 내용을 문자열로 반환합니다. readline()은 한 줄씩, readlines()는 모든 줄을 리스트로 반환합니다.

    readlines()는 각 줄에 줄바꿈 문자(\\n)를 포함합니다.
  snippet: |-
    writer = open('data.txt', 'w')
    writer.write('Line 1\\nLine 2\\nLine 3')
    writer.close()

    reader = open('data.txt', 'r')
    text = reader.read()
    reader.close()
    text
  exercise:
    prompt: |-
      text = reader.read()를 text = reader.readlines()로 바꾸세요. 나머지 줄은 그대로 둡니다.

      readlines()는 파일을 줄 단위로 잘라 리스트로 돌려주고 각 줄 끝의 줄바꿈 문자는 지우지 않습니다. 마지막 줄 뒤에는 줄바꿈이 없으므로 아래 한 줄이 나와야 합니다.
      ['Line 1\\n', 'Line 2\\n', 'Line 3']
    starterCode: |-
      writer = open('data.txt', 'w')
      writer.write('Line 1\\nLine 2\\nLine 3')
      writer.close()

      reader = open('data.txt', 'r')
      text = reader.read()
      reader.close()
      text
    solution: |-
      writer = open('data.txt', 'w')
      writer.write('Line 1\\nLine 2\\nLine 3')
      writer.close()

      reader = open('data.txt', 'r')
      text = reader.readlines()
      reader.close()
      text
    hints:
    - text = reader.read() 를 text = reader.readlines() 로 바꿉니다. writer 쪽 세 줄과 마지막 text 는 그대로 둡니다.
    - "정답 형태: text = reader.readlines()"
  check:
    type: outputExact
    evidence: practice
    outputExact: "['Line 1\\\\n', 'Line 2\\\\n', 'Line 3']"
    resultCheck: "출력이 정확히 일치해야 합니다: \\"['Line 1\\\\n', 'Line 2\\\\n', 'Line 3']\\""
- id: write_file
  title: 파일 쓰기
  structuredPrimary: true
  subtitle: write() 메서드
  goal: write()에 넘기는 문자열을 바꿔, 돌려받는 글자 수가 함께 달라지는 것을 확인한다.
  why: write()가 돌려주는 글자 수는 의도한 만큼 실제로 쓰였는지 확인하는 가장 싼 방법이고, 공백까지 세기 때문에 눈으로 센 길이와 다르면 그 자리에서 알아챌 수 있습니다.
  explanation: |-
    write() 메서드로 파일에 문자열을 씁니다. 'w' 모드는 기존 내용을 지우고, 'a' 모드는 끝에 추가합니다. write()는 쓴 문자 수를 반환합니다.

    'w' 모드는 기존 파일을 완전히 지우므로 주의하세요.
  snippet: |-
    fileObj = open('message.txt', 'w')
    count = fileObj.write('Hello Python')
    fileObj.close()
    count
  exercise:
    prompt: |-
      두 번째 줄의 'Hello Python'을 'Codaro file'로 바꾸세요. 나머지 줄은 그대로 둡니다.

      write()는 쓴 글자 수를 돌려줍니다. Codaro file은 가운데 공백까지 한 글자로 세면 11글자이므로 11이 나와야 합니다.
    starterCode: |-
      fileObj = open('message.txt', 'w')
      count = fileObj.write('Hello Python')
      fileObj.close()
      count
    solution: |-
      fileObj = open('message.txt', 'w')
      count = fileObj.write('Codaro file')
      fileObj.close()
      count
    hints:
    - "write() 괄호 안의 'Hello Python' 을 'Codaro file' 로 바꿉니다. open, close, 마지막 count 는 그대로 둡니다."
    - "정답 형태: count = fileObj.write('Codaro file')"
  check:
    type: outputExact
    evidence: practice
    outputExact: '11'
    resultCheck: "출력이 정확히 일치해야 합니다: '11'"
- id: with_statement
  title: with 문
  structuredPrimary: true
  subtitle: 자동으로 닫기
  goal: with 블록을 벗어난 파일 객체가 close()를 부르지 않았는데도 닫혀 있는 것을 확인한다.
  why: close()를 빠뜨려도 프로그램은 대개 에러 없이 끝나서 실수를 알아채기 어려운데, with를 쓰면 블록을 벗어나는 순간 닫히는 것이 보장되어 그 실수 자체가 사라집니다.
  explanation: |-
    with 문을 사용하면 파일을 자동으로 닫아줍니다. with open(경로, 모드) as 변수: 형식으로 쓰며, 블록이 끝나면 자동으로 close()가 호출됩니다. 안전하고 권장되는 방법입니다.

    with 문은 close()를 잊어버릴 걱정이 없어 안전합니다.
  snippet: |-
    with open('test.txt', 'w') as outFile:
        outFile.write('With statement')

    with open('test.txt', 'r') as inFile:
        data = inFile.read()

    data
  exercise:
    prompt: |-
      마지막 줄 data를 data, inFile.closed로 바꾸세요. 위의 with 블록 두 개는 그대로 둡니다.

      close()를 한 번도 부르지 않았지만 with 블록을 벗어날 때 파일이 자동으로 닫힙니다. 그래서 ('With statement', True)가 나와야 합니다.
    starterCode: |-
      with open('test.txt', 'w') as outFile:
          outFile.write('With statement')

      with open('test.txt', 'r') as inFile:
          data = inFile.read()

      data
    solution: |-
      with open('test.txt', 'w') as outFile:
          outFile.write('With statement')

      with open('test.txt', 'r') as inFile:
          data = inFile.read()

      data, inFile.closed
    hints:
    - 마지막 줄 data 를 data, inFile.closed 로 바꿉니다. 읽기 블록의 as inFile 이름을 그대로 써야 합니다.
    - "정답 형태: data, inFile.closed"
  check:
    type: outputExact
    evidence: practice
    outputExact: "('With statement', True)"
    resultCheck: "출력이 정확히 일치해야 합니다: \\"('With statement', True)\\""
- id: file_modes
  title: 파일 모드
  structuredPrimary: true
  subtitle: 읽기/쓰기/추가
  goal: 같은 파일에 'w'로 쓴 뒤 'a'로 한 번 더 써서, 두 모드가 기존 내용을 다르게 다루는 것을 확인한다.
  why: 쓰기 모드 'w'는 파일을 열자마자 기존 내용을 지우기 때문에, 로그처럼 계속 쌓아야 하는 파일에 'w'를 쓰면 어제 기록이 통째로 사라집니다. 이어 붙일 때는 'a'를 씁니다.
  explanation: |-
    파일 모드는 파일을 어떻게 열지 결정합니다. 'r'(읽기), 'w'(쓰기), 'a'(추가), 'r+'(읽기/쓰기) 등이 있습니다. 텍스트 모드가 기본이며, 'b'를 붙이면 바이너리 모드입니다.

    파일이 없을 때 'r'은 에러, 'w'와 'a'는 파일을 생성합니다.
  snippet: |-
    with open('test.txt', 'w') as wf:
        wf.write('Read mode test')

    with open('test.txt', 'r') as rf:
        readData = rf.read()

    readData
  exercise:
    prompt: |-
      읽기 블록 앞에 추가 모드 블록을 넣으세요. 빈 줄 하나를 두고 아래 두 줄을 추가하면 됩니다.
      with open('test.txt', 'a') as af:
          af.write(' and append')

      먼저 쓴 Read mode test는 지워지지 않고 'a'가 그 뒤에 이어 붙이므로 Read mode test and append가 나와야 합니다.
    starterCode: |-
      with open('test.txt', 'w') as wf:
          wf.write('Read mode test')

      with open('test.txt', 'r') as rf:
          readData = rf.read()

      readData
    solution: |-
      with open('test.txt', 'w') as wf:
          wf.write('Read mode test')

      with open('test.txt', 'a') as af:
          af.write(' and append')

      with open('test.txt', 'r') as rf:
          readData = rf.read()

      readData
    hints:
    - "with open('test.txt', 'a') as af: 와 공백 4칸 들여쓴 af.write(' and append') 두 줄을 읽기 블록 바로 앞에 넣습니다. 앞뒤 블록은 그대로 둡니다."
    - "정답 형태: 'a' 모드 with 블록을 가운데 추가"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'Read mode test and append'
    resultCheck: "출력이 정확히 일치해야 합니다: 'Read mode test and append'"
- id: line_iteration
  title: 줄 단위 순회
  structuredPrimary: true
  subtitle: for문으로 읽기
  goal: 파일에 쓰는 줄 수를 바꿔, for 문이 도는 횟수가 그대로 따라 바뀌는 것을 확인한다.
  why: 파일 전체를 메모리에 올리지 않고 for 문으로 한 줄씩 처리하면 아무리 큰 로그 파일도 같은 코드로 셀 수 있고, 줄 수는 그 처리가 제대로 돌았는지 보는 첫 번째 숫자입니다.
  explanation: |-
    파일 객체는 for문으로 순회할 수 있습니다. 각 줄을 하나씩 가져오므로 메모리 효율적입니다. 큰 파일을 처리할 때 유용합니다.

    strip()으로 줄바꿈 문자를 제거할 수 있습니다.
  snippet: |-
    with open('items.txt', 'w') as creator:
        creator.write('Apple\\nBanana\\nCherry')

    with open('items.txt', 'r') as processor:
        lineCount = 0
        for line in processor:
            lineCount = lineCount + 1

    lineCount
  exercise:
    prompt: |-
      creator.write('Apple\\nBanana\\nCherry')를 creator.write('Apple\\nBanana\\nCherry\\nDate\\nFig')로 바꾸세요. 읽기 블록과 마지막 줄은 그대로 둡니다.

      \\n이 줄을 나누는 자리이고 마지막 Fig 뒤에는 \\n을 붙이지 않습니다. 줄이 다섯 개가 되므로 for 문도 다섯 번 돌아 5가 나와야 합니다.
    starterCode: |-
      with open('items.txt', 'w') as creator:
          creator.write('Apple\\nBanana\\nCherry')

      with open('items.txt', 'r') as processor:
          lineCount = 0
          for line in processor:
              lineCount = lineCount + 1

      lineCount
    solution: |-
      with open('items.txt', 'w') as creator:
          creator.write('Apple\\nBanana\\nCherry\\nDate\\nFig')

      with open('items.txt', 'r') as processor:
          lineCount = 0
          for line in processor:
              lineCount = lineCount + 1

      lineCount
    hints:
    - "write() 괄호 안 문자열 끝에 \\\\nDate\\\\nFig 를 이어 붙여 'Apple\\\\nBanana\\\\nCherry\\\\nDate\\\\nFig' 로 만듭니다."
    - "정답 형태: creator.write('Apple\\\\nBanana\\\\nCherry\\\\nDate\\\\nFig')"
  check:
    type: outputExact
    evidence: practice
    outputExact: '5'
    resultCheck: "출력이 정확히 일치해야 합니다: '5'"
- id: workflow_validation
  title: '검증 루프: 임시 작업 폴더에서 리포트 파일 만들기'
  structuredPrimary: true
  subtitle: 로컬 파일을 안전하게 쓰고 읽고 검증하기
  goal: 임시 폴더가 사라지기 전에 결과 파일을 읽어, assert가 조용히 통과한 그 내용을 눈으로도 확인한다.
  why: assert는 통과하면 아무 말도 하지 않기 때문에, 실제로 무엇이 저장됐는지 한 번은 출력해 봐야 검증이 헛돌고 있지 않다는 것을 알 수 있습니다.
  explanation: 로컬 Python에서는 파일 입출력 제약이 줄어드는 대신, 현재 작업 폴더를 지저분하게 만들 위험이 생깁니다. 실습과 자동화 코드는 임시 작업 폴더나 명시한
    출력 폴더를 쓰고, 파일 내용까지 검증해야 합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from pathlib import Path
    import tempfile

    with tempfile.TemporaryDirectory() as tempDir:
        workDir = Path(tempDir)
        reportPath = workDir / 'dailyReport.txt'
        reportPath.write_text('orderId,total\\nA-100,12000\\nA-101,8000\\n', encoding='utf-8')

        reportText = reportPath.read_text(encoding='utf-8')
        lines = reportText.strip().splitlines()

        assert reportPath.exists()
        assert lines[0] == 'orderId,total'
        assert len(lines) == 3
  exercise:
    prompt: |-
      기존 줄은 하나도 바꾸지 마세요. 맨 아래 resultPath.name 줄 다음에 같은 들여쓰기로 print(resultPath.read_text(encoding='utf-8')) 한 줄만 추가하면 됩니다.

      with 블록을 벗어나면 임시 폴더와 그 안의 파일이 함께 사라지므로 확인도 블록 안에서 합니다. assert가 통과한 그 내용이 그대로 나오므로 아래 두 줄이 나와야 합니다.
      HELLO
      PYTHON
    starterCode: |-
      from pathlib import Path
      import tempfile

      with tempfile.TemporaryDirectory() as tempDir:
          workDir = Path(tempDir)
          sourcePath = workDir / 'raw.txt'
          resultPath = workDir / 'upper.txt'
          sourcePath.write_text('hello\\npython\\n', encoding='utf-8')

          upperLines = []
          for line in sourcePath.read_text(encoding='utf-8').splitlines():
              upperLines.append(line.upper())
          resultPath.write_text('\\n'.join(upperLines), encoding='utf-8')

          assert resultPath.read_text(encoding='utf-8') == 'HELLO\\nPYTHON'
          resultPath.name
    solution: |-
      from pathlib import Path
      import tempfile

      with tempfile.TemporaryDirectory() as tempDir:
          workDir = Path(tempDir)
          sourcePath = workDir / 'raw.txt'
          resultPath = workDir / 'upper.txt'
          sourcePath.write_text('hello\\npython\\n', encoding='utf-8')

          upperLines = []
          for line in sourcePath.read_text(encoding='utf-8').splitlines():
              upperLines.append(line.upper())
          resultPath.write_text('\\n'.join(upperLines), encoding='utf-8')

          assert resultPath.read_text(encoding='utf-8') == 'HELLO\\nPYTHON'
          resultPath.name
          print(resultPath.read_text(encoding='utf-8'))
    hints:
    - 코드는 하나도 고치지 말고, 맨 아래 resultPath.name 줄 다음에 print(resultPath.read_text(encoding='utf-8')) 한 줄을 같은 들여쓰기(공백 4칸)로 추가합니다.
    - "정답 형태: 마지막 줄에 print(resultPath.read_text(encoding='utf-8'))"
  check:
    type: outputExact
    evidence: practice
    outputExact: |-
      HELLO
      PYTHON
    resultCheck: "출력이 정확히 일치해야 합니다: 'HELLO\\nPYTHON'"
- id: practice
  title: Day 19 종합 복습
  structuredPrimary: true
  subtitle: 파일 입출력 마스터하기
  goal: with로 파일에 쓰고 다시 with로 열어 read()로 읽어 오는 한 흐름을 직접 완성한다.
  why: 쓰기만 하고 끝내면 파일이 제대로 만들어졌는지 알 수 없어서, 실제 자동화 코드는 거의 항상 쓴 다음 다시 읽어 확인하는 두 단계로 이루어집니다.
  explanation: Day 19에서 배운 파일 입출력을 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로
    어떤 순서로 해도 괜찮습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    with open('hello.txt', 'w') as dest:
        dest.write('Hello World')

    'File created'
  exercise:
    prompt: |-
      쓰기만 하던 코드를 쓰고 다시 읽는 코드로 바꾸세요. 고칠 곳은 두 군데입니다.
      1. dest.write('Hello World')를 dest.write('Hello Codaro')로 바꿉니다.
      2. 마지막 줄 'File created'를 지우고 그 자리에 아래 코드를 넣습니다.
      with open('hello.txt', 'r') as source:
          text = source.read()

      text

      방금 쓴 내용을 그대로 읽어 오므로 Hello Codaro가 나와야 합니다.
    starterCode: |-
      with open('hello.txt', 'w') as dest:
          dest.write('Hello World')

      'File created'
    solution: |-
      with open('hello.txt', 'w') as dest:
          dest.write('Hello Codaro')

      with open('hello.txt', 'r') as source:
          text = source.read()

      text
    hints:
    - "dest.write 괄호 안을 'Hello Codaro' 로 바꾸고, 'File created' 자리에 읽기용 with 블록과 마지막 줄 text 를 넣습니다."
    - "정답 형태: 마지막 줄 text 가 Hello Codaro"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'Hello Codaro'
    resultCheck: "출력이 정확히 일치해야 합니다: 'Hello Codaro'"
assessment:
  schemaVersion: 1
  performanceClaim: 브라우저의 격리된 Python Worker가 숨은 입력으로 핵심 Python 행동을 검증하고, 파일 산출물이 있는 과제는 Local 재실행 증거를 추가로 요구합니다.
  tierParity:
    web: portable-concept
    local: package-practice-and-artifact
  supportPolicy: 첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.
  authoring:
    source: curated-blueprint
    solutionVerification: required
    independentReview: approved
    reviewerId: "curriculum-integrity-review"
    reviewedAt: "2026-08-02T13:06:47+09:00"
    evidenceCommit: "22505301c65a9621c9e3321759115562ffa5e136"
  masteryVariants:
  - id: day19-read-lines-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - open_file
    - practice
    title: fixture 파일의 유효한 줄 읽기
    subtitle: 예시 없이 핵심 규칙 완성
    goal: 파일을 읽고 빈 줄과 바깥 공백을 정리한다.
    why: 앞 예시를 복사하지 않고 여러 입력에서 같은 규칙이 성립해야 개념을 익혔다고 볼 수 있습니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 여러 입력으로 다시 호출합니다.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: read_nonempty_lines(path)가 UTF-8 파일의 비어 있지 않은 줄을 공백 없이 목록으로 반환하도록 완성하세요.
      starterCode: |-
        def read_nonempty_lines(path):
            raise NotImplementedError
      solution: |-
        def read_nonempty_lines(path):
            from pathlib import Path
            return [line.strip() for line in Path(path).read_text(encoding='utf-8').splitlines() if line.strip()]
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day19.read-lines.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day19.read-lines.mastery.behavior.v1.fixture
      fixtureHash: sha256-Yw7O5xDp22cx744gy0Y1FlQheKEtbVwqDzI+wxf9Qng=
      fixture:
        directories: []
        env:
          LANG: C.UTF-8
          TZ: UTC
        files:
        - path: notes.txt
          content: " first \\n\\nsecond\\n"
        stdin: []
      packageAssets: []
      payload:
        entry: read_nonempty_lines
        cases:
        - id: notes
          arguments:
          - fixturePath: notes.txt
          expectedReturn:
          - first
          - second
        expectedPaths:
        - path: notes.txt
          kind: file
          origin: fixture
        normalizeReturnPaths: []
  transferVariants:
  - id: day19-write-uppercase-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day19-read-lines-mastery
    title: 입력 파일을 대문자 결과 파일로 쓰기
    subtitle: 처음 보는 조건에 개념 적용
    goal: 읽기와 쓰기를 새로운 변환 작업에 적용한다.
    why: 같은 문법을 처음 보는 데이터와 업무 조건에 옮겨야 실제 활용 능력을 확인할 수 있습니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 앞 정답 문구가 아니라 입력과 반환 계약을 읽으세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: write_uppercase(source_path, output_name)가 내용을 대문자로 저장하고 저장한 문자열을 반환하도록 완성하세요.
      starterCode: |-
        def write_uppercase(source_path, output_name):
            raise NotImplementedError
      solution: |-
        def write_uppercase(source_path, output_name):
            from pathlib import Path
            content = Path(source_path).read_text(encoding='utf-8').upper()
            Path(output_name).write_text(content, encoding='utf-8')
            return content
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day19.write-uppercase.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day19.write-uppercase.transfer.behavior.v1.fixture
      fixtureHash: sha256-fmP9wDtiPOLQIm5Anm9bs4bEi81QR24pJ0xjQj2Za+8=
      fixture:
        directories: []
        env:
          LANG: C.UTF-8
          TZ: UTC
        files:
        - path: source.txt
          content: |
            hello
            codaro
        stdin: []
      packageAssets: []
      payload:
        entry: write_uppercase
        cases:
        - id: report
          arguments:
          - fixturePath: source.txt
          - value: result.txt
          expectedReturn: |
            HELLO
            CODARO
        expectedPaths:
        - path: source.txt
          kind: file
          origin: fixture
        - path: result.txt
          kind: file
          origin: created
        normalizeReturnPaths: []
  retrievalVariants:
  - id: day19-append-log-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day19-write-uppercase-transfer
    title: 기존 로그 끝에 한 줄 추가하기
    subtitle: 7일 뒤 기억에서 재구성
    goal: 파일 mode와 줄바꿈을 기억에서 다시 구성한다.
    why: 시간을 두고 다시 구성해야 잠깐 본 코드를 따라 쓴 것과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일이 지나면 자동으로 열립니다. 예시 없이 함수 계약부터 복원하세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: append_log(path, message)가 기존 UTF-8 파일 끝에 message 한 줄을 추가하고 전체 내용을 반환하도록 완성하세요.
      starterCode: |-
        def append_log(path, message):
            raise NotImplementedError
      solution: |-
        def append_log(path, message):
            from pathlib import Path
            target = Path(path)
            with target.open('a', encoding='utf-8') as stream:
                stream.write(message + '\\n')
            return target.read_text(encoding='utf-8')
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day19.append-log.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day19.append-log.retrieval.behavior.v1.fixture
      fixtureHash: sha256-OxH6HB9Hilr6yml+wSPXchBOEys7kX4uqaB49yZ8skc=
      fixture:
        directories: []
        env:
          LANG: C.UTF-8
          TZ: UTC
        files:
        - path: activity.log
          content: |
            start
        - path: empty.log
          content: ''
        stdin: []
      packageAssets: []
      payload:
        entry: append_log
        cases:
        - id: done
          arguments:
          - fixturePath: activity.log
          - value: done
          expectedReturn: |
            start
            done
        - id: first-line
          arguments:
          - fixturePath: empty.log
          - value: first
          expectedReturn: |
            first
        expectedPaths:
        - path: activity.log
          kind: file
          origin: fixture
        - path: empty.log
          kind: file
          origin: fixture
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};