const PROTOCOL = "codaro.embed";
const VERSION = 1;
const MODES = new Set(["output", "interactive", "editable"]);
const manifestLoads = new Map();

class CodaroBlock extends HTMLElement {
  static get observedAttributes() {
    return ["src", "mode"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.frame = null;
    this.messageHandler = (event) => this.receiveMessage(event);
    this.renderEpoch = 0;
  }

  connectedCallback() {
    window.addEventListener("message", this.messageHandler);
    void this.render();
  }

  disconnectedCallback() {
    window.removeEventListener("message", this.messageHandler);
    this.disposeFrame();
    this.frame = null;
  }

  attributeChangedCallback() {
    if (this.isConnected) void this.render();
  }

  async render() {
    const epoch = ++this.renderEpoch;
    this.disposeFrame();
    this.frame = null;
    delete this.dataset.codaroEmbedReady;
    delete this.dataset.codaroEmbedError;
    const source = this.getAttribute("src");
    this.shadowRoot.innerHTML = `${style()}<div class="shell"><p class="status" role="status">기능 블록을 여는 중입니다</p></div>`;
    if (!source) return this.fail("EMBED_SOURCE_REQUIRED", "codaro-block src가 필요합니다.");
    try {
      const manifestUrl = new URL(source, document.baseURI);
      const manifest = await loadManifest(manifestUrl);
      if (epoch !== this.renderEpoch) return;
      const requestedMode = this.getAttribute("mode") || manifest.defaultMode;
      if (!MODES.has(requestedMode) || !manifest.allowedModes.includes(requestedMode)) {
        throw new Error(`허용되지 않은 embed mode입니다: ${requestedMode}`);
      }
      const frameUrl = new URL(manifest.framePath, manifestUrl);
      const embedId = `${manifest.embedId}:${crypto.randomUUID()}`;
      const frameId = crypto.randomUUID();
      frameUrl.searchParams.set("codaroEmbedId", embedId);
      frameUrl.searchParams.set("codaroFrameId", frameId);
      frameUrl.searchParams.set("codaroEmbedVersion", String(VERSION));
      frameUrl.searchParams.set("codaroEmbedMode", requestedMode);
      frameUrl.searchParams.set("codaroParentOrigin", location.origin);
      const frame = document.createElement("iframe");
      frame.title = this.getAttribute("title") || manifest.title;
      frame.referrerPolicy = "no-referrer";
      frame.setAttribute("sandbox", manifest.sandbox.join(" "));
      frame.src = frameUrl.href;
      frame.dataset.codaroEmbedFrame = frameId;
      const currentFrame = { element: frame, embedId, frameId, origin: frameUrl.origin, initTimer: null };
      const sendInit = () => {
        frame.contentWindow?.postMessage({
          protocol: PROTOCOL,
          version: VERSION,
          type: "init",
          embedId,
          mode: requestedMode,
          parentOrigin: location.origin,
        }, frameUrl.origin);
      };
      frame.addEventListener("load", () => {
        sendInit();
        currentFrame.initTimer = window.setInterval(sendInit, 250);
      });
      this.frame = currentFrame;
      const shell = this.shadowRoot.querySelector(".shell");
      shell.replaceChildren(frame);
      this.dataset.codaroEmbedMode = requestedMode;
      this.dataset.codaroEmbedHash = manifest.manifestHash;
    } catch (error) {
      if (epoch === this.renderEpoch) this.fail("EMBED_LOAD_FAILED", error instanceof Error ? error.message : String(error));
    }
  }

  receiveMessage(event) {
    const current = this.frame;
    if (!current || event.source !== current.element.contentWindow || event.origin !== current.origin) return;
    const message = event.data;
    if (!isFrameMessage(message) || message.embedId !== current.embedId || message.frameId !== current.frameId) return;
    if (message.type === "ready" || message.type === "resize") {
      current.element.style.height = `${message.height}px`;
      if (message.type === "ready") {
        if (current.initTimer !== null) window.clearInterval(current.initTimer);
        current.initTimer = null;
        this.dataset.codaroEmbedReady = "true";
        this.dispatchEvent(new CustomEvent("codaro-block-ready", { bubbles: true, composed: true }));
      }
      return;
    }
    this.fail(message.code, message.message);
  }

  disposeFrame() {
    if (this.frame?.initTimer !== null && this.frame?.initTimer !== undefined) {
      window.clearInterval(this.frame.initTimer);
    }
  }

  fail(code, message) {
    this.dataset.codaroEmbedError = code;
    const shell = this.shadowRoot.querySelector(".shell");
    if (shell) shell.innerHTML = `<p class="error" role="alert"></p>`;
    const alert = this.shadowRoot.querySelector(".error");
    if (alert) alert.textContent = message;
    this.dispatchEvent(new CustomEvent("codaro-block-error", {
      bubbles: true,
      composed: true,
      detail: { code, message },
    }));
  }
}

async function loadManifest(url) {
  const key = url.href;
  if (!manifestLoads.has(key)) manifestLoads.set(key, fetchManifest(url));
  return manifestLoads.get(key);
}

async function fetchManifest(url) {
  const response = await fetch(url, { credentials: "omit" });
  if (!response.ok) throw new Error(`embed manifest를 읽을 수 없습니다: ${response.status}`);
  const manifest = await response.json();
  if (!isManifest(manifest)) throw new Error("embed manifest 형식이 잘못됐습니다.");
  const unsigned = { ...manifest };
  delete unsigned.manifestHash;
  const actual = `sha256-${await sha256(canonical(unsigned))}`;
  if (actual !== manifest.manifestHash) throw new Error("embed manifest hash가 일치하지 않습니다.");
  return manifest;
}

function isManifest(value) {
  const keys = [
    "schemaVersion", "kind", "protocol", "embedId", "title", "entryBlockId",
    "dependencyBlockIds", "runtimeTarget", "defaultMode", "allowedModes", "framePath",
    "publicationBundleHash", "publicationManifestHash", "sandbox", "loaderHash", "manifestHash",
  ];
  return exactObject(value, keys)
    && value.schemaVersion === 1
    && value.kind === "codaro.block-embed"
    && exactObject(value.protocol, ["name", "version"])
    && value.protocol.name === PROTOCOL
    && value.protocol.version === VERSION
    && boundedText(value.embedId, 200)
    && boundedText(value.title, 200)
    && boundedText(value.entryBlockId, 200)
    && stringList(value.dependencyBlockIds)
    && value.runtimeTarget === "browser"
    && MODES.has(value.defaultMode)
    && stringList(value.allowedModes)
    && value.allowedModes.every((mode) => MODES.has(mode))
    && safeRelativePath(value.framePath)
    && contentHash(value.publicationBundleHash)
    && contentHash(value.publicationManifestHash)
    && Array.isArray(value.sandbox)
    && value.sandbox.join(" ") === "allow-scripts allow-same-origin"
    && contentHash(value.loaderHash)
    && contentHash(value.manifestHash);
}

function isFrameMessage(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  if (value.type === "ready" || value.type === "resize") {
    return exactObject(value, ["protocol", "version", "type", "embedId", "frameId", "height"])
      && commonMessage(value)
      && Number.isInteger(value.height)
      && value.height >= 120
      && value.height <= 4096;
  }
  if (value.type === "error") {
    return exactObject(value, ["protocol", "version", "type", "embedId", "frameId", "code", "message"])
      && commonMessage(value)
      && boundedText(value.code, 100)
      && boundedText(value.message, 1000);
  }
  return false;
}

function commonMessage(value) {
  return value.protocol === PROTOCOL
    && value.version === VERSION
    && boundedText(value.embedId, 200)
    && boundedText(value.frameId, 200);
}

function exactObject(value, keys) {
  return Boolean(value)
    && typeof value === "object"
    && !Array.isArray(value)
    && Object.keys(value).length === keys.length
    && keys.every((key) => Object.prototype.hasOwnProperty.call(value, key));
}

function stringList(value) {
  return Array.isArray(value) && new Set(value).size === value.length && value.every((item) => boundedText(item, 200));
}

function boundedText(value, maximum) {
  return typeof value === "string" && value.length > 0 && value.length <= maximum;
}

function contentHash(value) {
  return typeof value === "string" && /^sha256-[0-9a-f]{64}$/.test(value);
}

function safeRelativePath(value) {
  return boundedText(value, 1000)
    && !value.startsWith("/")
    && !value.startsWith("//")
    && !value.includes("\\")
    && !/^[A-Za-z][A-Za-z0-9+.-]*:/.test(value);
}

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (item) => item.toString(16).padStart(2, "0")).join("");
}

function style() {
  return `<style>
    :host{display:block;contain:content;min-width:0;color-scheme:light dark}
    .shell{min-height:120px;width:100%;overflow:hidden;border:1px solid color-mix(in srgb,currentColor 18%,transparent);border-radius:12px;background:Canvas}
    iframe{display:block;width:100%;height:320px;border:0;background:Canvas}
    .status,.error{box-sizing:border-box;margin:0;padding:24px;font:500 14px/1.6 system-ui,sans-serif;color:CanvasText}
    .error{color:#c2413b}
  </style>`;
}

if (!customElements.get("codaro-block")) customElements.define("codaro-block", CodaroBlock);

export { CodaroBlock };
