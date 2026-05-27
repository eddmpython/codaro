import { useEffect, useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { codaroApi } from "@/lib/api";
import { useViewportInsets } from "@/hooks/useViewportInsets";

type ChatLine = { role: "user" | "assistant"; text: string };

export function MobileChat() {
  const insets = useViewportInsets();
  const [draft, setDraft] = useState("");
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.style.height = "100%";
    document.body.style.height = "100%";
    document.body.style.margin = "0";
  }, []);

  const send = async () => {
    const message = draft.trim();
    if (!message || sending) return;
    setSending(true);
    setLines((current) => [...current, { role: "user", text: message }]);
    setDraft("");
    try {
      const response = await codaroApi.teacherChat({
        conversationId,
        displayLocale: "ko",
        message,
        role: "teacher",
      });
      setConversationId(response.conversationId);
      const reply = response.answer || "(빈 응답)";
      setLines((current) => [...current, { role: "assistant", text: reply }]);
    } catch (error) {
      setLines((current) => [
        ...current,
        { role: "assistant", text: `요청 실패: ${(error as Error).message ?? "unknown"}` },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      data-route="mobile-chat"
      className="flex h-dvh w-full flex-col bg-background"
      style={{ paddingBottom: insets.isKeyboardOpen ? 0 : "env(safe-area-inset-bottom)" }}
    >
      <header className="flex items-center justify-between border-b px-3 py-2 text-sm font-semibold">
        <span>Codaro 모바일 채팅</span>
        <a href="/" className="text-xs text-muted-foreground underline-offset-2 hover:underline">
          데스크톱
        </a>
      </header>
      <main className="flex-1 overflow-y-auto px-3 py-2" data-mobile-chat-log="true">
        {lines.length === 0 ? (
          <div className="rounded-md border border-dashed bg-muted/30 p-3 text-xs text-muted-foreground">
            짧은 학습 질문을 시도해보세요. 예: "for 루프 예제"
          </div>
        ) : (
          <ul className="space-y-2">
            {lines.map((line, index) => (
              <li
                key={index}
                data-mobile-chat-line={line.role}
                className={
                  line.role === "user"
                    ? "ml-auto max-w-[85%] rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
                    : "mr-auto max-w-[85%] rounded-md border bg-muted/30 px-3 py-2 text-sm"
                }
              >
                {line.text}
              </li>
            ))}
          </ul>
        )}
      </main>
      <footer
        className="border-t bg-background p-2"
        style={{ paddingBottom: insets.keyboardHeight > 0 ? `${insets.keyboardHeight}px` : undefined }}
      >
        <div className="flex items-end gap-2">
          <Textarea
            placeholder="질문을 입력하세요"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="min-h-10 max-h-32 flex-1 resize-none text-sm"
            data-mobile-chat-input="true"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send();
              }
            }}
          />
          <Button
            type="button"
            size="icon"
            disabled={!draft.trim() || sending}
            onClick={() => void send()}
            data-mobile-chat-send="true"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
