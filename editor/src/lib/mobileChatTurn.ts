import { codaroApi } from "@/lib/api";
import type { AiChatResponse } from "@/types";

export type MobileChatTurnRequest = {
  conversationId: string | null;
  displayLocale?: "ko" | "en";
  message: string;
};

export async function sendMobileChatTurn({
  conversationId,
  displayLocale = "ko",
  message,
}: MobileChatTurnRequest): Promise<AiChatResponse> {
  return codaroApi.teacherChat({
    conversationId,
    displayLocale,
    message,
    role: "teacher",
  });
}
