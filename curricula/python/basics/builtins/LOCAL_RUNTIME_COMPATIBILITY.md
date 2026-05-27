# Codaro 로컬 Python 환경 가이드

## 실행 기준

Codaro 커리큘럼은 로컬 Python 커널을 기준으로 작성한다. 표준 라이브러리 예제는 실제 파일 시스템, 현재 작업 디렉터리, 프로세스 환경 변수, 네트워크 상태를 명확히 다루되, 삭제나 외부 프로세스 실행처럼 영향이 큰 작업은 임시 디렉터리와 확인 절차를 사용한다.

## 작성 원칙

- `tempfile`로 실습용 파일과 디렉터리를 만들고, 삭제 대상 경로를 코드에서 명확히 드러낸다.
- `os`, `pathlib`, `glob`, `shutil` 예제는 로컬 파일 시스템을 기준으로 설명한다.
- `sys.argv`, 표준 스트림, 환경 변수는 실행 세션에 따라 값이 달라질 수 있음을 설명한다.
- `socket`, `threading`, `multiprocessing`, `subprocess`는 금지 대상이 아니라 고급 모듈이다. 사용할 때는 목적, 플랫폼 차이, 실패 가능성, 정리 절차를 함께 적는다.
- 네트워크 예제는 `urllib.request.urlopen()` 같은 표준 API를 기본으로 사용하고, 인증이나 사이트 정책이 필요한 URL은 별도 설명을 둔다.

## 파일 작업 예시

```yaml
sections:
- id: "file_operations"
  title: "파일 작업"
  subtitle: "로컬 임시 디렉터리에서 안전하게 실습"
  blocks:
  - type: "note"
    content: "실습 파일은 tempfile로 만든 임시 디렉터리에 생성합니다. 실제 프로젝트 파일을 삭제하지 않도록 경로를 먼저 확인하세요."
  - type: "code"
    content: |-
      import os
      import tempfile

      tempDir = tempfile.mkdtemp()
      samplePath = os.path.join(tempDir, "sample.txt")

      with open(samplePath, "w", encoding="utf-8") as f:
          f.write("hello")

      os.path.exists(samplePath)
```

## 결론

로컬 실행에서는 예전 실행 제약을 전제로 모듈을 제외하지 않는다. 대신 위험도가 있는 API는 안전한 샘플 경로, 명시적인 설명, 실행 후 정리 코드까지 포함해 학습자가 실제 환경에서 이해하고 실행할 수 있게 만든다.
