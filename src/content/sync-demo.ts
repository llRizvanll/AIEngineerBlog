/* Data for the background-sync article's widgets: conflict strategies, myths, the quiz and sample note titles. */

export type Conflict = { k: string; s: string; w: string; i: string };

export type Quiz = { q: string; o: string[]; a: number; w: string };

export const SYNC_CONFLICTS: Conflict[] = [
  { k: "Profile display name", s: "Last-write-wins", w: "One owner, low cost if an old value briefly wins. The server orders writes by sequence, so the newest accepted write wins everywhere.", i: "Cheap and simple. Never use it where two people edit the same thing." },
  { k: "Patient or job notes", s: "Optimistic concurrency (409 + merge)", w: "The client sends base_version. If someone else changed the record first, the server returns 409 and the app merges or asks the user.", i: "No edit is silently lost. Needs a small merge UI." },
  { k: "Stock count", s: "Operations, not states", w: 'Send "−2 units", never "now 14 units". The server applies operations in order, so two tills never overwrite each other.', i: "The server must validate each operation, such as refusing to go below zero." },
  { k: "Shared document", s: "CRDT (Automerge or Yjs)", w: "Several people type at once, offline. CRDTs merge any order of edits to the same result.", i: "Heavier storage and complexity. Only worth it for real-time collaboration." },
  { k: "Payment or booking", s: "Server-authoritative", w: 'The device proposes; the server decides. The UI shows "pending" until it is confirmed.', i: "Correctness over availability. Explain the offline UX clearly." },
  { k: "App settings", s: "Last-write-wins per field", w: "Each setting is independent, so merge field by field and let the latest accepted write win for each.", i: "Field-level versions avoid one toggle wiping another." },
];

export const SYNC_MYTHS: [string, string][] = [
  ["A foreground service keeps sync alive forever.", "Android 14+ requires a declared service type, and Android 15 limits dataSync services to about 6 hours a day. Use WorkManager or a user-initiated data transfer job."],
  ["Silent push lets me sync whenever I want.", "iOS throttles and coalesces silent pushes, and FCM high priority has quotas. Push is a hint. Keep a periodic job and foreground sync as the safety net."],
  ["updated_at is good enough for a sync cursor.", "Clocks drift and same-millisecond writes get skipped. Use a server-assigned sequence per partition."],
  ["React Native can run the sync loop in JS.", "The JS runtime may be gone when the OS wakes you. Put scheduling, transfers and the sync engine in native code."],
  ["Retrying a failed POST is always safe.", "Not without an op_id. The first request may have succeeded before the network dropped. The server must dedupe by a client-generated ID."],
  ["Background URLSession survives everything.", "It survives the system suspending or terminating your app, but a user swipe-kill cancels its transfers. Resume from saved parts on launch."],
];

export const SYNC_QUIZ: Quiz[] = [
  { q: "Why is a server sequence cursor safer than updated_at?", o: ["It is faster to index", "Clocks drift and same-millisecond writes get skipped", "JSON cannot store dates", "iOS has no timestamps"], a: 1, w: "A server sequence is one total order that never depends on a device clock." },
  { q: "A user swipe-kills the iOS app mid-upload. What happens to background URLSession transfers?", o: ["They keep running in the system daemon", "They are cancelled until the app launches again", "They finish, but the app is never told", "iOS converts them into silent pushes"], a: 1, w: "System termination is survivable; a user force-quit is not. Your saved parts make the restart cheap." },
  { q: "Best Android 14+ tool for a 3 GB upload the user just started?", o: ["PeriodicWorkRequest", "An exact alarm", "A user-initiated data transfer job", "Headless JS"], a: 2, w: "UIDT jobs are built for long, user-visible transfers and are not bound by normal job quotas." },
  { q: "What makes retrying a push safe?", o: ["HTTP/2", "A client-generated op_id the server dedupes", "A longer timeout", "Sending the whole record"], a: 1, w: "The server returns the original result for an op_id it has already applied." },
  { q: "First install for a user with 2 million rows?", o: ["Page through the API 500 rows at a time", "Download a prebuilt CDN snapshot, then pull deltas", "Stream it over a WebSocket", "Ask the user to keep the app open overnight"], a: 1, w: "Snapshots turn hours of paging into one compressed download, then the cursor takes over." },
];

export const SYNC_TITLES = ["Valve 3 leaking", "Pump room B checked", "Meter photo taken", "Panel cover missing", "Fire door OK", "Gauge reads 4.2 bar", "Ladder tagged out", "Cable tray loose"];
