# /// script
# [tool.marimo.display]
# theme = "light"
# ///

import marimo

__generated_with = "0.18.4"
app = marimo.App(app_title="엑셀 파일 병합")

with app.setup:
    from pathlib import Path
    import marimo as mo
    import sys
    sys.path.append(str(Path(__file__).parent.parent))
    from noteWidgets.widgets import setHeader, setFooter

    TITLE = "엑셀파일 병합"
    SHORTDESC = "여러 개의 엑셀 파일을 수직/수평으로 병합합니다"
    LONGDESC = """
    재무제표, 마케팅 자료 등 <b>엑셀 데이터 분석 자동화의 첫 단계</b>는 흩어진 파일들을 한데 모으는 것입니다.<br>
    로컬에서는 <b>glob 라이브러리</b>로 여러 엑셀을 한 번에 불러와 병합할 수 있지만, 웹에서는 파일을 직접 가지고 있지 않기 때문에 파일 업로드 방식으로 대체합니다.<br><br>
    이 앱은 <b>업로드 → 병합 → 다운로드</b>까지만 수행하지만, 실제 자동화에서는 병합 후 <b>데이터 가공/분석 로직</b>이 추가됩니다.<br>
    학습 페이지에서 배운 내용을 참고하여 중간에 자동화 로직을 반영해보세요!
    """
    STUDYURL = "/study/실전파이썬/01_엑셀파일병합"


@app.cell
def _():
    setHeader(TITLE, SHORTDESC, LONGDESC)
    return


@app.cell
def _():
    import pandas as pd
    from io import BytesIO
    return BytesIO, pd


@app.cell
def _():
    mergeDirection = mo.ui.radio(
        options={"vertical": "📥 수직 병합 (행 추가)", "horizontal": "📤 수평 병합 (열 추가)"},
        value="vertical",
        label="🔀 병합 방향 : ",
        inline=True
    )

    fileUpload = mo.ui.file(
        filetypes=[".xlsx", ".xls"],
        multiple=True,
        kind="area",
        label="엑셀 파일들을 여기에 드래그하거나 클릭해서 선택하세요"
    )

    mo.vstack([mergeDirection, fileUpload])
    return fileUpload, mergeDirection


@app.cell
def _(BytesIO, fileUpload, mergeDirection, pd):
    mo.stop(not fileUpload.value, mo.md(""))

    dataframes = []
    errorFiles = []

    for i in range(len(fileUpload.value)):
        try:
            content = fileUpload.contents(i)
            fileName = fileUpload.name(i)
            df = pd.read_excel(BytesIO(content), header=0)
            if mergeDirection.value == "vertical":
                df["_source_file"] = fileName
            dataframes.append(df)
        except Exception as e:
            errorFiles.append(f"{fileUpload.name(i)}: {str(e)}")

    if errorFiles:
        mo.md(f"⚠️ 읽기 실패: {', '.join(errorFiles)}")

    mo.stop(len(dataframes) == 0, mo.md("❌ 읽을 수 있는 파일이 없습니다"))
    return dataframes, errorFiles


@app.cell
def _(dataframes, mergeDirection, pd):
    if mergeDirection.value == "vertical":
        merged = pd.concat(dataframes, ignore_index=True)
    else:
        for idx, frame in enumerate(dataframes):
            frame.columns = [f"{col}_{idx+1}" for col in frame.columns]
        merged = pd.concat(dataframes, axis=1)

    mo.vstack([
        mo.md(f"**병합 완료**: {len(dataframes)}개 파일 → {merged.shape[0]}행 × {merged.shape[1]}열"),
        mo.ui.table(merged.head(100), show_column_summaries=False)
    ])
    return (merged,)


@app.cell
def _(BytesIO, merged):
    outputBuffer = BytesIO()
    merged.to_excel(outputBuffer, index=False, engine='openpyxl')
    outputBuffer.seek(0)

    mo.md(f'''
    <div style="margin-top: 16px; display: flex; justify-content: center;">
    <a href="data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,{__import__('base64').b64encode(outputBuffer.getvalue()).decode()}"
       download="merged_result.xlsx"
       style="display: inline-flex; align-items: center; gap: 6px; background: #18181b; color: white; height: 40px; padding: 0 20px; border-radius: 8px; font-weight: 500; text-decoration: none; font-size: 0.9rem;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
        병합된 엑셀 다운로드
    </a>
    </div>
    ''')
    return


@app.cell
def _():
    mo.vstack([
        mo.Html('<br><br><br><br><br><br><br>'),
        setFooter(STUDYURL)
    ])
    return


if __name__ == "__main__":
    app.run()
