SVG = '''
<svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradEmail" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" class="light-stop-1 dark-stop-1"/>
      <stop offset="100%" class="light-stop-2 dark-stop-2"/>
    </linearGradient>
    <style>
      .light-stop-1 { stop-color: #0284c7; }
      .light-stop-2 { stop-color: #0369a1; }
      .dark-stop-1 { stop-color: #38bdf8; }
      .dark-stop-2 { stop-color: #0ea5e9; }
      .body--dark .light-stop-1 { stop-color: #38bdf8; }
      .body--dark .light-stop-2 { stop-color: #0ea5e9; }
      .envelope { fill: #e0f2fe; }
      .body--dark .envelope { fill: #082f49; }
      .flap { stroke: #38bdf8; stroke-width: 2; fill: none; }
      .body--dark .flap { stroke: #7dd3fc; }
      .label { fill: #0369a1; }
      .body--dark .label { fill: #bae6fd; }
    </style>
  </defs>

  <rect x="40" y="36" width="200" height="80" rx="6" class="envelope" stroke="#0284c7" stroke-width="2"/>
  <path class="flap" d="M 40 36 L 140 96 L 240 36"/>
  <text x="140" y="138" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" class="label">smtplib · imaplib · email</text>

  <circle cx="200" cy="36" r="14" fill="url(#gradEmail)"/>
  <text x="200" y="40" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#ffffff" font-weight="bold">✉</text>
</svg>
'''

CODE_PREVIEW = """import smtplib, ssl
from email.message import EmailMessage

# 운영팀: CSV 데이터 → HTML 본문 + PDF 첨부 → 다수 발송
for recipient in csv_recipients:
    msg = buildMessage(recipient, df, chart, pdf)
    sendMessage(msg, dryRun=False)
"""
