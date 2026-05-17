import { PDFDocument } from "pdf-lib";

/**
 * @typedef {Object} MergeProgress
 * @property {number} current - 1-indexed current file
 * @property {number} total
 * @property {string} fileName
 *
 * @callback ProgressCallback
 * @param {MergeProgress} progress
 * @returns {void}
 */

/**
 * @param {File[]} files
 * @param {ProgressCallback} [onProgress]
 * @returns {Promise<Blob>}
 */
export async function mergePdfs(files, onProgress) {
  const out = await PDFDocument.create();
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.({ current: i + 1, total: files.length, fileName: file.name });
    const buf = await file.arrayBuffer();
    let src;
    try {
      src = await PDFDocument.load(buf);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (/encrypt/i.test(message)) {
        throw new Error(`${file.name} is password-protected and cannot be merged.`);
      }
      throw new Error(`${file.name}: failed to read PDF (${message})`);
    }
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
    await yieldFrame();
  }
  const bytes = await out.save();
  return new Blob([/** @type {BlobPart} */ (bytes)], { type: "application/pdf" });
}

function yieldFrame() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * @param {File} file
 * @returns {Promise<number>}
 */
export async function getPageCount(file) {
  const buf = await file.arrayBuffer();
  const src = await PDFDocument.load(buf);
  return src.getPageCount();
}
