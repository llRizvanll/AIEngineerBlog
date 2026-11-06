/** The same checksum IP uses: add 16-bit words, fold the carries, invert. */
function internetChecksum(b: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < b.length; i += 2) sum += (b[i] << 8) | (b[i + 1] ?? 0);
  while (sum >> 16) sum = (sum & 0xffff) + (sum >> 16);
  return ~sum & 0xffff;
}

/** Builds an echo request, the packet ping sends. */
export function echoRequest(id: number, seq: number, data: Uint8Array): Uint8Array {
  const p = new Uint8Array(8 + data.length);
  const view = new DataView(p.buffer);
  p[0] = 8; // type 8 is echo request; a reply is type 0
  view.setUint16(4, id);
  view.setUint16(6, seq);
  p.set(data, 8);
  view.setUint16(2, internetChecksum(p)); // computed while its own field is zero
  return p;
}

export function parseIcmp(b: Uint8Array) {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  return {
    type: b[0],
    code: b[1],
    isEcho: b[0] === 8 || b[0] === 0,
    // Time exceeded (11) is how traceroute maps a path, one TTL at a time.
    isTimeExceeded: b[0] === 11,
    id: view.getUint16(4),
    seq: view.getUint16(6),
    checksumOk: internetChecksum(b) === 0,
  };
}
