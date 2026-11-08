/* The same pattern templates in Kotlin and Java, next to the TypeScript in coding.ts.
   Java is compiled and run by tests/modules/coding-alt.test.mts. Kotlin follows the same logic line for line. */

export interface Alt {
  kotlin: string;
  java: string;
}

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
