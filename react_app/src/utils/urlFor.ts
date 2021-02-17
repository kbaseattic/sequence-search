export function urlFor(path: string, params?: Record<string, string>) {
  let url: string;
  if (path.startsWith("/")) url = process.env.PUBLIC_URL + path;
  else url = `${document.URL}${document.URL.endsWith("/") ? "" : "/"}${path}`;
  if (!params) return url;
  const paramString = new URLSearchParams(params).toString();
  return `${url}?${paramString}`;
}
