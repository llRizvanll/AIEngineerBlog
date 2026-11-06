/** Walks a ClientHello far enough to read the server name, as a load balancer does. */
export function parseClientHello(b: Uint8Array) {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  if (b[0] !== 22 || b[5] !== 1) throw new Error("not a ClientHello"); // record type 22, handshake type 1

  let i = 5 + 4 + 2 + 32; // record header, handshake header, version, random
  i += 1 + b[i]; // session id
  const suitesLength = view.getUint16(i);
  const suites: number[] = [];
  for (let s = 0; s < suitesLength; s += 2) suites.push(view.getUint16(i + 2 + s));
  i += 2 + suitesLength;
  i += 1 + b[i]; // compression methods

  const end = i + 2 + view.getUint16(i);
  i += 2;
  let serverName: string | null = null;
  const extensions: number[] = [];
  while (i < end && i + 4 <= b.length) {
    const type = view.getUint16(i);
    const length = view.getUint16(i + 2);
    extensions.push(type);
    if (type === 0) serverName = new TextDecoder().decode(b.subarray(i + 9, i + 4 + length));
    i += 4 + length;
  }
  return { recordLength: view.getUint16(3), suites, extensions, serverName, offersTls13: extensions.includes(43) };
}
