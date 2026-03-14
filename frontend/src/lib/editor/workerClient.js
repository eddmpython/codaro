export class WorkerClient {
  constructor() {
    this.requestId = 0;
    this.pending = new Map();
    this.worker = new Worker(new URL("./pyodideWorker.js", import.meta.url));

    this.worker.addEventListener("message", (event) => {
      const { type, payload, requestId } = event.data || {};
      if (type === "initialized") {
        const pending = this.pending.get("initialize");
        if (!pending) return;
        this.pending.delete("initialize");
        pending.resolve(payload);
        return;
      }
      if (type === "executionResult" || type === "packageInstalled") {
        const pending = this.pending.get(requestId);
        if (!pending) return;
        this.pending.delete(requestId);
        pending.resolve(payload);
        return;
      }
      if (type === "error") {
        if (requestId && this.pending.has(requestId)) {
          const pending = this.pending.get(requestId);
          this.pending.delete(requestId);
          pending.reject(new Error(payload));
          return;
        }
        if (this.pending.has("initialize")) {
          const pending = this.pending.get("initialize");
          this.pending.delete("initialize");
          pending.reject(new Error(payload));
        }
      }
    });

    this.worker.addEventListener("error", (event) => {
      this.rejectAll(event.message || "Worker execution failed.");
    });

    this.worker.addEventListener("messageerror", () => {
      this.rejectAll("Worker message could not be deserialized.");
    });
  }

  rejectAll(message) {
    for (const [key, pending] of this.pending.entries()) {
      this.pending.delete(key);
      pending.reject(new Error(message));
    }
  }

  createPending(key) {
    return new Promise((resolve, reject) => {
      this.pending.set(key, { resolve, reject });
    });
  }

  async initialize() {
    const initPromise = this.createPending("initialize");
    this.worker.postMessage({ type: "initialize" });
    await initPromise;
  }

  async executeBlock(code) {
    const requestId = `execute-${++this.requestId}`;
    const resultPromise = this.createPending(requestId);
    this.worker.postMessage({ type: "executeBlock", requestId, payload: { code } });
    return resultPromise;
  }

  async installPackage(packageName) {
    const requestId = `package-${++this.requestId}`;
    const resultPromise = this.createPending(requestId);
    this.worker.postMessage({ type: "installPackage", requestId, payload: { packageName } });
    await resultPromise;
  }

  destroy() {
    this.rejectAll("Worker terminated.");
    this.worker.terminate();
  }
}
