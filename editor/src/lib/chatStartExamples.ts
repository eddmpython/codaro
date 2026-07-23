import { surfaceFlowRole, type ProductSurfaceFlowRole, type SurfaceMode } from "@/lib/surfaceModel";

export type ChatStartExample = {
  flowRole: ProductSurfaceFlowRole;
  label: string;
  prompt: string;
  surface: SurfaceMode;
};

type Translate = (key: string) => string;

type ChatStartExampleDefinition = {
  labelKey: string;
  promptKey: string;
  surface: SurfaceMode;
};

const CHAT_START_EXAMPLE_DEFINITIONS: readonly ChatStartExampleDefinition[] = [
  { labelKey: "chat.example.pandas", promptKey: "chat.example.pandas.prompt", surface: "curriculum" },
  { labelKey: "chat.example.browser", promptKey: "chat.example.browser.prompt", surface: "curriculum" },
  { labelKey: "chat.example.automation", promptKey: "chat.example.automation.prompt", surface: "automation" },
];

function translateExampleDefinitions(
  definitions: readonly ChatStartExampleDefinition[],
  t: Translate,
): ChatStartExample[] {
  return definitions.map((example) => ({
    flowRole: surfaceFlowRole(example.surface),
    label: t(example.labelKey),
    prompt: t(example.promptKey),
    surface: example.surface,
  }));
}

export function defaultChatStartExamples(t: Translate): ChatStartExample[] {
  return translateExampleDefinitions(CHAT_START_EXAMPLE_DEFINITIONS, t);
}
