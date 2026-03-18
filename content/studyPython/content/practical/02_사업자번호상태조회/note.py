# /// script
# [tool.marimo.display]
# theme = "light"
# ///

import marimo

__generated_with = "0.18.4"
app = marimo.App(app_title="사업자번호 상태조회")

with app.setup:
    from pathlib import Path
    import marimo as mo
    import sys

    currentDir = Path(__file__).resolve().parent
    path = currentDir
    while path != path.parent:
        if (path / 'eddmpython').exists():
            ROOT = path / 'eddmpython'
            break
        elif path.name == 'eddmpython':
            ROOT = path
            break
        path = path.parent

    sys.path.insert(0, str(ROOT))
    sys.path.append(str(Path(__file__).parent.parent))

    from noteWidgets.widgets import setHeader, setFooter
    from credentials.keys import NTS_BIZ_STATUS_KEY

    TITLE = "사업자번호 상태조회"
    SHORTDESC = "국세청 API로 사업자등록번호 상태를 조회합니다"
    LONGDESC = """
    거래처의 <b>휴폐업 상태</b>를 확인하는 것은 <b>내부회계관리제도</b>의 중요 통제항목 중 하나입니다.<br>
    별거 아닌 것 같은 절차지만, 폐업한 업체에 대금을 지급하거나 허위 거래를 만드는 부정을 방지하는 핵심 통제입니다.<br>
    실제로 휴폐업 업체와의 거래는 <b>가공거래, 횡령, 세금계산서 위장</b> 등 부정의 단서가 되기도 합니다.<br><br>
    국세청 공공데이터 API를 활용하면 사업자등록번호만으로 <b>계속사업자, 휴업자, 폐업자</b> 여부를 확인할 수 있습니다.<br>
    텍스트 입력, 테이블 입력, 엑셀 업로드 중 편한 방식을 선택하세요.
    """
    STUDYURL = "/study/실전파이썬/02_사업자번호상태조회"


@app.cell
def _():
    setHeader(TITLE, SHORTDESC, LONGDESC)
    return


@app.cell
def _():
    import pandas as pd
    import requests
    import json
    import re
    from io import BytesIO
    return BytesIO, json, pd, re, requests


@app.cell
def _():
    URL = f"https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey={NTS_BIZ_STATUS_KEY}&returnType=JSON"
    NOTICE_URL = "https://www.data.go.kr/bbs/ntc/selectNoticeListView.do?pageIndex=1&originId=&atchFileId=&nttApiYn=Y&searchCondition2=2&searchKeyword1="
    return NOTICE_URL, URL


@app.cell
def _(json, requests, URL, NOTICE_URL):
    def fetchBizStatus(nums):
        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        body = {"b_no": nums}

        res = requests.post(URL, data=json.dumps(body), headers=headers)
        if res.status_code != 200:
            return [{"사업자번호": n, "상태": "API 오류", "과세유형": f"HTTP {res.status_code}"} for n in nums], res.status_code

        data = res.json()
        out = []
        for item in data.get("data", []):
            out.append({
                "사업자번호": item.get("b_no", ""),
                "상태": item.get("b_stt", ""),
                "과세유형": item.get("tax_type", ""),
            })
        return out, None
    return (fetchBizStatus,)


@app.cell
def _(pd):
    selector = mo.ui.radio(
        options=["텍스트", "테이블", "엑셀"],
        value="텍스트",
        inline=True
    )

    text = mo.ui.text_area(
        placeholder="사업자번호를 한 줄에 하나씩 입력하세요\n예시:\n123-45-67890\n1234567890",
        rows=8,
        full_width=True
    )

    init = pd.DataFrame({"사업자번호": [""]})
    table = mo.ui.data_editor(data=init)

    file = mo.ui.file(
        filetypes=[".xlsx", ".xls", ".csv"],
        multiple=False,
        kind="area",
        label="엑셀/CSV 파일 (첫 번째 열 사용)"
    )

    btn = mo.ui.run_button(label="조회하기")
    return btn, file, init, selector, table, text


@app.cell
def _(selector, text, table, file, btn):
    desc = {
        "텍스트": "한 줄에 하나씩 입력. 하이픈(-) 포함 가능.",
        "테이블": "셀 클릭해서 입력. 행 추가는 + 버튼.",
        "엑셀": "첫 번째 열에 사업자번호가 있는 파일."
    }

    area = text if selector.value == "텍스트" else (table if selector.value == "테이블" else file)

    mo.vstack([
        mo.hstack([selector, mo.md(f"<span style='color:#71717a; font-size:0.85rem;'>{desc[selector.value]}</span>")], align="center", gap="1rem"),
        area,
        mo.hstack([btn], justify="end")
    ])
    return area, desc


@app.cell
def _(selector, text, table, file, re, pd, BytesIO, btn):
    mo.stop(not btn.value, mo.md(""))

    nums = []

    if selector.value == "텍스트":
        if text.value:
            for line in text.value.strip().split('\n'):
                num = re.sub(r'[^\d]', '', line)
                if len(num) == 10:
                    nums.append(num)

    elif selector.value == "테이블":
        df = table.value
        if df is not None and len(df) > 0:
            for val in df.iloc[:, 0]:
                if pd.notna(val):
                    num = re.sub(r'[^\d]', '', str(val))
                    if len(num) == 10:
                        nums.append(num)

    elif selector.value == "엑셀":
        if file.value:
            raw = file.contents(0)
            name = file.name(0)
            df = pd.read_csv(BytesIO(raw)) if name.endswith('.csv') else pd.read_excel(BytesIO(raw))
            for val in df.iloc[:, 0]:
                if pd.notna(val):
                    num = re.sub(r'[^\d]', '', str(val))
                    if len(num) == 10:
                        nums.append(num)

    mo.stop(len(nums) == 0, mo.md("⚠️ 유효한 10자리 사업자번호가 없습니다."))
    mo.md(f"**{len(nums)}개**의 유효한 사업자번호를 찾았습니다.")
    return df, name, num, nums, raw, val


@app.cell
def _(nums, fetchBizStatus, NOTICE_URL):
    results = []
    apiError = None
    for i in range(0, len(nums), 100):
        batch = nums[i:i+100]
        data, err = fetchBizStatus(batch)
        if err:
            apiError = err
        results.extend(data)
    return apiError, batch, data, i, results


@app.cell
def _(results, pd, apiError, NOTICE_URL):
    resultDf = pd.DataFrame(results)

    if apiError:
        mo.vstack([
            mo.md(f"⚠️ **API 오류 발생** (HTTP {apiError})"),
            mo.md(f"공공데이터포털 점검 중일 수 있습니다. <a href='{NOTICE_URL}' target='_blank'>📢 공지사항 확인</a>")
        ])
    return (resultDf,)


@app.cell
def _(resultDf):
    mo.stop(resultDf.empty, mo.md(""))

    mo.vstack([
        mo.md(f"**조회 완료**: {len(resultDf)}건"),
        mo.ui.table(resultDf, show_column_summaries=False)
    ])
    return


@app.cell
def _(resultDf, NOTICE_URL, BytesIO):
    mo.stop(resultDf.empty, mo.md(""))

    import base64
    outputBuffer = BytesIO()
    resultDf.to_excel(outputBuffer, index=False, engine='openpyxl')
    outputBuffer.seek(0)
    excelB64 = base64.b64encode(outputBuffer.getvalue()).decode()

    hasError = "상태" in resultDf.columns and (resultDf["상태"] == "API 오류").any()
    noticeBtn = f'''<button onclick="window.open('{NOTICE_URL}', '_blank')" style="background: #dc2626; color: white; height: 40px; padding: 0 20px; border-radius: 8px; border: none; cursor: pointer;">📢 공지사항 확인</button>''' if hasError else ""

    mo.md(f'''
    <div style="margin-top: 16px; display: flex; justify-content: center; gap: 8px;">
        <a href="data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,{excelB64}" download="사업자번호_조회결과.xlsx"
           style="display: inline-flex; align-items: center; background: #18181b; color: white; height: 40px; padding: 0 20px; border-radius: 8px; text-decoration: none; cursor: pointer;">
            📥 엑셀 다운로드
        </a>
        {noticeBtn}
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
