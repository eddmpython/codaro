SVG = '''
<svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradPdf" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" class="light-stop-1 dark-stop-1"/>
      <stop offset="100%" class="light-stop-2 dark-stop-2"/>
    </linearGradient>
    <style>
      .light-stop-1 { stop-color: #dc2626; }
      .light-stop-2 { stop-color: #991b1b; }
      .dark-stop-1 { stop-color: #f87171; }
      .dark-stop-2 { stop-color: #ef4444; }
      .body--dark .light-stop-1 { stop-color: #f87171; }
      .body--dark .light-stop-2 { stop-color: #ef4444; }
      .page-bg { fill: #fef2f2; }
      .body--dark .page-bg { fill: #450a0a; }
      .line { stroke: #fca5a5; }
      .body--dark .line { stroke: #ef4444; }
      .label { fill: #991b1b; }
      .body--dark .label { fill: #fecaca; }
      .accent { fill: #dc2626; }
      .body--dark .accent { fill: #f87171; }
    </style>
  </defs>

  <rect x="40" y="14" width="120" height="116" rx="6" class="page-bg" stroke="#dc2626" stroke-width="2"/>
  <text x="100" y="36" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" class="label">PDF</text>
  <line x1="52" y1="50" x2="148" y2="50" class="line" stroke-width="1"/>
  <line x1="52" y1="62" x2="148" y2="62" class="line" stroke-width="1"/>
  <line x1="52" y1="74" x2="138" y2="74" class="line" stroke-width="1"/>
  <line x1="52" y1="86" x2="148" y2="86" class="line" stroke-width="1"/>
  <line x1="52" y1="98" x2="128" y2="98" class="line" stroke-width="1"/>
  <line x1="52" y1="110" x2="148" y2="110" class="line" stroke-width="1"/>
  <line x1="52" y1="122" x2="118" y2="122" class="line" stroke-width="1"/>

  <rect x="120" y="14" width="120" height="116" rx="6" class="page-bg" stroke="#dc2626" stroke-width="2" opacity="0.7"/>
  <text x="180" y="36" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" class="label">PDF</text>
  <line x1="132" y1="50" x2="228" y2="50" class="line" stroke-width="1"/>
  <line x1="132" y1="62" x2="228" y2="62" class="line" stroke-width="1"/>

  <rect x="132" y="76" width="96" height="46" fill="url(#gradPdf)" rx="4"/>
  <text x="180" y="104" text-anchor="middle" font-family="monospace" font-size="11" fill="#ffffff" font-weight="bold">청구서</text>
</svg>
'''

CODE_PREVIEW = """from pypdf import PdfReader, PdfWriter
from reportlab.platypus import SimpleDocTemplate, Table

# 회계팀: CSV → 고객별 한글 청구서 PDF 묶음
for invoice in loadInvoices('deals.csv'):
    buildInvoice(f'out/{invoice["customer"]}.pdf', invoice)
"""
