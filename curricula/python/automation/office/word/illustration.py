SVG = '''
<svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradWord" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" class="light-stop-1 dark-stop-1"/>
      <stop offset="100%" class="light-stop-2 dark-stop-2"/>
    </linearGradient>
    <style>
      .light-stop-1 { stop-color: #2563eb; }
      .light-stop-2 { stop-color: #1e3a8a; }
      .dark-stop-1 { stop-color: #60a5fa; }
      .dark-stop-2 { stop-color: #3b82f6; }
      .body--dark .light-stop-1 { stop-color: #60a5fa; }
      .body--dark .light-stop-2 { stop-color: #3b82f6; }
      .page-bg { fill: #eff6ff; }
      .body--dark .page-bg { fill: #1e3a8a; }
      .line { stroke: #93c5fd; }
      .body--dark .line { stroke: #3b82f6; }
      .label { fill: #1e40af; }
      .body--dark .label { fill: #dbeafe; }
    </style>
  </defs>

  <rect x="50" y="14" width="180" height="116" rx="6" class="page-bg" stroke="#2563eb" stroke-width="2"/>
  <rect x="50" y="14" width="180" height="16" fill="url(#gradWord)"/>
  <text x="140" y="26" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#ffffff" font-weight="bold">DOCX</text>

  <text x="62" y="50" font-family="sans-serif" font-size="11" font-weight="bold" class="label">{{name}}</text>
  <line x1="62" y1="58" x2="218" y2="58" class="line" stroke-width="1"/>
  <line x1="62" y1="70" x2="218" y2="70" class="line" stroke-width="1"/>
  <line x1="62" y1="82" x2="180" y2="82" class="line" stroke-width="1"/>

  <rect x="62" y="92" width="156" height="30" stroke="#2563eb" stroke-width="1" fill="none"/>
  <line x1="120" y1="92" x2="120" y2="122" stroke="#2563eb" stroke-width="1"/>
  <text x="90" y="111" text-anchor="middle" font-family="sans-serif" font-size="8" class="label">담당</text>
  <text x="169" y="111" text-anchor="middle" font-family="sans-serif" font-size="8" class="label">{{role}}</text>
</svg>
'''

CODE_PREVIEW = """from docx import Document
from docxtpl import DocxTemplate

# HR 인사: CSV → 신입 100명 근로계약서 자동 생성
for hire in csv_hires:
    tpl = DocxTemplate('contract_tpl.docx')
    tpl.render(hire)
    tpl.save(f'out/{hire["name"]}.docx')
"""
