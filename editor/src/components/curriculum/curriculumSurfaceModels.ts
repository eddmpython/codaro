import type { BlockConfig, ExecutionResult } from "@/types";
import type { ReactNode } from "react";

export type ResultMap = Record<string, ExecutionResult>;

export type RenderCodeCellEditor = (args: {
  autoFocus?: boolean;
  block: BlockConfig;
  draft: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onRun: (sourceOverride?: string) => void;
}) => ReactNode;

export type CurriculumSectionGroup = {
  id: string;
  title: string;
  subtitle: string;
  contract?: CurriculumSectionContract;
  anchorBlockId: string;
  titleBlock?: BlockConfig;
  blocks: BlockConfig[];
};

export type CurriculumSectionContract = Record<string, unknown> & {
  title?: unknown;
  subtitle?: unknown;
  goal?: unknown;
  why?: unknown;
  explanation?: unknown;
  tips?: unknown;
  contractGaps?: unknown;
};
