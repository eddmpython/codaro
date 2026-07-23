import { systemApi } from "./api/systemApi";
import { runtimeApi } from "./api/runtimeApi";
import { curriculumApi } from "./api/curriculumApi";
import { automationApi } from "./api/automationApi";
import { shareApi } from "./api/shareApi";
import { providerApi } from "./api/providerApi";
import { putJson, requestJson } from "./api/transport";

export { CodaroApiError, optional, shouldUseApi } from "./api/transport";
export type { ReactiveResponse } from "./api/runtimeApi";

export const codaroApi = {
  ...systemApi,
  ...runtimeApi,
  ...curriculumApi,
  ...automationApi,
  ...shareApi,
  ...providerApi,
  putJson,
  requestJson,
};
