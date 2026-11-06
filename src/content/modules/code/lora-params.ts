/** LoRA trains two thin matrices: B (dOut × r) and A (r × dIn). */
export const loraParams = (dIn: number, dOut: number, r: number) => r * (dIn + dOut);

/** Trainable weights when LoRA wraps the given projections in every layer. */
export function loraTrainable(layers: number, projections: [dIn: number, dOut: number][], r: number): number {
  return layers * projections.reduce((sum, [dIn, dOut]) => sum + loraParams(dIn, dOut, r), 0);
}
