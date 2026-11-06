export type ZeroStage = 0 | 1 | 2 | 3;

/**
 * Rough GPU memory per device, in decimal GB, for mixed-precision Adam:
 * 2 bytes of weights, 2 of gradients, 12 of optimiser state (FP32 master copy plus two moments).
 */
export function zeroGbPerGpu(params: number, gpus: number, stage: ZeroStage): number {
  const weights = stage >= 3 ? 2 / gpus : 2;
  const grads = stage >= 2 ? 2 / gpus : 2;
  const optim = stage >= 1 ? 12 / gpus : 12;
  return (params * (weights + grads + optim)) / 1e9;
}
