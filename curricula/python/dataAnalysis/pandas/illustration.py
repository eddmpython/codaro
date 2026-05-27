SVG = '''
<svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradPandas" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" class="light-stop-1 dark-stop-1"/>
      <stop offset="100%" class="light-stop-2 dark-stop-2"/>
    </linearGradient>
    <style>
      .light-stop-1 { stop-color: #14b8a6; }
      .light-stop-2 { stop-color: #0891b2; }
      .dark-stop-1 { stop-color: #2dd4bf; }
      .dark-stop-2 { stop-color: #22d3ee; }
      .body--dark .light-stop-1 { stop-color: #2dd4bf; }
      .body--dark .light-stop-2 { stop-color: #22d3ee; }
      .table-bg { fill: #f8fafc; }
      .body--dark .table-bg { fill: #1e293b; }
      .table-header { fill: url(#gradPandas); }
      .table-border { stroke: #e2e8f0; }
      .body--dark .table-border { stroke: #334155; }
      .table-text { fill: #334155; }
      .body--dark .table-text { fill: #e2e8f0; }
      .header-text { fill: white; }
      .cell-highlight { fill: #f0fdfa; }
      .body--dark .cell-highlight { fill: #134e4a; }
      .accent { fill: #14b8a6; }
      .body--dark .accent { fill: #2dd4bf; }
    </style>
  </defs>
  
  <rect x="24" y="16" width="232" height="112" rx="8" class="table-bg" stroke-width="2" class="table-border"/>
  
  <rect x="24" y="16" width="232" height="24" rx="8" class="table-header"/>
  <rect x="24" y="32" width="232" height="8" class="table-header"/>
  
  <text x="60" y="33" font-family="monospace" font-size="10" font-weight="bold" class="header-text">idx</text>
  <text x="110" y="33" font-family="monospace" font-size="10" font-weight="bold" class="header-text">name</text>
  <text x="170" y="33" font-family="monospace" font-size="10" font-weight="bold" class="header-text">value</text>
  <text x="225" y="33" font-family="monospace" font-size="10" font-weight="bold" class="header-text">type</text>
  
  <line x1="90" y1="16" x2="90" y2="128" stroke-width="1" class="table-border"/>
  <line x1="150" y1="16" x2="150" y2="128" stroke-width="1" class="table-border"/>
  <line x1="205" y1="16" x2="205" y2="128" stroke-width="1" class="table-border"/>
  
  <line x1="24" y1="60" x2="256" y2="60" stroke-width="1" class="table-border"/>
  <line x1="24" y1="84" x2="256" y2="84" stroke-width="1" class="table-border"/>
  <line x1="24" y1="108" x2="256" y2="108" stroke-width="1" class="table-border"/>
  
  <rect x="25" y="41" width="64" height="18" class="cell-highlight" opacity="0.5"/>
  <text x="36" y="54" font-family="monospace" font-size="9" class="accent" font-weight="bold">0</text>
  <text x="100" y="54" font-family="monospace" font-size="9" class="table-text">Alice</text>
  <text x="162" y="54" font-family="monospace" font-size="9" class="table-text">100.5</text>
  <text x="215" y="54" font-family="monospace" font-size="9" class="table-text">A</text>
  
  <text x="36" y="77" font-family="monospace" font-size="9" class="accent" font-weight="bold">1</text>
  <text x="100" y="77" font-family="monospace" font-size="9" class="table-text">Bob</text>
  <text x="162" y="77" font-family="monospace" font-size="9" class="table-text">200.3</text>
  <text x="215" y="77" font-family="monospace" font-size="9" class="table-text">B</text>
  
  <text x="36" y="100" font-family="monospace" font-size="9" class="accent" font-weight="bold">2</text>
  <text x="100" y="100" font-family="monospace" font-size="9" class="table-text">Carol</text>
  <text x="162" y="100" font-family="monospace" font-size="9" class="table-text">150.8</text>
  <text x="215" y="100" font-family="monospace" font-size="9" class="table-text">A</text>
  
  <text x="140" y="122" font-family="monospace" font-size="8" class="table-text" opacity="0.5" text-anchor="middle">DataFrame [3 rows × 4 cols]</text>
</svg>
'''

CODE_PREVIEW = "import pandas as pd\\ndf = pd.DataFrame()"
