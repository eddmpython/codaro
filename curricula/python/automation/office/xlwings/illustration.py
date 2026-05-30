SVG = '''
<svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradXlwings" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" class="light-stop-1 dark-stop-1"/>
      <stop offset="100%" class="light-stop-2 dark-stop-2"/>
    </linearGradient>
    <style>
      .light-stop-1 { stop-color: #0d9488; }
      .light-stop-2 { stop-color: #14b8a6; }
      .dark-stop-1 { stop-color: #5eead4; }
      .dark-stop-2 { stop-color: #14b8a6; }
      .body--dark .light-stop-1 { stop-color: #5eead4; }
      .body--dark .light-stop-2 { stop-color: #14b8a6; }
      .sheet-bg { fill: #f0fdfa; }
      .body--dark .sheet-bg { fill: #042f2e; }
      .cell-border { stroke: #99f6e4; }
      .body--dark .cell-border { stroke: #14b8a6; }
      .header-cell { fill: #ccfbf1; }
      .body--dark .header-cell { fill: #115e59; }
      .cell-text { fill: #134e4a; }
      .body--dark .cell-text { fill: #ccfbf1; }
      .code-bg { fill: #134e4a; }
      .body--dark .code-bg { fill: #042f2e; }
      .code-text { fill: #5eead4; }
      .body--dark .code-text { fill: #99f6e4; }
      .arrow-fill { fill: #0d9488; }
      .body--dark .arrow-fill { fill: #5eead4; }
      .live-dot { fill: #16a34a; }
      .body--dark .live-dot { fill: #4ade80; }
    </style>
  </defs>

  <rect x="12" y="32" width="104" height="98" rx="6" class="code-bg"/>
  <text x="22" y="50" font-family="monospace" font-size="8" class="code-text" font-weight="bold">import xlwings</text>
  <text x="22" y="66" font-family="monospace" font-size="8" class="code-text">with xw.App()</text>
  <text x="22" y="80" font-family="monospace" font-size="8" class="code-text">  book = app</text>
  <text x="22" y="92" font-family="monospace" font-size="8" class="code-text">    .books.add()</text>
  <text x="22" y="108" font-family="monospace" font-size="8" class="code-text">  sheet["A1"]</text>
  <text x="22" y="120" font-family="monospace" font-size="8" class="code-text" font-weight="bold">    .value=42</text>

  <path d="M 120 80 L 144 80" stroke="#0d9488" stroke-width="2" fill="none"/>
  <polygon points="140,75 148,80 140,85" class="arrow-fill"/>

  <rect x="152" y="14" width="116" height="116" rx="6" class="sheet-bg" stroke="#0d9488" stroke-width="2"/>

  <rect x="152" y="14" width="116" height="18" fill="url(#gradXlwings)"/>
  <circle cx="162" cy="23" r="3" class="live-dot"/>
  <text x="210" y="27" text-anchor="middle" font-family="sans-serif" font-size="9" fill="white" font-weight="bold">Excel (live)</text>

  <rect x="152" y="32" width="29" height="16" class="header-cell"/>
  <rect x="181" y="32" width="29" height="16" class="header-cell"/>
  <rect x="210" y="32" width="29" height="16" class="header-cell"/>
  <rect x="239" y="32" width="29" height="16" class="header-cell"/>

  <text x="166" y="43" text-anchor="middle" font-family="monospace" font-size="8" class="cell-text" font-weight="bold">A</text>
  <text x="195" y="43" text-anchor="middle" font-family="monospace" font-size="8" class="cell-text" font-weight="bold">B</text>
  <text x="224" y="43" text-anchor="middle" font-family="monospace" font-size="8" class="cell-text" font-weight="bold">C</text>
  <text x="253" y="43" text-anchor="middle" font-family="monospace" font-size="8" class="cell-text" font-weight="bold">D</text>

  <line x1="181" y1="32" x2="181" y2="130" class="cell-border" stroke-width="1"/>
  <line x1="210" y1="32" x2="210" y2="130" class="cell-border" stroke-width="1"/>
  <line x1="239" y1="32" x2="239" y2="130" class="cell-border" stroke-width="1"/>
  <line x1="152" y1="48" x2="268" y2="48" class="cell-border" stroke-width="1"/>
  <line x1="152" y1="68" x2="268" y2="68" class="cell-border" stroke-width="1"/>
  <line x1="152" y1="88" x2="268" y2="88" class="cell-border" stroke-width="1"/>
  <line x1="152" y1="108" x2="268" y2="108" class="cell-border" stroke-width="1"/>

  <text x="166" y="62" text-anchor="middle" font-family="monospace" font-size="7" class="cell-text">product</text>
  <text x="195" y="62" text-anchor="middle" font-family="monospace" font-size="7" class="cell-text">qty</text>
  <text x="224" y="62" text-anchor="middle" font-family="monospace" font-size="7" class="cell-text">price</text>
  <text x="253" y="62" text-anchor="middle" font-family="monospace" font-size="7" class="cell-text">amt</text>

  <text x="166" y="82" text-anchor="middle" font-family="monospace" font-size="7" class="cell-text">A001</text>
  <text x="195" y="82" text-anchor="middle" font-family="monospace" font-size="7" class="cell-text">3</text>
  <text x="224" y="82" text-anchor="middle" font-family="monospace" font-size="7" class="cell-text">120</text>
  <text x="253" y="82" text-anchor="middle" font-family="monospace" font-size="7" class="cell-text" font-weight="bold">360</text>

  <text x="166" y="102" text-anchor="middle" font-family="monospace" font-size="7" class="cell-text">A002</text>
  <text x="195" y="102" text-anchor="middle" font-family="monospace" font-size="7" class="cell-text">5</text>
  <text x="224" y="102" text-anchor="middle" font-family="monospace" font-size="7" class="cell-text">80</text>
  <text x="253" y="102" text-anchor="middle" font-family="monospace" font-size="7" class="cell-text" font-weight="bold">400</text>

  <rect x="239" y="108" width="29" height="22" fill="url(#gradXlwings)" opacity="0.3"/>
  <text x="253" y="123" text-anchor="middle" font-family="monospace" font-size="7" fill="#0d9488" font-weight="bold">=SUM()</text>
</svg>
'''

CODE_PREVIEW = "import xlwings as xw\\nwith xw.App(visible=False) as app:\\n    book = app.books.add()\\n    book.sheets[0]['A1'].value = 'Hello'"
