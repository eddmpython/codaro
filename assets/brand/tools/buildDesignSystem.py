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

    for role, tokenName in document["semanticRoles"].items():
        if tokenName not in tokens and tokenName not in {
            "--color-text-blue",
            "--color-background-muted",
        }:
            raise DesignSystemError(f"semantic role {role} references an unknown token")

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
    for font in fonts:
        sourcePath = FONT_SOURCE_ROOT / font["file"]
        if not sourcePath.is_file():
            raise DesignSystemError(f"font source is missing: {sourcePath}")
        actualHash = calculateHash(sourcePath.read_bytes())
        if actualHash != font["sha256"]:
            raise DesignSystemError(f"font hash mismatch: {font['file']}")
        if font["license"] != "OFL-1.1" or not font["licenseSource"].startswith("https://"):
            raise DesignSystemError(f"font license provenance is incomplete: {font['file']}")


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
            "--plum": "var(--color-text-purple)",
            "--plum-deep": "var(--color-accent)",
            "--amber": "var(--color-text-orange)",
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
    return f'''// @generated by buildDesignSystem.py. Do not edit.
export {{codaroTheme}} from "./codaro.js";

export const designSystemSourceHash = "{sourceHash}" as const;
export const accentSwatches = {accentSwatchesJson} as const;
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
    document: dict[str, Any], manifest: dict[str, Any]
) -> dict[str, dict[str, bytes]]:
    sourceHash = calculateHash(canonicalJson(document))
    cliArtifacts = buildCliArtifacts(document, sourceHash)
    provenance = {
        "astryx": document["astryx"],
        "fontManifestSha256": calculateHash(canonicalJson(manifest)),
        "generator": "assets/brand/tools/buildDesignSystem.py",
        "source": "assets/brand/designSystem/tokens.json",
        "sourceSha256": sourceHash,
    }
    outputs: dict[str, dict[str, bytes]] = {}
    for appName in APP_TARGETS:
        css = cliArtifacts["codaroTheme.css"]
        css += renderRuntimeCss(document)
        css += renderAppBridge(appName)
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
    validateTokenDocument(document)
    validateFontManifest(manifest)
    outputs = createExpectedOutputs(document, manifest)
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
