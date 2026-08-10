import { publicationApi } from "@/lib/api/publicationApi";

export type {
  PublicationDeploymentTarget,
  PublicationJob,
  PublicationTarget,
} from "@/lib/api/publicationApi";

export const publicationOperations = {
  buildPublication: (...args: Parameters<typeof publicationApi.buildPublication>) => (
    publicationApi.buildPublication(...args)
  ),
  deployPublication: (...args: Parameters<typeof publicationApi.deployPublication>) => (
    publicationApi.deployPublication(...args)
  ),
  getPublicationJob: (...args: Parameters<typeof publicationApi.getPublicationJob>) => (
    publicationApi.getPublicationJob(...args)
  ),
  inspectPublication: (...args: Parameters<typeof publicationApi.inspectPublication>) => (
    publicationApi.inspectPublication(...args)
  ),
  rollbackPublication: (...args: Parameters<typeof publicationApi.rollbackPublication>) => (
    publicationApi.rollbackPublication(...args)
  ),
  servePublication: (...args: Parameters<typeof publicationApi.servePublication>) => (
    publicationApi.servePublication(...args)
  ),
  stopPublication: (...args: Parameters<typeof publicationApi.stopPublication>) => (
    publicationApi.stopPublication(...args)
  ),
  verifyPublication: (...args: Parameters<typeof publicationApi.verifyPublication>) => (
    publicationApi.verifyPublication(...args)
  ),
};
