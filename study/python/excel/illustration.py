SVG = '''
<svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradExcel" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" class="light-stop-1 dark-stop-1"/>
      <stop offset="100%" class="light-stop-2 dark-stop-2"/>
    </linearGradient>
    <style>
      .light-stop-1 { stop-color: #16a34a; }
      .light-stop-2 { stop-color: #15803d; }
      .dark-stop-1 { stop-color: #4ade80; }
      .dark-stop-2 { stop-color: #22c55e; }
      .body--dark .light-stop-1 { stop-color: #4ade80; }
      .body--dark .light-stop-2 { stop-color: #22c55e; }
      .sheet-bg { fill: #f0fdf4; }
      .body--dark .sheet-bg { fill: #14532d; }
      .cell-border { stroke: #86efac; }
      .body--dark .cell-border { stroke: #22c55e; }
      .header-cell { fill: #dcfce7; }
      .body--dark .header-cell { fill: #166534; }
      .cell-text { fill: #166534; }
      .body--dark .cell-text { fill: #bbf7d0; }
      .formula { fill: #15803d; }
      .body--dark .formula { fill: #4ade80; }
    </style>
  </defs>
  
  <rect x="28" y="14" width="224" height="116" rx="6" class="sheet-bg" stroke="#16a34a" stroke-width="2"/>
  
  <rect x="28" y="14" width="30" height="20" class="header-cell"/>
  <rect x="58" y="14" width="48" height="20" class="header-cell"/>
  <rect x="106" y="14" width="48" height="20" class="header-cell"/>
  <rect x="154" y="14" width="48" height="20" class="header-cell"/>
  <rect x="202" y="14" width="50" height="20" class="header-cell"/>
  
  <text x="43" y="28" text-anchor="middle" font-family="monospace" font-size="9" class="cell-text" font-weight="bold"></text>
  <text x="82" y="28" text-anchor="middle" font-family="monospace" font-size="9" class="cell-text" font-weight="bold">A</text>
  <text x="130" y="28" text-anchor="middle" font-family="monospace" font-size="9" class="cell-text" font-weight="bold">B</text>
  <text x="178" y="28" text-anchor="middle" font-family="monospace" font-size="9" class="cell-text" font-weight="bold">C</text>
  <text x="227" y="28" text-anchor="middle" font-family="monospace" font-size="9" class="cell-text" font-weight="bold">D</text>
  
  <line x1="58" y1="14" x2="58" y2="130" class="cell-border" stroke-width="1"/>
  <line x1="106" y1="14" x2="106" y2="130" class="cell-border" stroke-width="1"/>
  <line x1="154" y1="14" x2="154" y2="130" class="cell-border" stroke-width="1"/>
  <line x1="202" y1="14" x2="202" y2="130" class="cell-border" stroke-width="1"/>
  
  <line x1="28" y1="34" x2="252" y2="34" class="cell-border" stroke-width="1"/>
  <line x1="28" y1="58" x2="252" y2="58" class="cell-border" stroke-width="1"/>
  <line x1="28" y1="82" x2="252" y2="82" class="cell-border" stroke-width="1"/>
  <line x1="28" y1="106" x2="252" y2="106" class="cell-border" stroke-width="1"/>
  
  <rect x="28" y="34" width="30" height="24" class="header-cell"/>
  <rect x="28" y="58" width="30" height="24" class="header-cell"/>
  <rect x="28" y="82" width="30" height="24" class="header-cell"/>
  <rect x="28" y="106" width="30" height="24" class="header-cell"/>
  
  <text x="43" y="50" text-anchor="middle" font-family="monospace" font-size="9" class="cell-text" font-weight="bold">1</text>
  <text x="43" y="74" text-anchor="middle" font-family="monospace" font-size="9" class="cell-text" font-weight="bold">2</text>
  <text x="43" y="98" text-anchor="middle" font-family="monospace" font-size="9" class="cell-text" font-weight="bold">3</text>
  <text x="43" y="122" text-anchor="middle" font-family="monospace" font-size="9" class="cell-text" font-weight="bold">4</text>
  
  <text x="82" y="50" text-anchor="middle" font-family="monospace" font-size="9" class="cell-text">100</text>
  <text x="130" y="50" text-anchor="middle" font-family="monospace" font-size="9" class="cell-text">200</text>
  <text x="178" y="50" text-anchor="middle" font-family="monospace" font-size="9" class="cell-text">300</text>
  <text x="82" y="74" text-anchor="middle" font-family="monospace" font-size="9" class="cell-text">150</text>
  <text x="130" y="74" text-anchor="middle" font-family="monospace" font-size="9" class="cell-text">250</text>
  <text x="178" y="74" text-anchor="middle" font-family="monospace" font-size="9" class="cell-text">350</text>
  
  <rect x="202" y="82" width="50" height="24" fill="url(#gradExcel)" opacity="0.2"/>
  <text x="227" y="98" text-anchor="middle" font-family="monospace" font-size="8" class="formula" font-weight="bold">=SUM()</text>
  
  <text x="227" y="122" text-anchor="middle" font-family="monospace" font-size="10" class="formula" font-weight="bold">1350</text>
</svg>
'''

CODE_PREVIEW = "import openpyxl\\nwb = openpyxl.load_workbook('data.xlsx')"
