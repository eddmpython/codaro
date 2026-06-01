import { translate } from "@/lib/localeCopy";
import type { AiProfile } from "@/types";

export function providerProfileName(profile: AiProfile | null) {
  return String(profile?.activeProvider ?? profile?.provider ?? profile?.defaultProvider ?? translate("common.defaultProvider"));
}

export function providerProfileReady(profile: AiProfile | null) {
  return Boolean(profile?.ready ?? profile?.enabled);
}
