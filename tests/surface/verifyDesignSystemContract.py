from __future__ import annotations

from datetime import UTC, datetime
import hashlib
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DESIGN_ROOT = ROOT / "assets" / "brand" / "designSystem"
REPORT_PATH = ROOT / "output" / "test-runner" / "design-system-contract" / "design-system-report.json"
APPS = ("landing", "editor")
COMPATIBILITY_PATH = DESIGN_ROOT / "compatibility.json"
LAYER_ORDER = "@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;"


def canonicalJson(value: object) -> str:
    return json.dumps(value, ensure_ascii=True, sort_keys=True, separators=(",", ":"))


def sha256(data: bytes | str) -> str:
    payload = data.encode("utf-8") if isinstance(data, str) else data
    return hashlib.sha256(payload).hexdigest()


def require(condition: bool, message: str, failures: list[str]) -> None:
    if not condition:
        failures.append(message)


def sourceHasAssetId(source: str, assetId: str) -> bool:
    return f'assetId="{assetId}"' in source or f'assetId: "{assetId}"' in source


def packageVersion(package: dict[str, object], name: str) -> str | None:
    for section in ("dependencies", "devDependencies"):
        values = package.get(section)
        if isinstance(values, dict) and name in values:
            value = values[name]
            return value if isinstance(value, str) else None
    return None


def verifyPackagePins(app: str, compatibility: dict[str, object], failures: list[str]) -> None:
    package = json.loads((ROOT / app / "package.json").read_text(encoding="utf-8"))
    lock = json.loads((ROOT / app / "package-lock.json").read_text(encoding="utf-8"))
    expected = dict(compatibility["sharedPackages"])
    if app == "landing":
        expected["@astryxdesign/cli"] = "0.1.6"
        expected["gpt-tokenizer"] = "3.4.0"
    for name, version in expected.items():
        require(packageVersion(package, name) == version, f"{app} package pin drift: {name}", failures)
        lockEntry = lock.get("packages", {}).get(f"node_modules/{name}", {})
        require(lockEntry.get("version") == version, f"{app} lock pin drift: {name}", failures)


def verifyGeneratedArtifacts(tokens: dict[str, object], fontManifest: dict[str, object], failures: list[str]) -> None:
    expectedSourceHash = sha256(canonicalJson(tokens))
    sharedFiles = ("codaro.js", "codaro.d.ts", "codaroTheme.ts", "provenance.json")
    for fileName in sharedFiles:
        landingBytes = (ROOT / "landing" / "src" / "styles" / "generated" / fileName).read_bytes()
        editorBytes = (ROOT / "editor" / "src" / "styles" / "generated" / fileName).read_bytes()
        require(landingBytes == editorBytes, f"generated mirror mismatch: {fileName}", failures)

    for app in APPS:
        generatedRoot = ROOT / app / "src" / "styles" / "generated"
        provenance = json.loads((generatedRoot / "provenance.json").read_text(encoding="utf-8"))
        require(provenance.get("sourceSha256") == expectedSourceHash, f"{app} provenance source hash drift", failures)
        css = (generatedRoot / "codaroTheme.css").read_text(encoding="utf-8")
        for token in (
            ':scope[data-density="public"]',
            ':scope[data-density="learningComfortable"]',
            ':scope[data-density="studioDense"]',
            ':scope[data-accent="plum"]',
            ':scope[data-accent="blue"]',
            ':scope[data-accent="teal"]',
            "prefers-reduced-motion: reduce",
        ):
            require(token in css, f"{app} generated theme missing {token}", failures)

        fontRoot = ROOT / ("landing/static/fonts" if app == "landing" else "editor/public/fonts")
        for font in fontManifest["fonts"]:
            target = fontRoot / font["file"]
            require(target.is_file(), f"{app} font mirror missing: {font['file']}", failures)
            if target.is_file():
                require(sha256(target.read_bytes()) == font["sha256"], f"{app} font hash drift: {font['file']}", failures)


def verifySemanticCssReferences(tokens: dict[str, object], failures: list[str]) -> None:
    definitions: set[str] = set()
    references: set[str] = set()
    for app in APPS:
        for path in (ROOT / app / "src").rglob("*.css"):
            source = path.read_text(encoding="utf-8")
            definitions.update(re.findall(r"(?m)(--[a-z0-9-]+)\s*:", source))
            references.update(re.findall(r"var\((--[a-z0-9-]+)", source))
    undefinedColors = sorted(
        token for token in references - definitions if token.startswith("--color-")
    )
    require(
        not undefinedColors,
        f"undefined semantic color tokens: {', '.join(undefinedColors)}",
        failures,
    )
    semanticValues = set(tokens["semanticRoles"].values())
    tokenNames = set(tokens["astryxTokens"])
    require(
        semanticValues <= tokenNames,
        "semantic roles must all resolve to source tokens",
        failures,
    )


def verifyEntryPoints(failures: list[str]) -> None:
    for app, entryName in (("landing", "src/main.jsx"), ("editor", "src/main.tsx")):
        layerText = (ROOT / app / "src" / "styles" / "layers.css").read_text(encoding="utf-8").strip()
        require(layerText == LAYER_ORDER, f"{app} layer order drift", failures)
        entry = (ROOT / app / entryName).read_text(encoding="utf-8")
        imports = (
            '"./styles/layers.css"',
            '"@astryxdesign/core/reset.css"',
            '"@astryxdesign/theme-neutral/theme.css"',
            '"./styles/generated/fonts.css"',
            '"./styles/generated/codaroTheme.css"',
        )
        offsets = [entry.find(token) for token in imports]
        require(all(offset >= 0 for offset in offsets), f"{app} entry is missing design imports", failures)
        require(offsets == sorted(offsets), f"{app} design import order drift", failures)
        require("<CodaroThemeProvider" in entry, f"{app} root is missing CodaroThemeProvider", failures)
        if app == "landing":
            resetOffset = entry.find('"@astryxdesign/core/reset.css"')
            componentOffset = entry.find('"@astryxdesign/core/astryx.css"')
            neutralOffset = entry.find('"@astryxdesign/theme-neutral/theme.css"')
            require(componentOffset >= 0, "landing entry must load Astryx component CSS", failures)
            require(
                resetOffset < componentOffset < neutralOffset,
                "landing Astryx component CSS import order drift",
                failures,
            )
        else:
            require(
                '"@astryxdesign/core/astryx.css"' not in entry,
                "editor must not load unused Astryx component CSS",
                failures,
            )
        html = (ROOT / app / "index.html").read_text(encoding="utf-8")
        for fragment in (
            'name="theme-color" content="#f5f6f8"',
            'window.localStorage.getItem("codaro-theme")',
            'root.dataset.theme = resolved',
            'root.dataset.resolvedTheme = resolved',
            'root.style.colorScheme = resolved',
            'root.style.backgroundColor = canvas',
            'resolved === "dark" ? "#151619" : "#f5f6f8"',
        ):
            require(fragment in html, f"{app} first-paint theme bootstrap missing {fragment}", failures)
        for legacyColor in ("#fbf8f4", "#17121b", "#0a0a0a"):
            require(legacyColor not in html.lower(), f"{app} first paint retains legacy color {legacyColor}", failures)
        manifestPath = (
            ROOT / "landing/static/manifest.webmanifest"
            if app == "landing"
            else ROOT / "editor/public/manifest.json"
        )
        manifest = json.loads(manifestPath.read_text(encoding="utf-8"))
        require(
            manifest.get("background_color") == "#f5f6f8"
            and manifest.get("theme_color") == "#f5f6f8",
            f"{app} install surface must start on the shared light canvas",
            failures,
        )


def verifyRepresentativeSurfaces(failures: list[str]) -> None:
    landingProvider = (ROOT / "landing/src/components/codaroThemeProvider.jsx").read_text(encoding="utf-8")
    editorProvider = (ROOT / "editor/src/lib/codaroDesign.tsx").read_text(encoding="utf-8")
    for label, source in (("landing", landingProvider), ("editor", editorProvider)):
        require('const themeStorageKey = "codaro-theme"' in source, f"{label} theme storage key is not shared", failures)
        require("prefers-reduced-motion: reduce" in source, f"{label} provider misses reduced motion", failures)
        require(
            "<Theme" in source and "theme={codaroTheme}" in source,
            f"{label} provider misses the Astryx scope boundary",
            failures,
        )
        require(
            'data-astryx-theme="codaro"' not in source,
            f"{label} provider must not nest a second Astryx scope boundary",
            failures,
        )
        require("themeCanvasColors" in source, f"{label} provider must use generated canvas colors", failures)
        require("root.dataset.theme = resolvedTheme" in source, f"{label} provider misses resolved data-theme", failures)
        require('meta[name="theme-color"]' in source, f"{label} provider must update browser chrome color", failures)
        require("useLayoutEffect" in source, f"{label} provider must settle theme before browser paint", failures)

    require(
        "useState(readStoredTheme)" in landingProvider,
        "landing must initialize from stored theme before the first React paint",
        failures,
    )

    authoredCss = "\n".join(
        path.read_text(encoding="utf-8")
        for app in APPS
        for path in (ROOT / app / "src").rglob("*.css")
        if "generated" not in path.parts
    )
    unsupportedWeights = sorted(
        {
            int(value)
            for value in re.findall(r"font-weight:\s*([0-9]+)", authoredCss)
            if int(value) not in {400, 600, 700}
        }
    )
    require(
        not unsupportedWeights,
        f"authored CSS requests unavailable font weights: {unsupportedWeights}",
        failures,
    )

    home = (ROOT / "landing/src/pages/home.jsx").read_text(encoding="utf-8")
    learn = (ROOT / "landing/src/pages/learn.jsx").read_text(encoding="utf-8")
    lessonPage = (ROOT / "landing/src/pages/lesson.jsx").read_text(encoding="utf-8")
    publicRouting = (ROOT / "landing/src/lib/publicRouting.js").read_text(encoding="utf-8")
    curriculum = (ROOT / "editor/src/components/curriculum/curriculumSurface.tsx").read_text(encoding="utf-8")
    loadingSurface = (ROOT / "editor/src/components/app/currentLearningSurface.tsx").read_text(encoding="utf-8")
    notebookSurface = (ROOT / "editor/src/components/app/notebookSurface.tsx").read_text(encoding="utf-8")
    runtimeRail = (ROOT / "editor/src/components/app/runtimeCapabilityRail.tsx").read_text(encoding="utf-8")
    automationSurface = (ROOT / "editor/src/components/automation/automationSurface.tsx").read_text(encoding="utf-8")
    automationOperationStrip = (ROOT / "editor/src/components/automation/automationOperationStrip.tsx").read_text(encoding="utf-8")
    automationRunInspector = (ROOT / "editor/src/components/automation/automationRunInspector.tsx").read_text(encoding="utf-8")
    mainSurface = (ROOT / "editor/src/components/app/mainSurface.tsx").read_text(encoding="utf-8")
    topBar = (ROOT / "editor/src/components/app/topBar.tsx").read_text(encoding="utf-8")
    editorCss = (ROOT / "editor/src/index.css").read_text(encoding="utf-8")
    require(
        all(
            sourceHasAssetId(home, assetId)
            for assetId in (
                "webRunDesktop",
                "runLearningDetail",
                "runLearningMobile",
                "localNotebookDesktop",
                "localAutomationDesktop",
            )
        ),
        "home must show manifest-backed Web, learning, and Local product captures",
        failures,
    )
    require(
        'href={curriculumUrl}' in home and 'label="웹에서 바로 학습"' in home,
        "home must prioritize direct web learning",
        failures,
    )
    require(
        "learnLessonRow" in learn
        and 'data-public-lesson-link="true"' in learn
        and "href={lessonHref(" in learn
        and "runLessonHref" in lessonPage
        and 'label="이 레슨 실행"' in lessonPage
        and 'surface: "curriculum"' in publicRouting,
        "learn catalog must deep-link to runnable lessons",
        failures,
    )
    require('data-learning-overview-start="true"' not in curriculum, "redundant lesson start button returned", failures)
    require('data-curriculum-loading="true"' in loadingSurface, "deep-linked lesson needs a non-interactive loading state", failures)
    require('className="hidden min-h-0 xl:block"' in loadingSurface, "mobile learning must not place the assistant before lesson cards", failures)
    require(
        'data-notebook-assistant-shell="desktop"' in notebookSurface
        and 'className="hidden min-h-0 xl:block"' in notebookSurface,
        "mobile notebook must not place the desktop assistant below the first cells",
        failures,
    )
    require(
        '--color-accent: var(--accent)' not in editorCss
        and '--color-accent-surface: var(--accent)' in editorCss,
        "Tailwind surface accent must not overwrite the Astryx brand accent token",
        failures,
    )
    require(
        'data-runtime-capability-rail={surface}' in runtimeRail
        and 'data-runtime-tier={tier}' in runtimeRail
        and 'title: "Web Run"' in runtimeRail
        and 'title: "Local Studio"' in runtimeRail,
        "Run and Local capability rail contract is incomplete",
        failures,
    )
    require(
        'data-runtime-requirement={template.runtime}' in automationSurface
        and 'RuntimeCapabilityRail apiOnline={apiOnline} surface="automation"' in automationSurface
        and 'data-automation-studio-layout="true"' in automationSurface
        and 'data-automation-operation-strip="true"' in automationOperationStrip
        and 'data-automation-estop-control="true"' in automationOperationStrip
        and 'data-automation-run-inspector="true"' in automationRunInspector
        and 'data-automation-run-command="true"' in automationRunInspector
        and 'kind="stdout"' in automationRunInspector
        and 'kind="stderr"' in automationRunInspector
        and all(
            "@/components/ui/card" not in source
            for source in (automationSurface, automationOperationStrip, automationRunInspector)
        ),
        "automation must expose runtime requirements without returning to nested cards",
        failures,
    )
    require(
        'className="p-3 sm:p-4 xl:pt-12"' in automationSurface,
        "desktop automation must reserve the floating top-control safe area",
        failures,
    )
    require(
        "<AutomationView" in mainSurface and "apiOnline={props.apiOnline}" in mainSurface,
        "main surface must pass runtime availability into automation",
        failures,
    )
    require(
        'data-topbar-external-links="desktop"' in topBar
        and 'className="hidden items-center gap-0.5 xl:flex"' in topBar
        and 'data-topbar-diagnostic="desktop"' in topBar
        and 'className="hidden xl:block"' in topBar,
        "compact top bars must reserve the notebook action area by hiding external and diagnostic controls",
        failures,
    )

    css = (ROOT / "landing/src/styles/homeAstryx.css").read_text(encoding="utf-8")
    modernCss = css[css.find("/* Learning catalog v2") :]
    for forbidden in ("linear-gradient", "radial-gradient", "rounded-xl", "rounded-2xl", "rounded-3xl", "indigo", "violet"):
        require(forbidden not in modernCss.lower(), f"representative landing CSS uses forbidden style: {forbidden}", failures)
    oversizedRadius = re.search(r"border-radius:\s*(?:[9]|[1-9][0-9]+)px", modernCss)
    require(oversizedRadius is None, "representative landing CSS exceeds the 8px radius ceiling", failures)


def main() -> int:
    failures: list[str] = []
    tokens = json.loads((DESIGN_ROOT / "tokens.json").read_text(encoding="utf-8"))
    fontManifest = json.loads((DESIGN_ROOT / "fontManifest.json").read_text(encoding="utf-8"))
    compatibility = json.loads(COMPATIBILITY_PATH.read_text(encoding="utf-8"))
    for app in APPS:
        verifyPackagePins(app, compatibility, failures)
    verifyGeneratedArtifacts(tokens, fontManifest, failures)
    verifySemanticCssReferences(tokens, failures)
    verifyEntryPoints(failures)
    verifyRepresentativeSurfaces(failures)

    payload = {
        "gate": "design-system-contract",
        "passed": not failures,
        "status": "passed" if not failures else "failed",
        "completedAt": datetime.now(UTC).isoformat(),
        "sourceSha256": sha256(canonicalJson(tokens)),
        "astryx": tokens["astryx"],
        "sharedPackages": compatibility["sharedPackages"],
        "failures": failures,
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if failures:
        print("FAIL: design system contract drift", file=sys.stderr)
        return 1
    print("ok: shared Astryx design system contract verified")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
