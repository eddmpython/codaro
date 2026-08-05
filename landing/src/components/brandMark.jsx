import { brand } from "../lib/brand.js";
import brandMark from "../lib/generated/brandMark.json";
import { appPath } from "../lib/publicRouting.js";

const AVATAR_URL = {
  "avatar-small": () => brand.avatarSmallUrl,
  "avatar-face": () => brand.avatarFaceUrl,
  "avatar-full": () => brand.avatarHeroUrl,
};

/** brandMark.json의 avatarAsset 키를 실제 자산 URL로 푼다(홈 히어로도 이 해석기를 쓴다). */
export function brandAvatarUrl(assetKey, fallbackKey = "avatar-small") {
  return (AVATAR_URL[assetKey] || AVATAR_URL[fallbackKey] || AVATAR_URL["avatar-small"])();
}

export function BrandMark({
  href = appPath("/"),
  className = "publicBrand",
  variant = "chrome",
  onClick,
  ariaLabel = `${brandMark.wordmark} 홈`,
}) {
  const spec = brandMark[variant] || brandMark.chrome;
  const avatarUrl = brandAvatarUrl(spec.avatarAsset);
  const size = Number(spec.avatarPx) || 40;
  const gap = Number(spec.gapPx) || 5;

  return (
    <a
      className={className}
      href={href}
      onClick={onClick}
      aria-label={ariaLabel}
      data-brand-mark={variant}
      style={{
        "--brand-mark-avatar-px": `${size}px`,
        "--brand-mark-gap-px": `${gap}px`,
      }}
    >
      <img src={avatarUrl} alt="" width={size} height={size} />
      <span>{brandMark.wordmark}</span>
    </a>
  );
}
