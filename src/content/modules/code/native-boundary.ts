/* Decides where code should live: in React Native, in a native module, or in a native engine the OS can start. */
export interface Feature {
  name: string;
  /** the OS may run it with the app closed, such as a sync worker */
  runsWhileAppClosed: boolean;
  /** needs a platform API with no maintained JavaScript wrapper, such as a Bluetooth stack */
  needsPlatformApi: boolean;
  /** holds keys or tokens that must stay out of JavaScript */
  holdsKeyMaterial: boolean;
  /** the longest unbroken stretch of work on one call, in milliseconds */
  longestBlockMs: number;
  /** data moved through it, in megabytes per second */
  sustainedMBps: number;
}

export type Placement = "react-native" | "native-module" | "native-engine";

// Starting points. A frame lasts 16 ms at 60 fps, so half of it is the longest a call should hold the JS thread.
export const LIMITS = { blockMs: 8, MBps: 1 };

// region: place
export function place(f: Feature): { placement: Placement; reasons: string[] } {
  const reasons: string[] = [];
  if (f.runsWhileAppClosed) reasons.push("the OS starts it with no screen, so it can't depend on the UI runtime");
  const toModule: string[] = [];
  if (f.needsPlatformApi) toModule.push("needs a platform API");
  if (f.holdsKeyMaterial) toModule.push("keys must stay out of JavaScript");
  if (f.longestBlockMs > LIMITS.blockMs) toModule.push(`blocks the JS thread for ${f.longestBlockMs} ms`);
  if (f.sustainedMBps > LIMITS.MBps) toModule.push(`moves ${f.sustainedMBps} MB/s`);
  reasons.push(...toModule);
  const placement: Placement = f.runsWhileAppClosed ? "native-engine" : toModule.length > 0 ? "native-module" : "react-native";
  return { placement, reasons };
}
// endregion
