SVG = '''
<svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradMpl" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" class="light-stop-1 dark-stop-1"/>
      <stop offset="100%" class="light-stop-2 dark-stop-2"/>
    </linearGradient>
    <linearGradient id="gradMplLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" class="light-line-1 dark-line-1"/>
      <stop offset="100%" class="light-line-2 dark-line-2"/>
    </linearGradient>
    <style>
      .light-stop-1 { stop-color: #f97316; }
      .light-stop-2 { stop-color: #ef4444; }
      .dark-stop-1 { stop-color: #fb923c; }
      .dark-stop-2 { stop-color: #f87171; }
      .light-line-1 { stop-color: #3b82f6; }
      .light-line-2 { stop-color: #8b5cf6; }
      .dark-line-1 { stop-color: #60a5fa; }
      .dark-line-2 { stop-color: #a78bfa; }
      .body--dark .light-stop-1 { stop-color: #fb923c; }
      .body--dark .light-stop-2 { stop-color: #f87171; }
      .body--dark .light-line-1 { stop-color: #60a5fa; }
      .body--dark .light-line-2 { stop-color: #a78bfa; }
      .chart-bg { fill: #fefefe; }
      .body--dark .chart-bg { fill: #1e293b; }
      .axis { stroke: #94a3b8; }
      .body--dark .axis { stroke: #64748b; }
      .grid { stroke: #e2e8f0; }
      .body--dark .grid { stroke: #334155; }
      .axis-text { fill: #64748b; }
      .body--dark .axis-text { fill: #94a3b8; }
      .bar-1 { fill: #f97316; }
      .body--dark .bar-1 { fill: #fb923c; }
      .bar-2 { fill: #3b82f6; }
      .body--dark .bar-2 { fill: #60a5fa; }
    </style>
  </defs>
  
  <rect x="28" y="14" width="224" height="116" rx="8" class="chart-bg" stroke="#e2e8f0" stroke-width="1"/>
  
  <line x1="55" y1="30" x2="55" y2="110" class="axis" stroke-width="1.5"/>
  <line x1="55" y1="110" x2="235" y2="110" class="axis" stroke-width="1.5"/>
  
  <line x1="55" y1="50" x2="235" y2="50" class="grid" stroke-width="0.5" stroke-dasharray="4,4"/>
  <line x1="55" y1="70" x2="235" y2="70" class="grid" stroke-width="0.5" stroke-dasharray="4,4"/>
  <line x1="55" y1="90" x2="235" y2="90" class="grid" stroke-width="0.5" stroke-dasharray="4,4"/>
  
  <rect x="70" y="50" width="16" height="60" rx="2" class="bar-1" opacity="0.9"/>
  <rect x="90" y="65" width="16" height="45" rx="2" class="bar-2" opacity="0.9"/>
  
  <rect x="120" y="38" width="16" height="72" rx="2" class="bar-1" opacity="0.9"/>
  <rect x="140" y="55" width="16" height="55" rx="2" class="bar-2" opacity="0.9"/>
  
  <rect x="170" y="58" width="16" height="52" rx="2" class="bar-1" opacity="0.9"/>
  <rect x="190" y="42" width="16" height="68" rx="2" class="bar-2" opacity="0.9"/>
  
  <polyline points="78,48 128,35 178,55 208,40" fill="none" stroke="url(#gradMplLine)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="78" cy="48" r="4" fill="white" stroke="url(#gradMplLine)" stroke-width="2"/>
  <circle cx="128" cy="35" r="4" fill="white" stroke="url(#gradMplLine)" stroke-width="2"/>
  <circle cx="178" cy="55" r="4" fill="white" stroke="url(#gradMplLine)" stroke-width="2"/>
  <circle cx="208" cy="40" r="4" fill="white" stroke="url(#gradMplLine)" stroke-width="2"/>
  
  <text x="40" y="53" font-family="monospace" font-size="7" class="axis-text">80</text>
  <text x="40" y="73" font-family="monospace" font-size="7" class="axis-text">60</text>
  <text x="40" y="93" font-family="monospace" font-size="7" class="axis-text">40</text>
  <text x="40" y="113" font-family="monospace" font-size="7" class="axis-text">20</text>
  
  <text x="85" y="124" font-family="monospace" font-size="7" class="axis-text" text-anchor="middle">Q1</text>
  <text x="135" y="124" font-family="monospace" font-size="7" class="axis-text" text-anchor="middle">Q2</text>
  <text x="185" y="124" font-family="monospace" font-size="7" class="axis-text" text-anchor="middle">Q3</text>
</svg>
'''

CODE_PREVIEW = "import matplotlib.pyplot as plt\\nplt.plot([1, 2, 3])"
