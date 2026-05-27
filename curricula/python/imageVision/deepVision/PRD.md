# 딥러닝 비전 (deepVision) PRD

## 트랙 목적

torchvision의 사전학습 모델을 활용해 분류·탐지·세그멘테이션을 노트북에서 추론하는 트랙. 모델을 직접 학습시키는 것이 목적이 아니라 **이미 학습된 강력한 모델을 일상 작업에 활용하는 감각**을 만든다.

CPU만으로 충분히 굴러갈 수 있도록 모델 크기를 적절히 골랐고, 모든 추론은 단일 이미지 또는 작은 배치(<= 4장) 기준으로 설계한다.

opencv·visionFeatures 트랙을 마친 학습자(또는 visionBasics만 마쳐도 ok) 가 대상이다.

## 학습 후 도달 상태

- numpy 이미지 ↔ torch 텐서를 자유롭게 변환할 수 있다.
- torchvision 사전학습 ResNet으로 ImageNet 분류 추론을 한 줄로 호출할 수 있다.
- 분류 모델의 마지막 층을 빼고 임베딩 벡터를 추출할 수 있다.
- 임베딩 + 코사인 유사도로 이미지 검색 기능을 만들 수 있다.
- Faster R-CNN으로 객체 박스를 검출하고 시각화할 수 있다.
- DeepLabV3로 세맨틱 세그멘테이션 마스크를 그릴 수 있다.
- Keypoint R-CNN으로 사람 포즈 키포인트를 추정할 수 있다.
- 전이학습 (fine-tune) 의 표준 패턴을 이해한다.

## 데이터 소스

- `sklearn.datasets.load_sample_image('china.jpg' | 'flower.jpg')` — 외부 의존 0
- `torchvision.models.<model>` 의 weights 객체에 들어 있는 카테고리 라벨

## 사용 라이브러리

- `torch`, `torchvision` (PyTorch 최신 버전)
- `numpy`, `matplotlib`
- `sklearn`

CPU 모드만 사용한다. CUDA 코드는 다루지 않는다.

## 모델 정책

| 강의 | 모델 | 용도 |
|---|---|---|
| 02 분류 | ResNet18 (사전학습) | ImageNet 1000클래스 분류 |
| 03 임베딩 | ResNet18 마지막 FC 제거 | 512차원 임베딩 |
| 04 유사도 검색 | ResNet18 임베딩 + 코사인 | 작은 라이브러리 검색 |
| 05 객체 탐지 | Faster R-CNN ResNet50 FPN | bbox + score + label |
| 06 세그멘테이션 | DeepLabV3 ResNet50 | 픽셀 단위 클래스 |
| 07 포즈 | Keypoint R-CNN | 사람 17포인트 |
| 08 전이학습 | ResNet18 마지막 층 학습 | 2클래스 toy classifier |
| 09 모델 비교 | ResNet18 vs ResNet50 | 정확도/속도 트레이드오프 |
| 10 종합 | 분류+탐지+세그 | 사진 한 장 자동 태깅 |

## 10개 강의 설계

| # | 제목 | 핵심 개념 | 난이도 |
|---|---|---|---|
| 01 | torchvision 입문 + 텐서 ↔ 이미지 | ToTensor, normalize, permute | ⭐⭐ |
| 02 | ResNet 사전학습 분류 | weights, transforms, top-k | ⭐⭐⭐ |
| 03 | 임베딩 벡터 추출 | nn.Sequential 분해, feature vector | ⭐⭐⭐ |
| 04 | 이미지 유사도 검색 | cosine similarity, top-N | ⭐⭐⭐ |
| 05 | Faster R-CNN 객체 탐지 | bbox, score, label, threshold | ⭐⭐⭐⭐ |
| 06 | DeepLabV3 세맨틱 세그 | 픽셀별 클래스 argmax | ⭐⭐⭐⭐ |
| 07 | Keypoint R-CNN 포즈 추정 | 17 keypoints + skeleton | ⭐⭐⭐⭐ |
| 08 | 전이학습 fine-tune | 마지막 층만 학습, requires_grad | ⭐⭐⭐⭐ |
| 09 | 모델 비교: 정확도와 속도 | time.perf_counter, top1 일치 | ⭐⭐⭐ |
| 10 | 종합: 사진 자동 태깅기 | 분류 + 탐지 + 세그 모음 | ⭐⭐⭐⭐ |

## 개념 분배 매트릭스

| 개념 | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| 텐서 변환 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| weights API |   | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |   | ✓ | ✓ |
| 분류 |   | ✓ |   |   |   |   |   | ✓ | ✓ | ✓ |
| 임베딩 |   |   | ✓ | ✓ |   |   |   |   |   |   |
| 객체탐지 |   |   |   |   | ✓ |   |   |   |   | ✓ |
| 세그멘테이션 |   |   |   |   |   | ✓ |   |   |   | ✓ |
| 포즈 |   |   |   |   |   |   | ✓ |   |   |   |
| 학습 (fine-tune) |   |   |   |   |   |   |   | ✓ |   |   |

## 강의 작성 원칙

1. 사전학습 가중치는 첫 호출 시 다운로드된다. 인터넷 없는 환경에서는 첫 강 실행이 실패할 수 있음을 학습자에게 명시한다.
2. 모델은 `model.eval()` 로 평가 모드 고정 후 `torch.inference_mode()` 안에서 추론한다.
3. 분류 결과는 가장 큰 logits의 인덱스 → `weights.meta['categories'][idx]` 로 라벨 변환.
4. 시각화는 numpy + matplotlib. 텐서를 그대로 imshow에 넘기지 않는다.
5. CPU 추론 속도가 강의 흐름을 깨지 않도록 입력 이미지를 256x256~512x512로 미리 resize.
6. 전이학습 강의는 4클래스 미만, 데이터 16~32장, epoch 3 이내로 끝나는 toy 스크립트로 한정한다.

## 시간 예산 (CPU)

- ResNet18 분류 한 장: <1초
- Faster R-CNN 한 장: 5~15초
- DeepLabV3 한 장: 3~8초
- Keypoint R-CNN 한 장: 5~15초

학습자가 인내할 만한 범위로 입력 크기를 제한한다.
