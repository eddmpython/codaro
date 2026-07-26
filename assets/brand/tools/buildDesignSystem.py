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
        raise DesignSystemError(f"radius must use px: {value}")
    return float(match.group(1))


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
    }
    missingKeys = sorted(requiredKeys - document.keys())
    if missingKeys:
        raise DesignSystemError(f"token document is missing: {', '.join(missingKeys)}")
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
    expectedIds = ["github", "support", "youtube", "threads"]
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
        if "href" in link and not link["href"].startswith("https://"):
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
    return "\n".join(lines) + "\n"


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
            "--accent-brand": "var(--color-accent)",
            "--accent-brand-foreground": "var(--color-on-accent)",
            "--chart-1": "var(--color-text-blue)",
            "--chart-2": "var(--color-success)",
            "--chart-3": "var(--color-text-orange)",
            "--chart-4": "var(--color-text-purple)",
            "--chart-5": "var(--color-error)",
            "--sidebar": "var(--color-background-surface)",
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
              rel="noopener noreferrer"
              size="sm"
              target="_blank"
              variant="ghost"
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
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
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
      <section className="codaroSupportDialog" onMouseDown={(event) => event.stopPropagation()}>
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
            <SupportRow href={supportCenter.coffeeHref} label="Buy me a coffee" value="일회성 후원" />
            <SupportRow href={supportCenter.sponsorsHref} label="GitHub Sponsors" value="정기 후원" />
            <div className="codaroSupportRow codaroSupportAccount">
              <div>
                <strong>{supportCenter.account.bank}</strong>
                <span>{supportCenter.account.holder}</span>
              </div>
              <button
                aria-label={`계좌번호 ${supportCenter.account.number} 복사`}
                data-support-account-copy="codaro"
                onClick={() => void copyAccount()}
                type="button"
              >
                <span data-support-account-number="codaro">{supportCenter.account.number}</span>
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

function SupportRow({href, label, value}: {href: string; label: string; value: string}) {
  return (
    <a className="codaroSupportRow" href={href} rel="noopener noreferrer" target="_blank">
      <strong>{label}</strong>
      <span>{value} ↗</span>
    </a>
  );
}

function SocialIcon({link}: {link: SocialLink}) {
  return (
    <svg aria-hidden="true" fill={link.id === "support" ? "none" : "currentColor"} role="img" viewBox={link.viewBox}>
      <path
        d={link.path}
        fill={link.id === "support" ? "none" : "currentColor"}
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

  .codaroSupportBackdrop {
    position: fixed;
    z-index: 300;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 24px;
    background: rgba(3, 3, 5, 0.76);
    backdrop-filter: blur(8px);
  }

  .codaroSupportDialog {
    width: min(560px, 100%);
    max-height: min(780px, calc(100svh - 48px));
    overflow: hidden auto;
    border: 1px solid #2d2d34;
    border-radius: 12px;
    background: #111114;
    color: #f4f4f5;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.56);
  }

  .codaroSupportHeader {
    position: sticky;
    z-index: 1;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 58px;
    padding: 0 18px 0 22px;
    border-bottom: 1px solid #29292f;
    background: rgba(17, 17, 20, 0.96);
    backdrop-filter: blur(12px);
  }

  .codaroSupportHeader h2 {
    margin: 0;
    font-size: 15px;
    line-height: 1;
    font-weight: 650;
    letter-spacing: -0.02em;
  }

  .codaroSupportClose {
    display: grid;
    width: 30px;
    height: 30px;
    place-items: center;
    border: 0;
    border-radius: 7px;
    background: transparent;
    color: #96969f;
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
    display: grid;
    gap: 26px;
    padding: 26px 22px 22px;
  }

  .codaroSupportHero {
    display: grid;
    grid-template-columns: 48px 1fr;
    align-items: center;
    gap: 16px;
  }

  .codaroSupportHeart {
    display: grid;
    width: 48px;
    height: 48px;
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
    margin: 0;
    color: #b2b2bb;
    font-size: 13px;
    line-height: 1.72;
    word-break: keep-all;
  }

  .codaroSupportSection {
    display: grid;
    gap: 10px;
  }

  .codaroSupportSection h3 {
    margin: 0;
    color: #777780;
    font-size: 10px;
    line-height: 1;
    font-weight: 650;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .codaroSupportWays {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .codaroSupportWays a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    padding: 11px 12px;
    border: 1px solid #2b2b31;
    border-radius: 8px;
    background: #18181c;
    color: #c9c9d0;
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
    overflow: hidden;
    border: 1px solid #2b2b31;
    border-radius: 9px;
    background: #17171b;
  }

  .codaroSupportRow {
    display: flex;
    min-height: 52px;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 0 14px;
    border-bottom: 1px solid #28282e;
    color: #f1f1f3;
    font-size: 12px;
    text-decoration: none;
  }

  .codaroSupportRow:last-child {
    border-bottom: 0;
  }

  .codaroSupportRow:hover,
  .codaroSupportRow:focus-visible {
    background: #1d1d22;
  }

  .codaroSupportRow strong {
    font-size: 12px;
    font-weight: 580;
  }

  .codaroSupportRow > span,
  .codaroSupportRow > div > span {
    color: #85858f;
    font-size: 11px;
  }

  .codaroSupportAccount > div {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .codaroSupportAccount button {
    display: flex;
    align-items: center;
    gap: 9px;
    border: 0;
    border-radius: 6px;
    padding: 7px 9px;
    background: #222228;
    color: #d6d6dc;
    font: inherit;
    cursor: pointer;
  }

  .codaroSupportAccount button:hover,
  .codaroSupportAccount button:focus-visible {
    background: #2b2b32;
    color: #ffffff;
  }

  .codaroSupportAccount button span:last-child {
    color: #9b7cf8;
    font-size: 10px;
    font-weight: 650;
  }

  .codaroSupportNote {
    margin: -6px 0 0;
    color: #696972;
    font-size: 10px;
    line-height: 1.6;
    text-align: center;
  }

  @media (max-width: 560px) {
    .codaroSupportBackdrop {
      align-items: end;
      padding: 12px;
    }

    .codaroSupportDialog {
      max-height: calc(100svh - 24px);
      border-radius: 12px;
    }

    .codaroSupportWays {
      grid-template-columns: 1fr;
    }

    .codaroSupportAccount {
      align-items: flex-start;
      flex-direction: column;
      padding-block: 12px;
    }
  }

  @media (forced-colors: active) {
    [data-social-link="codaro"] {
      border: 1px solid ButtonText !important;
    }
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
