from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[3]
DESIGN_ROOT = PROJECT_ROOT / "assets" / "brand" / "designSystem"
TOKEN_PATH = DESIGN_ROOT / "tokens.json"
SCHEMA_PATH = DESIGN_ROOT / "tokens.schema.json"
FONT_MANIFEST_PATH = DESIGN_ROOT / "fontManifest.json"
SOCIAL_LINKS_PATH = DESIGN_ROOT / "socialLinks.json"
FONT_SOURCE_ROOT = DESIGN_ROOT / "fonts"
LANDING_ROOT = PROJECT_ROOT / "landing"
EDITOR_ROOT = PROJECT_ROOT / "editor"
GENERATED_RELATIVE_PATHS = (
    "codaroTheme.css",
    "codaro.js",
    "codaro.d.ts",
    "codaroTheme.ts",
    "fonts.css",
    "provenance.json",
    "socialLinks.tsx",
)
APP_TARGETS = {
    "landing": LANDING_ROOT / "src" / "styles" / "generated",
    "editor": EDITOR_ROOT / "src" / "styles" / "generated",
}
FONT_TARGETS = {
    "landing": LANDING_ROOT / "static" / "fonts",
    "editor": EDITOR_ROOT / "public" / "fonts",
}


class DesignSystemError(RuntimeError):
    pass


def loadJson(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise DesignSystemError(f"{path} must contain a JSON object")
    return value


def canonicalJson(value: Any) -> str:
    return json.dumps(value, ensure_ascii=True, sort_keys=True, separators=(",", ":"))


def calculateHash(value: bytes | str) -> str:
    payload = value.encode("utf-8") if isinstance(value, str) else value
    return hashlib.sha256(payload).hexdigest()


def parsePixelValue(value: str) -> float:
    match = re.fullmatch(r"([0-9]+(?:\.[0-9]+)?)px", value)
    if match is None:
        raise DesignSystemError(f"length token must use px: {value}")
    return float(match.group(1))


# 페이지 기하와 배경 격자의 SSOT. 랜딩과 에디터가 같은 칸 위에 서야 하므로
# 숫자를 한쪽 CSS 에 적어 두지 않고 여기서 토큰으로 내보낸다.
LAYOUT_KEYS = (
    "frameMax",
    "frameGutter",
    "frameInset",
    "frameMaxNarrow",
    "frameGutterNarrow",
    "frameInsetNarrow",
    "narrowBreakpoint",
    "chromeHeight",
    "chromeHeightNarrow",
)
BACKDROP_KEYS = ("gridCell", "gridOpacity")


def validateLayoutDocument(layout: Any, backdrop: Any) -> None:
    if not isinstance(layout, dict) or set(layout) != set(LAYOUT_KEYS):
        raise DesignSystemError(f"layout must define exactly: {', '.join(LAYOUT_KEYS)}")
    for key in LAYOUT_KEYS:
        parsePixelValue(layout[key])
    if not isinstance(backdrop, dict) or set(backdrop) != set(BACKDROP_KEYS):
        raise DesignSystemError(f"backdrop must define exactly: {', '.join(BACKDROP_KEYS)}")
    parsePixelValue(backdrop["gridCell"])
    opacity = float(backdrop["gridOpacity"])
    if not 0 < opacity <= 1:
        raise DesignSystemError("backdrop gridOpacity must be between 0 and 1")


def validateTokenDocument(document: dict[str, Any]) -> None:
    requiredKeys = {
        "version",
        "astryx",
        "semanticRoles",
        "astryxTokens",
        "typography",
        "motion",
        "radius",
        "syntax",
        "density",
        "accents",
        "layout",
        "backdrop",
    }
    missingKeys = sorted(requiredKeys - document.keys())
    if missingKeys:
        raise DesignSystemError(f"token document is missing: {', '.join(missingKeys)}")
    validateLayoutDocument(document["layout"], document["backdrop"])
    if document["version"] != 1:
        raise DesignSystemError("token document version must be 1")

    expectedVersions = {
        "core": "0.1.6",
        "themeNeutral": "0.1.6",
        "cli": "0.1.6",
        "stylex": "0.19.0",
        "themeName": "codaro",
    }
    if document["astryx"] != expectedVersions:
        raise DesignSystemError("Astryx package contract does not match the approved pins")

    tokens = document["astryxTokens"]
    if not isinstance(tokens, dict) or len(tokens) < 30:
        raise DesignSystemError("astryxTokens must contain at least 30 tokens")
    for tokenName, tokenValue in tokens.items():
        if re.fullmatch(r"--[a-z0-9-]+", tokenName) is None:
            raise DesignSystemError(f"invalid Astryx token name: {tokenName}")
        if isinstance(tokenValue, list):
            if len(tokenValue) != 2 or not all(isinstance(item, str) for item in tokenValue):
                raise DesignSystemError(f"mode token must be [light, dark]: {tokenName}")
        elif not isinstance(tokenValue, str):
            raise DesignSystemError(f"token value must be a string or mode pair: {tokenName}")

    expectedSemanticRoles = {
        "canvas": "--color-background-body",
        "surface": "--color-background-surface",
        "elevated": "--color-background-card",
        "popover": "--color-background-popover",
        "mutedSurface": "--color-background-muted",
        "accentSurface": "--color-background-accent-subtle",
        "inverseSurface": "--color-background-inverse",
        "textPrimary": "--color-text-primary",
        "textSecondary": "--color-text-secondary",
        "textTertiary": "--color-text-tertiary",
        "textInverse": "--color-text-inverse",
        "textOnAccent": "--color-text-on-accent",
        "border": "--color-border",
        "borderSubtle": "--color-border-subtle",
        "borderStrong": "--color-border-emphasized",
        "borderAccent": "--color-border-accent",
        "focus": "--color-accent",
        "brand": "--color-accent",
        "success": "--color-success",
        "warning": "--color-warning",
        "danger": "--color-error",
        "info": "--color-text-blue",
        "code": "--color-background-muted",
    }
    if document["semanticRoles"] != expectedSemanticRoles:
        raise DesignSystemError("semanticRoles must match the shared product contract")
    for role, tokenName in document["semanticRoles"].items():
        if tokenName not in tokens:
            raise DesignSystemError(f"semantic role {role} references an unknown token")

    modeAwareTokens = (
        "--color-background-body",
        "--color-background-surface",
        "--color-text-primary",
        "--color-accent",
        "--color-success",
    )
    for tokenName in modeAwareTokens:
        value = tokens.get(tokenName)
        if not isinstance(value, list) or len(value) != 2:
            raise DesignSystemError(f"{tokenName} must define matching light and dark values")

    expectedFontWeights = {
        "--font-weight-normal": "400",
        "--font-weight-medium": "600",
        "--font-weight-semibold": "600",
        "--font-weight-bold": "700",
    }
    for tokenName, expectedValue in expectedFontWeights.items():
        if tokens.get(tokenName) != expectedValue:
            raise DesignSystemError(f"{tokenName} must resolve to {expectedValue}")

    radiusTokens = [
        "--radius-none",
        "--radius-inner",
        "--radius-element",
        "--radius-container",
        "--radius-page",
    ]
    for tokenName in radiusTokens:
        if parsePixelValue(tokens[tokenName]) > 8:
            raise DesignSystemError(f"{tokenName} exceeds the 8px product radius ceiling")

    if set(document["density"]) != {"public", "learningComfortable", "studioDense"}:
        raise DesignSystemError("density must define the three approved surface modes")
    if set(document["accents"]) != {"plum", "blue", "teal"}:
        raise DesignSystemError("accent palette must be exactly plum, blue, and teal")


def validateFontManifest(document: dict[str, Any]) -> None:
    fonts = document.get("fonts")
    if document.get("version") != 1 or not isinstance(fonts, list) or len(fonts) != 6:
        raise DesignSystemError("font manifest must define the six approved font files")
    expectedNames = {font["file"] for font in fonts}
    actualNames = {path.name for path in FONT_SOURCE_ROOT.glob("*.woff2")}
    if actualNames != expectedNames:
        raise DesignSystemError("font source directory must exactly match the manifest")
    if {font["weight"] for font in fonts} != {400, 600, 700}:
        raise DesignSystemError("font manifest may use only the actual 400, 600, and 700 weights")
    for font in fonts:
        sourcePath = FONT_SOURCE_ROOT / font["file"]
        if not sourcePath.is_file():
            raise DesignSystemError(f"font source is missing: {sourcePath}")
        actualHash = calculateHash(sourcePath.read_bytes())
        if actualHash != font["sha256"]:
            raise DesignSystemError(f"font hash mismatch: {font['file']}")
        if font["license"] != "OFL-1.1" or not font["licenseSource"].startswith("https://"):
            raise DesignSystemError(f"font license provenance is incomplete: {font['file']}")


def validateSocialLinks(document: dict[str, Any]) -> None:
    links = document.get("links")
    supportCenter = document.get("supportCenter")
    if document.get("version") != 2 or not isinstance(links, list):
        raise DesignSystemError("social link registry must use version 2 and define links")
    expectedIds = ["github", "support", "youtube", "threads", "email"]
    actualIds = [link.get("id") for link in links if isinstance(link, dict)]
    if actualIds != expectedIds:
        raise DesignSystemError("social links must keep the approved shared order")
    for link in links:
        requiredKeys = (
            {"id", "label", "action", "viewBox", "path"}
            if isinstance(link, dict) and link.get("id") == "support"
            else {"id", "label", "href", "viewBox", "path"}
        )
        if not isinstance(link, dict) or set(link) != requiredKeys:
            raise DesignSystemError(f"social link fields are invalid: {link}")
        if not all(isinstance(link[key], str) and link[key].strip() for key in requiredKeys):
            raise DesignSystemError(f"social link fields must be non-empty strings: {link.get('id')}")
        href = link.get("href")
        if isinstance(href, str):
            if link.get("id") == "email":
                if not href.startswith("mailto:") or "@" not in href.removeprefix("mailto:"):
                    raise DesignSystemError(f"email social link must use mailto address: {link['id']}")
            elif not href.startswith("https://"):
                raise DesignSystemError(f"social link must use HTTPS: {link['id']}")
        if link.get("id") == "support" and link.get("action") != "supportDialog":
            raise DesignSystemError("support social link must open the shared support dialog")
        if link["viewBox"] != "0 0 24 24":
            raise DesignSystemError(f"social icon must use the shared 24px viewBox: {link['id']}")
    requiredSupportKeys = {
        "dialogLabel",
        "title",
        "intro",
        "waysLabel",
        "threadsLabel",
        "threadsHref",
        "discussionsLabel",
        "discussionsHref",
        "issuesLabel",
        "issuesHref",
        "coffeeHref",
        "sponsorsHref",
        "account",
        "note",
    }
    if not isinstance(supportCenter, dict) or set(supportCenter) != requiredSupportKeys:
        raise DesignSystemError("support center must define the approved shared structure")
    for key in requiredSupportKeys - {"account"}:
        value = supportCenter[key]
        if not isinstance(value, str) or not value.strip():
            raise DesignSystemError(f"support center field must be a non-empty string: {key}")
        if key.endswith("Href") and not value.startswith("https://"):
            raise DesignSystemError(f"support center URL must use HTTPS: {key}")
    account = supportCenter["account"]
    if not isinstance(account, dict) or set(account) != {"bank", "number", "holder"}:
        raise DesignSystemError("support account must define bank, number, and holder")
    if not all(isinstance(value, str) and value.strip() for value in account.values()):
        raise DesignSystemError("support account fields must be non-empty strings")


def renderThemeSource(document: dict[str, Any]) -> str:
    tokensJson = json.dumps(document["astryxTokens"], ensure_ascii=True, indent=2)
    typographyJson = json.dumps(document["typography"], ensure_ascii=True, indent=2)
    motionJson = json.dumps(document["motion"], ensure_ascii=True, indent=2)
    radiusJson = json.dumps(document["radius"], ensure_ascii=True, indent=2)
    syntaxJson = json.dumps(document["syntax"], ensure_ascii=True, indent=2)
    return f'''import {{defineSyntaxTheme, defineTheme}} from "@astryxdesign/core/theme";
import {{neutralIconRegistry, neutralTheme}} from "@astryxdesign/theme-neutral/built";

const syntaxInput = {syntaxJson};
const codaroSyntax = defineSyntaxTheme(syntaxInput);

export const codaroTheme = defineTheme({{
  name: "codaro",
  extends: neutralTheme,
  typography: {typographyJson},
  motion: {motionJson},
  radius: {radiusJson},
  syntax: codaroSyntax,
  tokens: {tokensJson},
  components: {{
    button: {{
      base: {{fontWeight: "var(--font-weight-semibold)"}},
    }},
    card: {{
      base: {{borderColor: "var(--color-border)", borderWidth: "1px"}},
    }},
  }},
  icons: neutralIconRegistry,
}});
'''


def normalizeCliOutput(content: str, sourceHash: str) -> str:
    normalized = content.replace("\u2014", "-")
    normalized = re.sub(
        r"^ \* Source:.*$",
        " * Source: assets/brand/designSystem/tokens.json",
        normalized,
        flags=re.MULTILINE,
    )
    normalized = re.sub(
        r"^ \* Command:.*$",
        " * Command: uv run python -X utf8 assets/brand/tools/buildDesignSystem.py",
        normalized,
        flags=re.MULTILINE,
    )
    normalized = re.sub(
        r"^ \* Generated:.*$",
        f" * Source SHA-256: {sourceHash}",
        normalized,
        flags=re.MULTILINE,
    )
    return normalized.replace("\r\n", "\n")


def lightDark(pair: list[str]) -> str:
    return f"light-dark({pair[0]}, {pair[1]})"


def renderRuntimeCss(document: dict[str, Any]) -> str:
    lines = [
        "",
        "@layer astryx-theme {",
        '  html[data-theme="light"] #root > [data-astryx-theme="codaro"] {',
        "    color-scheme: light;",
        "  }",
        '  html[data-theme="dark"] #root > [data-astryx-theme="codaro"] {',
        "    color-scheme: dark;",
        "  }",
        '  @scope ([data-astryx-theme="codaro"]) to ([data-astryx-theme]) {',
    ]
    for densityName, overrides in document["density"].items():
        lines.append(f'    :scope[data-density="{densityName}"],')
        lines.append(f'    [data-density="{densityName}"] {{')
        for tokenName, value in overrides.items():
            lines.append(f"      {tokenName}: {value};")
        lines.append("    }")
    for accentName, accent in document["accents"].items():
        lines.append(f'    :scope[data-accent="{accentName}"],')
        lines.append(f'    [data-accent="{accentName}"] {{')
        lines.append(f"      --color-accent: {lightDark(accent['accent'])};")
        lines.append(f"      --color-text-accent: {lightDark(accent['accent'])};")
        lines.append(f"      --color-icon-accent: {lightDark(accent['accent'])};")
        lines.append(f"      --color-accent-muted: {lightDark(accent['muted'])};")
        lines.append(f"      --color-on-accent: {lightDark(accent['onAccent'])};")
        lines.append("    }")
    lines.extend(
        [
            "    @media (prefers-reduced-motion: reduce) {",
            "      :scope {",
            "        --duration-fast: 1ms;",
            "        --duration-medium: 1ms;",
            "        --duration-slow: 1ms;",
            "      }",
            "    }",
            "  }",
            "}",
        ]
    )
    lines.append(renderLayoutCss(document))
    return "\n".join(lines) + "\n"


def renderLayoutCss(document: dict[str, Any]) -> str:
    """페이지 기하와 배경 격자를 CSS 변수로 내보낸다.

    좁은 화면 전환을 여기서 한 번만 정의한다. 각 앱이 자기 CSS 에서 브레이크포인트를
    다시 적으면 헤더와 본문이 서로 다른 폭에서 꺾여 격자가 어긋난다.
    :root 에 두는 이유는 fixed/sticky 요소가 astryx scope 밖에 있을 수 있어서다.
    """
    layout = document["layout"]
    backdrop = document["backdrop"]
    return "\n".join(
        [
            "",
            "@layer astryx-theme {",
            "  :root {",
            f"    --frame-max: {layout['frameMax']};",
            f"    --frame-gutter: {layout['frameGutter']};",
            "    --frame-width: min(var(--frame-max), calc(100% - var(--frame-gutter)));",
            f"    --frame-inset: {layout['frameInset']};",
            f"    --chrome-height: {layout['chromeHeight']};",
            f"    --backdrop-grid-cell: {backdrop['gridCell']};",
            f"    --backdrop-grid-opacity: {backdrop['gridOpacity']};",
            "  }",
            "",
            f"  @media (max-width: {layout['narrowBreakpoint']}) {{",
            "    :root {",
            f"      --frame-max: {layout['frameMaxNarrow']};",
            f"      --frame-gutter: {layout['frameGutterNarrow']};",
            f"      --frame-inset: {layout['frameInsetNarrow']};",
            f"      --chrome-height: {layout['chromeHeightNarrow']};",
            "    }",
            "  }",
            "}",
        ]
    )


def renderAppBridge(appName: str) -> str:
    if appName == "landing":
        aliases = {
            "--background": "var(--color-background-body)",
            "--background-2": "var(--color-background-muted)",
            "--card": "var(--color-background-card)",
            "--foreground": "var(--color-text-primary)",
            "--muted": "var(--color-background-muted)",
            "--muted-foreground": "var(--color-text-secondary)",
            "--border": "var(--color-border)",
            "--border-strong": "var(--color-border-emphasized)",
            "--primary": "var(--color-accent)",
            "--primary-foreground": "var(--color-on-accent)",
            "--code": "var(--color-background-muted)",
            "--code-fg": "var(--color-text-primary)",
            "--good": "var(--color-success)",
            "--warning": "var(--color-warning)",
            "--radius-sm": "var(--radius-inner)",
            "--radius-lg": "var(--radius-container)",
            "--radius": "var(--radius-element)",
            "--radius-pill": "var(--radius-full)",
            "--font-sans": "var(--font-family-body)",
            "--font-display": "var(--font-family-heading)",
            "--font-mono": "var(--font-family-code)",
        }
    else:
        aliases = {
            "--background": "var(--color-background-body)",
            "--foreground": "var(--color-text-primary)",
            "--card": "var(--color-background-card)",
            "--card-foreground": "var(--color-text-primary)",
            "--popover": "var(--color-background-popover)",
            "--popover-foreground": "var(--color-text-primary)",
            "--primary": "var(--color-accent)",
            "--primary-foreground": "var(--color-on-accent)",
            "--secondary": "var(--color-background-muted)",
            "--secondary-foreground": "var(--color-text-primary)",
            "--muted": "var(--color-background-muted)",
            "--muted-foreground": "var(--color-text-secondary)",
            "--accent": "var(--color-accent-muted)",
            "--accent-foreground": "var(--color-text-primary)",
            "--destructive": "var(--color-error)",
            "--border": "var(--color-border)",
            "--input": "var(--color-border-emphasized)",
            "--ring": "var(--color-accent)",
            "--code": "var(--color-background-muted)",
            "--code-foreground": "var(--color-text-primary)",
            "--success": "var(--color-success)",
            "--success-foreground": "var(--color-on-success)",
            "--warning": "var(--color-warning)",
            "--warning-foreground": "var(--color-on-warning)",
            # info 는 semanticRoles 에 이미 있던 역할인데 shadcn 별칭만 빠져 있었다.
            # 그래서 대기·안내 상태가 Tailwind 고정 팔레트(sky-500)로 새고 있었다.
            "--info": "var(--color-text-blue)",
            "--accent-brand": "var(--color-accent)",
            "--accent-brand-foreground": "var(--color-on-accent)",
            "--chart-1": "var(--color-text-blue)",
            "--chart-2": "var(--color-success)",
            "--chart-3": "var(--color-text-orange)",
            "--chart-4": "var(--color-text-purple)",
            "--chart-5": "var(--color-error)",
            # 사이드바는 본문과 같은 바탕을 쓴다. 경계선 없이 한 화면으로 이어 붙인다.
            "--sidebar": "var(--color-background-body)",
            "--sidebar-foreground": "var(--color-text-primary)",
            "--sidebar-primary": "var(--color-accent)",
            "--sidebar-primary-foreground": "var(--color-on-accent)",
            "--sidebar-accent": "var(--color-background-muted)",
            "--sidebar-accent-foreground": "var(--color-text-primary)",
            "--sidebar-border": "var(--color-border)",
            "--sidebar-ring": "var(--color-accent)",
            "--radius": "var(--radius-element)",
        }
    lines = ["", "@layer utilities {", '  :where([data-astryx-theme="codaro"]) {']
    lines.extend(f"    {name}: {value};" for name, value in aliases.items())
    lines.extend(["  }", "}"])
    return "\n".join(lines) + "\n"


def renderRuntimeTypes(sourceHash: str, document: dict[str, Any]) -> str:
    accentSwatches = {
        name: values["accent"][0]
        for name, values in document["accents"].items()
    }
    accentSwatchesJson = json.dumps(accentSwatches, ensure_ascii=True, separators=(",", ":"))
    tokens = document["astryxTokens"]
    themeCanvasColorsJson = json.dumps(
        dict(zip(("light", "dark"), tokens["--color-background-body"], strict=True)),
        ensure_ascii=True,
        separators=(",", ":"),
    )
    themeSurfaceColorsJson = json.dumps(
        dict(zip(("light", "dark"), tokens["--color-background-surface"], strict=True)),
        ensure_ascii=True,
        separators=(",", ":"),
    )
    themeInkColorsJson = json.dumps(
        dict(zip(("light", "dark"), tokens["--color-text-primary"], strict=True)),
        ensure_ascii=True,
        separators=(",", ":"),
    )
    return f'''// @generated by buildDesignSystem.py. Do not edit.
export {{codaroTheme}} from "./codaro.js";

export const designSystemSourceHash = "{sourceHash}" as const;
export const accentSwatches = {accentSwatchesJson} as const;
export const themeCanvasColors = {themeCanvasColorsJson} as const;
export const themeSurfaceColors = {themeSurfaceColorsJson} as const;
export const themeInkColors = {themeInkColorsJson} as const;
export type CodaroThemeMode = "system" | "light" | "dark";
export type ResolvedThemeMode = "light" | "dark";
export type DensityMode = "public" | "learningComfortable" | "studioDense";
export type AccentId = "plum" | "blue" | "teal";
export type DesignSurface =
  | "landing"
  | "docs"
  | "blog"
  | "curriculum"
  | "lesson"
  | "notebook"
  | "automation"
  | "chat";

export interface DesignRuntimeState {{
  themeMode: CodaroThemeMode;
  resolvedTheme: ResolvedThemeMode;
  densityMode: DensityMode;
  accentId: AccentId;
  reducedMotion: boolean;
}}

export function resolveDensity(surface: DesignSurface): DensityMode {{
  if (surface === "curriculum" || surface === "lesson") return "learningComfortable";
  if (surface === "notebook" || surface === "automation" || surface === "chat") return "studioDense";
  return "public";
}}

export function normalizeAccentId(value: string | null | undefined): AccentId {{
  if (value === "blue" || value === "teal") return value;
  return "plum";
}}
'''


def renderSocialLinks(document: dict[str, Any]) -> str:
    sourceHash = calculateHash(canonicalJson(document))
    linksJson = json.dumps(document["links"], ensure_ascii=False, indent=2)
    supportCenterJson = json.dumps(document["supportCenter"], ensure_ascii=False, indent=2)
    template = '''// @generated by buildDesignSystem.py. Do not edit.
import {useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {IconButton} from "@astryxdesign/core/IconButton";

export const socialLinksSourceHash = "__SOURCE_HASH__" as const;
export const socialLinks = __LINKS_JSON__ as const;
export const supportCenter = __SUPPORT_CENTER_JSON__ as const;
export type SocialLink = (typeof socialLinks)[number];
export type SocialLinkId = SocialLink["id"];

export function SocialLinks({
  className = "",
  label = "Codaro SNS 및 외부 링크",
}: {
  className?: string;
  label?: string;
}) {
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <>
      <nav
        aria-label={label}
        className={className}
        data-social-links="codaro"
        data-social-links-source="design-system"
      >
        {socialLinks.map((link) =>
          link.id === "support" ? (
            <IconButton
              className="codaroSocialLink codaroSocialLinkSupport"
              data-social-link="codaro"
              data-social-link-id={link.id}
              icon={<SocialIcon link={link} />}
              key={link.id}
              label={link.label}
              onClick={() => setSupportOpen(true)}
              size="sm"
              variant="ghost"
            />
          ) : (
            <IconButton
              className="codaroSocialLink"
              data-social-link="codaro"
              data-social-link-id={link.id}
              href={link.href}
              icon={<SocialIcon link={link} />}
              key={link.id}
              label={link.label}
              size="sm"
              variant="ghost"
              {...(link.href.startsWith("mailto:")
                ? {}
                : {rel: "noopener noreferrer", target: "_blank"})}
            />
          ),
        )}
      </nav>
      <SupportDialog open={supportOpen} onClose={() => setSupportOpen(false)} />
    </>
  );
}

function SupportDialog({open, onClose}: {open: boolean; onClose: () => void}) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      const focusable = dialog
        ? Array.from(
            dialog.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          ).filter((element) => element.getClientRects().length > 0)
        : [];
      if (focusable.length === 0) {
        event.preventDefault();
        closeButtonRef.current?.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !dialog?.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !dialog?.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") return null;

  async function copyAccount() {
    await writeClipboardText(supportCenter.account.number);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return createPortal(
    <div
      aria-label={supportCenter.dialogLabel}
      aria-modal="true"
      className="codaroSupportBackdrop"
      data-support-dialog="codaro"
      onMouseDown={onClose}
      role="dialog"
    >
      <section
        className="codaroSupportDialog"
        onMouseDown={(event) => event.stopPropagation()}
        ref={dialogRef}
      >
        <header className="codaroSupportHeader">
          <h2>{supportCenter.title}</h2>
          <button
            aria-label="닫기"
            className="codaroSupportClose"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
              <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
            </svg>
          </button>
        </header>

        <div className="codaroSupportBody">
          <div className="codaroSupportHero">
            <div className="codaroSupportHeart" aria-hidden="true">
              <svg fill="none" viewBox="0 0 24 24">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </svg>
            </div>
            <p>{supportCenter.intro}</p>
          </div>

          <div className="codaroSupportSection">
            <h3>{supportCenter.waysLabel}</h3>
            <div className="codaroSupportWays">
              <SupportLink href={supportCenter.threadsHref} label={supportCenter.threadsLabel} />
              <SupportLink href={supportCenter.discussionsHref} label={supportCenter.discussionsLabel} />
              <SupportLink href={supportCenter.issuesHref} label={supportCenter.issuesLabel} />
            </div>
          </div>

          <div className="codaroSupportRows">
            <SupportRow href={supportCenter.coffeeHref} kind="coffee" label="Buy Me a Coffee" />
            <SupportRow href={supportCenter.sponsorsHref} kind="heart" label="GitHub Sponsors" />
            <div className="codaroSupportRow codaroSupportAccount">
              <div className="codaroSupportAccountIdentity">
                <SupportGlyph kind="account" />
                <strong>{supportCenter.account.bank}</strong>
                <span data-support-account-number="codaro">{supportCenter.account.number}</span>
                <span className="codaroSupportAccountHolder">{supportCenter.account.holder}</span>
              </div>
              <button
                aria-label={`계좌번호 ${supportCenter.account.number} 복사`}
                data-support-account-copy="codaro"
                onClick={() => void copyAccount()}
                type="button"
              >
                <SupportGlyph kind={copied ? "check" : "copy"} />
                <span>{copied ? "복사됨" : "복사"}</span>
              </button>
            </div>
          </div>

          <p className="codaroSupportNote">{supportCenter.note}</p>
        </div>
      </section>
    </div>,
    document.body,
  );
}

function SupportLink({href, label}: {href: string; label: string}) {
  return (
    <a href={href} rel="noopener noreferrer" target="_blank">
      <span>{label}</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}

function SupportRow({
  href,
  kind,
  label,
}: {
  href: string;
  kind: "coffee" | "heart";
  label: string;
}) {
  return (
    <a className="codaroSupportRow" href={href} rel="noopener noreferrer" target="_blank">
      <SupportGlyph kind={kind} />
      <strong>{label}</strong>
      <span aria-hidden="true">↗</span>
    </a>
  );
}

function SupportGlyph({kind}: {kind: "account" | "check" | "coffee" | "copy" | "heart"}) {
  const paths = {
    account: "M3 10h18M5 10v8m4-8v8m6-8v8m4-8v8M3 21h18M12 3 3 7h18l-9-4Z",
    check: "m5 12 4 4L19 6",
    coffee: "M10 2v2m4-2v2M4 8h13v5a6 6 0 0 1-6 6H9a5 5 0 0 1-5-5V8Zm13 2h1a3 3 0 0 1 0 6h-2",
    copy: "M9 9h10v10H9zM5 15H4V5h10v1",
    heart: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
  } as const;
  return (
    <svg aria-hidden="true" className={`codaroSupportGlyph codaroSupportGlyph-${kind}`} fill="none" viewBox="0 0 24 24">
      <path d={paths[kind]} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  );
}

function SocialIcon({link}: {link: SocialLink}) {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      fillOpacity={link.id === "support" ? 0.24 : 1}
      role="img"
      viewBox={link.viewBox}
    >
      <path
        d={link.path}
        fill="currentColor"
        stroke={link.id === "support" ? "currentColor" : "none"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={link.id === "support" ? "1.7" : undefined}
      />
    </svg>
  );
}

async function writeClipboardText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "true");
  input.style.position = "fixed";
  input.style.left = "-9999px";
  document.body.appendChild(input);
  input.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(input);
  }
}
'''
    return (
        template.replace("__SOURCE_HASH__", sourceHash)
        .replace("__LINKS_JSON__", linksJson)
        .replace("__SUPPORT_CENTER_JSON__", supportCenterJson)
    )


def renderSharedComponentCss() -> str:
    return '''

@layer components {
  /* ── 페이지 격자 프리미티브 ────────────────────────────────────────────────
     두 앱이 같은 칸 위에 서게 하는 최소 어휘다. 여기 있는 것만 공유하고,
     화면 하나에서만 쓰는 모양은 각 앱 CSS 에 둔다. */

  /* 본문 칸. 헤더, 홈, 문서, 푸터가 모두 이걸 써야 좌우 세로선이 한 줄로 선다. */
  .codaroFrame {
    width: var(--frame-width);
    margin-inline: auto;
    padding-inline: var(--frame-inset);
  }

  /* 층의 좌우 세로선. 칸 밖에 그려야 본문 여백까지 감싼다. 가로선이 필요한
     층은 data-frame-top 을 붙인다(첫 층은 붙이지 않는다). */
  .codaroFrameRule {
    position: absolute;
    z-index: 0;
    inset-block: 0;
    left: 50%;
    width: var(--frame-width);
    transform: translateX(-50%);
    border-inline: 1px solid var(--color-border);
    pointer-events: none;
  }

  .codaroFrameRule[data-frame-top="true"] {
    border-top: 1px solid var(--color-border);
  }

  /* 배경 모눈. 촘촘하고 흐려야 배경이 시끄럽지 않다. 성기게 잡고 진하게 칠하면
     격자가 아니라 줄무늬가 된다. */
  .codaroBackdropGrid {
    position: fixed;
    inset: 0;
    z-index: 0;
    background-image:
      linear-gradient(var(--color-border) 1px, transparent 1px),
      linear-gradient(90deg, var(--color-border) 1px, transparent 1px);
    background-size: var(--backdrop-grid-cell) var(--backdrop-grid-cell);
    opacity: var(--backdrop-grid-opacity);
    pointer-events: none;
  }

  /* 마이크로 라벨. 앞에 짧은 가로선을 달아 섹션 시작을 알린다. 자간은 주지
     않는다. 라벨에 한글이 섞이는데 트래킹을 주면 음절이 흩어져 읽기가 나빠진다. */
  .codaroLabel {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--color-text-accent);
    font-family: var(--font-family-code);
    /* 라벨 크기는 본문 타이포 스케일을 따르지 않는 고정 마이크로 값이다.
       랜딩 전용 스텝(--type-xs)을 참조하면 에디터에서는 정의가 없어 폴백으로만
       살아나므로, 공유 프리미티브는 자기 값을 직접 갖는다. */
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .codaroLabel::before {
    width: 20px;
    height: 1px;
    background: currentColor;
    content: "";
  }

  /* 신호 rail. 면을 채우지 않고 왼쪽 세로선 하나로 덩어리를 표시한다.
     accent 는 지금 해야 할 것, muted 는 조용한 참고다. 학습 표면은 참고 덩어리에
     연한 선을 쓰기로 계약돼 있어(curriculum-card-contract) 그 톤을 따로 둔다. */
  .codaroRail {
    border-left: 2px solid var(--color-border-emphasized);
    padding-left: 16px;
  }

  .codaroRail[data-rail="accent"] {
    border-left-color: var(--color-accent);
  }

  .codaroRail[data-rail="muted"] {
    border-left-color: var(--color-border);
  }

  /* 숫자 격자. 칸 사이는 세로선으로만 나눈다. 바깥 테두리는 층 프레임이 맡는다. */
  .codaroStatGrid {
    display: grid;
    grid-template-columns: repeat(var(--stat-columns, 4), minmax(0, 1fr));
  }

  /* 칸 안쪽 여백은 표면 밀도에 따라 다르다. 마케팅 표면은 넉넉하게, 작업 화면은
     조밀하게 쓰므로 값을 변수로 열어 둔다. 이걸 박아 두면 앱 패널에서 못 쓴다. */
  .codaroStatGrid > * {
    display: grid;
    gap: 6px;
    padding: var(--stat-cell-padding, 26px 24px 28px);
    border-left: 1px solid var(--color-border);
  }

  .codaroStatGrid > *:first-child {
    padding-left: 0;
    border-left: 0;
  }

  [data-social-links="codaro"] {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 2px;
    white-space: nowrap;
  }

  [data-social-link="codaro"] svg {
    width: 14px;
    height: 14px;
    flex: 0 0 auto;
  }

  [data-social-link="codaro"] {
    display: inline-flex !important;
    width: 28px !important;
    height: 28px !important;
    min-width: 28px !important;
    min-height: 28px !important;
    align-items: center !important;
    justify-content: center !important;
    border: 0 !important;
    border-radius: var(--radius-element) !important;
    padding: 0 !important;
    background: transparent !important;
    color: var(--color-text-secondary) !important;
    text-decoration: none !important;
    cursor: pointer;
  }

  [data-social-link="codaro"]:hover,
  [data-social-link="codaro"]:focus-visible {
    background: var(--color-background-muted) !important;
    color: var(--color-text-primary) !important;
  }

  [data-social-link="codaro"]:focus-visible {
    outline: 2px solid var(--color-accent) !important;
    outline-offset: 1px !important;
  }

  [data-social-link-id="support"] {
    color: #e96787 !important;
  }

  @media (forced-colors: active) {
    [data-social-link="codaro"] {
      border: 1px solid ButtonText !important;
    }
  }
}

/*
 * The support center is rendered through a portal under document.body.
 * Keep its product layout outside cascade layers so application chunks cannot
 * establish a different layer order and let their reset collapse its spacing.
 */
  .codaroSupportBackdrop {
    position: fixed;
    z-index: 300;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 28px;
    background: rgba(3, 3, 5, 0.74);
    backdrop-filter: blur(2px);
  }

  .codaroSupportDialog {
    width: min(560px, 100%);
    max-height: 88svh;
    display: flex;
    overflow: hidden;
    flex-direction: column;
    border: 1px solid #2d2d34;
    border-radius: 8px;
    background: #111114 !important;
    color: #f4f4f5 !important;
    color-scheme: dark;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.56);
  }

  .codaroSupportHeader {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: space-between;
    min-height: 38px;
    padding: 7px 12px;
    border-bottom: 1px solid #29292f;
    background: rgba(17, 17, 20, 0.96);
    backdrop-filter: blur(12px);
  }

  .codaroSupportHeader h2 {
    margin: 0;
    color: #a88bff !important;
    font-family: var(--font-family-code);
    font-size: 12px;
    line-height: 1;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .codaroSupportClose {
    display: grid;
    width: 28px;
    height: 28px;
    place-items: center;
    border: 0;
    border-radius: 7px;
    background: transparent;
    color: #a5a5ae !important;
    cursor: pointer;
  }

  .codaroSupportClose:hover,
  .codaroSupportClose:focus-visible {
    background: #222228;
    color: #ffffff;
  }

  .codaroSupportClose:focus-visible {
    outline: 2px solid #9b7cf8;
    outline-offset: 1px;
  }

  .codaroSupportClose svg {
    width: 17px;
    height: 17px;
  }

  .codaroSupportBody {
    display: flex;
    min-height: 0;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 18px;
    overflow-y: auto;
    padding: 16px 18px 18px;
  }

  .codaroSupportHero {
    display: grid;
    grid-template-columns: 52px 1fr;
    align-items: start;
    gap: 12px;
  }

  .codaroSupportHeart {
    display: grid;
    width: 52px;
    height: 52px;
    place-items: center;
    border: 1px solid rgba(233, 103, 135, 0.26);
    border-radius: 50%;
    background: rgba(233, 103, 135, 0.1);
    color: #ec7894;
  }

  .codaroSupportHeart svg {
    width: 23px;
    height: 23px;
  }

  .codaroSupportHero p {
    margin: 2px 0 0;
    color: #c2c2ca !important;
    font-size: 12.5px;
    line-height: 1.65;
    word-break: keep-all;
  }

  .codaroSupportSection {
    display: grid;
    gap: 8px;
  }

  .codaroSupportSection h3 {
    margin: 0;
    color: #a5a5ae !important;
    font-family: var(--font-family-code);
    font-size: 10.5px;
    line-height: 1;
    font-weight: 650;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .codaroSupportWays {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 7px;
  }

  .codaroSupportWays a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-width: 0;
    padding: 8px;
    border: 1px solid #2b2b31;
    border-radius: 8px;
    background: #18181c;
    color: #c9c9d0 !important;
    font-size: 12px;
    text-decoration: none;
  }

  .codaroSupportWays a:hover,
  .codaroSupportWays a:focus-visible {
    border-color: #484852;
    background: #1d1d22;
    color: #ffffff;
  }

  .codaroSupportRows {
    display: grid;
    gap: 7px;
  }

  .codaroSupportRow {
    display: flex;
    min-height: 44px;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 1px solid #2b2b31;
    border-radius: 7px;
    background: #0d0d10;
    color: #f1f1f3 !important;
    font-size: 12px;
    text-decoration: none;
  }

  .codaroSupportRow:hover,
  .codaroSupportRow:focus-visible {
    background: #1d1d22;
  }

  .codaroSupportRow strong {
    color: #f1f1f3 !important;
    font-size: 12px;
    font-weight: 580;
  }

  .codaroSupportRow > span {
    margin-left: auto;
    color: #a5a5ae !important;
    font-size: 11px;
  }

  .codaroSupportGlyph {
    width: 15px;
    height: 15px;
    flex: 0 0 auto;
    color: #a88bff;
  }

  .codaroSupportGlyph-coffee {
    color: #ffdd00;
  }

  .codaroSupportGlyph-heart {
    color: #fb7185;
  }

  .codaroSupportAccountIdentity {
    display: flex;
    min-width: 0;
    align-items: baseline;
    gap: 7px;
    flex-wrap: wrap;
  }

  .codaroSupportAccountIdentity .codaroSupportGlyph {
    align-self: center;
  }

  .codaroSupportAccountIdentity > span {
    color: #d6d6dc !important;
    font-family: var(--font-family-code);
    font-size: 11.5px;
    font-variant-numeric: tabular-nums;
  }

  .codaroSupportAccountIdentity .codaroSupportAccountHolder {
    color: #8f8f99 !important;
    font-family: var(--font-family-body);
  }

  .codaroSupportAccount button {
    display: flex;
    margin-left: auto;
    align-items: center;
    gap: 4px;
    border: 1px solid #2d2d34;
    border-radius: 6px;
    padding: 7px 9px;
    background: transparent;
    color: #d6d6dc !important;
    font: inherit;
    cursor: pointer;
  }

  .codaroSupportAccount button:hover,
  .codaroSupportAccount button:focus-visible {
    background: #2b2b32;
    color: #ffffff;
  }

  .codaroSupportAccount button span:last-child {
    color: #a88bff !important;
    font-size: 10px;
    font-weight: 650;
  }

  .codaroSupportNote {
    margin: 4px 2px 0;
    color: #9898a2 !important;
    font-size: 10px;
    line-height: 1.6;
    text-align: left;
  }

  @media (max-width: 560px) {
    .codaroSupportBackdrop {
      align-items: end;
      padding: 12px;
    }

    .codaroSupportDialog {
      max-height: calc(100svh - 24px);
      border-radius: 8px;
    }

    .codaroSupportWays {
      grid-template-columns: 1fr;
    }

    .codaroSupportAccount {
      align-items: flex-start;
      flex-direction: column;
      padding-block: 12px;
    }

    .codaroSupportAccount button {
      margin-left: 25px;
    }
  }
'''


def renderFontCss(manifest: dict[str, Any], publicPrefix: str) -> str:
    blocks = ["/* @generated by buildDesignSystem.py. Do not edit. */"]
    for font in manifest["fonts"]:
        blocks.append(
            "\n".join(
                [
                    "@font-face {",
                    f'  font-family: "{font["family"]}";',
                    f'  src: url("{publicPrefix}{font["file"]}") format("woff2");',
                    f'  font-weight: {font["weight"]};',
                    f'  font-style: {font["style"]};',
                    f'  font-display: {manifest["fontDisplay"]};',
                    f'  unicode-range: {font["unicodeRange"]};',
                    "}",
                ]
            )
        )
    return "\n\n".join(blocks) + "\n"


def buildCliArtifacts(document: dict[str, Any], sourceHash: str) -> dict[str, str]:
    npxPath = shutil.which("npx")
    if npxPath is None:
        raise DesignSystemError("npx is required to build the Astryx theme")
    with tempfile.TemporaryDirectory(prefix=".codaro-theme-", dir=LANDING_ROOT) as tempName:
        tempRoot = Path(tempName)
        sourcePath = tempRoot / "codaroTheme.source.ts"
        cssPath = tempRoot / "codaroTheme.css"
        sourcePath.write_text(renderThemeSource(document), encoding="utf-8", newline="\n")
        result = subprocess.run(
            [npxPath, "astryx", "theme", "build", str(sourcePath), "--out", str(cssPath)],
            cwd=LANDING_ROOT,
            check=False,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        if result.returncode != 0:
            detail = result.stderr.strip() or result.stdout.strip()
            raise DesignSystemError(f"Astryx theme build failed: {detail}")
        artifacts = {}
        for fileName in ("codaroTheme.css", "codaro.js", "codaro.d.ts"):
            outputPath = tempRoot / fileName
            if not outputPath.is_file():
                raise DesignSystemError(f"Astryx CLI did not create {fileName}")
            artifacts[fileName] = normalizeCliOutput(
                outputPath.read_text(encoding="utf-8"), sourceHash
            )
        return artifacts


def createExpectedOutputs(
    document: dict[str, Any], manifest: dict[str, Any], socialLinksDocument: dict[str, Any]
) -> dict[str, dict[str, bytes]]:
    sourceHash = calculateHash(canonicalJson(document))
    cliArtifacts = buildCliArtifacts(document, sourceHash)
    provenance = {
        "astryx": document["astryx"],
        "fontManifestSha256": calculateHash(canonicalJson(manifest)),
        "generator": "assets/brand/tools/buildDesignSystem.py",
        "socialLinksSource": "assets/brand/designSystem/socialLinks.json",
        "socialLinksSourceSha256": calculateHash(canonicalJson(socialLinksDocument)),
        "source": "assets/brand/designSystem/tokens.json",
        "sourceSha256": sourceHash,
    }
    outputs: dict[str, dict[str, bytes]] = {}
    for appName in APP_TARGETS:
        css = cliArtifacts["codaroTheme.css"]
        css += renderRuntimeCss(document)
        css += renderAppBridge(appName)
        css += renderSharedComponentCss()
        publicPrefix = "/codaro/fonts/" if appName == "landing" else "/fonts/"
        appOutputs = {
            "codaroTheme.css": css.encode("utf-8"),
            "codaro.js": cliArtifacts["codaro.js"].encode("utf-8"),
            "codaro.d.ts": cliArtifacts["codaro.d.ts"].encode("utf-8"),
            "codaroTheme.ts": renderRuntimeTypes(sourceHash, document).encode("utf-8"),
            "fonts.css": renderFontCss(manifest, publicPrefix).encode("utf-8"),
            "provenance.json": (json.dumps(provenance, indent=2, sort_keys=True) + "\n").encode(
                "utf-8"
            ),
            "socialLinks.tsx": renderSocialLinks(socialLinksDocument).encode("utf-8"),
        }
        outputs[appName] = appOutputs
    return outputs


def writeAtomically(path: Path, content: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporaryPath = path.with_name(f".{path.name}.tmp")
    temporaryPath.write_bytes(content)
    temporaryPath.replace(path)


def applyOutputs(
    outputs: dict[str, dict[str, bytes]], manifest: dict[str, Any], checkOnly: bool
) -> list[str]:
    drift: list[str] = []
    for appName, appOutputs in outputs.items():
        targetRoot = APP_TARGETS[appName]
        for fileName, content in appOutputs.items():
            targetPath = targetRoot / fileName
            if checkOnly:
                if not targetPath.is_file() or targetPath.read_bytes() != content:
                    drift.append(str(targetPath.relative_to(PROJECT_ROOT)))
            else:
                writeAtomically(targetPath, content)
        expectedFontNames = {font["file"] for font in manifest["fonts"]}
        staleFontPaths = [
            path
            for path in FONT_TARGETS[appName].glob("*.woff2")
            if path.name not in expectedFontNames
        ]
        if checkOnly:
            drift.extend(str(path.relative_to(PROJECT_ROOT)) for path in staleFontPaths)
        else:
            for path in staleFontPaths:
                path.unlink()
        for font in manifest["fonts"]:
            sourcePath = FONT_SOURCE_ROOT / font["file"]
            targetPath = FONT_TARGETS[appName] / font["file"]
            content = sourcePath.read_bytes()
            if checkOnly:
                if not targetPath.is_file() or targetPath.read_bytes() != content:
                    drift.append(str(targetPath.relative_to(PROJECT_ROOT)))
            else:
                writeAtomically(targetPath, content)
    return drift


def buildDesignSystem(checkOnly: bool = False) -> None:
    if not SCHEMA_PATH.is_file():
        raise DesignSystemError(f"token schema is missing: {SCHEMA_PATH}")
    document = loadJson(TOKEN_PATH)
    manifest = loadJson(FONT_MANIFEST_PATH)
    socialLinksDocument = loadJson(SOCIAL_LINKS_PATH)
    validateTokenDocument(document)
    validateFontManifest(manifest)
    validateSocialLinks(socialLinksDocument)
    outputs = createExpectedOutputs(document, manifest, socialLinksDocument)
    drift = applyOutputs(outputs, manifest, checkOnly)
    if drift:
        raise DesignSystemError("generated design system drift:\n- " + "\n- ".join(sorted(drift)))


def main() -> int:
    parser = argparse.ArgumentParser(description="Build the shared Codaro Astryx theme")
    parser.add_argument("--check", action="store_true", help="verify generated mirrors")
    args = parser.parse_args()
    try:
        buildDesignSystem(checkOnly=args.check)
    except DesignSystemError as error:
        print(f"error: {error}")
        return 1
    action = "verified" if args.check else "generated"
    print(f"ok: design system {action} for landing and editor")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
