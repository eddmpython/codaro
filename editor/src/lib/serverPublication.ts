export function isServerPublicationPage(): boolean {
  if (typeof document === "undefined") return false;
  return document.querySelector('meta[name="codaro-server-publication"]') !== null;
}
