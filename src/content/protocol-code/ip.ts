/** The internet checksum: add 16-bit words, fold the carries back in, then invert. */
export function internetChecksum(b: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < b.length; i += 2) sum += (b[i] << 8) | (b[i + 1] ?? 0);
  while (sum >> 16) sum = (sum & 0xffff) + (sum >> 16);
  return ~sum & 0xffff;
}

export function parseIpv4(b: Uint8Array) {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const headerLength = (b[0] & 0x0f) * 4; // IHL counts 32-bit words
  const flags = view.getUint16(6);
  return {
    version: b[0] >> 4,
    headerLength,
    totalLength: view.getUint16(2),
    dontFragment: (flags & 0x4000) !== 0,
    moreFragments: (flags & 0x2000) !== 0,
    fragmentOffset: (flags & 0x1fff) * 8, // stored in units of 8 bytes
    ttl: b[8],
    protocol: b[9], // 1 ICMP, 6 TCP, 17 UDP
    source: [...b.subarray(12, 16)].join("."),
    destination: [...b.subarray(16, 20)].join("."),
    // A correct header, checksum included, always sums to zero.
    checksumOk: internetChecksum(b.subarray(0, headerLength)) === 0,
  };
}

/** A router lowers TTL and must recompute the checksum. At zero it drops the packet. */
export function forward(header: Uint8Array): { dropped: boolean; header: Uint8Array } {
  if (header[8] <= 1) return { dropped: true, header };
  const next = header.slice();
  next[8] -= 1;
  next[10] = next[11] = 0;
  const sum = internetChecksum(next);
  next[10] = sum >> 8;
  next[11] = sum & 0xff;
  return { dropped: false, header: next };
}
