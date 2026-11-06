const FLAGS = ["FIN", "SYN", "RST", "PSH", "ACK", "URG"];

export function parseTcp(b: Uint8Array) {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const headerLength = (b[12] >> 4) * 4; // data offset counts 32-bit words
  const options: Record<string, number | boolean> = {};
  for (let i = 20; i < headerLength; ) {
    const kind = b[i];
    if (kind === 0) break; // end of options
    if (kind === 1) { i++; continue; } // NOP, used as padding
    if (kind === 2) options.mss = view.getUint16(i + 2);
    if (kind === 3) options.windowScale = b[i + 2];
    if (kind === 4) options.sackPermitted = true;
    if (kind === 8) options.timestamp = view.getUint32(i + 2);
    i += b[i + 1];
  }
  return {
    sourcePort: view.getUint16(0),
    destinationPort: view.getUint16(2),
    seq: view.getUint32(4),
    ack: view.getUint32(8),
    headerLength,
    flags: FLAGS.filter((_, bit) => b[13] & (1 << bit)),
    window: view.getUint16(14),
    options,
  };
}

/** SYN and FIN each use up one sequence number, even with no data. */
export function nextSeq(seq: number, payload: number, flags: string[]): number {
  const extra = flags.includes("SYN") || flags.includes("FIN") ? 1 : 0;
  return (seq + payload + extra) >>> 0; // sequence numbers wrap at 2^32
}
