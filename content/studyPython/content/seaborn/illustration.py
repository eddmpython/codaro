SVG = '''
<svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradSeaborn" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" class="light-stop-1 dark-stop-1"/>
      <stop offset="100%" class="light-stop-2 dark-stop-2"/>
    </linearGradient>
    <style>
      .light-stop-1 { stop-color: #0d9488; }
      .light-stop-2 { stop-color: #06b6d4; }
      .dark-stop-1 { stop-color: #2dd4bf; }
      .dark-stop-2 { stop-color: #22d3ee; }
      .body--dark .light-stop-1 { stop-color: #2dd4bf; }
      .body--dark .light-stop-2 { stop-color: #22d3ee; }
      .sns-bg { fill: #f0fdfa; }
      .body--dark .sns-bg { fill: #134e4a; }
      .violin-1 { fill: #14b8a6; opacity: 0.7; }
      .body--dark .violin-1 { fill: #2dd4bf; }
      .violin-2 { fill: #0891b2; opacity: 0.7; }
      .body--dark .violin-2 { fill: #22d3ee; }
      .axis { stroke: #5eead4; }
      .body--dark .axis { stroke: #2dd4bf; }
      .grid { stroke: #99f6e4; opacity: 0.5; }
      .body--dark .grid { stroke: #14b8a6; }
    </style>
  </defs>
  
  <rect x="28" y="14" width="224" height="116" rx="8" class="sns-bg" stroke="url(#gradSeaborn)" stroke-width="1"/>
  
  <line x1="50" y1="20" x2="50" y2="110" class="axis" stroke-width="1.5"/>
  <line x1="50" y1="110" x2="240" y2="110" class="axis" stroke-width="1.5"/>
  
  <line x1="50" y1="40" x2="240" y2="40" class="grid" stroke-width="0.5"/>
  <line x1="50" y1="60" x2="240" y2="60" class="grid" stroke-width="0.5"/>
  <line x1="50" y1="80" x2="240" y2="80" class="grid" stroke-width="0.5"/>
  
  <ellipse cx="90" cy="65" rx="18" ry="40" class="violin-1"/>
  <line x1="90" y1="40" x2="90" y2="90" stroke="white" stroke-width="2"/>
  <rect x="84" y="55" width="12" height="20" fill="white" opacity="0.8"/>
  
  <ellipse cx="145" cy="70" rx="15" ry="35" class="violin-2"/>
  <line x1="145" y1="50" x2="145" y2="95" stroke="white" stroke-width="2"/>
  <rect x="139" y="62" width="12" height="16" fill="white" opacity="0.8"/>
  
  <ellipse cx="200" cy="60" rx="20" ry="45" class="violin-1"/>
  <line x1="200" y1="30" x2="200" y2="90" stroke="white" stroke-width="2"/>
  <rect x="194" y="50" width="12" height="20" fill="white" opacity="0.8"/>
  
  <text x="90" y="124" text-anchor="middle" font-family="monospace" font-size="8" fill="url(#gradSeaborn)">A</text>
  <text x="145" y="124" text-anchor="middle" font-family="monospace" font-size="8" fill="url(#gradSeaborn)">B</text>
  <text x="200" y="124" text-anchor="middle" font-family="monospace" font-size="8" fill="url(#gradSeaborn)">C</text>
</svg>
'''

CODE_PREVIEW = "import seaborn as sns\\nsns.violinplot(data=df, x='cat', y='val')"
