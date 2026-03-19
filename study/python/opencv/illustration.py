SVG = '''
<svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradCV" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" class="light-stop-1 dark-stop-1"/>
      <stop offset="100%" class="light-stop-2 dark-stop-2"/>
    </linearGradient>
    <style>
      .light-stop-1 { stop-color: #16a34a; }
      .light-stop-2 { stop-color: #0284c7; }
      .dark-stop-1 { stop-color: #4ade80; }
      .dark-stop-2 { stop-color: #38bdf8; }
      .body--dark .light-stop-1 { stop-color: #4ade80; }
      .body--dark .light-stop-2 { stop-color: #38bdf8; }
      .cv-frame { fill: #f0fdf4; stroke: url(#gradCV); }
      .body--dark .cv-frame { fill: #14532d; }
      .face-box { stroke: #22c55e; fill: none; }
      .body--dark .face-box { stroke: #4ade80; }
      .detect-text { fill: #166534; }
      .body--dark .detect-text { fill: #bbf7d0; }
      .point { fill: url(#gradCV); }
      .edge { stroke: #22c55e; opacity: 0.7; }
      .body--dark .edge { stroke: #4ade80; }
    </style>
  </defs>
  
  <rect x="30" y="20" width="100" height="104" rx="6" class="cv-frame" stroke-width="2"/>
  
  <ellipse cx="80" cy="55" rx="25" ry="30" fill="#fef3c7" stroke="#fcd34d" stroke-width="1"/>
  <circle cx="70" cy="50" r="3" fill="#1e293b"/>
  <circle cx="90" cy="50" r="3" fill="#1e293b"/>
  <ellipse cx="80" cy="70" rx="8" ry="4" fill="#fda4af"/>
  
  <rect x="50" y="20" width="60" height="75" rx="4" class="face-box" stroke-width="2" stroke-dasharray="4,2"/>
  <text x="80" y="105" text-anchor="middle" font-family="monospace" font-size="8" class="detect-text" font-weight="bold">face: 98%</text>
  
  <path d="M 140 72 L 160 72" stroke="url(#gradCV)" stroke-width="2" marker-end="url(#arrowCV)"/>
  
  <rect x="170" y="20" width="80" height="104" rx="6" stroke="url(#gradCV)" stroke-width="2" fill="none"/>
  
  <line x1="180" y1="35" x2="195" y2="50" class="edge" stroke-width="1.5"/>
  <line x1="195" y1="50" x2="210" y2="45" class="edge" stroke-width="1.5"/>
  <line x1="210" y1="45" x2="230" y2="55" class="edge" stroke-width="1.5"/>
  <line x1="195" y1="50" x2="200" y2="70" class="edge" stroke-width="1.5"/>
  <line x1="200" y1="70" x2="185" y2="85" class="edge" stroke-width="1.5"/>
  <line x1="200" y1="70" x2="220" y2="90" class="edge" stroke-width="1.5"/>
  <line x1="220" y1="90" x2="235" y2="85" class="edge" stroke-width="1.5"/>
  <line x1="185" y1="85" x2="200" y2="105" class="edge" stroke-width="1.5"/>
  
  <circle cx="180" cy="35" r="3" class="point"/>
  <circle cx="195" cy="50" r="3" class="point"/>
  <circle cx="210" cy="45" r="3" class="point"/>
  <circle cx="230" cy="55" r="3" class="point"/>
  <circle cx="200" cy="70" r="3" class="point"/>
  <circle cx="185" cy="85" r="3" class="point"/>
  <circle cx="220" cy="90" r="3" class="point"/>
  <circle cx="235" cy="85" r="3" class="point"/>
  <circle cx="200" cy="105" r="3" class="point"/>
  
  <defs>
    <marker id="arrowCV" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="url(#gradCV)"/>
    </marker>
  </defs>
</svg>
'''

CODE_PREVIEW = "import cv2\\nimg = cv2.imread('image.jpg')\\ncv2.imshow('result', img)"
