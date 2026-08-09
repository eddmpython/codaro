import { normalizeDocumentPayload } from "@/lib/documentModel";
import type { PublicationManifest } from "@/lib/generatedContracts/publicationManifest";
import type { CodaroDocument } from "@/types";

export type LoadedStaticPublication = {
  baseUrl: URL;
  document: CodaroDocument;
  manifest: PublicationManifest;
};

let publicationPromise: Promise<LoadedStaticPublication | null> | null = null;

export function staticPublicationManifestUrl(): URL | null {
  if (typeof document === "undefined") return null;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="codaro-static-publication"]');
  if (!meta?.content.trim()) return null;
  return new URL(meta.content, document.baseURI);
}

export function publicationAssetUrl(path: string): URL {
  const manifestUrl = staticPublicationManifestUrl();
  const base = manifestUrl
    ? new URL("./", manifestUrl)
    : new URL(import.meta.env.BASE_URL || "/", window.location.origin);
  return new URL(path.replace(/^\.\//, ""), base);
}

export async function loadStaticPublication(): Promise<LoadedStaticPublication | null> {
  const manifestUrl = staticPublicationManifestUrl();
  if (!manifestUrl) return null;
  if (!publicationPromise) publicationPromise = loadFromManifest(manifestUrl);
  return publicationPromise;
}

async function loadFromManifest(manifestUrl: URL): Promise<LoadedStaticPublication> {
  const response = await fetch(manifestUrl, { cache: "no-store", credentials: "same-origin" });
  if (!response.ok) throw new Error(`정적 publication manifest를 읽을 수 없습니다: ${response.status}`);
  const raw = await response.json();
  const manifest = parseManifest(raw);
  const unsigned = { ...manifest } as Record<string, unknown>;
  delete unsigned.manifestHash;
  const actualManifestHash = await contentHash(new TextEncoder().encode(stableStringify(unsigned)));
  if (actualManifestHash !== manifest.manifestHash) {
    throw new Error("정적 publication manifest hash가 일치하지 않습니다.");
  }

  const baseUrl = new URL("./", manifestUrl);
  const documentFile = manifest.files.find((item) => item.path === manifest.documentPath && item.role === "document");
  if (!documentFile) throw new Error("정적 publication 문서 파일 계약이 없습니다.");
  const documentBytes = await fetchVerifiedBytes(new URL(manifest.documentPath, baseUrl), documentFile.contentHash);
  const rawDocument = JSON.parse(new TextDecoder().decode(documentBytes));
  const normalized = normalizeDocumentPayload(rawDocument, { fallbackIdPrefix: "publication" });
  if (!normalized) throw new Error("정적 publication 문서 형식이 잘못됐습니다.");
  return { baseUrl, document: normalized, manifest };
}

export async function fetchVerifiedPublicationFile(
  publication: LoadedStaticPublication,
  path: string,
): Promise<Uint8Array> {
  const file = publication.manifest.files.find((item) => item.path === path);
  if (!file) throw new Error(`publication 파일 계약이 없습니다: ${path}`);
  return fetchVerifiedBytes(new URL(path, publication.baseUrl), file.contentHash);
}

function parseManifest(raw: unknown): PublicationManifest {
  if (!isRecord(raw) || raw.schemaVersion !== 1 || raw.target !== "browser") {
    throw new Error("지원하지 않는 정적 publication manifest입니다.");
  }
  const requiredStrings = [
    "compilerManifestHash",
    "sourceRevisionHash",
    "documentPath",
    "manifestHash",
  ] as const;
  if (requiredStrings.some((key) => typeof raw[key] !== "string")) {
    throw new Error("정적 publication manifest 필드가 잘못됐습니다.");
  }
  if (!Array.isArray(raw.entryBlockIds) || !Array.isArray(raw.files)
      || !Array.isArray(raw.dataAssets) || !Array.isArray(raw.packageAssets)
      || !isRecord(raw.runtime)) {
    throw new Error("정적 publication manifest 목록이 잘못됐습니다.");
  }
  const manifest = raw as unknown as PublicationManifest;
  for (const path of [
    manifest.documentPath,
    manifest.runtime.pythonIndexPath,
    manifest.runtime.pythonIntegrityPath,
    manifest.runtime.pyprocIntegrityPath,
    ...manifest.files.map((item) => item.path),
    ...manifest.dataAssets.flatMap((item) => [item.sourcePath, item.bundlePath]),
    ...manifest.packageAssets.map((item) => item.bundlePath),
  ]) {
    if (!safeRelativePath(path)) throw new Error(`안전하지 않은 publication 경로입니다: ${path}`);
  }
  return manifest;
}

async function fetchVerifiedBytes(url: URL, expected: string): Promise<Uint8Array> {
  const response = await fetch(url, { cache: "no-store", credentials: "same-origin" });
  if (!response.ok) throw new Error(`publication 파일을 읽을 수 없습니다: ${url.pathname}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const actual = await contentHash(bytes);
  if (actual !== expected) throw new Error(`publication 파일 hash가 일치하지 않습니다: ${url.pathname}`);
  return bytes;
}

async function contentHash(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", Uint8Array.from(bytes).buffer);
  return `sha256-${Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (isRecord(value)) {
    const pairs = Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`);
    return `{${pairs.join(",")}}`;
  }
  return JSON.stringify(value);
}

function safeRelativePath(value: unknown): value is string {
  return typeof value === "string"
    && value.length > 0
    && !value.startsWith("/")
    && !/^[A-Za-z]:/.test(value)
    && !value.split("/").includes("..");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
