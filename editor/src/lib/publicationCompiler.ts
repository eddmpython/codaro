import { codaroApi } from "@/lib/api";
import type { PublicationCompilationReport } from "@/lib/api/publicationApi";
import { materializeDrafts } from "@/lib/documentModel";
import type { CodaroDocument } from "@/types";

export type PublicationInspector = (
  document: CodaroDocument,
  drafts: Record<string, string>,
  sourcePath: string | null,
) => Promise<PublicationCompilationReport>;

export const inspectPublicationDraft: PublicationInspector = (document, drafts, sourcePath) =>
  codaroApi.inspectPublication(materializeDrafts(document, drafts), sourcePath);

export type { PublicationCompilationReport };
