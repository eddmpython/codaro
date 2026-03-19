SVG = '''
<svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradAltair" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" class="light-stop-1 dark-stop-1"/>
      <stop offset="100%" class="light-stop-2 dark-stop-2"/>
    </linearGradient>
    <style>
      .light-stop-1 { stop-color: #0891b2; }
      .light-stop-2 { stop-color: #0d9488; }
      .dark-stop-1 { stop-color: #22d3ee; }
      .dark-stop-2 { stop-color: #2dd4bf; }
      .body--dark .light-stop-1 { stop-color: #22d3ee; }
      .body--dark .light-stop-2 { stop-color: #2dd4bf; }
      .altair-bg { fill: #ecfeff; }
      .body--dark .altair-bg { fill: #164e63; }
      .grammar-box { fill: #f0fdfa; stroke: url(#gradAltair); }
      .body--dark .grammar-box { fill: #134e4a; }
      .grammar-text { fill: #0f766e; }
      .body--dark .grammar-text { fill: #5eead4; }
      .connector { stroke: url(#gradAltair); }
    </style>
  </defs>
  
  <rect x="28" y="14" width="224" height="116" rx="8" class="altair-bg"/>
  
  <rect x="40" y="25" width="60" height="28" rx="6" class="grammar-box" stroke-width="1.5"/>
  <text x="70" y="44" text-anchor="middle" font-family="monospace" font-size="9" class="grammar-text" font-weight="bold">Data</text>
  
  <rect x="110" y="25" width="60" height="28" rx="6" class="grammar-box" stroke-width="1.5"/>
  <text x="140" y="44" text-anchor="middle" font-family="monospace" font-size="9" class="grammar-text" font-weight="bold">Mark</text>
  
  <rect x="180" y="25" width="60" height="28" rx="6" class="grammar-box" stroke-width="1.5"/>
  <text x="210" y="44" text-anchor="middle" font-family="monospace" font-size="9" class="grammar-text" font-weight="bold">Encode</text>
  
  <path d="M 100 39 L 110 39" class="connector" stroke-width="2"/>
  <path d="M 170 39 L 180 39" class="connector" stroke-width="2"/>
  
  <rect x="80" y="70" width="120" height="50" rx="8" fill="url(#gradAltair)" opacity="0.15" stroke="url(#gradAltair)" stroke-width="1.5"/>
  
  <rect x="95" y="78" width="16" height="36" rx="2" fill="url(#gradAltair)" opacity="0.7"/>
  <rect x="115" y="86" width="16" height="28" rx="2" fill="url(#gradAltair)" opacity="0.8"/>
  <rect x="135" y="82" width="16" height="32" rx="2" fill="url(#gradAltair)" opacity="0.6"/>
  <rect x="155" y="74" width="16" height="40" rx="2" fill="url(#gradAltair)" opacity="0.9"/>
  <rect x="175" y="90" width="16" height="24" rx="2" fill="url(#gradAltair)" opacity="0.7"/>
  
  <path d="M 140 53 L 140 70" class="connector" stroke-width="2" marker-end="url(#arrowAltair)"/>
  
  <defs>
    <marker id="arrowAltair" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="url(#gradAltair)"/>
    </marker>
  </defs>
</svg>
'''

CODE_PREVIEW = "import altair as alt\\nalt.Chart(df).mark_bar().encode(x='a', y='b')"
