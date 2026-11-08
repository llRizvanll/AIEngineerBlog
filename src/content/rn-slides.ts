/* Slides from the three source decks, shown beside the page they illustrate. Files live in public/slides/rn.
   A "flag" says where the slide's figures or flow differ from what the page teaches. */
export interface Slide {
  file: string;
  alt: string;
  caption: string;
  flag?: string;
}

const NUM = "The headline figure on this slide is a circulating claim. See the table above before quoting it.";

export const RN_SLIDES: Record<string, Slide[]> = {
  "rn-new-architecture": [
    { file: "bridge-to-jsi", alt: "Slide comparing the legacy bridge with JSON serialisation to JSI and Fabric with direct C++ calls", caption: "Legacy bridge on the left, JSI and Fabric on the right.", flag: NUM },
    { file: "serialization-bottleneck", alt: "Slide showing JavaScript and native threads connected by an asynchronous bridge, then by synchronous JSI", caption: "Why serialisation was the bottleneck, and what direct calls change.", flag: NUM },
    { file: "four-thread-engine", alt: "Timeline of four threads: UI, JS, native modules and render, with Reanimated animation on the UI thread", caption: "The four threads over 80 ms. The animation runs on the UI thread, outside JS." },
    { file: "tri-thread-model", alt: "Diagram of the JavaScript thread, UI thread and native module thread, linked by synchronous JSI calls", caption: "The JS, UI and native threads, and what each handles." },
    { file: "turbomodule-startup", alt: "Stacked native modules loaded at launch versus core modules loaded first and the rest lazily", caption: "Everything loaded at launch, against core modules first and the rest on demand.", flag: NUM },
    { file: "jsi-sync-disk", alt: "Comparison of an asynchronous bridge with direct C++ memory binding to a native SQLite database", caption: "Direct bindings let JavaScript read the local database without a bridge.", flag: "The 33% memory figure on this slide has no source we could check." },
  ],
  "rn-state-render-storms": [
    { file: "state-layers", alt: "Layered diagram of server state, global client state, local component state and navigation state, each with its tool", caption: "Four kinds of state, each with its own tool." },
    { file: "state-matrix", alt: "Matrix of server state, global client state, persisted device state and ephemeral state", caption: "The same sorting as a matrix, with the anti-pattern called out." },
    { file: "reactive-hell", alt: "Diagram of one state update causing fifty unnecessary re-renders through a broad selector", caption: "One update, fifty redraws, caused by a broad selector.", flag: "The core idea is right. The thread-contention detail on the slide is simplified." },
    { file: "flatlist-flashlist", alt: "Comparison of FlatList mounting and unmounting views with FlashList recycling a fixed pool", caption: "FlatList churns views as rows scroll. FlashList recycles a fixed pool." },
    { file: "anti-patterns", alt: "Table pairing architectural anti-patterns with robust alternatives", caption: "Three anti-patterns and their fixes." },
    { file: "tooling-stacks", alt: "Two tooling stacks: Redux Toolkit with RTK Query for regulated apps, and TanStack Query with Zustand and WatermelonDB for lightweight apps", caption: "Two sensible stacks, chosen by team size and compliance needs." },
  ],
  "rn-white-label-modularity": [
    { file: "feature-modules", alt: "Feature folders for auth, user profile and sync each with a TypeScript public API, inside a monolith with a brownfield interface", caption: "Feature folders with public APIs, hosted inside an existing native app." },
    { file: "white-label-skeleton", alt: "Layers of presentation, feature modules, domain and data, with the 95/5 rule and a note that removing a feature takes one pull request", caption: "A shared skeleton, with features removable in one pull request." },
  ],
  "rn-memory-leaks": [
    { file: "three-layer-trap", alt: "JavaScript heap, JSI host object boundary and native heap shown as three linked layers", caption: "Why a leak crosses all three layers.", flag: "Slide figures about growth per navigation differ between decks. Use your own slope." },
    { file: "oom-anatomy", alt: "Chain from an uncleaned event emitter to a retained Activity, failed garbage collection and an out of memory crash", caption: "How an uncleaned listener turns into an out-of-memory crash.", flag: "Slide figures about growth per navigation differ between decks. Use your own slope." },
    { file: "tri-layer-memory", alt: "The JavaScript heap, JSI boundary and native object graph shown together", caption: "The three layers of memory in one picture." },
    { file: "leak-matrix", alt: "Matrix of architectural layers, leak symptoms and the tool to diagnose each", caption: "Which tool finds a leak in which layer." },
    { file: "profiling-toolchain", alt: "Memory climbing in a staircase pattern, with Android Studio, Xcode Instruments and crash reporting tools", caption: "The staircase pattern, and the tools that confirm it." },
    { file: "background-memory", alt: "Danger zone for background tasks: uncleaned emitter listeners, captured closures and retained host objects", caption: "Background tasks leak the same ways, and the cleanup is the same.", flag: "The slide calls a garbage-collection trigger. There is no portable call for that, so use cleanup." },
  ],
  "rn-offline-queue": [
    { file: "fragile-memory", alt: "A global in-memory store losing uncommitted data when the OS terminates the app", caption: "Why in-memory state loses unsent changes.", flag: "The crash-rate figure on this slide has no source we could check." },
    { file: "four-pillars", alt: "Four pillars: optimistic UI, in-memory client state, persistent SQLite queue and background sync worker", caption: "The four parts of an offline design." },
    { file: "isolate-mutation", alt: "A large state blob contrasted with a small granular mutation payload", caption: "Persist the small mutation, and not the whole state." },
    { file: "sqlite-queue", alt: "Schema of an offline sync queue table with id, type, payload, retry count, status and timestamp", caption: "The queue table, indexed for oldest-first reads." },
    { file: "background-worker", alt: "Flow from network restored through a headless task that queries SQLite for pending jobs and calls the API", caption: "A worker wakes, reads pending rows and sends them.", flag: "A headless JavaScript task can be stopped early. Long syncs belong in a native worker." },
    { file: "sync-lifecycle", alt: "States pending, in flight, acknowledged and conflict, with success deleting the row and errors rolling back the optimistic UI", caption: "The lifecycle of one queued change.", flag: "Our queue splits the error branch: a 409 is a conflict, other 4xx fail, and 5xx retry with backoff." },
    { file: "data-journey", alt: "The full journey from user tap through SQLite, the OS worker, the server acknowledgement and cache invalidation", caption: "One change, from tap to server acknowledgement." },
    { file: "resumable-transfers", alt: "Standard API calls through TanStack Query contrasted with heavy resumable transfers handled by native modules", caption: "Small JSON through the query layer, large files through native transfer code." },
  ],
  "rn-native-boundary-budgets": [
    { file: "hybrid-95-5", alt: "React Native for UI and logic against pure native for transfer managers, sync engines and Bluetooth", caption: "Orchestrate both. Do not choose between them." },
    { file: "hardware-keys", alt: "JavaScript layer calling a JSI native module that uses AES-GCM and Android Keystore or iOS Keychain", caption: "Keys stay in secure hardware, and JavaScript gets results." },
    { file: "optimization-checklist", alt: "Checklist of cold start, scroll frame rate, JS memory and install size targets", caption: "Example budgets. Set yours from your own baseline.", flag: "The numbers are examples from the deck, and not standards." },
    { file: "execution-checklist", alt: "Checklist across architecture, performance, state and data, and security and quality", caption: "A rollout checklist across the four areas." },
  ],
};
