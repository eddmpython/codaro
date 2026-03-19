SVG = '''
<svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradDuck" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" class="light-stop-1 dark-stop-1"/>
      <stop offset="100%" class="light-stop-2 dark-stop-2"/>
    </linearGradient>
    <style>
      .light-stop-1 { stop-color: #fbbf24; }
      .light-stop-2 { stop-color: #f59e0b; }
      .dark-stop-1 { stop-color: #fcd34d; }
      .dark-stop-2 { stop-color: #fbbf24; }
      .body--dark .light-stop-1 { stop-color: #fcd34d; }
      .body--dark .light-stop-2 { stop-color: #fbbf24; }
      .db-bg { fill: #fffbeb; }
      .body--dark .db-bg { fill: #451a03; }
      .sql-text { fill: #92400e; }
      .body--dark .sql-text { fill: #fde68a; }
      .keyword { fill: #b45309; font-weight: bold; }
      .body--dark .keyword { fill: #fbbf24; }
      .result-bg { fill: #fef3c7; }
      .body--dark .result-bg { fill: #78350f; }
    </style>
  </defs>
  
  <rect x="30" y="16" width="220" height="50" rx="8" class="db-bg" stroke="url(#gradDuck)" stroke-width="2"/>
  <text x="45" y="38" font-family="monospace" font-size="10" class="keyword">SELECT</text>
  <text x="92" y="38" font-family="monospace" font-size="10" class="sql-text">name, SUM(value)</text>
  <text x="45" y="54" font-family="monospace" font-size="10" class="keyword">FROM</text>
  <text x="77" y="54" font-family="monospace" font-size="10" class="sql-text">sales</text>
  <text x="110" y="54" font-family="monospace" font-size="10" class="keyword">GROUP BY</text>
  <text x="173" y="54" font-family="monospace" font-size="10" class="sql-text">name</text>
  
  <path d="M 140 66 L 140 76" stroke="url(#gradDuck)" stroke-width="2" marker-end="url(#arrowDuck)"/>
  
  <rect x="30" y="82" width="220" height="46" rx="8" class="result-bg" stroke="url(#gradDuck)" stroke-width="2"/>
  <line x1="30" y1="98" x2="250" y2="98" stroke="url(#gradDuck)" stroke-width="1" opacity="0.5"/>
  <line x1="110" y1="82" x2="110" y2="128" stroke="url(#gradDuck)" stroke-width="1" opacity="0.5"/>
  <text x="70" y="93" text-anchor="middle" font-family="monospace" font-size="9" class="keyword">name</text>
  <text x="180" y="93" text-anchor="middle" font-family="monospace" font-size="9" class="keyword">SUM(value)</text>
  <text x="70" y="112" text-anchor="middle" font-family="monospace" font-size="9" class="sql-text">Alice</text>
  <text x="180" y="112" text-anchor="middle" font-family="monospace" font-size="9" class="sql-text">1,234</text>
  
  <ellipse cx="230" cy="30" rx="12" ry="10" fill="url(#gradDuck)" opacity="0.8"/>
  <circle cx="227" cy="28" r="2" fill="white"/>
  <path d="M 234 32 L 238 32" stroke="#92400e" stroke-width="2"/>
  
  <defs>
    <marker id="arrowDuck" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="url(#gradDuck)"/>
    </marker>
  </defs>
</svg>
'''

CODE_PREVIEW = "import duckdb\\ndf = duckdb.sql('SELECT * FROM data.csv').df()"
