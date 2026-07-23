var e=`meta:\r
  id: devTools_githubIntro\r
  title: GitHub 소개 - 깃헙이 무엇인지 그림으로 이해하기\r
  order: 0\r
  category: devTools\r
  difficulty: ⭐\r
  badge: 읽기\r
  packages: []\r
  tags:\r
    - GitHub\r
    - Git\r
    - 버전관리\r
    - 협업\r
    - 개발교양\r
  outcomes:\r
    - devLiteracy.git\r
    - devLiteracy.github\r
  prerequisites: []\r
  estimatedMinutes: 15\r
  seo:\r
    title: "GitHub 소개 - 깃헙이 무엇인지 그림과 비유로 이해하기"\r
    description: "Git과 GitHub의 차이, 저장소·커밋·브랜치·풀 리퀘스트 같은 핵심 개념을 코드 없이 그림과 비유로 읽고 이해하는 한 파일 개발 교양 자료."\r
    keywords:\r
      - GitHub이란\r
      - Git GitHub 차이\r
      - 저장소 커밋 브랜치\r
      - 풀 리퀘스트\r
      - 버전 관리\r
\r
intro:\r
  direction: "GitHub이 무엇이고 왜 거의 모든 개발자가 쓰는지, Git과 어떻게 다른지를 코드 실행 없이 그림과 비유로 읽고 이해한다. 마지막 핵심 정리 체크리스트로 스스로 설명할 수 있는지 확인한다."\r
  benefits:\r
    - "Git과 GitHub의 차이를 한 문장으로 설명할 수 있다 - 가장 흔한 입문 오개념을 먼저 푼다."\r
    - "저장소·커밋·브랜치·풀 리퀘스트가 무엇인지 일상 비유로 구분할 수 있다."\r
    - "코드를 한 줄도 치지 않고, 개념 지도만 머릿속에 그린 뒤 다음 실습 트랙으로 넘어간다."\r
  diagram:\r
    steps:\r
      - label: "1. 버전 관리의 문제"\r
        detail: "보고서_최종_진짜최종 처럼 파일명에 버전을 붙이던 방식이 협업에서 왜 무너지는지 본다."\r
      - label: "2. Git이 푸는 것"\r
        detail: "변경 이력을 스냅샷(커밋)으로 쌓고 갈래(브랜치)로 나누는 Git의 버전 관리 모델을 이해한다."\r
      - label: "3. GitHub이 더하는 것"\r
        detail: "로컬 Git을 인터넷의 원격 저장소로 올려 협업·리뷰·공개를 가능하게 하는 GitHub의 역할을 본다."\r
      - label: "4. 협업 한 사이클"\r
        detail: "clone·branch·commit·push·풀 리퀘스트·merge로 남의 코드에 기여하는 한 바퀴를 따라간다."\r
    runtime:\r
      - label: "읽기 전용 개념 카드"\r
        detail: "이 자료는 코드 실행이 없는 개념 읽기 카드다. 그림·비교·비유로 GitHub의 큰 그림을 잡는다."\r
      - label: "다음 행동 - git 실습"\r
        detail: "개념을 잡았다면 이어지는 git 실습 트랙에서 로컬 터미널로 실제 commit·push를 쳐본다."\r
\r
sections:\r
  - id: hook\r
    title: "1. GitHub은 코드의 공유 플랫폼이다"\r
    blocks:\r
      - type: hero\r
        title: "GitHub - 전 세계 개발자가 코드를 모으고 함께 고치는 곳"\r
        subtitle: "코드용 구글 드라이브 + 협업 공간이라고 생각하면 가깝다"\r
        points:\r
          - emoji: "🌍"\r
            title: "세계 최대 코드 저장소"\r
            description: "수억 개의 프로젝트가 공개돼 있고, 회사 안팎의 협업이 여기서 일어난다."\r
          - emoji: "🤝"\r
            title: "혼자가 아니라 함께"\r
            description: "남의 코드를 읽고, 고치고, 내 코드를 공개하고 기여받는 일이 표준이 됐다."\r
          - emoji: "📜"\r
            title: "모든 변경이 기록된다"\r
            description: "누가 언제 무엇을 왜 바꿨는지가 전부 이력으로 남아 되돌릴 수 있다."\r
      - type: stat\r
        title: "GitHub의 규모 (왜 알아야 하나)"\r
        items:\r
          - { value: "1억+", label: "전 세계 개발자", accent: cyan }\r
          - { value: "4억+", label: "공개·비공개 저장소", accent: emerald }\r
          - { value: "사실상 표준", label: "오픈소스 협업의 중심", accent: sky }\r
\r
  - id: version_problem\r
    title: "2. 왜 버전 관리인가"\r
    blocks:\r
      - type: codeCompare\r
        title: "파일 버전을 관리하는 두 방식"\r
        subtitle: "왼쪽처럼 해본 적 있다면, 그 문제를 Git이 푼다"\r
        before:\r
          label: "수동 - 파일명에 버전 붙이기"\r
          code: |-\r
            보고서.docx\r
            보고서_최종.docx\r
            보고서_최종_진짜최종.docx\r
            보고서_최종_진짜최종_v2.docx\r
            보고서_최종_진짜최종_v2_김대리수정.docx\r
        after:\r
          label: "Git - 한 파일 + 이력"\r
          code: |-\r
            보고서.docx        # 파일은 하나, 모든 버전은 이력에\r
            $ git log --oneline\r
            d4e5f6  오타 수정\r
            a1b2c3  3분기 표 추가\r
            9f8e7d  초안 작성\r
      - type: text\r
        content: "파일명에 버전을 붙이는 방식은 누가 무엇을 언제 왜 바꿨는지 알 수 없고, 협업하면 _김대리수정 _박과장수정 이 끝없이 늘어난다. Git은 파일을 하나로 두고 모든 변경을 '커밋' 이력으로 쌓아, 언제든 과거로 되돌리고 누가 무엇을 바꿨는지 추적한다."\r
\r
  - id: git_vs_github\r
    title: "3. Git과 GitHub은 다르다 - 1순위 오개념"\r
    blocks:\r
      - type: compare\r
        title: "Git ≠ GitHub"\r
        subtitle: "이 둘을 섞으면 이후 모든 설명이 헷갈린다"\r
        left:\r
          title: "Git"\r
          subtitle: "내 컴퓨터에서 도는 프로그램"\r
          icon: "💻"\r
          items:\r
            - "버전 관리 도구 자체 - 설치해서 쓰는 소프트웨어"\r
            - "인터넷이 없어도 로컬에서 커밋·브랜치가 된다"\r
            - "리누스 토르발스가 만든 오픈소스 명령어 도구"\r
        right:\r
          title: "GitHub"\r
          subtitle: "Git 결과물을 올리는 웹 서비스"\r
          icon: "🌐"\r
          items:\r
            - "Git 저장소를 인터넷에 올려두는 호스팅 플랫폼"\r
            - "협업·리뷰·이슈·공개 같은 기능을 얹은 회사 서비스"\r
            - "GitLab·Bitbucket 같은 경쟁 서비스도 있다"\r
      - type: note\r
        style: info\r
        title: "한 줄 정리"\r
        content: "Git은 '버전 관리 도구'(내 PC의 프로그램), GitHub은 'Git 저장소를 올려 협업하는 웹 서비스'다. Git 없이도 GitHub 웹은 볼 수 있고, GitHub 없이도 Git은 혼자 쓸 수 있다."\r
\r
  - id: core_concepts\r
    title: "4. 핵심 개념 4개"\r
    blocks:\r
      - type: featureCards\r
        title: "이 네 단어만 알면 절반은 끝"\r
        cards:\r
          - emoji: "📦"\r
            title: "저장소 (Repository)"\r
            description: "프로젝트 하나가 통째로 담기는 폴더. 코드·문서·이력이 다 들어간다."\r
          - emoji: "📸"\r
            title: "커밋 (Commit)"\r
            description: "그 순간의 변경을 메시지와 함께 찍는 스냅샷. 되돌릴 수 있는 저장 지점."\r
          - emoji: "🌿"\r
            title: "브랜치 (Branch)"\r
            description: "본줄기를 건드리지 않고 따로 작업하는 갈래. 실험·기능 개발용 평행 사본."\r
          - emoji: "🔀"\r
            title: "풀 리퀘스트 (PR)"\r
            description: "내 브랜치 변경을 본줄기에 합쳐 달라는 제안 + 리뷰 요청."\r
\r
  - id: definitions\r
    title: "5. 정확한 정의로 못박기"\r
    blocks:\r
      - type: definition\r
        title: "용어를 정확히"\r
        items:\r
          - term: 버전 관리\r
            english: version control\r
            meaning: 파일의 변경 이력을 시점별로 저장해 언제든 과거로 되돌리고 누가 무엇을 바꿨는지 추적하는 일.\r
            example: Git이 가장 널리 쓰이는 버전 관리 도구다.\r
            accent: cyan\r
          - term: 커밋\r
            english: commit\r
            meaning: 그 순간의 변경 묶음을 한 줄 메시지와 함께 저장하는 행위(또는 그 저장 지점).\r
            example: "git commit -m \\"3분기 표 추가\\" 가 커밋 하나를 만든다."\r
            accent: emerald\r
          - term: 원격 저장소\r
            english: remote\r
            meaning: 내 PC 밖(보통 GitHub)에 있는, 모두가 공유하는 기준 저장소.\r
            example: push로 올리고 pull로 내려받는다.\r
            accent: sky\r
\r
  - id: analogy\r
    title: "6. 익숙한 것에 빗대 보기"\r
    blocks:\r
      - type: conceptRow\r
        title: "GitHub 개념 ↔ 일상 비유"\r
        description: "낯선 용어를 이미 아는 것에 붙이면 한 번에 잡힌다"\r
        rows:\r
          - emoji: "📦"\r
            concept: "저장소(Repository)"\r
            explain: "프로젝트 전용 폴더 한 개 - 그 안에 코드·문서·기록이 모두 들어 있는 작업 상자."\r
            accent: cyan\r
          - emoji: "📸"\r
            concept: "커밋(Commit)"\r
            explain: "게임의 세이브 포인트 - 언제든 그 지점으로 되돌아갈 수 있게 현재 상태를 저장한다."\r
            accent: emerald\r
          - emoji: "🌿"\r
            concept: "브랜치(Branch)"\r
            explain: "원본을 복사해 만든 평행 우주 - 마음껏 실험하다 좋으면 본 줄기에 합치고, 아니면 버린다."\r
            accent: amber\r
          - emoji: "☁️"\r
            concept: "원격(Remote) / push·pull"\r
            explain: "구글 드라이브에 올리고(push) 내려받기(pull) - 내 작업을 모두의 기준본과 맞춘다."\r
            accent: sky\r
\r
  - id: flow\r
    title: "7. 코드가 오가는 그림"\r
    blocks:\r
      - type: image\r
        title: "내 PC ↔ GitHub ↔ 동료 PC"\r
        src: "/curriculum/devTools/githubFlow.svg"\r
        description: "각자 PC에서 작업한 뒤 GitHub에 올리면(push) 모두가 최신본을 받는다(pull). GitHub이 '모두의 기준본'을 보관하는 가운데 허브 역할을 한다."\r
\r
  - id: collab_cycle\r
    title: "8. 오픈소스 기여 한 사이클"\r
    blocks:\r
      - type: timeline\r
        title: "남의 프로젝트에 기여하는 흐름"\r
        subtitle: "각 단계가 앞 단계의 결과 위에서 일어난다"\r
        items:\r
          - { step: 1, title: "fork", description: "남의 저장소를 내 계정으로 복사한다." }\r
          - { step: 2, title: "clone", description: "내 사본을 로컬 PC로 내려받는다." }\r
          - { step: 3, title: "branch", description: "작업용 갈래를 따로 만든다(본줄기 보호)." }\r
          - { step: 4, title: "commit", description: "변경을 메시지와 함께 스냅샷으로 쌓는다." }\r
          - { step: 5, title: "push", description: "내 사본(원격)에 올린다." }\r
          - { step: 6, title: "pull request", description: "원본에 '합쳐 달라'고 제안하고 리뷰받는다." }\r
          - { step: 7, title: "merge", description: "리뷰가 통과하면 본줄기에 합쳐진다 - 기여 완료." }\r
\r
  - id: commit_habits\r
    title: "9. 좋은 커밋 메시지 습관"\r
    blocks:\r
      - type: doDont\r
        title: "커밋 메시지 - 권장 vs 지양"\r
        subtitle: "메시지는 미래의 나와 동료가 읽는 변경 이력이다"\r
        do:\r
          title: "권장 (Do)"\r
          items:\r
            - "무엇을 왜 바꿨는지 현재형 한 줄로 요약"\r
            - "한 커밋 = 한 가지 논리적 변경"\r
            - "예: '폐업 거래처 발행 차단 로직 추가'"\r
        dont:\r
          title: "지양 (Don't)"\r
          items:\r
            - "'수정', 'ㅁㄴㅇ', 'asdf' 같은 무의미한 메시지"\r
            - "10개의 무관한 변경을 한 커밋에 몰아넣기"\r
            - "무엇을 했는지 알 수 없는 'update' 한 단어"\r
\r
  - id: glossary\r
    title: "10. 자주 보는 용어 8개"\r
    blocks:\r
      - type: table\r
        title: "용어 → 뜻 → 비유"\r
        headers: ["용어", "뜻", "한 줄 비유"]\r
        rows:\r
          - ["repository (repo)", "프로젝트가 담긴 저장소", "프로젝트 폴더"]\r
          - ["commit", "변경을 기록한 스냅샷", "세이브 포인트"]\r
          - ["branch", "독립 작업 갈래", "평행 우주 사본"]\r
          - ["merge", "갈래를 본줄기에 합치기", "합본 만들기"]\r
          - ["clone", "원격 저장소를 내 PC로 복제", "통째로 내려받기"]\r
          - ["fork", "남의 저장소를 내 계정으로 복사", "내 사본 뜨기"]\r
          - ["pull request (PR)", "변경을 합쳐 달라는 제안+리뷰", "수정 제안서"]\r
          - ["issue", "할 일·버그·논의 기록표", "포스트잇 메모"]\r
\r
  - id: misconceptions\r
    title: "11. 흔한 오해 바로잡기"\r
    blocks:\r
      - type: misconception\r
        title: "초심자가 자주 하는 착각"\r
        items:\r
          - myth: "GitHub은 코드만 올리는 곳이다."\r
            truth: "문서·이력서·블로그·발표자료도 많이 올린다. 텍스트 기반이면 무엇이든 버전 관리할 수 있다."\r
          - myth: "공개하면 코드를 도둑맞는다."\r
            truth: "비공개(private) 저장소가 기본 제공된다. 공개는 선택이고, 오픈소스는 라이선스로 보호된다."\r
          - myth: "명령어를 다 외워야 쓸 수 있다."\r
            truth: "GitHub Desktop·VS Code·웹 UI로 버튼만 눌러도 대부분 된다. 명령어는 익숙해지며 천천히."\r
\r
  - id: summary\r
    title: "12. 핵심 정리"\r
    blocks:\r
      - type: summary\r
        title: "이것만 기억하세요 (TL;DR)"\r
        points:\r
          - "Git은 내 PC의 버전 관리 도구, GitHub은 그 결과를 올려 협업하는 웹 서비스다."\r
          - "저장소=프로젝트 폴더, 커밋=되돌릴 수 있는 저장 지점, 브랜치=평행 작업 사본."\r
          - "push로 올리고 pull로 내려받아 모두의 기준본과 맞춘다."\r
      - type: list\r
        style: check\r
        title: "스스로 설명할 수 있으면 충분하다"\r
        items:\r
          - "Git과 GitHub의 차이를 한 문장으로 말할 수 있다."\r
          - "저장소·커밋·브랜치·풀 리퀘스트를 일상 비유로 설명할 수 있다."\r
          - "fork→clone→branch→commit→push→PR→merge 흐름을 안다."\r
          - "공식 문서는 [GitHub Docs](https://docs.github.com/ko)에서 한국어로 볼 수 있다."\r
      - type: note\r
        style: tip\r
        title: "다음 단계"\r
        content: "개념이 잡혔다면, 이어지는 git 실습 트랙에서 로컬 터미널로 실제 \`git init\`·\`commit\`·\`push\`를 직접 쳐보며 손에 익힌다. 읽기에서 멈추지 말고 한 번은 직접 해보는 게 가장 빠른 길이다."\r
`;export{e as default};