import marimo

__generated_with = "0.18.4"
app = marimo.App(width="medium")

with app.setup:
    import marimo as mo
    from pathlib import Path
    import base64

    EDDMPYTHON_PRIMARY = "#18181b"
    EDDMPYTHON_URL = "https://eddmpython.com"
    ICON_STYLE = "filter: grayscale(100%) brightness(1.2);"

    PRETENDARD_CSS = """
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');

    body, * {
        font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif !important;
    }
    """

    HIDE_NOTEBOOK_ACTIONS = """
    .notebook-actions-dropdown {
        display: none !important;
    }
    """

    SNS_LINKS = [
        {'url': 'https://www.buymeacoffee.com/eddmpython', 'image': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAE60lEQVR4AcWXA5QrSRSGv6ruYGyubdu2bdu2bet4bdu2bXsnTiYTTLqrNrnLh355ft85caXvX3X/ul1XwX/Yb4kAawK7AqsAfYDLlOEBQ8DLwE3Ac2ouyoCg+C/4AHACsDPQwbQhDdwCnFcV8TuA4r/g1wGbAoqxUYAGwYDv1x4KaxEcDY5rUc5/Y7AEYYGHgANqIlQ1eBi4GDiE8aGgUFS8/2mEdz+J8N3PIeIph/yIxjegFEQjlo42w6wDFRadf5RlFyvR3+ODZUJcBRxdE7AByLJ0Mh7Ko4qTL+3k5gdacbRljlk8ejp9WpsNoZDFGBgpaNJZzVDCIZlxmG/OCteeGWO+uSpgCCIF7OwCuwYFR4HnK374JUR2WDPY6zHXrBVmn7lCR+t/AvIFza9/uCwwzyiLzjfKqZd38syrjcw3d5ZgJOauLrAyQVhoajZcdkqCNVco8sYHUX741eXDz8OURhXGKBQQDlkaGwzLLV5mvdUL1dVq4YvvwkwEK7tAPwHUZv/uhxGSGc1KSxfZYPURlBID4nlgrEIpWxUgIuRRS1lXu8+bH0R46/0oSy1cwtEE0V/1QIBVNDz0dBOHn9VNxVO4Tm2WVnJffch717UAeJ6iWFIMj2hyeU0yrUV8W4vhilPjbLhGIdALLgFYHx5+tklMd8bhSX6PuXz3U4jf4w7prEO+oCiXFSCzF9cvOLdhoNeT/3R3+OKFB59uZoNVCyg1KQIUMqNavmfu92RrrbhkCe0iYMEaeQhKywM0YEW8mLa3y+f7X1xKZUVD1E68ACxEw5alFylzwz0trLfbYG2G1YcnF63tgJYm2QUAkqLaTsjkNImUI3Xilz/cqhFD7Ll1jkjYEkSwBxTVXDo89kIjH38Z5fffZfllZqWSkqDWIiiFeCQatTRELN/8GJL8H7VXhm02zNPd6YOtJyBABA489UKjmGu9VQqSmmJZUf57G4JBKyM7oTFqUVqx27H9NDUYbrtyiJC2YAnEZUJYwIN7n2iWXG5U3Ya93QZBIeD0QHQViCwNWEaGbqdcSjL7TD4hFRB8YgUIGim9730aolCZlYb2fjBFcPoguhI0bgzhRUCFAUPht89J554Vr6ABM6UCFPR1ewznLcP+SnQNXA3GgG4E1cCYjDKcS8u9oa/bBwUwFQT0dvuUyppsNgsqCk4D46dEJpORMt3b6TMxaOphoafDxzeKVCoLlAhmhFQ6L+bsmmoCgM52g6MhnshLkEDMMIlEAddRdLb5YKfSCrS3GKIRiMULYHIEYrLEEuXqWCt1YKqloLmpVvksQ/EyeBkC8VLVMZ6MbW60U2kFgMaoob3NyMVtJUUA8lss4cvYhuhUXIFw2MrdLZ40VMoJApDf4ilkbCQ08SvgUQfXRQpLKgPlYrCAUvW3VEZJ4XJcJgZPA39MhEwRkMwoctnvA8qbRyH/I7m8kiKEZmL4wwVeAbanDnPM7DGUCPPc00+y08Cl6MZFQUUBA6aMKbzLm6+9QCobrh5Mckwkr9Q9lgsKfhty2efEHj75MsQqy4wy86DGdR0AKhWfn371eefjCCsvXeLykxO0tZp6HpBjeb3G5D8Ucsh44Kmm6o0pQiqj5Uzg++A40NVhWHWZIlusNyKHUixA/cZkgq1ZUItmPDmIYixYA0pDyLU4oaC2LLg1m+HN6Qxvz/8EPBxYA9rrfA8AAAAASUVORK5CYII='},
        {'url': 'mailto:eddmpython@gmail.com', 'image': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMTYiIHg9IjIiIHk9IjQiIHJ4PSIyIi8+PHBhdGggZD0ibTIyIDctOC45NyA1LjdhMS45NCAxLjk0IDAgMCAxLTIuMDYgMEwyIDciLz48L3N2Zz4='},
        {'url': 'https://www.threads.com/@eddmpython', 'image': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAAAAABXZoBIAAAA+ElEQVR4AbXRLYyDMBwF8OddDeK8QNTb8wk5iw8OjURh6klwQ9UiEWfRNXhUDRJFQlLzthWx0s3uZ1/T/xe+T5a3W5Phk3ql54YfRJKZNF1Tt+PBPcfVzPkXJ03+IdRxCgpwRUDsx7NQMYxKAhjZBGHFHkhn308FpLRBOD2rVDRl0dNJQJVBuDg8+BEVFa72DT5VetA0uBBc4PvwXBuF1o+zNkWhHGnev12OFEDOybBD3JDdE/93iWNDPErPua7+aQUM5WUJ2j95sBkwXcLE+fXlbVeeLQgE2nDxmmN8MiNxGrhF5xbmdexNIqYsPdcLfCDrVjcZvu4O2qyiNq2lHIsAAAAASUVORK5CYII='},
        {'url': 'https://www.youtube.com/@eddmpython', 'image': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABJklEQVR4Ae2WpVaFQRSFcaeS4QVwIjTiLbgk7D1w9xeg4FQcOu6acHeXtNnDmsFd7in/WetLI+f7dbYDAFEsAUvgoeAQ5k5iSQFpIH1kkMyQFXJMTsgpwTuc6jlHes2M3qNP71mge7g76DLNg8gygZ1QckGmuSdZJ7Azq8RDCSQTCJGgBCoFBWqVQLegQJcSmPnWIr9oICMXcIr4C4FJJbD9rUX+NtzX+CIQlfVbgS0lcP4jAVNt/UCA7acCZ0oAPxfQdXMLFNUBvpHflvgbAVM7h0B6zrfeD3kB+Ucg/xLKf4biPyLJX3GH9GFUogRSBQUSTSBZEwskQpFs1USyl6E0gRSRJtJPhsnci1B69oVQeqzXzOo9+kmj3juBeDw2BkSxBCyBO+9s03HRLVCoAAAAAElFTkSuQmCC'},
        {'url': 'https://eddm.tistory.com', 'image': 'https://t1.daumcdn.net/tistory_admin/favicon/tistory_favicon_32x32.ico'},
    ]


@app.function
def getLogoBase64():
    current = Path(__file__).resolve()
    projectRoot = next((p for p in current.parents if (p / 'main.py').exists()), None)
    if projectRoot:
        logoPath = projectRoot / 'assets' / 'eddmpythonLogo.ico'
        if logoPath.exists():
            with open(str(logoPath), 'rb') as f:
                return base64.b64encode(f.read()).decode()
    return None


@app.function
def applyPretendard():
    return mo.md(f'<style>{PRETENDARD_CSS}</style>')


@app.function
def getSnsHtml():
    snsHtml = ''
    for link in SNS_LINKS:
        snsHtml += f'''
            <a href="{link['url']}" target="_blank" style="margin: 0 4px;">
                <img src="{link['image']}" width="18" height="18" style="border-radius: 50%; {ICON_STYLE}" />
            </a>
        '''
    return snsHtml


@app.function
def setHeader(title, shortDesc='', longDesc=''):
    logoBase64 = getLogoBase64()

    if logoBase64:
        logoHtml = f'''
            <img src="data:image/x-icon;base64,{logoBase64}"
                 width="40" height="40"
                 style="object-fit: contain;" />
        '''
    else:
        logoHtml = ''

    longDescHtml = f'''
        <div style="padding: 16px 20px; background: #f4f4f5; border-radius: 12px; margin-top: 16px;">
            <p style="margin: 0; color: #52525b; font-size: 0.9rem; line-height: 1.7; text-align: left;">{longDesc}</p>
        </div>
    ''' if longDesc else ''

    headerHtml = f'''
<style>
{PRETENDARD_CSS}
{HIDE_NOTEBOOK_ACTIONS}
.eddm-header {{ margin: 0; padding: 0; }}
.eddm-header * {{ margin: 0; padding: 0; }}
</style>
<div class="eddm-header" style="display: flex; flex-direction: column; align-items: center;">
    <div style="width: 100%; max-width: 700px; padding: 24px 20px;">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
            <a href="{EDDMPYTHON_URL}" target="_blank" style="display: flex; align-items: center; text-decoration: none;">
                {logoHtml}
            </a>
            <div style="text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <h1 style="color: #18181b; margin: 0; font-size: 1.4rem; font-weight: 700;">{title}</h1>
                    <span style="font-size: 1rem;">🔥</span>
                </div>
                <p style="margin: 6px 0 0 0; color: #71717a; font-size: 0.9rem;">{shortDesc}</p>
            </div>
        </div>
        {longDescHtml}
    </div>
</div>
<br>
<br>
    '''

    return mo.md(headerHtml)


@app.function
def setFooter(studyUrl=''):
    snsHtml = getSnsHtml()

    studySection = ''
    if studyUrl:
        studySection = f'''
        <div style="margin-bottom: 12px;">
            <p style="font-size: 1.1rem; font-weight: 600; margin: 0 0 4px 0; color: #18181b;">🎓 직접 만들어 보실까요?</p>
            <p style="font-size: 0.9rem; color: #71717a; margin: 0;">이 도구가 어떻게 만들어졌는지 궁금하다면, 학습 페이지에서 단계별로 배워보세요!</p>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
            <a href="https://www.buymeacoffee.com/eddmpython" target="_blank">
                <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=eddmpython&button_colour=f5f5f5&font_colour=71717a&font_family=Cookie&outline_colour=d4d4d8&coffee_colour=71717a" alt="Buy Me A Coffee" style="height: 40px;" />
            </a>
            <a href="{studyUrl}" style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: #18181b; color: white; height: 40px; min-width: 160px; padding: 0 16px; border-radius: 8px; font-weight: 500; text-decoration: none; font-size: 0.9rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></svg>
                학습 페이지로 이동
            </a>
        </div>
        <div style="width: 300px; height: 1px; background-color: #e4e4e7; margin: 20px 0 12px 0;"></div>
        '''

    footerHtml = f'''
<style>
.eddm-footer {{ margin: 0; padding: 0; }}
.eddm-footer * {{ margin: 0; padding: 0; }}
</style>
<div class="eddm-footer" style="display: flex; flex-direction: column; align-items: center; text-align: center; margin-top: 25px;">
    {studySection}
    <div style="display: flex; justify-content: center; align-items: center; gap: 1px;">
        {snsHtml}
    </div>
    <p style="color: #9ca3af; font-size: 0.85rem; margin-top: 8px;">© 2026 으뜸이네. All rights reserved.</p>
</div>
    '''

    return mo.md(footerHtml)


@app.cell
def _():
    return


@app.cell
def _():
    setHeader("테스트 노트북", "이 노트북은 테스트를 위한 노트북입니다", "300px")
    return


@app.cell
def _():
    setFooter("/study/실전파이썬/01_엑셀파일병합")
    return


if __name__ == "__main__":
    app.run()
