import { GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";
import { basePath } from "../brand.js";

let configured = false;

export function setupPdfWorker() {
  if (configured) return;
  GlobalWorkerOptions.workerSrc = `${basePath}/pdf-worker/pdf.worker.min.mjs`;
  configured = true;
}
