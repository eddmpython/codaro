# /// script
# [tool.marimo.display]
# theme = "light"
# ///

import marimo

__generated_with = "0.18.4"
app = marimo.App(app_title="세금계산서 검증")

with app.setup:
    from pathlib import Path
    import marimo as mo
    import sys
    sys.path.append(str(Path(__file__).parent.parent))
    from noteWidgets.widgets import setHeader, setFooter

    TITLE = "세금계산서 검증"
    SHORTDESC = "홈택스와 ERP 세금계산서를 대사하여 불부합을 추출합니다"
    LONGDESC = """
    부가세 신고 전 <b>세금계산서 검증</b>은 필수입니다.<br>
    홈택스 세금계산서와 ERP 세금계산서를 대사하여 <b>불부합 건</b>을 추출합니다.<br><br>
    이 앱은 두 엑셀 파일을 업로드하고, 컬럼을 매핑한 후, 자동으로 대사하여 <b>3개 시트</b>를 가진 엑셀을 다운로드합니다:<br>
    <b>① 홈택스원본</b>, <b>② ERP원본</b>, <b>③ 매칭결과</b>, <b>④ 불부합결과</b><br><br>
    실무에서는 불부합 건을 확인하여 누락된 세금계산서를 찾거나, ERP 전표를 수정하는 후속 작업이 이어집니다.
    """
    STUDYURL = "/study/실전파이썬/03_세금계산서검증"


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
    taxType = mo.ui.radio(
        options=["매출", "매입"],
        value="매출",
        label="📊 세금계산서 유형: ",
        inline=True
    )
    mo.vstack([
        taxType,
        mo.md("*홈택스와 ERP 모두 같은 유형이어야 합니다*")
    ])
    return (taxType,)


@app.cell
def _(taxType):
    htsFile = mo.ui.file(
        filetypes=[".xlsx", ".xls"],
        multiple=False,
        kind="area",
        label=f"🏛️ 홈택스 {taxType.value} 세금계산서 엑셀"
    )
    htsFile
    return (htsFile,)


@app.cell
def _(htsFile, pd, BytesIO):
    mo.stop(not htsFile.value, mo.md(""))

    htsContent = htsFile.contents(0)
    htsName = htsFile.name(0)

    htsHeaderRow = mo.ui.number(
        start=0,
        stop=20,
        step=1,
        value=5,
        label="홈택스 헤더 행 번호 (0부터 시작)"
    )

    htsDf = None
    htsColumns = []

    try:
        htsDf = pd.read_excel(BytesIO(htsContent), header=htsHeaderRow.value)
        htsColumns = list(htsDf.columns)
        mo.vstack([
            mo.md(f"✅ **홈택스 파일 읽기 성공**: {len(htsDf)}행 × {len(htsDf.columns)}열"),
            htsHeaderRow,
            mo.md(f"컬럼: {', '.join(htsColumns[:10])}" + ("..." if len(htsColumns) > 10 else ""))
        ])
    except Exception as e:
        mo.md(f"❌ 파일 읽기 실패: {str(e)}")
    return htsColumns, htsContent, htsDf, htsHeaderRow, htsName


@app.cell
def _(htsColumns, htsDf):
    mo.stop(htsDf is None or len(htsColumns) == 0, mo.md(""))

    htsBizNoCol = mo.ui.dropdown(
        options=htsColumns,
        value=next((c for c in htsColumns if '사업자' in c or '등록번호' in c), htsColumns[0]),
        label="홈택스 - 사업자등록번호 컬럼"
    )

    htsAmountCol = mo.ui.dropdown(
        options=htsColumns,
        value=next((c for c in htsColumns if '공급가' in c or '금액' in c), htsColumns[0]),
        label="홈택스 - 공급가액 컬럼"
    )

    htsTaxCol = mo.ui.dropdown(
        options=htsColumns,
        value=next((c for c in htsColumns if '세액' in c or 'VAT' in c), htsColumns[0]),
        label="홈택스 - 세액 컬럼"
    )

    htsExtraCol1 = mo.ui.dropdown(
        options=["선택 안 함"] + htsColumns,
        value=next((c for c in htsColumns if '일자' in c or '날짜' in c or 'date' in c.lower()), "선택 안 함"),
        label="홈택스 - 발행일자 (선택)"
    )

    htsExtraCol2 = mo.ui.dropdown(
        options=["선택 안 함"] + htsColumns,
        value=next((c for c in htsColumns if '상호' in c or '회사' in c or '거래처' in c), "선택 안 함"),
        label="홈택스 - 거래처명 (선택)"
    )

    mo.vstack([
        mo.md("### 📋 홈택스 컬럼 매핑"),
        htsBizNoCol,
        htsAmountCol,
        htsTaxCol,
        htsExtraCol1,
        htsExtraCol2
    ])
    return htsAmountCol, htsBizNoCol, htsExtraCol1, htsExtraCol2, htsTaxCol


@app.cell
def _(taxType):
    erpFile = mo.ui.file(
        filetypes=[".xlsx", ".xls"],
        multiple=False,
        kind="area",
        label=f"💼 ERP {taxType.value} 세금계산서 엑셀"
    )
    erpFile
    return (erpFile,)


@app.cell
def _(erpFile, pd, BytesIO):
    mo.stop(not erpFile.value, mo.md(""))

    erpContent = erpFile.contents(0)
    erpName = erpFile.name(0)

    erpHeaderRow = mo.ui.number(
        start=0,
        stop=20,
        step=1,
        value=3,
        label="ERP 헤더 행 번호 (0부터 시작)"
    )

    erpDf = None
    erpColumns = []

    try:
        erpDf = pd.read_excel(BytesIO(erpContent), header=erpHeaderRow.value)
        erpColumns = list(erpDf.columns)
        mo.vstack([
            mo.md(f"✅ **ERP 파일 읽기 성공**: {len(erpDf)}행 × {len(erpDf.columns)}열"),
            erpHeaderRow,
            mo.md(f"컬럼: {', '.join(erpColumns[:10])}" + ("..." if len(erpColumns) > 10 else ""))
        ])
    except Exception as e:
        mo.md(f"❌ 파일 읽기 실패: {str(e)}")
    return erpColumns, erpContent, erpDf, erpHeaderRow, erpName


@app.cell
def _(erpColumns, erpDf):
    mo.stop(erpDf is None or len(erpColumns) == 0, mo.md(""))

    erpBizNoCol = mo.ui.dropdown(
        options=erpColumns,
        value=next((c for c in erpColumns if '사업자' in c or '등록번호' in c), erpColumns[0]),
        label="ERP - 사업자등록번호 컬럼"
    )

    erpAmountCol = mo.ui.dropdown(
        options=erpColumns,
        value=next((c for c in erpColumns if '공급가' in c or '금액' in c), erpColumns[0]),
        label="ERP - 공급가액 컬럼"
    )

    erpTaxCol = mo.ui.dropdown(
        options=erpColumns,
        value=next((c for c in erpColumns if '세액' in c or '부가세' in c or 'VAT' in c), erpColumns[0]),
        label="ERP - 세액 컬럼"
    )

    erpExtraCol1 = mo.ui.dropdown(
        options=["선택 안 함"] + erpColumns,
        value=next((c for c in erpColumns if '일자' in c or '날짜' in c or 'date' in c.lower()), "선택 안 함"),
        label="ERP - 발행일자 (선택)"
    )

    erpExtraCol2 = mo.ui.dropdown(
        options=["선택 안 함"] + erpColumns,
        value=next((c for c in erpColumns if '상호' in c or '회사' in c or '거래처' in c), "선택 안 함"),
        label="ERP - 거래처명 (선택)"
    )

    mo.vstack([
        mo.md("### 📋 ERP 컬럼 매핑"),
        erpBizNoCol,
        erpAmountCol,
        erpTaxCol,
        erpExtraCol1,
        erpExtraCol2
    ])
    return erpAmountCol, erpBizNoCol, erpExtraCol1, erpExtraCol2, erpTaxCol


@app.cell
def _(htsDf, erpDf):
    mo.stop(htsDf is None or erpDf is None, mo.md(""))

    runBtn = mo.ui.run_button(label="🚀 대사 시작하기")

    mo.vstack([
        mo.md("---"),
        mo.md("### ✅ 모든 준비 완료"),
        mo.md(f"홈택스: {len(htsDf)}건 | ERP: {len(erpDf)}건"),
        runBtn
    ])
    return (runBtn,)


@app.cell
def _(runBtn, htsDf, erpDf, htsBizNoCol, htsAmountCol, htsTaxCol, htsExtraCol1, htsExtraCol2, erpBizNoCol, erpAmountCol, erpTaxCol, erpExtraCol1, erpExtraCol2, pd):
    mo.stop(not runBtn.value, mo.md(""))

    def processDataFrame(df, prefix, bizNoCol, amountCol, taxCol, extraCol1, extraCol2):
        selectCols = [bizNoCol, amountCol, taxCol]
        if extraCol1 != "선택 안 함":
            selectCols.append(extraCol1)
        if extraCol2 != "선택 안 함":
            selectCols.append(extraCol2)

        processed = df[selectCols].copy()
        processed.columns = [f'{prefix}_{col}' for col in processed.columns]

        bizNoColName = f'{prefix}_{bizNoCol}'
        amountColName = f'{prefix}_{amountCol}'
        taxColName = f'{prefix}_{taxCol}'

        processed[bizNoColName] = processed[bizNoColName].astype(str).str.replace('-', '', regex=False)

        processed = processed.sort_values(
            by=[bizNoColName, amountColName, taxColName],
            ascending=[True, True, True]
        )

        processed = processed.assign(
            KEY_사업자등록번호=processed[bizNoColName],
            KEY_공급가액=processed[amountColName],
            KEY_세액=processed[taxColName]
        )

        processed['KEY_중복체크'] = processed.groupby(
            ['KEY_사업자등록번호', 'KEY_공급가액']
        ).cumcount() + 1

        return processed

    htsProcessed = processDataFrame(
        htsDf, 'HTS',
        htsBizNoCol.value, htsAmountCol.value, htsTaxCol.value,
        htsExtraCol1.value, htsExtraCol2.value
    )

    erpProcessed = processDataFrame(
        erpDf, 'ERP',
        erpBizNoCol.value, erpAmountCol.value, erpTaxCol.value,
        erpExtraCol1.value, erpExtraCol2.value
    )

    mergeResult = pd.merge(
        erpProcessed,
        htsProcessed,
        on=['KEY_사업자등록번호', 'KEY_공급가액', 'KEY_세액', 'KEY_중복체크'],
        how='outer'
    )

    erpBizColName = f'ERP_{erpBizNoCol.value}'
    htsBizColName = f'HTS_{htsBizNoCol.value}'

    mismatch = mergeResult.loc[
        (mergeResult[erpBizColName].isnull()) |
        (mergeResult[htsBizColName].isnull())
    ]

    matchCount = len(mergeResult) - len(mismatch)

    mo.vstack([
        mo.md("### 📊 대사 완료"),
        mo.md(f"**홈택스**: {len(htsProcessed)}건 | **ERP**: {len(erpProcessed)}건"),
        mo.md(f"**매칭 성공**: {matchCount}건 ✅"),
        mo.md(f"**불부합**: {len(mismatch)}건 ⚠️")
    ])
    return erpBizColName, erpProcessed, htsBizColName, htsProcessed, matchCount, mergeResult, mismatch, processDataFrame


@app.cell
def _(mismatch):
    mo.stop(len(mismatch) == 0, mo.md(""))

    mo.vstack([
        mo.md("### 🔍 불부합 건 미리보기 (처음 50건)"),
        mo.ui.table(mismatch.head(50), show_column_summaries=False)
    ])
    return


@app.cell
def _(htsProcessed, erpProcessed, mergeResult, mismatch, BytesIO):
    mo.stop(mergeResult is None or len(mergeResult) == 0, mo.md(""))

    import base64
    outputBuffer = BytesIO()

    with pd.ExcelWriter(outputBuffer, engine='openpyxl') as writer:
        htsProcessed.to_excel(writer, sheet_name='홈택스원본', index=False)
        erpProcessed.to_excel(writer, sheet_name='ERP원본', index=False)
        mergeResult.to_excel(writer, sheet_name='매칭결과', index=False)
        mismatch.to_excel(writer, sheet_name='불부합결과', index=False)

    outputBuffer.seek(0)
    excelB64 = base64.b64encode(outputBuffer.getvalue()).decode()

    mo.md(f'''
    <div style="margin-top: 24px; display: flex; justify-content: center;">
        <a href="data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,{excelB64}"
           download="세금계산서_검증결과.xlsx"
           style="display: inline-flex; align-items: center; gap: 8px; background: #18181b; color: white; height: 48px; padding: 0 24px; border-radius: 8px; font-weight: 500; text-decoration: none; font-size: 1rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            📥 엑셀 다운로드 (4시트)
        </a>
    </div>
    ''')
    return (excelB64,)


@app.cell
def _():
    mo.vstack([
        mo.Html('<br><br><br><br><br><br><br>'),
        setFooter(STUDYURL)
    ])
    return


if __name__ == "__main__":
    app.run()
