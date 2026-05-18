SVG = '''
<svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradPolars" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" class="light-stop-1 dark-stop-1"/>
      <stop offset="100%" class="light-stop-2 dark-stop-2"/>
    </linearGradient>
    <style>
      .light-stop-1 { stop-color: #2563eb; }
      .light-stop-2 { stop-color: #7c3aed; }
      .dark-stop-1 { stop-color: #60a5fa; }
      .dark-stop-2 { stop-color: #a78bfa; }
      .body--dark .light-stop-1 { stop-color: #60a5fa; }
      .body--dark .light-stop-2 { stop-color: #a78bfa; }
      .polar-bg { fill: #eff6ff; }
      .body--dark .polar-bg { fill: #1e3a5f; }
      .chain-text { fill: #1e40af; }
      .body--dark .chain-text { fill: #93c5fd; }
      .method { fill: #4f46e5; font-weight: bold; }
      .body--dark .method { fill: #a5b4fc; }
      .arrow-chain { stroke: url(#gradPolars); }
      .speed-line { stroke: url(#gradPolars); opacity: 0.6; }
    </style>
  </defs>
  
  <line x1="30" y1="72" x2="50" y2="72" class="speed-line" stroke-width="2"/>
  <line x1="35" y1="60" x2="45" y2="60" class="speed-line" stroke-width="1.5"/>
  <line x1="35" y1="84" x2="45" y2="84" class="speed-line" stroke-width="1.5"/>
  
  <rect x="55" y="28" width="70" height="30" rx="6" class="polar-bg" stroke="url(#gradPolars)" stroke-width="1.5"/>
  <text x="90" y="48" text-anchor="middle" font-family="monospace" font-size="10" class="method">.filter()</text>
  
  <path d="M 125 43 L 145 43" class="arrow-chain" stroke-width="2" marker-end="url(#arrowPolars)"/>
  
  <rect x="150" y="28" width="70" height="30" rx="6" class="polar-bg" stroke="url(#gradPolars)" stroke-width="1.5"/>
  <text x="185" y="48" text-anchor="middle" font-family="monospace" font-size="10" class="method">.select()</text>
  
  <path d="M 185 58 L 185 68" class="arrow-chain" stroke-width="2" marker-end="url(#arrowPolars)"/>
  
  <rect x="100" y="73" width="85" height="30" rx="6" class="polar-bg" stroke="url(#gradPolars)" stroke-width="1.5"/>
  <text x="142" y="93" text-anchor="middle" font-family="monospace" font-size="10" class="method">.group_by()</text>
  
  <path d="M 142 103 L 142 113" class="arrow-chain" stroke-width="2" marker-end="url(#arrowPolars)"/>
  
  <rect x="115" y="118" width="55" height="20" rx="4" fill="url(#gradPolars)" opacity="0.9"/>
  <text x="142" y="132" text-anchor="middle" font-family="monospace" font-size="9" fill="white" font-weight="bold">.agg()</text>
  
  <text x="250" y="60" font-family="monospace" font-size="8" class="chain-text" opacity="0.6">⚡</text>
  <text x="250" y="80" font-family="monospace" font-size="8" class="chain-text" opacity="0.6">FAST</text>
  
  <defs>
    <marker id="arrowPolars" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="url(#gradPolars)"/>
    </marker>
  </defs>
</svg>
'''

CODE_PREVIEW = "import polars as pl\\ndf.filter(pl.col('value') > 100)"
