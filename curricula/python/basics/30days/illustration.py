SVG = '''
<svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad30d" x1="0%" y1="0%" x2="100%" y2="100%">
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
      .calendar-bg { fill: #f1f5f9; }
      .body--dark .calendar-bg { fill: #334155; }
      .calendar-text { fill: #1e293b; }
      .body--dark .calendar-text { fill: #f1f5f9; }
      .calendar-line { stroke: #cbd5e1; }
      .body--dark .calendar-line { stroke: #475569; }
      .check-mark { fill: #22c55e; }
      .body--dark .check-mark { fill: #4ade80; }
      .progress-bg { fill: #e2e8f0; }
      .body--dark .progress-bg { fill: #475569; }
    </style>
  </defs>
  
  <rect x="30" y="20" width="220" height="104" rx="12" class="calendar-bg"/>
  
  <rect x="30" y="20" width="220" height="28" rx="12" fill="url(#grad30d)"/>
  <rect x="30" y="36" width="220" height="12" fill="url(#grad30d)"/>
  
  <text x="140" y="40" text-anchor="middle" font-family="monospace" font-size="14" font-weight="bold" fill="white">30 DAYS</text>
  
  <g transform="translate(42, 58)">
    <g>
      <rect x="0" y="0" width="24" height="20" rx="3" fill="url(#grad30d)" opacity="0.9"/>
      <text x="12" y="14" text-anchor="middle" font-size="9" fill="white" font-weight="bold">1</text>
    </g>
    <g>
      <rect x="28" y="0" width="24" height="20" rx="3" fill="url(#grad30d)" opacity="0.9"/>
      <text x="40" y="14" text-anchor="middle" font-size="9" fill="white" font-weight="bold">2</text>
    </g>
    <g>
      <rect x="56" y="0" width="24" height="20" rx="3" fill="url(#grad30d)" opacity="0.9"/>
      <text x="68" y="14" text-anchor="middle" font-size="9" fill="white" font-weight="bold">3</text>
    </g>
    <g>
      <rect x="84" y="0" width="24" height="20" rx="3" fill="url(#grad30d)" opacity="0.8"/>
      <text x="96" y="14" text-anchor="middle" font-size="9" fill="white" font-weight="bold">4</text>
    </g>
    <g>
      <rect x="112" y="0" width="24" height="20" rx="3" fill="url(#grad30d)" opacity="0.7"/>
      <text x="124" y="14" text-anchor="middle" font-size="9" fill="white" font-weight="bold">5</text>
    </g>
    <g>
      <rect x="140" y="0" width="24" height="20" rx="3" fill="url(#grad30d)" opacity="0.6"/>
      <text x="152" y="14" text-anchor="middle" font-size="9" fill="white" font-weight="bold">6</text>
    </g>
    <g>
      <rect x="168" y="0" width="24" height="20" rx="3" fill="url(#grad30d)" opacity="0.5"/>
      <text x="180" y="14" text-anchor="middle" font-size="9" fill="white" font-weight="bold">7</text>
    </g>
  </g>
  
  <g transform="translate(42, 82)">
    <rect x="0" y="0" width="24" height="20" rx="3" class="progress-bg" opacity="0.5"/>
    <text x="12" y="14" text-anchor="middle" font-size="9" class="calendar-text" opacity="0.5">8</text>
    <rect x="28" y="0" width="24" height="20" rx="3" class="progress-bg" opacity="0.5"/>
    <text x="40" y="14" text-anchor="middle" font-size="9" class="calendar-text" opacity="0.5">9</text>
    <rect x="56" y="0" width="24" height="20" rx="3" class="progress-bg" opacity="0.5"/>
    <text x="68" y="14" text-anchor="middle" font-size="9" class="calendar-text" opacity="0.5">10</text>
    <text x="110" y="14" text-anchor="middle" font-size="10" class="calendar-text" opacity="0.6">...</text>
    <rect x="140" y="0" width="24" height="20" rx="3" class="progress-bg" opacity="0.5"/>
    <text x="152" y="14" text-anchor="middle" font-size="9" class="calendar-text" opacity="0.5">29</text>
    <rect x="168" y="0" width="24" height="20" rx="3" class="progress-bg" opacity="0.5"/>
    <text x="180" y="14" text-anchor="middle" font-size="9" class="calendar-text" opacity="0.5">30</text>
  </g>
  
  <circle cx="54" cy="68" r="6" class="check-mark" opacity="0.9"/>
  <path d="M51 68 L53 70 L57 66" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <circle cx="82" cy="68" r="6" class="check-mark" opacity="0.9"/>
  <path d="M79 68 L81 70 L85 66" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <circle cx="110" cy="68" r="6" class="check-mark" opacity="0.9"/>
  <path d="M107 68 L109 70 L113 66" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/>
</svg>
'''

CODE_PREVIEW = "print('Hello, Python!')"
