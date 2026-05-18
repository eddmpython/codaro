import {
  Sparkles,
} from "lucide-react";

import { IconButton } from "@/components/app/appPrimitives";
import type { CellAiAction } from "@/lib/cellModel";

export function CellAiActions({
  onAsk,
  selected,
}: {
  onAsk: (action: CellAiAction) => void;
  selected: boolean;
}) {
  return (
    <IconButton
      className="size-7 shrink-0 opacity-80 lg:opacity-0 lg:transition group-hover:opacity-100 focus-visible:opacity-100"
      label="셀 AI"
      tabIndex={selected ? 0 : -1}
      variant="ghost"
      onClick={(event) => {
        event.stopPropagation();
        onAsk("explain");
      }}
    >
      <Sparkles />
    </IconButton>
  );
}
