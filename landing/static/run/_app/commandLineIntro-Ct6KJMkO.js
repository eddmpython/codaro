var e=`meta:\r
  id: devTools_commandLineIntro\r
  title: 명령줄 첫걸음 - 터미널에 글로 말 거는 법\r
  order: 1\r
  category: devTools\r
  difficulty: ⭐\r
  badge: 읽기\r
  packages: []\r
  tags:\r
    - 터미널\r
    - 명령줄\r
    - CLI\r
    - 셸\r
    - 개발교양\r
  outcomes:\r
    - devLiteracy.commandLine\r
  prerequisites: []\r
  estimatedMinutes: 15\r
  seo:\r
    title: "명령줄 첫걸음 - 터미널이 무엇이고 명령은 어떻게 읽나"\r
    description: "터미널·셸·프롬프트가 무엇인지, 명령이 프로그램+옵션+인자로 이루어진다는 구조를 실제 명령 분해와 터미널 세션 예시로 코드 실행 없이 읽고 이해하는 개발 교양 자료."\r
    keywords:\r
      - 터미널이란\r
      - 명령줄 기초\r
      - CLI 셸 프롬프트\r
      - pwd ls cd\r
      - 현재 작업 디렉터리\r
\r
intro:\r
  direction: "개발자가 검은 화면에 글자를 치는 그 '터미널'이 무엇이고, 왜 클릭 대신 타이핑으로 컴퓨터를 다루는지, 명령 한 줄이 어떤 부품으로 이루어지는지를 코드 실행 없이 그림과 세션 예시로 읽고 이해한다."\r
  benefits:\r
    - "터미널·셸·프롬프트가 각각 무엇인지 한 문장으로 구분할 수 있다."\r
    - "명령 한 줄을 프로그램·옵션·인자로 분해해, 처음 보는 명령도 구조를 추론할 수 있다."\r
    - "'잘못 치면 컴퓨터가 망가진다'는 두려움을 내려놓고, 안전하게 탐색하는 명령(pwd·ls·cd)을 머릿속에 그린다."\r
  diagram:\r
    steps:\r
      - label: "1. 터미널이란 무엇인가"\r
        detail: "클릭(GUI) 대신 글(CLI)로 컴퓨터에게 일을 시키는 창이 무엇인지, 셸·프롬프트와 함께 본다."\r
      - label: "2. 명령의 구조"\r
        detail: "명령 한 줄이 프로그램 + 옵션(플래그) + 인자로 이루어진다는 공통 문법을 분해해서 본다."\r
      - label: "3. 치면 무엇이 보이나"\r
        detail: "pwd·ls를 쳤을 때 실제로 어떤 출력이 나오는지 터미널 세션 예시로 미리 본다."\r
      - label: "4. 안전하게 돌아다니기"\r
        detail: "현재 위치(pwd)와 폴더 이동(cd)으로 파일 시스템을 탐색하는 한 바퀴를 따라간다."\r
    runtime:\r
      - label: "읽기 전용 개념 카드"\r
        detail: "코드 실행이 없는 개념 읽기 자료다. 명령 분해와 세션 예시로 명령줄의 큰 그림을 잡는다."\r
      - label: "다음 행동 - 직접 쳐보기"\r
        detail: "개념을 잡았다면 내 컴퓨터의 터미널을 열어 pwd·ls·cd를 직접 쳐보며 출력을 눈으로 확인한다."\r
\r
sections:\r
  - id: hook\r
    title: "1. 터미널은 컴퓨터에게 글로 말 거는 창이다"\r
    blocks:\r
      - type: hero\r
        title: "터미널 - 클릭 대신 글로 컴퓨터에게 일을 시키는 곳"\r
        subtitle: "마우스로 폴더를 더블클릭하는 대신, 'cd 폴더이름'이라고 적어 보내는 방식이다"\r
        points:\r
          - title: "더 빠르고 정확하다"\r
            description: "반복 작업을 글 한 줄로 끝내고, 똑같이 다시 실행하거나 기록으로 남길 수 있다."\r
          - title: "개발 도구의 공통 입구"\r
            description: "git·python·설치 도구 대부분이 터미널 명령으로 동작한다. 한 번 익히면 어디서나 쓴다."\r
          - title: "원격 컴퓨터도 다룬다"\r
            description: "화면 없는 서버는 클릭할 GUI가 없다. 글로 명령하는 터미널이 유일한 창구가 된다."\r
      - type: conceptRow\r
        title: "GUI와 CLI - 같은 일을 하는 두 가지 말투"\r
        rows:\r
          - concept: "GUI (클릭)"\r
            explain: "아이콘을 눈으로 찾아 마우스로 더블클릭한다. 직관적이지만 반복·자동화가 어렵다. 예: 탐색기에서 폴더를 클릭해 들어간다."\r
          - concept: "CLI (타이핑)"\r
            explain: "할 일을 글로 적어 보낸다. 처음엔 낯설지만 빠르고 반복·기록·자동화가 쉽다. 예: cd 폴더이름 으로 같은 폴더에 들어간다."\r
\r
  - id: terms\r
    title: "2. 셸·프롬프트·명령 - 세 단어 정리"\r
    blocks:\r
      - type: definition\r
        title: "용어를 정확히"\r
        items:\r
          - term: 터미널\r
            english: terminal\r
            meaning: 글로 명령을 입력하고 결과를 글로 돌려받는 창(앱). 우리가 보는 그 검은 화면이다.\r
            example: macOS의 '터미널', Windows의 'Windows Terminal'(또는 명령 프롬프트) 창이 터미널이다.\r
          - term: 셸\r
            english: shell\r
            meaning: 터미널 안에서 실제로 명령을 해석해 실행해 주는 프로그램. 터미널이 '창'이라면 셸은 '통역사'다.\r
            example: bash, zsh, PowerShell이 대표적인 셸이다.\r
          - term: 프롬프트\r
            english: prompt\r
            meaning: 셸이 '명령을 기다린다'고 알려주는 기호. 보통 $ 또는 > 로 끝나며, 그 뒤에 명령을 친다.\r
            example: "$ 뒤에 깜빡이는 커서가 '입력해도 좋다'는 신호다."\r
\r
  - id: anatomy\r
    title: "3. 명령 한 줄의 구조 - 분해해서 읽기"\r
    blocks:\r
      - type: text\r
        content: "처음 보는 명령도 외울 필요 없다. 명령은 거의 항상 '프로그램 + 옵션 + 인자'라는 같은 문법을 따른다. 한 줄을 부품으로 쪼개 읽는 습관이 명령줄 실력의 출발점이다."\r
      - type: anatomy\r
        title: "ls -la /Users/me 를 분해하면"\r
        code: "ls -la /Users/me"\r
        parts:\r
          - token: "ls"\r
            label: "프로그램"\r
            explain: "실행할 명령(프로그램)의 이름. 여기서는 'list' - 폴더 내용을 나열한다."\r
          - token: "-la"\r
            label: "옵션(플래그)"\r
            explain: "프로그램의 동작을 바꾸는 스위치. -l은 자세히, -a는 숨김 파일까지 보여준다. 보통 - 로 시작한다."\r
          - token: "/Users/me"\r
            label: "인자"\r
            explain: "프로그램이 작업할 대상. 여기서는 '어느 폴더를 나열할지'다. 생략하면 현재 폴더가 대상이 된다."\r
\r
  - id: see\r
    title: "4. 치면 무엇이 보이나 - 터미널 세션"\r
    blocks:\r
      - type: text\r
        content: "명령을 외우는 것보다 '치면 어떤 결과가 나오는가'를 아는 게 중요하다. 출력을 미리 알아야 정상인지 오류인지 판단할 수 있다. 아래는 실제 터미널에서 보이는 모습이다."\r
      - type: terminal\r
        title: "내가 지금 어디에 있나 - pwd 와 ls"\r
        lines:\r
          - { cmd: "pwd" }\r
          - { out: "/Users/me/projects" }\r
          - { cmd: "ls" }\r
          - { out: "codaro   notes.txt   report.xlsx" }\r
      - type: text\r
        content: "pwd(print working directory)는 '지금 내가 선 폴더'의 전체 경로를 알려주고, ls(list)는 그 폴더 안에 무엇이 있는지 나열한다. 길을 잃으면 늘 pwd로 현재 위치부터 확인한다."\r
      - type: note\r
        style: info\r
        title: "내 화면과 조금 달라도 정상 - OS 차이"\r
        content: '예시는 macOS·Linux 기준이다. Windows에서도 pwd·ls·cd는 거의 그대로 동작하지만, PowerShell은 출력 형식이 조금 다르고 경로 구분자가 / 대신 \\ 라서 폴더가 C:\\Users\\me 처럼 보인다. 명령의 구조는 같으니 화면 모양이 달라도 당황하지 말자.'\r
      - type: terminal\r
        title: "오타를 내면 - 에러도 글로 알려준다"\r
        lines:\r
          - { cmd: "pdw" }\r
          - { out: "command not found: pdw" }\r
      - type: text\r
        content: "없는 명령(pdw는 pwd 오타)을 치면 컴퓨터가 망가지는 게 아니라 '그런 명령 없다'고 글로 알려줄 뿐이다. 그래서 출력을 읽을 줄 아는 게 중요하다 - 정상인지, 오타인지, 진짜 오류인지는 화면의 글이 말해 준다."\r
\r
  - id: navigate\r
    title: "5. 돌아다니기 - cd 로 폴더 이동"\r
    blocks:\r
      - type: terminal\r
        title: "폴더로 들어갔다가 한 칸 나오기"\r
        lines:\r
          - { cmd: "pwd" }\r
          - { out: "/Users/me/projects" }\r
          - { cmd: "cd codaro" }\r
          - { cmd: "pwd" }\r
          - { out: "/Users/me/projects/codaro" }\r
          - { cmd: "cd .." }\r
          - { cmd: "pwd" }\r
          - { out: "/Users/me/projects" }\r
      - type: conceptRow\r
        title: "경로의 두 가지 점 - . 과 .."\r
        rows:\r
          - concept: ". (점 하나)"\r
            explain: "'지금 이 폴더'를 가리킨다. ./run.py 는 '현재 폴더의 run.py'라는 뜻이다."\r
          - concept: ".. (점 둘)"\r
            explain: "'한 단계 위 폴더(부모)'를 가리킨다. cd .. 는 '한 칸 밖으로 나가기'다."\r
\r
  - id: misconceptions\r
    title: "6. 초심자가 자주 하는 착각"\r
    blocks:\r
      - type: misconception\r
        title: "명령줄을 막는 세 가지 오해"\r
        items:\r
          - myth: "터미널은 해커나 고수만 쓰는 위험한 화면이다."\r
            truth: "그냥 글로 명령하는 평범한 입력창이다. 파일 탐색기로 하던 일을 글로 하는 것뿐이다."\r
          - myth: "명령을 잘못 치면 컴퓨터가 망가진다."\r
            truth: "pwd·ls·cd 같은 탐색 명령은 보기만 한다 - 아무것도 바꾸지 않는다. 위험한 명령은 따로 있고, 그건 배우면서 구분하게 된다."\r
          - myth: "수백 개 명령을 다 외워야 쓸 수 있다."\r
            truth: "매일 쓰는 건 열 개 안쪽이다. 나머지는 필요할 때 검색하면 된다. 중요한 건 명령의 '구조'를 읽는 힘이다."\r
\r
  - id: reference\r
    title: "7. 매일 쓰는 탐색 명령"\r
    blocks:\r
      - type: table\r
        title: "이 정도면 길을 잃지 않는다"\r
        headers: ["명령", "뜻", "한 줄 설명"]\r
        rows:\r
          - ["pwd", "print working directory", "지금 내가 선 폴더의 전체 경로를 보여준다"]\r
          - ["ls", "list", "현재 폴더 안의 파일·폴더를 나열한다"]\r
          - ["cd 폴더", "change directory", "그 폴더 안으로 들어간다"]\r
          - ["cd ..", "change directory up", "한 단계 위(부모) 폴더로 나온다"]\r
          - ["clear", "clear screen", "터미널 화면을 깨끗이 지운다(기록은 남는다)"]\r
      - type: note\r
        style: tip\r
        title: "외우지 않아도 되는 두 도우미"\r
        content: "Tab 키를 누르면 폴더·파일 이름을 자동완성해 준다 - 끝까지 칠 필요가 없다. 위쪽 화살표(↑)는 방금 친 명령을 다시 떠올려 줘서, 재입력 없이 반복하거나 살짝 고쳐 쓸 수 있다. 이 둘만 알아도 타이핑 부담이 확 준다."\r
\r
  - id: summary\r
    title: "8. 핵심 정리"\r
    blocks:\r
      - type: summary\r
        title: "이것만 기억하세요 (TL;DR)"\r
        points:\r
          - "터미널은 글로 명령하는 창, 셸은 그 명령을 해석하는 통역사, 프롬프트($)는 입력을 기다리는 신호다."\r
          - "명령은 거의 항상 '프로그램 + 옵션(- 로 시작) + 인자' 구조다 - 외우지 말고 분해해 읽는다."\r
          - "길을 잃으면 pwd로 현재 위치, ls로 내용, cd로 이동 - 이 셋이면 어디든 탐색한다."\r
      - type: list\r
        style: check\r
        title: "스스로 설명할 수 있으면 충분하다"\r
        items:\r
          - "터미널·셸·프롬프트의 차이를 한 문장으로 말할 수 있다."\r
          - "ls -la /path 를 프로그램·옵션·인자로 분해할 수 있다."\r
          - "pwd·ls·cd가 각각 무엇을 하는지, cd .. 가 어디로 가는지 안다."\r
          - "탐색 명령(pwd·ls·cd)은 안전하다는 걸 안다."\r
      - type: note\r
        style: tip\r
        title: "다음 단계"\r
        content: "개념이 잡혔다면 내 컴퓨터의 터미널(또는 Codaro 터미널)을 열어 pwd·ls·cd를 직접 쳐보자. pwd가 내 폴더 경로를 보여주는지, ls가 그 안의 파일을 나열하는지, cd로 들어갔다 cd ..로 나오는지 - 이 자료의 세션 예시와 맞춰 보면 된다. 읽기에서 멈추지 말고 한 번 손으로 쳐보는 순간 명령줄이 훨씬 가까워진다. 다음 읽기 자료에서는 같은 방식으로 git 명령을 분해해 본다."\r
`;export{e as default};