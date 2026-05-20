import type { CodaroDocument } from "@/types";

const PACKAGE_ALIASES: Record<string, string> = {
  PIL: "pillow",
  cv2: "opencv-python",
  matplotlib: "matplotlib",
  numpy: "numpy",
  pandas: "pandas",
  sklearn: "scikit-learn",
  yaml: "pyyaml",
};

const PYTHON_STDLIB_MODULES = new Set([
  "__future__",
  "argparse",
  "asyncio",
  "base64",
  "collections",
  "contextlib",
  "csv",
  "dataclasses",
  "datetime",
  "decimal",
  "functools",
  "glob",
  "itertools",
  "json",
  "math",
  "os",
  "pathlib",
  "random",
  "re",
  "statistics",
  "string",
  "subprocess",
  "sys",
  "textwrap",
  "time",
  "typing",
  "urllib",
  "uuid",
]);

const KEYWORD_PACKAGES: Record<string, string> = {
  pandas: "pandas",
  dataframe: "pandas",
  csv: "pandas",
  numpy: "numpy",
  matplotlib: "matplotlib",
  plotly: "plotly",
  altair: "altair",
  browser: "playwright",
  "브라우저": "playwright",
  selenium: "selenium",
  requests: "requests",
};

export function inferAssistantPackages(message: string, document: CodaroDocument) {
  const packages = new Set(inferDocumentPackages(document));
  const normalized = message.toLowerCase();
  for (const [keyword, packageName] of Object.entries(KEYWORD_PACKAGES)) {
    if (normalized.includes(keyword)) packages.add(packageName);
  }
  return sortedPackages(packages);
}

export function inferDocumentPackages(document: CodaroDocument) {
  const packages = new Set<string>((document.runtime?.packages ?? []).map(String).filter(Boolean));
  for (const block of document.blocks) {
    if (block.type !== "code") continue;
    for (const packageName of inferCodePackages(block.content)) {
      packages.add(packageName);
    }
  }
  return sortedPackages(packages);
}

export function inferCodePackages(code: string) {
  const packages = new Set<string>();
  for (const match of code.matchAll(/^\s*(?:import|from)\s+([A-Za-z_][\w.]*)/gm)) {
    const packageName = importPackageName(match[1]?.split(".")[0] ?? "");
    if (packageName) packages.add(packageName);
  }
  return sortedPackages(packages);
}

export function importPackageName(moduleName: string) {
  const normalized = moduleName.trim();
  if (!normalized || PYTHON_STDLIB_MODULES.has(normalized)) return "";
  return PACKAGE_ALIASES[normalized] ?? normalized;
}

export function normalizePackageName(value: string) {
  const packageName = value.trim().match(/^[A-Za-z0-9_.-]+/)?.[0] ?? value.trim();
  return packageName.toLowerCase().replace(/_/g, "-");
}

function sortedPackages(packages: Iterable<string>) {
  return Array.from(new Set(Array.from(packages).map(String).filter(Boolean))).sort((left, right) =>
    left.localeCompare(right),
  );
}
