/* Compiles the Java versions of the nine mobile machine-coding solutions together with a behaviour test, and runs it. */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SRC = join(process.cwd(), "src/content/mobile-alt/java");
const files = readdirSync(SRC).filter((f) => f.endsWith(".java"));
assert.equal(files.length, 9, "nine Java solutions");

const test = String.raw`
import java.io.IOException;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class MobileTest {
  static int checks = 0;
  static void eq(Object a, Object b) { if (!Objects.deepEquals(a, b)) throw new AssertionError(a + " != " + b); checks++; }
  static void ok(boolean c, String m) { if (!c) throw new AssertionError(m); checks++; }
  static void sleep(long ms) throws InterruptedException { Thread.sleep(ms); }
  record Item(int id, String v) {}

  public static void main(String[] args) throws Exception {
    lru(); backoff(); limiter(); diffs(); search(); feed(); outbox(); images(); uploads();
    System.out.println(checks + " Java mobile checks passed");
  }

  static void lru() {
    LruCache<String, Integer> c = new LruCache<>(3);
    c.put("a", 1); c.put("b", 2); c.put("c", 3);
    eq(c.get("a"), 1);
    c.put("d", 4);
    eq(c.get("b"), null); eq(c.get("a"), 1); eq(c.get("c"), 3); eq(c.get("d"), 4); eq(c.totalCost(), 3);
    LruCache<String, String> w = new LruCache<>(10);
    w.put("big", "x", 6); w.put("small", "y", 3); w.put("mid", "z", 4);
    eq(w.get("big"), null); eq(w.size(), 2); eq(w.totalCost(), 7);
    w.put("small", "y2", 1); eq(w.totalCost(), 5);
    w.remove("mid"); eq(w.totalCost(), 1);
    w.clear(); eq(w.size(), 0);
    try { new LruCache<String, String>(0); ok(false, "should throw"); } catch (IllegalArgumentException e) { checks++; }
  }

  static void backoff() throws Exception {
    eq(Backoff.delay(3, Duration.ofMillis(500), Duration.ofSeconds(60), max -> max), Duration.ofSeconds(4));
    eq(Backoff.delay(30, Duration.ofMillis(500), Duration.ofSeconds(60), max -> max), Duration.ofSeconds(60));
    eq(Backoff.delay(2, Duration.ofMillis(500), Duration.ofSeconds(60), max -> 0), Duration.ZERO);
    List<Duration> waits = new ArrayList<>();
    int[] calls = {0};
    String v = Backoff.withRetry(() -> { if (++calls[0] < 3) throw new IllegalStateException("boom"); return "ok"; }, 5, e -> true, waits::add);
    eq(v, "ok"); eq(calls[0], 3); eq(waits.size(), 2);
    calls[0] = 0;
    try { Backoff.withRetry(() -> { calls[0]++; throw new IllegalStateException("always"); }, 3, e -> true, d -> {}); ok(false, "throws"); } catch (IllegalStateException e) { checks++; }
    eq(calls[0], 3);
    calls[0] = 0;
    try { Backoff.withRetry(() -> { calls[0]++; throw new IllegalStateException("4xx"); }, 5, e -> false, d -> {}); } catch (IllegalStateException e) { checks++; }
    eq(calls[0], 1);
    class Limited extends RuntimeException implements Backoff.RetryAfterProviding { public Duration retryAfter() { return Duration.ofMillis(1234); } }
    List<Duration> hinted = new ArrayList<>();
    calls[0] = 0;
    Backoff.withRetry(() -> { if (++calls[0] < 2) throw new Limited(); return 1; }, 5, e -> true, hinted::add);
    eq(hinted, List.of(Duration.ofMillis(1234)));
    calls[0] = 0;
    try { Backoff.withRetry(() -> { calls[0]++; throw new InterruptedException("cancelled"); }, 5, e -> true, d -> {}); } catch (InterruptedException e) { checks++; }
    eq(calls[0], 1);
  }

  static void limiter() throws Exception {
    long[] now = {0};
    RateLimiter.TokenBucket b = new RateLimiter.TokenBucket(3, 1, () -> now[0]);
    eq(b.tryConsume(1), true); eq(b.tryConsume(1), true); eq(b.tryConsume(1), true); eq(b.tryConsume(1), false);
    eq(b.waitNanos(1), 1_000_000_000L);
    now[0] = 1_500_000_000L; eq(b.tryConsume(1), true);
    now[0] = 100_000_000_000L; eq(b.waitNanos(3), 0L);
    long[] clock = {0};
    List<Long> slept = new ArrayList<>();
    RateLimiter lim = new RateLimiter(1, 2, () -> clock[0], n -> { slept.add(n); clock[0] += n; });
    lim.acquire(1); lim.acquire(1);
    eq(slept, List.of(500_000_000L));
    try { lim.acquire(5); ok(false, "throws"); } catch (IllegalArgumentException e) { checks++; }
  }

  static void diffs() {
    List<Item> a = List.of(new Item(1, "a"), new Item(2, "b"), new Item(3, "c"), new Item(4, "d"));
    ListDiff d1 = ListDiff.diff(a, List.of(new Item(1, "a"), new Item(3, "C"), new Item(5, "e"), new Item(4, "d")), Item::id);
    eq(d1.deletes(), List.of(1)); eq(d1.inserts(), List.of(2)); eq(d1.reloads(), List.of(1)); eq(d1.moves().size(), 0);
    List<Item> five = List.of(new Item(1, ""), new Item(2, ""), new Item(3, ""), new Item(4, ""), new Item(5, ""));
    List<Item> rotated = List.of(new Item(2, ""), new Item(3, ""), new Item(4, ""), new Item(5, ""), new Item(1, ""));
    eq(ListDiff.diff(five, rotated, Item::id).moves(), List.of(new ListDiff.Move(0, 4)));
    ok(ListDiff.diff(a, a, Item::id).isEmpty(), "no change is empty");
    eq(ListDiff.longestIncreasingSubsequence(List.of(3, 1, 2, 5, 4, 6)).size(), 4);
    eq(ListDiff.longestIncreasingSubsequence(List.of()), List.of());
  }

  static void search() throws Exception {
    List<String> calls = new CopyOnWriteArrayList<>();
    try (SearchViewModel vm = new SearchViewModel(q -> { calls.add(q); try { sleep(q.equals("slow") ? 60 : 5); } catch (InterruptedException e) { throw new RuntimeException(e); } return List.of("r:" + q); }, Duration.ofMillis(30), 2)) {
      vm.onQueryChanged("a"); sleep(50); eq(calls.size(), 0);
      vm.onQueryChanged("ab"); vm.onQueryChanged("abc"); vm.onQueryChanged("abcd");
      sleep(120);
      eq(calls, List.of("abcd")); eq(vm.ui().results(), List.of("r:abcd"));
      vm.onQueryChanged("slow"); sleep(45);
      vm.onQueryChanged("fast"); sleep(150);
      eq(vm.ui().results(), List.of("r:fast"));
    }
    try (SearchViewModel bad = new SearchViewModel(q -> { throw new RuntimeException("x"); }, Duration.ofMillis(5), 2)) {
      bad.onQueryChanged("zz"); sleep(40);
      eq(bad.ui().error(), "Search failed. Pull to retry.");
    }
  }

  static CompletableFuture<FeedPaginator.FeedPage<Item>> later(long ms, FeedPaginator.FeedPage<Item> page) {
    return CompletableFuture.supplyAsync(() -> { try { sleep(ms); } catch (InterruptedException e) { throw new RuntimeException(e); } return page; });
  }

  static void feed() throws Exception {
    Map<String, FeedPaginator.FeedPage<Item>> pages = Map.of(
        "start", new FeedPaginator.FeedPage<>(List.of(new Item(1, ""), new Item(2, "")), "p2"),
        "p2", new FeedPaginator.FeedPage<>(List.of(new Item(2, ""), new Item(3, "")), "p3"),
        "p3", new FeedPaginator.FeedPage<>(List.of(new Item(4, "")), null));
    AtomicInteger fetches = new AtomicInteger();
    FeedPaginator<Item, Integer> feed = new FeedPaginator<>(Item::id, c -> { fetches.incrementAndGet(); return later(5, pages.get(c == null ? "start" : c)); });
    CompletableFuture<Void> one = feed.loadNext(), two = feed.loadNext();
    one.get(); two.get();
    eq(fetches.get(), 1);
    feed.loadNext().get(); feed.loadNext().get();
    eq(feed.items().stream().map(Item::id).toList(), List.of(1, 2, 3, 4));
    ok(feed.state() instanceof FeedPaginator.End, "ended");
    feed.loadNext().get(); eq(fetches.get(), 3);
    AtomicBoolean slow = new AtomicBoolean(true);
    FeedPaginator<Item, Integer> f2 = new FeedPaginator<>(Item::id, c -> slow.getAndSet(false) ? later(40, new FeedPaginator.FeedPage<>(List.of(new Item(99, "")), null)) : later(1, new FeedPaginator.FeedPage<>(List.of(new Item(1, "")), null)));
    CompletableFuture<Void> old = f2.loadNext(); sleep(5); f2.refresh().get(); old.get();
    eq(f2.items().stream().map(Item::id).toList(), List.of(1));
    FeedPaginator<Item, Integer> f3 = new FeedPaginator<>(Item::id, c -> CompletableFuture.failedFuture(new IOException("offline")));
    f3.loadNext().get();
    eq(f3.state(), new FeedPaginator.Failed("offline"));
    AtomicInteger prefetched = new AtomicInteger();
    List<Item> twenty = new ArrayList<>(); for (int i = 0; i < 20; i++) twenty.add(new Item(i, ""));
    FeedPaginator<Item, Integer> f4 = new FeedPaginator<>(Item::id, c -> { prefetched.incrementAndGet(); return CompletableFuture.completedFuture(new FeedPaginator.FeedPage<>(twenty, "n")); });
    f4.loadNext().get(); f4.onItemShown(3, 5).get(); eq(prefetched.get(), 1); f4.onItemShown(16, 5).get(); eq(prefetched.get(), 2);
  }

  static class MemStore implements Outbox.OutboxStore {
    final List<List<Outbox.PendingOp>> saved = new ArrayList<>();
    final List<Outbox.PendingOp> initial;
    MemStore(List<Outbox.PendingOp> initial) { this.initial = initial; }
    public List<Outbox.PendingOp> load() { return initial; }
    public void save(List<Outbox.PendingOp> ops) { saved.add(ops); }
  }

  static void outbox() throws Exception {
    Deque<Outbox.PushResult> results = new ArrayDeque<>(List.of(new Outbox.Applied(), new Outbox.Duplicate(), new Outbox.Rejected("bad")));
    List<String> pushed = new ArrayList<>();
    MemStore store = new MemStore(List.of());
    Outbox ob = new Outbox(store, op -> { pushed.add(op.entity()); return results.poll(); }, 8);
    ob.enqueue(new Outbox.PendingOp("a", "1")); ob.enqueue(new Outbox.PendingOp("b", "2")); ob.enqueue(new Outbox.PendingOp("c", "3"));
    eq(store.saved.get(store.saved.size() - 1).size(), 3);
    eq(ob.drain(), new Outbox.Drained());
    eq(pushed, List.of("a", "b", "c")); eq(ob.pendingCount(), 0); eq(ob.parkedOps().get(0).entity(), "c");
    Outbox off = new Outbox(new MemStore(List.of()), op -> { throw new IOException("offline"); }, 8);
    off.enqueue(new Outbox.PendingOp("x", "1"));
    eq(off.drain(), new Outbox.Offline()); eq(off.pendingCount(), 1);
    MemStore store3 = new MemStore(List.of());
    Outbox retry = new Outbox(store3, op -> new Outbox.Retryable(Duration.ofMillis(777)), 2);
    retry.enqueue(new Outbox.PendingOp("y", "1"));
    eq(retry.drain(), new Outbox.RetryLater(Duration.ofMillis(777)));
    eq(store3.saved.get(store3.saved.size() - 1).get(0).attempts(), 1);
    retry.drain();
    eq(retry.pendingCount(), 0); eq(retry.parkedOps().size(), 1);
    CountDownLatch gate = new CountDownLatch(1);
    Outbox reopened = new Outbox(new MemStore(List.of(new Outbox.PendingOp("z", "1"))), op -> { try { gate.await(); } catch (InterruptedException e) { throw new IOException(e); } return new Outbox.Applied(); }, 8);
    ExecutorService pool = Executors.newSingleThreadExecutor();
    Future<Outbox.DrainOutcome> first = pool.submit(reopened::drain);
    sleep(40);
    eq(reopened.drain(), new Outbox.AlreadyRunning());
    gate.countDown(); eq(first.get(), new Outbox.Drained());
    pool.shutdown();
  }

  static void images() throws Exception {
    ExecutorService pool = Executors.newFixedThreadPool(4);
    AtomicInteger fetches = new AtomicInteger();
    ImageLoader loader = new ImageLoader(url -> { fetches.incrementAndGet(); sleep(30); return new byte[] {(byte) url.length()}; }, pool, null, 1024);
    CompletableFuture<byte[]> a = loader.load("http://x/1"), b = loader.load("http://x/1"), c = loader.load("http://x/1");
    byte[] ra = a.get(); b.get(); c.get();
    eq(fetches.get(), 1);
    loader.load("http://x/1").get(); eq(fetches.get(), 1);
    loader.clearMemory(); loader.load("http://x/1").get(); eq(fetches.get(), 2);
    Map<String, byte[]> disk = new ConcurrentHashMap<>(Map.of("http://x/disk", new byte[] {9, 9}));
    ImageLoader withDisk = new ImageLoader(u -> { throw new IOException("no network"); }, pool, new ImageLoader.DiskCache() {
      public byte[] get(String k) { return disk.get(k); }
      public void put(String k, byte[] v) { disk.put(k, v); }
    }, 1024);
    eq(withDisk.load("http://x/disk").get(), new byte[] {9, 9});
    AtomicInteger attempts = new AtomicInteger();
    ImageLoader flaky = new ImageLoader(u -> { if (attempts.incrementAndGet() == 1) throw new IOException("once"); return new byte[] {1}; }, pool, null, 1024);
    try { flaky.load("u").get(); ok(false, "fails once"); } catch (ExecutionException e) { checks++; }
    eq(flaky.load("u").get(), new byte[] {1});
    CountDownLatch started = new CountDownLatch(1);
    ImageLoader slow = new ImageLoader(u -> { started.countDown(); sleep(2000); return new byte[] {1}; }, pool, null, 1024);
    CompletableFuture<byte[]> pending = slow.load("u");
    started.await(); slow.cancel("u");
    ok(pending.isCancelled() || pending.isCompletedExceptionally(), "cancelled download ends");
    pool.shutdownNow();
  }

  static void uploads() throws Exception {
    byte[] file = new byte[37];
    for (int i = 0; i < file.length; i++) file[i] = (byte) i;
    ResumableUploader.UploadPlan plan = new ResumableUploader.UploadPlan("f", 37, 4, Map.of());
    eq(plan.remaining().size(), 10); eq(plan.byteRange(9), new int[] {36, 37});
    AtomicInteger active = new AtomicInteger(), peak = new AtomicInteger();
    Map<Integer, byte[]> seen = new ConcurrentHashMap<>();
    List<Integer> saves = new CopyOnWriteArrayList<>();
    ResumableUploader up = new ResumableUploader((id, part, bytes) -> {
      int now = active.incrementAndGet(); peak.accumulateAndGet(now, Math::max);
      sleep(10); active.decrementAndGet(); seen.put(part, bytes); return "etag-" + part;
    }, p -> saves.add(p.completed().size()), 3);
    ResumableUploader.UploadPlan done = up.upload(file, plan);
    ok(done.isComplete(), "all parts done"); ok(peak.get() <= 3 && peak.get() > 1, "concurrency"); eq(saves, List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)); eq(seen.size(), 10);
    eq(seen.get(9), new byte[] {36});
    List<Integer> sent = new CopyOnWriteArrayList<>();
    Map<Integer, String> doneParts = new HashMap<>();
    for (int i = 0; i < 7; i++) doneParts.put(i, "x");
    ResumableUploader.UploadPlan resumed = new ResumableUploader((id, part, bytes) -> { sent.add(part); return "e"; }, p -> {}, 2).upload(file, new ResumableUploader.UploadPlan("f", 37, 4, doneParts));
    List<Integer> sortedSent = new ArrayList<>(sent); Collections.sort(sortedSent);
    eq(sortedSent, List.of(7, 8, 9)); ok(resumed.isComplete(), "resumed");
    AtomicInteger last = new AtomicInteger();
    try {
      new ResumableUploader((id, part, bytes) -> { if (part == 5) throw new IOException("boom"); sleep(5); return "e"; }, p -> last.set(p.completed().size()), 2).upload(file, plan);
      ok(false, "should fail");
    } catch (IOException e) { eq(e.getMessage(), "boom"); }
    ok(last.get() >= 1 && last.get() < 10, "some parts were checkpointed before the failure");
    try { up.upload(new byte[3], plan); ok(false, "mismatch"); } catch (IllegalArgumentException e) { checks++; }
  }
}
`;

const dir = mkdtempSync(join(tmpdir(), "mobile-java-"));
writeFileSync(join(dir, "MobileTest.java"), test);
const sources = [...files.map((f) => join(SRC, f)), join(dir, "MobileTest.java")];
execFileSync("javac", ["-Xlint:all", "-d", dir, ...sources], { stdio: "pipe" });
const out = execFileSync("java", ["-cp", dir, "MobileTest"], { stdio: "pipe", timeout: 120000 }).toString().trim();
assert.match(out, /Java mobile checks passed/);
console.log(out);
