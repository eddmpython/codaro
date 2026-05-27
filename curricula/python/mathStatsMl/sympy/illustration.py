SVG = '''
<svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradSympy" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" class="light-stop-1 dark-stop-1"/>
      <stop offset="100%" class="light-stop-2 dark-stop-2"/>
    </linearGradient>
    <style>
      .light-stop-1 { stop-color: #0ea5e9; }
      .light-stop-2 { stop-color: #6366f1; }
      .dark-stop-1 { stop-color: #38bdf8; }
      .dark-stop-2 { stop-color: #818cf8; }
      .body--dark .light-stop-1 { stop-color: #38bdf8; }
      .body--dark .light-stop-2 { stop-color: #818cf8; }
      .math-bg { fill: #f0f9ff; }
      .body--dark .math-bg { fill: #0c4a6e; }
      .math-text { fill: #0369a1; }
      .body--dark .math-text { fill: #7dd3fc; }
      .symbol { fill: url(#gradSympy); }
      .integral { stroke: url(#gradSympy); fill: none; }
    </style>
  </defs>
  
  <rect x="30" y="20" width="220" height="104" rx="12" class="math-bg" stroke="url(#gradSympy)" stroke-width="2"/>
  
  <text x="140" y="50" text-anchor="middle" font-family="serif" font-size="28" font-style="italic" class="symbol">∫</text>
  <text x="160" y="50" text-anchor="middle" font-family="serif" font-size="16" font-style="italic" class="math-text">x² dx</text>
  
  <text x="140" y="70" text-anchor="middle" font-family="monospace" font-size="12" class="math-text">=</text>
  
  <text x="140" y="95" text-anchor="middle" font-family="serif" font-size="18" font-style="italic" class="symbol">x³/3 + C</text>
  
  <text x="50" y="40" font-family="serif" font-size="14" font-style="italic" class="math-text" opacity="0.5">Σ</text>
  <text x="220" y="40" font-family="serif" font-size="14" font-style="italic" class="math-text" opacity="0.5">∂</text>
  <text x="50" y="110" font-family="serif" font-size="14" font-style="italic" class="math-text" opacity="0.5">√</text>
  <text x="220" y="110" font-family="serif" font-size="14" font-style="italic" class="math-text" opacity="0.5">∞</text>
</svg>
'''

CODE_PREVIEW = "from sympy import *\\nx = symbols('x')\\nintegrate(x**2, x)"
