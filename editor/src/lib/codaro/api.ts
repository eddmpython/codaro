import { apiUrl } from "./basePath";
import type { BootstrapInfo, CodaroDocument, WorkspaceIndex } from "./types";

async function parseJson<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>;
  }
  let message = fallbackMessage;
  try {
    const payload = await response.json();
    if (payload?.detail) {
      message = payload.detail;
    }
  } catch {
    message = fallbackMessage;
  }
  throw new Error(message);
}

export async function getBootstrap(): Promise<BootstrapInfo> {
  const response = await fetch(apiUrl("/api/bootstrap"));
  return parseJson<BootstrapInfo>(response, "Failed to load bootstrap.");
}

export async function getWorkspaceIndex(): Promise<WorkspaceIndex> {
  const response = await fetch(apiUrl("/api/workspace/index"));
  return parseJson<WorkspaceIndex>(response, "Failed to load workspace index.");
}

export async function loadDocumentAtPath(path: string): Promise<{ path: string; document: CodaroDocument; exists: boolean }> {
  const response = await fetch(apiUrl("/api/document/load"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path })
  });
  return parseJson(response, "Failed to load document.");
}

export async function saveDocumentAtPath(path: string, document: CodaroDocument): Promise<{ path: string }> {
  const response = await fetch(apiUrl("/api/document/save"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, document })
  });
  return parseJson(response, "Failed to save document.");
}

export async function exportDocumentAtPath(path: string, format: string, outputPath: string): Promise<{ outputPath: string }> {
  const response = await fetch(apiUrl("/api/document/export"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, format, outputPath })
  });
  return parseJson(response, "Failed to export document.");
}

export async function listPackages(): Promise<{ name: string; version: string }[]> {
  const response = await fetch(apiUrl("/api/packages/list"));
  return parseJson(response, "Failed to list packages.");
}
