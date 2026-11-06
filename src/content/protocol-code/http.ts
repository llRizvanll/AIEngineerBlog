export interface HttpRequest {
  method: string;
  target: string;
  version: string;
  headers: Map<string, string>;
  body: string;
}

/** Lines end in CRLF, and a blank line ends the headers. */
export function parseRequest(text: string): HttpRequest {
  const split = text.indexOf("\r\n\r\n");
  if (split === -1) throw new Error("incomplete headers");
  const [requestLine, ...lines] = text.slice(0, split).split("\r\n");
  const [method, target, version] = requestLine.split(" ");
  const headers = new Map<string, string>();
  for (const line of lines) {
    const colon = line.indexOf(":");
    headers.set(line.slice(0, colon).toLowerCase(), line.slice(colon + 1).trim()); // names ignore case
  }
  const length = Number(headers.get("content-length") ?? 0);
  return { method, target, version, headers, body: text.slice(split + 4, split + 4 + length) };
}

/** A client may reuse the connection unless someone said otherwise. */
export function keepAlive(r: HttpRequest): boolean {
  const connection = r.headers.get("connection")?.toLowerCase();
  return r.version === "HTTP/1.1" ? connection !== "close" : connection === "keep-alive";
}
