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
