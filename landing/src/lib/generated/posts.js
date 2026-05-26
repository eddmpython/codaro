export const posts = [
  {
    "slug": "shared-document-model",
    "title": "Codaro가 하나의 문서 모델을 쓰는 이유",
    "date": "2026-05-26",
    "description": "에디터, 커리큘럼, 자동화가 같은 셀 흐름을 공유해야 배운 코드가 실행되고 반복 업무로 이어질 수 있습니다.",
    "category": "codaro-news",
    "categoryLabel": "Codaro 소식",
    "categoryFolder": "01-codaro-news",
    "categoryPath": "/codaro/docs/blog/category/codaro-news",
    "series": "codaro-news",
    "seriesLabel": "Codaro 소식",
    "seriesOrder": 4,
    "thumbnail": "/codaro/brand/avatar-small.png",
    "cardPreview": "/codaro/docs/blog/assets/004-shared-document-model-map.svg",
    "draft": false,
    "url": "/codaro/docs/blog/shared-document-model",
    "html": "<h1>Codaro가 하나의 문서 모델을 쓰는 이유</h1>\n<p>Codaro에서 사용자는 Python을 배우고, 셀을 실행하고, 그 코드를 반복 업무 자동화로 키운다. 이 흐름이 끊기지 않으려면 에디터, 커리큘럼, 자동화가 서로 다른 자료 구조가 아니라 같은 파일과 셀 구조를 공유해야 한다.</p>\n<p>Codaro가 만들고 싶은 것은 기능을 많이 붙인 노트북이 아니다. 배운 코드가 실행 가능한 코드가 되고, 실행한 코드가 검증된 뒤 dry-run을 거친 자동화 후보가 되는 흐름이다.</p>\n<h2>화면은 달라도 흐름은 하나다</h2>\n<p>Codaro의 제품 표면은 채팅, 에디터, 커리큘럼, 자동화로 나뉜다.</p>\n<ul>\n<li>채팅에서는 목표를 말한다.</li>\n<li>커리큘럼에서는 학습 셀을 읽고 실행한다.</li>\n<li>에디터에서는 Python 셀과 Markdown 셀을 직접 고친다.</li>\n<li>자동화에서는 검증한 셀과 스크립트를 반복 실행 후보로 모은다.</li>\n</ul>\n<p>이 네 화면이 서로 다른 저장 형식을 쓰면 사용자는 같은 내용을 계속 옮겨야 한다. 학습에서 쓴 코드를 자동화로 가져가려면 복사, 수정, 재검증이 반복된다.</p>\n<p>Codaro는 이 단절을 줄이기 위해 같은 문서 모델을 제품 계약으로 맞추고 있다. 현재 학습 문서의 물리 타입은 <code>markdown</code>과 <code>code</code>를 중심으로 두고, 자동화 작성 경계에서는 <code>automation</code> block도 사용한다. 셀의 의미는 역할, 화면 표현, 실행 종류, 원본 payload 같은 metadata로 설명한다. 장기적으로는 <code>code</code>, <code>text</code>, <code>guide</code>, <code>widget</code>, <code>view</code>, <code>file</code> 같은 block 중심 모델로 확장할 수 있게 둔다.</p>\n<h2>커리큘럼도 실행되는 문서다</h2>\n<p>Codaro 커리큘럼은 읽기 전용 글이 아니다. <code>curricula/</code>의 YAML은 학습 셀 카드로 전개되고, 사용자는 그 안에서 예측하고, 실행하고, 오류를 고치고, 검증한다.</p>\n<p>좋은 레슨은 설명으로 끝나지 않는다.</p>\n<ol>\n<li>먼저 결과를 예측한다.</li>\n<li>로컬 Python 셀을 실행한다.</li>\n<li>실패하면 오류를 읽고 고친다.</li>\n<li><code>assert</code>나 출력 비교로 검증한다.</li>\n<li>값을 바꿔 실무 변주를 만든다.</li>\n</ol>\n<p>그래서 커리큘럼 셀은 에디터와 떨어진 별도 콘텐츠가 아니라, 같은 실행 흐름에 올라오는 문서 조각이어야 한다. 외부 패키지가 필요한 레슨도 마찬가지다. 필요한 패키지는 레슨의 <code>meta.packages</code>에 선언하고, 실행 전에는 <code>packages-check</code>로 확인한 뒤 누락된 경우에만 <code>packages-install</code>을 거쳐 <code>cell-call</code>로 실행한다.</p>\n<h2>자동화는 검증된 셀에서 시작한다</h2>\n<p>반복 업무 자동화도 같은 이유로 별도 세계가 되면 안 된다.</p>\n<p>Codaro의 자동화 작성 기준은 커리큘럼 YAML에 모든 것을 억지로 넣는 방식이 아니다. 검증한 Python 셀과 percent-format recipe를 바탕으로 automation 셀을 만들고, dry-run 결과를 확인한 뒤 task 등록 후보로 다룬다.</p>\n<p>예를 들어 공개 데모의 흐름은 작다.</p>\n<pre><code class=\"language-powershell\">uv run python -X utf8 demos/publicLaunch/expenseSummaryDemo.py\nuv run python -X utf8 demos/publicLaunch/fileOrganizerDemo.py\n</code></pre>\n<p>첫 번째 데모는 CSV를 읽어 요약 결과를 만든다. 두 번째 데모는 실제 파일을 옮기지 않고 dry-run 정리 계획을 보여준다. 이 데모들은 완성된 자동화 플랫폼의 과시가 아니라, Codaro가 자동화를 다루는 최소 기준을 보여준다. 실행 결과를 먼저 확인하고, 파일 이동 같은 변경 작업은 dry-run 검토 뒤에만 다음 단계로 보낸다.</p>\n<h2>local-first가 모델을 단순하게 만든다</h2>\n<p>Codaro는 로컬 Python 실행을 기본으로 둔다. 학습자가 셀을 실행하고, 결과를 보고, 파일과 패키지를 자기 환경 안에서 확인할 수 있어야 한다.</p>\n<p>이 기준은 문서 모델에도 영향을 준다. 셀은 화면 장식이 아니라 실행 단위다. <code>.py</code> percent format은 <code># %%</code> 경계로 셀을 나누면서도 파일 자체가 Python으로 실행될 수 있게 만든다. 그래서 같은 문서는 에디터에서는 노트북이고, 커리큘럼에서는 학습 단위이며, 자동화에서는 태스크 원본 후보가 될 수 있다.</p>\n<h2>지금 글에서 약속하는 것</h2>\n<p>이 글은 Codaro가 완성된 자동화 플랫폼이라고 말하려는 글이 아니다. 지금 공개적으로 말할 수 있는 것은 제품이 따르는 계약과 경계다.</p>\n<ul>\n<li>Codaro는 채팅, 에디터, 커리큘럼, 자동화를 하나의 흐름으로 설계한다.</li>\n<li>학습 YAML은 실행 가능한 셀 문서로 전개되는 방향을 가진다.</li>\n<li>자동화는 검증 없는 즉시 실행보다 dry-run과 태스크 등록 경계를 우선한다.</li>\n<li>공개 사이트와 문서는 이 판단을 검색 가능한 기록으로 남긴다.</li>\n</ul>\n<p>Codaro의 차별점은 기능 수가 아니라 연속성이다. 학습 셀에서 시작한 코드가 실행 결과로 확인되고, dry-run을 거쳐 task 후보가 되는 흐름을 만들고 있다. 하나의 문서 모델은 그 흐름을 끊지 않기 위한 제품 구조다.</p>\n",
    "text": "Codaro가 하나의 문서 모델을 쓰는 이유 Codaro에서 사용자는 Python을 배우고, 셀을 실행하고, 그 코드를 반복 업무 자동화로 키운다. 이 흐름이 끊기지 않으려면 에디터, 커리큘럼, 자동화가 서로 다른 자료 구조가 아니라 같은 파일과 셀 구조를 공유해야 한다. Codaro가 만들고 싶은 것은 기능을 많이 붙인 노트북이 아니다. 배운 코드가 실행 가능한 코드가 되고, 실행한 코드가 검증된 뒤 dry run을 거친 자동화 후보가 되는 흐름이다. 화면은 달라도 흐름은 하나다 Codaro의 제품 표면은 채팅, 에디터, 커리큘럼, 자동화로 나뉜다. 채팅에서는 목표를 말한다. 커리큘럼에서는 학습 셀을 읽고 실행한다. 에디터에서는 Python 셀과 Markdown 셀을 직접 고친다. 자동화에서는 검증한 셀과 스크립트를 반복 실행 후보로 모은다. 이 네 화면이 서로 다른 저장 형식을 쓰면 사용자는 같은 내용을 계속 옮겨야 한다. 학습에서 쓴 코드를 자동화로 가져가려면 복사, 수정, 재검증이 반복된다. Codaro는 이 단절을 줄이기 위해 같은 문서 모델을 제품 계약으로 맞추고 있다. 현재 학습 문서의 물리 타입은 과 를 중심으로 두고, 자동화 작성 경계에서는 block도 사용한다. 셀의 의미는 역할, 화면 표현, 실행 종류, 원본 payload 같은 metadata로 설명한다. 장기적으로는 , , , , , 같은 block 중심 모델로 확장할 수 있게 둔다. 커리큘럼도 실행되는 문서다 Codaro 커리큘럼은 읽기 전용 글이 아니다. 의 YAML은 학습 셀 카드로 전개되고, 사용자는 그 안에서 예측하고, 실행하고, 오류를 고치고, 검증한다. 좋은 레슨은 설명으로 끝나지 않는다. 1. 먼저 결과를 예측한다. 2. 로컬 Python 셀을 실행한다. 3. 실패하면 오류를 읽고 고친다. 4. 나 출력 비교로 검증한다. 5. 값을 바꿔 실무 변주를 만든다. 그래서 커리큘럼 셀은 에디터와 떨어진 별도 콘텐츠가 아니라, 같은 실행 흐름에 올라오는 문서 조각이어야 한다. 외부 패키지가 필요한 레슨도 마찬가지다. 필요한 패키지는 레슨의 에 선언하고, 실행 전에는 로 확인한 뒤 누락된 경우에만 을 거쳐 로 실행한다. 자동화는 검증된 셀에서 시작한다 반복 업무 자동화도 같은 이유로 별도 세계가 되면 안 된다. Codaro의 자동화 작성 기준은 커리큘럼 YAML에 모든 것을 억지로 넣는 방식이 아니다. 검증한 Python 셀과 percent format recipe를 바탕으로 automation 셀을 만들고, dry run 결과를 확인한 뒤 task 등록 후보로 다룬다. 예를 들어 공개 데모의 흐름은 작다. 첫 번째 데모는 CSV를 읽어 요약 결과를 만든다. 두 번째 데모는 실제 파일을 옮기지 않고 dry run 정리 계획을 보여준다. 이 데모들은 완성된 자동화 플랫폼의 과시가 아니라, Codaro가 자동화를 다루는 최소 기준을 보여준다. 실행 결과를 먼저 확인하고, 파일 이동 같은 변경 작업은 dry run 검토 뒤에만 다음 단계로 보낸다. local first가 모델을 단순하게 만든다 Codaro는 로컬 Python 실행을 기본으로 둔다. 학습자가 셀을 실행하고, 결과를 보고, 파일과 패키지를 자기 환경 안에서 확인할 수 있어야 한다. 이 기준은 문서 모델에도 영향을 준다. 셀은 화면 장식이 아니라 실행 단위다. percent format은 경계로 셀을 나누면서도 파일 자체가 Python으로 실행될 수 있게 만든다. 그래서 같은 문서는 에디터에서는 노트북이고, 커리큘럼에서는 학습 단위이며, 자동화에서는 태스크 원본 후보가 될 수 있다. 지금 글에서 약속하는 것 이 글은 Codaro가 완성된 자동화 플랫폼이라고 말하려는 글이 아니다. 지금 공개적으로 말할 수 있는 것은 제품이 따르는 계약과 경계다. Codaro는 채팅, 에디터, 커리큘럼, 자동화를 하나의 흐름으로 설계한다. 학습 YAML은 실행 가능한 셀 문서로 전개되는 방향을 가진다. 자동화는 검증 없는 즉시 실행보다 dry run과 태스크 등록 경계를 우선한다. 공개 사이트와 문서는 이 판단을 검색 가능한 기록으로 남긴다. Codaro의 차별점은 기능 수가 아니라 연속성이다. 학습 셀에서 시작한 코드가 실행 결과로 확인되고, dry run을 거쳐 task 후보가 되는 흐름을 만들고 있다. 하나의 문서 모델은 그 흐름을 끊지 않기 위한 제품 구조다."
  },
  {
    "slug": "react-github-pages",
    "title": "Codaro 공개 사이트를 React 기반 GitHub Pages로 전환했습니다",
    "date": "2026-05-26",
    "description": "Codaro 공개 사이트가 React + Vite 기반 GitHub Pages로 전환되며 랜딩, 문서, 블로그, 검색을 한 표면에서 제공합니다.",
    "category": "codaro-news",
    "categoryLabel": "Codaro 소식",
    "categoryFolder": "01-codaro-news",
    "categoryPath": "/codaro/docs/blog/category/codaro-news",
    "series": "codaro-news",
    "seriesLabel": "Codaro 소식",
    "seriesOrder": 3,
    "thumbnail": "/codaro/brand/avatar-small.png",
    "cardPreview": "/codaro/docs/blog/assets/003-react-github-pages-map.svg",
    "draft": false,
    "url": "/codaro/docs/blog/react-github-pages",
    "html": "<h1>Codaro 공개 사이트를 React 기반 GitHub Pages로 전환했습니다</h1>\n<p>Codaro 공개 사이트가 React + Vite 기반 정적 사이트로 전환됐다. 이제 랜딩, 문서, Codaro 소식, 검색 경로가 같은 React 표면에서 움직이고, GitHub Pages 배포 경로는 <code>https://eddmpython.github.io/codaro/</code> 하나로 정리된다.</p>\n<p>이번 전환의 목표는 단순히 프레임워크 이름을 바꾸는 것이 아니었다. 공개 사이트가 제품 설명, 문서, 블로그 발행, 검색, feed, sitemap을 함께 책임지는 구조가 되도록 만드는 것이 핵심이었다.</p>\n<h2>달라진 점</h2>\n<p>공개 사이트의 기준 경로는 그대로 <code>/codaro/</code>를 사용한다. 사용자가 보는 주요 경로는 아래처럼 정리됐다.</p>\n<ul>\n<li><code>/</code>: Codaro 랜딩</li>\n<li><code>/docs</code>: 제품 사상과 운영 기준 문서</li>\n<li><code>/docs/blog</code>: Codaro 소식</li>\n<li><code>/docs/blog/{slug}</code>: 개별 글</li>\n<li><code>/search</code>: 문서와 글 통합 검색</li>\n</ul>\n<p>기존 <code>/blog/...</code> 경로는 <code>/docs/blog/...</code>로 이어지도록 유지했다. 오래된 링크가 남아 있어도 공개 글로 이동할 수 있다.</p>\n<h2>블로그 발행 방식</h2>\n<p>블로그 원문은 <code>docs/blog/</code>에 둔다. 지금은 카테고리를 넓히지 않고 <code>Codaro 소식</code> 하나로 운영한다.</p>\n<p>새 글은 아래 정보를 반드시 가진다.</p>\n<ul>\n<li>제목</li>\n<li>날짜</li>\n<li>검색 설명문</li>\n<li><code>codaro-news</code> 카테고리</li>\n<li>카드 미리보기 이미지</li>\n<li>공개 여부</li>\n</ul>\n<p>빌드 단계에서는 이 원문을 읽어 글 목록, 검색 색인, feed, sitemap, canonical URL을 만든다. 그래서 글을 하나 발행할 때도 SEO 산출물이 같이 갱신된다.</p>\n<h2>왜 React 정적 사이트인가</h2>\n<p>Codaro의 실제 제품 표면은 <code>editor/</code>다. 공개 사이트는 제품 실행 표면과 역할이 다르다. 공개 사이트는 빠르게 읽히고, 검색 가능해야 하며, GitHub Pages에서 안정적으로 배포되어야 한다.</p>\n<p>React + Vite 정적 사이트로 바꾸면서 공개 표면은 다음 책임을 갖는다.</p>\n<ul>\n<li>첫 방문자가 제품 방향을 이해하는 랜딩</li>\n<li>저장소의 문서를 읽을 수 있는 문서 표면</li>\n<li>제품 진행 상황을 남기는 Codaro 소식</li>\n<li>문서와 글을 함께 찾는 검색</li>\n<li>feed, sitemap, canonical URL 생성</li>\n</ul>\n<p>이 구조는 글을 코드베이스 가까이에 두면서도 공개 사이트로 발행할 수 있게 만든다.</p>\n<h2>검증한 것</h2>\n<p>전환 후 아래 항목을 확인했다.</p>\n<pre><code class=\"language-powershell\">npm run check\nuv run python -X utf8 tests/run.py gate landing-build\n</code></pre>\n<p>로컬 미리보기에서는 홈, 문서, 블로그 목록, 글 상세, 검색, 레거시 블로그 경로를 확인했다. GitHub Pages 배포 뒤에는 공개 URL에서 새 title과 본문 문구가 내려오는 것도 확인했다.</p>\n<h2>다음 기준</h2>\n<p>앞으로 Codaro 소식은 제품이 실제로 어디까지 왔는지 보여주는 기록으로 쌓는다. 새 글은 공개 독자가 바로 이해할 수 있어야 하고, 문서와 검색에 함께 반영되어야 한다.</p>\n<p>Codaro 공개 사이트는 이제 제품 설명과 발행 체계를 동시에 가진 React 기반 GitHub Pages 표면이다.</p>\n",
    "text": "Codaro 공개 사이트를 React 기반 GitHub Pages로 전환했습니다 Codaro 공개 사이트가 React + Vite 기반 정적 사이트로 전환됐다. 이제 랜딩, 문서, Codaro 소식, 검색 경로가 같은 React 표면에서 움직이고, GitHub Pages 배포 경로는 하나로 정리된다. 이번 전환의 목표는 단순히 프레임워크 이름을 바꾸는 것이 아니었다. 공개 사이트가 제품 설명, 문서, 블로그 발행, 검색, feed, sitemap을 함께 책임지는 구조가 되도록 만드는 것이 핵심이었다. 달라진 점 공개 사이트의 기준 경로는 그대로 를 사용한다. 사용자가 보는 주요 경로는 아래처럼 정리됐다. : Codaro 랜딩 : 제품 사상과 운영 기준 문서 : Codaro 소식 : 개별 글 : 문서와 글 통합 검색 기존 경로는 로 이어지도록 유지했다. 오래된 링크가 남아 있어도 공개 글로 이동할 수 있다. 블로그 발행 방식 블로그 원문은 에 둔다. 지금은 카테고리를 넓히지 않고 하나로 운영한다. 새 글은 아래 정보를 반드시 가진다. 제목 날짜 검색 설명문 카테고리 카드 미리보기 이미지 공개 여부 빌드 단계에서는 이 원문을 읽어 글 목록, 검색 색인, feed, sitemap, canonical URL을 만든다. 그래서 글을 하나 발행할 때도 SEO 산출물이 같이 갱신된다. 왜 React 정적 사이트인가 Codaro의 실제 제품 표면은 다. 공개 사이트는 제품 실행 표면과 역할이 다르다. 공개 사이트는 빠르게 읽히고, 검색 가능해야 하며, GitHub Pages에서 안정적으로 배포되어야 한다. React + Vite 정적 사이트로 바꾸면서 공개 표면은 다음 책임을 갖는다. 첫 방문자가 제품 방향을 이해하는 랜딩 저장소의 문서를 읽을 수 있는 문서 표면 제품 진행 상황을 남기는 Codaro 소식 문서와 글을 함께 찾는 검색 feed, sitemap, canonical URL 생성 이 구조는 글을 코드베이스 가까이에 두면서도 공개 사이트로 발행할 수 있게 만든다. 검증한 것 전환 후 아래 항목을 확인했다. 로컬 미리보기에서는 홈, 문서, 블로그 목록, 글 상세, 검색, 레거시 블로그 경로를 확인했다. GitHub Pages 배포 뒤에는 공개 URL에서 새 title과 본문 문구가 내려오는 것도 확인했다. 다음 기준 앞으로 Codaro 소식은 제품이 실제로 어디까지 왔는지 보여주는 기록으로 쌓는다. 새 글은 공개 독자가 바로 이해할 수 있어야 하고, 문서와 검색에 함께 반영되어야 한다. Codaro 공개 사이트는 이제 제품 설명과 발행 체계를 동시에 가진 React 기반 GitHub Pages 표면이다."
  },
  {
    "slug": "codaro-public-launch",
    "title": "Codaro 공개 출시 준비",
    "date": "2026-05-23",
    "description": "Codaro를 로컬 우선 Python 학습과 개인 자동화 스튜디오로 소개하는 공개 출시 글.",
    "category": "codaro-news",
    "categoryLabel": "Codaro 소식",
    "categoryFolder": "01-codaro-news",
    "categoryPath": "/codaro/docs/blog/category/codaro-news",
    "series": "codaro-news",
    "seriesLabel": "Codaro 소식",
    "seriesOrder": 2,
    "thumbnail": "/codaro/brand/avatar-small.png",
    "cardPreview": "/codaro/docs/blog/assets/002-public-launch-map.svg",
    "draft": false,
    "url": "/codaro/docs/blog/codaro-public-launch",
    "html": "<h1>Codaro 공개 출시 준비</h1>\n<p>Codaro는 Python을 배우고, 코드를 실행하고, 쓸 만한 스크립트를 개인 자동화로 키우는 local-first 스튜디오다.</p>\n<p>첫 공개 글의 이야기는 단순해야 한다.</p>\n<ol>\n<li>구조화된 카드로 배운다.</li>\n<li>셀에서 코드를 실행한다.</li>\n<li>실제 로컬 데이터를 다룬다.</li>\n<li>반복 작업을 안전한 자동화 계획으로 바꾼다.</li>\n</ol>\n<h2>첫 5분</h2>\n<p>공개 첫 흐름은 실행 가능한 데모 두 개로 시작한다.</p>\n<pre><code class=\"language-powershell\">uv run python -X utf8 demos/publicLaunch/expenseSummaryDemo.py\nuv run python -X utf8 demos/publicLaunch/fileOrganizerDemo.py\n</code></pre>\n<p>첫 번째 데모는 작은 CSV를 읽어 지출을 카테고리별로 요약한다. 두 번째 데모는 파일을 실제로 옮기거나 삭제하지 않고 dry-run 정리 계획만 만든다.</p>\n<p>이 네 단계가 제품 이야기의 축이다. 배우고, 실행하고, 확인하고, 자동화한다.</p>\n<h2>local-first가 중요한 이유</h2>\n<p>Codaro는 provider를 연결하기 전에도 쓸모가 있어야 한다. 입문자는 Python 과정을 열고, 셀을 실행하고, 개인 파일을 외부로 보내지 않고 결과를 확인할 수 있어야 한다.</p>\n<p>provider가 붙으면 개인화는 좋아질 수 있다. 하지만 첫 실행 경로의 기반은 로컬 실행과 확인 가능한 결과다.</p>\n<h2>출시 준비를 믿을 수 있게 만드는 것</h2>\n<p>공개 준비 상태는 README의 문장이 아니라 gate로 확인해야 한다.</p>\n<ul>\n<li><code>quality-cycle</code></li>\n<li><code>objective-nineplus-audit</code></li>\n<li><code>public-readiness-audit</code></li>\n</ul>\n<p>릴리즈에는 루트의 보안, 개인정보, 지원, 기여, 라이선스, 상표권 경계 문서도 함께 있어야 한다.</p>\n<h2>영상에서 보여줄 것</h2>\n<p>90초 데모는 다음 장면을 보여주면 충분하다.</p>\n<ul>\n<li>학습 카드와 코드 셀</li>\n<li>CSV 요약 출력</li>\n<li>dry-run 자동화 계획</li>\n<li>진단과 지원 경로</li>\n<li>공개 준비 체크리스트</li>\n</ul>\n<p>목표는 모든 기능을 설명하는 것이 아니다. 보는 사람이 “지금 바로 실행해 볼 수 있겠다”라고 느끼게 만드는 것이다.</p>\n",
    "text": "Codaro 공개 출시 준비 Codaro는 Python을 배우고, 코드를 실행하고, 쓸 만한 스크립트를 개인 자동화로 키우는 local first 스튜디오다. 첫 공개 글의 이야기는 단순해야 한다. 1. 구조화된 카드로 배운다. 2. 셀에서 코드를 실행한다. 3. 실제 로컬 데이터를 다룬다. 4. 반복 작업을 안전한 자동화 계획으로 바꾼다. 첫 5분 공개 첫 흐름은 실행 가능한 데모 두 개로 시작한다. 첫 번째 데모는 작은 CSV를 읽어 지출을 카테고리별로 요약한다. 두 번째 데모는 파일을 실제로 옮기거나 삭제하지 않고 dry run 정리 계획만 만든다. 이 네 단계가 제품 이야기의 축이다. 배우고, 실행하고, 확인하고, 자동화한다. local first가 중요한 이유 Codaro는 provider를 연결하기 전에도 쓸모가 있어야 한다. 입문자는 Python 과정을 열고, 셀을 실행하고, 개인 파일을 외부로 보내지 않고 결과를 확인할 수 있어야 한다. provider가 붙으면 개인화는 좋아질 수 있다. 하지만 첫 실행 경로의 기반은 로컬 실행과 확인 가능한 결과다. 출시 준비를 믿을 수 있게 만드는 것 공개 준비 상태는 README의 문장이 아니라 gate로 확인해야 한다. 릴리즈에는 루트의 보안, 개인정보, 지원, 기여, 라이선스, 상표권 경계 문서도 함께 있어야 한다. 영상에서 보여줄 것 90초 데모는 다음 장면을 보여주면 충분하다. 학습 카드와 코드 셀 CSV 요약 출력 dry run 자동화 계획 진단과 지원 경로 공개 준비 체크리스트 목표는 모든 기능을 설명하는 것이 아니다. 보는 사람이 “지금 바로 실행해 볼 수 있겠다”라고 느끼게 만드는 것이다."
  },
  {
    "slug": "what-is-codaro",
    "title": "Codaro가 실제로 만들고 있는 것",
    "date": "2026-03-17",
    "description": "코드 실행, 학습, 자동화를 하나의 흐름으로 잇는 Codaro의 제품 방향.",
    "category": "codaro-news",
    "categoryLabel": "Codaro 소식",
    "categoryFolder": "01-codaro-news",
    "categoryPath": "/codaro/docs/blog/category/codaro-news",
    "series": "codaro-news",
    "seriesLabel": "Codaro 소식",
    "seriesOrder": 1,
    "thumbnail": "/codaro/brand/avatar-small.png",
    "cardPreview": "/codaro/docs/blog/assets/001-codaro-runtime-map.svg",
    "draft": false,
    "url": "/codaro/docs/blog/what-is-codaro",
    "html": "<h1>Codaro가 실제로 만들고 있는 것</h1>\n<p>Codaro는 코드 실행, 학습 카드, 개인 자동화가 하나의 문서 모델을 공유하는 실행형 스튜디오를 만들고 있다.</p>\n<p>로컬 에디터는 제품의 한 부분이다. 공개 사이트는 그 런타임을 왜 이렇게 설계했는지, 어떤 사용 흐름을 기준으로 삼는지 설명하는 표면이다.</p>\n<h2>세 가지 층</h2>\n<ol>\n<li>코드, 글, 워크플로우 블록을 함께 담는 문서 모델</li>\n<li>로컬과 브라우저 지향 환경에서 실행되는 런타임</li>\n<li>가이드, 변경 기록, 제품 판단을 공개하는 문서 기반 지식 표면</li>\n</ol>\n<h2>공개 사이트를 따로 두는 이유</h2>\n<p>에디터는 실행과 상호작용에 집중해야 한다.</p>\n<p>공개 사이트는 다른 조건을 가진다.</p>\n<ul>\n<li>정적 배포</li>\n<li>검색 가능한 문서와 글</li>\n<li>안정적인 GitHub Pages 배포</li>\n<li>제품 판단을 남기는 공개 기록</li>\n</ul>\n<p>그래서 Codaro는 공개 사이트인 <code>landing/</code>과 로컬 제품 표면인 <code>editor/</code>를 분리한다.</p>\n<h2>공개 문서는 제품의 일부다</h2>\n<p>공개 사이트는 부가 자료가 아니다.</p>\n<p>다음 내용을 사용자가 확인하는 표면이다.</p>\n<ul>\n<li>설치 안내</li>\n<li>핵심 개념 설명</li>\n<li>기준 문서</li>\n<li>런타임 결정의 배경을 설명하는 글</li>\n</ul>\n<h2>글은 저장소 가까이에 둔다</h2>\n<p>Codaro는 공개 문서, 운영 노트, 블로그 글을 루트 <code>docs/</code> 아래에 둔다. React 공개 사이트는 빌드 시점에 이 원문을 직접 읽는다.</p>\n<p>이 방식은 글을 코드베이스 가까이에 두면서도 정적 사이트로 배포할 수 있게 한다.</p>\n",
    "text": "Codaro가 실제로 만들고 있는 것 Codaro는 코드 실행, 학습 카드, 개인 자동화가 하나의 문서 모델을 공유하는 실행형 스튜디오를 만들고 있다. 로컬 에디터는 제품의 한 부분이다. 공개 사이트는 그 런타임을 왜 이렇게 설계했는지, 어떤 사용 흐름을 기준으로 삼는지 설명하는 표면이다. 세 가지 층 1. 코드, 글, 워크플로우 블록을 함께 담는 문서 모델 2. 로컬과 브라우저 지향 환경에서 실행되는 런타임 3. 가이드, 변경 기록, 제품 판단을 공개하는 문서 기반 지식 표면 공개 사이트를 따로 두는 이유 에디터는 실행과 상호작용에 집중해야 한다. 공개 사이트는 다른 조건을 가진다. 정적 배포 검색 가능한 문서와 글 안정적인 GitHub Pages 배포 제품 판단을 남기는 공개 기록 그래서 Codaro는 공개 사이트인 과 로컬 제품 표면인 를 분리한다. 공개 문서는 제품의 일부다 공개 사이트는 부가 자료가 아니다. 다음 내용을 사용자가 확인하는 표면이다. 설치 안내 핵심 개념 설명 기준 문서 런타임 결정의 배경을 설명하는 글 글은 저장소 가까이에 둔다 Codaro는 공개 문서, 운영 노트, 블로그 글을 루트 아래에 둔다. React 공개 사이트는 빌드 시점에 이 원문을 직접 읽는다. 이 방식은 글을 코드베이스 가까이에 두면서도 정적 사이트로 배포할 수 있게 한다."
  }
];
export const postCategories = [
  {
    "slug": "codaro-news",
    "label": "Codaro 소식"
  }
];
export const postSeries = [
  {
    "slug": "codaro-news",
    "label": "Codaro 소식"
  }
];
