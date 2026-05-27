# 이미지 비전 기초 (fundamentals) PRD

## 트랙 목적

이 트랙은 Pillow, OpenCV, torchvision 같은 라이브러리에 들어가기 **전에** 학습자가 "이미지는 numpy 배열이다"를 체화하기 위한 기초 트랙이다. 픽셀, 좌표계, 채널, 슬라이싱, 마스크, 통계, 룩업 테이블을 직접 numpy로 다루며 이미지 비전 전체 트랙의 직관을 만든다.

다른 트랙(pillow/opencv/features/deepVision/applications)이 이 트랙 위에 얹힌다는 전제로 설계한다.

## 학습 후 도달 상태

- 이미지가 `(H, W, C)` shape의 `uint8` ndarray라는 사실을 코드로 즉시 확인할 수 있다.
- `(y, x)` 좌표계와 numpy 슬라이싱으로 임의 영역을 추출·합성할 수 있다.
- RGB / HSV / Lab 색공간을 각각 언제 쓰는지 설명하고 변환할 수 있다.
- 밝기·대비·감마 보정을 수식으로 표현하고 룩업 테이블로 가속할 수 있다.
- 마스크 배열로 두 이미지를 블렌딩하거나 영역별 처리를 할 수 있다.
- 이미지 통계로 자동 임계값을 구하고 화이트밸런스를 보정할 수 있다.

## 데이터 소스

이 트랙은 **외부 URL 의존을 최소화**한다. 모든 이미지는 다음 셋 중 하나로 만든다.

1. `sklearn.datasets.load_sample_image('china.jpg' | 'flower.jpg')` — RGB ndarray, 사이트 정책 무관
2. `numpy`로 합성한 색 패치/그라데이션 — 픽셀 산술·통계 학습에 적합
3. 필요 시 Lorem Picsum (`https://picsum.photos/...`) — 네트워크 가능할 때만

## 사용 라이브러리

- `numpy` (필수, 전 강의)
- `matplotlib` (시각화 전용; `plt.imshow`)
- `sklearn` (`load_sample_image` 한정)

OpenCV/Pillow는 이 트랙에서 사용하지 않는다. **순수 numpy로 이미지 사고를 만든다**가 핵심이다.

## 10개 강의 설계

| # | 제목 | 핵심 개념 | 데이터 | 난이도 |
|---|---|---|---|---|
| 01 | 픽셀과 ndarray | `np.zeros`, dtype=uint8, shape | 합성 | ⭐ |
| 02 | 좌표계 함정 | (y, x) vs (x, y), 원점 좌상단 | 합성 | ⭐ |
| 03 | 채널 구조 분해 | R/G/B 분리·재합성, alpha | sklearn flower | ⭐⭐ |
| 04 | 색공간 직관 | RGB↔HSV 수동 변환 + matplotlib hsv | sklearn china | ⭐⭐ |
| 05 | 슬라이싱과 ROI | 부분 영역 추출, 붙여넣기 | sklearn flower | ⭐⭐ |
| 06 | 픽셀 산술 | 밝기 +α, 대비 ×β, clip | sklearn china | ⭐⭐⭐ |
| 07 | 룩업 테이블 | `np.take`, 감마 보정, 톤 매핑 | sklearn china | ⭐⭐⭐ |
| 08 | 마스크 사고 | bool 배열, where, 블렌딩 | 합성 + sklearn | ⭐⭐⭐ |
| 09 | 이미지 통계 | mean/std/percentile, 자동 임계값 | sklearn china | ⭐⭐⭐ |
| 10 | 종합: 미니 보정기 | 위 9개 종합 — 자동 화이트밸런스 | sklearn china | ⭐⭐⭐⭐ |

## 개념 분배 매트릭스

| 개념 | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
|------|----|----|----|----|----|----|----|----|----|----|
| ndarray/shape/dtype | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 좌표계 (y,x) | ✓ | ✓ |   |   | ✓ |   |   | ✓ |   | ✓ |
| 채널 분해 |   |   | ✓ | ✓ |   |   |   | ✓ | ✓ | ✓ |
| 색공간 변환 |   |   |   | ✓ |   |   |   |   |   | ✓ |
| 슬라이싱 ROI |   |   |   |   | ✓ |   |   | ✓ |   | ✓ |
| 산술 + clip |   |   |   |   |   | ✓ | ✓ |   |   | ✓ |
| 룩업 테이블 |   |   |   |   |   |   | ✓ |   |   | ✓ |
| 마스크 / where |   |   |   |   |   |   |   | ✓ |   | ✓ |
| 통계 / percentile |   |   |   |   |   |   |   |   | ✓ | ✓ |
| matplotlib imshow | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## 변수명 풀

| 역할 | 1순위 | 2순위 | 3순위 |
|---|---|---|---|
| 이미지 | img | pic, photo | scene |
| 합성 캔버스 | canvas | board | plate |
| 결과 | result | output | adjusted |
| 그레이 | gray | mono | luma |
| 마스크 | mask | region | area |
| 룩업 | lut | table | mapping |
| 통계 | stats | summary | metrics |

## 강의 작성 원칙

1. 첫 줄은 `import numpy as np` 한 줄로 시작 — 무거운 라이브러리 없음.
2. 각 섹션 코드 블록 5~10줄, 마지막 라인은 확인용 변수.
3. matplotlib은 시각화 셀에서만 import (`plt.imshow(img)` + `plt.axis('off')`).
4. `print()` 금지 — 마지막 라인 표현식으로 노트북이 자동 출력.
5. 셀 간 변수 재할당 금지 — 파일 전체에서 같은 이름 한 번만 할당.
6. `tip` 블록은 새 개념 첫 등장 직후에만.

## Pillow/OpenCV로의 연결

각 강의 마지막에 "Pillow/OpenCV에서는 이것을 어떻게 다루는가" 한 줄 미리보기를 둔다. 예:

- 03강(채널 분해) → `cv2.split` 한 줄, `Image.split()` 한 줄
- 04강(색공간) → `cv2.cvtColor(img, cv2.COLOR_RGB2HSV)` 미리보기
- 06강(픽셀 산술) → `cv2.addWeighted` 미리보기

이 미리보기는 학습자가 다음 트랙에 들어갔을 때 "아, 이건 이미 numpy로 해봤지"라는 연결감을 만든다.
