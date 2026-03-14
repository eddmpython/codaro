export async function loadDocumentAtPath(path) {
  const response = await fetch("/api/document/load", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path })
  });
  if (!response.ok) {
    throw new Error("Failed to load document.");
  }
  return response.json();
}

export async function saveDocumentAtPath(path, document) {
  const response = await fetch("/api/document/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, document })
  });
  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload.detail || "Failed to save document.");
  }
  return response.json();
}

export async function exportDocumentAtPath(path, format, outputPath) {
  const response = await fetch("/api/document/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, format, outputPath })
  });
  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload.detail || "Failed to export document.");
  }
  return response.json();
}

export async function insertBlock(path, { anchorBlockId, direction, type, content }) {
  const response = await fetch("/api/document/insert-block", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, anchorBlockId, direction, type, content })
  });
  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload.detail || "Failed to insert block.");
  }
  return response.json();
}

export async function removeBlock(path, blockId) {
  const response = await fetch("/api/document/remove-block", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, blockId })
  });
  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload.detail || "Failed to remove block.");
  }
  return response.json();
}

export async function updateBlock(path, blockId, { content, type }) {
  const response = await fetch("/api/document/update-block", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, blockId, content, type })
  });
  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload.detail || "Failed to update block.");
  }
  return response.json();
}

export async function runBlock(sessionId, path, blockId) {
  const response = await fetch("/api/document/run-block", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, path, blockId })
  });
  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload.detail || "Failed to run block.");
  }
  return response.json();
}

export async function listFiles(path) {
  const response = await fetch("/api/fs/list", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path })
  });
  return response.json();
}

export async function readFileContent(path) {
  const response = await fetch("/api/fs/read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path })
  });
  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload.detail || "Failed to read file.");
  }
  return response.json();
}

export async function writeFileContent(path, content) {
  const response = await fetch("/api/fs/write", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, content })
  });
  return response.json();
}

export async function deleteFileEntry(path) {
  const response = await fetch("/api/fs/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path })
  });
  return response.json();
}

export async function moveFileEntry(source, destination) {
  const response = await fetch("/api/fs/move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source, destination })
  });
  return response.json();
}

export async function createDir(path) {
  const response = await fetch("/api/fs/mkdir", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path })
  });
  return response.json();
}

export async function listInstalledPackages() {
  const response = await fetch("/api/packages/list");
  return response.json();
}

export async function installPkg(name) {
  const response = await fetch("/api/packages/install", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
  return response.json();
}

export async function uninstallPkg(name) {
  const response = await fetch("/api/packages/uninstall", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
  return response.json();
}

export async function getEnvironmentInfo() {
  const response = await fetch("/api/env/info");
  return response.json();
}
