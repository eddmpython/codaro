export function isServerPublicationPage(): boolean {
  if (typeof document === "undefined") return false;
  return document.querySelector('meta[name="codaro-server-publication"]') !== null;
}

export function isPublishedAppPage(): boolean {
  if (typeof document === "undefined") return false;
  return document.querySelector(
    'meta[name="codaro-server-publication"], meta[name="codaro-local-publication"]',
  ) !== null;
}
