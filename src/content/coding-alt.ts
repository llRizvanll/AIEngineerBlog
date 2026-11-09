/* The same pattern templates in Kotlin and Java, next to the TypeScript in coding.ts.
   Java is compiled and run by tests/modules/coding-alt.test.mts. Kotlin follows the same logic line for line. */
import type { CodeVariant } from "@/config/languages";

export interface Alt {
  kotlin: string;
  java: string;
}

/** The Kotlin and Java versions of a sample, as language-tab variants. */
export const variantsOf = (alt?: Alt): CodeVariant[] => (alt ? [{ id: "kotlin", src: alt.kotlin }, { id: "java", src: alt.java }] : []);

export const TEMPLATE_ALT: Record<string, Alt> = {
  "two-pointers": {
    kotlin: `fun pairSum(nums: IntArray, target: Int): Pair<Int, Int>? {
    var lo = 0
    var hi = nums.size - 1
    while (lo < hi) {
        val s = nums[lo] + nums[hi]
        when {
            s == target -> return lo to hi
            s < target -> lo++   // need a bigger sum
            else -> hi--         // need a smaller sum
        }
    }
    return null
}`,
    java: `static int[] pairSum(int[] nums, int target) {
  int lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    int s = nums[lo] + nums[hi];
    if (s == target) return new int[] {lo, hi};
    if (s < target) lo++;   // need a bigger sum
    else hi--;              // need a smaller sum
  }
  return null;
}`,
  },
  "sliding-window": {
    kotlin: `fun longestWindow(s: String): Int {
    val count = HashMap<Char, Int>()
    var left = 0
    var best = 0
    for (right in s.indices) {
        val ch = s[right]
        count[ch] = (count[ch] ?: 0) + 1
        while (count.getValue(ch) > 1) {   // window invalid
            count[s[left]] = count.getValue(s[left]) - 1
            left++
        }
        best = maxOf(best, right - left + 1)
    }
    return best
}`,
    java: `static int longestWindow(String s) {
  Map<Character, Integer> count = new HashMap<>();
  int left = 0, best = 0;
  for (int right = 0; right < s.length(); right++) {
    char ch = s.charAt(right);
    count.merge(ch, 1, Integer::sum);
    while (count.get(ch) > 1) {   // window invalid
      count.merge(s.charAt(left), -1, Integer::sum);
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
  },
  "fast-slow": {
    kotlin: `class ListNode(val value: Int, var next: ListNode? = null)

fun hasCycle(head: ListNode?): Boolean {
    var slow = head
    var fast = head
    while (fast != null && fast.next != null) {
        slow = slow?.next
        fast = fast.next?.next
        if (slow === fast) return true
    }
    return false
}`,
    java: `class ListNode {
  int val;
  ListNode next;
  ListNode(int val) { this.val = val; }
}

static boolean hasCycle(ListNode head) {
  ListNode slow = head, fast = head;
  while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow == fast) return true;
  }
  return false;
}`,
  },
  "binary-search": {
    kotlin: `// smallest x in [lo, hi] with check(x) == true
fun firstTrue(low: Int, high: Int, check: (Int) -> Boolean): Int {
    var lo = low
    var hi = high
    while (lo < hi) {
        val mid = lo + (hi - lo) / 2
        if (check(mid)) hi = mid   // mid might be the answer
        else lo = mid + 1          // answer is right of mid
    }
    return lo
}`,
    java: `// smallest x in [lo, hi] with check.test(x) == true
static int firstTrue(int lo, int hi, IntPredicate check) {
  while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (check.test(mid)) hi = mid;   // mid might be the answer
    else lo = mid + 1;               // answer is right of mid
  }
  return lo;
}`,
  },
  "prefix-hash": {
    kotlin: `fun subarraySum(nums: IntArray, k: Int): Int {
    val seen = hashMapOf(0 to 1)   // prefix sum -> count
    var prefix = 0
    var count = 0
    for (x in nums) {
        prefix += x
        count += seen[prefix - k] ?: 0
        seen[prefix] = (seen[prefix] ?: 0) + 1
    }
    return count
}`,
    java: `static int subarraySum(int[] nums, int k) {
  Map<Integer, Integer> seen = new HashMap<>();
  seen.put(0, 1);   // prefix sum -> count
  int prefix = 0, count = 0;
  for (int x : nums) {
    prefix += x;
    count += seen.getOrDefault(prefix - k, 0);
    seen.merge(prefix, 1, Integer::sum);
  }
  return count;
}`,
  },
  "monotonic-stack": {
    kotlin: `fun nextGreater(nums: IntArray): IntArray {
    val res = IntArray(nums.size) { -1 }
    val stack = ArrayDeque<Int>()   // indices, values decreasing
    for (i in nums.indices) {
        while (stack.isNotEmpty() && nums[stack.last()] < nums[i]) {
            res[stack.removeLast()] = nums[i]
        }
        stack.addLast(i)
    }
    return res
}`,
    java: `static int[] nextGreater(int[] nums) {
  int[] res = new int[nums.length];
  Arrays.fill(res, -1);
  Deque<Integer> stack = new ArrayDeque<>();   // indices, values decreasing
  for (int i = 0; i < nums.length; i++) {
    while (!stack.isEmpty() && nums[stack.peek()] < nums[i]) {
      res[stack.pop()] = nums[i];
    }
    stack.push(i);
  }
  return res;
}`,
  },
  heap: {
    kotlin: `fun kLargest(nums: IntArray, k: Int): List<Int> {
    val heap = PriorityQueue<Int>()   // a min-heap
    for (x in nums) {
        heap.add(x)
        if (heap.size > k) heap.poll()   // drop the smallest
    }
    val out = ArrayList<Int>()
    while (heap.isNotEmpty()) out.add(heap.poll())
    return out.reversed()
}`,
    java: `static int[] kLargest(int[] nums, int k) {
  PriorityQueue<Integer> heap = new PriorityQueue<>();   // a min-heap
  for (int x : nums) {
    heap.add(x);
    if (heap.size() > k) heap.poll();   // drop the smallest
  }
  int[] out = new int[heap.size()];
  for (int i = out.length - 1; i >= 0; i--) out[i] = heap.poll();
  return out;
}`,
  },
  intervals: {
    kotlin: `fun merge(intervals: Array<IntArray>): List<IntArray> {
    intervals.sortBy { it[0] }
    val merged = ArrayList<IntArray>()
    for ((start, end) in intervals) {
        val last = merged.lastOrNull()
        if (last != null && start <= last[1]) last[1] = maxOf(last[1], end)
        else merged.add(intArrayOf(start, end))
    }
    return merged
}`,
    java: `static int[][] merge(int[][] intervals) {
  Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
  List<int[]> merged = new ArrayList<>();
  for (int[] cur : intervals) {
    int[] last = merged.isEmpty() ? null : merged.get(merged.size() - 1);
    if (last != null && cur[0] <= last[1]) last[1] = Math.max(last[1], cur[1]);
    else merged.add(new int[] {cur[0], cur[1]});
  }
  return merged.toArray(new int[0][]);
}`,
  },
  graphs: {
    kotlin: `fun shortest(grid: Array<CharArray>, start: Pair<Int, Int>, goal: Pair<Int, Int>): Int {
    val rows = grid.size
    val cols = grid[0].size
    val q = java.util.ArrayDeque<IntArray>()
    q.add(intArrayOf(start.first, start.second, 0))
    val seen = Array(rows) { BooleanArray(cols) }
    seen[start.first][start.second] = true
    val dirs = arrayOf(intArrayOf(1, 0), intArrayOf(-1, 0), intArrayOf(0, 1), intArrayOf(0, -1))
    while (q.isNotEmpty()) {
        val (r, c, d) = q.poll()
        if (r == goal.first && c == goal.second) return d
        for ((dr, dc) in dirs) {
            val nr = r + dr
            val nc = c + dc
            if (nr !in 0 until rows || nc !in 0 until cols) continue
            if (grid[nr][nc] == '#' || seen[nr][nc]) continue
            seen[nr][nc] = true
            q.add(intArrayOf(nr, nc, d + 1))
        }
    }
    return -1
}`,
    java: `static int shortest(char[][] grid, int[] start, int[] goal) {
  int rows = grid.length, cols = grid[0].length;
  Deque<int[]> q = new ArrayDeque<>();
  q.add(new int[] {start[0], start[1], 0});
  boolean[][] seen = new boolean[rows][cols];
  seen[start[0]][start[1]] = true;
  int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
  while (!q.isEmpty()) {
    int[] cur = q.poll();
    if (cur[0] == goal[0] && cur[1] == goal[1]) return cur[2];
    for (int[] d : dirs) {
      int nr = cur[0] + d[0], nc = cur[1] + d[1];
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] == '#' || seen[nr][nc]) continue;
      seen[nr][nc] = true;
      q.add(new int[] {nr, nc, cur[2] + 1});
    }
  }
  return -1;
}`,
  },
  "topo-sort": {
    kotlin: `// edge (a, b): a must come before b
fun topoOrder(n: Int, edges: List<Pair<Int, Int>>): List<Int> {
    val graph = List(n) { mutableListOf<Int>() }
    val indeg = IntArray(n)
    for ((a, b) in edges) {
        graph[a].add(b)
        indeg[b]++
    }
    val q = (0 until n).filter { indeg[it] == 0 }.toMutableList()
    var head = 0
    while (head < q.size) {
        for (next in graph[q[head++]]) {
            if (--indeg[next] == 0) q.add(next)
        }
    }
    return if (q.size == n) q else emptyList()   // empty means a cycle
}`,
    java: `// edge {a, b}: a must come before b
static List<Integer> topoOrder(int n, int[][] edges) {
  List<List<Integer>> graph = new ArrayList<>();
  for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
  int[] indeg = new int[n];
  for (int[] e : edges) {
    graph.get(e[0]).add(e[1]);
    indeg[e[1]]++;
  }
  List<Integer> q = new ArrayList<>();
  for (int i = 0; i < n; i++) if (indeg[i] == 0) q.add(i);
  for (int head = 0; head < q.size(); head++) {
    for (int next : graph.get(q.get(head))) {
      if (--indeg[next] == 0) q.add(next);
    }
  }
  return q.size() == n ? q : List.of();   // empty means a cycle
}`,
  },
  "union-find": {
    kotlin: `class DSU(n: Int) {
    private val parent = IntArray(n) { it }
    private val size = IntArray(n) { 1 }

    fun find(x0: Int): Int {
        var x = x0
        while (parent[x] != x) {
            parent[x] = parent[parent[x]]   // path halving
            x = parent[x]
        }
        return x
    }

    fun union(a: Int, b: Int): Boolean {
        var ra = find(a)
        var rb = find(b)
        if (ra == rb) return false
        if (size[ra] < size[rb]) { val t = ra; ra = rb; rb = t }
        parent[rb] = ra
        size[ra] += size[rb]
        return true
    }
}`,
    java: `class DSU {
  int[] parent, size;

  DSU(int n) {
    parent = new int[n];
    size = new int[n];
    for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; }
  }

  int find(int x) {
    while (parent[x] != x) {
      parent[x] = parent[parent[x]];   // path halving
      x = parent[x];
    }
    return x;
  }

  boolean union(int a, int b) {
    int ra = find(a), rb = find(b);
    if (ra == rb) return false;
    if (size[ra] < size[rb]) { int t = ra; ra = rb; rb = t; }
    parent[rb] = ra;
    size[ra] += size[rb];
    return true;
  }
}`,
  },
  backtracking: {
    kotlin: `fun subsets(nums: IntArray): List<List<Int>> {
    val out = mutableListOf<List<Int>>()
    val path = mutableListOf<Int>()
    fun go(start: Int) {
        out.add(path.toList())   // copy!
        for (i in start until nums.size) {
            path.add(nums[i])                 // choose
            go(i + 1)                         // explore
            path.removeAt(path.lastIndex)     // un-choose
        }
    }
    go(0)
    return out
}`,
    java: `static List<List<Integer>> subsets(int[] nums) {
  List<List<Integer>> out = new ArrayList<>();
  go(nums, 0, new ArrayList<>(), out);
  return out;
}

static void go(int[] nums, int start, List<Integer> path, List<List<Integer>> out) {
  out.add(new ArrayList<>(path));   // copy!
  for (int i = start; i < nums.length; i++) {
    path.add(nums[i]);                    // choose
    go(nums, i + 1, path, out);           // explore
    path.remove(path.size() - 1);         // un-choose
  }
}`,
  },
  "dynamic-programming": {
    kotlin: `fun minCostClimb(cost: IntArray): Int {
    val n = cost.size
    val memo = HashMap<Int, Int>()
    fun dp(i: Int): Int {   // min cost to reach the top from step i
        if (i >= n) return 0
        return memo.getOrPut(i) { cost[i] + minOf(dp(i + 1), dp(i + 2)) }
    }
    return minOf(dp(0), dp(1))
}`,
    java: `static int minCostClimb(int[] cost) {
  Map<Integer, Integer> memo = new HashMap<>();
  return Math.min(dp(0, cost, memo), dp(1, cost, memo));
}

// min cost to reach the top from step i
static int dp(int i, int[] cost, Map<Integer, Integer> memo) {
  if (i >= cost.length) return 0;
  Integer hit = memo.get(i);
  if (hit != null) return hit;
  int best = cost[i] + Math.min(dp(i + 1, cost, memo), dp(i + 2, cost, memo));
  memo.put(i, best);
  return best;
}`,
  },
  trie: {
    kotlin: `class TrieNode {
    val children = HashMap<Char, TrieNode>()
    var end = false
}

class Trie {
    private val root = TrieNode()

    fun insert(word: String) {
        var node = root
        for (ch in word) node = node.children.getOrPut(ch) { TrieNode() }
        node.end = true
    }

    fun startsWith(prefix: String): Boolean {
        var node = root
        for (ch in prefix) node = node.children[ch] ?: return false
        return true
    }
}`,
    java: `class TrieNode {
  Map<Character, TrieNode> children = new HashMap<>();
  boolean end = false;
}

class Trie {
  TrieNode root = new TrieNode();

  void insert(String word) {
    TrieNode node = root;
    for (char ch : word.toCharArray()) {
      node = node.children.computeIfAbsent(ch, c -> new TrieNode());
    }
    node.end = true;
  }

  boolean startsWith(String prefix) {
    TrieNode node = root;
    for (char ch : prefix.toCharArray()) {
      node = node.children.get(ch);
      if (node == null) return false;
    }
    return true;
  }
}`,
  },
  greedy: {
    kotlin: `fun canJump(nums: IntArray): Boolean {
    var reach = 0
    for (i in nums.indices) {
        if (i > reach) return false   // stuck before i
        reach = maxOf(reach, i + nums[i])
    }
    return true
}`,
    java: `static boolean canJump(int[] nums) {
  int reach = 0;
  for (int i = 0; i < nums.length; i++) {
    if (i > reach) return false;   // stuck before i
    reach = Math.max(reach, i + nums[i]);
  }
  return true;
}`,
  },
};

/* The worked problem of each pattern. These use the helper classes from the templates above (ListNode, DSU). */
export const WORKED_ALT: Record<string, Alt> = {
  "two-pointers": {
    kotlin: `fun threeSum(nums: IntArray): List<List<Int>> {
    nums.sort()
    val out = mutableListOf<List<Int>>()
    for (i in 0 until nums.size - 2) {
        if (i > 0 && nums[i] == nums[i - 1]) continue   // skip duplicate anchors
        var lo = i + 1
        var hi = nums.size - 1
        while (lo < hi) {
            val s = nums[i] + nums[lo] + nums[hi]
            when {
                s < 0 -> lo++
                s > 0 -> hi--
                else -> {
                    out.add(listOf(nums[i], nums[lo], nums[hi]))
                    lo++
                    while (lo < hi && nums[lo] == nums[lo - 1]) lo++   // skip duplicate seconds
                }
            }
        }
    }
    return out
}`,
    java: `static List<List<Integer>> threeSum(int[] nums) {
  Arrays.sort(nums);
  List<List<Integer>> out = new ArrayList<>();
  for (int i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] == nums[i - 1]) continue;   // skip duplicate anchors
    int lo = i + 1, hi = nums.length - 1;
    while (lo < hi) {
      int s = nums[i] + nums[lo] + nums[hi];
      if (s < 0) lo++;
      else if (s > 0) hi--;
      else {
        out.add(List.of(nums[i], nums[lo], nums[hi]));
        lo++;
        while (lo < hi && nums[lo] == nums[lo - 1]) lo++;   // skip duplicate seconds
      }
    }
  }
  return out;
}`,
  },
  "sliding-window": {
    kotlin: `fun minWindow(s: String, t: String): String {
    val need = HashMap<Char, Int>()
    for (ch in t) need[ch] = (need[ch] ?: 0) + 1
    var missing = t.length
    var left = 0
    var bestLo = 0
    var bestLen = Int.MAX_VALUE
    for (right in s.indices) {
        val ch = s[right]
        if ((need[ch] ?: 0) > 0) missing--
        need[ch] = (need[ch] ?: 0) - 1
        while (missing == 0) {
            if (right - left + 1 < bestLen) {
                bestLo = left
                bestLen = right - left + 1
            }
            val out = s[left++]
            need[out] = need.getValue(out) + 1
            if (need.getValue(out) > 0) missing++
        }
    }
    return if (bestLen == Int.MAX_VALUE) "" else s.substring(bestLo, bestLo + bestLen)
}`,
    java: `static String minWindow(String s, String t) {
  Map<Character, Integer> need = new HashMap<>();
  for (char ch : t.toCharArray()) need.merge(ch, 1, Integer::sum);
  int missing = t.length();
  int left = 0, bestLo = 0, bestLen = Integer.MAX_VALUE;
  for (int right = 0; right < s.length(); right++) {
    char ch = s.charAt(right);
    if (need.getOrDefault(ch, 0) > 0) missing--;
    need.merge(ch, -1, Integer::sum);
    while (missing == 0) {
      if (right - left + 1 < bestLen) {
        bestLo = left;
        bestLen = right - left + 1;
      }
      char out = s.charAt(left++);
      need.merge(out, 1, Integer::sum);
      if (need.get(out) > 0) missing++;
    }
  }
  return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestLo, bestLo + bestLen);
}`,
  },
  "fast-slow": {
    kotlin: `fun detectCycle(head: ListNode?): ListNode? {
    var slow = head
    var fast = head
    while (fast != null && fast.next != null) {
        slow = slow?.next
        fast = fast.next?.next
        if (slow === fast) {
            var p = head
            while (p !== slow) {
                p = p?.next
                slow = slow?.next
            }
            return p
        }
    }
    return null
}`,
    java: `static ListNode detectCycle(ListNode head) {
  ListNode slow = head, fast = head;
  while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow == fast) {
      ListNode p = head;
      while (p != slow) {
        p = p.next;
        slow = slow.next;
      }
      return p;
    }
  }
  return null;
}`,
  },
  "binary-search": {
    kotlin: `fun minEatingSpeed(piles: IntArray, h: Int): Int {
    fun hours(k: Int): Long = piles.sumOf { ((it + k - 1) / k).toLong() }   // ceil(p / k)
    var lo = 1
    var hi = piles.max()
    while (lo < hi) {
        val mid = (lo + hi) / 2
        if (hours(mid) <= h) hi = mid
        else lo = mid + 1
    }
    return lo
}`,
    java: `static int minEatingSpeed(int[] piles, int h) {
  int lo = 1, hi = Arrays.stream(piles).max().getAsInt();
  while (lo < hi) {
    int mid = (lo + hi) / 2;
    if (hoursAt(piles, mid) <= h) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

static long hoursAt(int[] piles, int k) {
  long hours = 0;
  for (int p : piles) hours += (p + k - 1) / k;   // ceil(p / k)
  return hours;
}`,
  },
  "prefix-hash": {
    kotlin: `fun longestConsecutive(nums: IntArray): Int {
    val s = nums.toHashSet()
    var best = 0
    for (x in s) {
        if (s.contains(x - 1)) continue   // x is not the start of a run
        var y = x
        while (s.contains(y + 1)) y++
        best = maxOf(best, y - x + 1)
    }
    return best
}`,
    java: `static int longestConsecutive(int[] nums) {
  Set<Integer> s = new HashSet<>();
  for (int x : nums) s.add(x);
  int best = 0;
  for (int x : s) {
    if (s.contains(x - 1)) continue;   // x is not the start of a run
    int y = x;
    while (s.contains(y + 1)) y++;
    best = Math.max(best, y - x + 1);
  }
  return best;
}`,
  },
  "monotonic-stack": {
    kotlin: `fun dailyTemperatures(t: IntArray): IntArray {
    val res = IntArray(t.size)
    val stack = ArrayDeque<Int>()
    for (i in t.indices) {
        while (stack.isNotEmpty() && t[stack.last()] < t[i]) {
            val j = stack.removeLast()
            res[j] = i - j
        }
        stack.addLast(i)
    }
    return res
}`,
    java: `static int[] dailyTemperatures(int[] t) {
  int[] res = new int[t.length];
  Deque<Integer> stack = new ArrayDeque<>();
  for (int i = 0; i < t.length; i++) {
    while (!stack.isEmpty() && t[stack.peek()] < t[i]) {
      int j = stack.pop();
      res[j] = i - j;
    }
    stack.push(i);
  }
  return res;
}`,
  },
  heap: {
    kotlin: `fun mergeKLists(lists: List<ListNode?>): ListNode? {
    val heap = PriorityQueue<ListNode>(compareBy { it.value })
    for (head in lists) if (head != null) heap.add(head)
    val dummy = ListNode(0)
    var tail = dummy
    while (heap.isNotEmpty()) {
        val node = heap.poll()
        tail.next = node
        tail = node
        node.next?.let { heap.add(it) }
    }
    return dummy.next
}`,
    java: `static ListNode mergeKLists(ListNode[] lists) {
  PriorityQueue<ListNode> heap = new PriorityQueue<>((x, y) -> Integer.compare(x.val, y.val));
  for (ListNode head : lists) if (head != null) heap.add(head);
  ListNode dummy = new ListNode(0);
  ListNode tail = dummy;
  while (!heap.isEmpty()) {
    ListNode node = heap.poll();
    tail.next = node;
    tail = node;
    if (node.next != null) heap.add(node.next);
  }
  return dummy.next;
}`,
  },
  intervals: {
    kotlin: `fun minRooms(meetings: Array<IntArray>): Int {
    meetings.sortBy { it[0] }
    val ends = PriorityQueue<Int>()
    for ((start, end) in meetings) {
        if (ends.isNotEmpty() && ends.peek() <= start) ends.poll()   // reuse a room
        ends.add(end)
    }
    return ends.size
}`,
    java: `static int minRooms(int[][] meetings) {
  Arrays.sort(meetings, (a, b) -> Integer.compare(a[0], b[0]));
  PriorityQueue<Integer> ends = new PriorityQueue<>();
  for (int[] m : meetings) {
    if (!ends.isEmpty() && ends.peek() <= m[0]) ends.poll();   // reuse a room
    ends.add(m[1]);
  }
  return ends.size();
}`,
  },
  graphs: {
    kotlin: `fun numIslands(grid: Array<CharArray>): Int {
    val rows = grid.size
    val cols = grid[0].size
    fun sink(r0: Int, c0: Int) {
        val stack = ArrayDeque<IntArray>()
        stack.addLast(intArrayOf(r0, c0))
        while (stack.isNotEmpty()) {
            val (r, c) = stack.removeLast()
            if (r !in 0 until rows || c !in 0 until cols || grid[r][c] != '1') continue
            grid[r][c] = '0'
            stack.addLast(intArrayOf(r + 1, c))
            stack.addLast(intArrayOf(r - 1, c))
            stack.addLast(intArrayOf(r, c + 1))
            stack.addLast(intArrayOf(r, c - 1))
        }
    }
    var count = 0
    for (r in 0 until rows) {
        for (c in 0 until cols) {
            if (grid[r][c] == '1') {
                count++
                sink(r, c)
            }
        }
    }
    return count
}`,
    java: `static int numIslands(char[][] grid) {
  int rows = grid.length, cols = grid[0].length, count = 0;
  for (int r = 0; r < rows; r++) {
    for (int c = 0; c < cols; c++) {
      if (grid[r][c] == '1') {
        count++;
        sink(grid, r, c);
      }
    }
  }
  return count;
}

static void sink(char[][] grid, int r0, int c0) {
  Deque<int[]> stack = new ArrayDeque<>();
  stack.push(new int[] {r0, c0});
  while (!stack.isEmpty()) {
    int[] cur = stack.pop();
    int r = cur[0], c = cur[1];
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] != '1') continue;
    grid[r][c] = '0';
    stack.push(new int[] {r + 1, c});
    stack.push(new int[] {r - 1, c});
    stack.push(new int[] {r, c + 1});
    stack.push(new int[] {r, c - 1});
  }
}`,
  },
  "topo-sort": {
    kotlin: `fun canFinish(n: Int, prereqs: List<Pair<Int, Int>>): Boolean {
    val graph = List(n) { mutableListOf<Int>() }
    val indeg = IntArray(n)
    for ((course, pre) in prereqs) {
        graph[pre].add(course)
        indeg[course]++
    }
    val q = (0 until n).filter { indeg[it] == 0 }.toMutableList()
    var taken = 0
    var head = 0
    while (head < q.size) {
        taken++
        for (next in graph[q[head++]]) {
            if (--indeg[next] == 0) q.add(next)
        }
    }
    return taken == n
}`,
    java: `static boolean canFinish(int n, int[][] prereqs) {
  List<List<Integer>> graph = new ArrayList<>();
  for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
  int[] indeg = new int[n];
  for (int[] p : prereqs) {   // p = {course, pre}
    graph.get(p[1]).add(p[0]);
    indeg[p[0]]++;
  }
  List<Integer> q = new ArrayList<>();
  for (int i = 0; i < n; i++) if (indeg[i] == 0) q.add(i);
  int taken = 0;
  for (int head = 0; head < q.size(); head++) {
    taken++;
    for (int next : graph.get(q.get(head))) {
      if (--indeg[next] == 0) q.add(next);
    }
  }
  return taken == n;
}`,
  },
  "union-find": {
    kotlin: `fun findRedundantConnection(edges: List<Pair<Int, Int>>): List<Int> {
    val dsu = DSU(edges.size + 1)
    for ((a, b) in edges) {
        if (!dsu.union(a, b)) return listOf(a, b)
    }
    return emptyList()
}`,
    java: `static int[] findRedundantConnection(int[][] edges) {
  DSU dsu = new DSU(edges.length + 1);
  for (int[] e : edges) {
    if (!dsu.union(e[0], e[1])) return e;
  }
  return new int[0];
}`,
  },
  backtracking: {
    kotlin: `fun combinationSum(cands: IntArray, target: Int): List<List<Int>> {
    cands.sort()
    val out = mutableListOf<List<Int>>()
    val path = mutableListOf<Int>()
    fun go(start: Int, remain: Int) {
        if (remain == 0) {
            out.add(path.toList())
            return
        }
        for (i in start until cands.size) {
            if (cands[i] > remain) break   // prune: sorted
            path.add(cands[i])
            go(i, remain - cands[i])       // reuse allowed
            path.removeAt(path.lastIndex)
        }
    }
    go(0, target)
    return out
}`,
    java: `static List<List<Integer>> combinationSum(int[] cands, int target) {
  Arrays.sort(cands);
  List<List<Integer>> out = new ArrayList<>();
  combos(cands, 0, target, new ArrayList<>(), out);
  return out;
}

static void combos(int[] cands, int start, int remain, List<Integer> path, List<List<Integer>> out) {
  if (remain == 0) {
    out.add(new ArrayList<>(path));
    return;
  }
  for (int i = start; i < cands.length; i++) {
    if (cands[i] > remain) break;   // prune: sorted
    path.add(cands[i]);
    combos(cands, i, remain - cands[i], path, out);   // reuse allowed
    path.remove(path.size() - 1);
  }
}`,
  },
  "dynamic-programming": {
    kotlin: `fun coinChange(coins: IntArray, amount: Int): Int {
    val best = IntArray(amount + 1) { Int.MAX_VALUE }
    best[0] = 0
    for (a in 1..amount) {
        for (c in coins) {
            if (c <= a && best[a - c] != Int.MAX_VALUE && best[a - c] + 1 < best[a]) best[a] = best[a - c] + 1
        }
    }
    return if (best[amount] == Int.MAX_VALUE) -1 else best[amount]
}`,
    java: `static int coinChange(int[] coins, int amount) {
  int[] best = new int[amount + 1];
  Arrays.fill(best, Integer.MAX_VALUE);
  best[0] = 0;
  for (int a = 1; a <= amount; a++) {
    for (int c : coins) {
      if (c <= a && best[a - c] != Integer.MAX_VALUE && best[a - c] + 1 < best[a]) best[a] = best[a - c] + 1;
    }
  }
  return best[amount] == Integer.MAX_VALUE ? -1 : best[amount];
}`,
  },
  trie: {
    kotlin: `fun suggestedProducts(products: Array<String>, word: String): List<List<String>> {
    products.sort()
    val out = mutableListOf<List<String>>()
    var prefix = ""
    for (ch in word) {
        prefix += ch
        var lo = 0
        var hi = products.size   // first product >= prefix
        while (lo < hi) {
            val mid = (lo + hi) ushr 1
            if (products[mid] < prefix) lo = mid + 1
            else hi = mid
        }
        out.add(products.slice(lo until minOf(lo + 3, products.size)).filter { it.startsWith(prefix) })
    }
    return out
}`,
    java: `static List<List<String>> suggestedProducts(String[] products, String word) {
  Arrays.sort(products);
  List<List<String>> out = new ArrayList<>();
  StringBuilder prefix = new StringBuilder();
  for (char ch : word.toCharArray()) {
    prefix.append(ch);
    String p = prefix.toString();
    int lo = 0, hi = products.length;   // first product >= prefix
    while (lo < hi) {
      int mid = (lo + hi) >>> 1;
      if (products[mid].compareTo(p) < 0) lo = mid + 1;
      else hi = mid;
    }
    List<String> hits = new ArrayList<>();
    for (int i = lo; i < Math.min(lo + 3, products.length); i++) {
      if (products[i].startsWith(p)) hits.add(products[i]);
    }
    out.add(hits);
  }
  return out;
}`,
  },
  greedy: {
    kotlin: `fun canCompleteCircuit(gas: IntArray, cost: IntArray): Int {
    if (gas.sum() < cost.sum()) return -1
    var start = 0
    var tank = 0
    for (i in gas.indices) {
        tank += gas[i] - cost[i]
        if (tank < 0) {
            start = i + 1
            tank = 0
        }
    }
    return start
}`,
    java: `static int canCompleteCircuit(int[] gas, int[] cost) {
  if (Arrays.stream(gas).sum() < Arrays.stream(cost).sum()) return -1;
  int start = 0, tank = 0;
  for (int i = 0; i < gas.length; i++) {
    tank += gas[i] - cost[i];
    if (tank < 0) {
      start = i + 1;
      tank = 0;
    }
  }
  return start;
}`,
  },
};
