SVG = '''
<svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradNumpy" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" class="light-stop-1 dark-stop-1"/>
      <stop offset="100%" class="light-stop-2 dark-stop-2"/>
    </linearGradient>
    <style>
      .light-stop-1 { stop-color: #4f46e5; }
      .light-stop-2 { stop-color: #7c3aed; }
      .dark-stop-1 { stop-color: #818cf8; }
      .dark-stop-2 { stop-color: #a78bfa; }
      .body--dark .light-stop-1 { stop-color: #818cf8; }
      .body--dark .light-stop-2 { stop-color: #a78bfa; }
      .matrix-bg { fill: #f8fafc; }
      .body--dark .matrix-bg { fill: #1e293b; }
      .matrix-border { stroke: #c7d2fe; }
      .body--dark .matrix-border { stroke: #4338ca; }
      .matrix-text { fill: #3730a3; }
      .body--dark .matrix-text { fill: #c7d2fe; }
      .bracket { stroke: url(#gradNumpy); fill: none; }
      .dim-text { fill: #6366f1; }
      .body--dark .dim-text { fill: #a5b4fc; }
      .highlight-cell { fill: #eef2ff; }
      .body--dark .highlight-cell { fill: #312e81; }
    </style>
  </defs>
  
  <path d="M 50 24 Q 40 24 40 34 L 40 110 Q 40 120 50 120" class="bracket" stroke-width="3" stroke-linecap="round"/>
  <path d="M 230 24 Q 240 24 240 34 L 240 110 Q 240 120 230 120" class="bracket" stroke-width="3" stroke-linecap="round"/>
  
  <g transform="translate(60, 30)">
    <rect x="0" y="0" width="40" height="24" rx="4" class="highlight-cell"/>
    <text x="20" y="17" text-anchor="middle" font-family="monospace" font-size="12" font-weight="bold" class="matrix-text">1.0</text>
    
    <rect x="48" y="0" width="40" height="24" rx="4" class="matrix-bg"/>
    <text x="68" y="17" text-anchor="middle" font-family="monospace" font-size="12" class="matrix-text">2.5</text>
    
    <rect x="96" y="0" width="40" height="24" rx="4" class="matrix-bg"/>
    <text x="116" y="17" text-anchor="middle" font-family="monospace" font-size="12" class="matrix-text">3.2</text>
  </g>
  
  <g transform="translate(60, 60)">
    <rect x="0" y="0" width="40" height="24" rx="4" class="matrix-bg"/>
    <text x="20" y="17" text-anchor="middle" font-family="monospace" font-size="12" class="matrix-text">4.1</text>
    
    <rect x="48" y="0" width="40" height="24" rx="4" class="highlight-cell"/>
    <text x="68" y="17" text-anchor="middle" font-family="monospace" font-size="12" font-weight="bold" class="matrix-text">5.0</text>
    
    <rect x="96" y="0" width="40" height="24" rx="4" class="matrix-bg"/>
    <text x="116" y="17" text-anchor="middle" font-family="monospace" font-size="12" class="matrix-text">6.7</text>
  </g>
  
  <g transform="translate(60, 90)">
    <rect x="0" y="0" width="40" height="24" rx="4" class="matrix-bg"/>
    <text x="20" y="17" text-anchor="middle" font-family="monospace" font-size="12" class="matrix-text">7.3</text>
    
    <rect x="48" y="0" width="40" height="24" rx="4" class="matrix-bg"/>
    <text x="68" y="17" text-anchor="middle" font-family="monospace" font-size="12" class="matrix-text">8.9</text>
    
    <rect x="96" y="0" width="40" height="24" rx="4" class="highlight-cell"/>
    <text x="116" y="17" text-anchor="middle" font-family="monospace" font-size="12" font-weight="bold" class="matrix-text">9.0</text>
  </g>
  
  <text x="210" y="42" font-family="monospace" font-size="9" class="dim-text">(3, 3)</text>
  <text x="210" y="56" font-family="monospace" font-size="8" class="dim-text" opacity="0.7">float64</text>
  
  <rect x="205" y="80" width="28" height="28" rx="4" fill="url(#gradNumpy)" opacity="0.2"/>
  <text x="219" y="99" text-anchor="middle" font-family="monospace" font-size="10" fill="url(#gradNumpy)" font-weight="bold">np</text>
</svg>
'''

CODE_PREVIEW = "import numpy as np\\narr = np.array([1, 2, 3])"
