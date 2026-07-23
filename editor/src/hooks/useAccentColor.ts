import { useCodaroDesign } from "@/lib/codaroDesign";

export function useAccentColor() {
  const { accentId, selectAccentId } = useCodaroDesign();

  return {
    accentColor: accentId,
    selectAccentColor: selectAccentId,
  };
}
