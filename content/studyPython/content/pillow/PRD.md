# Pillow (이미지 처리) PRD

## 개요
Pillow(PIL Fork)를 활용한 이미지 처리 기초 학습. Pyodide 환경에서 실행.

---

## 이미지 소스

### 1. sklearn 내장 이미지 (CORS 무관)
```python
from sklearn.datasets import load_sample_image
china = load_sample_image('china.jpg')
flower = load_sample_image('flower.jpg')
```

### 2. Lorem Picsum (CORS 지원)
```python
from urllib.request import urlopen
from PIL import Image
import io

url = "https://picsum.photos/400/300"
response = urlopen(url)
img = Image.open(io.BytesIO(response.read()))
```

### 3. 합성 이미지 생성
```python
from PIL import Image
img = Image.new('RGB', (400, 300), color='skyblue')
```

---

## 커버할 개념

### 기초 (01-03)
| 개념 | 함수/메서드 |
|------|-------------|
| 이미지 열기 | Image.open(), Image.new() |
| 이미지 정보 | size, mode, format |
| 색상 모드 | convert('L'), convert('RGB'), convert('RGBA') |
| 크기 조절 | resize(), thumbnail() |
| 자르기 | crop() |
| 회전/뒤집기 | rotate(), transpose() |

### 중급 (04-06)
| 개념 | 함수/메서드 |
|------|-------------|
| 필터 적용 | ImageFilter (BLUR, SHARPEN, CONTOUR 등) |
| 색상 조정 | ImageEnhance (Brightness, Contrast, Color, Sharpness) |
| 픽셀 조작 | getpixel(), putpixel(), load() |
| 채널 분리/합성 | split(), merge() |
| 히스토그램 | histogram() |

### 심화 (07-10)
| 개념 | 함수/메서드 |
|------|-------------|
| 텍스트 삽입 | ImageDraw.text() |
| 도형 그리기 | ImageDraw (line, rectangle, ellipse, polygon) |
| 이미지 합성 | paste(), alpha_composite(), blend() |
| 마스크 활용 | putalpha(), mask 파라미터 |
| 투명도 처리 | RGBA 모드, alpha 채널 |
| 일괄 처리 | 반복문 활용 |

---

## 10개 프로젝트 설계

### 01. 꽃 사진 탐색기 (입문)
- **데이터**: sklearn flower.jpg
- **결과물**: 이미지 정보 출력 + 썸네일
- **개념**: Image.open, size, mode, format, thumbnail
- **난이도**: ⭐

### 02. 중국 풍경 편집기 (입문)
- **데이터**: sklearn china.jpg
- **결과물**: 자르기 + 회전 적용 이미지
- **개념**: crop, rotate, transpose, resize
- **난이도**: ⭐

### 03. 흑백 사진 변환기 (기초)
- **데이터**: Lorem Picsum 랜덤 이미지
- **결과물**: 컬러 → 흑백 → 세피아 변환
- **개념**: convert, 색상 모드, 픽셀 연산
- **난이도**: ⭐⭐

### 04. 사진 필터 스튜디오 (기초)
- **데이터**: Lorem Picsum 인물 이미지
- **결과물**: 블러, 샤픈, 엣지 필터 비교
- **개념**: ImageFilter (BLUR, SHARPEN, CONTOUR, EDGE_ENHANCE)
- **난이도**: ⭐⭐

### 05. 밝기/대비 조절기 (기초)
- **데이터**: sklearn china.jpg
- **결과물**: 밝기/대비/채도 조절 이미지
- **개념**: ImageEnhance (Brightness, Contrast, Color, Sharpness)
- **난이도**: ⭐⭐

### 06. RGB 채널 분석기 (중급)
- **데이터**: Lorem Picsum 컬러풀 이미지
- **결과물**: R/G/B 채널 분리 + 히스토그램
- **개념**: split, merge, histogram, getpixel
- **난이도**: ⭐⭐⭐

### 07. 워터마크 생성기 (중급)
- **데이터**: sklearn flower.jpg
- **결과물**: 텍스트 + 반투명 워터마크
- **개념**: ImageDraw.text, paste, RGBA, alpha
- **난이도**: ⭐⭐⭐

### 08. 도형 아트 생성기 (중급)
- **데이터**: 합성 이미지 (Image.new)
- **결과물**: 도형으로 구성된 아트워크
- **개념**: ImageDraw (rectangle, ellipse, line, polygon, arc)
- **난이도**: ⭐⭐⭐

### 09. 포토 콜라주 메이커 (심화)
- **데이터**: Lorem Picsum 여러 이미지
- **결과물**: 4분할 콜라주
- **개념**: paste, resize, Image.new, 좌표 계산
- **난이도**: ⭐⭐⭐⭐

### 10. 종합 이미지 에디터 (심화)
- **데이터**: sklearn + Lorem Picsum + 합성
- **결과물**: 필터 + 텍스트 + 합성 종합 에디터
- **개념**: 전체 개념 종합
- **난이도**: ⭐⭐⭐⭐

---

## 개념 분배 매트릭스

| 개념 | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
|------|----|----|----|----|----|----|----|----|----|----|
| Image.open/new | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| size/mode/format | ✓ | ✓ | ✓ | | | ✓ | | | | ✓ |
| thumbnail/resize | ✓ | ✓ | | | | | | | ✓ | ✓ |
| crop | | ✓ | | | | | | | ✓ | ✓ |
| rotate/transpose | | ✓ | | | | | | | | ✓ |
| convert | | | ✓ | | | ✓ | ✓ | | | ✓ |
| ImageFilter | | | | ✓ | | | | | | ✓ |
| ImageEnhance | | | | | ✓ | | | | | ✓ |
| split/merge | | | | | | ✓ | | | | ✓ |
| histogram | | | | | | ✓ | | | | ✓ |
| getpixel/putpixel | | | ✓ | | | ✓ | | | | |
| ImageDraw.text | | | | | | | ✓ | | | ✓ |
| ImageDraw 도형 | | | | | | | | ✓ | | ✓ |
| paste | | | | | | | ✓ | | ✓ | ✓ |
| RGBA/alpha | | | | | | | ✓ | ✓ | | ✓ |

---

## 변수명 계획

### 공통 변수 풀
| 역할 | 1순위 | 2순위 | 3순위 |
|------|-------|-------|-------|
| 이미지 | img | photo, pic | canvas, frame |
| 크기 | size | dim, extent | imgSize |
| 너비 | width | w | imgWidth |
| 높이 | height | h | imgHeight |
| 픽셀 | pixel | px | rgbVal |
| 필터 | filtered | blurred, sharpened | imgBlur |
| 조정 | enhanced | adjusted | imgBright |
| 채널 | red, green, blue | r, g, b | chR, chG, chB |
| 그리기 | draw | artist | pencil |
| 결과 | result | output | final |

### 프로젝트별 변수 할당

**01. 꽃 사진 탐색기**
- img, width, height, thumb

**02. 중국 풍경 편집기**
- photo, cropped, rotated, resized

**03. 흑백 사진 변환기**
- pic, gray, sepia, pixels

**04. 사진 필터 스튜디오**
- canvas, blurred, sharpened, contour, edge

**05. 밝기/대비 조절기**
- frame, bright, contrast, saturated, sharp

**06. RGB 채널 분석기**
- source, red, green, blue, merged, hist

**07. 워터마크 생성기**
- base, watermark, draw, combined

**08. 도형 아트 생성기**
- board, artist, rect, circle, line

**09. 포토 콜라주 메이커**
- collage, img1, img2, img3, img4

**10. 종합 이미지 에디터**
- original, filtered, overlay, text, final

---

## 미션 구조

각 프로젝트 2개 미션:
- 미션1: 해당 프로젝트 핵심 개념 전체 과정
- 미션2: 누적 개념 종합 + 변형/확장

미션 앞 tip 필수:
```yaml
- type: tip
  content: 각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
```

---

## 주의사항

1. **CORS**: Lorem Picsum은 CORS 지원, 다른 외부 URL은 사용 금지
2. **변수 재할당 금지**: 각 code 블록은 marimo 셀, 파일 전체 변수 중복 금지
3. **변수명 우선순위**: 1단어 > 유사어 > 짧은2단어 > 숫자접미사(2개까지)
4. **코드 분리**: 5-10줄 단위, 마지막 라인 = 확인용 변수
5. **tip 위치**: 새 개념 첫 등장 코드 직후
