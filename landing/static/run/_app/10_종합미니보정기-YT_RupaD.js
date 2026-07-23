var e=`meta:\r
  id: visionBasics_10\r
  title: 종합 미니 보정기\r
  order: 10\r
  category: visionBasics\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - scikit-learn\r
  tags:\r
  - numpy\r
  - 보정\r
  - 자동화이트밸런스\r
  - 종합\r
  - 비전기초\r
  seo:\r
    title: 이미지 비전 기초 - 종합 미니 보정기\r
    description: 평균, percentile, LUT, 채널 분해를 한데 모아 자동 화이트밸런스와 노출 보정을 구현합니다.\r
    keywords:\r
    - 보정\r
    - 화이트밸런스\r
    - 자동\r
    - LUT\r
    - 종합프로젝트\r
intro:\r
  emoji: 🛠\r
  goal: 1~9강에서 배운 통계·LUT·마스크·채널 사고를 모아 자동 보정기 한 모듈을 만듭니다.\r
  description: |-\r
    이 강의는 시리즈의 마무리로, 픽셀 산술·LUT·percentile·채널 분해를 모두 사용해 동작하는 보정 함수 세 개를 만듭니다. 자동 노출 보정, 자동 화이트밸런스, 자동 콘트라스트 늘이기. 마지막에는 셋을 한 함수로 묶어 한 줄 호출로 사진을 다듬는 미니 보정기를 완성합니다.\r
  direction: 이전 강의에서 익힌 도구를 조합해 자동 노출·화이트밸런스·콘트라스트 함수를 만들고 종합 보정기로 묶습니다.\r
  benefits:\r
  - 통계 기반 자동 보정 함수 세 개를 직접 구현할 수 있습니다.\r
  - 함수 합성으로 보정 파이프라인을 표현할 수 있습니다.\r
  - Pillow/OpenCV 같은 라이브러리가 제공하는 기능의 내부 구조를 이해합니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 자동 노출\r
      detail: 평균을 목표값으로 옮깁니다.\r
    - label: 2단계. 자동 화이트밸런스\r
      detail: 채널 평균을 같게 맞춥니다(Gray World 가정).\r
    - label: 3단계. 자동 콘트라스트\r
      detail: percentile 5~95를 0~255로 늘립니다.\r
    - label: 4단계. 보정 파이프라인\r
      detail: 세 함수를 순서대로 적용합니다.\r
    - label: 5단계. 전후 비교\r
      detail: 원본과 보정 결과를 시각화로 비교합니다.\r
    runtime:\r
    - label: numpy 환경\r
      detail: numpy + matplotlib + sklearn 만으로 동작합니다.\r
    - label: 검증 흐름\r
      detail: assert와 시각 비교로 학습 결과가 기대값과 같은지 확인합니다.\r
sections:\r
- id: auto_exposure\r
  title: 1단계. 자동 노출 보정\r
  structuredPrimary: true\r
  subtitle: 평균을 목표값으로\r
  goal: "사진의 평균 밝기를 목표값(예: 128)으로 옮기는 함수를 만듭니다."\r
  why: 평균을 옮기는 단순한 보정만으로도 노출이 한참 어긋난 사진을 빠르게 살릴 수 있습니다.\r
  explanation: |-\r
    \`delta = target - img.mean()\` 만큼 모든 픽셀을 더하면 평균이 target이 됩니다. 음수가 나오거나 255를 넘어가는 픽셀이 생기므로 clip이 필수입니다.\r
\r
    delta를 그대로 곱해 사용하면 평균은 정확히 target으로 맞춰지지만, 매우 어두운 사진에서는 한 번에 너무 큰 보정이 들어가 디테일이 깨질 수 있습니다.\r
  tips:\r
  - 보정 함수는 한 줄로 정의해 두면 다음 단계의 파이프라인에 깔끔하게 들어갑니다.\r
  snippet: |-\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
    from sklearn.datasets import load_sample_image\r
\r
    china = load_sample_image('china.jpg')\r
\r
    def autoExposure(img, target=128.0):\r
        base = img.astype(np.float32)\r
        delta = target - base.mean()\r
        return (base + delta).clip(0, 255).astype(np.uint8)\r
\r
    exposed = autoExposure(china)\r
    exposed.mean()\r
  exercise:\r
    prompt: 일부러 어둡게 한 dim 이미지를 만들어 autoExposure로 되돌리고, 보정 전후 평균을 비교하세요.\r
    starterCode: |-\r
      dim = (china.astype(np.float32) - 60).clip(0, 255).astype(np.uint8)\r
      recovered = autoExposure(dim, target=___)\r
      dim.mean(), recovered.mean()\r
    hints:\r
    - target=128 정도로 보정하면 평균이 128 근처로 옵니다.\r
    - dim과 recovered의 평균이 분명히 달라야 합니다.\r
  check:\r
    noError: 함수 정의와 호출이 오류 없이 끝나야 합니다.\r
    resultCheck: recovered.mean() 이 dim.mean() 보다 커야 합니다.\r
- id: auto_wb\r
  title: 2단계. 자동 화이트밸런스\r
  structuredPrimary: true\r
  subtitle: Gray World 가정\r
  goal: 세 채널의 평균을 같게 맞춰 색 편향을 제거하는 함수를 만듭니다.\r
  why: 화이트밸런스 보정은 "전체적으로 누른" 사진이나 "푸르스름한" 사진을 즉시 자연스럽게 만듭니다.\r
  explanation: |-\r
    Gray World 가정은 "평균적으로 사진의 색은 회색이어야 한다"는 단순한 전제입니다. 채널 평균을 모두 같은 목표값으로 맞추면 전체 색 편향이 사라집니다.\r
\r
    각 채널 픽셀에 \`목표 / 채널 평균\` 을 곱하면 됩니다. 컬러풀한 단일 색 사진(예: 노을)에는 잘 안 맞지만 일반 사진에는 효과적입니다.\r
  tips:\r
  - 화이트밸런스 보정은 노출 보정 뒤에 적용하는 것이 일반적입니다. 채널별 평균이 비슷한 스케일에서 출발해야 색 보정의 의미가 명확합니다.\r
  snippet: |-\r
    def autoWhiteBalance(img):\r
        base = img.astype(np.float32)\r
        channelMean = base.mean(axis=(0, 1))\r
        target = channelMean.mean()\r
        scale = target / np.maximum(channelMean, 1.0)\r
        balanced = base * scale\r
        return balanced.clip(0, 255).astype(np.uint8)\r
\r
    balanced = autoWhiteBalance(china)\r
    balanced.mean(axis=(0, 1))\r
  exercise:\r
    prompt: china의 빨강 채널만 1.3배 곱해 누른 누런 사진을 만들고, autoWhiteBalance로 되돌려 채널 평균을 비교하세요.\r
    starterCode: |-\r
      tinted = china.astype(np.float32).copy()\r
      tinted[:, :, 0] *= ___\r
      tinted = tinted.clip(0, 255).astype(np.uint8)\r
      tintedMean = tinted.mean(axis=(0, 1))\r
      fixedMean = autoWhiteBalance(tinted).mean(axis=(0, 1))\r
      tintedMean, fixedMean\r
    hints:\r
    - 1.3을 빈칸에 넣으세요.\r
    - 보정 후 세 채널 평균이 비슷해져야 합니다.\r
  check:\r
    noError: 곱셈과 보정이 오류 없이 끝나야 합니다.\r
    resultCheck: fixedMean 세 값의 편차가 tintedMean보다 작아야 합니다.\r
- id: auto_contrast\r
  title: 3단계. 자동 콘트라스트\r
  structuredPrimary: true\r
  subtitle: percentile 5~95 늘이기\r
  goal: percentile 5~95 사이를 0~255로 늘리는 자동 콘트라스트 함수를 만듭니다.\r
  why: 보정 없이 촬영된 사진은 보통 90~180 좁은 범위에 분포해 있습니다. 양 끝을 늘려야 또렷해집니다.\r
  explanation: |-\r
    9강의 stretch 패턴을 컬러 이미지로 확장합니다. 각 채널을 독립적으로 늘리면 화이트밸런스가 무너질 수 있으므로 명도 채널(예: 평균)의 percentile을 한 번 구해 모든 채널에 동일하게 적용합니다.\r
\r
    퍼센타일 양 끝을 0과 100이 아닌 5와 95로 두는 이유는 이상치(노이즈) 픽셀에 늘이기가 좌우되지 않게 하기 위함입니다.\r
  tips:\r
  - 콘트라스트 늘이기는 평균은 살짝만 바꾸지만 표준편차를 크게 늘립니다.\r
  snippet: |-\r
    def autoContrast(img, low=5, high=95):\r
        base = img.astype(np.float32)\r
        gray = base.mean(axis=2) if base.ndim == 3 else base\r
        lo = np.percentile(gray, low)\r
        hi = np.percentile(gray, high)\r
        spread = max(hi - lo, 1.0)\r
        stretched = (base - lo) / spread * 255.0\r
        return stretched.clip(0, 255).astype(np.uint8)\r
\r
    contrasted = autoContrast(china)\r
    contrasted.std()\r
  exercise:\r
    prompt: 대비가 부족한 flat 이미지를 만들어(95~150 범위로 압축) 자동 콘트라스트로 살려 보세요.\r
    starterCode: |-\r
      flat = (china.astype(np.float32) * 0.3 + 100).clip(0, 255).astype(np.uint8)\r
      fixed = autoContrast(flat)\r
      flat.std(), fixed.std()\r
    hints:\r
    - flat은 0.3배 축소된 좁은 분포의 사진입니다.\r
    - 보정 후 표준편차가 크게 늘어야 합니다.\r
  check:\r
    noError: 함수 정의와 호출이 오류 없이 끝나야 합니다.\r
    resultCheck: fixed.std() 가 flat.std() 보다 분명히 커야 합니다.\r
- id: pipeline\r
  title: 4단계. 보정 파이프라인\r
  structuredPrimary: true\r
  subtitle: 세 함수를 한 호출로 묶기\r
  goal: 노출 → 화이트밸런스 → 콘트라스트의 순서로 적용하는 종합 보정기를 만듭니다.\r
  why: 단일 함수로 묶어 두면 일관된 보정 경로를 적용할 수 있고 차후에 단계 추가도 쉽습니다.\r
  explanation: |-\r
    함수 합성은 순서가 중요합니다. 노출을 먼저 맞춰 평균을 정상화한 뒤 색 균형, 마지막에 콘트라스트로 디테일을 살리는 순서가 안전합니다. 콘트라스트를 먼저 늘이면 보정 단계에서 양 끝이 잘려 정보가 사라집니다.\r
\r
    파이프라인을 함수로 두면 매개변수(target, percentile)를 한 군데서 조정할 수 있습니다.\r
  tips:\r
  - 함수 파이프라인은 비전 라이브러리에서 transform chain이라 부르며, 거의 모든 사진 보정 라이브러리에 같은 패턴이 있습니다.\r
  snippet: |-\r
    def autoFix(img, target=128.0, low=5, high=95):\r
        step1 = autoExposure(img, target=target)\r
        step2 = autoWhiteBalance(step1)\r
        step3 = autoContrast(step2, low=low, high=high)\r
        return step3\r
\r
    fixed = autoFix(china)\r
    fixed.mean(), fixed.std()\r
  exercise:\r
    prompt: 일부러 누렇고 어둡고 콘트라스트가 부족한 broken 사진을 만들어 autoFix로 살리고 결과 통계를 비교하세요.\r
    starterCode: |-\r
      broken = china.astype(np.float32).copy()\r
      broken[:, :, 0] *= 1.2\r
      broken = (broken * 0.35 + 90).clip(0, 255).astype(np.uint8)\r
      fixedSample = autoFix(broken)\r
      brokenStats = {"mean": float(broken.mean()), "std": float(broken.std())}\r
      fixedStats = {"mean": float(fixedSample.mean()), "std": float(fixedSample.std())}\r
      brokenStats, fixedStats\r
    hints:\r
    - 빨강 채널만 1.2배 → 누런 색 편향.\r
    - 보정 후 mean은 128 근처로, std는 broken보다 크게 나와야 합니다.\r
  check:\r
    noError: 파이프라인 호출이 오류 없이 끝나야 합니다.\r
    resultCheck: fixedStats의 std가 brokenStats의 std보다 커야 합니다.\r
- id: visualize\r
  title: 5단계. 전후 비교 시각화\r
  structuredPrimary: true\r
  subtitle: 보정 효과를 한 화면에\r
  goal: 원본과 단계별 보정 결과를 한 화면에 모아 효과를 직관적으로 비교합니다.\r
  why: 보정의 효과는 숫자보다 사진으로 보는 편이 빠릅니다.\r
  explanation: |-\r
    원본 + 노출 보정 + 화이트밸런스 + 자동 콘트라스트의 4단계를 2x2 그리드로 그립니다. 같은 axis 옵션과 같은 figure 크기로 둬야 비교가 정확합니다.\r
\r
    이 그리드를 보면 어느 단계가 어떤 변화를 만드는지 시각적으로 명확합니다. 디버깅에도 같은 패턴이 유용합니다.\r
  tips:\r
  - 비교 그리드는 사진 보정 도구의 표준 UX 패턴이기도 합니다. 후속 트랙에서 더 정교한 비교 도구를 만들 것입니다.\r
  snippet: |-\r
    panels = {\r
        "original": china,\r
        "exposure": autoExposure(china),\r
        "white balance": autoWhiteBalance(autoExposure(china)),\r
        "auto fix": autoFix(china),\r
    }\r
    fig, axes = plt.subplots(2, 2, figsize=(10, 8))\r
    for axis, (label, panel) in zip(axes.ravel(), panels.items()):\r
        axis.imshow(panel)\r
        axis.set_title(label)\r
        axis.axis('off')\r
    fig\r
  exercise:\r
    prompt: 같은 4단계 그리드를 flower 사진으로도 그리세요.\r
    starterCode: |-\r
      flower = load_sample_image('flower.jpg')\r
      flowerPanels = {\r
          "original": flower,\r
          "exposure": autoExposure(flower),\r
          "white balance": autoWhiteBalance(autoExposure(flower)),\r
          "auto fix": autoFix(flower),\r
      }\r
      fig2, axes2 = plt.subplots(2, 2, figsize=(10, 8))\r
      for axis, (label, panel) in zip(axes2.ravel(), flowerPanels.items()):\r
          axis.imshow(panel)\r
          axis.set_title(label)\r
          axis.axis('off')\r
      fig2\r
    hints:\r
    - 같은 함수들을 새 이미지에 그대로 호출하면 됩니다.\r
    - 사진마다 각 단계의 효과가 다르게 보입니다.\r
  check:\r
    noError: 그리드 출력이 오류 없이 끝나야 합니다.\r
    resultCheck: 4개의 패널이 모두 다른 이미지로 출력되어야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 보정기 확장\r
  goal: 학습한 보정기를 한 단계 확장해 LUT 한 단계를 추가합니다.\r
  why: 자기 손으로 추가 단계를 더해 봐야 파이프라인이라는 추상이 정말 동작한다는 사실을 체감합니다.\r
  explanation: |-\r
    각 미션은 import문부터 시작하지만, 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  tips:\r
  - LUT 적용은 7강에서 본 한 줄 패턴이면 충분합니다. 자동 콘트라스트와 다른 점은 곡선 모양의 변환을 자유롭게 만들 수 있다는 것입니다.\r
  snippet: |-\r
    def buildGammaLut(gammaValue):\r
        norm = np.arange(256, dtype=np.float32) / 255.0\r
        return (255.0 * np.power(norm, gammaValue)).clip(0, 255).astype(np.uint8)\r
\r
    softLut = buildGammaLut(0.85)\r
    softFix = softLut[autoFix(china)]\r
    softFix.mean()\r
  exercise:\r
    prompt: "미션1: autoFix 뒤에 gamma 0.7 LUT을 적용하는 autoFixSoft 함수를 만들어 china와 flower에 적용한 결과를 1x2 그리드로 그리세요. 미션2: autoFix를 호출하기 전후 통계(mean, std, 채널별 mean)를 비교하는 진단 함수 fixReport(img) 를 만들어 china에 적용한 결과를 출력하세요."\r
    starterCode: |-\r
      def autoFixSoft(img):\r
          base = autoFix(img)\r
          return buildGammaLut(___)[base]\r
\r
      softChina = autoFixSoft(china)\r
      softFlower = autoFixSoft(load_sample_image('flower.jpg'))\r
      fig, axes = plt.subplots(1, 2, figsize=(10, 4))\r
      axes[0].imshow(softChina)\r
      axes[0].set_title('china soft fix')\r
      axes[1].imshow(softFlower)\r
      axes[1].set_title('flower soft fix')\r
      for axis in axes:\r
          axis.axis('off')\r
      fig\r
    hints:\r
    - gamma 0.7 LUT은 어두운 영역을 살짝 밝게 합니다.\r
    - fixReport는 dict를 반환하면 비교가 편합니다.\r
  check:\r
    noError: 함수 정의와 호출이 오류 없이 끝나야 합니다.\r
    resultCheck: softChina.dtype 이 uint8여야 합니다.\r
`;export{e as default};