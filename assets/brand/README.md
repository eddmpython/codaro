# Codaro Brand Assets

## 목적

`assets/brand/`는 Codaro 브랜드 원본 자산을 보관하는 경로다.
여기는 디자인 원본과 참고 이미지를 두는 곳이다.

## 저장 원칙

- GitHub에 같이 올라가야 하는 브랜드 자산만 둔다
- 원본 이미지, 크롭 전 참고 이미지, 벡터 원본을 같이 보관한다
- 프론트에서 직접 서빙할 파일은 여기 두지 않는다
- 서비스에서 실제로 쓰는 파일은 `frontend/static/brand/`로 export해서 사용한다

## 권장 구조

- `assets/brand/mascot/source/`
  - 원본 참고 이미지
  - 라이선스 확인이 필요한 외부 레퍼런스
- `assets/brand/mascot/work/`
  - 크롭 실험본
  - 단순화 시안
  - 배경 제거본
- `assets/brand/logo/`
  - 워드마크
  - 심볼
- `assets/brand/favicon/`
  - 파비콘 원본 SVG
  - 변형안

## 마스코트 운영 규칙

- 아바타와 파비콘은 같은 캐릭터를 쓰더라도 파일을 분리한다
- 파비콘은 디테일이 아니라 실루엣 우선으로 따로 단순화한다
- 외부 생성 이미지라면 사용권을 먼저 확인한 뒤 source로 저장한다
- 사용권이 불명확하면 source에는 두되, 실제 서비스 경로로 승격하지 않는다
- 서비스용 자산은 투명 배경 PNG만 사용한다
- 생성 파이프라인은 `scripts/buildBrandAssets.py`를 source of truth로 본다
- 기본 avatar/favicon source는 `codaro-sheet-01.png`의 첫 번째 왼쪽 pose다
- pose sheet source는 `codaro-sheet-01.png`, `codaro-sheet-02.png`다
- `dartlab` 자산은 참고 이미지로만 둘 수 있고, Codaro active asset로 승격하면 안 된다

## 자산 생성 명령

```bash
uv run --no-project --with pillow python -X utf8 scripts/buildBrandAssets.py
```

## 현재 마스코트 자산

- source 원본
  - `assets/brand/mascot/source/codaro-sheet-01.png`
  - `assets/brand/mascot/source/codaro-sheet-02.png`
- 현재 서비스용 export
  - `assets/brand/mascot/work/avatar-full.png`
  - `assets/brand/mascot/work/avatar-small.png`
  - `assets/brand/mascot/work/avatar-face.png`
  - `assets/brand/mascot/work/favicon.png`
  - `assets/brand/mascot/work/apple-touch-icon.png`
  - `frontend/static/brand/avatar-full.png`
  - `frontend/static/brand/avatar-small.png`
  - `frontend/static/brand/avatar-face.png`
  - `frontend/static/brand/apple-touch-icon.png`
  - `frontend/static/favicon.png`
- pose별 PNG 작업본
  - `assets/brand/mascot/work/poses/sheet-01/pose-01.png`
  - `assets/brand/mascot/work/poses/sheet-01/pose-02.png`
  - `assets/brand/mascot/work/poses/sheet-01/pose-03.png`
  - `assets/brand/mascot/work/poses/sheet-01/pose-04.png`
  - `assets/brand/mascot/work/poses/sheet-01/pose-05.png`
  - `assets/brand/mascot/work/poses/sheet-01/pose-06.png`
  - `assets/brand/mascot/work/poses/sheet-01/pose-07.png`
  - `assets/brand/mascot/work/poses/sheet-01/pose-08.png`
  - `assets/brand/mascot/work/poses/sheet-02/pose-01.png`
  - `assets/brand/mascot/work/poses/sheet-02/pose-02.png`
  - `assets/brand/mascot/work/poses/sheet-02/pose-03.png`
  - `assets/brand/mascot/work/poses/sheet-02/pose-04.png`
  - `assets/brand/mascot/work/poses/sheet-02/pose-05.png`
  - `assets/brand/mascot/work/poses/sheet-02/pose-06.png`
  - `assets/brand/mascot/work/poses/sheet-02/pose-07.png`
  - `assets/brand/mascot/work/poses/sheet-02/pose-08.png`
