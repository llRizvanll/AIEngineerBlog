/* Interactive widgets for Part 1 ("Background sync for an app the OS will kill").
   Ported from the original page script to typed DOM code. Returns a cleanup function. */

type Conflict = { k: string; s: string; w: string; i: string };
type Quiz = { q: string; o: string[]; a: number; w: string };

const CONFLICTS: Conflict[] = [
  { k: "Profile display name", s: "Last-write-wins", w: "One owner, low cost if an old value briefly wins. The server orders writes by sequence, so the newest accepted write wins everywhere.", i: "Cheap and simple. Never use it where two people edit the same thing." },
  { k: "Patient or job notes", s: "Optimistic concurrency (409 + merge)", w: "The client sends base_version. If someone else changed the record first, the server returns 409 and the app merges or asks the user.", i: "No edit is silently lost. Needs a small merge UI." },
  { k: "Stock count", s: "Operations, not states", w: 'Send "−2 units", never "now 14 units". The server applies operations in order, so two tills never overwrite each other.', i: "The server must validate each operation, such as refusing to go below zero." },
  { k: "Shared document", s: "CRDT (Automerge or Yjs)", w: "Several people type at once, offline. CRDTs merge any order of edits to the same result.", i: "Heavier storage and complexity. Only worth it for real-time collaboration." },
  { k: "Payment or booking", s: "Server-authoritative", w: 'The device proposes; the server decides. The UI shows "pending" until it is confirmed.', i: "Correctness over availability. Explain the offline UX clearly." },
  { k: "App settings", s: "Last-write-wins per field", w: "Each setting is independent, so merge field by field and let the latest accepted write win for each.", i: "Field-level versions avoid one toggle wiping another." },
];

const MYTHS: [string, string][] = [
  ["A foreground service keeps sync alive forever.", "Android 14+ requires a declared service type, and Android 15 limits dataSync services to about 6 hours a day. Use WorkManager or a user-initiated data transfer job."],
  ["Silent push lets me sync whenever I want.", "iOS throttles and coalesces silent pushes, and FCM high priority has quotas. Push is a hint. Keep a periodic job and foreground sync as the safety net."],
  ["updated_at is good enough for a sync cursor.", "Clocks drift and same-millisecond writes get skipped. Use a server-assigned sequence per partition."],
  ["React Native can run the sync loop in JS.", "The JS runtime may be gone when the OS wakes you. Put scheduling, transfers and the sync engine in native code."],
  ["Retrying a failed POST is always safe.", "Not without an op_id. The first request may have succeeded before the network dropped. The server must dedupe by a client-generated ID."],
  ["Background URLSession survives everything.", "It survives the system suspending or terminating your app, but a user swipe-kill cancels its transfers. Resume from saved parts on launch."],
];

const QUIZ: Quiz[] = [
  { q: "Why is a server sequence cursor safer than updated_at?", o: ["It is faster to index", "Clocks drift and same-millisecond writes get skipped", "JSON cannot store dates", "iOS has no timestamps"], a: 1, w: "A server sequence is one total order that never depends on a device clock." },
  { q: "A user swipe-kills the iOS app mid-upload. What happens to background URLSession transfers?", o: ["They keep running in the system daemon", "They are cancelled until the app launches again", "They finish, but the app is never told", "iOS converts them into silent pushes"], a: 1, w: "System termination is survivable; a user force-quit is not. Your saved parts make the restart cheap." },
  { q: "Best Android 14+ tool for a 3 GB upload the user just started?", o: ["PeriodicWorkRequest", "An exact alarm", "A user-initiated data transfer job", "Headless JS"], a: 2, w: "UIDT jobs are built for long, user-visible transfers and are not bound by normal job quotas." },
  { q: "What makes retrying a push safe?", o: ["HTTP/2", "A client-generated op_id the server dedupes", "A longer timeout", "Sending the whole record"], a: 1, w: "The server returns the original result for an op_id it has already applied." },
  { q: "First install for a user with 2 million rows?", o: ["Page through the API 500 rows at a time", "Download a prebuilt CDN snapshot, then pull deltas", "Stream it over a WebSocket", "Ask the user to keep the app open overnight"], a: 1, w: "Snapshots turn hours of paging into one compressed download, then the cursor takes over." },
];

const QUIZ_KEY = "pae-bgsync-quiz";
const TITLES = ["Valve 3 leaking", "Pump room B checked", "Meter photo taken", "Panel cover missing", "Fire door OK", "Gauge reads 4.2 bar", "Ladder tagged out", "Cable tray loose"];

interface Note { id: string; t: string; st: "synced" | "pending" | "remote" }
interface SimState {
  alive: boolean;
  online: boolean;
  nextTitle: number;
  notes: Note[];
  outbox: { id: string; op: string }[];
  seq: number;
  cursor: number;
  srv: { seq: number; t: string }[];
  applied: Record<string, number>;
  lastOp: string | null;
  remote: { id: string; t: string; seq: number }[];
  file: { done: boolean[]; status: "uploading" | "paused" | "done" } | null;
  resent: number;
  log: { m: string; c: string }[];
}

export function mountBackgroundSync(root: HTMLElement): () => void {
  const ac = new AbortController();
  const on = <K extends keyof HTMLElementEventMap>(el: Element | null, ev: K, fn: (e: HTMLElementEventMap[K]) => void) =>
    el?.addEventListener(ev, fn as EventListener, { signal: ac.signal });
  const $ = <T extends HTMLElement = HTMLElement>(id: string) => root.querySelector<T>("#" + id);
  const timers: ReturnType<typeof setInterval>[] = [];

  /* tabs */
  const wireTabs = (box: HTMLElement | null) => {
    if (!box) return;
    const tabs = Array.from(box.querySelectorAll<HTMLElement>("[role=tab]"));
    const select = (i: number) =>
      tabs.forEach((t, k) => {
        const yes = k === i;
        t.setAttribute("aria-selected", String(yes));
        t.tabIndex = yes ? 0 : -1;
        const panel = $(t.getAttribute("aria-controls") || "");
        if (panel) panel.hidden = !yes;
      });
    tabs.forEach((t, i) => {
      on(t, "click", () => select(i));
      on(t, "keydown", (e) => {
        if (e.key === "ArrowRight") { const j = (i + 1) % tabs.length; select(j); tabs[j].focus(); }
        if (e.key === "ArrowLeft") { const j = (i - 1 + tabs.length) % tabs.length; select(j); tabs[j].focus(); }
      });
    });
  };
  wireTabs($("ptabs"));
  wireTabs($("pitch-tabs"));

  root.querySelectorAll<HTMLElement>("[data-copy]").forEach((b) =>
    on(b, "click", () => {
      const text = $(b.dataset.copy || "")?.innerText ?? "";
      const label = b.textContent;
      navigator.clipboard?.writeText(text).then(
        () => { b.textContent = "Copied"; setTimeout(() => (b.textContent = label), 1400); },
        () => (b.textContent = "Select and copy the text above")
      );
    })
  );

  /* copy buttons on editor blocks */
  root.querySelectorAll<HTMLButtonElement>("[data-ed-copy]").forEach((b) =>
    on(b, "click", () => {
      const code = b.closest(".editor")?.querySelectorAll(".ed-code");
      const text = code ? Array.from(code).map((c) => c.textContent).join("\n") : "";
      navigator.clipboard?.writeText(text).then(() => {
        b.textContent = "Copied";
        setTimeout(() => (b.textContent = "Copy"), 1400);
      });
    })
  );

  /* conflict chooser */
  const chips = $("conf-chips"), cout = $("conf-out");
  if (chips && cout) {
    chips.innerHTML = "";
    const show = (c: Conflict) => {
      cout.innerHTML = "";
      const big = document.createElement("span"); big.className = "big"; big.textContent = c.s;
      const p1 = document.createElement("p"); p1.style.margin = "0 0 6px"; p1.textContent = c.w;
      const p2 = document.createElement("p"); p2.style.cssText = "margin:0;color:var(--muted)"; p2.textContent = "Trade-off: " + c.i;
      cout.append(big, p1, p2);
    };
    CONFLICTS.forEach((c, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = c.k; b.setAttribute("aria-pressed", String(i === 1));
      on(b, "click", () => {
        chips.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", "false"));
        b.setAttribute("aria-pressed", "true"); show(c);
      });
      chips.appendChild(b);
    });
    show(CONFLICTS[1]);
  }

  /* resumable upload calculator */
  const fmt = (mb: number) => (mb >= 1024 ? (mb / 1024).toFixed(1) + " GB" : Math.round(mb) + " MB");
  const calc = () => {
    const size = $<HTMLInputElement>("c-size"), part = $<HTMLInputElement>("c-part"), kill = $<HTMLInputElement>("c-kill");
    if (!size || !part || !kill) return;
    const gb = +size.value, mb = +part.value, k = +kill.value / 100;
    const total = gb * 1024, parts = Math.ceil(total / mb);
    const lostRestart = total * k, lostResume = Math.min(mb, total * k);
    const set = (id: string, t: string) => { const el = $(id); if (el) el.textContent = t; };
    set("o-size", gb + " GB"); set("o-part", mb + " MB"); set("o-kill", Math.round(k * 100) + "%");
    const a = $("bar-a"), b = $("bar-b");
    if (a) a.style.width = (lostRestart / total) * 100 + "%";
    if (b) b.style.width = Math.max(0.6, (lostResume / total) * 100) + "%";
    set("v-a", fmt(lostRestart)); set("v-b", "≤ " + fmt(lostResume));
    set("calc-sum", `${parts} parts. Without checkpoints, a kill at ${Math.round(k * 100)}% throws away ${fmt(lostRestart)}. With them, you lose at most the one part in flight.`);
  };
  ["c-size", "c-part", "c-kill"].forEach((id) => on($(id), "input", calc));
  calc();

  /* myths */
  const mbox = $("myths");
  if (mbox) {
    mbox.innerHTML = "";
    MYTHS.forEach(([q, a]) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "myth"; b.setAttribute("aria-pressed", "false");
      b.innerHTML = '<span class="lab">Myth</span><span class="q"></span><span class="a"></span><span class="hint">tap to flip</span>';
      b.querySelector(".q")!.textContent = q;
      b.querySelector(".a")!.textContent = a;
      on(b, "click", () => {
        const yes = b.getAttribute("aria-pressed") !== "true";
        b.setAttribute("aria-pressed", String(yes));
        b.querySelector(".lab")!.textContent = yes ? "Reality" : "Myth";
        b.querySelector(".hint")!.textContent = yes ? "tap to flip back" : "tap to flip";
      });
      mbox.appendChild(b);
    });
  }

  /* quiz */
  const qbox = $("quiz");
  let answered: Record<number, number> = {};
  try { answered = JSON.parse(localStorage.getItem(QUIZ_KEY) || "{}") || {}; } catch { answered = {}; }
  const score = () => {
    const keys = Object.keys(answered).map(Number);
    const right = keys.filter((k) => answered[k] === QUIZ[k].a).length;
    const el = $("score");
    if (el) el.textContent = keys.length ? `Score: ${right} / ${QUIZ.length}` + (keys.length < QUIZ.length ? " so far" : right === QUIZ.length ? ". Ready for the panel." : ". Re-read the sections you missed.") : "";
  };
  const mark = (qi: number, oi: number, d: HTMLElement) => {
    d.querySelectorAll<HTMLButtonElement>(".opts button").forEach((b, k) => {
      b.disabled = true;
      if (k === QUIZ[qi].a) b.classList.add("right");
      else if (k === oi) b.classList.add("wrong");
    });
    d.classList.add("done"); score();
  };
  if (qbox) {
    qbox.innerHTML = "";
    QUIZ.forEach((q, qi) => {
      const d = document.createElement("div"); d.className = "qq";
      const p = document.createElement("p"); p.textContent = `${qi + 1}. ${q.q}`;
      const opts = document.createElement("div"); opts.className = "opts";
      const why = document.createElement("div"); why.className = "why"; why.textContent = q.w;
      q.o.forEach((o, oi) => {
        const b = document.createElement("button"); b.type = "button"; b.textContent = o;
        on(b, "click", () => {
          if (answered[qi] !== undefined) return;
          answered[qi] = oi;
          try { localStorage.setItem(QUIZ_KEY, JSON.stringify(answered)); } catch { /* ignore */ }
          mark(qi, oi, d);
        });
        opts.appendChild(b);
      });
      d.append(p, opts, why);
      qbox.appendChild(d);
      if (answered[qi] !== undefined) mark(qi, answered[qi], d);
    });
  }

  /* simulator */
  if ($("simulator")) {
    let S: SimState;
    let quietNet = false;
    const hex = () => Math.random().toString(16).slice(2, 6);
    const fresh = (): SimState => ({
      alive: true, online: true, nextTitle: 0,
      notes: [{ id: "n-1", t: "Site arrival logged", st: "synced" }, { id: "n-2", t: "Boiler serviced", st: "synced" }],
      outbox: [], seq: 1041, cursor: 1041,
      srv: [{ seq: 1040, t: "note n-1 created" }, { seq: 1041, t: "note n-2 created" }],
      applied: {}, lastOp: null, remote: [], file: null, resent: 0, log: [],
    });
    const log = (m: string, c = "") => { S.log.unshift({ m, c }); if (S.log.length > 40) S.log.pop(); };
    const txt = (id: string, t: string | number) => { const el = $(id); if (el) el.textContent = String(t); };
    const div = (t: string, cls?: string) => { const d = document.createElement("div"); d.textContent = t; if (cls) d.className = cls; return d; };

    const render = () => {
      $("phone")?.classList.toggle("dead", !S.alive);
      txt("sb-net", S.online ? "5G" : "No signal");
      const nb = $("notes");
      if (nb) {
        nb.innerHTML = "";
        S.notes.slice().reverse().forEach((n) => {
          const d = document.createElement("div"); d.className = "note";
          const t = document.createElement("span"); t.textContent = n.t;
          const b = document.createElement("span");
          b.className = "badge " + n.st;
          b.textContent = n.st === "synced" ? "synced" : n.st === "remote" ? "from tablet" : "pending";
          d.append(t, b); nb.appendChild(d);
        });
      }
      const v = $("vid");
      if (v) {
        if (S.file) {
          v.hidden = false;
          const done = S.file.done.filter(Boolean).length;
          const vb = $("vid-badge");
          if (vb) {
            vb.textContent = S.file.status === "done" ? "uploaded" : S.file.status === "paused" ? `paused ${done}/12` : `${done}/12`;
            vb.className = "badge " + (S.file.status === "done" ? "synced" : "pending");
          }
          const p = $("parts");
          if (p) {
            p.innerHTML = "";
            const flying = S.file.done.indexOf(false);
            S.file.done.forEach((ok, i) => {
              const el = document.createElement("i");
              if (ok) el.className = "ok";
              else if (S.file!.status === "uploading" && i === flying && S.alive && S.online) el.className = "fly";
              p.appendChild(el);
            });
          }
          txt("kv-parts", `${done} of 12`);
        } else { v.hidden = true; txt("kv-parts", "none"); }
      }
      const ob = $("outbox");
      if (ob) {
        ob.innerHTML = "";
        if (!S.outbox.length) ob.appendChild(div("empty", "empty"));
        S.outbox.forEach((o) => ob.appendChild(div(`op ${o.op} · create ${o.id}`)));
      }
      txt("ob-count", S.outbox.length);
      txt("kv-cursor", S.cursor);
      txt("kv-proc", S.alive ? "alive" : "killed");
      const proc = $("kv-proc"); if (proc) proc.style.color = S.alive ? "var(--good)" : "var(--accent)";
      txt("kv-resent", S.resent);
      txt("srv-seq", "seq " + S.seq);
      const sl = $("srvlog");
      if (sl) { sl.innerHTML = ""; S.srv.slice(-6).reverse().forEach((r) => sl.appendChild(div(`${r.seq} · ${r.t}`))); }
      const lg = $("log");
      if (lg) { lg.innerHTML = ""; S.log.forEach((l) => lg.appendChild(div("> " + l.m, l.c || undefined))); }
      const net = $("b-net");
      if (net) { net.textContent = "Network: " + (S.online ? "online" : "offline"); net.classList.toggle("on", S.online); net.setAttribute("aria-pressed", String(S.online)); }
    };
    const hasWork = () => S.outbox.length || (S.file && S.file.status === "uploading") || S.remote.length;
    const tick = () => {
      if (!S.alive) return;
      if (!S.online) {
        if (hasWork() && !quietNet) { log("job deferred: network constraint not met. Work stays on disk.", "w"); quietNet = true; render(); }
        return;
      }
      quietNet = false;
      if (S.outbox.length) {
        const o = S.outbox.shift()!;
        S.seq++; S.applied[o.op] = S.seq; S.lastOp = o.op;
        S.srv.push({ seq: S.seq, t: `note ${o.id} created (op ${o.op})` });
        const n = S.notes.find((x) => x.id === o.id); if (n) n.st = "synced";
        log(`push op ${o.op} → server applied as seq ${S.seq}`);
        S.cursor = S.seq; log(`pull since ${S.seq - 1} → 1 change · cursor saved ${S.cursor} (same txn)`, "g");
        render(); return;
      }
      if (S.file && S.file.status === "uploading") {
        const i = S.file.done.indexOf(false);
        S.file.done[i] = true;
        log(`PUT part ${i + 1}/12 (8 MB) ✓ ETag saved to SQLite`);
        if (S.file.done.indexOf(false) === -1) {
          S.file.status = "done"; S.seq++; S.srv.push({ seq: S.seq, t: "pump-room.mov linked (hash ok)" }); S.cursor = S.seq;
          log(`complete multipart → server verified SHA-256 · seq ${S.seq}`, "g");
        }
        render(); return;
      }
      if (S.remote.length) {
        const r = S.remote.shift()!;
        S.notes.push({ id: r.id, t: r.t, st: "remote" });
        log(`pull since ${S.cursor} → ${r.id} from another device`, "g");
        S.cursor = r.seq; log("cursor saved " + S.cursor);
        render();
      }
    };
    const resumeFile = () => {
      if (S.file && S.file.status === "paused") {
        const done = S.file.done.filter(Boolean).length;
        S.file.status = "uploading";
        log(`resume upload: parts 1–${done} already saved, sending ${done + 1}–12 only`, "g");
      }
    };
    const openIfDead = () => { if (!S.alive) { S.alive = true; log("user opens app → process starts, reads state from SQLite", "g"); resumeFile(); } };
    const start = () => {
      S = fresh(); quietNet = false;
      log("ready. 2 notes synced, cursor at 1041.");
      render();
    };

    on($("b-note"), "click", () => {
      openIfDead();
      const id = "n-" + (S.notes.length + 1), op = hex();
      const t = TITLES[S.nextTitle++ % TITLES.length];
      S.notes.push({ id, t, st: "pending" }); S.outbox.push({ id, op });
      log(`write row ${id} + outbox op ${op} in one transaction · UI updated now`);
      render();
    });
    on($("b-video"), "click", () => {
      openIfDead();
      if (S.file && S.file.status !== "done") { log("one upload at a time in this demo", "w"); render(); return; }
      S.file = { done: Array(12).fill(false), status: "uploading" };
      log("video copied to app storage · SHA-256 · server: not seen before → 12 presigned part URLs");
      render();
    });
    on($("b-net"), "click", () => {
      S.online = !S.online;
      log(S.online ? "network back. Constraint met; the OS can run the job." : "network lost. Edits still save locally.", S.online ? "g" : "w");
      render();
    });
    on($("b-kill"), "click", () => {
      if (!S.alive) { log("already killed", "w"); render(); return; }
      S.alive = false;
      if (S.file && S.file.status === "uploading") { S.file.status = "paused"; S.resent += 8; log("in-flight part lost (8 MB). Saved parts stay on disk.", "w"); }
      log(`SIGKILL. Memory gone. Outbox (${S.outbox.length}${S.outbox.length === 1 ? " op" : " ops"}), cursor and parts survive in SQLite.`, "e");
      render();
    });
    on($("b-wake"), "click", () => {
      if (S.alive) { log("app is already running", "w"); render(); return; }
      S.alive = true;
      log("OS runs the sync job (WorkManager / BGTask). Engine reads outbox and parts from SQLite.", "g");
      resumeFile(); render();
    });
    on($("b-remote"), "click", () => {
      S.seq++;
      const id = "n-t" + S.seq;
      S.srv.push({ seq: S.seq, t: `note ${id} created on tablet` });
      S.remote.push({ id, t: "Tablet: meter recalibrated", seq: S.seq });
      log(`server: tablet wrote seq ${S.seq} · push hint sent (FCM / APNs)`);
      if (!S.alive) log("app is dead. The hint waits until the OS wakes the app.", "w");
      render();
    });
    on($("b-replay"), "click", () => {
      if (!S.lastOp) { log("nothing pushed yet. Add a note first.", "w"); render(); return; }
      log(`retry POST /push op ${S.lastOp} (as if the response was lost)`);
      log(`server: op ${S.lastOp} already applied as seq ${S.applied[S.lastOp]} → returned original result, no new row`, "g");
      render();
    });
    on($("b-reset"), "click", start);
    start();
    timers.push(setInterval(tick, 650));
  }

  return () => {
    ac.abort();
    timers.forEach(clearInterval);
  };
}
