import { PDFDocument, degrees } from "pdf-lib";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { setupPdfWorker } from "./pdfWorkerSetup.js";

/**
 * @typedef {Object} LoadedPdf
 * @property {ArrayBuffer} buffer
 * @property {number} pageCount
 * @property {import('pdfjs-dist').PDFDocumentProxy} doc
 *
 * @typedef {Object} PageEntry
 * @property {number} pageIndex - 0-indexed source page
 * @property {0 | 90 | 180 | 270} rotation - user-added rotation delta
 */

/**
 * @param {File} file
 * @returns {Promise<LoadedPdf>}
 */
export async function loadPdfForRender(file) {
  setupPdfWorker();
  const buf = await file.arrayBuffer();
  const copy = buf.slice(0);
  const loadingTask = getDocument({ data: new Uint8Array(buf) });
  const doc = await loadingTask.promise;
  return { buffer: copy, pageCount: doc.numPages, doc };
}

/**
 * Render a single page into the supplied canvas at given scale.
 * Returns a render task that can be cancelled.
 *
 * @param {import('pdfjs-dist').PDFDocumentProxy} doc
 * @param {number} pageNumber - 1-indexed
 * @param {HTMLCanvasElement} canvas
 * @param {number} scale
 */
export async function renderPageThumb(doc, pageNumber, canvas, scale) {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(viewport.width * dpr);
  canvas.height = Math.floor(viewport.height * dpr);
  canvas.style.width = `${Math.floor(viewport.width)}px`;
  canvas.style.height = `${Math.floor(viewport.height)}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const task = page.render(
    /** @type {import('pdfjs-dist/types/src/display/api').RenderParameters} */ (
      /** @type {unknown} */ ({ canvasContext: ctx, viewport, canvas })
    )
  );
  await task.promise;
  return task;
}

/**
 * @param {ArrayBuffer} buffer - original PDF bytes
 * @param {PageEntry[]} entries - pages in desired order, with rotation deltas
 * @returns {Promise<Blob>}
 */
export async function exportPdfWithEntries(buffer, entries) {
  const src = await PDFDocument.load(buffer);
  const out = await PDFDocument.create();
  const indices = entries.map((e) => e.pageIndex);
  const pages = await out.copyPages(src, indices);
  pages.forEach((p, i) => {
    const delta = entries[i].rotation;
    if (delta !== 0) {
      const existing = p.getRotation().angle;
      const next = ((existing + delta) % 360 + 360) % 360;
      p.setRotation(degrees(next));
    }
    out.addPage(p);
  });
  const bytes = await out.save();
  return new Blob([/** @type {BlobPart} */ (bytes)], { type: "application/pdf" });
}
