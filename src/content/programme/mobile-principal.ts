/* Two weeks, one story. Week 1 follows a single edit from a tap in a basement to a supervisor's
   tablet. Week 2 reuses the same parts in other products and changes one constraint per day. */

export type ItemKind = "Read" | "Build" | "Recall" | "Mock" | "Stretch";

export interface DayItem {
  kind: ItemKind;
  href: string;
  minutes: number;
  /** what to look for, and what to skip */
  focus: string;
}

export interface Day {
  n: number;
  week: 1 | 2;
  /** two or three words, used in the rail */
  stop: string;
  title: string;
  /** the question this day answers */
  question: string;
  story: string[];
  idea: [string, string[]][];
  artifact?: { title: string; lang: string; code: string; note: string };
  /** decision, chosen, rejected, why */
  decisions: string[][];
  items: DayItem[];
  canDo: string[];
  check: [string, string][];
  /** only on mock days: tick what you actually did */
  rubric?: string[];
  tomorrow: string;
}

export const THREE_QUESTIONS = [
  ["Where does it live?", "If the process dies right now, what survives, and in which table or file?"],
  ["Who runs the next step?", "With the app closed, which part of the OS or server moves this forward?"],
  ["What if it runs twice?", "Retries always happen. Which key or rule makes the second run harmless?"],
];

export const DAYS: Day[] = [
  {
    n: 1,
    week: 1,
    stop: "Basement",
    title: "A leaking valve, two floors underground",
    question: "Why can't a mobile app treat the server as its source of truth?",
    story: [
      "Priya inspects pump stations for a pipeline company. At 2:40 pm she stands two floors underground on job j-84, with no signal, and valve 3 is leaking. She opens the checklist and changes valve 3 from ok to leaking.",
      "That single edit runs through this whole programme. By Day 8 you can say what happens to it at every step: where it sits on disk, who wakes the app, what the server decides, and how her supervisor's tablet finds out. Week 2 then reuses those same parts to design chat, checkout and a feed.",
    ],
    idea: [
      ["Two facts shape every mobile design", [
        "A server stays on and stays connected. A phone does neither. Networks drop without warning, and Android and iOS suspend or kill your process whenever they want memory or battery back.",
        "So the ordinary design fails here. If tapping Save calls the API, Priya sees a spinner in a basement, and the edit disappears if the OS kills the app before the call returns.",
      ]],
      ["The answer: read and write locally", [
        "The screen reads from a database on the phone, and a save writes to that database. A separate sync process moves changes to the server when the OS allows it. The screen never waits on the network, so the app feels instant with full signal or none. People call this design offline-first.",
      ]],
      ["Three questions you will ask every day", [
        "Each day of this programme answers the same three questions for one more part of the system. A panel listens for them too, whether or not it says so.",
      ]],
    ],
    artifact: {
      title: "Same tap, two designs",
      lang: "kotlin",
      code: `// Loses the edit: the process can die before this call returns.
viewModelScope.launch {
  api.updateJob("j-84", mapOf("answers.valve_3" to "leaking"))
}

// Survives: the edit is on disk before the screen changes.
viewModelScope.launch {
  jobs.setAnswer("j-84", "valve_3", "leaking")   // local transaction
  // Nothing else here. Sync runs later, even with this screen gone.
}`,
      note: "The second version has no network call at all. Day 2 opens up setAnswer.",
    },
    decisions: [["What does the screen read from?", "Local database", "API response cached in memory", "A memory cache dies with the process and shows nothing in a basement."]],
    items: [
      { kind: "Read", href: "/series/background-sync", minutes: 30, focus: "Read for what each OS allows while your app is closed. Skim the code; Days 2 to 4 return to it." },
      { kind: "Recall", href: "/reels/c-found", minutes: 5, focus: "Swipe through once. Say each answer before you reveal it." },
    ],
    canDo: ["Explain why an API call on Save loses data", "Describe offline-first in two sentences", "Ask the three questions about any feature"],
    check: [
      ["Priya's phone has full signal. Should the save still go through the local database first?", "Yes. One write path means one set of bugs. With a single path, signal changes nothing the user can see, except how soon the change reaches the server."],
      ["What is the biggest cost of offline-first?", "Two copies of the truth can disagree. You now owe a sync engine and a conflict policy, which is what Days 4 and 5 cover. It suits apps where people must work without signal, and it is overkill for a read-only news app."],
    ],
    tomorrow: "Priya's edit exists only as a tap so far. Tomorrow it reaches disk, in a way no crash can split in half.",
  },
  {
    n: 2,
    week: 1,
    stop: "Save",
    title: "One transaction, two rows",
    question: "How do you save an edit so a crash can never lose it or half-send it?",
    story: [
      "Priya taps leaking. In one SQLite transaction, the app updates job j-84 and inserts a row into a table called the outbox. The whole thing takes a few milliseconds. The query behind the screen emits again, and valve 3 shows a small clock meaning not yet sent.",
      "At 3:05 pm she pockets the phone, and Android later kills the app to free memory. Nothing is lost. The edit and the record of what must be sent both sit on disk, waiting for something to run them.",
    ],
    idea: [
      ["Why one transaction matters", [
        "Write the job, crash, and never write the outbox row: the edit looks saved but never leaves the phone. Write the outbox row first and crash: the server gets a change the phone doesn't show. One transaction removes both cases, because both rows commit or neither does.",
      ]],
      ["What the outbox row carries", [
        "The op_id is generated on the device, and it doubles as the idempotency key: if the same op arrives twice, the server applies it once. The base version records what Priya was looking at when she edited, which is how Day 5 will detect the collision.",
      ]],
      ["Keeping the database fast", [
        "WAL mode lets the screen keep reading while sync writes. Short transactions keep the single writer free. Design tables and indexes from the screens' queries, and page with keys rather than OFFSET, so a million rows cost the same as a thousand.",
        "Migrations deserve extra care: a user can skip eleven versions with unsent edits in the outbox, and those edits must survive the upgrade.",
      ]],
    ],
    artifact: {
      title: "Priya's save, as the database sees it",
      lang: "sql",
      code: `BEGIN IMMEDIATE;

UPDATE job
   SET answers_json = json_set(answers_json, '$.valve_3', 'leaking'),
       sync_state   = 'pending',
       updated_at   = :now
 WHERE id = 'j-84';

INSERT INTO outbox (op_id, entity, entity_id, op, payload_json, base_version, status)
VALUES ('0192e0c4-7f3a', 'job', 'j-84', 'update',
        '{"answers.valve_3":"leaking"}', 4, 'pending');

COMMIT;`,
      note: "Remember op 7f3a and base version 4. You will see them again on Days 4, 5 and 6.",
    },
    decisions: [["Where do pending writes live?", "Outbox table in the same database", "An in-memory queue or WorkManager input data", "Only the same database lets the data and the pending write commit together."]],
    items: [
      { kind: "Read", href: "/series/sqlite", minutes: 25, focus: "Focus on WAL, short transactions and migrations. Full-text search can wait." },
      { kind: "Build", href: "/mobile-coding/outbox", minutes: 40, focus: "Write it yourself before reading the solution. Then ask of each line: what if the process dies here?" },
      { kind: "Recall", href: "/reels/c-data", minutes: 5, focus: "Persistence and UI reels." },
      { kind: "Read", href: "/modules/rn-offline-queue", minutes: 20, focus: "The React Native side of today: persist the mutation, keep it atomic with the local write, and keep conflicts visible." },
    ],
    canDo: ["Write the schema for job and outbox from memory", "Explain why both rows share a transaction", "Say what op_id and base_version are for"],
    check: [
      ["Why generate op_id on the device instead of the server?", "The device must be able to retry without knowing whether the first attempt arrived. Only an ID that exists before the first send makes a retry recognisable."],
      ["The outbox holds 500 rows and the user edits again. Merge the rows or append?", "Append by default, because it preserves order and intent. Compact only where it is safe, such as two edits to the same field before either one was sent."],
    ],
    tomorrow: "The edit is safe, but it is going nowhere, and the app isn't running. Tomorrow: who starts the app again?",
  },
  {
    n: 3,
    week: 1,
    stop: "Wake-up",
    title: "Ninety-two minutes of nothing",
    question: "With the app closed, who decides when your code runs?",
    story: [
      "From 2:40 to 4:12 pm, none of your code runs. That is correct behaviour: a phone that polled from a basement would burn battery and achieve nothing.",
      "At 4:12 pm Priya climbs the stairs and the phone finds a network. Android sees that a waiting job's network condition is now met, starts your process in the background, and calls the sync worker with a budget of about eight minutes. No screen opens. Priya has no idea it happened.",
    ],
    idea: [
      ["You ask, the OS decides", [
        "You can't schedule background work on a phone. You can only request it with conditions, and the OS picks the moment based on battery, network and how often the user opens your app.",
        "Android's WorkManager keeps your request across reboots and honours conditions such as requires network. iOS gives far less: BGTaskScheduler runs when the system chooses, which may be hours later. On iOS, sync when the app opens carries more of the weight, and background URLSession handles big transfers.",
      ]],
      ["Many triggers, one job", [
        "In one minute a phone can produce five reasons to sync: an edit, the app backgrounding, Wi-Fi returning, a push and a timer. Starting five syncs wastes battery and creates races. A trigger hub coalesces them into one unique job.",
      ]],
      ["Budgets are real", [
        "The worker may be stopped at any time. So the engine must stop cleanly at its budget and report whether work remains. A follow-up job handles the rest, and nothing depends on one run finishing.",
      ]],
    ],
    artifact: {
      title: "The same request, in Android's API",
      lang: "kotlin",
      code: `fun requestSync(context: Context, reason: String) {
  val work = OneTimeWorkRequestBuilder<SyncWorker>()
    .setConstraints(
      Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()
    )
    .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
    .setInputData(workDataOf("reason" to reason))
    .build()

  // KEEP: five triggers in one minute still mean one job.
  WorkManager.getInstance(context)
    .enqueueUniqueWork("sync", ExistingWorkPolicy.KEEP, work)
}`,
      note: "This one uses the Android API, so it runs on a device rather than in our tests. Priya's save called it at 2:40 pm, and the job waited 92 minutes.",
    },
    decisions: [["How do you keep sync running on Android?", "Unique WorkManager job with a network constraint", "A long-running service", "A service with no user-visible purpose gets killed, and Android restricts starting one from the background."]],
    items: [
      { kind: "Read", href: "/deep/background-layer", minutes: 20, focus: "Read the real-life run about Meera first, then the platform table. Compare Android and iOS line by line." },
      { kind: "Recall", href: "/reels/c-android", minutes: 5, focus: "Android reels." },
      { kind: "Recall", href: "/reels/c-ios", minutes: 5, focus: "iOS reels. Note each thing iOS will not do for you." },
    ],
    canDo: ["Explain why background timing is a request, not a schedule", "Compare what Android and iOS allow", "Explain how five triggers become one job"],
    check: [
      ["With KEEP, an edit arrives during a running sync. Is it lost?", "No, it is in the outbox. The engine re-reads the outbox before finishing and reports more pending, and the worker queues a follow-up."],
      ["A manufacturer's phones run periodic jobs 70% less often. What do you do?", "Measure it per device class first. Then guide affected users to battery settings and rely more on sync when the app opens. The sync engine itself needs no change, since this layer exists to absorb such differences."],
    ],
    tomorrow: "The worker has started and has eight minutes. Tomorrow it does its job: 37 ops up, 140 changes down.",
  },
  {
    n: 4,
    week: 1,
    stop: "Sync run",
    title: "2.1 seconds at 4:12 pm",
    question: "What exactly happens in one sync run, and how does it recover from a failure at any step?",
    story: [
      "The worker calls the sync engine, which takes a single-flight lock so no second run can overlap, and reads its saved cursor, c_88411. That cursor means: I have seen every change up to here.",
      "First it pushes. The outbox holds 37 ops from Priya's day, sent in batches of 25 and 12. The server answers 36 applied and 1 conflict. The conflict is op 7f3a. One local transaction deletes the 36 finished ops and marks their jobs synced, then marks j-84 as conflict and stores the server's value beside hers.",
      "Then it pulls: changes after c_88411. It receives 140, applies them in one transaction, and stores c_88551 in that same transaction. The run took 2.1 seconds. Priya glances down and sees eleven green ticks and one amber needs review.",
    ],
    idea: [
      ["Push first, then pull", [
        "Pushing first means the pull returns the merged result of your own changes too, so the phone ends the run matching the server. Pulling first would apply changes you are about to affect, and you would need another pull anyway.",
      ]],
      ["Save the cursor with the data", [
        "If the cursor commits after the changes and the app dies in between, you pull the same changes again, which is harmless if applying is idempotent. Committing them together removes even that. Saving the cursor first is the real bug: a crash then skips changes forever.",
      ]],
      ["Each failure has one response", [
        "Offline: stop, and let the network constraint wake you. A 429 or 5xx: back off with jitter, keep the op. A 4xx validation error: park that op and tell the user, so one bad op doesn't block everything behind it forever.",
      ]],
    ],
    artifact: {
      title: "Op 7f3a on the wire",
      lang: "http",
      code: `POST /v1/sync/push
{ "device_id": "d-7f2", "ops": [
  { "op_id": "0192e0c4-7f3a", "entity": "job", "id": "j-84",
    "op": "update", "base_versions": { "answers.valve_3": 4 },
    "fields": { "answers.valve_3": "leaking" } } ] }

→ { "results": [{ "op_id": "0192e0c4-7f3a", "status": "conflict",
     "server": { "value": "replaced", "version": 5, "by": "dev" } }] }

GET /v1/sync/pull?cursor=c_88411&limit=500
→ { "changes": [ … 140 … ], "next_cursor": "c_88551", "has_more": false }`,
      note: "Why did the server refuse, and who is Dev? That is tomorrow.",
    },
    decisions: [["How do you stop parallel sync runs?", "Single-flight lock in the engine", "Trust the scheduler alone", "Sync can also start when the app opens, outside the scheduler, so only the engine sees every caller."]],
    items: [
      { kind: "Read", href: "/deep/sync-engine", minutes: 25, focus: "This is the same run from the coordinator's view. Find each number from today in its diagram." },
      { kind: "Build", href: "/mobile-coding/backoff", minutes: 30, focus: "Exponential backoff with jitter. Ask why jitter matters when 200,000 phones retry at once." },
      { kind: "Recall", href: "/reels/c-proto", minutes: 5, focus: "Sync protocol reels." },
    ],
    canDo: ["Narrate a whole sync run from memory", "Explain push before pull", "Handle a crash at each step"],
    check: [
      ["The phone dies after the server applied the push but before it got the response. What happens?", "On the next run the ops are still in the outbox, so they go again. The server sees known op_ids and returns the stored results. Nothing applies twice, and that is exactly why op_id exists."],
      ["Why must the pull apply in one transaction?", "The screen must never show half a page of changes. One transaction also lets the query emit once, so the list redraws once."],
    ],
    tomorrow: "Thirty-six ops went through and one did not. Tomorrow: two people changed one valve, and no clock can settle it.",
  },
  {
    n: 5,
    week: 1,
    stop: "Collision",
    title: "Leaking or replaced?",
    question: "When two people change the same thing offline, who wins?",
    story: [
      "At 3:30 pm, while Priya was underground, her supervisor Dev took a call from a contractor who said valve 3 on j-84 had been swapped last week. Dev set it to replaced, which took the job to version 5. Priya's op says base version 4.",
      "Who is right? Priya has seen water on the floor. Dev has a contractor's word. A newest-timestamp rule would pick Priya because her sync came later, or Dev because his edit did, and either way it silently deletes a safety fact.",
      "On job j-81 the same thing happened with no drama: Dev changed the instructions, Priya changed an answer, and the server merged both because they touched different fields.",
      "So at 4:14 pm Priya opens the amber badge and sees both values with their authors. She keeps leaking, adds a note, and the app writes a new op with base version 5. Version 6 reaches the server. Nothing vanished.",
    ],
    idea: [
      ["Conflict policy is a product decision", [
        "The question isn't which algorithm is best. It is what a reasonable person expects. Two edits to different fields should both survive. Two edits to a safety field need a human. A read marker can use the latest value and nobody will mind.",
      ]],
      ["Pick a policy per field", [
        "Write one table, field by field, and get product to sign it. Engineering owns the mechanism: per-field versions, so that unrelated edits never collide, and a 409-style reply that carries the current value.",
      ]],
      ["Never trust the phone's clock", [
        "People change clocks and batteries die. Compare device timestamps and a phone set a day ahead wins every conflict. Where last-write-wins does fit, use a hybrid logical clock, which never runs backwards and stays near real time.",
      ]],
    ],
    decisions: [
      ["answers.valve_3", "Ask the user", "Last write wins", "A safety fact must not disappear silently."],
      ["instructions", "Last write wins, with an HLC", "Ask the user", "Only supervisors edit it, and a prompt would only annoy technicians."],
      ["photos", "Add-only set", "Replace", "Two people adding photos never disagree."],
    ],
    items: [
      { kind: "Read", href: "/series/conflicts", minutes: 20, focus: "The table of four policies is the key part. Then read what the user sees, because the screen makes or breaks the policy." },
      { kind: "Mock", href: "/interview/offline-field", minutes: 15, focus: "Don't do the whole round yet. Open the failure modes and trade-offs, and say each decision out loud." },
    ],
    canDo: ["Build a policy table for any entity", "Explain why timestamps fail", "Describe what the user sees during a conflict"],
    check: [
      ["When would you need a CRDT rather than a field merge?", "When several people edit the same text or list at once and every keystroke must merge. For a form with fields, per-field versions are far cheaper and easier to explain."],
      ["Who should choose the policy for a new field?", "Product chooses the rule, because it decides what users experience. Engineering builds the mechanism and points out where a rule can't be met."],
    ],
    tomorrow: "You have seen the server's answer from the phone's side. Tomorrow you go inside the server, and meet the 5 million phones that come with it.",
  },
  {
    n: 6,
    week: 1,
    stop: "Server",
    title: "Inside the push, and out to Dev's tablet",
    question: "How does one server stay correct and alive when every phone retries?",
    story: [
      "Priya's two batches reach different API pods. For each op the pod opens one transaction: check op_id, merge the fields, update the row, take the next sequence number for this tenant, and write to the change log. Her edit on j-81 gets the next number in the log.",
      "Then her phone hops between cell towers and never receives the answer to batch two. The engine resends the same 12 ops. The server finds their op_ids, returns the stored results and writes nothing.",
      "From there, Debezium reads the change log out of Postgres and publishes to Kafka. A notifier coalesces changes per user and sends Dev's tablet one push: changes available. The tablet pulls after its own cursor and shows the new state. No server ever pushed data at it; push only said to come and look.",
    ],
    idea: [
      ["Do the arithmetic first", [
        "The inspection app has 120,000 active technicians, which works out to about 42 sync requests per second on average and about 400 at peak. That fits on a modest cluster. The hard moment is an outage: everyone returns at once.",
      ]],
      ["Sequence numbers make the cursor work", [
        "A cursor can only promise I have seen everything up to here if numbers appear in commit order. So each tenant gets one ordered sequence, and the change log becomes the single thing every device reads.",
      ]],
      ["Protect the API from its own clients", [
        "Phones retry forever, in step. Send Retry-After, have clients add jitter, and rate limit per device, so that recovery doesn't become a second outage.",
        "Deletions need tombstones, kept for a window such as 90 days. A device older than that window gets a 410 and rebuilds from a snapshot.",
      ]],
    ],
    artifact: {
      title: "One op, one server transaction",
      lang: "sql",
      code: `BEGIN;

-- A retry inserts nothing here, and the stored result goes back instead.
INSERT INTO applied_op (op_id, tenant_id, result)
VALUES ('0192e0c4-9c21', 't1', :result)
ON CONFLICT (op_id) DO NOTHING;

UPDATE job
   SET answers = jsonb_set(answers, '{valve_3}', '"leaking"'), version = version + 1
 WHERE id = 'j-81';

-- This row lock orders commits, so cursors never skip a change.
UPDATE tenant_seq SET seq = seq + 1 WHERE tenant_id = 't1' RETURNING seq;  -- :next

INSERT INTO change_log (tenant_id, seq, entity, entity_id, fields)
VALUES ('t1', :next, 'job', 'j-81', '{"answers.valve_3":"leaking"}');

COMMIT;`,
      note: "The dedupe, the write and the log entry commit together, the same trick as Day 2's outbox, now on the server.",
    },
    decisions: [["How do devices learn about changes?", "Push says changes available, then the device pulls by cursor", "Push carries the data", "Pushes get dropped and throttled. The pull is the guarantee, and the push is only a hint."]],
    items: [
      { kind: "Read", href: "/deep/server-sync", minutes: 25, focus: "Follow the retry and the 120-day-old tablet through the protocol." },
      { kind: "Read", href: "/series/backend", minutes: 20, focus: "Read this as the same design at 5 million devices. Watch which parts change: partitioning and fan-out." },
      { kind: "Build", href: "/mobile-coding/rate-limiter", minutes: 30, focus: "A token bucket: what stops one broken client from taking everyone down." },
      { kind: "Recall", href: "/reels/c-scale", minutes: 5, focus: "Backend and scale reels." },
    ],
    canDo: ["Walk through a push transaction", "Explain how a device catches up by cursor", "Plan for an outage's return traffic"],
    check: [
      ["Why not simply use a database auto-increment for the cursor?", "Auto-increment values get assigned before commit, so a slower transaction can commit a lower number after a client has read past it. That client then misses a change forever. Taking the sequence under a per-tenant lock prevents this."],
      ["A tablet has been off for 120 days. What happens?", "Its cursor is older than the 90-day tombstone window, so deletes it needs may be gone. The server returns 410 and a snapshot URL, and the tablet rebuilds locally. Unsent ops must still push first."],
    ],
    tomorrow: "Text is small. Tomorrow a teammate records a 412 MB video in a pump room, and the outbox alone can't carry that.",
  },
  {
    n: 7,
    week: 1,
    stop: "Big files",
    title: "Arjun's 412 MB video",
    question: "How do you move a huge file over a bad network from an app the user can close?",
    story: [
      "Arjun, on Priya's crew, films a pump room and taps Submit. The app copies the 412 MB file into its own storage, hashing it on the way, and asks the server to start. The server returns 52 presigned URLs of 8 MB each, so the bytes go straight to object storage and never touch your API.",
      "At part 20 the phone moves from Wi-Fi to 4G. Three parts fail and retry. At part 31 the URLs expire, so the app fetches fresh ones for the remaining parts only. At part 38 Arjun swipes the app away, and iOS cancels the transfers. An hour later he opens the app, it reads a table showing 37 parts done, and it finishes the rest.",
      "Total bytes sent twice: about 32 MB of 412 MB. Without part checkpoints, the swipe alone would have cost 296 MB.",
    ],
    idea: [
      ["Separate the bytes from the record", [
        "The inspection syncs first through the normal outbox, and it just says a video is coming. The file follows on its own track. That way a slow upload never blocks Priya's 37 small edits.",
      ]],
      ["The three questions, again", [
        "Where does it live? In app storage, with one row per part. Who runs the next step? WorkManager with a foreground service on Android, and a background URLSession on iOS. What if it runs twice? A part is safe to resend, and the file hash lets the server skip a file it already has.",
      ]],
      ["Trust nothing until it's verified", [
        "The server checks the final hash before it links the video to the job. Until then the job shows uploading, not done. Tell the user the truth, because they will drive away from the site on the strength of that tick.",
      ]],
    ],
    artifact: {
      title: "Progress that survives being killed",
      lang: "sql",
      code: `CREATE TABLE transfer_part (
  file_id TEXT NOT NULL,
  part_no INTEGER NOT NULL,
  etag    TEXT,               -- NULL until this part succeeds
  PRIMARY KEY (file_id, part_no)
);

-- Arjun reopens the app: which parts still need sending?
SELECT part_no FROM transfer_part
 WHERE file_id = 'f-412' AND etag IS NULL
 ORDER BY part_no;`,
      note: "Part checkpoints are to bytes what the outbox is to edits: durable progress that a retry can pick up.",
    },
    decisions: [["How do bytes reach storage?", "Presigned URLs, straight to object storage", "Upload through your API", "At 48 TB a day, your API servers would become an expensive, fragile proxy."]],
    items: [
      { kind: "Read", href: "/series/uploads", minutes: 20, focus: "Read the protocol, then what each OS permits in the background." },
      { kind: "Read", href: "/deep/transfer-manager", minutes: 20, focus: "Same story, with the state machine behind it." },
      { kind: "Build", href: "/mobile-coding/resumable-upload", minutes: 40, focus: "The core of today. Test it by failing a part and killing it midway." },
      { kind: "Recall", href: "/reels/c-files", minutes: 5, focus: "Huge files reels." },
    ],
    canDo: ["Draw the multipart upload protocol", "Say what each OS allows in the background", "Explain why metadata and bytes travel separately"],
    check: [
      ["How large should a part be?", "Large enough to limit requests and small enough that a failure costs little. 8 MB is a common start on mobile. Object stores also cap the number of parts, so very large files need larger parts."],
      ["iOS killed the app and the background session continues. How does the app learn it finished?", "The system relaunches the app in the background and delivers the session's events. If the user force-quit, iOS cancels the transfers, so the app resumes from the table on next open."],
    ],
    tomorrow: "You now know the whole system. Tomorrow you say it aloud, to a clock, as one 45-minute answer.",
  },
  {
    n: 8,
    week: 1,
    stop: "Mock one",
    title: "Checkpoint: tell the whole story in 45 minutes",
    question: "Can you design the whole system without notes, against a clock?",
    story: [
      "The interviewer says: we're building an app for 200,000 field technicians who work underground for hours and capture large videos. You have heard this story already. You lived through it with Priya and Arjun, and every number on the board has a reason behind it.",
    ],
    idea: [
      ["Week one maps onto the round", [
        "Clarify and estimate come from Day 1 and Day 6. The local schema comes from Day 2, background rules from Day 3, the sync run from Day 4, conflicts from Day 5, the server from Day 6, and media from Day 7. Telling Priya's edit as your key flow gives the panel one thing to follow.",
      ]],
      ["Do it badly first, then compare", [
        "Close everything. Start the timer in the round, draw on paper and speak aloud. Open the reference only afterwards. Then score yourself below and go back to the day that covers your weakest line.",
      ]],
    ],
    decisions: [],
    items: [
      { kind: "Mock", href: "/interview/offline-field", minutes: 45, focus: "Use the timer. Attempt each prompt before you reveal the answer." },
      { kind: "Recall", href: "/revise", minutes: 15, focus: "Rate the cards. The ones you miss come back sooner." },
    ],
    canDo: ["Deliver the offline-first design in 45 minutes", "Name your weakest area with evidence"],
    check: [["You scored 5 of 8. What now?", "Repeat only the days behind the lines you missed, then re-run those sections of the round. Don't restart the week. Week 2 will reinforce what you already know."]],
    rubric: [
      "I asked who is offline, for how long and how much data, before drawing",
      "I did the arithmetic, and it changed a decision",
      "I wrote the local schema with an outbox, in one transaction",
      "I named what each OS allows in the background",
      "I walked one edit from tap to another device, end to end",
      "I gave a conflict policy per field, and described the screen",
      "I handled crashes and retries with idempotency, without being asked",
      "I said what I would measure, and what I rejected and why",
    ],
    tomorrow: "Week 1 ends with the system working. Week 2 starts with what Priya actually saw on screen, then changes the product.",
  },
  {
    n: 9,
    week: 2,
    stop: "Screen",
    title: "Eleven green ticks and one amber badge",
    question: "How does a screen stay simple while all of this happens underneath it?",
    story: [
      "When Priya opens job j-84, the ViewModel subscribes to a database query. The first frame draws from SQLite in about 50 ms, with no network involved. She taps leaking, the query emits, and the row shows a clock. Sync finishes, the query emits, and the clock becomes a tick. A conflict arrives, the query emits, and the row turns amber.",
      "No screen code ever asks about the network. Every change arrives through one door. When 140 pulled changes land in one transaction, the query emits once, and a list diff redraws only the rows that changed.",
      "Now suppose the same company ships a React Native app. When WorkManager wakes it at 4:12 pm, the JavaScript runtime may not be running at all, and React Native screens certainly aren't. So sync must live in native code, and JavaScript just observes the database.",
    ],
    idea: [
      ["Name every state before you build", [
        "Each row is synced, pending, conflict or failed. Each screen is loading, content, empty or error. Design and test every combination, because users always find the one you skipped.",
      ]],
      ["Data flows one way", [
        "The database emits, a reducer produces a new immutable state, and the UI renders it. User intents go back through a repository. This makes screens testable without a network, and it makes bugs traceable.",
      ]],
    ],
    decisions: [["Where does sync live in a React Native app?", "Native module, sharing the database", "JavaScript background task", "The OS can wake you without a running JS runtime, and the work must still happen."]],
    items: [
      { kind: "Read", href: "/deep/frontend-arch", minutes: 25, focus: "The real-life run is j-84 seen from the screen. Then read the state tables." },
      { kind: "Read", href: "/series/rn", minutes: 15, focus: "Who does what when JS isn't running." },
      { kind: "Build", href: "/mobile-coding/list-diff", minutes: 30, focus: "This is how 140 changes redraw without a flash." },
      { kind: "Build", href: "/mobile-coding/search-debounce", minutes: 25, focus: "Cancelling stale work is the same one-way flow with a user typing." },
      { kind: "Recall", href: "/reels/c-rn", minutes: 5, focus: "React Native reels." },
      { kind: "Read", href: "/modules/rn-state-render-storms", minutes: 15, focus: "Why eleven green ticks should not redraw the whole list: where each kind of state lives, and how selectors cause storms." },
    ],
    canDo: ["List every UI state for a synced row", "Explain one-way data flow", "Split native and JS work in React Native"],
    check: [
      ["Why not update the screen directly after a tap and write to the database later?", "Then the screen shows something not on disk, and you own two paths for one fact. Writing first takes milliseconds and gives you one path."],
      ["What is the optimistic update here?", "There is none to roll back. The local write is real and durable. A later conflict is a new state rather than an undo, and that is far simpler."],
    ],
    tomorrow: "Same parts, new product. Tomorrow an edit becomes a chat message, and order suddenly matters.",
  },
  {
    n: 10,
    week: 2,
    stop: "Chat",
    title: "Now the edit is a message",
    question: "What changes when the same design must also feel live?",
    story: [
      "A customer in a lift types running late to a plumber and taps Send. You already know this part: a local insert, an outbox row, and a client-made ID. The message shows one tick straight away, with no signal at all.",
      "When the signal returns, the ID stops a double send, just like op 7f3a. The new part is that the plumber shouldn't wait for a sync job. So messages travel over a live socket while the app is open, and a push wakes the phone when it is closed. If the socket dies, nothing is lost, because history still syncs by cursor, as on Day 4.",
    ],
    idea: [
      ["Live is an optimisation; the cursor is the guarantee", [
        "Sockets drop all the time. Treat them as the fast path, and treat sync by cursor as the correct path. On reconnect the client asks for everything after its last sequence number and fills any gaps.",
      ]],
      ["Order per conversation, not globally", [
        "Day 6 used one sequence per tenant. Chat needs one per conversation, owned by one service instance at a time. That gives correct order without a global lock.",
      ]],
      ["Push is a hint, again", [
        "As on Day 6, push only prompts the app to fetch. Silent pushes get throttled, and payloads can leak onto lock screens, so sensitive content should be fetched on the device.",
      ]],
    ],
    artifact: {
      title: "The outbox row, renamed",
      lang: "json",
      code: `{
  "client_msg_id": "0192e0c5-1b7e",
  "conversation_id": "c-77",
  "text": "running late",
  "state": "pending"
}

// Server reply: same ID, now with a place in the order.
{
  "client_msg_id": "0192e0c5-1b7e",
  "seq": 4182,
  "state": "sent"
}`,
      note: "Compare with Day 2: client_msg_id is op_id, and seq is the change log's sequence.",
    },
    decisions: [
      ["Same from Week 1", "Local first, outbox, client ID, cursor catch-up", "—", "A message is just another offline write."],
      ["New for chat", "Socket while open, push while closed", "Polling, or push alone", "People expect to see replies within a second, and only a live connection does that cheaply."],
    ],
    items: [
      { kind: "Mock", href: "/interview/chat", minutes: 45, focus: "Before you begin, list what you can reuse from Week 1. Spend your time on what is new: sockets, fan-out and receipts." },
      { kind: "Read", href: "/modules/notification-platform-mobile", minutes: 20, focus: "How a push reaches the phone, and why bulk traffic gets its own queue." },
    ],
    canDo: ["Reuse the outbox for messages", "Explain why sockets aren't the guarantee", "Design ordering per conversation"],
    check: [
      ["Two devices of one user both show a message as read. How?", "Read state is another synced change, stored as the highest sequence read per conversation. A single number covers many messages and merges by taking the maximum."],
      ["A group of 50 gets a message. Who stores what?", "One message row with a sequence number. Fan-out only notifies online members. Offline members catch up by cursor, so no per-member copy is needed."],
    ],
    tomorrow: "Tomorrow a duplicate stops being a nuisance and starts costing someone money.",
  },
  {
    n: 11,
    week: 2,
    stop: "Payments",
    title: "When a duplicate costs real money",
    question: "What changes when you can't let the app decide, and can't get it wrong?",
    story: [
      "A customer taps Pay on a train. The request leaves the phone, the train enters a tunnel, and no response arrives. Was she charged? The phone honestly can't know. Retry and you may charge twice. Don't retry and you may lose the order.",
      "You met the answer on Day 2: a key made before the first send. Each checkout gets one idempotency key, the server stores it under a unique constraint and returns the stored result for repeats, and it forwards the same key to the payment provider.",
      "What changes is who decides. For Priya, the phone could accept an edit and sort it out later. Here the phone only shows state. The order lives on the server, and the provider's webhook settles the outcome, even if it arrives minutes later and the app is gone.",
    ],
    idea: [
      ["Offline-first has a limit", [
        "The local-first instinct stops at money. You can cache the cart and queue the order intent, but you can't confirm a payment offline. Saying where the pattern stops is a strong principal signal.",
      ]],
      ["Unknown is a real state", [
        "Besides success and failure, design for unknown. The screen says we're confirming your payment, the server polls the provider, and a daily reconciliation catches anything missed. Never show failed when you don't know.",
      ]],
      ["Assume the phone is hostile", [
        "Prices and permissions get checked on the server. Tokens live in hardware-backed storage, and many 401s trigger one single-flight refresh. That is the same single-flight idea as the sync engine's lock.",
      ]],
    ],
    artifact: {
      title: "A retry with no second charge",
      lang: "http",
      code: `POST /v1/orders
Idempotency-Key: 0192e0c6-a04d
{ "cart_id": "k-19", "amount": 4999, "currency": "INR" }

→ 202 { "order_id": "o-881", "state": "payment_pending" }

# Network dropped, so the app retries with the SAME key.
POST /v1/orders
Idempotency-Key: 0192e0c6-a04d

→ 202 { "order_id": "o-881", "state": "payment_pending" }   # stored reply, nothing new`,
      note: "This is op_id once more. The stakes changed, the mechanism did not.",
    },
    decisions: [
      ["Who decides the outcome?", "Server state machine plus provider webhook", "The app, based on the SDK's callback", "The app can die mid-payment. The webhook always arrives, eventually."],
      ["Same as Week 1", "Key generated before the first send", "Disable the button", "A disabled button stops a double tap but not a network retry."],
    ],
    items: [
      { kind: "Mock", href: "/interview/payments", minutes: 45, focus: "Say the unknown case aloud first. It decides most of the design." },
      { kind: "Read", href: "/modules/mobile-security-tokens", minutes: 15, focus: "Token storage, single-flight refresh and what root detection can't do." },
      { kind: "Stretch", href: "/interview/booking", minutes: 30, focus: "Optional. Popular slots add a new twist: one conditional update, instead of a lock." },
    ],
    canDo: ["Design end-to-end idempotency", "Handle unknown payment outcomes", "Say where offline-first stops"],
    check: [
      ["Provider webhook says paid, but the order was cancelled. What now?", "Keep it on the state machine as a named case, refund automatically, and record it in the ledger. Reconciliation must catch this, so don't let it be an exception path nobody tests."],
      ["Where should the idempotency key be generated?", "On the phone, when checkout starts, and stored so it survives a crash. A key created at retry time would look like a new order."],
    ],
    tomorrow: "Payments and chat were about writes. Tomorrow nearly everything is a read, on a mid-range phone, at 60 frames a second.",
  },
  {
    n: 12,
    week: 2,
    stop: "Feed",
    title: "Nearly all reads, on a mid-range phone",
    question: "What changes when the hard part is speed, not correctness?",
    story: [
      "A shopper opens a social shopping app on a mid-range Android phone. The first page draws from a local cache, exactly as Priya's job drew from SQLite. A fresh page arrives behind it and slides in without moving what she's reading.",
      "She scrolls, and the next page loads by cursor, just like Day 4's pull. Images arrive sized for the screen from a CDN. Two rows ahead start to load, one video plays, and everything else stays paused. Nothing she wrote needs syncing except likes, which go through a small outbox.",
      "Last year this app took 1.8 seconds to start. Now it takes 4.1, and nobody can say why. That is your other problem today.",
    ],
    idea: [
      ["Frames are a budget", [
        "At 60 frames per second you have 16 ms per frame. Decoding one large image on the main thread can spend several frames. So decode off the main thread, downsample to the view's size, and cache at each layer.",
      ]],
      ["Caches at every level", [
        "Memory cache for this screen, disk cache for this week, CDN for everyone. An LRU evicts what you used least recently, and cancelling work for rows that scrolled away matters as much as caching.",
      ]],
      ["Startup is a budget too", [
        "Most of cold start is work you chose to do early. Move SDKs to first use, show local data first, and fail CI when the budget is exceeded. Without that gate, the next feature undoes your fix.",
      ]],
    ],
    artifact: {
      title: "One cursor shape, again",
      lang: "http",
      code: `GET /v1/feed?cursor=eyJ0IjoxNzk0...&limit=20
→ { "items": [ … 20 posts … ],
    "next_cursor": "eyJ0IjoxNzk0...",
    "has_more": true }`,
      note: "Opaque to the client, and keyset-based underneath, so page 500 costs what page 1 costs. Day 2 gave the local version of this rule.",
    },
    decisions: [["What does the app show on open?", "Cached page first, fresh page behind it", "Spinner until the API answers", "The same choice as Day 1, for a different reason: speed, not signal."]],
    items: [
      { kind: "Mock", href: "/interview/feed", minutes: 45, focus: "Spend most of your time on the client: cache layers, scroll and video." },
      { kind: "Build", href: "/mobile-coding/lru-cache", minutes: 20, focus: "Warm up with this one." },
      { kind: "Build", href: "/mobile-coding/image-loader", minutes: 35, focus: "Coalesce duplicate requests, and cancel what scrolled off." },
      { kind: "Build", href: "/mobile-coding/feed-pagination", minutes: 30, focus: "Duplicate rows and races when loading pages." },
      { kind: "Read", href: "/modules/mobile-startup-performance", minutes: 15, focus: "Take this to your next team: a budget, and a CI gate." },
      { kind: "Read", href: "/modules/rn-new-architecture", minutes: 15, focus: "What runs on which thread in React Native, and which startup and frame-rate claims to check yourself." },
    ],
    canDo: ["Keep a list smooth on a mid-range phone", "Build an image cache with cancellation", "Set and defend a startup budget"],
    check: [
      ["Fresh content arrives while she's reading. Do you insert it above her?", "No. Moving her content is the worst option. Show a new posts pill and let her choose, or insert only above the fold when she's at the very top."],
      ["Why measure startup at p90 on mid-range phones?", "Flagship averages stay fine while a large share of users wait four seconds. Measure where the pain is."],
    ],
    tomorrow: "You have designed four products. Tomorrow you change altitude: 150 engineers ship into one app, and a release breaks Priya's sync.",
  },
  {
    n: 13,
    week: 2,
    stop: "Platform",
    title: "You can't roll back a phone",
    question: "How do you keep all of this working as 150 engineers keep changing it?",
    story: [
      "Version 8.2 goes to 1% of users on Monday. On one manufacturer's phones, a new SDK starts during the background wake-up and crashes the process. Remember Day 3: nothing on screen shows it. Priya's phone just stops syncing, her outbox quietly grows, and she sees clocks instead of ticks.",
      "Under the old setup, you'd learn this five days later from store reviews. Now phones report crash-free sessions and outbox depth by version and device. Within an hour the new version looks worse than the old one on those phones, so the rollout halts itself. A remote flag turns off the SDK for those who already updated.",
      "This fix needed no new sync design. It needed telemetry, a staged rollout, a flag, and the organisation to run them.",
    ],
    idea: [
      ["Fixes reach phones slowly", [
        "A server fix lands in minutes. A mobile fix waits for store review and for users to update, so detection has to happen while 1% of users have the bug. Old versions also live for years, which is why Day 2's migrations must handle skipped versions.",
      ]],
      ["Telemetry is another outbox", [
        "Events buffer on disk and upload in batches, so an offline crash still arrives. The same durable-queue idea carries your release signals. Include domain health such as outbox depth, because a crash rate alone would miss a silent sync stall.",
      ]],
      ["Flags need the same discipline", [
        "Assignment must be stable and identical across platforms. Log exposure when the user reaches the feature, and give every flag an owner and an expiry.",
      ]],
      ["Principal work means moving people", [
        "Put build time, flaky tests, crash-free sessions and lead time on one dashboard everyone sees. Pick the worst, fix it with one or two teams, publish the result, and let others ask to join.",
      ]],
    ],
    decisions: [["How do you ship to 150 engineers' users?", "Weekly train, staged, with automatic gates", "Monthly big release", "Small batches make each bad change cheaper to find and stop."]],
    items: [
      { kind: "Mock", href: "/interview/release", minutes: 45, focus: "No code in this round. Bring numbers and a plan for moving 20 teams." },
      { kind: "Read", href: "/modules/mobile-observability-rollouts", minutes: 15, focus: "Which signals to choose, and how to gate on them." },
      { kind: "Read", href: "/modules/experimentation-sdk-mobile", minutes: 15, focus: "Why a stable hash matters, and when an experiment's data can't be trusted." },
      { kind: "Recall", href: "/reels/c-rel", minutes: 5, focus: "Security, metrics and testing reels." },
      { kind: "Read", href: "/modules/rn-native-boundary-budgets", minutes: 15, focus: "Where React Native ends, and how to fail a build when performance slips." },
    ],
    canDo: ["Design a staged rollout with gates", "Choose release signals, including domain health", "Describe how you'd lead change across teams"],
    check: [
      ["A kill switch and a rollout halt: why both?", "A halt stops new users from getting the bug. A kill switch helps those who already have it. You need both, because you can't recall an installed app."],
      ["Twenty teams resist a new release process. What do you do?", "Show one team's better numbers before asking for anything, keep the path easy, and make the old way visibly slower. Mandates without evidence rarely last."],
    ],
    tomorrow: "One day left. Tomorrow you get a problem you haven't seen, and the same three questions.",
  },
  {
    n: 14,
    week: 2,
    stop: "The loop",
    title: "A problem you haven't seen",
    question: "Can you use all of this on something new, and tell the story of why?",
    story: [
      "The interviewer says: design live location tracking for 500,000 drivers, and don't drain the battery. You haven't studied this one. It doesn't matter, because you already know how to begin.",
      "Where does a GPS fix live? In a buffer on disk through a tunnel, exactly like Priya's basement. Who runs the next step? A foreground service, a sibling of Day 3's worker. What if it runs twice? Each fix carries a sequence number, so the server ignores anything older than what it holds, a cousin of the cursor. A rider's live view is chat's socket with the push as fallback. Rollout gates come from Day 13. You've built nearly all of this already.",
    ],
    idea: [
      ["Six ideas, not sixty facts", [
        "Local truth, durable queues, idempotency keys, cursors, the OS decides when, and you can't recall a phone. Almost every mobile design round is a new arrangement of these. The programme page shows where each one appeared.",
      ]],
      ["What makes it principal", [
        "A senior answer has the right boxes. A principal answer names what you rejected and why, ties numbers to decisions, says what you'd measure, and notices the organisation: who owns this, and what happens when it goes wrong at 3 am.",
      ]],
      ["Bring your own stories", [
        "Panels also score real decisions you've made. Prepare three: a decision you'd defend, one you got wrong, and a time you moved people without authority. Give each one the context, the options, what you chose, and the result in numbers.",
      ]],
    ],
    decisions: [],
    items: [
      { kind: "Mock", href: "/modules/live-location-tracking", minutes: 45, focus: "Read only the prompt first. Spend 45 minutes on your own answer, then open the reference design." },
      { kind: "Read", href: "/series/interview", minutes: 20, focus: "What the panel scores, minute by minute, and what costs offers." },
      { kind: "Read", href: "/problem-solving", minutes: 20, focus: "Practise your stories out loud against these behavioural questions." },
      { kind: "Recall", href: "/revise", minutes: 15, focus: "One last pass. Then stop and sleep." },
    ],
    canDo: ["Apply the three questions to an unseen problem", "Reuse the six ideas by name", "Tell three decision stories with numbers"],
    check: [
      ["The interviewer changes the constraint halfway through. What do you do?", "Good. Say which of your decisions the change affects, and redo only those. It shows that your design has reasons, and that you can tell them apart."],
      ["You don't know something they ask. What now?", "Say so plainly, reason from what you do know, and ask whether your assumption holds. A clear guess beats a confident bluff."],
    ],
    rubric: [
      "I asked the three questions before drawing",
      "I reused the local buffer and retry design rather than inventing one",
      "I did the arithmetic: 500,000 drivers, one fix every 4 seconds",
      "I traded freshness against battery, with numbers",
      "I handled tunnels and out-of-order fixes",
      "I said how the rider's map stays smooth when updates are sparse",
      "I named privacy limits and what I'd measure",
      "I stated what I rejected and why",
    ],
    tomorrow: "That's the programme. Revisit any day from the map, and keep the recall cards going until your loop.",
  },
];

/** One edit, stop by stop. The panel shows the state the system holds at that moment. */
export interface JourneyStop {
  at: string;
  where: "Phone" | "OS" | "Network" | "Server" | "Supervisor";
  title: string;
  body: string;
  state: [string, string][];
  day: number;
}

export const JOURNEY: JourneyStop[] = [
  { at: "2:40 pm", where: "Phone", title: "Priya taps leaking", body: "No signal, and no waiting. One transaction writes the answer and an outbox row.", state: [["valve_3 on her phone", "leaking"], ["Row shows", "clock (pending)"], ["Outbox", "op 7f3a, base version 4"], ["Server's valve_3", "ok, version 4"]], day: 2 },
  { at: "3:05 pm", where: "OS", title: "Android kills the app", body: "The phone is in her pocket and memory is short. Nothing is lost, because both rows are on disk and the job request survives too.", state: [["App process", "dead"], ["Outbox", "37 ops waiting"], ["Sync job", "waiting for network"], ["Server's valve_3", "ok, version 4"]], day: 3 },
  { at: "3:30 pm", where: "Supervisor", title: "Dev changes the same valve", body: "A contractor phones to say valve 3 was swapped. Dev sets it to replaced in the office. Neither person knows about the other.", state: [["valve_3 on her phone", "leaking"], ["Server's valve_3", "replaced, version 5"], ["Who is right?", "nobody can tell yet"]], day: 5 },
  { at: "4:12 pm", where: "OS", title: "Signal returns", body: "She climbs the stairs. The network condition is met, so Android starts your process in the background with about 8 minutes of budget.", state: [["App process", "running, no screen"], ["Lock", "single-flight taken"], ["Cursor", "c_88411"]], day: 3 },
  { at: "4:12:01", where: "Network", title: "Push: 36 applied, 1 conflict", body: "Thirty-seven ops go up in two batches. Op 7f3a comes back as a conflict, because its base version 4 is older than the field's version 5.", state: [["Applied", "36 ops, deleted from outbox"], ["op 7f3a", "conflict"], ["Server's value", "replaced, by Dev"]], day: 4 },
  { at: "4:12:01", where: "Server", title: "A lost reply is harmless", body: "The answer to batch two never arrives, so the phone resends. The server finds the op_ids, returns stored results and writes nothing.", state: [["Retry", "12 ops, 0 writes"], ["Change log", "one line per applied op"], ["Duplicates", "none"]], day: 6 },
  { at: "4:12:02", where: "Network", title: "Pull: 140 changes", body: "The phone pulls everything after its cursor, applying the changes and the new cursor in one transaction. The whole run took 2.1 seconds.", state: [["Cursor", "c_88411 → c_88551"], ["Screen", "11 ticks, 1 amber badge"], ["App process", "free to die again"]], day: 4 },
  { at: "4:14 pm", where: "Phone", title: "Priya resolves it", body: "She sees both values and their authors, keeps leaking, and adds a note. That is a new op, based on version 5. Nothing was silently dropped.", state: [["New op", "base version 5"], ["Server's valve_3", "leaking, version 6"], ["Dev's value", "kept in history"]], day: 5 },
  { at: "4:15 pm", where: "Supervisor", title: "Dev's tablet updates", body: "The change log flows through Kafka to a notifier, which sends one push: changes available. The tablet pulls by cursor and shows leaking, with Priya's note.", state: [["Push carried", "no data, just a hint"], ["Tablet", "pulls after its cursor"], ["Both devices", "agree"]], day: 6 },
];

/** Ideas that repeat. This is what connects the rounds. */
export const THREADS: { idea: string; rule: string; uses: [string, string, string][] }[] = [
  {
    idea: "Local truth",
    rule: "The screen reads a local store. The network only updates that store.",
    uses: [
      ["Field app", "The job screen draws from SQLite in 50 ms", "/deep/frontend-arch"],
      ["Chat", "History and pending messages show with no signal", "/interview/chat"],
      ["Feed", "The cached first page draws before the API answers", "/interview/feed"],
      ["Startup", "Show local data first, then refresh behind it", "/modules/mobile-startup-performance"],
    ],
  },
  {
    idea: "Idempotency key",
    rule: "A key made before the first send turns a retry into a no-op.",
    uses: [
      ["Field app", "op_id in the outbox", "/mobile-coding/outbox"],
      ["Chat", "client_msg_id stops double sends", "/interview/chat"],
      ["Payments", "One key from first tap to the provider", "/interview/payments"],
      ["Push", "The notify API dedupes callers' retries", "/modules/notification-platform-mobile"],
      ["Uploads", "The file hash means a resend costs nothing", "/series/uploads"],
    ],
  },
  {
    idea: "Durable queue and retry",
    rule: "Work goes on disk first. A later process runs it, with backoff and jitter.",
    uses: [
      ["Field app", "The outbox, drained by the sync engine", "/deep/sync-engine"],
      ["Uploads", "One row per part, resumed after a kill", "/mobile-coding/resumable-upload"],
      ["Telemetry", "Events buffer offline, so crashes still arrive", "/modules/mobile-observability-rollouts"],
      ["Location", "GPS fixes wait out the tunnel", "/modules/live-location-tracking"],
    ],
  },
  {
    idea: "Cursor and sequence",
    rule: "An ordered number lets any client say: give me everything after this.",
    uses: [
      ["Field app", "Pull after c_88411, per tenant", "/deep/server-sync"],
      ["Chat", "A sequence per conversation fills gaps on reconnect", "/interview/chat"],
      ["Feed", "Keyset cursor, so deep pages stay cheap", "/mobile-coding/feed-pagination"],
      ["SQLite", "The same rule for local paging", "/series/sqlite"],
    ],
  },
  {
    idea: "The OS decides when",
    rule: "Request work with conditions, and design for it running late or never.",
    uses: [
      ["Field app", "WorkManager and BGTaskScheduler", "/deep/background-layer"],
      ["Uploads", "Background URLSession and foreground services", "/deep/transfer-manager"],
      ["React Native", "The OS wakes you with no JS running", "/series/rn"],
      ["Push", "Silent pushes get throttled, so treat them as hints", "/modules/notification-platform-mobile"],
    ],
  },
  {
    idea: "You can't recall a phone",
    rule: "Old versions live for years, so ship in stages and keep a remote off switch.",
    uses: [
      ["SQLite", "Migrations for users who skip eleven versions", "/series/sqlite"],
      ["Platform", "Weekly train with staged rollouts", "/interview/release"],
      ["Telemetry", "Gates halt a bad release at 1%", "/modules/mobile-observability-rollouts"],
      ["Flags", "Kill switches and stable assignment", "/modules/experimentation-sdk-mobile"],
    ],
  },
];

export const WEEKS: Record<1 | 2, { title: string; blurb: string }> = {
  1: { title: "Week 1: One edit, end to end", blurb: "Follow Priya's edit from a tap in a basement to her supervisor's tablet, and build each part as you meet it." },
  2: { title: "Week 2: Same parts, new products", blurb: "Each day changes one constraint. You will notice how much you already know." },
};

/** Which day a page belongs to, and the first one wins if it appears twice. */
export function dayOf(href: string): Day | undefined {
  return DAYS.find((d) => d.items.some((i) => i.href === href));
}

/** One sentence per page saying where it sits in the story. */
export const CONNECTS: Record<string, { role: string }> = {
  "/series/background-sync": { role: "Priya stands in a basement with no signal. This post explains why that case shapes the whole design: phones lose networks, and the OS kills your process." },
  "/series/sqlite": { role: "Priya's edit lands here first. Every other part reads what this database holds, so its speed and safety decide how the whole app feels." },
  "/mobile-coding/outbox": { role: "Op 7f3a waits in this structure from 2:40 to 4:12 pm. You build the queue that makes a retry safe and lets the process die at any line." },
  "/deep/background-layer": { role: "Nothing runs for 92 minutes, then this layer starts your app with no screen. It turns many triggers into one job the OS will accept." },
  "/deep/sync-engine": { role: "The 2.1-second run at 4:12 pm. It takes the outbox from the last step, talks to the server from the next one, and handles every failure in between." },
  "/mobile-coding/backoff": { role: "When a push fails, this decides when to try again. Jitter stops 200,000 phones from returning in the same second after an outage." },
  "/series/conflicts": { role: "Op 7f3a comes back refused: Dev changed valve 3 while Priya was underground. This post decides what should happen, field by field." },
  "/deep/server-sync": { role: "The other end of the sync run. It applies Priya's ops once, gives each a place in the order, and tells Dev's tablet to come and look." },
  "/series/backend": { role: "The same server, grown to 5 million devices. Read it to see which parts survive that scale and which must change." },
  "/mobile-coding/rate-limiter": { role: "All those retrying phones have to be stopped somewhere. A token bucket stops one broken client from taking the service down for everyone." },
  "/series/uploads": { role: "Arjun's 412 MB video can't fit in an outbox row. This post gives files their own track, using the same three questions." },
  "/deep/transfer-manager": { role: "Arjun's upload in full: the Wi-Fi switch, the expired URLs and the swipe. The part table here does for bytes what the outbox does for edits." },
  "/mobile-coding/resumable-upload": { role: "You build the core of Arjun's upload: send parts, survive failure, and resume without resending finished work." },
  "/interview/offline-field": { role: "Priya's and Arjun's whole story as a 45-minute round. Tell her edit as your key flow, and the panel has one thing to follow." },
  "/deep/frontend-arch": { role: "What Priya actually saw. The clock, the tick and the amber badge all come from one database query, which is why screens stay simple." },
  "/series/rn": { role: "Run Priya's app in React Native, and the 4:12 pm wake-up may have no JavaScript at all. This post splits the work accordingly." },
  "/mobile-coding/list-diff": { role: "When 140 pulled changes land at once, this redraws only the rows that changed, with no flash." },
  "/mobile-coding/search-debounce": { role: "One-way data flow with a user typing: newer input cancels older work, so a stale answer can never overwrite a fresh one." },
  "/interview/chat": { role: "Priya's edit becomes a message. The outbox, client ID and cursor all stay. Sockets and ordering per conversation are new." },
  "/modules/notification-platform-mobile": { role: "Dev's tablet got one push saying changes available. This is the system behind that push, and behind every chat alert." },
  "/interview/payments": { role: "Op 7f3a's idempotency key now protects money. The new lesson is where offline-first stops: the server and provider decide, never the phone." },
  "/modules/mobile-security-tokens": { role: "Payments assumes the phone can't be trusted, and Priya's offline data sits on a phone that could be stolen. This module covers both." },
  "/interview/booking": { role: "A stretch after payments. A hold plus a conditional update solves contention, and Priya's offline rules come back for the partner app." },
  "/interview/feed": { role: "Here reads dominate. Local truth now serves speed instead of signal, and the cursor from the sync run pages through the feed." },
  "/mobile-coding/lru-cache": { role: "The memory layer of the feed's image cache, and the warm-up for building the loader." },
  "/mobile-coding/image-loader": { role: "A smooth scroll depends on this: it coalesces duplicate requests, sizes images and cancels what scrolled away." },
  "/mobile-coding/feed-pagination": { role: "Day 4's cursor as a client component, with the races and duplicates a real scroll produces." },
  "/modules/mobile-startup-performance": { role: "The other half of feeling fast. Showing local data first, as Priya's app does, removes the biggest wait on launch." },
  "/interview/release": { role: "Every system so far has to keep working while 150 engineers change it. Principal rounds test this most directly." },
  "/modules/mobile-observability-rollouts": { role: "A bad release can silently stop Priya's sync. Telemetry that buffers like an outbox catches it while only 1% of users have it." },
  "/modules/experimentation-sdk-mobile": { role: "The remote switch that protects users who already updated, and the assignment rules that keep experiment data honest." },
  "/modules/live-location-tracking": { role: "A problem you haven't seen, built from parts you have: a buffer through a tunnel, a background service, sequence numbers and a socket." },
  "/series/interview": { role: "You have the systems. This post shows how a panel scores them, and how to tell your own decisions as stories." },
};

/** The three questions, answered for each day's part of the system. Mock days have none. */
export const DAY_ANSWERS: Record<number, [string, string, string]> = {
  1: ["With a direct API call, only in memory, which is the problem to fix.", "Nobody. The call dies with the process.", "Unsafe. A blind retry could apply the edit twice."],
  2: ["In SQLite: the job row and the outbox row, on disk together.", "Nothing yet. The row waits for a sync job.", "The op_id marks it, so a second send is recognisable."],
  3: ["The job request, kept on disk by WorkManager.", "The OS, when the network condition is met.", "A unique job name: five triggers, one job."],
  4: ["In the outbox until acknowledged. The cursor commits with the pulled changes.", "The worker runs the engine, and a follow-up job takes any leftovers.", "Known op_ids return stored results, and re-applying a pull changes nothing."],
  5: ["Both values, side by side, on the conflict row and on the server.", "A person. Priya opens the badge and decides.", "Her choice is a new op with its own ID and base version 5."],
  6: ["In Postgres: the row, the applied op and the change log entry, committed together.", "Debezium and Kafka carry it on, then a notifier prompts other devices.", "The applied-op table catches a repeat and returns the stored result."],
  7: ["In app storage, with one row per part.", "WorkManager with a foreground service on Android, background URLSession on iOS.", "Parts can be resent safely, and the file hash skips what the server has."],
  9: ["In the database. The screen holds only state derived from it.", "The database query emits, and the screen redraws.", "The reducer is pure, so the same data always draws the same screen."],
  10: ["In a local message row plus its outbox entry.", "A socket while the app is open, a push and a sync job while it is closed.", "client_msg_id stops a double send."],
  11: ["The order lives on the server. The key lives on the phone.", "The provider's webhook, backed by daily reconciliation.", "The same key works at the app, the order service and the provider."],
  12: ["In the local cache, and then in the CDN for everyone else.", "The scroll itself. Nothing needs to run with the app closed.", "Duplicate image requests coalesce, and a cursor stops repeated rows."],
  13: ["Telemetry buffers on disk, as the outbox does.", "An upload job on the phone, and an automatic gate on the server.", "Event IDs remove duplicates, so a repeat doesn't inflate the crash rate."],
  14: ["In a disk buffer of fixes, through the tunnel.", "A foreground service on the phone, and a stream on the server.", "A sequence number per fix, so anything older gets ignored."],
};
