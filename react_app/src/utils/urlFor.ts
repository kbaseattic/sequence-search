export function urlFor(path: string) {
  if (path.startsWith("/")) return process.env.PUBLIC_URL + path;
  else return `${document.URL}${document.URL.endsWith("/") ? "" : "/"}${path}`;
}
