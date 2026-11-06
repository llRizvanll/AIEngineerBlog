/** A name goes on the wire as length-prefixed labels, ending in a zero byte. */
export function encodeName(name: string): number[] {
  const out: number[] = [];
  for (const label of name.split(".")) out.push(label.length, ...new TextEncoder().encode(label));
  out.push(0);
  return out;
}

/** Reads a name. Two high bits set means a pointer to an earlier name, which saves space. */
export function readName(b: Uint8Array, start: number): { name: string; next: number } {
  const labels: string[] = [];
  let i = start;
  let next = -1;
  for (let jumps = 0; jumps < 32; jumps++) {
    const len = b[i];
    if (len === 0) return { name: labels.join("."), next: next === -1 ? i + 1 : next };
    if ((len & 0xc0) === 0xc0) {
      if (next === -1) next = i + 2; // the record continues after the first pointer
      i = ((len & 0x3f) << 8) | b[i + 1];
    } else {
      labels.push(new TextDecoder().decode(b.subarray(i + 1, i + 1 + len)));
      i += 1 + len;
    }
  }
  throw new Error("pointer loop in DNS name"); // a hostile packet could otherwise hang the parser
}

export function parseDns(b: Uint8Array) {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const flags = view.getUint16(2);
  let i = 12;
  const questions = [];
  for (let n = view.getUint16(4); n > 0; n--) {
    const { name, next } = readName(b, i);
    questions.push({ name, type: view.getUint16(next) });
    i = next + 4;
  }
  const answers = [];
  for (let n = view.getUint16(6); n > 0; n--) {
    const { name, next } = readName(b, i);
    const type = view.getUint16(next);
    const rdLength = view.getUint16(next + 8);
    const data = b.subarray(next + 10, next + 10 + rdLength);
    answers.push({ name, type, ttl: view.getUint32(next + 4), address: type === 1 ? [...data].join(".") : null });
    i = next + 10 + rdLength;
  }
  return { id: view.getUint16(0), isResponse: (flags & 0x8000) !== 0, wantsRecursion: (flags & 0x0100) !== 0, rcode: flags & 0x0f, questions, answers };
}
