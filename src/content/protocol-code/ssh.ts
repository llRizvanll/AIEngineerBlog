/** Both sides send a text banner first: SSH-protoversion-softwareversion. */
export function parseBanner(line: string): { protocol: string; software: string } {
  const m = line.trimEnd().match(/^SSH-([\d.]+)-(\S+)/);
  if (!m) throw new Error("not an SSH banner");
  return { protocol: m[1], software: m[2] };
}

/** Every later message is framed: length, padding length, payload, padding. */
export function parsePacket(b: Uint8Array) {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const packetLength = view.getUint32(0);
  const padding = b[4];
  const payload = b.subarray(5, 4 + packetLength - padding);
  return { packetLength, padding, messageType: payload[0], payload }; // 20 is KEXINIT
}

/** Padding makes the whole packet a multiple of the block size, with at least 4 bytes. */
export function paddingFor(payloadLength: number, block = 8): number {
  const base = 4 + 1 + payloadLength;
  let pad = block - (base % block);
  if (pad < 4) pad += block;
  return pad;
}
