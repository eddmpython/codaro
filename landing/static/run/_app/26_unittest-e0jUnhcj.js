var e=`meta:\r
  id: 26_unittest\r
  title: unittest - 단위 테스트\r
  category: builtins\r
  tags:\r
  - unittest\r
  - 테스트\r
  - test\r
  - assert\r
  - TestCase\r
  description: 자동화된 테스트를 위한 unittest 모듈\r
  keywords:\r
  - unittest\r
  - 테스트\r
  - test\r
  - assert\r
  - TestCase\r
intro:\r
  emoji: ✅\r
  points:\r
  - 자동화된 단위 테스트\r
  - 다양한 assert 메서드\r
  - 테스트 픽스처 관리\r
  - 테스트 스위트 구성\r
  direction: unittest 단위 테스트에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.\r
  - unittest 단위 테스트 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 모듈 임포트 입력 확인\r
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: Assert 메서드 처리 실행\r
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 테스트 픽스처 결과 검증\r
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.\r
    - label: unittest 단위 테스트 재사용\r
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 표준 라이브러리 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: unittest 단위 테스트 실행\r
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.\r
    - label: unittest 단위 테스트 완료\r
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.\r
sections:\r
- id: module_import\r
  title: 모듈 임포트\r
  structuredPrimary: true\r
  subtitle: unittest 시작하기\r
  goal: 모듈 임포트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    unittest는 파이썬 표준 라이브러리입니다. TestCase 클래스를 상속하여 테스트를 작성합니다.\r
\r
    Codaro 로컬 Python 환경에서는 TestLoader와 TextTestRunner를 사용하여 테스트를 실행합니다. 일반적으로는 python -m unittest 명령으로 실행합니다.\r
  tips:\r
  - Codaro 로컬 Python 환경에서는 TestLoader와 TextTestRunner를 사용하여 테스트를 실행합니다. 일반적으로는 python -m unittest 명령으로\r
    실행합니다.\r
  snippet: |-\r
    import unittest\r
\r
    class SimpleTest(unittest.TestCase):\r
        def testAddition(self):\r
            total = 2 + 2\r
            self.assertEqual(total, 4)\r
\r
    suite = unittest.TestLoader().loadTestsFromTestCase(SimpleTest)\r
    runner = unittest.TextTestRunner(verbosity=0)\r
    outcome = runner.run(suite)\r
\r
    outcome.wasSuccessful()\r
  exercise:\r
    prompt: 모듈 임포트 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import unittest\r
\r
      class SimpleTest(unittest.TestCase):\r
          def testAddition(self):\r
              total = 2 + 2\r
              self.assertEqual(total, 4)\r
\r
      suite = unittest.TestLoader().loadTestsFromTestCase(SimpleTest)\r
      runner = unittest.TextTestRunner(verbosity=0)\r
      outcome = runner.run(suite)\r
\r
      outcome.wasSuccessful()\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 모듈 임포트의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 모듈 임포트 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: assert_methods\r
  title: Assert 메서드\r
  structuredPrimary: true\r
  subtitle: 검증 메서드들\r
  goal: Assert 메서드에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    TestCase는 다양한 assert 메서드를 제공하여 값을 검증할 수 있습니다.\r
\r
    각 assert 메서드는 실패 시 자동으로 상세한 에러 메시지를 생성합니다. msg 파라미터로 커스텀 메시지를 추가할 수 있습니다.\r
  snippet: |-\r
    import unittest\r
\r
    class AssertTest(unittest.TestCase):\r
        def testEqual(self):\r
            self.assertEqual(10, 10)\r
\r
        def testTrue(self):\r
            self.assertTrue(5 > 3)\r
\r
        def testFalse(self):\r
            self.assertFalse(2 > 5)\r
\r
    loader = unittest.TestLoader().loadTestsFromTestCase(AssertTest)\r
    runner1 = unittest.TextTestRunner(verbosity=0)\r
    result1 = runner1.run(loader)\r
\r
    result1.wasSuccessful()\r
  exercise:\r
    prompt: Assert 메서드 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import unittest\r
\r
      class AssertTest(unittest.TestCase):\r
          def testEqual(self):\r
              self.assertEqual(10, 10)\r
\r
          def testTrue(self):\r
              self.assertTrue(5 > 3)\r
\r
          def testFalse(self):\r
              self.assertFalse(2 > 5)\r
\r
      loader = unittest.TestLoader().loadTestsFromTestCase(AssertTest)\r
      runner1 = unittest.TextTestRunner(verbosity=0)\r
      result1 = runner1.run(loader)\r
\r
      result1.wasSuccessful()\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: Assert 메서드의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: Assert 메서드 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: fixtures\r
  title: 테스트 픽스처\r
  structuredPrimary: true\r
  subtitle: setUp과 tearDown\r
  goal: 테스트 픽스처에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    setUp()과 tearDown()으로 각 테스트 전후에 실행되는 코드를 정의할 수 있습니다.\r
\r
    setUp()은 각 테스트 메서드마다 실행되므로, 테스트 간 독립성을 보장합니다. 테스트 순서에 의존하지 않는 코드를 작성하세요.\r
  snippet: |-\r
    import unittest\r
\r
    class FixtureTest(unittest.TestCase):\r
        def setUp(self):\r
            self.data = [1, 2, 3]\r
\r
        def testLength(self):\r
            self.assertEqual(len(self.data), 3)\r
\r
        def testSum(self):\r
            self.assertEqual(sum(self.data), 6)\r
\r
        def tearDown(self):\r
            self.data = None\r
\r
    loader4 = unittest.TestLoader().loadTestsFromTestCase(FixtureTest)\r
    runner4 = unittest.TextTestRunner(verbosity=0)\r
    result4 = runner4.run(loader4)\r
\r
    result4.wasSuccessful()\r
  exercise:\r
    prompt: 테스트 픽스처 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import unittest\r
\r
      class FixtureTest(unittest.TestCase):\r
          def setUp(self):\r
              self.data = [1, 2, 3]\r
\r
          def testLength(self):\r
              self.assertEqual(len(self.data), 3)\r
\r
          def testSum(self):\r
              self.assertEqual(sum(self.data), 6)\r
\r
          def tearDown(self):\r
              self.data = None\r
\r
      loader4 = unittest.TestLoader().loadTestsFromTestCase(FixtureTest)\r
      runner4 = unittest.TextTestRunner(verbosity=0)\r
      result4 = runner4.run(loader4)\r
\r
      result4.wasSuccessful()\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 테스트 픽스처의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 테스트 픽스처 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: exceptions\r
  title: 예외 테스트\r
  structuredPrimary: true\r
  subtitle: 에러 발생 검증\r
  goal: 예외 테스트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    assertRaises()로 특정 예외가 발생하는지 검증할 수 있습니다.\r
\r
    assertRaises는 함수를 직접 호출하거나 with 문과 함께 사용할 수 있습니다. with 문이 더 유연하고 읽기 쉽습니다.\r
  snippet: |-\r
    import unittest\r
\r
    class ExceptionTest(unittest.TestCase):\r
        def testZeroDivision(self):\r
            def divide():\r
                return 10 / 0\r
\r
            self.assertRaises(ZeroDivisionError, divide)\r
\r
        def testValueError(self):\r
            def convert():\r
                return int('abc')\r
\r
            self.assertRaises(ValueError, convert)\r
\r
    loader7 = unittest.TestLoader().loadTestsFromTestCase(ExceptionTest)\r
    runner7 = unittest.TextTestRunner(verbosity=0)\r
    result7 = runner7.run(loader7)\r
\r
    result7.wasSuccessful()\r
  exercise:\r
    prompt: 예외 테스트 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import unittest\r
\r
      class ExceptionTest(unittest.TestCase):\r
          def testZeroDivision(self):\r
              def divide():\r
                  return 10 / 0\r
\r
              self.assertRaises(ZeroDivisionError, divide)\r
\r
          def testValueError(self):\r
              def convert():\r
                  return int('abc')\r
\r
              self.assertRaises(ValueError, convert)\r
\r
      loader7 = unittest.TestLoader().loadTestsFromTestCase(ExceptionTest)\r
      runner7 = unittest.TextTestRunner(verbosity=0)\r
      result7 = runner7.run(loader7)\r
\r
      result7.wasSuccessful()\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 예외 테스트의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 예외 테스트 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: test_organization\r
  title: 테스트 구성\r
  structuredPrimary: true\r
  subtitle: 스위트와 스킵\r
  goal: 테스트 구성에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    여러 테스트를 그룹화하거나 조건부로 스킵할 수 있습니다.\r
\r
    subTest()를 사용하면 반복문에서 일부가 실패해도 나머지 케이스를 계속 테스트할 수 있습니다.\r
  snippet: |-\r
    import unittest\r
\r
    class SkipTest(unittest.TestCase):\r
        def testNormal(self):\r
            self.assertTrue(True)\r
\r
        @unittest.skip("작업 중")\r
        def testSkipped(self):\r
            self.fail("실행되면 안됨")\r
\r
        @unittest.skipIf(True, "조건 만족")\r
        def testConditional(self):\r
            self.fail("실행되면 안됨")\r
\r
    loader10 = unittest.TestLoader().loadTestsFromTestCase(SkipTest)\r
    runner10 = unittest.TextTestRunner(verbosity=0)\r
    result10 = runner10.run(loader10)\r
\r
    result10.wasSuccessful()\r
  exercise:\r
    prompt: 테스트 구성 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import unittest\r
\r
      class SkipTest(unittest.TestCase):\r
          def testNormal(self):\r
              self.assertTrue(True)\r
\r
          @unittest.skip("작업 중")\r
          def testSkipped(self):\r
              self.fail("실행되면 안됨")\r
\r
          @unittest.skipIf(True, "조건 만족")\r
          def testConditional(self):\r
              self.fail("실행되면 안됨")\r
\r
      loader10 = unittest.TestLoader().loadTestsFromTestCase(SkipTest)\r
      runner10 = unittest.TextTestRunner(verbosity=0)\r
      result10 = runner10.run(loader10)\r
\r
      result10.wasSuccessful()\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 테스트 구성의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 테스트 구성 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: mocking\r
  title: Mock 객체\r
  structuredPrimary: true\r
  subtitle: unittest.mock\r
  goal: Mock 객체에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    unittest.mock으로 테스트 더블(Mock, Patch)을 만들어 의존성을 제어할 수 있습니다.\r
\r
    Mock 객체는 호출 횟수, 인자 등을 자동으로 기록하므로 상호작용을 쉽게 검증할 수 있습니다.\r
  snippet: |-\r
    import unittest\r
    from unittest.mock import Mock\r
\r
    class MockTest(unittest.TestCase):\r
        def testMockBasic(self):\r
            mockFunc = Mock(return_value=42)\r
            output = mockFunc()\r
            self.assertEqual(output, 42)\r
            mockFunc.assert_called_once()\r
\r
    loader13 = unittest.TestLoader().loadTestsFromTestCase(MockTest)\r
    runner13 = unittest.TextTestRunner(verbosity=0)\r
    result13 = runner13.run(loader13)\r
\r
    result13.wasSuccessful()\r
  exercise:\r
    prompt: Mock 객체 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import unittest\r
      from unittest.mock import Mock\r
\r
      class MockTest(unittest.TestCase):\r
          def testMockBasic(self):\r
              mockFunc = Mock(return_value=42)\r
              output = mockFunc()\r
              self.assertEqual(output, 42)\r
              mockFunc.assert_called_once()\r
\r
      loader13 = unittest.TestLoader().loadTestsFromTestCase(MockTest)\r
      runner13 = unittest.TextTestRunner(verbosity=0)\r
      result13 = runner13.run(loader13)\r
\r
      result13.wasSuccessful()\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: Mock 객체의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: Mock 객체 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: practical\r
  title: 실전 활용\r
  structuredPrimary: true\r
  subtitle: 실무 테스트 패턴\r
  goal: 실전 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    실제 프로젝트에서 자주 사용되는 테스트 패턴들입니다.\r
\r
    실제 프로젝트에서는 테스트 파일을 tests/ 디렉토리에 분리하고, python -m unittest discover로 자동 실행합니다.\r
  snippet: |-\r
    import unittest\r
\r
    class Calculator:\r
        def add(self, a, b):\r
            return a + b\r
        def subtract(self, a, b):\r
            return a - b\r
\r
    class CalculatorTest(unittest.TestCase):\r
        def setUp(self):\r
            self.calc = Calculator()\r
\r
        def testAdd(self):\r
            self.assertEqual(self.calc.add(2, 3), 5)\r
\r
        def testSubtract(self):\r
            self.assertEqual(self.calc.subtract(10, 3), 7)\r
\r
    loader16 = unittest.TestLoader().loadTestsFromTestCase(CalculatorTest)\r
    runner16 = unittest.TextTestRunner(verbosity=0)\r
    result16 = runner16.run(loader16)\r
\r
    result16.wasSuccessful()\r
  exercise:\r
    prompt: 실전 활용 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import unittest\r
\r
      class Calculator:\r
          def add(self, a, b):\r
              return a + b\r
          def subtract(self, a, b):\r
              return a - b\r
\r
      class CalculatorTest(unittest.TestCase):\r
          def setUp(self):\r
              self.calc = Calculator()\r
\r
          def testAdd(self):\r
              self.assertEqual(self.calc.add(2, 3), 5)\r
\r
          def testSubtract(self):\r
              self.assertEqual(self.calc.subtract(10, 3), 7)\r
\r
      loader16 = unittest.TestLoader().loadTestsFromTestCase(CalculatorTest)\r
      runner16 = unittest.TextTestRunner(verbosity=0)\r
      result16 = runner16.run(loader16)\r
\r
      result16.wasSuccessful()\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 실전 활용의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 실전 활용 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: '검증 루프: 테스트 결과 품질 게이트'\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → 오류 수정 → 검증\r
  goal: '검증 루프: 테스트 결과 품질 게이트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: unittest는 성공하는 테스트만 보여주면 학습 효과가 약합니다. 실패를 재현하고, 실패 원인을 확인한 뒤, 수정된 테스트가 통과하는 흐름까지 확인해야 실제\r
    업무 테스트 작성으로 이어집니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import io\r
\r
    def runTestCase(testCase):\r
        stream = io.StringIO()\r
        suite = unittest.TestLoader().loadTestsFromTestCase(testCase)\r
        result = unittest.TextTestRunner(stream=stream, verbosity=2).run(suite)\r
        return result, stream.getvalue()\r
\r
    def normalizeEmail(value):\r
        normalized = value.strip().lower()\r
        if '@' not in normalized:\r
            raise ValueError('invalid email')\r
        return normalized\r
\r
    class EmailValidationPassTest(unittest.TestCase):\r
        def testNormalizeEmail(self):\r
            self.assertEqual(normalizeEmail(' USER@Example.COM '), 'user@example.com')\r
\r
        def testInvalidEmail(self):\r
            with self.assertRaisesRegex(ValueError, 'invalid'):\r
                normalizeEmail('missing-domain')\r
\r
    passResult, passOutput = runTestCase(EmailValidationPassTest)\r
    assert passResult.wasSuccessful()\r
    assert passResult.testsRun == 2\r
    passResult.wasSuccessful()\r
  exercise:\r
    prompt: '검증 루프: 테스트 결과 품질 게이트 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      import io\r
\r
      def runTestCase(testCase):\r
          stream = io.StringIO()\r
          suite = unittest.TestLoader().loadTestsFromTestCase(testCase)\r
          result = unittest.TextTestRunner(stream=stream, verbosity=2).run(suite)\r
          return result, stream.getvalue()\r
\r
      def normalizeEmail(value):\r
          normalized = value.strip().lower()\r
          if '@' not in normalized:\r
              raise ValueError('invalid email')\r
          return normalized\r
\r
      class EmailValidationPassTest(unittest.TestCase):\r
          def testNormalizeEmail(self):\r
              self.assertEqual(normalizeEmail(' USER@Example.COM '), 'user@example.com')\r
\r
          def testInvalidEmail(self):\r
              with self.assertRaisesRegex(ValueError, 'invalid'):\r
                  normalizeEmail('missing-domain')\r
\r
      passResult, passOutput = runTestCase(EmailValidationPassTest)\r
      assert passResult.wasSuccessful()\r
      assert passResult.testsRun == 2\r
      passResult.wasSuccessful()\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: '검증 루프: 테스트 결과 품질 게이트의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.'\r
    resultCheck: '검증 루프: 테스트 결과 품질 게이트 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: 종합 복습\r
  structuredPrimary: true\r
  subtitle: 작게 실행하고 결과를 확인하는 단계\r
  goal: 종합 복습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: 종합 복습의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import unittest\r
\r
    class Practice1(unittest.TestCase):\r
        def testBasic(self):\r
            self.assertEqual(5 + 5, 10)\r
\r
    s1 = unittest.TestLoader().loadTestsFromTestCase(Practice1)\r
    r1 = unittest.TextTestRunner(verbosity=0).run(s1)\r
    r1.wasSuccessful()\r
  exercise:\r
    prompt: 종합 복습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import unittest\r
\r
      class Practice1(unittest.TestCase):\r
          def testBasic(self):\r
              self.assertEqual(5 + 5, 10)\r
\r
      s1 = unittest.TestLoader().loadTestsFromTestCase(Practice1)\r
      r1 = unittest.TextTestRunner(verbosity=0).run(s1)\r
      r1.wasSuccessful()\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:
    noError: 종합 복습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 복습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 26_unittest-email-validation-mastery
    mode: mastery
    unseen: false
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
              - input: " USER@Example.COM "
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
    explanation: summarize_failure_report(pairs)가 각 pair를 unittest case로 실행하고 testsRun, failureCount, failureCaseIds, outputHasFailure를 반환하게 만드세요.
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
  retrievalVariants:
  - id: 26_unittest-fixture-lifecycle-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - fixtures
    - practice
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
    minimumDelayHours: 24
`;export{e as default};