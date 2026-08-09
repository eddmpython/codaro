import {
  BLOCK_EMBED_PROTOCOL,
  BLOCK_EMBED_PROTOCOL_VERSION,
  isBlockEmbedInitMessage,
  isBlockEmbedMode,
  type BlockEmbedFrameMessage,
  type BlockEmbedMode,
} from "@/embed/embedMessage";

export type BlockEmbedFrameConfig = {
  embedId: string;
  frameId: string;
  mode: BlockEmbedMode;
  parentOrigin: string;
};

export function resolveBlockEmbedFrameConfig(locationLike: Pick<Location, "search"> = window.location) {
  const parameters = new URLSearchParams(locationLike.search);
  const embedId = parameters.get("codaroEmbedId");
  if (!embedId) return null;
  const version = Number(parameters.get("codaroEmbedVersion"));
  const mode = parameters.get("codaroEmbedMode");
  const parentOrigin = parameters.get("codaroParentOrigin");
  const frameId = parameters.get("codaroFrameId");
  if (version !== BLOCK_EMBED_PROTOCOL_VERSION || !isBlockEmbedMode(mode)) return null;
  if (!isHttpOrigin(parentOrigin) || !isIdentifier(embedId) || !isIdentifier(frameId)) return null;
  return { embedId, frameId, mode, parentOrigin } satisfies BlockEmbedFrameConfig;
}

export function installBlockEmbedFrameBridge(config: BlockEmbedFrameConfig) {
  let initialized = false;
  let resizeObserver: ResizeObserver | null = null;
  let lastHeight = 0;

  document.documentElement.dataset.codaroEmbedFrame = "true";
  document.documentElement.dataset.codaroEmbedMode = config.mode;

  const send = (message: BlockEmbedFrameMessage) => {
    window.parent.postMessage(message, config.parentOrigin);
  };
  const sendHeight = (type: "ready" | "resize") => {
    const height = Math.max(120, Math.min(4096, Math.ceil(document.documentElement.scrollHeight)));
    if (type === "resize" && height === lastHeight) return;
    lastHeight = height;
    send({
      protocol: BLOCK_EMBED_PROTOCOL,
      version: BLOCK_EMBED_PROTOCOL_VERSION,
      type,
      embedId: config.embedId,
      frameId: config.frameId,
      height,
    });
  };
  const announceWhenReady = () => {
    const projection = document.querySelector('[data-app-projection="true"]');
    if (!projection) {
      window.requestAnimationFrame(announceWhenReady);
      return;
    }
    sendHeight("ready");
    resizeObserver = new ResizeObserver(() => sendHeight("resize"));
    resizeObserver.observe(document.documentElement);
  };
  const receive = (event: MessageEvent) => {
    if (event.source !== window.parent || event.origin !== config.parentOrigin) return;
    if (!isBlockEmbedInitMessage(event.data)) return;
    if (event.data.embedId !== config.embedId || event.data.mode !== config.mode) return;
    if (event.data.parentOrigin !== config.parentOrigin || initialized) return;
    initialized = true;
    announceWhenReady();
  };
  const reportError = (code: string, message: string) => {
    if (!initialized) return;
    send({
      protocol: BLOCK_EMBED_PROTOCOL,
      version: BLOCK_EMBED_PROTOCOL_VERSION,
      type: "error",
      embedId: config.embedId,
      frameId: config.frameId,
      code,
      message: message.slice(0, 1000) || "unknown embed error",
    });
  };
  const onError = (event: ErrorEvent) => reportError("FRAME_ERROR", event.message);
  const onRejection = (event: PromiseRejectionEvent) => reportError(
    "FRAME_REJECTION",
    event.reason instanceof Error ? event.reason.message : String(event.reason),
  );

  window.addEventListener("message", receive);
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
  return () => {
    resizeObserver?.disconnect();
    window.removeEventListener("message", receive);
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
    delete document.documentElement.dataset.codaroEmbedFrame;
    delete document.documentElement.dataset.codaroEmbedMode;
  };
}

function isIdentifier(value: string | null): value is string {
  return Boolean(value && value.length <= 200);
}

function isHttpOrigin(value: string | null): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && url.origin === value;
  } catch {
    return false;
  }
}
