SVG = '''
<svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradPlotly" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" class="light-stop-1 dark-stop-1"/>
      <stop offset="100%" class="light-stop-2 dark-stop-2"/>
    </linearGradient>
    <style>
      .light-stop-1 { stop-color: #3b82f6; }
      .light-stop-2 { stop-color: #8b5cf6; }
      .dark-stop-1 { stop-color: #60a5fa; }
      .dark-stop-2 { stop-color: #a78bfa; }
      .body--dark .light-stop-1 { stop-color: #60a5fa; }
      .body--dark .light-stop-2 { stop-color: #a78bfa; }
      .plotly-bg { fill: #f8fafc; }
      .body--dark .plotly-bg { fill: #1e293b; }
      .surface-1 { fill: #3b82f6; opacity: 0.3; }
      .body--dark .surface-1 { fill: #60a5fa; }
      .surface-2 { fill: #8b5cf6; opacity: 0.4; }
      .body--dark .surface-2 { fill: #a78bfa; }
      .mesh { stroke: url(#gradPlotly); opacity: 0.6; }
      .axis-3d { stroke: #94a3b8; }
      .body--dark .axis-3d { stroke: #64748b; }
    </style>
  </defs>
  
  <rect x="28" y="14" width="224" height="116" rx="8" class="plotly-bg" stroke="#e2e8f0" stroke-width="1"/>
  
  <line x1="70" y1="100" x2="70" y2="40" class="axis-3d" stroke-width="1.5"/>
  <line x1="70" y1="100" x2="140" y2="120" class="axis-3d" stroke-width="1.5"/>
  <line x1="70" y1="100" x2="30" y2="115" class="axis-3d" stroke-width="1.5"/>
  
  <polygon points="80,90 120,75 170,85 130,100" class="surface-1"/>
  <polygon points="120,75 160,55 200,70 170,85" class="surface-2"/>
  <polygon points="130,100 170,85 210,95 175,108" class="surface-1"/>
  
  <polygon points="90,70 130,50 175,65 140,80" class="surface-2"/>
  <polygon points="130,50 170,35 210,50 175,65" class="surface-1"/>
  
  <polygon points="100,50 140,30 180,45 145,60" class="surface-2"/>
  
  <line x1="80" y1="90" x2="120" y2="75" class="mesh" stroke-width="0.5"/>
  <line x1="120" y1="75" x2="170" y2="85" class="mesh" stroke-width="0.5"/>
  <line x1="170" y1="85" x2="130" y2="100" class="mesh" stroke-width="0.5"/>
  <line x1="130" y1="100" x2="80" y2="90" class="mesh" stroke-width="0.5"/>
  
  <line x1="90" y1="70" x2="130" y2="50" class="mesh" stroke-width="0.5"/>
  <line x1="130" y1="50" x2="175" y2="65" class="mesh" stroke-width="0.5"/>
  <line x1="175" y1="65" x2="140" y2="80" class="mesh" stroke-width="0.5"/>
  
  <line x1="100" y1="50" x2="140" y2="30" class="mesh" stroke-width="0.5"/>
  <line x1="140" y1="30" x2="180" y2="45" class="mesh" stroke-width="0.5"/>
  
  <text x="235" y="30" font-family="monospace" font-size="8" fill="url(#gradPlotly)" opacity="0.7">3D</text>
  <rect x="220" y="35" width="25" height="12" rx="2" fill="url(#gradPlotly)" opacity="0.2"/>
  <text x="232" y="44" text-anchor="middle" font-family="monospace" font-size="7" fill="url(#gradPlotly)">↻</text>
</svg>
'''

CODE_PREVIEW = "import plotly.express as px\\nfig = px.scatter_3d(df, x='x', y='y', z='z')"
