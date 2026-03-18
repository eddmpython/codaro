SVG = '''
<svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradPractical" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" class="light-stop-1 dark-stop-1"/>
      <stop offset="100%" class="light-stop-2 dark-stop-2"/>
    </linearGradient>
    <style>
      .light-stop-1 { stop-color: #6366f1; }
      .light-stop-2 { stop-color: #a855f7; }
      .dark-stop-1 { stop-color: #818cf8; }
      .dark-stop-2 { stop-color: #c084fc; }
      .body--dark .light-stop-1 { stop-color: #818cf8; }
      .body--dark .light-stop-2 { stop-color: #c084fc; }
      .terminal-bg { fill: #1e1b4b; }
      .body--dark .terminal-bg { fill: #0f0d2e; }
      .terminal-header { fill: #312e81; }
      .body--dark .terminal-header { fill: #1e1b4b; }
      .terminal-text { fill: #c7d2fe; }
      .body--dark .terminal-text { fill: #e0e7ff; }
      .prompt { fill: #a5b4fc; }
      .output { fill: #34d399; }
      .body--dark .output { fill: #6ee7b7; }
    </style>
  </defs>
  
  <rect x="30" y="16" width="220" height="112" rx="8" class="terminal-bg"/>
  
  <rect x="30" y="16" width="220" height="20" rx="8" class="terminal-header"/>
  <rect x="30" y="28" width="220" height="8" class="terminal-header"/>
  <circle cx="45" cy="26" r="5" fill="#ef4444"/>
  <circle cx="60" cy="26" r="5" fill="#fbbf24"/>
  <circle cx="75" cy="26" r="5" fill="#22c55e"/>
  <text x="140" y="29" text-anchor="middle" font-family="monospace" font-size="8" fill="#a5b4fc">terminal</text>
  
  <text x="40" y="52" font-family="monospace" font-size="9" class="prompt">$</text>
  <text x="52" y="52" font-family="monospace" font-size="9" class="terminal-text">python automation.py</text>
  
  <text x="40" y="68" font-family="monospace" font-size="9" class="output">✓ 데이터 수집 완료</text>
  <text x="40" y="82" font-family="monospace" font-size="9" class="output">✓ 전처리 완료</text>
  <text x="40" y="96" font-family="monospace" font-size="9" class="output">✓ 분석 리포트 생성</text>
  <text x="40" y="110" font-family="monospace" font-size="9" class="output">✓ 이메일 발송 완료</text>
  
  <rect x="180" y="95" width="60" height="18" rx="4" fill="url(#gradPractical)" opacity="0.3"/>
  <text x="210" y="108" text-anchor="middle" font-family="monospace" font-size="8" fill="url(#gradPractical)" font-weight="bold">DONE</text>
</svg>
'''

CODE_PREVIEW = "# 실전 자동화 스크립트\\nimport schedule\\nschedule.every().day.do(job)"
