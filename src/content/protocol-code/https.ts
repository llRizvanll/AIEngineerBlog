/** Outside the tunnel an observer sees this much, and nothing more. */
export function parseRecord(b: Uint8Array) {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const length = view.getUint16(3);
  const body = b.subarray(5, 5 + length);
  return {
    type: b[0], // 23 means application data
    length,
    ciphertext: body.subarray(0, -16),
    tag: body.subarray(-16), // the AEAD tag proves nobody changed the data
  };
}

/** TLS 1.3: each record's nonce is the fixed IV XOR its sequence number. A nonce never repeats. */
export function recordNonce(iv: Uint8Array, seq: bigint): Uint8Array {
  const nonce = iv.slice();
  for (let i = 0; i < 8; i++) nonce[nonce.length - 1 - i] ^= Number((seq >> BigInt(8 * i)) & 0xffn);
  return nonce;
}
