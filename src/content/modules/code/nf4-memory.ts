/** Bits per weight spent on quantisation constants: one 32-bit constant per block of 64 weights. */
export function constantBits(doubleQuant: boolean): number {
  // Double quantisation stores 8-bit constants, plus one 32-bit constant per 256 of those.
  return doubleQuant ? 8 / 64 + 32 / (64 * 256) : 32 / 64;
}

export function baseModelGiB(params: number, weightBits: number, doubleQuant: boolean): number {
  return (params * (weightBits + constantBits(doubleQuant))) / 8 / 1024 ** 3;
}
