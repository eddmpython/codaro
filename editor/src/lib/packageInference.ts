import type { CodaroDocument } from "@/types";
import { isPythonStdlibModule, isPythonStdlibPackageName } from "@/lib/pythonStdlib";

const PACKAGE_ALIASES: Record<string, string> = {
  PIL: "pillow",
  bs4: "beautifulsoup4",
  cv2: "opencv-python",
  dateutil: "python-dateutil",
  docx: "python-docx",
  dotenv: "python-dotenv",
  easyocr: "easyocr",
  fitz: "pymupdf",
  imagehash: "imagehash",
  magic: "python-magic",
  matplotlib: "matplotlib",
  mpl_toolkits: "matplotlib",
  mss: "mss",
  numpy: "numpy",
  pandas: "pandas",
  pydantic_settings: "pydantic-settings",
  pytesseract: "pytesseract",
  sklearn: "scikit-learn",
  skimage: "scikit-image",
  win32api: "pywin32",
  win32com: "pywin32",
  yaml: "pyyaml",
  torch: "torch",
  torchvision: "torchvision",
};

const PACKAGE_NAME_ALIASES: Record<string, string> = {
  bs4: "beautifulsoup4",
  cv2: "opencv-python",
  docx: "python-docx",
  pil: "pillow",
  pillow: "pillow",
  skimage: "scikit-image",
  sklearn: "scikit-learn",
  yaml: "pyyaml",
};

const PACKAGE_PROVIDER_EQUIVALENTS: Record<string, string[]> = {
  "opencv-contrib-python": ["opencv-python"],
};

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
  const packages = new Set<string>(declaredDocumentPackages(document));
  for (const block of document.blocks) {
    if (block.type !== "code") continue;
    for (const packageName of inferCodePackages(block.content)) {
      if (!packageSetCoversPackage(packages, packageName)) packages.add(packageName);
    }
  }
  return sortedPackages(packages);
}

export function declaredDocumentPackages(document: CodaroDocument) {
  return sortedPackages((document.runtime?.packages ?? []).map(String).map(installablePackageName).filter(Boolean));
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
  if (!normalized || isPythonStdlibModule(normalized)) return "";
  return PACKAGE_ALIASES[normalized] ?? normalized;
}

export function installablePackageName(packageName: string) {
  const normalized = packageName.trim();
  if (!normalized || isPythonStdlibPackageName(normalized)) return "";
  return PACKAGE_NAME_ALIASES[normalizePackageName(normalized)] ?? normalized;
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

function packageSetCoversPackage(packages: Set<string>, packageName: string) {
  const target = normalizePackageName(packageName);
  for (const existing of packages) {
    const normalizedExisting = normalizePackageName(existing);
    if (normalizedExisting === target) return true;
    if ((PACKAGE_PROVIDER_EQUIVALENTS[normalizedExisting] ?? []).includes(target)) return true;
  }
  return false;
}
