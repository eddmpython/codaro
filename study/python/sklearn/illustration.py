SVG = '''
<svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradSklearn" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" class="light-stop-1 dark-stop-1"/>
      <stop offset="100%" class="light-stop-2 dark-stop-2"/>
    </linearGradient>
    <style>
      .light-stop-1 { stop-color: #ec4899; }
      .light-stop-2 { stop-color: #f43f5e; }
      .dark-stop-1 { stop-color: #f472b6; }
      .dark-stop-2 { stop-color: #fb7185; }
      .body--dark .light-stop-1 { stop-color: #f472b6; }
      .body--dark .light-stop-2 { stop-color: #fb7185; }
      .scatter-bg { fill: #fefefe; }
      .body--dark .scatter-bg { fill: #1e293b; }
      .cluster-1 { fill: #3b82f6; }
      .body--dark .cluster-1 { fill: #60a5fa; }
      .cluster-2 { fill: #22c55e; }
      .body--dark .cluster-2 { fill: #4ade80; }
      .cluster-3 { fill: #f59e0b; }
      .body--dark .cluster-3 { fill: #fbbf24; }
      .decision-line { stroke: #e11d48; stroke-dasharray: 6,3; }
      .body--dark .decision-line { stroke: #fb7185; }
      .axis { stroke: #94a3b8; }
      .body--dark .axis { stroke: #64748b; }
      .center { fill: #1e293b; stroke: white; }
      .body--dark .center { fill: white; stroke: #1e293b; }
    </style>
  </defs>
  
  <rect x="28" y="14" width="224" height="116" rx="8" class="scatter-bg" stroke="#e2e8f0" stroke-width="1"/>
  
  <line x1="40" y1="118" x2="240" y2="118" class="axis" stroke-width="1"/>
  <line x1="40" y1="20" x2="40" y2="118" class="axis" stroke-width="1"/>
  
  <g class="cluster-1">
    <circle cx="70" cy="40" r="5" opacity="0.8"/>
    <circle cx="85" cy="50" r="5" opacity="0.8"/>
    <circle cx="60" cy="55" r="5" opacity="0.8"/>
    <circle cx="75" cy="60" r="5" opacity="0.8"/>
    <circle cx="90" cy="45" r="5" opacity="0.8"/>
    <circle cx="65" cy="48" r="5" opacity="0.8"/>
    <circle cx="80" cy="38" r="5" opacity="0.8"/>
  </g>
  
  <g class="cluster-2">
    <circle cx="150" cy="85" r="5" opacity="0.8"/>
    <circle cx="165" cy="95" r="5" opacity="0.8"/>
    <circle cx="140" cy="90" r="5" opacity="0.8"/>
    <circle cx="155" cy="100" r="5" opacity="0.8"/>
    <circle cx="170" cy="88" r="5" opacity="0.8"/>
    <circle cx="145" cy="80" r="5" opacity="0.8"/>
    <circle cx="160" cy="78" r="5" opacity="0.8"/>
  </g>
  
  <g class="cluster-3">
    <circle cx="200" cy="45" r="5" opacity="0.8"/>
    <circle cx="215" cy="55" r="5" opacity="0.8"/>
    <circle cx="190" cy="50" r="5" opacity="0.8"/>
    <circle cx="205" cy="60" r="5" opacity="0.8"/>
    <circle cx="220" cy="48" r="5" opacity="0.8"/>
    <circle cx="195" cy="42" r="5" opacity="0.8"/>
    <circle cx="210" cy="38" r="5" opacity="0.8"/>
  </g>
  
  <circle cx="75" cy="48" r="7" class="center" stroke-width="2"/>
  <circle cx="155" cy="88" r="7" class="center" stroke-width="2"/>
  <circle cx="205" cy="50" r="7" class="center" stroke-width="2"/>
  
  <path d="M 120 20 Q 130 70 120 118" class="decision-line" stroke-width="2" fill="none"/>
  <path d="M 175 20 Q 165 70 175 118" class="decision-line" stroke-width="2" fill="none"/>
  
  <rect x="48" y="26" width="8" height="8" rx="2" class="cluster-1"/>
  <text x="60" y="33" font-family="monospace" font-size="8" class="cluster-1">A</text>
  <rect x="78" y="26" width="8" height="8" rx="2" class="cluster-2"/>
  <text x="90" y="33" font-family="monospace" font-size="8" class="cluster-2">B</text>
  <rect x="108" y="26" width="8" height="8" rx="2" class="cluster-3"/>
  <text x="120" y="33" font-family="monospace" font-size="8" class="cluster-3">C</text>
</svg>
'''

CODE_PREVIEW = "from sklearn.cluster import KMeans\\nmodel = KMeans(n_clusters=3)"
