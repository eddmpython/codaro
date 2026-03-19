# OpenCV (컴퓨터 비전) PRD

## 개요
OpenCV(cv2)를 활용한 컴퓨터 비전 기초 학습. Pyodide 환경에서 실행.

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
import numpy as np
import cv2

url = "https://picsum.photos/400/300"
resp = urlopen(url)
arr = np.asarray(bytearray(resp.read()), dtype=np.uint8)
img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
```

### 3. 합성 이미지 생성
```python
import numpy as np
img = np.zeros((300, 400, 3), dtype=np.uint8)
img[:] = (255, 200, 100)
```

---

## 커버할 개념

### 기초 (01-03)
| 개념 | 함수/메서드 |
|------|-------------|
| 이미지 구조 | shape, dtype, ndarray |
| 색공간 변환 | cvtColor (BGR, RGB, GRAY, HSV) |
| 크기 조절 | resize, INTER_LINEAR, INTER_AREA |
| 자르기 | 배열 슬라이싱 img[y1:y2, x1:x2] |
| 회전/뒤집기 | rotate, flip |
| 그리기 기초 | line, rectangle, circle, putText |

### 중급 (04-06)
| 개념 | 함수/메서드 |
|------|-------------|
| 필터링 | blur, GaussianBlur, medianBlur, bilateralFilter |
| 에지 검출 | Canny, Sobel, Laplacian |
| 임계값 처리 | threshold, adaptiveThreshold, THRESH_OTSU |
| 모폴로지 | erode, dilate, morphologyEx (OPEN, CLOSE) |
| 히스토그램 | calcHist, equalizeHist |

### 심화 (07-10)
| 개념 | 함수/메서드 |
|------|-------------|
| 컨투어 | findContours, drawContours, contourArea |
| 도형 근사 | approxPolyDP, boundingRect, minEnclosingCircle |
| 이미지 연산 | add, subtract, bitwise_and, bitwise_or |
| 마스킹 | inRange, mask 파라미터 |
| 템플릿 매칭 | matchTemplate, minMaxLoc |
| 원근 변환 | getPerspectiveTransform, warpPerspective |

---

## 10개 프로젝트 설계

### 01. 이미지 구조 탐색기 (입문)
- **데이터**: sklearn flower.jpg
- **결과물**: BGR/RGB 비교, shape/dtype 확인
- **개념**: ndarray, shape, dtype, cvtColor(BGR2RGB)
- **난이도**: ⭐

### 02. 색공간 변환기 (입문)
- **데이터**: sklearn china.jpg
- **결과물**: Gray, HSV, LAB 변환 비교
- **개념**: cvtColor, COLOR_BGR2GRAY, COLOR_BGR2HSV
- **난이도**: ⭐

### 03. 기하학적 변환기 (기초)
- **데이터**: Lorem Picsum
- **결과물**: 리사이즈, 회전, 뒤집기 적용
- **개념**: resize, rotate, flip, 슬라이싱
- **난이도**: ⭐⭐

### 04. 이미지 필터 랩 (기초)
- **데이터**: Lorem Picsum (노이즈 이미지)
- **결과물**: 블러, 샤프닝, 노이즈 제거 비교
- **개념**: blur, GaussianBlur, medianBlur, bilateralFilter
- **난이도**: ⭐⭐

### 05. 에지 검출기 (기초)
- **데이터**: sklearn china.jpg
- **결과물**: Canny, Sobel, Laplacian 비교
- **개념**: Canny, Sobel, Laplacian, convertScaleAbs
- **난이도**: ⭐⭐

### 06. 이진화 스튜디오 (중급)
- **데이터**: Lorem Picsum (텍스트 이미지)
- **결과물**: 전역/적응형 임계값 비교
- **개념**: threshold, adaptiveThreshold, THRESH_OTSU
- **난이도**: ⭐⭐⭐

### 07. 모폴로지 연산기 (중급)
- **데이터**: 합성 이미지 (노이즈 도형)
- **결과물**: 침식, 팽창, 열기, 닫기 효과
- **개념**: erode, dilate, morphologyEx, getStructuringElement
- **난이도**: ⭐⭐⭐

### 08. 히스토그램 분석기 (중급)
- **데이터**: sklearn flower.jpg
- **결과물**: 히스토그램 시각화, 평활화 적용
- **개념**: calcHist, equalizeHist, CLAHE
- **난이도**: ⭐⭐⭐

### 09. 컨투어 탐지기 (심화)
- **데이터**: 합성 이미지 (도형들)
- **결과물**: 컨투어 검출, 면적/둘레 계산
- **개념**: findContours, drawContours, contourArea, arcLength
- **난이도**: ⭐⭐⭐⭐

### 10. 종합 비전 프로젝트 (심화)
- **데이터**: sklearn + Lorem Picsum + 합성
- **결과물**: 색상 필터링 + 컨투어 + 마스킹 종합
- **개념**: 전체 개념 종합, inRange, bitwise_and
- **난이도**: ⭐⭐⭐⭐

---

## 개념 분배 매트릭스

| 개념 | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
|------|----|----|----|----|----|----|----|----|----|----|
| shape/dtype | ✓ | ✓ | ✓ | | | | | ✓ | | ✓ |
| cvtColor | ✓ | ✓ | | | ✓ | ✓ | | ✓ | ✓ | ✓ |
| resize | | | ✓ | | | | | | ✓ | ✓ |
| rotate/flip | | | ✓ | | | | | | | ✓ |
| 슬라이싱 | ✓ | | ✓ | | | | | | | ✓ |
| blur/GaussianBlur | | | | ✓ | ✓ | | | | | ✓ |
| medianBlur | | | | ✓ | | | | | | |
| bilateralFilter | | | | ✓ | | | | | | |
| Canny | | | | | ✓ | | | | ✓ | ✓ |
| Sobel/Laplacian | | | | | ✓ | | | | | |
| threshold | | | | | | ✓ | ✓ | | ✓ | ✓ |
| adaptiveThreshold | | | | | | ✓ | | | | |
| erode/dilate | | | | | | | ✓ | | ✓ | ✓ |
| morphologyEx | | | | | | | ✓ | | | ✓ |
| calcHist | | | | | | | | ✓ | | ✓ |
| equalizeHist | | | | | | | | ✓ | | |
| findContours | | | | | | | | | ✓ | ✓ |
| drawContours | | | | | | | | | ✓ | ✓ |
| contourArea | | | | | | | | | ✓ | ✓ |
| inRange | | | | | | | | | | ✓ |
| bitwise_and | | | | | | | | | | ✓ |
| line/rectangle/circle | ✓ | | | | | | | | ✓ | ✓ |
| putText | ✓ | | | | | | | | | ✓ |

---

## 변수명 계획

### 공통 변수 풀 (1순위: 1단어)
| 역할 | 1순위 | 2순위 | 3순위 |
|------|-------|-------|-------|
| 이미지 | img | frame, pic | photo, canvas |
| 결과 | result | output | processed |
| 그레이 | gray | mono | bw |
| 에지 | edges | border | outline |
| 블러 | blurred | smooth | soft |
| 마스크 | mask | region | area |
| 컨투어 | contours | shapes | outlines |
| 히스토그램 | hist | distribution | freq |
| 커널 | kernel | element | structElem |
| 임계값 | thresh | binary | binarized |

### 프로젝트별 변수 할당 (파일 내 중복 금지)

**01. 이미지 구조 탐색기**
- img, bgr, rgb, height, width, channels

**02. 색공간 변환기**
- photo, gray, hsv, lab, hue, sat, val

**03. 기하학적 변환기**
- frame, resized, rotated, flipped, cropped

**04. 이미지 필터 랩**
- pic, blurred, gaussian, median, bilateral

**05. 에지 검출기**
- canvas, gray, canny, sobelX, sobelY, laplacian

**06. 이진화 스튜디오**
- source, mono, binary, adaptive, otsu

**07. 모폴로지 연산기**
- base, kernel, eroded, dilated, opened, closed

**08. 히스토그램 분석기**
- original, hist, equalized, clahe, enhanced

**09. 컨투어 탐지기**
- board, thresh, contours, drawn, areas

**10. 종합 비전 프로젝트**
- scene, hsv, mask, masked, edges, shapes, final

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

1. **BGR 순서**: OpenCV는 RGB가 아닌 BGR 순서 사용
2. **CORS**: Lorem Picsum은 CORS 지원, 다른 외부 URL 사용 금지
3. **변수 재할당 금지**: 각 code 블록은 marimo 셀, 파일 전체 변수 중복 금지
4. **변수명 우선순위**: 1단어 > 유사어 > 짧은2단어 > 숫자접미사(2개까지)
5. **코드 분리**: 5-10줄 단위, 마지막 라인 = 확인용 변수
6. **tip 위치**: 새 개념 첫 등장 코드 직후
7. **시각화**: matplotlib으로 이미지 출력 (cv2.imshow는 Pyodide 미지원)

---

## Pillow와 차이점

| 항목 | Pillow | OpenCV |
|------|--------|--------|
| 색순서 | RGB | BGR |
| 자료형 | PIL.Image | numpy.ndarray |
| 용도 | 정적 이미지 편집 | 컴퓨터 비전, 분석 |
| 장점 | 간단한 API | 강력한 분석 기능 |
