/** Reply 227 packs the data connection's address into six numbers. */
export function parsePasv(reply: string): { host: string; port: number } {
  const m = reply.match(/\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
  if (!m || !reply.startsWith("227")) throw new Error("not a PASV reply");
  const [h1, h2, h3, h4, p1, p2] = m.slice(1).map(Number);
  return { host: `${h1}.${h2}.${h3}.${h4}`, port: p1 * 256 + p2 }; // the port needs two bytes
}

/** The first digit says what happened. 1xx means the transfer has only started. */
export function replyClass(code: number): "wait" | "done" | "more" | "retry" | "failed" {
  return (["wait", "done", "more", "retry", "failed"] as const)[Math.floor(code / 100) - 1];
}
