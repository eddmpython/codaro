# MarimoMounter 클래스 설계 문서

## 개요
FastAPI에 마리모 앱(note.py)을 마운트하는 유틸리티 클래스

---

## 목적
1. `content/practical/*/note.py` 파일을 자동 탐색
2. 각 앱을 `/marimo/실전파이썬/{폴더명}` 경로에 마운트
3. 학습 페이지 ↔ 앱 페이지 간 양방향 연결

---

## 클래스 구조

```python
from pathlib import Path
from fastapi import FastAPI
import marimo

class MarimoMounter:
    def __init__(self, app: FastAPI, contentDir: Path):
        self.app = app
        self.contentDir = contentDir
        self.practicalDir = contentDir / "practical"
        self.mountedApps = {}

    def discoverApps(self) -> list[dict]:
        """practical 폴더 내 note.py 파일 탐색"""
        apps = []
        for folder in self.practicalDir.iterdir():
            if folder.is_dir():
                notePath = folder / "note.py"
                if notePath.exists():
                    apps.append({
                        "name": folder.name,
                        "path": notePath,
                        "url": f"/marimo/실전파이썬/{folder.name}"
                    })
        return apps

    def mountAll(self):
        """발견된 모든 앱 마운트"""
        apps = self.discoverApps()
        for appInfo in apps:
            self.mountApp(appInfo)

    def mountApp(self, appInfo: dict):
        """단일 앱 마운트"""
        server = marimo.create_asgi_app()
        server = server.with_app(path="", root=str(appInfo["path"]))
        self.app.mount(appInfo["url"], server)
        self.mountedApps[appInfo["name"]] = appInfo

    def getAppUrl(self, appName: str) -> str | None:
        """앱 이름으로 URL 조회"""
        if appName in self.mountedApps:
            return self.mountedApps[appName]["url"]
        return None

    def listApps(self) -> list[dict]:
        """마운트된 앱 목록 반환"""
        return list(self.mountedApps.values())
```

---

## 사용 예시

### main.py에서 초기화

```python
from fastapi import FastAPI
from pathlib import Path
from pages.studyPython.content.practical.marimoMounter import MarimoMounter

app = FastAPI()

contentDir = Path(__file__).parent / "pages/studyPython/content"
mounter = MarimoMounter(app, contentDir)
mounter.mountAll()
```

### 마운트 결과

```
/marimo/실전파이썬/01_엑셀파일병합  → practical/01_엑셀파일병합/note.py
/marimo/실전파이썬/02_PDF병합      → practical/02_PDF병합/note.py
/marimo/실전파이썬/03_이미지일괄변환 → practical/03_이미지일괄변환/note.py
```

---

## 파일 위치

```
pages/studyPython/content/practical/
├── marimoMounter.py         # MarimoMounter 클래스
├── PRD.md
├── PRACTICAL_PRINCIPLES.md
├── MARIMO_MOUNTER_SPEC.md   # 이 문서
├── 00_실전파이썬소개.yaml
├── 01_엑셀파일병합/
│   ├── study.yaml
│   └── note.py
```

---

## 의존성

```
marimo>=0.8.0
fastapi>=0.100.0
```

marimo ASGI 앱 생성 방식:
```python
import marimo
server = marimo.create_asgi_app()
server = server.with_app(path="", root="path/to/note.py")
```

---

## 렌더러 연동

### marimoApp 블록 처리

niceguiRenderer.py에 marimoApp 블록 렌더러 추가:

```python
def renderMarimoAppLink(self, block: dict):
    """마리모 앱 링크 버튼 렌더링"""
    appPath = block.get('appPath', '')
    buttonText = block.get('buttonText', '앱 실행하기')
    description = block.get('description', '')
    appUrl = f"/marimo/실전파이썬/{appPath}"

    with ui.column().classes('w-full items-center gap-3 p-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl'):
        if description:
            ui.label(description).classes('text-white text-sm')
        ui.button(buttonText, on_click=lambda: ui.navigate.to(appUrl, new_tab=True))
            .props('color="white" text-color="orange-600" size="lg" no-caps')
            .classes('font-bold px-8')
```

---

## 추후 확장

1. **앱 목록 페이지**: `/marimo/실전파이썬`에서 모든 앱 목록 표시
2. **앱 메타데이터**: 각 앱의 설명, 아이콘, 카테고리 등
3. **사용 통계**: 앱별 접속 횟수 추적
4. **핫 리로드**: 개발 모드에서 note.py 변경 시 자동 반영
