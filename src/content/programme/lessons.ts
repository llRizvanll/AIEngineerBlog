/* The teaching part of each day. A lesson must make sense with no other page open.
   Basics come first: plain explanation, then the words, each defined before it is used. */

export interface Lesson {
  /** the idea in plain language, assuming nothing */
  plain: string[];
  /** words the lesson uses, defined before they appear */
  words: [string, string][];
  /** the mechanism, one step at a time */
  steps: [string, string][];
  /** what goes wrong, and what the design does about it */
  failures: [string, string][];
}

export const LESSONS: Record<number, Lesson> = {
  1: {
    plain: [
      "A website runs on a server that stays on all day. A mobile app runs on a phone that may lose its network at any moment, and the operating system (Android or iOS) may close the app whenever it wants memory or battery back.",
      "So the question for a mobile engineer is simple: when the user does something, how do we make sure it isn't lost if the network is gone or the app gets closed a second later?",
    ],
    words: [
      ["Process", "Your app while it is running. When the OS ends it, everything held in memory disappears."],
      ["Local database", "A database file stored on the phone. Unlike memory, it survives the app being closed."],
      ["Source of truth", "The one place you trust for the current value. Everything else is a copy."],
      ["Sync", "Moving changes between the phone and the server, in both directions."],
      ["Offline-first", "A design where the app always reads and writes the local database, and sync happens separately in the background."],
    ],
    steps: [
      ["The user taps Save", "The app writes the change to the local database. This takes milliseconds and needs no network."],
      ["The screen updates", "The screen shows what the database holds, so it now shows the new value."],
      ["The change waits", "A record of the change stays in the database until the server has it. The app may be closed during this wait, and that is fine."],
      ["Sync runs later", "When the network returns, a background job sends the change to the server and fetches anything new."],
      ["Everyone catches up", "Other devices fetch the change from the server the next time they sync."],
    ],
    failures: [
      ["The network is gone when the user taps Save", "Nothing changes for the user. The save is local, and sync waits."],
      ["The OS closes the app straight after the save", "The change is already on disk, so it is not lost."],
      ["The phone and server now disagree", "This is the cost of the design. Days 4 and 5 deal with it."],
    ],
  },
  2: {
    plain: [
      "Yesterday we said a save goes to the local database. Now we need the database to remember two things: the new value, and the fact that the server doesn't have it yet.",
      "We keep that second fact in a table called the outbox. Think of the tray on a desk marked to send. Sync later works through that tray.",
    ],
    words: [
      ["SQLite", "The database built into Android and iOS. It is a single file on the phone."],
      ["Transaction", "A group of database writes that either all happen or none happen, even if the phone dies midway."],
      ["Outbox", "A table of changes the server hasn't confirmed yet."],
      ["op_id", "A unique ID the phone creates for each change, so the server can recognise it if it arrives twice."],
      ["Base version", "The version of the record the user was looking at when they edited it."],
      ["WAL", "Write-ahead log, an SQLite mode that lets the screen keep reading while sync is writing."],
    ],
    steps: [
      ["Start a transaction", "Everything until COMMIT counts as one write."],
      ["Update the job row", "Valve 3 becomes leaking, and the row is marked pending, meaning not yet sent."],
      ["Insert the outbox row", "It records what changed, a new op_id, and base version 4."],
      ["Commit", "Now both rows are on disk together. If the phone died before this line, neither row exists and the user simply sees the old value."],
      ["The screen reacts", "The screen watches the database, so it redraws and shows a small clock beside valve 3."],
    ],
    failures: [
      ["Crash between the two writes, without a transaction", "The edit looks saved but never gets sent. The transaction makes this impossible."],
      ["The app updates and the table's shape changes", "A migration must keep outbox rows intact, or unsent work is lost."],
      ["One slow query blocks the screen", "WAL mode and short transactions keep reads and writes from waiting on each other."],
    ],
  },
  3: {
    plain: [
      "Priya's change is safe on disk, but the app is closed, and closed apps run no code. Something outside the app has to start it again.",
      "That something is the operating system. You can't tell a phone to run your code at 4:12 pm. You can only ask it to run your code once a condition is true, such as the network being available, and it decides the exact moment.",
    ],
    words: [
      ["Background work", "Code that runs with no screen showing."],
      ["WorkManager", "The Android library for requesting background work. It remembers your request even across a reboot."],
      ["Constraint", "A condition the work needs, such as a network connection."],
      ["BGTaskScheduler", "The iOS equivalent. It gives far fewer guarantees about when your code runs."],
      ["Coalescing", "Combining many requests into one, so five reasons to sync become one sync."],
      ["Budget", "How long the OS lets your background work run, usually a few minutes."],
    ],
    steps: [
      ["Ask at save time", "When Priya saves, the app requests a sync job that requires a network. The request is stored by the OS's scheduler, not by your app."],
      ["The app can die", "From now on your process doesn't need to exist. The request is already safe."],
      ["The condition is met", "Priya walks upstairs and the phone finds a network."],
      ["The OS starts your app", "Android starts your process in the background, with no screen, and calls your worker."],
      ["The worker runs within its budget", "It syncs, and if it runs out of time it reports what is left, and a follow-up job finishes the rest."],
    ],
    failures: [
      ["Five triggers arrive in a minute", "All of them enqueue one uniquely named job, so only one sync runs."],
      ["iOS doesn't run your task for hours", "Sync when the app opens as well. Never rely on the background alone on iOS."],
      ["The OS stops your worker midway", "Finished work is already recorded, so the next run continues from there."],
    ],
  },
  4: {
    plain: [
      "The worker is running. Now it has two jobs: send the phone's changes up, and bring everyone else's changes down. Doing both is called a sync run.",
      "To know what to bring down, the phone keeps a bookmark called a cursor. It works like a page number in a shared logbook: I have read up to here, so give me what comes after.",
    ],
    words: [
      ["Push", "Sending the phone's pending changes to the server."],
      ["Pull", "Fetching changes made elsewhere from the server."],
      ["Cursor", "The phone's bookmark in the server's list of changes, such as c_88411."],
      ["Single-flight lock", "A rule that only one sync run may happen at a time."],
      ["Backoff", "Waiting longer after each failed attempt before trying again."],
      ["Jitter", "A random extra delay, so thousands of phones don't all retry in the same instant."],
    ],
    steps: [
      ["Take the lock", "If another run is active, stop. This run has nothing to add."],
      ["Read the outbox", "37 changes are waiting. Send them in batches of up to 25."],
      ["Handle each result", "36 succeeded, so delete them from the outbox and mark their jobs synced. One conflicted, so mark job j-84 as conflict and keep the server's value next to Priya's."],
      ["Pull after the cursor", "Ask for changes after c_88411. The server returns 140."],
      ["Apply in one transaction", "Write the 140 changes and the new cursor c_88551 together, so the bookmark can never move ahead of the data."],
      ["Release and report", "Free the lock and tell the worker whether anything is left."],
    ],
    failures: [
      ["The server applied the push but the reply was lost", "The ops stay in the outbox and get resent. The server recognises their op_ids and does nothing twice."],
      ["The server is overloaded (429 or 5xx)", "Keep the ops, and wait using backoff with jitter."],
      ["The server rejects one op as invalid (4xx)", "Set that op aside and tell the user, so one bad op doesn't block the rest."],
      ["The phone dies during the pull", "The transaction hasn't committed, so the cursor hasn't moved. The next run repeats the pull safely."],
    ],
  },
  5: {
    plain: [
      "When two people can both work offline, both can change the same thing without knowing about each other. When they reconnect, the system has two answers and must do something.",
      "This isn't only a technical problem. Whether to keep the newest value, keep both, or ask a person depends on what the data means. So you decide it field by field, with your product team.",
    ],
    words: [
      ["Conflict", "Two edits made from the same starting version, both wanting to be next."],
      ["Version", "A number that goes up each time a value changes, used to detect that something changed."],
      ["Last-write-wins", "Keep the newest value and discard the other. Simple, but it silently loses data."],
      ["Field-level merge", "Comparing each field separately, so edits to different fields never conflict."],
      ["HLC", "Hybrid logical clock, a timestamp that stays near real time and never runs backwards, unlike a phone's clock."],
      ["CRDT", "A data type designed so that copies always merge to the same result. Useful for shared text, and overkill for forms."],
    ],
    steps: [
      ["The server gets Priya's edit", "It says: set valve 3 to leaking, based on version 4."],
      ["The server compares versions", "Valve 3 is at version 5 now, because Dev changed it. Her base is older, so this field changed behind her back."],
      ["The server looks up the policy", "Valve 3 is a safety field, and its policy says ask a person."],
      ["The server replies with both facts", "It doesn't apply her edit. It returns conflict, plus Dev's value and version."],
      ["The phone shows the choice", "Job j-84 gets an amber badge. Tapping it shows both values and who set them."],
      ["Priya decides", "Her choice becomes a new edit based on version 5, which goes through normally."],
    ],
    failures: [
      ["A phone's clock is a day ahead", "Never compare device clocks. Use versions, or an HLC where last-write-wins fits."],
      ["Too many fields ask the user", "People start tapping without reading. Reserve asking for fields where a wrong value does harm."],
      ["The user ignores the badge for days", "Keep the job flagged, and show the supervisor it needs review. Don't resolve it automatically."],
    ],
  },
  6: {
    plain: [
      "The phone did its part. Now look at the server. It must apply each change exactly once, even though phones resend things, and must put every change in an order that any device can catch up on.",
      "Picture one numbered logbook. Each change gets the next line number, and a device just asks for the lines after the last one it read.",
    ],
    words: [
      ["Idempotent", "Safe to run twice: the second run changes nothing."],
      ["Change log", "A table with one row per change, in order. Devices read from it."],
      ["Sequence number", "The line number in that log, such as 88412."],
      ["Postgres, Debezium, Kafka", "The server's database, a tool that reads its committed changes, and a queue that passes them to other services."],
      ["Tombstone", "A marker saying this record was deleted, so devices learn to delete it too."],
      ["Thundering herd", "Thousands of clients returning at the same moment, often right after an outage."],
    ],
    steps: [
      ["Check the op_id", "If this ID was already applied, return the saved result and stop. That is what makes a retry harmless."],
      ["Merge the fields", "Apply the rules from yesterday."],
      ["Take the next sequence number", "Take it under a lock for this customer, so the numbers appear in the order changes commit."],
      ["Write it all in one transaction", "The record, the op_id and the change log row commit together."],
      ["Publish the change", "Debezium reads the committed log and passes it through Kafka."],
      ["Tell other devices to look", "A notifier sends Dev's tablet one push: changes available. The tablet pulls after its own cursor, as Priya's phone did."],
    ],
    failures: [
      ["A reply gets lost and the phone retries", "The op_id check returns the saved result, and nothing is written twice."],
      ["The service was down, and every phone returns at once", "Send Retry-After, rely on client jitter, and rate limit per device."],
      ["A push never arrives", "Nothing is lost. Push is only a hint, and the next pull catches up."],
      ["A device was off for 120 days", "Its cursor is older than the log keeps, so the server replies 410, and the device rebuilds from a snapshot."],
    ],
  },
  7: {
    plain: [
      "An edit is a few bytes. A video can be hundreds of megabytes, and a phone may lose signal or get closed partway through sending it. Starting over each time would waste hours and data.",
      "So we cut the file into small numbered parts and send them one by one. Like moving house box by box: if the van breaks down, only the boxes still on it need another trip.",
    ],
    words: [
      ["Object storage", "A service built to hold large files, such as Amazon S3."],
      ["Multipart upload", "Sending a file as separate parts that get joined at the end."],
      ["Presigned URL", "A temporary link that lets the phone upload straight to storage without going through your server."],
      ["ETag", "A receipt returned for each uploaded part. You need all of them to finish the upload."],
      ["Hash", "A short fingerprint of a file. Same file, same fingerprint."],
      ["Background URLSession", "An iOS service that keeps transferring files even after your app has been suspended."],
    ],
    steps: [
      ["Copy and fingerprint", "Copy the video into the app's own storage, computing its hash as you go, so it reads the file once."],
      ["Ask the server to start", "Send the hash and size. If the server already has this file, you're done. If not, it returns 52 presigned URLs."],
      ["Send parts, record receipts", "Send four parts at a time. After each one, write its ETag to a table on disk."],
      ["Resume after any interruption", "After a failure or restart, read the table and send only the parts without an ETag."],
      ["Finish and verify", "Send all part numbers and ETags. The server checks the hash and only then links the video to the job."],
    ],
    failures: [
      ["The network switches mid-part", "That part fails and retries on its own. The others aren't affected."],
      ["The URLs expire", "Request new URLs for the remaining parts only."],
      ["The user swipes the app away on iOS", "iOS cancels the transfers. On next open, the table shows what's done, and sending continues."],
      ["A slow video would hold up small edits", "Bytes travel separately, so edits keep syncing while the video uploads."],
    ],
  },
  8: {
    plain: [
      "You don't need anything new today. This is a timed rehearsal of everything since Day 1, using the system you already followed from start to finish.",
      "Interviewers mainly want to see you ask good questions, make decisions and give reasons. Knowing every detail matters less. Priya's edit gives you one clear example to talk through.",
    ],
    words: [
      ["System design round", "A 45-minute interview where you design a product out loud, usually on a whiteboard."],
      ["Key flow", "One user action followed all the way through your design."],
      ["Trade-off", "A choice where you gain one thing and give up another. Naming what you gave up shows judgement."],
    ],
    steps: [
      ["Clarify, 5 minutes", "Who uses it, how long they stay offline, and how much data they create."],
      ["Estimate, 5 minutes", "Do the arithmetic aloud, and say what each number forces you to do."],
      ["Draw the design, 10 minutes", "Phone, local database, outbox, sync engine, server, change log, object storage."],
      ["Walk the key flow, 15 minutes", "Tell Priya's edit from tap to Dev's tablet, including the conflict. Then cover Arjun's video."],
      ["Trade-offs and failures, 10 minutes", "What you rejected, what breaks, and what you'd measure."],
    ],
    failures: [
      ["You run out of time", "You spent too long drawing. Move to the key flow by minute 20."],
      ["You go blank", "Return to the three questions: where does it live, who runs the next step, and what if it runs twice?"],
    ],
  },
  9: {
    plain: [
      "Everything so far happened below the screen. Good news: the screen barely needs to know about any of it.",
      "A screen simply watches the database. When a row changes, for any reason, the screen redraws. It never asks whether the network is up or whether sync ran. That one rule removes most of the complexity people expect here.",
    ],
    words: [
      ["ViewModel", "The class that prepares data for a screen, and survives the screen being rotated."],
      ["Observable query", "A database query that emits a new result each time its data changes."],
      ["Reducer", "A plain function that turns data into the state a screen should show."],
      ["UI state", "Everything a screen can show, named: loading, content, empty, error."],
      ["List diff", "Comparing old and new lists, so only changed rows get redrawn."],
      ["React Native", "A way to write app screens in JavaScript, with native code underneath."],
    ],
    steps: [
      ["The screen subscribes", "On opening, the ViewModel subscribes to a query. The first result draws in about 50 ms, with no network."],
      ["The user edits", "The edit goes to the database, not to the screen. The query emits, and the row shows a clock."],
      ["Sync finishes", "Sync writes to the same database. The query emits, and the clock becomes a tick."],
      ["A conflict arrives", "Same path again. The row's state is now conflict, so it turns amber."],
      ["Many changes arrive", "140 changes commit in one transaction, the query emits once, and a list diff redraws only what changed."],
    ],
    failures: [
      ["Each screen calls the network itself", "You get duplicate logic, and bugs that appear only offline. Keep all network code inside sync."],
      ["A state was never designed", "Users hit it anyway. List each state before building, and screenshot-test it."],
      ["In React Native, the OS wakes the app with no JavaScript running", "Put sync in native code, and let JavaScript only watch the database."],
    ],
  },
  10: {
    plain: [
      "Now take everything you know and build chat. A message is just an offline write: save it locally, put it in the outbox, send it later. You've already done most of the work.",
      "One thing is different. People are waiting for a reply right now, so a background job that runs eventually isn't good enough. We add a fast path, and keep the old path as the safety net.",
    ],
    words: [
      ["WebSocket", "A connection that stays open, so the server can send to the phone instantly."],
      ["client_msg_id", "The message's op_id: made on the phone, it stops double sends."],
      ["Per-conversation sequence", "A number giving each message its place within one chat."],
      ["Fan-out", "Delivering one message to everyone in the conversation."],
      ["FCM and APNs", "Google's and Apple's services for delivering push notifications to phones."],
      ["Receipts", "The sent, delivered and read states shown beside a message."],
    ],
    steps: [
      ["Save locally", "The message goes into the local table and the outbox, and shows one tick immediately."],
      ["Send over the socket", "If the app is open and connected, it goes now. Otherwise the outbox waits, as Priya's edit did."],
      ["The server gives it a place", "It checks client_msg_id, assigns the next sequence number in this chat, and saves it."],
      ["Deliver to the others", "Online members get it over their socket. Offline members get a push."],
      ["Catch up on reconnect", "Any device asks for messages after its last sequence number, which fills any gap."],
    ],
    failures: [
      ["The socket drops mid-send", "Resend with the same client_msg_id. The server recognises it, so no duplicate appears."],
      ["Messages arrive out of order", "Sort by sequence number. A gap means fetch what's missing."],
      ["A push is dropped or delayed", "The app syncs on next open anyway, so the message still arrives."],
      ["Message text appears on a lock screen", "For sensitive content, send only an ID in the push, and fetch the text on the device."],
    ],
  },
  11: {
    plain: [
      "A customer taps Pay, and the network drops before an answer arrives. The money may or may not have moved. The phone can't know. If it retries, it might charge twice. If it doesn't, the order might be lost.",
      "So there are two rules. Every attempt carries a key, so the server can spot a repeat. And the server, not the phone, decides what happened. The phone only displays the answer.",
    ],
    words: [
      ["Idempotency key", "The op_id idea, applied to money: one key per checkout, sent with every retry."],
      ["PSP", "Payment service provider, the company that actually moves the money, such as Stripe."],
      ["State machine", "A fixed list of stages an order can be in, and which moves between them are allowed."],
      ["Webhook", "A message the provider sends your server when something happens, such as a payment succeeding."],
      ["Reconciliation", "A regular comparison of your records against the provider's, to catch anything missed."],
      ["Keystore and Keychain", "Hardware-backed secure storage on Android and iOS, used for tokens and keys."],
    ],
    steps: [
      ["Create the key", "When checkout starts, the phone creates a key and stores it, so a crash can't change it."],
      ["Create the order", "The server stores the key under a unique constraint and creates an order in the payment pending state."],
      ["Pay", "The provider's SDK collects the card details, so your server never sees them. The same key goes to the provider."],
      ["Wait for the truth", "The screen says confirming. The provider's webhook updates the order on the server."],
      ["Show the result", "The phone fetches the order's state and displays it, whenever it next can."],
    ],
    failures: [
      ["A retry after a lost reply", "Same key, so the server returns the stored result. No second charge."],
      ["The app dies during payment", "The webhook still arrives, and the order completes on the server."],
      ["The webhook goes missing", "The server polls the provider, and daily reconciliation catches the rest."],
      ["The user double-taps", "Disabling the button is cosmetic. The key is the real protection."],
      ["Someone edits the price on their phone", "The server computes the price itself and ignores the phone's number."],
    ],
  },
  12: {
    plain: [
      "A feed is almost all reading. Here the challenge isn't losing data. It's speed: opening instantly, and scrolling smoothly on an ordinary phone.",
      "The same idea helps again. Show what you already have on disk straight away, and fetch fresh content behind it. The rest is about doing as little work as possible while the user scrolls.",
    ],
    words: [
      ["Frame", "One redraw of the screen. At 60 per second, each has about 16 ms."],
      ["Main thread", "The thread that draws the screen. Anything slow here makes scrolling stutter."],
      ["LRU cache", "A store of limited size that removes whatever was used least recently."],
      ["CDN", "Servers around the world holding copies of images, close to users."],
      ["Keyset cursor", "Paging by the last item seen, so deep pages cost the same as the first."],
      ["Cold start", "Opening the app when it isn't running at all, the slowest kind of launch."],
    ],
    steps: [
      ["Open from cache", "Draw the last saved first page immediately."],
      ["Fetch fresh content", "Ask for the newest posts, and don't move what the user is reading."],
      ["Page by cursor", "Near the end of the list, ask for the next 20 using the last cursor."],
      ["Load the right image", "Request the size the screen needs from the CDN, decode it off the main thread, and cache it in memory and on disk."],
      ["Do less off-screen", "Cancel loads for rows that scrolled away. Let only one video play."],
    ],
    failures: [
      ["Scrolling stutters", "Something heavy is on the main thread. Move decoding off it, and flatten row layouts."],
      ["Memory fills up and the app is killed", "Downsample images to view size, and limit the memory cache."],
      ["Rows repeat or vanish between pages", "Page by cursor rather than by offset, and drop duplicates by ID."],
      ["Startup gets slower each release", "Delay SDK setup until first use, and fail CI when a startup budget is exceeded."],
    ],
  },
  13: {
    plain: [
      "On a server, a bad release can be rolled back in minutes. On phones, it can't. Once an update is installed it stays, and a fix must pass store review and then wait for users to update.",
      "So the goal shifts to catching problems while few people have them, and being able to switch off a broken feature remotely. Principal engineers are often judged on exactly this kind of system.",
    ],
    words: [
      ["Staged rollout", "Releasing to 1% of users, then 10%, then everyone, with a check at each step."],
      ["Crash-free sessions", "The share of app sessions with no crash, the headline health number."],
      ["ANR", "Application Not Responding: Android's name for a frozen main thread."],
      ["Telemetry", "Measurements the app sends back about how it's behaving."],
      ["Feature flag", "A remote setting that turns a feature on or off without an app update."],
      ["Kill switch", "A flag whose job is to turn something off in an emergency."],
    ],
    steps: [
      ["Ship to 1%", "Version 8.2 goes out to a small group on Monday."],
      ["Phones report health", "Crashes and outbox depth get buffered on disk and uploaded in batches, as the outbox does."],
      ["Compare new with old", "Compare the same device types over the same hours, because a global average can hide a problem on one manufacturer's phones."],
      ["Halt automatically", "With enough sessions and a clearly worse result, the rollout stops itself."],
      ["Switch it off", "A kill switch disables the broken SDK for those who already updated."],
      ["Fix forward", "The corrected version goes through the same stages."],
    ],
    failures: [
      ["A failure shows nothing on screen, like a silent sync stall", "Measure domain health, such as outbox depth, and not only crashes."],
      ["Too little data at 1%", "Set a minimum session count before judging."],
      ["Old flags pile up", "Give each flag an owner and an expiry date."],
      ["Teams resist the process", "Show better numbers from one team first, and make the good path the easy one."],
    ],
  },
  14: {
    plain: [
      "Today's problem is one you haven't studied: tracking drivers' live locations. That's deliberate. The point of the last two weeks is that you don't need to have seen a problem before.",
      "Ask the same three questions and the design starts to appear. Afterwards, the other half of the loop is talking about your own real decisions, so you'll prepare those stories too.",
    ],
    words: [
      ["Foreground service", "Android background work with a visible notification, which the OS is much less likely to stop."],
      ["Distance filter", "Keeping a GPS reading only after real movement, which saves battery and data."],
      ["Decision story", "A true account of a choice you made: the context, the options, what you chose and the result."],
    ],
    steps: [
      ["Ask the three questions", "Where does a GPS reading live? Who runs the next step? What if it arrives twice?"],
      ["Clarify and estimate", "500,000 drivers sending every 4 seconds is 125,000 writes a second. Only the latest position must stay fast."],
      ["Reuse what you know", "A disk buffer for tunnels is an outbox. A sequence number per reading is a cursor. The rider's live view is chat's socket."],
      ["Name the new trade-off", "Fresher location costs more battery. Choose numbers, and defend them."],
      ["Prepare three stories", "A decision you'd defend, one you got wrong, and a time you moved people without authority."],
    ],
    failures: [
      ["You freeze on an unfamiliar problem", "Ask the three questions out loud. They give you somewhere to start."],
      ["They change a constraint halfway", "Say which decisions it affects, and redo only those."],
      ["You don't know an answer", "Say so, reason from what you do know, and check your assumption."],
    ],
  },
};
