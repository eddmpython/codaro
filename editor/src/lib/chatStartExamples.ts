export type ChatStartExample = {
  label: string;
  prompt: string;
};

type Translate = (key: string) => string;

export function defaultChatStartExamples(t: Translate): ChatStartExample[] {
  return [
    { label: t("chat.example.pandas"), prompt: t("chat.example.pandas.prompt") },
    { label: t("chat.example.browser"), prompt: t("chat.example.browser.prompt") },
    { label: t("chat.example.automation"), prompt: t("chat.example.automation.prompt") },
  ];
}
