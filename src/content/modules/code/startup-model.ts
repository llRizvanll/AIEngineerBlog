/* A model of what lazy native modules change at startup. It counts work; it does not run React Native. */
export interface NativeModule {
  name: string;
  /** milliseconds to initialise on a mid-range phone */
  initMs: number;
  /** the first screen cannot draw without it */
  needsFirstScreen: boolean;
}

export type Mode = "eager" | "lazy";

/** Eager init runs everything before the first screen. Lazy init runs only what the first screen needs. */
export function startup(modules: NativeModule[], mode: Mode) {
  const sum = (list: NativeModule[]) => list.reduce((total, m) => total + m.initMs, 0);
  const blockingMs = sum(modules.filter((m) => mode === "eager" || m.needsFirstScreen));
  return { blockingMs, deferredMs: sum(modules) - blockingMs };
}

/** Lazy work isn't removed. The first caller pays for it, so a module used on the second screen moves its cost there. */
export function firstUseCost(modules: NativeModule[], mode: Mode, name: string): number {
  const m = modules.find((x) => x.name === name);
  if (!m) throw new Error(`no module named ${name}`);
  return mode === "eager" || m.needsFirstScreen ? 0 : m.initMs;
}
