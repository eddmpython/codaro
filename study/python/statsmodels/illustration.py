SVG = '''
<svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradStats" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" class="light-stop-1 dark-stop-1"/>
      <stop offset="100%" class="light-stop-2 dark-stop-2"/>
    </linearGradient>
    <style>
      .light-stop-1 { stop-color: #dc2626; }
      .light-stop-2 { stop-color: #ea580c; }
      .dark-stop-1 { stop-color: #f87171; }
      .dark-stop-2 { stop-color: #fb923c; }
      .body--dark .light-stop-1 { stop-color: #f87171; }
      .body--dark .light-stop-2 { stop-color: #fb923c; }
      .stats-bg { fill: #fef2f2; }
      .body--dark .stats-bg { fill: #450a0a; }
      .scatter { fill: #94a3b8; }
      .body--dark .scatter { fill: #64748b; }
      .regression { stroke: url(#gradStats); }
      .ci-band { fill: url(#gradStats); opacity: 0.15; }
      .axis { stroke: #e5e7eb; }
      .body--dark .axis { stroke: #374151; }
      .stats-text { fill: #991b1b; }
      .body--dark .stats-text { fill: #fca5a5; }
    </style>
  </defs>
  
  <rect x="28" y="14" width="224" height="116" rx="8" class="stats-bg" stroke="url(#gradStats)" stroke-width="1"/>
  
  <line x1="50" y1="110" x2="240" y2="110" class="axis" stroke-width="1"/>
  <line x1="50" y1="20" x2="50" y2="110" class="axis" stroke-width="1"/>
  
  <polygon points="50,95 240,45 240,65 50,110" class="ci-band"/>
  
  <circle cx="65" cy="92" r="3" class="scatter"/>
  <circle cx="80" cy="88" r="3" class="scatter"/>
  <circle cx="95" cy="80" r="3" class="scatter"/>
  <circle cx="105" cy="85" r="3" class="scatter"/>
  <circle cx="120" cy="72" r="3" class="scatter"/>
  <circle cx="135" cy="75" r="3" class="scatter"/>
  <circle cx="150" cy="65" r="3" class="scatter"/>
  <circle cx="165" cy="60" r="3" class="scatter"/>
  <circle cx="175" cy="68" r="3" class="scatter"/>
  <circle cx="190" cy="55" r="3" class="scatter"/>
  <circle cx="205" cy="52" r="3" class="scatter"/>
  <circle cx="220" cy="48" r="3" class="scatter"/>
  <circle cx="230" cy="42" r="3" class="scatter"/>
  
  <line x1="50" y1="100" x2="240" y2="38" class="regression" stroke-width="2.5"/>
  
  <text x="200" y="30" font-family="monospace" font-size="8" class="stats-text" font-weight="bold">R² = 0.94</text>
  <text x="70" y="35" font-family="monospace" font-size="7" class="stats-text" opacity="0.7">p &lt; 0.001</text>
</svg>
'''

CODE_PREVIEW = "import statsmodels.api as sm\\nmodel = sm.OLS(y, X).fit()"
