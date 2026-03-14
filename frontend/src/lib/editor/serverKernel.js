export class ServerKernel {
  constructor() {
    this.sessionId = null;
    this.ws = null;
    this._pendingRequests = new Map();
    this._onStatusChange = null;
  }

  async initialize() {
    const response = await fetch("/api/kernel/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      throw new Error("Failed to create kernel session.");
    }

    const data = await response.json();
    this.sessionId = data.sessionId;

    return this._connectWebSocket();
  }

  _connectWebSocket() {
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${protocol}//${location.host}/ws/kernel/${this.sessionId}`;

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        resolve();
      };

      this.ws.onerror = (event) => {
        reject(new Error("WebSocket connection failed."));
      };

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this._handleMessage(message);
      };

      this.ws.onclose = () => {
        for (const pending of this._pendingRequests.values()) {
          pending.reject(new Error("WebSocket closed."));
        }
        this._pendingRequests.clear();
      };
    });
  }

  _handleMessage(message) {
    if (message.type === "result" && message.requestId) {
      const pending = this._pendingRequests.get(message.requestId);
      if (pending) {
        this._pendingRequests.delete(message.requestId);
        pending.resolve({
          type: message.data ? (message.stdout ? "text" : message.status === "error" ? "error" : "text") : "text",
          data: message.data || "",
          stdout: message.stdout || "",
          stderr: message.stderr || "",
          variables: (message.variables || []).map(v => v.name),
          executionCount: message.executionCount || 0,
        });
      }
      return;
    }

    if (message.type === "status" && this._onStatusChange) {
      this._onStatusChange(message.engineStatus);
      return;
    }

    if (message.type === "error" && message.requestId) {
      const pending = this._pendingRequests.get(message.requestId);
      if (pending) {
        this._pendingRequests.delete(message.requestId);
        pending.reject(new Error(message.message));
      }
    }
  }

  async executeBlock(code) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return this._executeViaRest(code);
    }

    const requestId = crypto.randomUUID();

    return new Promise((resolve, reject) => {
      this._pendingRequests.set(requestId, { resolve, reject });
      this.ws.send(JSON.stringify({
        type: "execute",
        requestId,
        code,
      }));
    });
  }

  async _executeViaRest(code) {
    const response = await fetch(`/api/kernel/${this.sessionId}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });

    if (!response.ok) {
      throw new Error("Execution failed.");
    }

    const result = await response.json();
    return {
      type: result.type || "text",
      data: result.data || "",
      stdout: result.stdout || "",
      stderr: result.stderr || "",
      variables: (result.variables || []).map(v => v.name),
    };
  }

  async interrupt() {
    if (!this.sessionId) return;
    await fetch(`/api/kernel/${this.sessionId}/interrupt`, { method: "POST" });
  }

  async installPackage(packageName) {
    const response = await fetch("/api/packages/install", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: packageName })
    });
    return response.json();
  }

  destroy() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.sessionId) {
      fetch(`/api/kernel/${this.sessionId}`, { method: "DELETE" }).catch(() => {});
      this.sessionId = null;
    }
  }
}
