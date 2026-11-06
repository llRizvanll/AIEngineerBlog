/** The fixed BOOTP header is 236 bytes. Options start after the 4-byte magic cookie. */
export function parseDhcp(b: Uint8Array) {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const mac = [...b.subarray(28, 28 + b[2])].map((x) => x.toString(16).padStart(2, "0")).join(":");
  if (view.getUint32(236) !== 0x63825363) throw new Error("not DHCP: bad magic cookie");

  // Options are type, length, value. Type 0 is padding and 255 ends the list.
  const options = new Map<number, Uint8Array>();
  for (let i = 240; i < b.length && b[i] !== 255; ) {
    if (b[i] === 0) { i++; continue; }
    options.set(b[i], b.subarray(i + 2, i + 2 + b[i + 1]));
    i += 2 + b[i + 1];
  }
  const TYPES = ["", "DISCOVER", "OFFER", "REQUEST", "DECLINE", "ACK", "NAK", "RELEASE", "INFORM"];
  return {
    isRequest: b[0] === 1,
    xid: view.getUint32(4),
    wantsBroadcast: (view.getUint16(10) & 0x8000) !== 0,
    mac,
    messageType: TYPES[options.get(53)?.[0] ?? 0],
    options,
  };
}
