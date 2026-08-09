export const BLOCK_EMBED_PROTOCOL = "codaro.embed" as const;
export const BLOCK_EMBED_PROTOCOL_VERSION = 1 as const;
export const BLOCK_EMBED_MODES = ["output", "interactive", "editable"] as const;

export type BlockEmbedMode = (typeof BLOCK_EMBED_MODES)[number];

export type BlockEmbedInitMessage = {
  protocol: typeof BLOCK_EMBED_PROTOCOL;
  version: typeof BLOCK_EMBED_PROTOCOL_VERSION;
  type: "init";
  embedId: string;
  mode: BlockEmbedMode;
  parentOrigin: string;
};

export type BlockEmbedFrameMessage = {
  protocol: typeof BLOCK_EMBED_PROTOCOL;
  version: typeof BLOCK_EMBED_PROTOCOL_VERSION;
  type: "ready" | "resize";
  embedId: string;
  frameId: string;
  height: number;
} | {
  protocol: typeof BLOCK_EMBED_PROTOCOL;
  version: typeof BLOCK_EMBED_PROTOCOL_VERSION;
  type: "error";
  embedId: string;
  frameId: string;
  code: string;
  message: string;
};

export function isBlockEmbedMode(value: unknown): value is BlockEmbedMode {
  return typeof value === "string" && BLOCK_EMBED_MODES.includes(value as BlockEmbedMode);
}

export function isBlockEmbedInitMessage(value: unknown): value is BlockEmbedInitMessage {
  if (!isExactRecord(value, ["protocol", "version", "type", "embedId", "mode", "parentOrigin"])) {
    return false;
  }
  return value.protocol === BLOCK_EMBED_PROTOCOL
    && value.version === BLOCK_EMBED_PROTOCOL_VERSION
    && value.type === "init"
    && isIdentifier(value.embedId)
    && isBlockEmbedMode(value.mode)
    && isHttpOrigin(value.parentOrigin);
}

export function isBlockEmbedFrameMessage(value: unknown): value is BlockEmbedFrameMessage {
  if (!isRecord(value)) return false;
  if (value.type === "ready" || value.type === "resize") {
    return isExactRecord(value, ["protocol", "version", "type", "embedId", "frameId", "height"])
      && commonFrameFieldsAreValid(value)
      && Number.isInteger(value.height)
      && Number(value.height) >= 120
      && Number(value.height) <= 4096;
  }
  if (value.type === "error") {
    return isExactRecord(value, ["protocol", "version", "type", "embedId", "frameId", "code", "message"])
      && commonFrameFieldsAreValid(value)
      && isBoundedText(value.code, 100)
      && isBoundedText(value.message, 1000);
  }
  return false;
}

function commonFrameFieldsAreValid(value: Record<string, unknown>) {
  return value.protocol === BLOCK_EMBED_PROTOCOL
    && value.version === BLOCK_EMBED_PROTOCOL_VERSION
    && isIdentifier(value.embedId)
    && isIdentifier(value.frameId);
}

function isExactRecord(value: unknown, keys: string[]): value is Record<string, unknown> {
  return isRecord(value)
    && Object.keys(value).length === keys.length
    && keys.every((key) => Object.prototype.hasOwnProperty.call(value, key));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIdentifier(value: unknown) {
  return isBoundedText(value, 200);
}

function isBoundedText(value: unknown, maximum: number) {
  return typeof value === "string" && value.length > 0 && value.length <= maximum;
}

function isHttpOrigin(value: unknown) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && url.origin === value;
  } catch {
    return false;
  }
}
