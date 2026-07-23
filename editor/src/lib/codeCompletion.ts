import { codaroApi, shouldUseApi } from "@/lib/api";

export type CodeCompletionContext = {
  variables?: Array<{ name: string; type?: string }>;
  blocks?: Array<{ type: string; content: string }>;
};

export type CompletionContextProvider = () => CodeCompletionContext;

export async function fetchCodeCompletions({
  context,
  prefix,
  suffix,
}: {
  context?: CodeCompletionContext;
  prefix: string;
  suffix: string;
}): Promise<string[]> {
  if (!shouldUseApi()) return [];
  try {
    const response = await codaroApi.complete({ prefix, suffix, context });
    return response.completions.filter((text) => text && text.length > 0);
  } catch {
    return [];
  }
}
