export const searchEntries = [
  {
    "kind": "blog",
    "title": "What Codaro is actually building",
    "description": "A public overview of Codaro as an interactive editor runtime for code, learning, and automation.",
    "url": "/blog/what-is-codaro",
    "text": "Codaro is not just another notebook clone Codaro is building a runtime surface where code, guided learning, and automation share one model. The local editor is only one part of the product. The public site explains the concepts, design choices, and workflow decisions behind that runtime. Three layers 1. A document model that can host code, text, and workflow blocks 2. An execution runtime that can run locally or in browser oriented environments 3. A public knowledge surface for docs, changelog style writing, and product reasoning Why keep the public site separate The editor must stay focused on execution and interaction. The public site has different constraints: static delivery SEO friendly docs and blog stable GitHub Pages deployment searchable product writing That is why Codaro keeps separate from the local editor . Public docs are part of the product The public site is not an afterthought. It becomes the surface for: installation guides concept explanations reference pages blog posts that explain runtime decisions Public writing should stay close to the repo Codaro stores blog posts under the root folder and public docs under the root folder. The Svelte public site reads those sources directly at build time. That keeps writing close to the codebase while still producing a static site.",
    "category": "product-and-runtime"
  },
  {
    "kind": "docs",
    "title": "Branding assets",
    "description": "Brand asset rules for Codaro avatars, favicon files, and public site usage.",
    "url": "/docs/branding",
    "text": "Codaro Branding Guide 현재 결정 마스코트 원본은 실제 서비스 반영 파일은 public site 반영 파일은 GitHub에 같이 올려서 브랜딩 자산도 저장소 이력으로 관리한다 마스코트 적용 기준 아바타 얼굴 중심 정사각 크롭 눈과 입이 살아 있어야 한다 파비콘 얼굴 전체나 책 전체를 그대로 축소하지 않는다 머리 실루엣, 새싹, 눈 같은 핵심 요소만 남긴 단순 버전이 맞다 앱 아이콘 파비콘보다 디테일을 조금 더 허용한다 128, 180, 512 기준으로 따로 검토한다 추천 작업 순서 1. 원본 이미지 사용권 확인 2. 에 원본 저장 3. 에서 아바타용 크롭과 파비콘용 단순화 시안 제작 4. 확정본만 , 로 export 5. 파비콘과 헤더 아바타에 적용",
    "category": "branding"
  },
  {
    "kind": "docs",
    "title": "Block model",
    "description": "Codaro treats the document as a block-oriented runtime surface rather than a notebook-only clone.",
    "url": "/docs/concepts/block-model",
    "text": "Block model Codaro keeps notebook compatibility, but its internal direction is block oriented. Initial block candidates: code text guide widget view file This keeps the runtime extensible beyond classic notebook cells.",
    "category": "concepts"
  },
  {
    "kind": "docs",
    "title": "Execution runtime",
    "description": "The runtime layer separates the editor surface from engine-specific execution details.",
    "url": "/docs/concepts/execution-runtime",
    "text": "Execution runtime The editor talks to a capability surface rather than a single concrete engine. Core capabilities include: execute interrupt variables files packages docs That separation is required for local, browser, and future sandbox execution backends.",
    "category": "concepts"
  },
  {
    "kind": "docs",
    "title": "Installation",
    "description": "Install Codaro, start the local server, and understand the public site split.",
    "url": "/docs/getting-started/installation",
    "text": "Installation Codaro currently has a developer install path and a product install direction. Product install direction The long term product path is a managed launcher: embedded Python runtime managed backend wheel install managed frontend assets automatic update and rollback Developer install Today, local development uses for Python environment and execution. Requirements Python 3.12 or newer Node.js for the Svelte public site and local editor frontends Core commands If you are iterating on the frontend, keep the same runtime model and rebuild into : Public site The public site lives in . Use:",
    "category": "getting-started"
  },
  {
    "kind": "docs",
    "title": "First notebook",
    "description": "Open the local editor surface and understand the difference between the editor and the public site.",
    "url": "/docs/getting-started/first-notebook",
    "text": "First notebook Start the local server with: The public site and the local editor are separate surfaces. builds a static public site serves the editor runtime That split keeps public docs and interactive editing independent.",
    "category": "getting-started"
  },
  {
    "kind": "docs",
    "title": "Local server",
    "description": "Run the local FastAPI server for the editor without mixing it with the public site build.",
    "url": "/docs/guides/local-server",
    "text": "Local server Use the local server when you want the editor surface: That server is separate from the GitHub Pages build. local editor: + public site:",
    "category": "guides"
  },
  {
    "kind": "docs",
    "title": "CLI reference",
    "description": "Commands for editor launch, app mode, export, and test execution.",
    "url": "/docs/reference/cli",
    "text": "CLI reference Main commands Tests",
    "category": "reference"
  }
];
