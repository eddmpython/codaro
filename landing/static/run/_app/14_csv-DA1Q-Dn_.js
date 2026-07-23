var e=`meta:
  id: 14_csv
  title: csv - CSV 처리
  category: builtins
  tags:
  - csv
  - 데이터
  - 파일
  - 임포트
  seo:
    title: 파이썬 csv 모듈 완전 정복
    description: csv 모듈로 CSV 파일 읽기, 쓰기, DictReader/Writer 활용을 배웁니다.
    keywords:
    - csv
    - 데이터파일
    - reader
    - writer
    - DictReader
    - 파이썬CSV
intro:
  emoji: 📊
  points:
  - CSV 파일 읽기와 쓰기
  - DictReader/Writer로 편리한 처리
  - 구분자와 인용 옵션
  - 데이터 임포트/익스포트
  direction: csv CSV 처리에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.
  - csv CSV 처리 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: csv 모듈 불러오기 입력 확인
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.
    - label: CSV 파일 읽기 처리 실행
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.
    - label: CSV 파일 쓰기 결과 검증
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.
    - label: csv CSV 처리 재사용
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 표준 라이브러리 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: csv CSV 처리 실행
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.
    - label: csv CSV 처리 완료
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.
sections:
- id: module_import
  title: csv 모듈 불러오기
  structuredPrimary: true
  subtitle: ⚠️ 가장 먼저 실행하세요
  goal: csv 모듈 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    csv는 파이썬 표준 라이브러리입니다. CSV(Comma-Separated Values) 파일을 처리하는 모듈입니다. 별도 설치 없이 import만으로 사용할 수 있습니다.

    이 섹션을 먼저 실행하면 아래 모든 예제에서 csv 모듈을 사용할 수 있습니다.
  snippet: |-
    import csv
    import tempfile
    from pathlib import Path

    csvScratch = Path(tempfile.gettempdir()) / 'codaro_csv_scratch'
    csvScratch.mkdir(parents=True, exist_ok=True)

    'csv 모듈이 정상적으로 로드되었습니다'
  exercise:
    prompt: csv 모듈 불러오기 예제에서 \`csvScratch\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      import csv
      import tempfile
      from pathlib import Path

      csvScratch = Path(tempfile.gettempdir()) / 'codaro_csv_scratch'
      csvScratch.mkdir(parents=True, exist_ok=True)

      'csv 모듈이 정상적으로 로드되었습니다'
    hints:
    - 바꿀 지점은 \`csvScratch = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`csvScratch\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: csv 모듈 불러오기에서 \`csvScratch\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: csv 모듈 불러오기 실행 뒤 \`csvScratch\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: basic_reading
  title: CSV 파일 읽기
  structuredPrimary: true
  subtitle: reader로 데이터 읽기
  goal: CSV 파일 읽기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    csv.reader()는 CSV 파일을 한 줄씩 읽어 리스트로 반환합니다. 각 행은 문자열 리스트가 되며, 반복문으로 모든 행을 처리할 수 있습니다. 데이터 분석, 로그 파싱, 스프레드시트 처리에 필수적입니다.

    next(reader)를 사용하면 헤더 행을 건너뛰고 데이터만 처리할 수 있습니다.
  snippet: |-
    sampleCsv = csvScratch / 'sample.csv'
    with open(sampleCsv, 'w') as f:
        f.write('name,age,city\\n')
        f.write('Alice,30,Seoul\\n')
        f.write('Bob,25,Busan\\n')

    with open(sampleCsv, 'r') as f:
        csvReader = csv.reader(f)
        rows = list(csvReader)
    rows
  exercise:
    prompt: CSV 파일 읽기 예제에서 \`sampleCsv\`, \`csvReader\`, \`rows\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      sampleCsv = csvScratch / 'sample.csv'
      with open(sampleCsv, 'w') as f:
          f.write('name,age,city\\n')
          f.write('Alice,30,Seoul\\n')
          f.write('Bob,25,Busan\\n')

      with open(sampleCsv, 'r') as f:
          csvReader = csv.reader(f)
          rows = list(csvReader)
      rows
    hints:
    - 바꿀 지점은 \`sampleCsv = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`sampleCsv\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    noError: CSV 파일 읽기에서 \`sampleCsv\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: CSV 파일 읽기 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: basic_writing
  title: CSV 파일 쓰기
  structuredPrimary: true
  subtitle: writer로 데이터 저장
  goal: CSV 파일 쓰기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    csv.writer()는 리스트를 CSV 파일로 저장합니다. writerow()로 한 행씩, writerows()로 여러 행을 한 번에 작성할 수 있습니다. 데이터 내보내기, 리포트 생성, 로그 저장에 활용됩니다.

    newline=''을 사용하면 불필요한 빈 줄이 생기지 않습니다. Windows에서 특히 중요합니다.
  snippet: |-
    outputCsv = csvScratch / 'output.csv'
    with open(outputCsv, 'w', newline='') as f:
        csvWriter = csv.writer(f)
        csvWriter.writerow(['name', 'age'])
        csvWriter.writerow(['Alice', 30])
        csvWriter.writerow(['Bob', 25])

    with open(outputCsv, 'r') as f:
        written = f.read()
    written
  exercise:
    prompt: CSV 파일 쓰기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      outputCsv = csvScratch / 'output.csv'
      with open(outputCsv, 'w', newline='') as f:
          csvWriter = csv.writer(f)
          csvWriter.writerow(['name', 'age'])
          csvWriter.writerow(['Alice', 30])
          csvWriter.writerow(['Bob', 25])

      with open(outputCsv, 'r') as f:
          written = f.read()
      written
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: CSV 파일 쓰기에서 \`outputCsv\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: CSV 파일 쓰기 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: dict_operations
  title: 딕셔너리 기반 처리
  structuredPrimary: true
  subtitle: DictReader와 DictWriter
  goal: 딕셔너리 기반 처리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    DictReader는 각 행을 딕셔너리로 읽어 컬럼명으로 접근할 수 있습니다. DictWriter는 딕셔너리를 CSV로 저장합니다. 인덱스 대신 키 이름을 사용하여 코드 가독성이 높아지고, 컬럼 순서 변경에도 안전합니다.

    writeheader()로 fieldnames를 자동으로 첫 행에 작성할 수 있습니다.
  snippet: |-
    peopleCsv = csvScratch / 'people.csv'
    with open(peopleCsv, 'w') as f:
        f.write('name,age,city\\n')
        f.write('Alice,30,Seoul\\n')
        f.write('Bob,25,Busan\\n')

    with open(peopleCsv, 'r') as f:
        dictReader = csv.DictReader(f)
        people = list(dictReader)
    people
  exercise:
    prompt: 딕셔너리 기반 처리 예제에서 \`peopleCsv\`, \`dictReader\`, \`people\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      peopleCsv = csvScratch / 'people.csv'
      with open(peopleCsv, 'w') as f:
          f.write('name,age,city\\n')
          f.write('Alice,30,Seoul\\n')
          f.write('Bob,25,Busan\\n')

      with open(peopleCsv, 'r') as f:
          dictReader = csv.DictReader(f)
          people = list(dictReader)
      people
    hints:
    - 바꿀 지점은 \`peopleCsv = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`peopleCsv\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    noError: 딕셔너리 기반 처리에서 \`peopleCsv\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 딕셔너리 기반 처리 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: formatting_options
  title: 포맷팅 옵션
  structuredPrimary: true
  subtitle: delimiter, quotechar, quoting
  goal: 포맷팅 옵션에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    CSV 파일의 구분자, 인용 문자, 인용 방식을 커스터마이즈할 수 있습니다. delimiter로 쉼표 외 다른 구분자를 사용하고, quotechar로 인용 문자를 지정하며, quoting으로 인용 전략을 설정합니다. TSV, 파이프 구분 등 다양한 형식을 처리할 수 있습니다.

    QUOTE_MINIMAL은 필요할 때만, QUOTE_ALL은 모든 필드를, QUOTE_NONNUMERIC은 숫자 외 모든 필드를 인용합니다.
  snippet: |-
    tsvFile = csvScratch / 'data.tsv'
    with open(tsvFile, 'w') as f:
        f.write('name\\tage\\tcity\\n')
        f.write('Alice\\t30\\tSeoul\\n')
        f.write('Bob\\t25\\tBusan\\n')

    with open(tsvFile, 'r') as f:
        tsvReader = csv.reader(f, delimiter='\\t')
        tsvRows = list(tsvReader)
    tsvRows
  exercise:
    prompt: 포맷팅 옵션 예제에서 \`tsvFile\`, \`tsvReader\`, \`tsvRows\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      tsvFile = csvScratch / 'data.tsv'
      with open(tsvFile, 'w') as f:
          f.write('name\\tage\\tcity\\n')
          f.write('Alice\\t30\\tSeoul\\n')
          f.write('Bob\\t25\\tBusan\\n')

      with open(tsvFile, 'r') as f:
          tsvReader = csv.reader(f, delimiter='\\t')
          tsvRows = list(tsvReader)
      tsvRows
    hints:
    - 바꿀 지점은 \`tsvFile = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`tsvFile\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    noError: 포맷팅 옵션에서 \`tsvFile\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 포맷팅 옵션 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: advanced_features
  title: 고급 기능
  structuredPrimary: true
  subtitle: Sniffer, Dialect
  goal: 고급 기능에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    Sniffer는 CSV 파일의 형식을 자동으로 감지합니다. Dialect는 CSV 포맷 설정을 재사용 가능하게 만듭니다. 다양한 형식의 CSV 파일을 자동으로 처리하거나, 일관된 포맷으로 파일을 생성할 때 유용합니다.

    Sniffer는 파일의 처음 일부만 읽어 형식을 추론하므로 빠르고 메모리 효율적입니다.
  snippet: |-
    unknownFile = csvScratch / 'unknown.csv'
    with open(unknownFile, 'w') as f:
        f.write('a;b;c\\n')
        f.write('1;2;3\\n')

    with open(unknownFile, 'r') as f:
        sample = f.read(1024)
        f.seek(0)
        sniffer = csv.Sniffer()
        dialect = sniffer.sniff(sample)
        detectedReader = csv.reader(f, dialect)
        detected = list(detectedReader)
    detected
  exercise:
    prompt: 고급 기능 예제에서 \`unknownFile\`, \`sample\`, \`sniffer\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      unknownFile = csvScratch / 'unknown.csv'
      with open(unknownFile, 'w') as f:
          f.write('a;b;c\\n')
          f.write('1;2;3\\n')

      with open(unknownFile, 'r') as f:
          sample = f.read(1024)
          f.seek(0)
          sniffer = csv.Sniffer()
          dialect = sniffer.sniff(sample)
          detectedReader = csv.reader(f, dialect)
          detected = list(detectedReader)
      detected
    hints:
    - 바꿀 지점은 \`unknownFile = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`unknownFile\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    noError: 고급 기능에서 \`unknownFile\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 고급 기능 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: practical
  title: 실전 활용
  structuredPrimary: true
  subtitle: 데이터 변환과 처리
  goal: 실전 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    실무에서 자주 사용하는 CSV 처리 패턴을 살펴봅니다. 데이터 필터링, 집계, 변환, 병합 등 다양한 작업을 CSV로 수행할 수 있습니다. 스프레드시트 자동화, 리포트 생성, ETL 작업에 활용됩니다.

    대용량 CSV는 한 번에 메모리에 로드하지 말고 스트리밍 방식으로 처리하세요.
  snippet: |-
    salesCsv = csvScratch / 'sales.csv'
    with open(salesCsv, 'w') as f:
        f.write('product,amount\\n')
        f.write('laptop,1200\\n')
        f.write('mouse,25\\n')
        f.write('monitor,300\\n')

    with open(salesCsv, 'r') as f:
        salesReader = csv.DictReader(f)
        expensive = [row for row in salesReader if int(row['amount']) > 100]
    expensive
  exercise:
    prompt: 실전 활용 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      salesCsv = csvScratch / 'sales.csv'
      with open(salesCsv, 'w') as f:
          f.write('product,amount\\n')
          f.write('laptop,1200\\n')
          f.write('mouse,25\\n')
          f.write('monitor,300\\n')

      with open(salesCsv, 'r') as f:
          salesReader = csv.DictReader(f)
          expensive = [row for row in salesReader if int(row['amount']) > 100]
      expensive
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 실전 활용의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 실전 활용 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: workflow_validation
  title: '검증 루프: CSV 수집 품질 게이트'
  structuredPrimary: true
  subtitle: 예측 → 실행 → 오류 수정 → 검증
  goal: '검증 루프: CSV 수집 품질 게이트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: 실무 CSV는 컬럼 누락, 숫자 변환 실패, 구분자 차이 때문에 자주 깨집니다. 이 흐름에서는 주문 데이터를 읽기 전에 필수 컬럼을 예측하고, 실패 케이스를
    확인한 뒤, 필터링 결과를 다시 CSV로 저장해 검증합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    csvWorkflowRoot = Path(tempfile.mkdtemp(prefix='codaro_csv_workflow_'))
    ordersPath = csvWorkflowRoot / 'orders.csv'
    with open(ordersPath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['orderId', 'region', 'amount', 'status'])
        writer.writeheader()
        writer.writerows([
            {'orderId': 'A001', 'region': 'Seoul', 'amount': '120000', 'status': 'paid'},
            {'orderId': 'A002', 'region': 'Busan', 'amount': '45000', 'status': 'pending'},
            {'orderId': 'A003', 'region': 'Seoul', 'amount': '99000', 'status': 'paid'}
        ])

    def loadOrders(path):
        with open(path, 'r', newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            requiredColumns = {'orderId', 'region', 'amount', 'status'}
            assert requiredColumns.issubset(reader.fieldnames or []), '필수 컬럼이 누락되었습니다'
            rows = []
            for row in reader:
                amount = int(row['amount'])
                assert amount > 0, 'amount는 양수여야 합니다'
                assert row['status'] in {'paid', 'pending', 'cancelled'}, '알 수 없는 status입니다'
                rows.append({**row, 'amount': amount})
        return rows

    loadedOrders = loadOrders(ordersPath)
    assert len(loadedOrders) == 3
    loadedOrders
  exercise:
    prompt: '검증 루프: CSV 수집 품질 게이트 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'
    starterCode: |-
      csvWorkflowRoot = Path(tempfile.mkdtemp(prefix='codaro_csv_workflow_'))
      ordersPath = csvWorkflowRoot / 'orders.csv'
      with open(ordersPath, 'w', newline='', encoding='utf-8') as f:
          writer = csv.DictWriter(f, fieldnames=['orderId', 'region', 'amount', 'status'])
          writer.writeheader()
          writer.writerows([
              {'orderId': 'A001', 'region': 'Seoul', 'amount': '120000', 'status': 'paid'},
              {'orderId': 'A002', 'region': 'Busan', 'amount': '45000', 'status': 'pending'},
              {'orderId': 'A003', 'region': 'Seoul', 'amount': '99000', 'status': 'paid'}
          ])

      def loadOrders(path):
          with open(path, 'r', newline='', encoding='utf-8') as f:
              reader = csv.DictReader(f)
              requiredColumns = {'orderId', 'region', 'amount', 'status'}
              assert requiredColumns.issubset(reader.fieldnames or []), '필수 컬럼이 누락되었습니다'
              rows = []
              for row in reader:
                  amount = int(row['amount'])
                  assert amount > 0, 'amount는 양수여야 합니다'
                  assert row['status'] in {'paid', 'pending', 'cancelled'}, '알 수 없는 status입니다'
                  rows.append({**row, 'amount': amount})
          return rows

      loadedOrders = loadOrders(ordersPath)
      assert len(loadedOrders) == 3
      loadedOrders
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    noError: '검증 루프: CSV 수집 품질 게이트의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'
    resultCheck: '검증 루프: CSV 수집 품질 게이트 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'
- id: practice
  title: csv 모듈 종합 복습
  structuredPrimary: true
  subtitle: CSV 처리 마스터하기
  goal: csv 모듈 종합 복습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: csv 모듈의 다양한 기능을 활용하는 연습 문제입니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    basicCsv = csvScratch / 'basic.csv'
    with open(basicCsv, 'w') as f:
        f.write('a,b,c\\n1,2,3\\n')
    with open(basicCsv, 'r') as f:
        basicReader = csv.reader(f)
        basicRows = list(basicReader)
    basicRows
  exercise:
    prompt: csv 모듈 종합 복습 예제에서 \`basicCsv\`, \`basicReader\`, \`basicRows\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      basicCsv = csvScratch / 'basic.csv'
      with open(basicCsv, 'w') as f:
          f.write('a,b,c\\n1,2,3\\n')
      with open(basicCsv, 'r') as f:
          basicReader = csv.reader(f)
          basicRows = list(basicReader)
      basicRows
    hints:
    - 바꿀 지점은 \`basicCsv = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`basicCsv\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    noError: csv 모듈 종합 복습에서 \`basicCsv\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: csv 모듈 종합 복습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
assessment:
  masteryVariants:
  - id: 14_csv-paid-orders-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - dict_operations
    - practical
    - workflow_validation
    title: 주문 CSV에서 결제 완료 행 집계하기
    subtitle: DictReader와 필수 컬럼 검증
    goal: 주문 CSV를 읽어 필수 컬럼을 확인하고 paid 주문 수, 총액, 지역 목록을 반환한다.
    why: CSV 학습은 행을 읽는 데서 끝나지 않고 컬럼 누락과 숫자 변환을 방어하면서 업무 지표를 만드는 데서 가치가 생깁니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 fixture CSV를 만든 뒤 보이지 않던 파일 경로로 다시 호출합니다.
    tips:
    - DictReader의 fieldnames에서 필수 컬럼이 있는지 먼저 확인하세요.
    - amount는 문자열이므로 int로 변환한 뒤 집계하세요.
    exercise:
      prompt: summarize_paid_orders(path)가 paidCount, paidTotal, regions를 담은 dict를 반환하고 필수 컬럼 누락은 ValueError로 막도록 완성하세요.
      starterCode: |-
        def summarize_paid_orders(path):
            raise NotImplementedError
      solution: |-
        import csv

        def summarize_paid_orders(path):
            with open(path, "r", newline="", encoding="utf-8") as file:
                reader = csv.DictReader(file)
                required = {"orderId", "region", "amount", "status"}
                if not required.issubset(reader.fieldnames or []):
                    raise ValueError("required columns missing")
                paid_total = 0
                paid_count = 0
                regions = set()
                for row in reader:
                    amount = int(row["amount"])
                    if amount <= 0:
                        raise ValueError("amount must be positive")
                    if row["status"] == "paid":
                        paid_count += 1
                        paid_total += amount
                        regions.add(row["region"])
            return {"paidCount": paid_count, "paidTotal": paid_total, "regions": sorted(regions)}
      hints:
      - status가 paid인 행만 집계하세요.
      - regions는 중복을 제거한 뒤 정렬해서 반환하세요.
    check:
      id: python.builtins.csv.paid-orders.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.csv.orders.mastery.behavior.v1.fixture
      fixtureHash: sha256-qyC+9gaJ+toD6YovimHo3NeikjJ1bLBzUau8SoFrp0A=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files:
        - path: input/orders.csv
          content: |-
            orderId,region,amount,status
            A001,Seoul,120000,paid
            A002,Busan,45000,pending
            A003,Seoul,99000,paid
        - path: input/bad_orders.csv
          content: |-
            orderId,amount
            B001,10
        - path: input/people.tsv
          content: "name\\tage\\tcity\\nAlice\\t30\\tSeoul\\nBob\\t25\\tBusan"
        - path: input/products.psv
          content: |-
            product|amount|status
            laptop|1200|paid
            mouse|25|pending
        stdin: []
      packageAssets: []
      payload:
        entry: summarize_paid_orders
        cases:
        - id: paid-order-summary
          arguments:
          - fixturePath: input/orders.csv
          expectedReturn:
            paidCount: 2
            paidTotal: 219000
            regions:
            - Seoul
        - id: rejects-missing-columns
          arguments:
          - fixturePath: input/bad_orders.csv
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 14_csv-region-summary-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - 14_csv-paid-orders-mastery
    title: 지역별 주문 합계를 CSV로 저장하기
    subtitle: DictReader에서 DictWriter로 이동
    goal: 주문 CSV를 읽어 region별 total을 계산하고 새 CSV 파일로 저장한다.
    why: CSV 자동화는 읽기에서 끝나지 않고, 검증된 요약 파일을 다시 다른 도구가 읽을 수 있게 써야 실무 흐름이 완성됩니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 이번에는 집계 결과를 파일로 남기세요.
    tips:
    - DictWriter에 fieldnames=["region", "total"]를 지정하고 writeheader를 호출하세요.
    - 반환 path는 verifier가 fixture root 기준 상대경로로 정규화합니다.
    exercise:
      prompt: write_region_summary(source_path, target_path)가 path, rowCount, totals를 담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        def write_region_summary(source_path, target_path):
            raise NotImplementedError
      solution: |-
        import csv
        from pathlib import Path

        def write_region_summary(source_path, target_path):
            totals = {}
            with open(source_path, "r", newline="", encoding="utf-8") as file:
                reader = csv.DictReader(file)
                for row in reader:
                    totals[row["region"]] = totals.get(row["region"], 0) + int(row["amount"])
            target = Path(target_path)
            target.parent.mkdir(parents=True, exist_ok=True)
            with target.open("w", newline="", encoding="utf-8") as file:
                writer = csv.DictWriter(file, fieldnames=["region", "total"])
                writer.writeheader()
                for region in sorted(totals):
                    writer.writerow({"region": region, "total": totals[region]})
            return {"path": str(target), "rowCount": len(totals), "totals": dict(sorted(totals.items()))}
      hints:
      - amount는 int로 바꿔 더해야 합니다.
      - 출력 CSV는 region 오름차순으로 쓰면 검증과 리뷰가 쉬워집니다.
    check:
      id: python.builtins.csv.region-summary.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.csv.orders.mastery.behavior.v1.fixture
      fixtureHash: sha256-qyC+9gaJ+toD6YovimHo3NeikjJ1bLBzUau8SoFrp0A=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files:
        - path: input/orders.csv
          content: |-
            orderId,region,amount,status
            A001,Seoul,120000,paid
            A002,Busan,45000,pending
            A003,Seoul,99000,paid
        - path: input/bad_orders.csv
          content: |-
            orderId,amount
            B001,10
        - path: input/people.tsv
          content: "name\\tage\\tcity\\nAlice\\t30\\tSeoul\\nBob\\t25\\tBusan"
        - path: input/products.psv
          content: |-
            product|amount|status
            laptop|1200|paid
            mouse|25|pending
        stdin: []
      packageAssets: []
      payload:
        entry: write_region_summary
        cases:
        - id: writes-region-summary
          arguments:
          - fixturePath: input/orders.csv
          - fixturePath: output/region-summary.csv
          expectedReturn:
            path: output/region-summary.csv
            rowCount: 2
            totals:
              Busan: 45000
              Seoul: 219000
        expectedPaths:
        - path: output/region-summary.csv
          kind: file
        normalizeReturnPaths:
        - path
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 14_csv-sniff-delimiter-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 14_csv-region-summary-transfer
    title: 구분자를 감지하고 행 수를 다시 확인하기
    subtitle: Sniffer와 reader 재구성
    goal: CSV 계열 파일의 delimiter를 감지하고 header, rowCount, firstRow를 반환한다.
    why: 시간이 지나도 CSV 실무에서 자주 막히는 지점은 쉼표가 아닌 구분자를 제대로 감지하는 능력입니다.
    explanation: 숙달 근거가 저장된 지 24시간이 지나면 자동으로 열립니다. sample을 읽고 seek(0) 후 같은 파일을 다시 reader에 넘기세요.
    tips:
    - csv.Sniffer().sniff(sample)로 dialect를 추론하세요.
    - header는 첫 행, firstRow는 첫 데이터 행입니다.
    exercise:
      prompt: sniff_delimiter_summary(path)가 delimiter, header, rowCount, firstRow를 담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        def sniff_delimiter_summary(path):
            raise NotImplementedError
      solution: |-
        import csv

        def sniff_delimiter_summary(path):
            with open(path, "r", newline="", encoding="utf-8") as file:
                sample = file.read(1024)
                file.seek(0)
                dialect = csv.Sniffer().sniff(sample)
                rows = list(csv.reader(file, dialect))
            header = rows[0] if rows else []
            data_rows = rows[1:]
            return {
                "delimiter": dialect.delimiter,
                "header": header,
                "rowCount": len(data_rows),
                "firstRow": data_rows[0] if data_rows else [],
            }
      hints:
      - sample을 읽은 뒤 file.seek(0)을 하지 않으면 실제 reader가 빈 결과를 받을 수 있습니다.
      - rowCount는 header를 제외한 데이터 행 수입니다.
    check:
      id: python.builtins.csv.sniff-delimiter.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.csv.orders.mastery.behavior.v1.fixture
      fixtureHash: sha256-qyC+9gaJ+toD6YovimHo3NeikjJ1bLBzUau8SoFrp0A=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files:
        - path: input/orders.csv
          content: |-
            orderId,region,amount,status
            A001,Seoul,120000,paid
            A002,Busan,45000,pending
            A003,Seoul,99000,paid
        - path: input/bad_orders.csv
          content: |-
            orderId,amount
            B001,10
        - path: input/people.tsv
          content: "name\\tage\\tcity\\nAlice\\t30\\tSeoul\\nBob\\t25\\tBusan"
        - path: input/products.psv
          content: |-
            product|amount|status
            laptop|1200|paid
            mouse|25|pending
        stdin: []
      packageAssets: []
      payload:
        entry: sniff_delimiter_summary
        cases:
        - id: tab-separated
          arguments:
          - fixturePath: input/people.tsv
          expectedReturn:
            delimiter: "\\t"
            header:
            - name
            - age
            - city
            rowCount: 2
            firstRow:
            - Alice
            - '30'
            - Seoul
        - id: pipe-separated
          arguments:
          - fixturePath: input/products.psv
          expectedReturn:
            delimiter: '|'
            header:
            - product
            - amount
            - status
            rowCount: 2
            firstRow:
            - laptop
            - '1200'
            - paid
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