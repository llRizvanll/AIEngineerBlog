/** "250-" means more lines follow. "250 " with a space is the last line. */
export function parseReply(text: string) {
  const lines = text.split("\r\n").filter(Boolean);
  const last = lines[lines.length - 1];
  const code = Number(last.slice(0, 3));
  return {
    code,
    complete: last[3] === " ",
    lines: lines.map((l) => l.slice(4)),
    // 2xx worked, 3xx wants more input, 4xx try later, 5xx do not retry.
    retryLater: code >= 400 && code < 500,
  };
}

/** A lone "." ends a message, so a body line starting with a dot gets a second one. */
export function dotStuff(body: string): string {
  const stuffed = body.split("\r\n").map((l) => (l.startsWith(".") ? "." + l : l)).join("\r\n");
  return stuffed + "\r\n.\r\n";
}
