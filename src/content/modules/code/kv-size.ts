/** Bytes of KV cache one token costs: a key and a value, per layer, per KV head. */
export function kvBytesPerToken(m: { layers: number; kvHeads: number; headDim: number; bytesPerValue: number }): number {
  return 2 * m.layers * m.kvHeads * m.headDim * m.bytesPerValue;
}

/** Requests that fit in the memory left after loading the weights. */
export function concurrentRequests(freeGiB: number, tokensPerRequest: number, bytesPerToken: number): number {
  return Math.floor((freeGiB * 1024 ** 3) / (tokensPerRequest * bytesPerToken));
}
