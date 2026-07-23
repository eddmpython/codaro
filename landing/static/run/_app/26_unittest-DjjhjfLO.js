var e=`meta:
  id: 26_unittest
  title: unittest - 단위 테스트
  category: builtins
  tags:
  - unittest
  - 테스트
  - test
  - assert
  - TestCase
  description: 자동화된 테스트를 위한 unittest 모듈
  keywords:
  - unittest
  - 테스트
  - test
  - assert
  - TestCase
intro:
  emoji: ✅
  points:
  - 자동화된 단위 테스트
  - 다양한 assert 메서드
  - 테스트 픽스처 관리
  - 테스트 스위트 구성
  direction: unittest 단위 테스트에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.
  - unittest 단위 테스트 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 모듈 임포트 입력 확인
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.
    - label: Assert 메서드 처리 실행
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.
    - label: 테스트 픽스처 결과 검증
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.
    - label: unittest 단위 테스트 재사용
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 표준 라이브러리 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: unittest 단위 테스트 실행
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.
    - label: unittest 단위 테스트 완료
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.
sections:
- id: module_import
  title: 모듈 임포트
  structuredPrimary: true
  subtitle: unittest 시작하기
  goal: 모듈 임포트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    unittest는 파이썬 표준 라이브러리입니다. TestCase 클래스를 상속하여 테스트를 작성합니다.

    Codaro 로컬 Python 환경에서는 TestLoader와 TextTestRunner를 사용하여 테스트를 실행합니다. 일반적으로는 python -m unittest 명령으로 실행합니다.
  tips:
  - Codaro 로컬 Python 환경에서는 TestLoader와 TextTestRunner를 사용하여 테스트를 실행합니다. 일반적으로는 python -m unittest 명령으로
    실행합니다.
  snippet: |-
    import unittest

    class SimpleTest(unittest.TestCase):
        def testAddition(self):
            total = 2 + 2
            self.assertEqual(total, 4)

    suite = unittest.TestLoader().loadTestsFromTestCase(SimpleTest)
    runner = unittest.TextTestRunner(verbosity=0)
    outcome = runner.run(suite)

    outcome.wasSuccessful()
  exercise:
    prompt: 모듈 임포트 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      import unittest

      class SimpleTest(unittest.TestCase):
          def testAddition(self):
              total = 2 + 2
              self.assertEqual(total, 4)

      suite = unittest.TestLoader().loadTestsFromTestCase(SimpleTest)
      runner = unittest.TextTestRunner(verbosity=0)
      outcome = runner.run(suite)

      outcome.wasSuccessful()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    noError: 모듈 임포트의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 모듈 임포트 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: assert_methods
  title: Assert 메서드
  structuredPrimary: true
  subtitle: 검증 메서드들
  goal: Assert 메서드에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    TestCase는 다양한 assert 메서드를 제공하여 값을 검증할 수 있습니다.

    각 assert 메서드는 실패 시 자동으로 상세한 에러 메시지를 생성합니다. msg 파라미터로 커스텀 메시지를 추가할 수 있습니다.
  snippet: |-
    import unittest

    class AssertTest(unittest.TestCase):
        def testEqual(self):
            self.assertEqual(10, 10)

        def testTrue(self):
            self.assertTrue(5 > 3)

        def testFalse(self):
            self.assertFalse(2 > 5)

    loader = unittest.TestLoader().loadTestsFromTestCase(AssertTest)
    runner1 = unittest.TextTestRunner(verbosity=0)
    result1 = runner1.run(loader)

    result1.wasSuccessful()
  exercise:
    prompt: Assert 메서드 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      import unittest

      class AssertTest(unittest.TestCase):
          def testEqual(self):
              self.assertEqual(10, 10)

          def testTrue(self):
              self.assertTrue(5 > 3)

          def testFalse(self):
              self.assertFalse(2 > 5)

      loader = unittest.TestLoader().loadTestsFromTestCase(AssertTest)
      runner1 = unittest.TextTestRunner(verbosity=0)
      result1 = runner1.run(loader)

      result1.wasSuccessful()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    noError: Assert 메서드의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: Assert 메서드 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: fixtures
  title: 테스트 픽스처
  structuredPrimary: true
  subtitle: setUp과 tearDown
  goal: 테스트 픽스처에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    setUp()과 tearDown()으로 각 테스트 전후에 실행되는 코드를 정의할 수 있습니다.

    setUp()은 각 테스트 메서드마다 실행되므로, 테스트 간 독립성을 보장합니다. 테스트 순서에 의존하지 않는 코드를 작성하세요.
  snippet: |-
    import unittest

    class FixtureTest(unittest.TestCase):
        def setUp(self):
            self.data = [1, 2, 3]

        def testLength(self):
            self.assertEqual(len(self.data), 3)

        def testSum(self):
            self.assertEqual(sum(self.data), 6)

        def tearDown(self):
            self.data = None

    loader4 = unittest.TestLoader().loadTestsFromTestCase(FixtureTest)
    runner4 = unittest.TextTestRunner(verbosity=0)
    result4 = runner4.run(loader4)

    result4.wasSuccessful()
  exercise:
    prompt: 테스트 픽스처 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      import unittest

      class FixtureTest(unittest.TestCase):
          def setUp(self):
              self.data = [1, 2, 3]

          def testLength(self):
              self.assertEqual(len(self.data), 3)

          def testSum(self):
              self.assertEqual(sum(self.data), 6)

          def tearDown(self):
              self.data = None

      loader4 = unittest.TestLoader().loadTestsFromTestCase(FixtureTest)
      runner4 = unittest.TextTestRunner(verbosity=0)
      result4 = runner4.run(loader4)

      result4.wasSuccessful()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    noError: 테스트 픽스처의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 테스트 픽스처 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: exceptions
  title: 예외 테스트
  structuredPrimary: true
  subtitle: 에러 발생 검증
  goal: 예외 테스트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    assertRaises()로 특정 예외가 발생하는지 검증할 수 있습니다.

    assertRaises는 함수를 직접 호출하거나 with 문과 함께 사용할 수 있습니다. with 문이 더 유연하고 읽기 쉽습니다.
  snippet: |-
    import unittest

    class ExceptionTest(unittest.TestCase):
        def testZeroDivision(self):
            def divide():
                return 10 / 0

            self.assertRaises(ZeroDivisionError, divide)

        def testValueError(self):
            def convert():
                return int('abc')

            self.assertRaises(ValueError, convert)

    loader7 = unittest.TestLoader().loadTestsFromTestCase(ExceptionTest)
    runner7 = unittest.TextTestRunner(verbosity=0)
    result7 = runner7.run(loader7)

    result7.wasSuccessful()
  exercise:
    prompt: 예외 테스트 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      import unittest

      class ExceptionTest(unittest.TestCase):
          def testZeroDivision(self):
              def divide():
                  return 10 / 0

              self.assertRaises(ZeroDivisionError, divide)

          def testValueError(self):
              def convert():
                  return int('abc')

              self.assertRaises(ValueError, convert)

      loader7 = unittest.TestLoader().loadTestsFromTestCase(ExceptionTest)
      runner7 = unittest.TextTestRunner(verbosity=0)
      result7 = runner7.run(loader7)

      result7.wasSuccessful()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    noError: 예외 테스트의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 예외 테스트 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: test_organization
  title: 테스트 구성
  structuredPrimary: true
  subtitle: 스위트와 스킵
  goal: 테스트 구성에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    여러 테스트를 그룹화하거나 조건부로 스킵할 수 있습니다.

    subTest()를 사용하면 반복문에서 일부가 실패해도 나머지 케이스를 계속 테스트할 수 있습니다.
  snippet: |-
    import unittest

    class SkipTest(unittest.TestCase):
        def testNormal(self):
            self.assertTrue(True)

        @unittest.skip("작업 중")
        def testSkipped(self):
            self.fail("실행되면 안됨")

        @unittest.skipIf(True, "조건 만족")
        def testConditional(self):
            self.fail("실행되면 안됨")

    loader10 = unittest.TestLoader().loadTestsFromTestCase(SkipTest)
    runner10 = unittest.TextTestRunner(verbosity=0)
    result10 = runner10.run(loader10)

    result10.wasSuccessful()
  exercise:
    prompt: 테스트 구성 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      import unittest

      class SkipTest(unittest.TestCase):
          def testNormal(self):
              self.assertTrue(True)

          @unittest.skip("작업 중")
          def testSkipped(self):
              self.fail("실행되면 안됨")

          @unittest.skipIf(True, "조건 만족")
          def testConditional(self):
              self.fail("실행되면 안됨")

      loader10 = unittest.TestLoader().loadTestsFromTestCase(SkipTest)
      runner10 = unittest.TextTestRunner(verbosity=0)
      result10 = runner10.run(loader10)

      result10.wasSuccessful()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    noError: 테스트 구성의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 테스트 구성 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: mocking
  title: Mock 객체
  structuredPrimary: true
  subtitle: unittest.mock
  goal: Mock 객체에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    unittest.mock으로 테스트 더블(Mock, Patch)을 만들어 의존성을 제어할 수 있습니다.

    Mock 객체는 호출 횟수, 인자 등을 자동으로 기록하므로 상호작용을 쉽게 검증할 수 있습니다.
  snippet: |-
    import unittest
    from unittest.mock import Mock

    class MockTest(unittest.TestCase):
        def testMockBasic(self):
            mockFunc = Mock(return_value=42)
            output = mockFunc()
            self.assertEqual(output, 42)
            mockFunc.assert_called_once()

    loader13 = unittest.TestLoader().loadTestsFromTestCase(MockTest)
    runner13 = unittest.TextTestRunner(verbosity=0)
    result13 = runner13.run(loader13)

    result13.wasSuccessful()
  exercise:
    prompt: Mock 객체 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      import unittest
      from unittest.mock import Mock

      class MockTest(unittest.TestCase):
          def testMockBasic(self):
              mockFunc = Mock(return_value=42)
              output = mockFunc()
              self.assertEqual(output, 42)
              mockFunc.assert_called_once()

      loader13 = unittest.TestLoader().loadTestsFromTestCase(MockTest)
      runner13 = unittest.TextTestRunner(verbosity=0)
      result13 = runner13.run(loader13)

      result13.wasSuccessful()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    noError: Mock 객체의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: Mock 객체 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: practical
  title: 실전 활용
  structuredPrimary: true
  subtitle: 실무 테스트 패턴
  goal: 실전 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    실제 프로젝트에서 자주 사용되는 테스트 패턴들입니다.

    실제 프로젝트에서는 테스트 파일을 tests/ 디렉토리에 분리하고, python -m unittest discover로 자동 실행합니다.
  snippet: |-
    import unittest

    class Calculator:
        def add(self, a, b):
            return a + b
        def subtract(self, a, b):
            return a - b

    class CalculatorTest(unittest.TestCase):
        def setUp(self):
            self.calc = Calculator()

        def testAdd(self):
            self.assertEqual(self.calc.add(2, 3), 5)

        def testSubtract(self):
            self.assertEqual(self.calc.subtract(10, 3), 7)

    loader16 = unittest.TestLoader().loadTestsFromTestCase(CalculatorTest)
    runner16 = unittest.TextTestRunner(verbosity=0)
    result16 = runner16.run(loader16)

    result16.wasSuccessful()
  exercise:
    prompt: 실전 활용 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      import unittest

      class Calculator:
          def add(self, a, b):
              return a + b
          def subtract(self, a, b):
              return a - b

      class CalculatorTest(unittest.TestCase):
          def setUp(self):
              self.calc = Calculator()

          def testAdd(self):
              self.assertEqual(self.calc.add(2, 3), 5)

          def testSubtract(self):
              self.assertEqual(self.calc.subtract(10, 3), 7)

      loader16 = unittest.TestLoader().loadTestsFromTestCase(CalculatorTest)
      runner16 = unittest.TextTestRunner(verbosity=0)
      result16 = runner16.run(loader16)

      result16.wasSuccessful()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    noError: 실전 활용의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 실전 활용 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: workflow_validation
  title: '검증 루프: 테스트 결과 품질 게이트'
  structuredPrimary: true
  subtitle: 예측 → 실행 → 오류 수정 → 검증
  goal: '검증 루프: 테스트 결과 품질 게이트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: unittest는 성공하는 테스트만 보여주면 학습 효과가 약합니다. 실패를 재현하고, 실패 원인을 확인한 뒤, 수정된 테스트가 통과하는 흐름까지 확인해야 실제
    업무 테스트 작성으로 이어집니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import io

    def runTestCase(testCase):
        stream = io.StringIO()
        suite = unittest.TestLoader().loadTestsFromTestCase(testCase)
        result = unittest.TextTestRunner(stream=stream, verbosity=2).run(suite)
        return result, stream.getvalue()

    def normalizeEmail(value):
        normalized = value.strip().lower()
        if '@' not in normalized:
            raise ValueError('invalid email')
        return normalized

    class EmailValidationPassTest(unittest.TestCase):
        def testNormalizeEmail(self):
            self.assertEqual(normalizeEmail(' USER@Example.COM '), 'user@example.com')

        def testInvalidEmail(self):
            with self.assertRaisesRegex(ValueError, 'invalid'):
                normalizeEmail('missing-domain')

    passResult, passOutput = runTestCase(EmailValidationPassTest)
    assert passResult.wasSuccessful()
    assert passResult.testsRun == 2
    passResult.wasSuccessful()
  exercise:
    prompt: '검증 루프: 테스트 결과 품질 게이트 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'
    starterCode: |-
      import io

      def runTestCase(testCase):
          stream = io.StringIO()
          suite = unittest.TestLoader().loadTestsFromTestCase(testCase)
          result = unittest.TextTestRunner(stream=stream, verbosity=2).run(suite)
          return result, stream.getvalue()

      def normalizeEmail(value):
          normalized = value.strip().lower()
          if '@' not in normalized:
              raise ValueError('invalid email')
          return normalized

      class EmailValidationPassTest(unittest.TestCase):
          def testNormalizeEmail(self):
              self.assertEqual(normalizeEmail(' USER@Example.COM '), 'user@example.com')

          def testInvalidEmail(self):
              with self.assertRaisesRegex(ValueError, 'invalid'):
                  normalizeEmail('missing-domain')

      passResult, passOutput = runTestCase(EmailValidationPassTest)
      assert passResult.wasSuccessful()
      assert passResult.testsRun == 2
      passResult.wasSuccessful()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    noError: '검증 루프: 테스트 결과 품질 게이트의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.'
    resultCheck: '검증 루프: 테스트 결과 품질 게이트 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'
- id: practice
  title: 종합 복습
  structuredPrimary: true
  subtitle: 작게 실행하고 결과를 확인하는 단계
  goal: 종합 복습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: 종합 복습의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import unittest

    class Practice1(unittest.TestCase):
        def testBasic(self):
            self.assertEqual(5 + 5, 10)

    s1 = unittest.TestLoader().loadTestsFromTestCase(Practice1)
    r1 = unittest.TextTestRunner(verbosity=0).run(s1)
    r1.wasSuccessful()
  exercise:
    prompt: 종합 복습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      import unittest

      class Practice1(unittest.TestCase):
          def testBasic(self):
              self.assertEqual(5 + 5, 10)

      s1 = unittest.TestLoader().loadTestsFromTestCase(Practice1)
      r1 = unittest.TextTestRunner(verbosity=0).run(s1)
      r1.wasSuccessful()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    noError: 종합 복습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 복습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 26_unittest-email-validation-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - workflow_validation
    - assert_methods
    title: 이메일 정규화 테스트 결과를 runner summary로 검증하기
    subtitle: TestCase, assertEqual, assertRaisesRegex
    goal: 정상 이메일과 잘못된 이메일 샘플을 unittest로 실행하고 testsRun, success, failure/error count를 반환한다.
    why: 숙달 검증은 assert 문을 썼는지가 아니라 TestRunner 결과 객체가 기대한 테스트 수와 성공 상태를 증명하는지 확인합니다.
    explanation: run_email_validation_tests(samples)를 완성해 valid/invalid 샘플을 TestCase로 검증하고 결과 요약을 dict로 반환하세요.
    tips:
    - TextTestRunner에는 io.StringIO stream을 넘겨 화면 출력 대신 실행 결과를 캡처하세요.
    - 실패 여부는 result.wasSuccessful(), len(result.failures), len(result.errors)로 판단하세요.
    exercise:
      prompt: run_email_validation_tests(samples)를 완성해 이메일 정규화 테스트를 실행하고 테스트 결과 요약을 반환하세요.
      starterCode: |-
        def run_email_validation_tests(samples):
            raise NotImplementedError
      solution: |-
        import io
        import unittest

        def run_email_validation_tests(samples):
            if not samples:
                raise ValueError("samples required")

            def normalize_email(value):
                normalized = value.strip().lower()
                if "@" not in normalized:
                    raise ValueError("invalid email")
                return normalized

            valid = samples.get("valid", [])
            invalid = samples.get("invalid", [])

            class EmailValidationTest(unittest.TestCase):
                def test_valid_emails(self):
                    for item in valid:
                        self.assertEqual(normalize_email(item["input"]), item["expected"])

                def test_invalid_emails(self):
                    for value in invalid:
                        with self.assertRaisesRegex(ValueError, "invalid"):
                            normalize_email(value)

            stream = io.StringIO()
            suite = unittest.TestLoader().loadTestsFromTestCase(EmailValidationTest)
            result = unittest.TextTestRunner(stream=stream, verbosity=2).run(suite)
            return {
                "testsRun": result.testsRun,
                "wasSuccessful": result.wasSuccessful(),
                "failureCount": len(result.failures),
                "errorCount": len(result.errors),
                "validCaseCount": len(valid),
                "invalidCaseCount": len(invalid),
            }
      hints:
      - valid 샘플은 assertEqual로, invalid 샘플은 assertRaisesRegex로 검증하세요.
      - samples가 비어 있으면 통과로 위장하지 말고 ValueError로 막으세요.
    check:
      id: python.builtins.unittest.email-validation.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.unittest.empty.behavior.v1.fixture
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
        entry: run_email_validation_tests
        cases:
        - id: runs-email-validation-suite
          arguments:
          - value:
              valid:
              - input: ' USER@Example.COM '
                expected: user@example.com
              - input: admin@codaro.dev
                expected: admin@codaro.dev
              invalid:
              - missing-domain
              - blank
          expectedReturn:
            testsRun: 2
            wasSuccessful: true
            failureCount: 0
            errorCount: 0
            validCaseCount: 2
            invalidCaseCount: 2
        - id: rejects-empty-samples
          arguments:
          - value: {}
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 26_unittest-failure-report-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - assert_methods
    - test_organization
    title: 실패하는 테스트 실행 결과에서 실패 case id 추출하기
    subtitle: TestSuite와 result.failures
    goal: 비교 case 목록을 TestSuite로 실행하고 실패한 case id와 실패 개수를 반환한다.
    why: 전이 과제에서는 전부 통과하는 테스트에서 벗어나, 실패를 숨기지 않고 결과 객체에서 읽어내는 능력을 확인합니다.
    explanation: summarize_failure_report(pairs)가 각 pair를 unittest case로 실행하고 testsRun, failureCount, failureCaseIds, outputHasFailure를
      반환하게 만드세요.
    tips:
    - TestSuite에 TestCase 인스턴스를 직접 넣으면 입력 case별로 독립 테스트를 만들 수 있습니다.
    - result.failures에는 실패한 test 객체와 traceback text가 함께 들어 있습니다.
    exercise:
      prompt: summarize_failure_report(pairs)를 완성해 실패한 비교 case id를 추출하고 runner output에 FAIL이 있었는지 반환하세요.
      starterCode: |-
        def summarize_failure_report(pairs):
            raise NotImplementedError
      solution: |-
        import io
        import unittest

        def summarize_failure_report(pairs):
            class ComparisonTest(unittest.TestCase):
                def __init__(self, methodName, case):
                    super().__init__(methodName)
                    self.case = case

                def test_pair(self):
                    self.assertEqual(self.case["actual"], self.case["expected"])

            suite = unittest.TestSuite(
                ComparisonTest("test_pair", case) for case in pairs
            )
            stream = io.StringIO()
            result = unittest.TextTestRunner(stream=stream, verbosity=2).run(suite)
            return {
                "testsRun": result.testsRun,
                "wasSuccessful": result.wasSuccessful(),
                "failureCount": len(result.failures),
                "errorCount": len(result.errors),
                "failureCaseIds": [test.case["id"] for test, _text in result.failures],
                "outputHasFailure": "FAIL" in stream.getvalue(),
            }
      hints:
      - 실패를 예외로 다시 던지지 말고 result.failures에서 읽어야 합니다.
      - 실패 id는 test 객체에 저장한 case dict에서 가져오세요.
    check:
      id: python.builtins.unittest.failure-report.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.unittest.empty.behavior.v1.fixture
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
        entry: summarize_failure_report
        cases:
        - id: reports-one-failing-case
          arguments:
          - value:
            - id: ok-total
              actual: 10
              expected: 10
            - id: bad-total
              actual: 9
              expected: 10
            - id: ok-status
              actual: passed
              expected: passed
          expectedReturn:
            testsRun: 3
            wasSuccessful: false
            failureCount: 1
            errorCount: 0
            failureCaseIds:
            - bad-total
            outputHasFailure: true
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 26_unittest-fixture-lifecycle-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 26_unittest-failure-report-transfer
    title: setUp과 tearDown이 테스트마다 실행되는지 회상 검증하기
    subtitle: fixture lifecycle summary
    goal: 두 테스트 메서드를 실행해 setUp/tearDown 호출 횟수와 result summary를 반환한다.
    why: 시간이 지나도 남아야 할 unittest 감각은 fixture가 클래스당 한 번이 아니라 테스트 메서드마다 준비되고 정리된다는 점입니다.
    explanation: run_fixture_lifecycle(values)가 TestCase fixture 호출 횟수와 테스트 결과를 반환하게 만드세요.
    tips:
    - setUp에서 self.values를 새 list로 복사해 테스트 간 공유 상태를 줄이세요.
    - 테스트 메서드가 2개면 setUp과 tearDown도 각각 2번 실행됩니다.
    exercise:
      prompt: run_fixture_lifecycle(values)를 완성해 testsRun, success, failureCount, setUpCount, tearDownCount를 반환하세요.
      starterCode: |-
        def run_fixture_lifecycle(values):
            raise NotImplementedError
      solution: |-
        import io
        import unittest

        def run_fixture_lifecycle(values):
            lifecycle = {"setUp": 0, "tearDown": 0}

            class LifecycleTest(unittest.TestCase):
                def setUp(self):
                    lifecycle["setUp"] += 1
                    self.values = list(values)

                def tearDown(self):
                    lifecycle["tearDown"] += 1

                def test_total(self):
                    self.assertEqual(sum(self.values), 12)

                def test_unique_count(self):
                    self.assertEqual(len(set(self.values)), 3)

            stream = io.StringIO()
            suite = unittest.TestLoader().loadTestsFromTestCase(LifecycleTest)
            result = unittest.TextTestRunner(stream=stream, verbosity=2).run(suite)
            return {
                "testsRun": result.testsRun,
                "wasSuccessful": result.wasSuccessful(),
                "failureCount": len(result.failures),
                "setUpCount": lifecycle["setUp"],
                "tearDownCount": lifecycle["tearDown"],
            }
      hints:
      - lifecycle dict는 바깥 scope에 두고 setUp/tearDown에서 값을 증가시키세요.
      - 테스트 메서드가 늘어나면 fixture 호출 횟수도 함께 늘어납니다.
    check:
      id: python.builtins.unittest.fixture-lifecycle.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.unittest.empty.behavior.v1.fixture
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
        entry: run_fixture_lifecycle
        cases:
        - id: counts-fixture-lifecycle
          arguments:
          - value:
            - 3
            - 4
            - 5
          expectedReturn:
            testsRun: 2
            wasSuccessful: true
            failureCount: 0
            setUpCount: 2
            tearDownCount: 2
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