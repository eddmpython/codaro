SVG = '''
<svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradAdv" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" class="light-stop-1 dark-stop-1"/>
      <stop offset="100%" class="light-stop-2 dark-stop-2"/>
    </linearGradient>
    <style>
      .light-stop-1 { stop-color: #7c3aed; }
      .light-stop-2 { stop-color: #c026d3; }
      .dark-stop-1 { stop-color: #a78bfa; }
      .dark-stop-2 { stop-color: #e879f9; }
      .body--dark .light-stop-1 { stop-color: #a78bfa; }
      .body--dark .light-stop-2 { stop-color: #e879f9; }
      .decorator-bg { fill: #faf5ff; stroke: #d8b4fe; }
      .body--dark .decorator-bg { fill: #3b0764; stroke: #a855f7; }
      .code-text { fill: #581c87; }
      .body--dark .code-text { fill: #e9d5ff; }
      .decorator-text { fill: #9333ea; }
      .body--dark .decorator-text { fill: #c084fc; }
      .arrow { stroke: url(#gradAdv); }
    </style>
  </defs>
  
  <rect x="30" y="20" width="90" height="104" rx="8" class="decorator-bg" stroke-width="1.5"/>
  <text x="75" y="40" text-anchor="middle" font-family="monospace" font-size="9" class="decorator-text" font-weight="bold">@decorator</text>
  <line x1="40" y1="50" x2="110" y2="50" stroke="#d8b4fe" stroke-width="1"/>
  <text x="45" y="68" font-family="monospace" font-size="8" class="code-text">def func():</text>
  <text x="50" y="82" font-family="monospace" font-size="8" class="code-text">yield x</text>
  <text x="50" y="96" font-family="monospace" font-size="8" class="code-text">async for</text>
  <text x="50" y="110" font-family="monospace" font-size="8" class="code-text">lambda x</text>
  
  <rect x="160" y="20" width="90" height="104" rx="8" class="decorator-bg" stroke-width="1.5"/>
  <text x="205" y="40" text-anchor="middle" font-family="monospace" font-size="9" class="decorator-text" font-weight="bold">class Meta</text>
  <line x1="170" y1="50" x2="240" y2="50" stroke="#d8b4fe" stroke-width="1"/>
  <text x="175" y="68" font-family="monospace" font-size="8" class="code-text">__init__</text>
  <text x="175" y="82" font-family="monospace" font-size="8" class="code-text">__call__</text>
  <text x="175" y="96" font-family="monospace" font-size="8" class="code-text">__slots__</text>
  <text x="175" y="110" font-family="monospace" font-size="8" class="code-text">@property</text>
  
  <path d="M 120 72 L 160 72" class="arrow" stroke-width="2" marker-end="url(#arrowAdv)"/>
  
  <defs>
    <marker id="arrowAdv" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="url(#gradAdv)"/>
    </marker>
  </defs>
</svg>
'''

CODE_PREVIEW = "@functools.lru_cache\\ndef fibonacci(n): ..."
