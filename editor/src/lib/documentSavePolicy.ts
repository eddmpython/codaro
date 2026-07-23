import type { CodaroDocument } from "@/types";

export const DOCUMENT_SAVE_KEEPALIVE_MAX_BYTES = 60 * 1024;

export type DocumentSaveOptions = {
  keepalive?: boolean;
  saveDocumentId?: string;
  saveRevision?: number;
  saveSessionId?: string;
};

export type DocumentSaveRequest = {
  path: string | null;
  document: CodaroDocument;
  saveDocumentId?: string;
  saveRevision?: number;
  saveSessionId?: string;
};

export function createDocumentSaveRequest(
  path: string | null,
  document: CodaroDocument,
  options: DocumentSaveOptions,
): DocumentSaveRequest {
  return {
    path,
    document,
    saveDocumentId: options.saveDocumentId,
    saveRevision: options.saveRevision,
    saveSessionId: options.saveSessionId,
  };
}

export function documentSaveSupportsKeepalive(
  path: string | null,
  document: CodaroDocument,
  options: DocumentSaveOptions = {},
): boolean {
  const request = createDocumentSaveRequest(path, document, options);
  return new TextEncoder().encode(JSON.stringify(request)).byteLength
    <= DOCUMENT_SAVE_KEEPALIVE_MAX_BYTES;
}
