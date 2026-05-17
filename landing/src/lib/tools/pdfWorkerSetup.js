import { base } from "$app/paths";
import { GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";

let configured = false;

export function setupPdfWorker() {
  if (configured) return;
  GlobalWorkerOptions.workerSrc = `${base}/pdf-worker/pdf.worker.min.mjs`;
  configured = true;
}
