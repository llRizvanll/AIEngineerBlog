/* Every React Native page on the portal, in the order to read them. [href, why it is here] */
export interface HubGroup {
  title: string;
  blurb: string;
  items: [string, string][];
}

export const RN_HUB: HubGroup[] = [
  {
    title: "1. How it runs",
    blurb: "Start with what changed underneath, and which thread does what.",
    items: [
      ["/modules/rn-new-architecture", "JSI, Fabric, TurboModules and the four threads. Includes the numbers that circulate, and how far to trust them."],
      ["/modules/mobile-startup-performance", "Cold start from tap to first frame, on any stack."],
    ],
  },
  {
    title: "2. State, rendering and lists",
    blurb: "Most slowness comes from redrawing too much.",
    items: [
      ["/modules/rn-state-render-storms", "Four kinds of state, where each lives, and the selector patterns that cause render storms."],
      ["/deep/frontend-arch", "Screen state machines, per-row sync states and the front-end side of offline-first."],
    ],
  },
  {
    title: "3. Structure for many teams and apps",
    blurb: "How to keep a large codebase changeable.",
    items: [["/modules/rn-white-label-modularity", "The modularity ladder, a boundary checker, and a test for whether a feature can be removed."]],
  },
  {
    title: "4. Memory",
    blurb: "A leak can sit in three heaps at once.",
    items: [["/modules/rn-memory-leaks", "The staircase test, the listener that never leaves, and which tool finds which leak."]],
  },
  {
    title: "5. Offline and background work",
    blurb: "Start with the React Native side, then read the whole system.",
    items: [
      ["/modules/rn-offline-queue", "What to persist and where, with a tested mutation queue."],
      ["/series/rn", "What React Native can and cannot do after the JS runtime is gone."],
      ["/deep/sync-engine", "The sync run, from trigger to server answer."],
      ["/deep/background-layer", "What Android and iOS allow while your app is closed."],
      ["/deep/transfer-manager", "Large files, in resumable parts."],
      ["/deep/server-sync", "The server's half: versions, merges and notifications."],
      ["/series/background-sync", "The full background sync article."],
    ],
  },
  {
    title: "6. Native boundary, security and budgets",
    blurb: "Decide what goes native, and stop regressions in CI.",
    items: [
      ["/modules/rn-native-boundary-budgets", "The 95/5 rule, a placement function, and a budget gate that judges medians."],
      ["/modules/mobile-security-tokens", "Tokens, Keystore, pinning and tampering."],
      ["/modules/mobile-observability-rollouts", "Crashes, ANRs and rollout gates."],
    ],
  },
  {
    title: "7. Practise",
    blurb: "Build it, then say it out loud.",
    items: [
      ["/mobile-coding/outbox", "Write the outbox yourself."],
      ["/mobile-coding/resumable-upload", "Resumable uploads."],
      ["/mobile-coding/backoff", "Backoff with jitter."],
      ["/interview/offline-field", "A full system design round on an offline field app."],
      ["/paths/mobile-principal", "The two-week programme that uses all of this."],
      ["/reels/c-rn", "React Native reels."],
    ],
  },
];
