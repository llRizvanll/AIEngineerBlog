export function parseUdp(b: Uint8Array) {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const length = view.getUint16(4); // header plus payload
  if (length < 8 || length > b.length) throw new Error("bad UDP length");
  return {
    sourcePort: view.getUint16(0),
    destinationPort: view.getUint16(2),
    length,
    payload: b.subarray(8, length),
  };
}

/** UDP gives no retries, so the application adds its own. Resend until answered, then give up. */
export async function queryWithRetry<T>(send: (attempt: number) => Promise<T | null>, attempts = 3): Promise<T | null> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const reply = await send(attempt);
    if (reply !== null) return reply;
  }
  return null;
}
