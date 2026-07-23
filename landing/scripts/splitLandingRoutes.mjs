import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

const landingRoot = resolve(import.meta.dirname, "..");
const appPath = resolve(landingRoot, "src/App.jsx");
const routeRoot = resolve(landingRoot, "src/routes");
const write = process.argv.includes("--write");

function checkSplit() {
  const app = readFileSync(appPath, "utf8");
  const required = [
    "components/publicShell.jsx",
    "lib/publicRouting.js",
    "routes/resolvePublicRoute.jsx",
    "routes/docsRoutes.jsx",
    "routes/blogRoutes.jsx",
    "routes/searchRoutes.jsx",
    "routes/toolRoutes.jsx",
    "routes/packRoutes.jsx",
    "routes/routePrimitives.jsx",
  ];
  for (const relativePath of required) readFileSync(resolve(landingRoot, `src/${relativePath}`), "utf8");
  if (app.trimEnd().split(/\r?\n/).length > 150) throw new Error("App.jsx regained route or public-shell ownership");
  if (!app.includes('from "./routes/resolvePublicRoute.jsx"')) throw new Error("App.jsx is missing route resolver boundary");
  console.log("ok: landing shell and route domains remain split");
}

if (!write) {
  checkSplit();
  process.exit(0);
}

const source = readFileSync(appPath, "utf8");
const tree = ts.createSourceFile(appPath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JSX);
const declarations = new Map();
for (const node of tree.statements) {
  if (ts.isFunctionDeclaration(node) && node.name) declarations.set(node.name.text, node);
  if (ts.isVariableStatement(node)) {
    for (const declaration of node.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name)) declarations.set(declaration.name.text, node);
    }
  }
}
if (!declarations.has("resolveRoute")) {
  checkSplit();
  process.exit(0);
}

function nodeText(name, exported = false) {
  const node = declarations.get(name);
  if (!node) throw new Error(`missing declaration: ${name}`);
  const text = node.getText(tree);
  return exported && !text.startsWith("export ") ? `export ${text}` : text;
}

function moduleText(imports, names, exportedNames = new Set(), transform = (value) => value) {
  const body = names.map((name) => nodeText(name, exportedNames.has(name))).join("\n\n");
  return `${imports.trim()}\n\n${transform(body)}\n`;
}

mkdirSync(routeRoot, { recursive: true });
writeFileSync(
  resolve(landingRoot, "src/lib/publicRouting.js"),
  moduleText(
    'import { brand, basePath } from "./brand.js";',
    ["appPath", "stripBase", "normalizePath", "getBrowserPath", "designSurfaceForPath", "legacyRedirect"],
    new Set(["appPath", "stripBase", "normalizePath", "getBrowserPath", "designSurfaceForPath", "legacyRedirect"]),
  ),
  "utf8",
);
writeFileSync(
  resolve(landingRoot, "src/components/publicShell.jsx"),
  moduleText(
    `import { Download, Monitor, Moon, Sun } from "lucide-react";\nimport { brand } from "../lib/brand.js";\nimport { appPath } from "../lib/publicRouting.js";`,
    ["GithubIcon", "YoutubeIcon", "ThreadsIcon", "CoffeeIcon", "externalLinks", "Header", "Footer"],
    new Set(["Header", "Footer"]),
  ),
  "utf8",
);
writeFileSync(
  resolve(routeRoot, "routePrimitives.jsx"),
  moduleText(
    `import { ArrowRight } from "lucide-react";\nimport { appPath } from "../lib/publicRouting.js";`,
    ["PageHeader", "HTMLContent", "NotFoundPage"],
    new Set(["PageHeader", "HTMLContent", "NotFoundPage"]),
  ),
  "utf8",
);
writeFileSync(
  resolve(routeRoot, "packRoutes.jsx"),
  moduleText(
    `import { Download, PackageOpen } from "lucide-react";\nimport { sharePacks } from "../lib/sharePacks.js";\nimport { PageHeader } from "./routePrimitives.jsx";`,
    ["packsRoute", "PacksPage"],
    new Set(["packsRoute"]),
  ),
  "utf8",
);
writeFileSync(
  resolve(routeRoot, "docsRoutes.jsx"),
  moduleText(
    `import { useEffect, useState } from "react";\nimport { docsPages } from "../lib/generated/docsNav.js";\nimport { appPath } from "../lib/publicRouting.js";\nimport { HTMLContent, NotFoundPage, PageHeader } from "./routePrimitives.jsx";`,
    ["docsModules", "groupBy", "docsIndexRoute", "DocsIndexPage", "docsPageRoute", "DocsPage"],
    new Set(["docsIndexRoute", "docsPageRoute"]),
    (value) => value
      .replaceAll('"./lib/generated/docsPages/*.js"', '"../lib/generated/docsPages/*.js"')
      .replaceAll('`./lib/generated/docsPages/${page.contentModule}.js`', '`../lib/generated/docsPages/${page.contentModule}.js`'),
  ),
  "utf8",
);
writeFileSync(
  resolve(routeRoot, "blogRoutes.jsx"),
  moduleText(
    `import { ArrowRight } from "lucide-react";\nimport { posts, postCategories, postSeries } from "../lib/generated/posts.js";\nimport { appPath } from "../lib/publicRouting.js";\nimport { HTMLContent, NotFoundPage, PageHeader } from "./routePrimitives.jsx";`,
    ["blogIndexRoute", "BlogIndexPage", "blogCategoryRoute", "blogSeriesRoute", "blogPostRoute", "BlogPostPage", "FeaturedPost", "TaxonomyBar", "PostGrid"],
    new Set(["blogIndexRoute", "blogCategoryRoute", "blogSeriesRoute", "blogPostRoute"]),
  ),
  "utf8",
);
writeFileSync(
  resolve(routeRoot, "searchRoutes.jsx"),
  moduleText(
    `import { useEffect, useState } from "react";\nimport { Search } from "lucide-react";\nimport { appPath } from "../lib/publicRouting.js";\nimport { PageHeader } from "./routePrimitives.jsx";`,
    ["searchRoute", "SearchPage"],
    new Set(["searchRoute"]),
    (value) => value.replaceAll('import("./lib/generated/searchIndex.js")', 'import("../lib/generated/searchIndex.js")'),
  ),
  "utf8",
);
writeFileSync(
  resolve(routeRoot, "toolRoutes.jsx"),
  moduleText(
    `import { Boxes } from "lucide-react";\nimport { tools } from "../lib/tools/registry.js";\nimport { appPath } from "../lib/publicRouting.js";\nimport { NotFoundPage, PageHeader } from "./routePrimitives.jsx";`,
    ["groupBy", "toolsRoute", "ToolsPage", "toolRoute", "ToolDetailPage"],
    new Set(["toolsRoute", "toolRoute"]),
  ),
  "utf8",
);
writeFileSync(
  resolve(routeRoot, "resolvePublicRoute.jsx"),
  moduleText(
    `import { HomePage } from "../pages/home.jsx";\nimport { LearnPage } from "../pages/learn.jsx";\nimport { blogCategoryRoute, blogIndexRoute, blogPostRoute, blogSeriesRoute } from "./blogRoutes.jsx";\nimport { docsIndexRoute, docsPageRoute } from "./docsRoutes.jsx";\nimport { packsRoute } from "./packRoutes.jsx";\nimport { NotFoundPage } from "./routePrimitives.jsx";\nimport { searchRoute } from "./searchRoutes.jsx";\nimport { toolRoute, toolsRoute } from "./toolRoutes.jsx";`,
    ["resolveRoute"],
    new Set(["resolveRoute"]),
  ),
  "utf8",
);

const app = `import { useEffect, useMemo, useState } from "react";\nimport { Footer, Header } from "./components/publicShell.jsx";\nimport { useCodaroTheme } from "./components/codaroThemeProvider.jsx";\nimport { brand, basePath } from "./lib/brand.js";\nimport { appPath, designSurfaceForPath, getBrowserPath, legacyRedirect } from "./lib/publicRouting.js";\nimport { resolveRoute } from "./routes/resolvePublicRoute.jsx";\n\n${nodeText("updateMeta")}\n\n${nodeText("setMeta")}\n\n${nodeText("setProperty")}\n\n${nodeText("setLink")}\n\n${nodeText("App")}\n\nexport default App;\n`;
writeFileSync(appPath, app, "utf8");
console.log("ok: split landing App into shell, routing, docs, blog, search, tools, and pack modules");
