from pathlib import Path
import json
import re


ROOT = Path(__file__).resolve().parents[2]
EDITOR_SRC = ROOT / "editor" / "src"


def _read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def _editorFiles(*roots: str) -> list[Path]:
    files: list[Path] = []
    for root in roots:
        files.extend(
            path for path in (EDITOR_SRC / root).rglob("*")
            if path.suffix in {".ts", ".tsx"}
        )
    return sorted(files)


def _rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def testProductSurfaceNavKeepsWebLearningFirstAndLocalHomeFirst() -> None:
    source = _read("editor/src/lib/surfaceModel.ts")
    items = re.findall(
        r'\{ value: "([^"]+)", labelKey: "([^"]+)", flowRole: "([^"]+)", beta: (true|false), visibleInSidebar: (true|false), runtimeVisibility: "([^"]+)" \}',
        source,
    )
    values = [item[0] for item in items]
    flowRoles = [item[2] for item in items]
    visibility = [item[4] for item in items]

    runtimeVisibility = [item[5] for item in items]

    assert values == ["home", "curriculum", "editor", "automation", "chat", "share"]
    assert flowRoles == ["entry", "learning", "notebook", "secondLoop", "support", "support"]
    assert visibility == ["true", "true", "true", "true", "true", "false"]
    assert runtimeVisibility == ["local", "all", "all", "all", "all", "all"]
    assert 'value: "automation", labelKey: "nav.automation", flowRole: "secondLoop", beta: true, visibleInSidebar: true, runtimeVisibility: "all"' in source
    assert 'value: "share", labelKey: "nav.share", flowRole: "support", beta: true, visibleInSidebar: false, runtimeVisibility: "all"' in source
    assert 'DEFAULT_SURFACE: SurfaceMode = "curriculum"' in source
    assert "SURFACE_MODES: readonly SurfaceMode[] = PRODUCT_SURFACE_NAV.map" in source
    assert "PRODUCT_SIDEBAR_NAV: readonly ProductSurfaceNavItem[] = PRODUCT_SURFACE_NAV" in source
    assert "ProductSidebarFlowItem = ProductSurfaceNavItem &" in source
    assert 'PRODUCT_SIDEBAR_FLOW_ITEMS: readonly ProductSidebarFlowItem[] = productSidebarFlowItems("web")' in source
    assert 'item.runtimeVisibility === "all" || runtimeTier === "local"' in source
    assert "flowStep: index + 1" in source
    assert "SIDEBAR_SURFACES: readonly SurfaceMode[] = PRODUCT_SIDEBAR_NAV.map" in source
    assert "isSurfaceMode(value: string)" in source
    assert "surfaceNavItem(surface: SurfaceMode)" in source
    assert "surfaceFlowRole(surface: SurfaceMode)" in source
    assert "PRODUCT_SURFACE_NAV" in source
    assert "HIDDEN_SURFACES: readonly SurfaceMode[] = PRODUCT_SURFACE_NAV" in source


def testSurfaceRouteUsesDurableRunRouteContract() -> None:
    source = _read("editor/src/hooks/useSurfaceRoute.ts")
    routeState = _read("editor/src/lib/runRouteState.ts")

    assert "DEFAULT_SURFACE" in source
    assert "readRunRouteState" in source
    assert "writeRunRouteState" in source
    assert 'window.addEventListener("popstate"' in source
    assert 'navigateRunRoute({ surface: nextSurface }, "push")' in source
    assert not (EDITOR_SRC / "lib" / "curriculumDeepLink.ts").exists()
    assert 'return "chat"' not in source
    assert 'value === "editor"' not in source
    assert 'runRouteRuntimeTier() === "local" ? "home" : DEFAULT_SURFACE' in source
    assert 'runtimeTier === "web" && requestedSurface === "home" ? "curriculum" : requestedSurface' in routeState


def testLocalHomeIsAnOperationalRuntimeEntry() -> None:
    home = _read("editor/src/components/app/localHomeSurface.tsx")
    mainSurface = _read("editor/src/components/app/mainSurface.tsx")
    app = _read("editor/src/App.tsx")

    for marker in (
        'data-local-home-surface="true"',
        'data-local-home-resume="true"',
        'data-local-home-operations="true"',
        'data-local-home-commands="true"',
        "AutomationOperationStrip",
        'onNavigate("curriculum")',
        'onNavigate("editor")',
        'onNavigate("automation")',
    ):
        assert marker in home
    assert "@/components/ui/card" not in home
    assert "LocalHomeSurface" in mainSurface
    assert 'props.surface === "home"' in mainSurface
    assert "runtimeTier={runRouteState.runtimeTier}" in app
    assert 'surface === "home"' in app


def testLearningVisualsUseOneManifestBackedDomainMapping() -> None:
    visualAssets = _read("editor/src/lib/visualAssets.ts")
    learningVisuals = _read("editor/src/lib/learningVisualAssets.ts")

    assert 'from "@/lib/generated/visualAssetManifest"' in visualAssets
    assert "resolveVisualAsset(domain.assetId, { width })" in learningVisuals
    assert "LEARNING_VISUAL_DOMAINS" in learningVisuals
    for assetId in (
        "pythonFundamentals",
        "dataAnalysis",
        "dataVisualization",
        "statisticsMachineLearning",
        "imageVision",
        "learningAutomation",
        "developerLiteracy",
        "aiIntegration",
    ):
        assert learningVisuals.count(f'assetId: "{assetId}"') == 1
    for categoryKey in ("30days", "pandas", "matplotlib", "sklearn", "opencv", "playwright", "devTools", "llmBasics"):
        assert f'"{categoryKey}"' in learningVisuals
    for assetId in (
        "pythonFoundationOutcome",
        "dataReportOutcome",
        "dataVisualizationOutcome",
        "fileAutomationOutcome",
        "officeAutomationOutcome",
        "webMonitoringOutcome",
    ):
        assert learningVisuals.count(f'assetId: "{assetId}"') == 1
    assert "visual.learning.lessonRefs" in learningVisuals
    assert "resolveLearningOutcomeVisual(category, contentId, 840)" in _read(
        "editor/src/components/curriculum/learningDomainVisual.tsx"
    )


def testLandingOutcomePathsUseActualOutcomeProofAssets() -> None:
    catalog = _read("landing/src/lib/learningCatalog.js")
    learn = _read("landing/src/pages/learn.jsx")
    studio = _read("landing/src/components/learningStudio.jsx")
    productVisual = _read("landing/src/components/productVisual.jsx")

    for assetId in (
        "pythonFoundationOutcome",
        "dataReportOutcome",
        "dataVisualizationOutcome",
        "fileAutomationOutcome",
        "officeAutomationOutcome",
        "webMonitoringOutcome",
    ):
        assert f'assetId: "{assetId}"' in catalog
    # 홈 학습창과 /learn 탐색기가 같은 경로 정의를 쓴다.
    assert "guidedPaths" in studio and "guidedPaths" in learn
    assert "assetId={item.assetId}" in studio
    assert "data-visual-kind={asset.kind}" in productVisual


def testLandingProductProofsFollowTheResolvedThemePair() -> None:
    home = _read("landing/src/pages/home.jsx")
    productVisual = _read("landing/src/components/productVisual.jsx")
    resolver = _read("landing/src/lib/visualAssets.js")
    editorResolver = _read("editor/src/lib/visualAssets.ts")
    browserGate = _read("tests/surface/verifyProductExperiencePlaywright.py")

    assert "LiveCodeCell" in home
    assert "<LearningStudio />" in home
    assert "webRunDesktop" not in home
    assert "useCodaroTheme()" in productVisual
    assert "theme: resolvedTheme" in productVisual
    assert "data-visual-theme-asset={asset.themeAssetId}" in productVisual
    assert 'data-visual-theme-paired={asset.variants.lightDark === "paired" ? "true" : undefined}' in productVisual
    assert "requestedAsset.themePairId" in resolver
    assert "requestedTheme !== options.theme" in editorResolver
    assert "paired product visual theme drifted" in browserGate


def testLearningHomeAndLessonRenderInstructionalVisualsWithoutRevealControls() -> None:
    home = _read("editor/src/components/curriculum/curriculumHome.tsx")
    overview = _read("editor/src/components/curriculum/curriculumOverview.tsx")
    visual = _read("editor/src/components/curriculum/learningDomainVisual.tsx")
    browserGate = _read("tests/surface/verifyProductExperiencePlaywright.py")

    assert "<LearningDomainVisual" in home
    assert "LEARNING_VISUAL_DOMAINS.map" in home
    assert "<LearningDomainVisual" in overview
    assert "category={selectedCategory}" in overview
    assert "contentId={selectedContentId}" in overview
    for marker in (
        'data-learning-domain-visual="true"',
        "data-learning-visual-kind={visual.kind}",
        'data-learning-visual-question="true"',
        'data-learning-visual-decision="true"',
        "visual.learning.learningQuestion",
        "visual.learning.decisionShown",
    ):
        assert marker in visual
    assert "@/components/ui/card" not in visual
    assert "<button" not in visual
    assert "text-[11px]" not in home
    assert '"name": "web-learning-home-desktop"' in browserGate
    assert '"viewport": {"width": 1440, "height": 900}' in browserGate
    assert '"name": "local-learning-home-minimum"' in browserGate
    assert '"verifyLearningHomeMinimum": True' in browserGate
    assert "minimum Local learning home did not keep the first " in browserGate
    assert "goal choice visible beside its visual" in browserGate
    assert "all 8 instructional learning-domain visuals must render" in browserGate
    assert "learningOutcomeVisualCount" in browserGate
    assert '"expectedLearningVisualAssetId": "pythonFundamentals"' in browserGate
    assert '"expectedLearningVisualAssetId": "pythonFoundationOutcome"' in browserGate
    assert '"expectedLearningVisualAssetId": "dataVisualizationOutcome"' in browserGate


def testPublicLearningExplorerPersistsFiltersAndLessonVisualFillsItsFrame() -> None:
    learn = _read("landing/src/pages/learn.jsx")
    committedSearch = _read("landing/src/lib/useCommittedSearchInput.js")
    learnStyles = _read("landing/src/styles/learnExplorer.css")
    lessonStyles = _read("landing/src/styles/lessonAstryx.css")
    browserGate = _read("tests/surface/verifyProductExperiencePlaywright.py")

    catalog = _read("landing/src/lib/learningCatalog.js")
    lessonRow = _read("landing/src/components/lessonRow.jsx")
    learnInputContract = f"{learn}\n{committedSearch}\n{catalog}\n{lessonRow}"
    for marker in (
        "explorerStateFromSearch(search)",
        "replaceExplorerSearch(resolvedState)",
        'params.get("q")',
        'params.set("runtime", "web")',
        'params.set("path", selectedPath)',
        'data-learn-search-input="true"',
        'aria-controls="learn-catalog"',
        'aria-describedby="learn-result-count"',
        "draftValue",
        "searchComposing",
        'data-learn-search-committed-query={query}',
        'data-learn-search-composing={searchComposing ? "true" : "false"}',
        "nativeEvent.isComposing",
        "onCompositionStart",
        "onCompositionEnd",
        'data-learn-runtime-filter={value}',
        'data-learn-path-filter="true"',
        'data-learn-outcome-paths="true"',
        'data-learn-search-results="true"',
        "<LessonRow",
    ):
        assert marker in learnInputContract
    assert 'page.set_viewport_size({"width": 390, "height": 844})' in browserGate
    assert '"horizontalOverflow"' in browserGate
    assert 'mobileLayout["firstResultVisiblePixels"] < 96' in browserGate
    assert "scroll-margin-top: 120px;" in learnStyles
    assert ".lessonProductImage img {" in lessonStyles
    assert "height: 100%;" in lessonStyles
    assert "object-fit: cover;" in lessonStyles
    assert '"verifyLearnSearch": "pandas"' in browserGate
    assert '"verifyLearnKeyboardAndIme": True' in browserGate
    assert "Learn IME composition changed committed results before" in browserGate
    assert "Learn keyboard order did not reach the first lesson" in browserGate
    assert "Learn search state drifted across reload" in browserGate
    assert 'data-learn-path-id={item.pathId}' in learn
    assert 'aria-label={guidedPathAriaLabel(item)}' in learn
    assert 'aria-atomic="true"' in learn
    assert '"verifyLearnPathContent": True' in browserGate
    assert "Learn outcome path content is incomplete" in browserGate
    assert "Learn search accessibility relationship drifted" in browserGate
    assert '"expectedVisualAssetIds": [' in browserGate


def testCanonicalLessonExposesMachineVerifiableReadingAndAnnouncementOrder() -> None:
    overview = _read("editor/src/components/curriculum/curriculumOverview.tsx")
    progress = _read("editor/src/components/curriculum/curriculumProgressBadge.tsx")
    section = _read("editor/src/components/curriculum/curriculumSectionRenderer.tsx")
    browserGate = _read("tests/surface/verifyProductExperiencePlaywright.py")

    assert 'aria-labelledby="learning-lesson-title"' in overview
    assert 'id="learning-lesson-title"' in overview
    assert 'data-learning-section-goal="true"' in overview
    assert "aria-label={`${label} ${safeCompleted}/${safeTotal}, ${percent}%`}" in progress
    assert "aria-labelledby={sectionHeadingId}" in section
    assert "id={sectionHeadingId}" in section
    assert 'ariaLabel={`${blockLabel(exercise)} 실행 결과`}' in section
    assert section.count('aria-atomic="true"') >= 2
    assert '"verifyCanonicalSemantics": True' in browserGate
    assert "canonical lesson semantic and announcement order drifted" in browserGate


def testPublicSearchCommitsImeInputToUrlAndExposesResultRelationships() -> None:
    search = _read("landing/src/routes/searchRoutes.jsx")
    committedSearch = _read("landing/src/lib/useCommittedSearchInput.js")
    browserGate = _read("tests/surface/verifyProductExperiencePlaywright.py")

    for marker in (
        "useCommittedSearchInput(query, commitQuery)",
        "replaceSearchQuery(nextQuery)",
        'aria-label="전체 사이트 검색"',
        'aria-controls="site-search-results"',
        'aria-describedby="site-search-result-count"',
        'data-site-search-committed-query={query}',
        'data-site-search-composing={searchComposing ? "true" : "false"}',
        'id="site-search-results"',
        'role="region"',
        'id="site-search-result-count"',
        'aria-live="polite"',
        'aria-atomic="true"',
        '<ul className="searchResultList">',
    ):
        assert marker in search
    for marker in (
        "composingRef",
        "lastCommittedValueRef",
        "event.nativeEvent",
        "nativeEvent.isComposing",
        "nativeEvent.keyCode !== 229",
        "onCompositionStart",
        "onCompositionEnd",
    ):
        assert marker in committedSearch
    assert '"name": "landing-search-desktop"' in browserGate
    assert '"verifySiteSearch": True' in browserGate
    assert '"name": "landing-search-mobile"' in browserGate
    assert '"verifySiteSearchMobileLayout": True' in browserGate
    assert "site search IME composition changed committed results" in browserGate
    assert "site search committed state drifted across reload" in browserGate
    assert "site search mobile layout drifted" in browserGate


def testCanonicalLessonExposesKeyboardSectionAndAdjacentLessonNavigation() -> None:
    overview = _read("editor/src/components/curriculum/curriculumOverview.tsx")
    surface = _read("editor/src/components/curriculum/curriculumSurface.tsx")
    currentLearningSurface = _read("editor/src/components/app/currentLearningSurface.tsx")
    mainSurface = _read("editor/src/components/app/mainSurface.tsx")
    browserGate = _read("tests/surface/verifyProductExperiencePlaywright.py")

    for marker in (
        "sections[index]?.anchorBlockId",
        "data-learning-overview-section={item.anchorBlockId}",
        "selectTocBlock(item.anchorBlockId, onNavigateBlock)",
        'data-learning-lesson-focus-target="true"',
        "tabIndex={-1}",
    ):
        assert marker in overview
    for marker in (
        'aria-label="레슨 이동"',
        'data-learning-lesson-navigation="true"',
        "data-learning-previous-lesson={previousLesson.contentId}",
        "data-learning-next-lesson={nextLesson.contentId}",
        'data-learning-control-intent="navigation"',
        "onSelectLesson(nextLesson.contentId)",
    ):
        assert marker in surface
    assert "pendingLessonFocusRef" in currentLearningSurface
    assert "contents={props.contents}" in currentLearningSurface
    assert "title.focus({ preventScroll: false })" in currentLearningSurface
    assert "onSelectLesson={props.onSelectCurriculumLesson}" in mainSurface
    assert '"name": "web-canonical-keyboard-desktop"' in browserGate
    assert '"verifyCanonicalKeyboardJourney": True' in browserGate
    assert '"name": "web-canonical-navigation-mobile"' in browserGate
    assert '"verifyLessonNavigationLayout": True' in browserGate
    assert 'page.keyboard.press("Shift+Enter")' in browserGate
    assert "canonical lesson keyboard flow did not reach the next lesson" in browserGate


def testNotebookAutosaveUsesLocaleIndependentActiveCellMarker() -> None:
    notebookPanel = _read("editor/src/components/notebook/notebookPanel.tsx")
    autosaveGate = _read("tests/surface/verifyNotebookAutosavePlaywright.py")

    assert 'data-notebook-active-cell="true"' in notebookPanel
    assert 'aria-live="polite"' in notebookPanel
    assert "data-notebook-active-index={selectedBlockIndex >= 0 ? selectedBlockIndex + 1 : 0}" in notebookPanel
    assert "data-notebook-cell-count={document.blocks.length}" in notebookPanel
    assert 'querySelector("[data-notebook-active-cell=true]")' in autosaveGate
    assert 'activeCell?.dataset.notebookActiveIndex === "1"' in autosaveGate
    assert 'activeCell?.dataset.notebookCellCount === "1"' in autosaveGate
    assert 'includes("셀 1 / 1")' not in autosaveGate


def testNotebookKeepsMobileTitleAndCollapsesSecondaryCellActions() -> None:
    topBar = _read("editor/src/components/app/topBar.tsx")
    notebookPanel = _read("editor/src/components/notebook/notebookPanel.tsx")
    notebookStyles = _read("editor/src/components/notebook/notebookPanel.css")
    sidebar = _read("editor/src/components/ui/sidebar.tsx")
    curriculumSelection = _read("editor/src/lib/curriculumSelection.ts")
    autosaveGate = _read("tests/surface/verifyNotebookAutosavePlaywright.py")
    productGate = _read("tests/surface/verifyProductExperiencePlaywright.py")

    # 좁은 화면에서 제목은 오른쪽 컨트롤 묶음(테마 1 + SNS registry 항목 수) 자리를 비켜야
    # 한다. 예약 폭이 컨트롤보다 좁으면 제목과 아이콘이 겹친다. registry 에 항목을 추가하면
    # 이 값과 topBar 의 right 예약을 함께 넓혀야 한다.
    socialLinks = json.loads(_read("assets/brand/designSystem/socialLinks.json"))
    controlCount = 1 + len(socialLinks["links"])
    assert controlCount == 6, f"SNS registry 항목이 바뀌었다. 상단 레인 예약 폭을 다시 계산하라: {controlCount}"
    assert 'left-11 right-[12rem]' in topBar
    assert 'className="absolute left-1.5 top-1/2 z-30 -translate-y-1/2"' in topBar
    assert 'className="absolute left-11 top-1/2 z-20 hidden' in topBar
    assert 'surface === "editor" && "sm:hidden"' not in topBar
    assert 'data-notebook-title="topbar"' in topBar
    assert "group-data-[collapsible=icon]:[&>span]:hidden" in sidebar
    assert 'const accessibleName = props["aria-label"]' in sidebar
    assert 'typeof tooltip === "string" ? tooltip' in sidebar
    assert "collapsedSidebarVisibleTextFragments" in productGate
    assert 'data-notebook-cell-menu="true"' in notebookPanel
    assert 'aria-label={`${cellLabel} 작업 더보기`}' in notebookPanel
    assert 'role="button"' in notebookPanel
    assert ".notebookCellMoreMenu {" in notebookStyles
    assert ".notebookCodeFrame .cm-content {" in notebookStyles
    assert "min-height: 52px;" in notebookStyles
    assert "padding-right: 104px;" in notebookStyles
    assert '".cm-activeLine, .cm-activeLineGutter"' in notebookPanel
    assert '"&.cm-focused .cm-activeLine, &.cm-focused .cm-activeLineGutter"' in notebookPanel
    assert "var(--color-background-muted) 76%" in notebookPanel
    assert "unselected idle notebook cells retain an active-line fill" in productGate
    assert '"lineVisuals": lineVisualSnapshot' in productGate
    assert autosaveGate.count('state="attached"') >= 4
    assert 'page.locator("[data-notebook-cell]").first.hover' in autosaveGate
    assert 're.compile(r"^Python 셀 1 / \\d+ 작업 더보기$")' in autosaveGate
    assert 'tone: "success"' in curriculumSelection
    assert "visibleNotebookNoticeCount" in productGate
    assert "background curriculum notice leaked into the free notebook top lane" in productGate
    assert "unrelated reconnect prompt leaked into the default notebook" in productGate
    assert '"verifyNotebookTools": True' in productGate
    assert "notebookToolsVerified" in productGate


def testNotebookReadingOrderFollowsTheVisibleDocumentFlow() -> None:
    notebookPanel = _read("editor/src/components/notebook/notebookPanel.tsx")
    productGate = _read("tests/surface/verifyProductExperiencePlaywright.py")

    assert 'aria-label="노트북 셀"' in notebookPanel
    assert 'role="list"' in notebookPanel
    assert "aria-label={cellAriaLabel}" in notebookPanel
    assert "aria-posinset={position}" in notebookPanel
    assert "aria-setsize={total}" in notebookPanel
    assert notebookPanel.index('<ScrollArea className="notebookViewport">') < notebookPanel.index(
        "<NotebookCommandBar"
    )
    codeCellStart = notebookPanel.index('data-notebook-cell="code"')
    codeCellBody = notebookPanel.index('className="notebookCellBody"', codeCellStart)
    codeCellOutput = notebookPanel.index("result ? (", codeCellBody)
    codeCellActions = notebookPanel.index("<CellMetaBar", codeCellOutput)
    assert codeCellBody < codeCellOutput < codeCellActions
    for marker in (
        "notebookCellReadingOrder",
        "notebookFooterReadingOrder",
        "notebook document semantics are incomplete",
        "notebook cell reading order is invalid",
        "notebook footer controls precede the document in reading order",
    ):
        assert marker in productGate


def testLongNotebookKeyboardNavigationSharesCodeAndMarkdownBoundaries() -> None:
    notebookPanel = _read("editor/src/components/notebook/notebookPanel.tsx")
    navigation = _read("editor/src/lib/notebookCellNavigation.ts")
    productGate = _read("tests/surface/verifyProductExperiencePlaywright.py")
    webviewGate = _read("tests/product/verifyWebView2ProductSmoke.py")

    for marker in (
        'key: "ArrowUp"',
        'key: "ArrowDown"',
        "view.compositionStarted",
        "completionStatus(view.state)",
        "event.nativeEvent.isComposing",
        "keyCode: event.nativeEvent.keyCode",
        "markdownCompositionRef",
        "markdownCompositionEndedAtRef",
        "shouldSuppressNotebookCellBoundaryDuringComposition",
        "accessibilityAttributesRef.current.reconfigure",
        'aria-label={`${cellAriaLabel} 편집기`}',
        'ariaLabel={`${cellAriaLabel} 코드 편집기`}',
        'ariaLabel={`${cellAriaLabel} 실행 결과`}',
        'label={`${cellLabel} 실행`}',
        'aria-label={`${cellLabel} 작업 더보기`}',
        "markdownEditorRef",
        "onBoundaryNavigate={onMoveCell}",
    ):
        assert marker in notebookPanel
    for marker in (
        "selectionAnchor !== selectionHead",
        'key === "ArrowUp" && selectionHead === 0',
        'key === "ArrowDown" && selectionHead === textLength',
        "NOTEBOOK_IME_BOUNDARY_GUARD_MS = 500",
        "compositionEndedAt",
    ):
        assert marker in navigation
    for marker in (
        "verifyLongNotebookKeyboardNavigation",
        "verifyNotebookCompositionGuards",
        "notebookKeyboardNavigationEvidence",
        "12-cell notebook did not create a long scrollable document",
        "CodeMirror composition triggered cell execution or boundary navigation",
        "Markdown composition triggered boundary navigation or text loss",
        "keyboard navigation did not focus the Markdown textarea",
        "keyboard navigation left the final notebook cell behind controls",
    ):
        assert marker in productGate
    assert productGate.count('"verifyNotebookKeyboardNavigation": True') == 4
    for caseName in (
        '"name": "web-run-compact"',
        '"name": "web-run-mobile"',
        '"name": "web-run-desktop"',
        '"name": "local-run-minimum"',
    ):
        assert caseName in productGate
    for marker in (
        "verify_long_notebook_keyboard_navigation",
        "verify_notebook_composition_guards",
        "verify_native_korean_ime",
        "notebook_accessibility_tree_state",
        "notebook_accessible_name_state",
        '"local-notebook-keyboard-12-cells"',
        '"positionedAccessibleNames"',
        '"accessibilityTreeReadingOrder"',
        '"nativeKoreanIme"',
        '"markdownFocusedUp"',
        '"markdownFocusedDown"',
        '"lastCellUnobscured"',
        "12-cell Code and Markdown keyboard boundary navigation with focus scrolling",
        "Code and Markdown composition-event shortcut guards",
    ):
        assert marker in webviewGate


def testLearningAssessmentRefreshIgnoresUnmountedRequestFailures() -> None:
    curriculumSurface = _read("editor/src/components/curriculum/curriculumSurface.tsx")
    inactiveGuard = curriculumSurface.index("if (!active) return;")
    errorLog = curriculumSurface.index(
        'console.error("learning assessment queue refresh failed", error);'
    )

    assert inactiveGuard < errorLog


def testLocalLearningArchiveReturnsToWebWithoutChangingPortableContent() -> None:
    productGate = _read("tests/surface/verifyProductExperiencePlaywright.py")

    for marker in (
        "verifyLocalArchiveWebRoundTrip",
        "Local-to-Web round trip changed the archive root hash",
        "Local-to-Web round trip changed the evidence event set",
        "Local-to-Web round trip changed portable payload bytes",
        "localArchiveWebRoundTripEvidence",
    ):
        assert marker in productGate


def testReconnectPromptsStayOnSurfacesWhereTheyAreActionable() -> None:
    app = _read("editor/src/App.tsx")
    policy = _read("editor/src/lib/providerReconnectPolicy.ts")
    topBar = _read("editor/src/components/app/topBar.tsx")
    notebookSurface = _read("editor/src/components/app/notebookSurface.tsx")
    nativeGate = _read("tests/product/verifyWebView2ProductSmoke.py")

    assert "reconnectVariantForSurface(surface, reconnect.variant)" in app
    assert "variant={visibleReconnectVariant}" in app
    assert 'surface === "curriculum"' in policy
    assert 'variant === "offline"' in policy
    assert 'surface === "chat" ? variant : null' in policy
    assert 'data-notebook-tools-toggle="true"' in topBar
    assert 'label={notebookToolsOpen ? "노트북 도구 닫기" : "노트북 도구 열기"}' in topBar
    assert "<Settings />" in topBar
    assert "PanelRightOpen" not in topBar
    assert 'data-notebook-tools-panel="desktop"' in notebookSurface
    assert "notebookToolsOpen" in notebookSurface
    assert "visibleProviderReconnectVariants" in nativeGate
    assert '"reconnectPromptClean"' in nativeGate


def testPagesDeploymentVerifiesThePublicWebToInstalledLocalPath() -> None:
    workflow = _read(".github/workflows/pages.yml")
    verifier = _read("tests/product/verifyWebView2ProductSmoke.py")

    for marker in (
        "outputs:",
        "page_url: ${{ steps.deployment.outputs.page_url }}",
        "verify-deployed-web-to-local:",
        "needs: deploy",
        "CODARO_DEPLOYED_WEB_URL: ${{ needs.deploy.outputs.page_url }}",
        "Verify deployed Web to installed Local",
        "deployed-web-to-local-evidence",
    ):
        assert marker in workflow
    assert "capture_deployed_web_learning_archive(playwright)" in verifier
    assert '"deployed-web-to-local-learning-roundtrip"' in verifier
    assert '"deployed-local-reexport-to-web-learning-roundtrip"' in verifier
    assert "public deployed Web edit, strong verification, archive export" in verifier
    evidence_upload = workflow.split("- name: Upload deployed product evidence", 1)[1]
    assert "cargo-target/" not in evidence_upload
    assert "deployed-web-learning-archive.json" in evidence_upload
    assert "deployed-local-reexport-learning-archive.json" in evidence_upload
    assert "screenshots/" in evidence_upload


def testAppDelegatesProductSurfaceSelectionPolicy() -> None:
    app = _read("editor/src/App.tsx")
    selectionHook = _read("editor/src/hooks/useProductSurfaceSelection.ts")

    assert "useProductSurfaceSelection" in app
    assert "DEFAULT_CURRICULUM_CATEGORY" not in app
    assert 'setSurface("automation")' not in app
    assert 'nextSurface === "curriculum"' not in app
    assert "defaultRegistrySelection" in selectionHook
    assert "productLearningCategory" in selectionHook
    assert "categories.some((category) => category.key === selectedCategory)" in selectionHook
    assert 'if (nextSurface === "curriculum")' in selectionHook
    assert 'setSurface("automation")' in selectionHook


def testProductSidebarRendersCentralSurfaceNavOnly() -> None:
    source = _read("editor/src/components/app/productSidebar.tsx")
    flowNav = _read("editor/src/components/app/productFlowNav.tsx")
    mobileNav = _read("editor/src/components/app/productMobileNav.tsx")
    visuals = _read("editor/src/components/app/productSurfaceVisuals.ts")
    curriculumTree = _read("editor/src/components/app/curriculumSidebarTree.tsx")

    assert "ProductFlowNav" in source
    assert "CurriculumSidebarTree" in source
    assert "AutomationSidebarTree" in source
    assert "PRODUCT_SIDEBAR_NAV" not in source
    assert "PRODUCT_SURFACE_NAV" not in source
    assert "allNavItems" not in source
    assert "HIDDEN_SURFACES" not in source
    assert ".filter((item) => item.visibleInSidebar)" not in source
    assert "buildSidebarCurriculumTree" not in source
    assert "CustomCurriculumDeleteDialog" not in curriculumTree
    assert "CustomCurriculumDeleteDialog" in source
    assert 'data-product-learning-data-settings="true"' in source
    assert 'learningMode ? "hidden" : "flex group-data-[collapsible=icon]:mx-auto"' in source
    assert 'appRoot.setAttribute("aria-hidden", "true")' in source
    assert 'appRoot.removeAttribute("aria-hidden")' in source
    assert "LearningArchiveMenu" in source
    assert "surfaceIcons" not in source
    assert "categoryTitle" not in source
    assert "productSidebarFlowItems(runtimeTier)" in flowNav
    assert "productSurfaceIcon(item.value)" in flowNav
    assert "PRODUCT_SURFACE_ICONS" not in flowNav
    assert "productSidebarFlowItems(\"web\")" in mobileNav
    assert "productSurfaceIcon(item.value)" in mobileNav
    assert 'from "@/components/ui/button"' in mobileNav
    assert "<Button" in mobileNav
    assert 'data-product-mobile-nav="true"' in mobileNav
    assert 'data-product-mobile-surface={item.value}' in mobileNav
    assert 'aria-current={active ? "page" : undefined}' in mobileNav
    assert 'surface === "curriculum"' in mobileNav
    assert "keyboardOpen" in mobileNav
    assert "grid-cols-4" in mobileNav
    assert "min-h-12" in mobileNav
    assert "env(safe-area-inset-bottom)" in mobileNav
    assert "focusProductSurface(item.value)" in mobileNav
    assert "requestAnimationFrame" in mobileNav
    assert "PRODUCT_SURFACE_ICONS" in visuals
    assert "Unsupported product navigation surface" in visuals
    assert "PackageOpen" not in flowNav
    assert "share:" not in flowNav
    assert "PRODUCT_SIDEBAR_NAV" not in flowNav
    assert "PRODUCT_SURFACE_NAV" not in flowNav
    assert "flowStep: index + 1" not in flowNav
    assert 'data-product-nav="flow"' in flowNav
    assert 'data-product-flow-hierarchy="runtime-ordered"' in flowNav
    assert 'data-product-nav="utility"' in source
    assert 'data-product-flow-marker="true"' in flowNav
    assert "data-product-flow-role={flowRole}" in flowNav
    assert 'data-product-flow-second-loop={flowRole === "secondLoop" ? "true" : undefined}' in flowNav
    assert "data-product-flow-step={flowStep}" in flowNav
    assert 'flowStep === 1 && "font-medium"' in flowNav
    assert 'flowRole === "secondLoop" && "border-t border-sidebar-border/60 bg-sidebar-accent/20"' in flowNav
    assert source.index("<ProductFlowNav") < source.index('data-product-nav="utility"')
    assert source.index('data-product-nav="utility"') < source.index('tooltip={t("terminal.title")}')


def testAppMountsOneResponsiveProductShellForEveryRouteAlias() -> None:
    app = _read("editor/src/App.tsx")
    main = _read("editor/src/main.tsx")
    mainSurface = _read("editor/src/components/app/mainSurface.tsx")

    assert "<ProductMobileNav" in app
    assert "keyboardOpen={viewportInsets.isKeyboardOpen}" in app
    assert "runtimeTier={runRouteState.runtimeTier}" in app
    assert "surface={surface}" in app
    assert "onSurfaceChange={selectSurface}" in app
    assert "data-active-product-surface={surface}" in app
    assert "data-product-surface-view={props.surface}" in mainSurface
    assert 'data-product-surface-state="ready"' in mainSurface
    assert "data-product-surface-ready={props.surface}" in mainSurface
    assert 'data-product-surface-state="loading"' in mainSurface
    assert "data-product-surface-loading={surface}" in mainSurface
    assert 'role="status"' in mainSurface
    assert 'aria-live="polite"' in mainSurface
    assert "tabIndex={-1}" in mainSurface
    assert "MobileChat" not in main
    assert "<App />" in main


def testProductSidebarKeepsSurfaceTreesInFocusedFiles() -> None:
    productSidebar = _read("editor/src/components/app/productSidebar.tsx")
    curriculumTree = _read("editor/src/components/app/curriculumSidebarTree.tsx")
    automationTree = _read("editor/src/components/app/automationSidebarTree.tsx")
    navigationHook = _read("editor/src/hooks/useCurriculumNavigationState.ts")

    assert "buildSidebarCurriculumTree" in curriculumTree
    assert "CustomCurriculumDeleteDialog" not in curriculumTree
    assert "CustomCurriculumDeleteDialog" in productSidebar
    assert "useSidebarExpansionState" in curriculumTree
    assert "AutomationSidebarTree" in automationTree
    assert "selectedSection: AutomationSection" in automationTree
    assert "PRODUCT_SIDEBAR_NAV" not in curriculumTree
    assert "PRODUCT_SIDEBAR_NAV" not in automationTree
    assert "buildSidebarCurriculumTree" not in productSidebar
    assert 'from "@/lib/customCurricula"' in navigationHook
    assert 'from "@/components/app/curriculumSidebarTree"' not in navigationHook
    assert 'from "@/components/app/productSidebar"' not in navigationHook


def testCustomCurriculumManagementDoesNotHijackTheLearningRoute() -> None:
    navigationHook = _read("editor/src/hooks/useCurriculumNavigationState.ts")
    curriculumTree = _read("editor/src/components/app/curriculumSidebarTree.tsx")
    productSidebar = _read("editor/src/components/app/productSidebar.tsx")
    deleteBody = navigationHook.split(
        "const deleteCustomCurriculum = useCallback",
        maxsplit=1,
    )[1].split("return {", maxsplit=1)[0]

    assert "id === selectedCustomCurriculumId" in deleteBody
    assert 'setSurface("curriculum")' not in deleteBody
    assert "onNavigateCurriculum(" not in deleteBody
    assert "{customItems.length ? (" in curriculumTree
    assert 'data-custom-curriculum-group="true"' in curriculumTree
    assert "curriculumEmpty" not in curriculumTree
    assert "curriculumEmpty" not in productSidebar


def testProductSurfaceCopyMatchesFocusedFlow() -> None:
    locale = _read("editor/src/lib/localeCopy.ts")
    chat = _read("editor/src/components/chat/chatSurface.tsx")
    startExamples = _read("editor/src/lib/chatStartExamples.ts")

    for expected in (
        '"nav.chat": "대화"',
        '"nav.curriculum": "학습"',
        '"nav.editor": "노트북"',
        '"nav.automation": "자동화"',
    ):
        assert expected in locale

    for expected in (
        "검증된 셀과 recipe를 태스크로 키울 때",
        "대화, 학습, 노트북에서 검증한 자동화 셀과 스크립트",
        "채팅에서 반복 작업을 말하고 셀 또는 recipe를 검증하면",
        "기존 레슨을 먼저 찾아 학습 경로를 짜줘",
        "검증된 노트북 셀을 dry-run 자동화 recipe로 정리",
        "Automation stores cells and recipes validated from chat, learning, or notebooks.",
        "First find existing lessons and compose a learning path",
        "Turn validated notebook cells into a dry-run automation recipe",
    ):
        assert expected in locale
    assert "바로 시작할 수 있는 자동화 출발점" not in locale
    assert "Ready-to-use starting points" not in locale
    assert "공유 가능한 자동화 노트북" not in locale
    assert "Turn repeated work into a shareable automation notebook" not in locale
    assert "defaultChatStartExamples(t)" in chat
    assert "chat.example.pandas" not in chat
    assert "chat.example.pandas" in startExamples


def testChatStartExamplesCarryDogfoodFlowMetadata() -> None:
    chat = _read("editor/src/components/chat/chatSurface.tsx")
    mainSurface = _read("editor/src/components/app/mainSurface.tsx")
    currentLearningSurface = _read("editor/src/components/app/currentLearningSurface.tsx")
    startExamples = _read("editor/src/lib/chatStartExamples.ts")

    assert 'surfaceFlowRole, type ProductSurfaceFlowRole, type SurfaceMode' in startExamples
    assert "CHAT_START_EXAMPLE_DEFINITIONS" in startExamples
    assert "translateExampleDefinitions(CHAT_START_EXAMPLE_DEFINITIONS, t)" in startExamples
    assert 'labelKey: "chat.example.pandas", promptKey: "chat.example.pandas.prompt", surface: "curriculum"' in startExamples
    assert 'labelKey: "chat.example.browser", promptKey: "chat.example.browser.prompt", surface: "curriculum"' in startExamples
    assert 'labelKey: "chat.example.automation", promptKey: "chat.example.automation.prompt", surface: "automation"' in startExamples
    assert startExamples.index('"chat.example.pandas"') < startExamples.index('"chat.example.automation"')
    assert "flowRole: surfaceFlowRole(example.surface)" in startExamples
    assert 'flowRole: "secondLoop"' not in startExamples
    assert "CurrentLearningSurface" in mainSurface
    assert 'data-curriculum-loading="true"' in currentLearningSurface
    assert "ChatSurface" not in currentLearningSurface
    assert "curriculumGoalExamples" not in currentLearningSurface
    assert 'data-chat-start-example="true"' in chat
    assert "data-chat-start-flow-role={example.flowRole}" in chat
    assert 'data-chat-start-second-loop={example.flowRole === "secondLoop" ? "true" : undefined}' in chat
    assert "data-chat-start-surface={example.surface}" in chat


def testAutomationSurfaceFramesAutomationAsSecondLoop() -> None:
    source = _read("editor/src/components/automation/automationSurface.tsx")
    operationStrip = _read("editor/src/components/automation/automationOperationStrip.tsx")
    runInspector = _read("editor/src/components/automation/automationRunInspector.tsx")

    assert 'data-automation-loop="second-loop"' in source
    assert 'data-automation-source="validated-cell-recipe"' in source
    assert 'data-automation-artifact="validated-cell-recipe"' in source
    assert 'data-automation-studio-layout="true"' in source
    assert "data-automation-task-selector={task.id}" in source
    assert "data-automation-task-detail={task.id}" in source
    assert "md:grid-cols-[minmax(220px,280px)_minmax(0,1fr)]" in source
    assert "xl:grid-cols-[280px_minmax(380px,1fr)_360px]" in source
    assert '<AutomationOperationStrip' in source
    assert 'className="flex min-h-12 min-w-0 flex-wrap items-start gap-3 pl-9"' in source
    assert '<AutomationRunInspector' in source
    assert "automation.codaro.description" in source
    assert "automation.custom.description" in source
    assert "automation.empty.detail" in source
    assert "data-runtime-availability={" in source
    assert 'data-runtime-requirement-label={template.runtime}' in source
    assert 't("automation.template.localRequired")' in source
    assert '@/components/ui/card' not in source

    assert 'data-automation-operation-strip="true"' in operationStrip
    assert 'data-automation-estop-control="true"' in operationStrip
    assert "onClick={onToggleEStop}" in operationStrip
    assert "bg-background" in operationStrip
    assert "min-h-14" in operationStrip
    assert "backdrop-blur" not in operationStrip
    assert '@/components/ui/card' not in operationStrip

    assert 'data-automation-run-inspector="true"' in runInspector
    assert 'data-automation-task-enabled="true"' in runInspector
    assert 'data-automation-run-command="true"' in runInspector
    assert 'data-automation-run-stream={kind}' in runInspector
    assert 'kind="stdout"' in runInspector
    assert 'kind="stderr"' in runInspector
    assert "POST /api/tasks/{encodeURIComponent(task.id)}/run" in runInspector
    assert '@/components/ui/card' not in runInspector


def testRunLocalStateBrowserOwnsCompactAndExecutionStateEvidence() -> None:
    verifier = _read("tests/surface/verifyProductExperiencePlaywright.py")
    wrapper = _read("tests/surface/verifyRunLocalStatePlaywright.py")

    assert '"name": "web-automation-compact"' in verifier
    assert '"name": "web-run-compact"' in verifier
    assert '"viewport": {"width": 320, "height": 720}' in verifier
    assert '"verifyNotebookExecutionStates": True' in verifier
    assert '"expectMinimalNotebook": True' in verifier
    assert '"expectLocalRequiredTemplates": True' in verifier
    assert '"expectAvailableLocalTemplates": True' in verifier
    assert "[data-product-surface-state='ready']" in verifier
    assert 'audit["activeProductSurfaceState"] != "ready"' in verifier
    assert 'selectedCase == "run-local-state"' in verifier
    assert "verifyNotebookExecutionStates(" in verifier
    assert 'STATE_CASES = {"web-run-desktop", "local-run-minimum"}' in wrapper
    assert '"statusSequence": ["running", "success", "running", "error"]' in verifier
    assert '"CODARO_PRODUCT_CASE"] = "run-local-state"' in wrapper
    assert '"CODARO_PRODUCT_GATE"] = "run-local-state-browser"' in wrapper


def testProductProofCaptureWaitsForFontsAndPinsNotebookFocus() -> None:
    verifier = _read("tests/surface/verifyProductExperiencePlaywright.py")
    workCell = _read("editor/src/components/app/workCell.css")

    assert "document.fonts ? document.fonts.ready : Promise.resolve()" in verifier
    assert "'[data-notebook-cell-selected=\"true\"] .cm-content'" in verifier
    assert "selectedNotebookEditor.focus()" in verifier
    assert "requestAnimationFrame(resolve)" in verifier
    assert 'animations="disabled"' in verifier
    assert 'caret="hide"' in verifier
    assert '"proofLayoutEvidence": proofLayoutEvidence' in verifier
    assert "automationStudio: rectFor" in verifier
    selectedFrameRule = workCell.split(
        '[data-astryx-theme="codaro"] .astryxWorkCell[data-work-cell-running="true"]'
    )[0].rsplit("{", 1)[-1]
    assert "border-color: var(--color-accent);" in selectedFrameRule
    assert "box-shadow" not in selectedFrameRule


def testVisualAccessibilityFocusAuditWaitsForWebkitActiveElement() -> None:
    verifier = _read("tests/surface/verifyVisualAccessibilityPlaywright.py")

    assert "for _ in range(2):" in verifier
    assert "target.focus()" in verifier
    assert "requestAnimationFrame(resolve)" in verifier
    assert 'if active.get("marker") == marker:' in verifier


def testProductSurfaceDocsNameTheSameFlow() -> None:
    skillsReadme = _read("docs/skills/README.md")
    frontendDoc = _read("docs/skills/architecture/frontend-product-surface.md")
    dogfoodDoc = _read("docs/skills/ops/product/dogfood-alpha.md")
    identityDoc = _read("docs/skills/identity/multi-editor-modes.md")
    ssotMap = _read("docs/skills/architecture/ssot-map.md")

    assert "대화, 학습, 노트북, 자동화" in skillsReadme
    assert "기존 커리큘럼 추천·조합" in skillsReadme
    assert "자동화는 검증된 스크립트를 태스크로 예약 실행" in skillsReadme
    assert "`학습 → 노트북 → 자동화 → 대화`" in frontendDoc
    assert "`PRODUCT_SURFACE_NAV`" in frontendDoc
    assert "`entry`/`learning`/`notebook`/`secondLoop`/`support`" in frontendDoc
    assert "`editor/src/lib/teacherScope.ts`" in frontendDoc
    assert "`editor/src/lib/chatStartExamples.ts`" in ssotMap
    assert "`학습 → 노트북 → 자동화 → 대화`" in dogfoodDoc
    assert "`학습 → 노트북 → 자동화 → 대화`" in identityDoc
    assert "`학습 → 노트북 → 자동화 → 대화` 사이드바 순서" in ssotMap
    assert "`editor/src/lib/teacherScope.ts`" in ssotMap


def testProductSurfaceDocsCarryConvergenceAssessmentAndRiskControls() -> None:
    frontendDoc = _read("docs/skills/architecture/frontend-product-surface.md")

    for heading in (
        "## 현재 구조 평가",
        "## 목표 구조와 영향 파일",
        "## 덕지덕지 위험과 제거 기준",
    ):
        assert heading in frontendDoc

    for expected in (
        "`editor/src/components/app/mainSurface.tsx`",
        "표면 선택과 큰 레이아웃 조립",
        "`editor/src/components/app/notebookSurface.tsx`",
        "노트북 표면 조립",
        "`editor/src/components/app/currentLearningSurface.tsx`",
        "학습 표면 조립",
        "`editor/src/components/chat/chatSurface.tsx`",
        "`editor/src/hooks/useProductSurfaceSelection.ts`",
        "학습 재진입",
        "`editor/src/lib/assistantArtifactRouting.ts`",
        "`editor/src/lib/assistantResponsePlan.ts`",
        "`editor/src/lib/pendingChanges.ts`",
        "`editor/src/lib/chatStartExamples.ts`",
        "target surface/flow role",
        "application payload",
        "`editor/src/lib/customCurricula.ts`",
        "`saveAndOpenCustomCurriculum`",
        "`editor/src/components/curriculum/curriculumDependencyPanel.tsx`",
        "필요한 패키지명, 준비 진행, 한 번의 준비·재시도 동작",
        "`editor/src/components/app/curriculumSidebarTree.tsx`",
        "`editor/src/components/app/automationSidebarTree.tsx`",
        "`tests/surface/testProductSurfaceContract.py`",
        "`tests/product/verifyDogfoodAlphaAudit.py`",
        "`PRODUCT_SURFACE_NAV`",
        "`PRODUCT_SIDEBAR_NAV`",
        "`PRODUCT_SIDEBAR_FLOW_ITEMS`",
        "primary route",
        "second loop",
        "호환 레이어",
    ):
        assert expected in frontendDoc


def testMainAndChatSurfacesDoNotAbsorbRoutingOrTreeInternals() -> None:
    mainSurface = _read("editor/src/components/app/mainSurface.tsx")
    chatSurface = _read("editor/src/components/chat/chatSurface.tsx")
    currentLearningSurface = _read("editor/src/components/app/currentLearningSurface.tsx")
    notebookSurface = _read("editor/src/components/app/notebookSurface.tsx")

    for forbidden in (
        "CUSTOM_CURRICULUM_CATEGORY",
        "CurriculumCellToc",
        "CurriculumView",
        "CodeCellEditor",
        "NotebookPanel",
        "TeacherPanel",
        "curriculumGoalExamples",
        "selectedCategoryLabel",
        "selectedContentLabel",
        "routeAssistantArtifacts",
        "buildAssistantResponseApplication",
        "buildAssistantResponsePlan",
        "buildAcceptPendingChangesApplication",
        "buildRejectPendingChangesApplication",
        "pendingTargetForAssistantArtifacts",
        "surfaceForAssistantArtifacts",
    ):
        assert forbidden not in mainSurface

    for expected in (
        "CUSTOM_CURRICULUM_CATEGORY",
        "CurriculumCellToc",
        "CurriculumView",
        "CodeCellEditor",
        "selectedCategoryLabel",
        "selectedContentLabel",
    ):
        assert expected in currentLearningSurface

    assert "curriculumGoalExamples" not in currentLearningSurface
    assert 'data-curriculum-loading="true"' in currentLearningSurface

    for expected in (
        "NotebookPanel",
        "TeacherPanel",
        "absolute inset-y-0 right-0",
        "w-[380px]",
        "onRunNotebook",
        "onAddCell",
    ):
        assert expected in notebookSurface

    for forbidden in (
        "curriculumSidebarTree",
        "automationSidebarTree",
        "CurriculumSidebarTree",
        "AutomationSidebarTree",
        "CurriculumDependencyPanel",
        "curriculumPackagePreparation",
        "learningContract",
        "sectionContract",
        "Yaml",
        "YAML",
    ):
        assert forbidden not in chatSurface


def testFrontendStateAndComponentBoundariesStayLayered() -> None:
    directApiFailures: list[str] = []
    directApiTokens = (
        'from "@/lib/api"',
        "from '@/lib/api'",
        "codaroApi",
        "requestJson",
        "postJson",
        "fetch(",
    )
    for path in _editorFiles("components", "hooks"):
        source = path.read_text(encoding="utf-8")
        for token in directApiTokens:
            if token in source:
                directApiFailures.append(f"{_rel(path)} imports or calls API boundary token {token!r}")

    componentImportFailures: list[str] = []
    componentImportPattern = re.compile(r'from\s+["\']@/components/')
    for path in _editorFiles("lib", "hooks"):
        source = path.read_text(encoding="utf-8")
        if componentImportPattern.search(source):
            componentImportFailures.append(f"{_rel(path)} imports component implementation")

    assert not directApiFailures
    assert not componentImportFailures


def testAssistantArtifactsRouteToLearningOrNotebookBeforeAutomation() -> None:
    routing = _read("editor/src/lib/assistantArtifactRouting.ts")
    responsePlan = _read("editor/src/lib/assistantResponsePlan.ts")
    pendingChanges = _read("editor/src/lib/pendingChanges.ts")

    assert 'activeScope === "automation"' in responsePlan
    assert "plan.pendingBlocks = buildLocalBlocksFromPrompt(message, activeScope)" in responsePlan
    assert "buildAssistantArtifactApplication(plan)" in responsePlan
    assert "export type AssistantResponseApplication = AssistantArtifactApplication" in responsePlan
    assert "export type AssistantArtifactApplication" in routing
    assert "export function buildAssistantArtifactApplication" in routing
    assert "pendingTargetForAssistantArtifacts(input)" in routing
    assert "surfaceForAssistantArtifacts(input)" in routing
    assert 'return input.pendingBlocks.length > 0 ? "notebook" : null' in routing
    assert 'if (input.curriculumToSave) return "curriculum"' in routing
    assert 'if (input.documentToApply || input.pendingBlocks.length > 0) return "editor"' in routing
    assert "surfaceForAcceptedPendingTarget(pendingTarget)" in pendingChanges
    assert 'return target === "curriculum" ? "curriculum" : "editor"' in routing
    assert "clearPendingBlocks ? \"notebook\"" not in routing
    assert 'surfaceToOpen: "automation"' not in responsePlan
    assert 'surfaceToOpen: "automation"' not in routing
    assert '"automation"' not in pendingChanges
