var e=`meta:\r
  id: email_06\r
  title: 첨부 자동 저장\r
  order: 6\r
  category: email\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  packages:\r
    - reportlab\r
  tags:\r
    - email.parser\r
    - BytesParser\r
    - walk\r
    - 첨부 저장\r
  outcomes:\r
    - automation.email.classify\r
  prerequisites:\r
    - automation.email.receive\r
  estimatedMinutes: 50\r
  seo:\r
    title: "메일 첨부 자동 저장 - BytesParser + walk + disposition"\r
    description: "받은 메일의 첨부 파일을 자동으로 폴더에 분류 저장한다. 사장님의 매주 150분 첨부 정리가 8초로."\r
    keywords:\r
      - 첨부 자동 저장\r
      - email.parser BytesParser\r
      - get_content_disposition\r
\r
intro:\r
  direction: "받은 메일의 첨부 파일을 코드로 자동 추출·저장한다. 세금계산서·견적서·계약서 PDF가 매주 30분 × 5일 손정리하던 작업이 8초로."\r
  benefits:\r
    - "사장님의 첨부 정리 150분/주를 8초로 줄인다."\r
    - "BytesParser + walk + get_content_disposition 세 메서드로 모든 첨부를 일관 처리."\r
    - "한글 파일명도 자동 디코딩되어 그대로 저장."\r
  diagram:\r
    steps:\r
      - label: "1. 메일을 바이트로 fetch"\r
        detail: "IMAP fetch '(RFC822)'로 원본 바이트 받기."\r
      - label: "2. BytesParser로 파싱"\r
        detail: "email.parser.BytesParser().parsebytes로 EmailMessage 객체 복원."\r
      - label: "3. walk + disposition"\r
        detail: "msg.walk()로 모든 파트 순회, get_content_disposition() == 'attachment'면 첨부."\r
      - label: "4. 폴더 저장"\r
        detail: "part.get_filename()으로 한글 파일명 받고 폴더에 쓰기."\r
    runtime:\r
      - label: "테스트 데이터"\r
        detail: "발송된 EmailMessage를 as_bytes로 직렬화해 BytesParser로 복원 - 외부 IMAP 의존 없이 검증."\r
      - label: "검증"\r
        detail: "추출된 첨부 파일이 폴더에 실제 생성됐는지 + 파일명/크기 assert."\r
\r
sections:\r
  - id: step1_serialize\r
    title: "1단계. 메일을 바이트로 직렬화"\r
    structuredPrimary: true\r
    subtitle: "msg.as_bytes()"\r
    goal: "EmailMessage를 바이트로 직렬화하고 BytesParser로 복원한다."\r
    why: "IMAP fetch가 돌려주는 바이트와 같은 형태입니다. 외부 IMAP 없이 본 강의 검증이 가능합니다."\r
    explanation: |-\r
      msg.as_bytes()로 전체 메시지를 바이트로 변환. email.parser.BytesParser().parsebytes(data)가 다시 EmailMessage 객체로 복원합니다. round-trip이 깨끗합니다.\r
    tips:\r
      - "as_bytes는 헤더·본문·첨부 모두 포함합니다. IMAP fetch 결과와 동일 구조."\r
    snippet: |-\r
      from email.message import EmailMessage\r
      from email.parser import BytesParser\r
      from email.policy import default\r
\r
      original = EmailMessage()\r
      original["From"] = "me@example.com"\r
      original["To"] = "you@example.com"\r
      original["Subject"] = "round trip"\r
      original.set_content("body", charset="utf-8")\r
\r
      serialized = original.as_bytes()\r
      restored = BytesParser(policy=default).parsebytes(serialized)\r
      restored["Subject"], restored.get_content().strip()\r
    exercise:\r
      prompt: "원본 Subject를 '복원 테스트'로 바꾸고 round-trip이 같은지 확인하세요."\r
      starterCode: |-\r
        from email.message import EmailMessage\r
        from email.parser import BytesParser\r
        from email.policy import default\r
\r
        original = EmailMessage()\r
        original["From"] = "me@example.com"\r
        original["To"] = "you@example.com"\r
        original["Subject"] = ___\r
        original.set_content("body", charset="utf-8")\r
\r
        restored = BytesParser(policy=default).parsebytes(original.as_bytes())\r
        restored["Subject"] == "복원 테스트"\r
      hints:\r
        - "한글 문자열 '복원 테스트'."\r
    check:\r
      noError: "policy=default 권장."\r
      resultCheck: "True 출력."\r
\r
  - id: step2_walk_attachments\r
    title: "2단계. walk로 첨부 찾기"\r
    structuredPrimary: true\r
    subtitle: "msg.walk() + get_content_disposition()"\r
    goal: "첨부가 들어간 메일을 만들고 walk로 첨부 파트만 골라낸다."\r
    why: "메시지 안의 첨부는 multipart 구조 안에 깊이 들어 있습니다. walk가 트리를 평면화해 순회 가능하게 해줍니다."\r
    explanation: |-\r
      msg.walk()는 모든 파트를 재귀적으로 yield합니다. get_content_disposition() == 'attachment'면 첨부 파트입니다. iter_attachments()도 동일 결과를 더 깔끔히 돌려주는 API.\r
    tips:\r
      - "policy=default로 파싱한 EmailMessage는 iter_attachments() 사용 가능. policy 없이 파싱하면 walk + 수동 필터."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from email.message import EmailMessage\r
      from email.parser import BytesParser\r
      from email.policy import default\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      workdir = TemporaryDirectory()\r
      pdfPath = Path(workdir.name) / "r.pdf"\r
      canvas = Canvas(str(pdfPath))\r
      canvas.drawString(72, 720, "x")\r
      canvas.showPage()\r
      canvas.save()\r
\r
      original = EmailMessage()\r
      original["From"] = "me@example.com"\r
      original["To"] = "you@example.com"\r
      original["Subject"] = "with attach"\r
      original.set_content("body", charset="utf-8")\r
      original.add_attachment(pdfPath.read_bytes(), maintype="application", subtype="pdf", filename="r.pdf")\r
\r
      restored = BytesParser(policy=default).parsebytes(original.as_bytes())\r
      attachments = [p for p in restored.iter_attachments()]\r
      [(p.get_filename(), p.get_content_type()) for p in attachments]\r
    exercise:\r
      prompt: "원본에 두 번째 첨부(data.csv, text/csv)를 추가하고 iter_attachments가 2개를 돌려주는지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from email.message import EmailMessage\r
        from email.parser import BytesParser\r
        from email.policy import default\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        workdir = TemporaryDirectory()\r
        pdfPath = Path(workdir.name) / "r.pdf"\r
        canvas = Canvas(str(pdfPath))\r
        canvas.drawString(72, 720, "x")\r
        canvas.showPage()\r
        canvas.save()\r
        csvPath = Path(workdir.name) / "data.csv"\r
        csvPath.write_text("a,b\\n1,2\\n", encoding="utf-8")\r
\r
        original = EmailMessage()\r
        original["From"] = "me@example.com"\r
        original["To"] = "you@example.com"\r
        original["Subject"] = "with attach"\r
        original.set_content("body", charset="utf-8")\r
        original.add_attachment(pdfPath.read_bytes(), maintype="application", subtype="pdf", filename="r.pdf")\r
        original.add_attachment(csvPath.read_bytes(), maintype="text", subtype="csv", filename=___)\r
\r
        restored = BytesParser(policy=default).parsebytes(original.as_bytes())\r
        len(list(restored.iter_attachments()))\r
      hints:\r
        - "문자열 'data.csv'."\r
    check:\r
      noError: "add_attachment 인자 키워드."\r
      resultCheck: "출력 2."\r
\r
  - id: step3_save_to_folder\r
    title: "3단계. 첨부를 폴더에 저장"\r
    structuredPrimary: true\r
    subtitle: "filename으로 파일 쓰기"\r
    goal: "복원된 메일의 첨부를 모두 폴더에 저장한다."\r
    why: "받은 첨부를 코드로 폴더에 정리하는 게 본 강의의 진짜 가치입니다. 매일 30분 손작업이 8초로 줄어듭니다."\r
    explanation: |-\r
      saveAttachments(msg, outFolder)가 모든 첨부 파트를 outFolder에 저장. 파일명은 part.get_filename(). 충돌 시 prefix를 두거나 timestamp 추가.\r
    tips:\r
      - "파일명이 None일 수도 있습니다 (이메일이 부적절하게 구성된 경우). 가드 추가 권장."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from email.message import EmailMessage\r
      from email.parser import BytesParser\r
      from email.policy import default\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      def saveAttachments(msg, outFolder):\r
          Path(outFolder).mkdir(exist_ok=True)\r
          saved = []\r
          for part in msg.iter_attachments():\r
              name = part.get_filename()\r
              if not name:\r
                  continue\r
              outPath = Path(outFolder) / name\r
              outPath.write_bytes(part.get_payload(decode=True) or b"")\r
              saved.append(outPath)\r
          return saved\r
\r
      workdir = TemporaryDirectory()\r
      base = Path(workdir.name)\r
      pdfPath = base / "r.pdf"\r
      canvas = Canvas(str(pdfPath))\r
      canvas.drawString(72, 720, "x")\r
      canvas.showPage()\r
      canvas.save()\r
      csvPath = base / "d.csv"\r
      csvPath.write_text("a,b\\n1,2\\n", encoding="utf-8")\r
\r
      original = EmailMessage()\r
      original["From"] = "me@example.com"\r
      original["To"] = "you@example.com"\r
      original["Subject"] = "s"\r
      original.set_content("body", charset="utf-8")\r
      original.add_attachment(pdfPath.read_bytes(), maintype="application", subtype="pdf", filename="세금계산서.pdf")\r
      original.add_attachment(csvPath.read_bytes(), maintype="text", subtype="csv", filename="거래내역.csv")\r
\r
      restored = BytesParser(policy=default).parsebytes(original.as_bytes())\r
      saved = saveAttachments(restored, base / "downloads")\r
      [p.name for p in saved]\r
    exercise:\r
      prompt: "saveAttachments를 빈 함수로 직접 작성하세요. 폴더 생성, iter_attachments 순회, filename이 None인 파트 건너뛰기, payload를 폴더에 쓰고 Path 리스트 반환까지 본인이 채워야 합니다. 한글 파일명 두 개로 검증합니다."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from email.message import EmailMessage\r
        from email.parser import BytesParser\r
        from email.policy import default\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        def saveAttachments(msg, outFolder):\r
            ___\r
\r
        workdir = TemporaryDirectory()\r
        base = Path(workdir.name)\r
        pdfPath1 = base / "a.pdf"\r
        Canvas(str(pdfPath1)).showPage();\r
        c1 = Canvas(str(pdfPath1)); c1.showPage(); c1.save()\r
        pdfPath2 = base / "b.pdf"\r
        c2 = Canvas(str(pdfPath2)); c2.showPage(); c2.save()\r
\r
        original = EmailMessage()\r
        original["From"] = "me@example.com"\r
        original["To"] = "you@example.com"\r
        original["Subject"] = "s"\r
        original.set_content("body", charset="utf-8")\r
        original.add_attachment(pdfPath1.read_bytes(), maintype="application", subtype="pdf", filename="청구서_5월.pdf")\r
        original.add_attachment(pdfPath2.read_bytes(), maintype="application", subtype="pdf", filename="계약서.pdf")\r
\r
        restored = BytesParser(policy=default).parsebytes(original.as_bytes())\r
        saved = saveAttachments(restored, base / "out")\r
        len(saved)\r
      hints:\r
        - "본체 골자: Path(outFolder).mkdir(exist_ok=True) → for part in msg.iter_attachments(): name=part.get_filename(); if not name: continue; (outFolder/name).write_bytes(part.get_payload(decode=True) or b'') → 리스트에 모아 반환."\r
    check:\r
      noError: "한글 파일명도 문자열."\r
      resultCheck: "출력 2."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션"\r
    subtitle: "월별 자동 정리 도구"\r
    goal: "첨부를 첨부 종류별 (PDF/CSV/이미지) 폴더로 자동 분류 저장한다."\r
    why: "1인 사장님이 매월 받는 세금계산서·견적서·계약서 PDF가 100개를 넘으면 손으로 폴더 분류만 한 시간이 사라집니다. Content-Type 기반 분류 + 발신자/월별 분류 두 패턴이 한 함수에 모이면 inbox만 비워도 회계·법무 자료가 자동 정리됩니다. 07강 IMAP 자동 이동과 결합되면 사람이 직접 메일을 열 필요가 사라집니다."\r
    explanation: |-\r
      미션: sortAttachmentsByType(msg, outFolder) -> dict[type, list[Path]] 함수. PDF는 pdf/, CSV는 csv/, 이미지는 image/ 하위 폴더로 분류.\r
    tips:\r
      - "Content-Type의 maintype/subtype으로 분류."\r
    snippet: |-\r
      from email.message import EmailMessage\r
      from email.parser import BytesParser\r
      from email.policy import default\r
    exercise:\r
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        ___\r
      hints:\r
        - "함수: sortAttachmentsByType(msg, outFolder) -> dict"\r
    check:\r
      noError: "함수 정의 + 분류."\r
      resultCheck: "각 타입별 폴더에 파일이 정확히 분류."\r
    blocks:\r
      - type: expansion\r
        title: "미션: 종류별 자동 분류"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from email.message import EmailMessage\r
              from email.parser import BytesParser\r
              from email.policy import default\r
              from reportlab.pdfgen.canvas import Canvas\r
\r
              def sortAttachmentsByType(msg, outFolder):\r
                  buckets = {"pdf": [], "csv": [], "image": [], "other": []}\r
                  for part in msg.iter_attachments():\r
                      name = part.get_filename()\r
                      if not name:\r
                          continue\r
                      maintype, subtype = part.get_content_type().split("/")\r
                      if maintype == "image":\r
                          bucket = "image"\r
                      elif subtype == "pdf":\r
                          bucket = "pdf"\r
                      elif subtype == "csv":\r
                          bucket = "csv"\r
                      else:\r
                          bucket = "other"\r
                      bucketDir = Path(outFolder) / bucket\r
                      bucketDir.mkdir(parents=True, exist_ok=True)\r
                      outPath = bucketDir / name\r
                      outPath.write_bytes(part.get_payload(decode=True) or b"")\r
                      buckets[bucket].append(outPath)\r
                  return buckets\r
\r
              missionDir = TemporaryDirectory()\r
              base = Path(missionDir.name)\r
              pdfPath = base / "r.pdf"\r
              canvas = Canvas(str(pdfPath))\r
              canvas.showPage()\r
              canvas.save()\r
              csvPath = base / "d.csv"\r
              csvPath.write_text("a,b\\n", encoding="utf-8")\r
\r
              original = EmailMessage()\r
              original["From"] = "me@example.com"\r
              original["To"] = "you@example.com"\r
              original["Subject"] = "s"\r
              original.set_content("body", charset="utf-8")\r
              original.add_attachment(pdfPath.read_bytes(), maintype="application", subtype="pdf", filename="r.pdf")\r
              original.add_attachment(csvPath.read_bytes(), maintype="text", subtype="csv", filename="d.csv")\r
\r
              restored = BytesParser(policy=default).parsebytes(original.as_bytes())\r
              result = sortAttachmentsByType(restored, base / "sorted")\r
              assert len(result["pdf"]) == 1\r
              assert len(result["csv"]) == 1\r
              {k: len(v) for k, v in result.items()}\r
      - type: expansion\r
        title: "미션2: 발신자·월별 폴더 분류"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              import re\r
              from datetime import datetime\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from email.message import EmailMessage\r
              from email.parser import BytesParser\r
              from email.policy import default\r
              from email.utils import parseaddr\r
              from reportlab.pdfgen.canvas import Canvas\r
\r
              def sortAttachmentsBySender(msg, outFolder, receivedAt=None):\r
                  receivedAt = receivedAt or datetime.utcnow()\r
                  _, address = parseaddr(msg.get("From", ""))\r
                  domain = address.split("@", 1)[-1].lower() if "@" in address else "unknown"\r
                  bucket = Path(outFolder) / re.sub(r"[^a-z0-9.-]", "_", domain) / receivedAt.strftime("%Y-%m")\r
                  bucket.mkdir(parents=True, exist_ok=True)\r
                  saved = []\r
                  for part in msg.iter_attachments():\r
                      name = part.get_filename()\r
                      if not name:\r
                          continue\r
                      target = bucket / name\r
                      target.write_bytes(part.get_payload(decode=True) or b"")\r
                      saved.append(target)\r
                  return saved\r
\r
              workdir = TemporaryDirectory()\r
              base = Path(workdir.name)\r
              pdfPath = base / "p.pdf"\r
              c = Canvas(str(pdfPath)); c.showPage(); c.save()\r
\r
              original = EmailMessage()\r
              original["From"] = "Vendor Bot <billing@vendor.com>"\r
              original["To"] = "me@example.com"\r
              original["Subject"] = "월간 청구서"\r
              original.set_content("body", charset="utf-8")\r
              original.add_attachment(pdfPath.read_bytes(), maintype="application", subtype="pdf", filename="청구서.pdf")\r
\r
              restored = BytesParser(policy=default).parsebytes(original.as_bytes())\r
              saved = sortAttachmentsBySender(restored, base / "by_sender", datetime(2026, 5, 1))\r
              assert saved[0].parts[-3] == "vendor.com"\r
              assert saved[0].parts[-2] == "2026-05"\r
              saved[0].name\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: list\r
        style: bullet\r
        items:\r
          - "발신자별 폴더 추가 분류 (sender/yyyy-mm/filename)"\r
          - "중복 파일명 처리 (timestamp suffix)"\r
          - "특정 확장자만 저장 (PDF만, 이미지만)"\r
          - "07강 결합 - 저장 후 메일을 'Processed' 폴더로 자동 이동"\r
          - "PDF 트랙 04강 결합 - 저장된 PDF 표를 자동 추출해 CSV로"\r
`;export{e as default};