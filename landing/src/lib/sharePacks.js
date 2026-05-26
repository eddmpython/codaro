import { brand } from "./brand.js";

export const sharePacks = [
  {
    id: "codaro.python-starter",
    version: "0.1.0",
    title: "Python 첫 실행 공유 팩",
    description: "Codaro 공유 팩 설치와 실행 흐름을 확인하는 공식 예제입니다.",
    author: "Codaro",
    license: "MIT",
    tags: ["starter", "official"],
    contents: {
      curricula: 1,
      automations: 1,
    },
    manifestUrl: brand.toSiteUrl("/share-packs/codaro-python-starter/codaroPack.yaml"),
    packRootUrl: brand.toSiteUrl("/share-packs/codaro-python-starter/"),
  },
];
