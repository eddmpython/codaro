from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]


def _read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def testProductSurfaceNavKeepsConversationFirstFlow() -> None:
    source = _read("editor/src/lib/surfaceModel.ts")
    items = re.findall(
        r'\{ value: "([^"]+)", labelKey: "([^"]+)", flowRole: "([^"]+)", beta: (true|false), visibleInSidebar: (true|false) \}',
        source,
    )
    values = [item[0] for item in items]
    flowRoles = [item[2] for item in items]
    visibility = [item[4] for item in items]

    assert values[:5] == ["chat", "curriculum", "editor", "automation", "share"]
    assert flowRoles[:5] == ["entry", "learning", "notebook", "secondLoop", "support"]
    assert visibility[:5] == ["true", "true", "true", "true", "false"]
    assert 'value: "automation", labelKey: "nav.automation", flowRole: "secondLoop", beta: true, visibleInSidebar: true' in source
    assert 'value: "share", labelKey: "nav.share", flowRole: "support", beta: true, visibleInSidebar: false' in source
    assert 'DEFAULT_SURFACE: SurfaceMode = "chat"' in source
    assert "SURFACE_MODES: readonly SurfaceMode[] = PRODUCT_SURFACE_NAV.map" in source
    assert "PRODUCT_SIDEBAR_NAV: readonly ProductSurfaceNavItem[] = PRODUCT_SURFACE_NAV" in source
    assert "SIDEBAR_SURFACES: readonly SurfaceMode[] = PRODUCT_SIDEBAR_NAV.map" in source
    assert "isSurfaceMode(value: string)" in source
    assert "PRODUCT_SURFACE_NAV" in source
    assert "HIDDEN_SURFACES: readonly SurfaceMode[] = PRODUCT_SURFACE_NAV" in source


def testSurfaceRouteUsesSurfaceModelContract() -> None:
    source = _read("editor/src/hooks/useSurfaceRoute.ts")

    assert "DEFAULT_SURFACE" in source
    assert "isSurfaceMode" in source
    assert 'return "chat"' not in source
    assert 'value === "editor"' not in source


def testProductSidebarRendersCentralSurfaceNavOnly() -> None:
    source = _read("editor/src/components/app/productSidebar.tsx")

    assert "PRODUCT_SIDEBAR_NAV" in source
    assert "PRODUCT_SURFACE_NAV" not in source
    assert "allNavItems" not in source
    assert "HIDDEN_SURFACES" not in source
    assert ".filter((item) => item.visibleInSidebar)" not in source
    assert 'data-product-nav="flow"' in source
    assert 'data-product-nav="utility"' in source
    assert "data-product-flow-role={flowRole}" in source
    assert source.index('data-product-nav="flow"') < source.index('data-product-nav="utility"')
    assert source.index('data-product-nav="utility"') < source.index('tooltip={t("terminal.title")}')


def testProductSurfaceCopyMatchesFocusedFlow() -> None:
    locale = _read("editor/src/lib/localeCopy.ts")

    for expected in (
        '"nav.chat": "대화"',
        '"nav.curriculum": "현재 학습"',
        '"nav.editor": "노트북"',
        '"nav.automation": "자동화"',
    ):
        assert expected in locale


def testProductSurfaceDocsNameTheSameFlow() -> None:
    frontendDoc = _read("docs/skills/architecture/frontend-product-surface.md")
    dogfoodDoc = _read("docs/skills/ops/product/dogfood-alpha.md")
    identityDoc = _read("docs/skills/identity/multi-editor-modes.md")
    ssotMap = _read("docs/skills/architecture/ssot-map.md")

    assert "`대화 → 현재 학습 → 노트북 → 자동화`" in frontendDoc
    assert "`PRODUCT_SURFACE_NAV`" in frontendDoc
    assert "`entry`/`learning`/`notebook`/`secondLoop`/`support`" in frontendDoc
    assert "`대화 → 현재 학습 → 노트북 → 자동화`" in dogfoodDoc
    assert "`대화 → 현재 학습 → 노트북 → 자동화`" in identityDoc
    assert "`대화 → 현재 학습 → 노트북 → 자동화` 사이드바 순서" in ssotMap
