export const docsPages = [
  {
    "path": "branding",
    "slugSegments": [
      "branding"
    ],
    "title": "Branding assets",
    "description": "Brand asset rules for Codaro avatars, favicon files, and public site usage.",
    "section": "branding",
    "sectionLabel": "Branding",
    "order": 1,
    "draft": false,
    "url": "/docs/branding",
    "html": "<h1>Codaro Branding Guide</h1>\n<h2>현재 결정</h2>\n<ul>\n<li>마스코트 원본은 <code>assets/brand/</code></li>\n<li>실제 서비스 반영 파일은 <code>frontend/static/brand/</code></li>\n<li>public site 반영 파일은 <code>landing/static/brand/</code></li>\n<li>GitHub에 같이 올려서 브랜딩 자산도 저장소 이력으로 관리한다</li>\n</ul>\n<h2>마스코트 적용 기준</h2>\n<ul>\n<li>아바타<ul>\n<li>얼굴 중심 정사각 크롭</li>\n<li>눈과 입이 살아 있어야 한다</li>\n</ul>\n</li>\n<li>파비콘<ul>\n<li>얼굴 전체나 책 전체를 그대로 축소하지 않는다</li>\n<li>머리 실루엣, 새싹, 눈 같은 핵심 요소만 남긴 단순 버전이 맞다</li>\n</ul>\n</li>\n<li>앱 아이콘<ul>\n<li>파비콘보다 디테일을 조금 더 허용한다</li>\n<li>128, 180, 512 기준으로 따로 검토한다</li>\n</ul>\n</li>\n</ul>\n<h2>추천 작업 순서</h2>\n<ol>\n<li>원본 이미지 사용권 확인</li>\n<li><code>assets/brand/mascot/source/</code>에 원본 저장</li>\n<li><code>assets/brand/mascot/work/</code>에서 아바타용 크롭과 파비콘용 단순화 시안 제작</li>\n<li>확정본만 <code>frontend/static/brand/</code>, <code>landing/static/brand/</code>로 export</li>\n<li>파비콘과 헤더 아바타에 적용</li>\n</ol>\n",
    "text": "Codaro Branding Guide 현재 결정 마스코트 원본은 실제 서비스 반영 파일은 public site 반영 파일은 GitHub에 같이 올려서 브랜딩 자산도 저장소 이력으로 관리한다 마스코트 적용 기준 아바타 얼굴 중심 정사각 크롭 눈과 입이 살아 있어야 한다 파비콘 얼굴 전체나 책 전체를 그대로 축소하지 않는다 머리 실루엣, 새싹, 눈 같은 핵심 요소만 남긴 단순 버전이 맞다 앱 아이콘 파비콘보다 디테일을 조금 더 허용한다 128, 180, 512 기준으로 따로 검토한다 추천 작업 순서 1. 원본 이미지 사용권 확인 2. 에 원본 저장 3. 에서 아바타용 크롭과 파비콘용 단순화 시안 제작 4. 확정본만 , 로 export 5. 파비콘과 헤더 아바타에 적용"
  },
  {
    "path": "concepts/block-model",
    "slugSegments": [
      "concepts",
      "block-model"
    ],
    "title": "Block model",
    "description": "Codaro treats the document as a block-oriented runtime surface rather than a notebook-only clone.",
    "section": "concepts",
    "sectionLabel": "Concepts",
    "order": 1,
    "draft": false,
    "url": "/docs/concepts/block-model",
    "html": "<h1>Block model</h1>\n<p>Codaro keeps notebook compatibility, but its internal direction is block-oriented.</p>\n<p>Initial block candidates:</p>\n<ul>\n<li>code</li>\n<li>text</li>\n<li>guide</li>\n<li>widget</li>\n<li>view</li>\n<li>file</li>\n</ul>\n<p>This keeps the runtime extensible beyond classic notebook cells.</p>\n",
    "text": "Block model Codaro keeps notebook compatibility, but its internal direction is block oriented. Initial block candidates: code text guide widget view file This keeps the runtime extensible beyond classic notebook cells."
  },
  {
    "path": "concepts/execution-runtime",
    "slugSegments": [
      "concepts",
      "execution-runtime"
    ],
    "title": "Execution runtime",
    "description": "The runtime layer separates the editor surface from engine-specific execution details.",
    "section": "concepts",
    "sectionLabel": "Concepts",
    "order": 2,
    "draft": false,
    "url": "/docs/concepts/execution-runtime",
    "html": "<h1>Execution runtime</h1>\n<p>The editor talks to a capability surface rather than a single concrete engine.</p>\n<p>Core capabilities include:</p>\n<ul>\n<li>execute</li>\n<li>interrupt</li>\n<li>variables</li>\n<li>files</li>\n<li>packages</li>\n<li>docs</li>\n</ul>\n<p>That separation is required for local, browser, and future sandbox execution backends.</p>\n",
    "text": "Execution runtime The editor talks to a capability surface rather than a single concrete engine. Core capabilities include: execute interrupt variables files packages docs That separation is required for local, browser, and future sandbox execution backends."
  },
  {
    "path": "getting-started/installation",
    "slugSegments": [
      "getting-started",
      "installation"
    ],
    "title": "Installation",
    "description": "Install Codaro, start the local server, and understand the public site split.",
    "section": "getting-started",
    "sectionLabel": "Getting Started",
    "order": 1,
    "draft": false,
    "url": "/docs/getting-started/installation",
    "html": "<h1>Installation</h1>\n<p>Codaro currently has a developer install path and a product install direction.</p>\n<h2>Product install direction</h2>\n<p>The long-term product path is a managed launcher:</p>\n<ul>\n<li><code>CodaroLauncher.exe</code></li>\n<li>embedded Python runtime</li>\n<li>managed backend wheel install</li>\n<li>managed frontend assets</li>\n<li>automatic update and rollback</li>\n</ul>\n<h2>Developer install</h2>\n<p>Today, local development uses <code>uv</code> for Python environment and execution.</p>\n<h2>Requirements</h2>\n<ul>\n<li>Python 3.12 or newer</li>\n<li><code>uv</code></li>\n<li>Node.js for the Svelte public site and local editor frontends</li>\n</ul>\n<h2>Core commands</h2>\n<pre><code class=\"language-bash\">cd frontend\nnpm install\nnpm run build\n\nuv run codaro\nuv run codaro path.py\nuv run pytest tests/ -v\n</code></pre>\n<p>If you are iterating on the frontend, keep the same runtime model and rebuild into <code>src/codaro/webBuild/</code>:</p>\n<pre><code class=\"language-bash\">cd frontend\nnpm run build:watch\n</code></pre>\n<h2>Public site</h2>\n<p>The public site lives in <code>landing/</code>.</p>\n<p>Use:</p>\n<pre><code class=\"language-bash\">cd landing\nnpm install\nnpm run build\n</code></pre>\n",
    "text": "Installation Codaro currently has a developer install path and a product install direction. Product install direction The long term product path is a managed launcher: embedded Python runtime managed backend wheel install managed frontend assets automatic update and rollback Developer install Today, local development uses for Python environment and execution. Requirements Python 3.12 or newer Node.js for the Svelte public site and local editor frontends Core commands If you are iterating on the frontend, keep the same runtime model and rebuild into : Public site The public site lives in . Use:"
  },
  {
    "path": "getting-started/first-notebook",
    "slugSegments": [
      "getting-started",
      "first-notebook"
    ],
    "title": "First notebook",
    "description": "Open the local editor surface and understand the difference between the editor and the public site.",
    "section": "getting-started",
    "sectionLabel": "Getting Started",
    "order": 2,
    "draft": false,
    "url": "/docs/getting-started/first-notebook",
    "html": "<h1>First notebook</h1>\n<p>Start the local server with:</p>\n<pre><code class=\"language-bash\">uv run codaro\n</code></pre>\n<p>The public site and the local editor are separate surfaces.</p>\n<ul>\n<li><code>landing/</code> builds a static public site</li>\n<li><code>frontend/</code> serves the editor runtime</li>\n</ul>\n<p>That split keeps public docs and interactive editing independent.</p>\n",
    "text": "First notebook Start the local server with: The public site and the local editor are separate surfaces. builds a static public site serves the editor runtime That split keeps public docs and interactive editing independent."
  },
  {
    "path": "guides/local-server",
    "slugSegments": [
      "guides",
      "local-server"
    ],
    "title": "Local server",
    "description": "Run the local FastAPI server for the editor without mixing it with the public site build.",
    "section": "guides",
    "sectionLabel": "Guides",
    "order": 1,
    "draft": false,
    "url": "/docs/guides/local-server",
    "html": "<h1>Local server</h1>\n<p>Use the local server when you want the editor surface:</p>\n<pre><code class=\"language-bash\">uv run codaro\n</code></pre>\n<p>That server is separate from the GitHub Pages build.</p>\n<ul>\n<li>local editor: <code>src/codaro/server.py</code> + <code>frontend/</code></li>\n<li>public site: <code>landing/</code></li>\n</ul>\n",
    "text": "Local server Use the local server when you want the editor surface: That server is separate from the GitHub Pages build. local editor: + public site:"
  },
  {
    "path": "reference/cli",
    "slugSegments": [
      "reference",
      "cli"
    ],
    "title": "CLI reference",
    "description": "Commands for editor launch, app mode, export, and test execution.",
    "section": "reference",
    "sectionLabel": "Reference",
    "order": 1,
    "draft": false,
    "url": "/docs/reference/cli",
    "html": "<h1>CLI reference</h1>\n<h2>Main commands</h2>\n<pre><code class=\"language-bash\">uv run codaro\nuv run codaro path.py\nuv run codaro app path.py\nuv run codaro export path.py --format codaro\nuv run codaro export path.py --format marimo\nuv run codaro export path.py --format ipynb\n</code></pre>\n<h2>Tests</h2>\n<pre><code class=\"language-bash\">uv run pytest tests/ -v\n</code></pre>\n",
    "text": "CLI reference Main commands Tests"
  }
];
export const docsSections = [
  {
    "slug": "getting-started",
    "label": "Getting Started",
    "pages": [
      {
        "path": "getting-started/installation",
        "slugSegments": [
          "getting-started",
          "installation"
        ],
        "title": "Installation",
        "description": "Install Codaro, start the local server, and understand the public site split.",
        "section": "getting-started",
        "sectionLabel": "Getting Started",
        "order": 1,
        "draft": false,
        "url": "/docs/getting-started/installation",
        "html": "<h1>Installation</h1>\n<p>Codaro currently has a developer install path and a product install direction.</p>\n<h2>Product install direction</h2>\n<p>The long-term product path is a managed launcher:</p>\n<ul>\n<li><code>CodaroLauncher.exe</code></li>\n<li>embedded Python runtime</li>\n<li>managed backend wheel install</li>\n<li>managed frontend assets</li>\n<li>automatic update and rollback</li>\n</ul>\n<h2>Developer install</h2>\n<p>Today, local development uses <code>uv</code> for Python environment and execution.</p>\n<h2>Requirements</h2>\n<ul>\n<li>Python 3.12 or newer</li>\n<li><code>uv</code></li>\n<li>Node.js for the Svelte public site and local editor frontends</li>\n</ul>\n<h2>Core commands</h2>\n<pre><code class=\"language-bash\">cd frontend\nnpm install\nnpm run build\n\nuv run codaro\nuv run codaro path.py\nuv run pytest tests/ -v\n</code></pre>\n<p>If you are iterating on the frontend, keep the same runtime model and rebuild into <code>src/codaro/webBuild/</code>:</p>\n<pre><code class=\"language-bash\">cd frontend\nnpm run build:watch\n</code></pre>\n<h2>Public site</h2>\n<p>The public site lives in <code>landing/</code>.</p>\n<p>Use:</p>\n<pre><code class=\"language-bash\">cd landing\nnpm install\nnpm run build\n</code></pre>\n",
        "text": "Installation Codaro currently has a developer install path and a product install direction. Product install direction The long term product path is a managed launcher: embedded Python runtime managed backend wheel install managed frontend assets automatic update and rollback Developer install Today, local development uses for Python environment and execution. Requirements Python 3.12 or newer Node.js for the Svelte public site and local editor frontends Core commands If you are iterating on the frontend, keep the same runtime model and rebuild into : Public site The public site lives in . Use:"
      },
      {
        "path": "getting-started/first-notebook",
        "slugSegments": [
          "getting-started",
          "first-notebook"
        ],
        "title": "First notebook",
        "description": "Open the local editor surface and understand the difference between the editor and the public site.",
        "section": "getting-started",
        "sectionLabel": "Getting Started",
        "order": 2,
        "draft": false,
        "url": "/docs/getting-started/first-notebook",
        "html": "<h1>First notebook</h1>\n<p>Start the local server with:</p>\n<pre><code class=\"language-bash\">uv run codaro\n</code></pre>\n<p>The public site and the local editor are separate surfaces.</p>\n<ul>\n<li><code>landing/</code> builds a static public site</li>\n<li><code>frontend/</code> serves the editor runtime</li>\n</ul>\n<p>That split keeps public docs and interactive editing independent.</p>\n",
        "text": "First notebook Start the local server with: The public site and the local editor are separate surfaces. builds a static public site serves the editor runtime That split keeps public docs and interactive editing independent."
      }
    ]
  },
  {
    "slug": "concepts",
    "label": "Concepts",
    "pages": [
      {
        "path": "concepts/block-model",
        "slugSegments": [
          "concepts",
          "block-model"
        ],
        "title": "Block model",
        "description": "Codaro treats the document as a block-oriented runtime surface rather than a notebook-only clone.",
        "section": "concepts",
        "sectionLabel": "Concepts",
        "order": 1,
        "draft": false,
        "url": "/docs/concepts/block-model",
        "html": "<h1>Block model</h1>\n<p>Codaro keeps notebook compatibility, but its internal direction is block-oriented.</p>\n<p>Initial block candidates:</p>\n<ul>\n<li>code</li>\n<li>text</li>\n<li>guide</li>\n<li>widget</li>\n<li>view</li>\n<li>file</li>\n</ul>\n<p>This keeps the runtime extensible beyond classic notebook cells.</p>\n",
        "text": "Block model Codaro keeps notebook compatibility, but its internal direction is block oriented. Initial block candidates: code text guide widget view file This keeps the runtime extensible beyond classic notebook cells."
      },
      {
        "path": "concepts/execution-runtime",
        "slugSegments": [
          "concepts",
          "execution-runtime"
        ],
        "title": "Execution runtime",
        "description": "The runtime layer separates the editor surface from engine-specific execution details.",
        "section": "concepts",
        "sectionLabel": "Concepts",
        "order": 2,
        "draft": false,
        "url": "/docs/concepts/execution-runtime",
        "html": "<h1>Execution runtime</h1>\n<p>The editor talks to a capability surface rather than a single concrete engine.</p>\n<p>Core capabilities include:</p>\n<ul>\n<li>execute</li>\n<li>interrupt</li>\n<li>variables</li>\n<li>files</li>\n<li>packages</li>\n<li>docs</li>\n</ul>\n<p>That separation is required for local, browser, and future sandbox execution backends.</p>\n",
        "text": "Execution runtime The editor talks to a capability surface rather than a single concrete engine. Core capabilities include: execute interrupt variables files packages docs That separation is required for local, browser, and future sandbox execution backends."
      }
    ]
  },
  {
    "slug": "guides",
    "label": "Guides",
    "pages": [
      {
        "path": "guides/local-server",
        "slugSegments": [
          "guides",
          "local-server"
        ],
        "title": "Local server",
        "description": "Run the local FastAPI server for the editor without mixing it with the public site build.",
        "section": "guides",
        "sectionLabel": "Guides",
        "order": 1,
        "draft": false,
        "url": "/docs/guides/local-server",
        "html": "<h1>Local server</h1>\n<p>Use the local server when you want the editor surface:</p>\n<pre><code class=\"language-bash\">uv run codaro\n</code></pre>\n<p>That server is separate from the GitHub Pages build.</p>\n<ul>\n<li>local editor: <code>src/codaro/server.py</code> + <code>frontend/</code></li>\n<li>public site: <code>landing/</code></li>\n</ul>\n",
        "text": "Local server Use the local server when you want the editor surface: That server is separate from the GitHub Pages build. local editor: + public site:"
      }
    ]
  },
  {
    "slug": "reference",
    "label": "Reference",
    "pages": [
      {
        "path": "reference/cli",
        "slugSegments": [
          "reference",
          "cli"
        ],
        "title": "CLI reference",
        "description": "Commands for editor launch, app mode, export, and test execution.",
        "section": "reference",
        "sectionLabel": "Reference",
        "order": 1,
        "draft": false,
        "url": "/docs/reference/cli",
        "html": "<h1>CLI reference</h1>\n<h2>Main commands</h2>\n<pre><code class=\"language-bash\">uv run codaro\nuv run codaro path.py\nuv run codaro app path.py\nuv run codaro export path.py --format codaro\nuv run codaro export path.py --format marimo\nuv run codaro export path.py --format ipynb\n</code></pre>\n<h2>Tests</h2>\n<pre><code class=\"language-bash\">uv run pytest tests/ -v\n</code></pre>\n",
        "text": "CLI reference Main commands Tests"
      }
    ]
  },
  {
    "slug": "branding",
    "label": "Branding",
    "pages": [
      {
        "path": "branding",
        "slugSegments": [
          "branding"
        ],
        "title": "Branding assets",
        "description": "Brand asset rules for Codaro avatars, favicon files, and public site usage.",
        "section": "branding",
        "sectionLabel": "Branding",
        "order": 1,
        "draft": false,
        "url": "/docs/branding",
        "html": "<h1>Codaro Branding Guide</h1>\n<h2>현재 결정</h2>\n<ul>\n<li>마스코트 원본은 <code>assets/brand/</code></li>\n<li>실제 서비스 반영 파일은 <code>frontend/static/brand/</code></li>\n<li>public site 반영 파일은 <code>landing/static/brand/</code></li>\n<li>GitHub에 같이 올려서 브랜딩 자산도 저장소 이력으로 관리한다</li>\n</ul>\n<h2>마스코트 적용 기준</h2>\n<ul>\n<li>아바타<ul>\n<li>얼굴 중심 정사각 크롭</li>\n<li>눈과 입이 살아 있어야 한다</li>\n</ul>\n</li>\n<li>파비콘<ul>\n<li>얼굴 전체나 책 전체를 그대로 축소하지 않는다</li>\n<li>머리 실루엣, 새싹, 눈 같은 핵심 요소만 남긴 단순 버전이 맞다</li>\n</ul>\n</li>\n<li>앱 아이콘<ul>\n<li>파비콘보다 디테일을 조금 더 허용한다</li>\n<li>128, 180, 512 기준으로 따로 검토한다</li>\n</ul>\n</li>\n</ul>\n<h2>추천 작업 순서</h2>\n<ol>\n<li>원본 이미지 사용권 확인</li>\n<li><code>assets/brand/mascot/source/</code>에 원본 저장</li>\n<li><code>assets/brand/mascot/work/</code>에서 아바타용 크롭과 파비콘용 단순화 시안 제작</li>\n<li>확정본만 <code>frontend/static/brand/</code>, <code>landing/static/brand/</code>로 export</li>\n<li>파비콘과 헤더 아바타에 적용</li>\n</ol>\n",
        "text": "Codaro Branding Guide 현재 결정 마스코트 원본은 실제 서비스 반영 파일은 public site 반영 파일은 GitHub에 같이 올려서 브랜딩 자산도 저장소 이력으로 관리한다 마스코트 적용 기준 아바타 얼굴 중심 정사각 크롭 눈과 입이 살아 있어야 한다 파비콘 얼굴 전체나 책 전체를 그대로 축소하지 않는다 머리 실루엣, 새싹, 눈 같은 핵심 요소만 남긴 단순 버전이 맞다 앱 아이콘 파비콘보다 디테일을 조금 더 허용한다 128, 180, 512 기준으로 따로 검토한다 추천 작업 순서 1. 원본 이미지 사용권 확인 2. 에 원본 저장 3. 에서 아바타용 크롭과 파비콘용 단순화 시안 제작 4. 확정본만 , 로 export 5. 파비콘과 헤더 아바타에 적용"
      }
    ]
  }
];
