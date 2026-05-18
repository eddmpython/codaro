SVG = '''
<svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradRegex" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" class="light-stop-1 dark-stop-1"/>
      <stop offset="100%" class="light-stop-2 dark-stop-2"/>
    </linearGradient>
    <style>
      .light-stop-1 { stop-color: #f59e0b; }
      .light-stop-2 { stop-color: #d97706; }
      .dark-stop-1 { stop-color: #fbbf24; }
      .dark-stop-2 { stop-color: #f59e0b; }
      .body--dark .light-stop-1 { stop-color: #fbbf24; }
      .body--dark .light-stop-2 { stop-color: #f59e0b; }
      .regex-bg { fill: #fffbeb; }
      .body--dark .regex-bg { fill: #451a03; }
      .pattern { fill: #b45309; }
      .body--dark .pattern { fill: #fcd34d; }
      .match-bg { fill: url(#gradRegex); opacity: 0.2; }
      .text { fill: #78350f; }
      .body--dark .text { fill: #fef3c7; }
      .highlight { fill: url(#gradRegex); }
    </style>
  </defs>
  
  <rect x="28" y="14" width="224" height="116" rx="8" class="regex-bg" stroke="url(#gradRegex)" stroke-width="1.5"/>
  
  <rect x="40" y="24" width="200" height="28" rx="4" fill="#fef3c7" stroke="url(#gradRegex)" stroke-width="1"/>
  <text x="50" y="43" font-family="monospace" font-size="12" class="pattern" font-weight="bold">/\\d{3}-\\d{4}/g</text>
  
  <rect x="40" y="64" width="200" height="55" rx="6" fill="white" stroke="#fcd34d" stroke-width="1"/>
  
  <text x="50" y="82" font-family="monospace" font-size="10" class="text">Call me at </text>
  <rect x="113" y="71" width="60" height="14" rx="2" class="match-bg"/>
  <text x="117" y="82" font-family="monospace" font-size="10" class="highlight" font-weight="bold">123-4567</text>
  
  <text x="50" y="98" font-family="monospace" font-size="10" class="text">or fax to </text>
  <rect x="105" y="87" width="60" height="14" rx="2" class="match-bg"/>
  <text x="109" y="98" font-family="monospace" font-size="10" class="highlight" font-weight="bold">987-6543</text>
  
  <text x="50" y="114" font-family="monospace" font-size="10" class="text">anytime.</text>
  
  <circle cx="220" y="38" r="10" fill="url(#gradRegex)" opacity="0.2"/>
  <text x="220" y="42" text-anchor="middle" font-family="monospace" font-size="10" class="pattern" font-weight="bold">2</text>
</svg>
'''

CODE_PREVIEW = "import re\\npattern = re.compile(r'\\d{3}-\\d{4}')"
