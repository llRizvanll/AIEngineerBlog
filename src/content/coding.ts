/* Coding interview patterns: how to recognise them, a reusable template,
   a worked problem, practice problems and the traps. Code is Python 3. */

export interface Pattern {
  id: string;
  name: string;
  tagline: string;
  color: [string, string];
  signals: string[];
  idea: string;
  complexity: string;
  template: { title: string; code: string; beats: { hl: number[]; note: string }[] };
  worked: { problem: string; prompt: string; approach: string[]; code: string; complexity: string };
  practice: { name: string; level: "Easy" | "Medium" | "Hard"; hint: string }[];
  pitfalls: string[];
}

export const PATTERNS: Pattern[] = [
  {
    id: "two-pointers",
    name: "Two pointers",
    tagline: "Walk inwards from both ends of a sorted sequence.",
    color: ["#6c47ff", "#0ea5e9"],
    signals: ["Sorted array or string", "Find a pair or triplet with a target sum", "Reverse, partition or remove in place", "Palindrome checks"],
    idea: "Put one pointer at each end. Compare, then move the pointer that can only improve the answer. Each step discards a whole row of possibilities, so you visit each element once.",
    complexity: "O(n) time after sorting, O(1) extra space",
    template: {
      title: "Pair with target sum (sorted)",
      code: `def pair_sum(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        s = nums[lo] + nums[hi]
        if s == target:
            return lo, hi
        if s < target:
            lo += 1      # need a bigger sum
        else:
            hi -= 1      # need a smaller sum
    return None`,
      beats: [
        { hl: [1], note: "Start at both ends of the sorted array." },
        { hl: [3, 4, 5], note: "Compare the current pair with the target." },
        { hl: [6, 7, 8, 9], note: "Move the pointer that can only improve the sum." },
      ],
    },
    worked: {
      problem: "3Sum",
      prompt: "Return all unique triplets in nums that sum to zero.",
      approach: ["Sort the array.", "Fix one number, then run two pointers on the rest for the negated value.", "Skip duplicates at every level so triplets stay unique."],
      code: `def three_sum(nums):
    nums.sort()
    out = []
    for i in range(len(nums) - 2):
        if i and nums[i] == nums[i - 1]:
            continue                      # skip duplicate anchors
        lo, hi = i + 1, len(nums) - 1
        while lo < hi:
            s = nums[i] + nums[lo] + nums[hi]
            if s < 0:
                lo += 1
            elif s > 0:
                hi -= 1
            else:
                out.append([nums[i], nums[lo], nums[hi]])
                lo += 1
                while lo < hi and nums[lo] == nums[lo - 1]:
                    lo += 1               # skip duplicate seconds
    return out`,
      complexity: "O(n²) time, O(1) extra space beyond the output",
    },
    practice: [
      { name: "Valid Palindrome", level: "Easy", hint: "Skip non-alphanumerics from both ends." },
      { name: "Container With Most Water", level: "Medium", hint: "Always move the shorter wall." },
      { name: "Trapping Rain Water", level: "Hard", hint: "Track left max and right max; move the smaller side." },
    ],
    pitfalls: ["Forgetting to sort first", "Infinite loop when neither pointer moves", "Duplicate answers without skip logic"],
  },
  {
    id: "sliding-window",
    name: "Sliding window",
    tagline: "Grow the right edge, shrink the left edge while invalid.",
    color: ["#0ea5e9", "#10b981"],
    signals: ["Contiguous subarray or substring", "Longest or shortest window with a property", "At most K distinct, no repeats, sum at least S"],
    idea: "Keep a window [left, right]. Extend right one step at a time and update counts. While the window breaks the rule, move left forward. Every index enters and leaves once.",
    complexity: "O(n) time, O(k) space for the window state",
    template: {
      title: "Longest window that satisfies a rule",
      code: `def longest_window(s):
    count = {}
    left = best = 0
    for right, ch in enumerate(s):
        count[ch] = count.get(ch, 0) + 1
        while count[ch] > 1:           # window invalid
            count[s[left]] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best`,
      beats: [
        { hl: [3, 4], note: "Extend the right edge and record the new character." },
        { hl: [5, 6, 7], note: "Shrink from the left until the window is valid again." },
        { hl: [8], note: "Every valid window is a candidate answer." },
      ],
    },
    worked: {
      problem: "Minimum Window Substring",
      prompt: "Find the smallest substring of s that contains every character of t (with multiplicity).",
      approach: ["Count what t needs.", "Expand right; when a need is met, decrement 'missing'.", "While nothing is missing, record the window and shrink from the left."],
      code: `from collections import Counter

def min_window(s, t):
    need = Counter(t)
    missing = len(t)
    left = 0
    best = (0, float("inf"))
    for right, ch in enumerate(s):
        if need[ch] > 0:
            missing -= 1
        need[ch] -= 1
        while missing == 0:
            if right - left < best[1] - best[0]:
                best = (left, right)
            need[s[left]] += 1
            if need[s[left]] > 0:
                missing += 1
            left += 1
    lo, hi = best
    return "" if hi == float("inf") else s[lo:hi + 1]`,
      complexity: "O(|s| + |t|) time, O(alphabet) space",
    },
    practice: [
      { name: "Maximum Sum Subarray of Size K", level: "Easy", hint: "Fixed-size window: add right, subtract the element leaving." },
      { name: "Longest Repeating Character Replacement", level: "Medium", hint: "Valid while window length minus max count ≤ k." },
      { name: "Sliding Window Maximum", level: "Hard", hint: "Pair the window with a monotonic deque." },
    ],
    pitfalls: ["Using a window on non-contiguous problems", "Shrinking with if instead of while", "Off-by-one in window length (right - left + 1)"],
  },
  {
    id: "fast-slow",
    name: "Fast and slow pointers",
    tagline: "One pointer moves twice as fast; they meet in a cycle.",
    color: ["#f59e0b", "#ef4444"],
    signals: ["Linked list cycles", "Middle of a list", "Sequences that may loop (happy number)", "Find the duplicate with O(1) space"],
    idea: "Move slow by one and fast by two. If there is a cycle they must meet; if fast reaches the end there is none. When fast finishes, slow is in the middle.",
    complexity: "O(n) time, O(1) space",
    template: {
      title: "Detect a cycle",
      code: `def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False`,
      beats: [
        { hl: [1], note: "Both pointers start at the head." },
        { hl: [3, 4], note: "Slow moves one step, fast moves two." },
        { hl: [5, 6], note: "If they ever meet, the list loops." },
      ],
    },
    worked: {
      problem: "Linked List Cycle II",
      prompt: "Return the node where the cycle begins, or None.",
      approach: ["Find a meeting point with fast and slow.", "Reset one pointer to head.", "Move both one step at a time; they meet at the cycle start (distance maths)."],
      code: `def detect_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            p = head
            while p is not slow:
                p, slow = p.next, slow.next
            return p
    return None`,
      complexity: "O(n) time, O(1) space",
    },
    practice: [
      { name: "Middle of the Linked List", level: "Easy", hint: "When fast ends, slow is the middle." },
      { name: "Happy Number", level: "Easy", hint: "Treat the digit-square sequence as a linked list." },
      { name: "Find the Duplicate Number", level: "Medium", hint: "Index → value is a linked list with a cycle." },
    ],
    pitfalls: ["Checking fast.next.next without checking fast.next", "Comparing values instead of node identity"],
  },
  {
    id: "binary-search",
    name: "Binary search",
    tagline: "Halve the search space, including the answer space.",
    color: ["#8b5cf6", "#ec4899"],
    signals: ["Sorted or rotated array", "'Minimum X such that…' or 'maximum X such that…'", "A yes/no check that flips once (monotonic)", "Constraints up to 10⁹"],
    idea: "Keep a range where the answer must lie. Test the middle and discard the half that cannot contain it. 'Binary search on the answer' applies the same idea to a range of possible answers with a feasibility check.",
    complexity: "O(log n) per search; O(n log range) for search on the answer",
    template: {
      title: "First value where check() becomes true",
      code: `def first_true(lo, hi, check):
    # smallest x in [lo, hi] with check(x) True
    while lo < hi:
        mid = (lo + hi) // 2
        if check(mid):
            hi = mid          # mid might be the answer
        else:
            lo = mid + 1      # answer is right of mid
    return lo`,
      beats: [
        { hl: [2], note: "Loop until the range is a single value." },
        { hl: [4, 5], note: "If mid works, keep it and search left." },
        { hl: [6, 7], note: "Otherwise the answer is strictly to the right." },
      ],
    },
    worked: {
      problem: "Koko Eating Bananas",
      prompt: "Piles of bananas, h hours. Find the minimum eating speed k to finish in time.",
      approach: ["Speed range is 1 to max(pile).", "Feasible(k): total hours = sum(ceil(p / k)) ≤ h. It is monotonic in k.", "Binary search for the first feasible speed."],
      code: `def min_eating_speed(piles, h):
    def can(k):
        return sum((p + k - 1) // k for p in piles) <= h
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if can(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      complexity: "O(n log max(pile)) time, O(1) space",
    },
    practice: [
      { name: "Binary Search", level: "Easy", hint: "Use the first_true template with nums[mid] >= target." },
      { name: "Search in Rotated Sorted Array", level: "Medium", hint: "One half is always sorted; check if target lies in it." },
      { name: "Median of Two Sorted Arrays", level: "Hard", hint: "Binary search the partition of the shorter array." },
    ],
    pitfalls: ["Infinite loop from lo = mid", "Mixing inclusive and exclusive bounds", "Not proving the check is monotonic"],
  },
  {
    id: "prefix-hash",
    name: "Prefix sums and hashing",
    tagline: "Remember what you have seen to answer in O(1).",
    color: ["#10b981", "#84cc16"],
    signals: ["Two Sum style complement lookups", "Count subarrays with sum K", "Range sum queries", "Group by a signature (anagrams)"],
    idea: "A hash map turns 'have I seen the value I need?' into O(1). Prefix sums turn any subarray sum into a difference of two prefixes, so 'subarray sums to K' becomes 'seen prefix − K?'.",
    complexity: "O(n) time, O(n) space",
    template: {
      title: "Count subarrays summing to k",
      code: `def subarray_sum(nums, k):
    seen = {0: 1}          # prefix sum -> count
    prefix = count = 0
    for x in nums:
        prefix += x
        count += seen.get(prefix - k, 0)
        seen[prefix] = seen.get(prefix, 0) + 1
    return count`,
      beats: [
        { hl: [1], note: "An empty prefix (sum 0) has been seen once." },
        { hl: [4, 5], note: "A subarray ending here sums to k if prefix − k was seen." },
        { hl: [6], note: "Record this prefix for later positions." },
      ],
    },
    worked: {
      problem: "Longest Consecutive Sequence",
      prompt: "Unsorted integers; return the length of the longest run of consecutive values, in O(n).",
      approach: ["Put everything in a set.", "Only start counting from numbers whose predecessor is missing.", "Each number is visited a constant number of times."],
      code: `def longest_consecutive(nums):
    s = set(nums)
    best = 0
    for x in s:
        if x - 1 not in s:           # x starts a run
            y = x
            while y + 1 in s:
                y += 1
            best = max(best, y - x + 1)
    return best`,
      complexity: "O(n) time, O(n) space",
    },
    practice: [
      { name: "Two Sum", level: "Easy", hint: "Store value → index; look up target − x." },
      { name: "Group Anagrams", level: "Medium", hint: "Key = sorted word or a 26-count tuple." },
      { name: "Product of Array Except Self", level: "Medium", hint: "Prefix products from the left, suffix from the right." },
    ],
    pitfalls: ["Forgetting the {0: 1} seed", "Updating the map before the lookup (counts itself)"],
  },
  {
    id: "monotonic-stack",
    name: "Monotonic stack",
    tagline: "Keep a stack in sorted order to find the next greater or smaller.",
    color: ["#ec4899", "#f97316"],
    signals: ["Next greater / smaller element", "Days until a warmer temperature", "Largest rectangle in a histogram", "Remove digits to make the smallest number"],
    idea: "Keep indices on a stack whose values are decreasing. When a bigger value arrives, pop everything smaller: the new value is their 'next greater'. Each index is pushed and popped once.",
    complexity: "O(n) time, O(n) space",
    template: {
      title: "Next greater element to the right",
      code: `def next_greater(nums):
    res = [-1] * len(nums)
    stack = []                 # indices, values decreasing
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            res[stack.pop()] = x
        stack.append(i)
    return res`,
      beats: [
        { hl: [2], note: "The stack holds indices still waiting for an answer." },
        { hl: [4, 5], note: "A bigger value resolves every smaller one on the stack." },
        { hl: [6], note: "The current index now waits for its own answer." },
      ],
    },
    worked: {
      problem: "Daily Temperatures",
      prompt: "For each day, how many days until a warmer temperature? 0 if none.",
      approach: ["Same template, but store the distance instead of the value."],
      code: `def daily_temperatures(t):
    res = [0] * len(t)
    stack = []
    for i, x in enumerate(t):
        while stack and t[stack[-1]] < x:
            j = stack.pop()
            res[j] = i - j
        stack.append(i)
    return res`,
      complexity: "O(n) time, O(n) space",
    },
    practice: [
      { name: "Next Greater Element I", level: "Easy", hint: "Run the template once, store results in a map." },
      { name: "Online Stock Span", level: "Medium", hint: "Stack of (price, span); merge spans when popping." },
      { name: "Largest Rectangle in Histogram", level: "Hard", hint: "On pop, the bar's width runs from the new top to i." },
    ],
    pitfalls: ["Storing values when you need indices", "Choosing < versus <= wrongly for duplicates"],
  },
  {
    id: "heap",
    name: "Heap / top-K",
    tagline: "Keep the best K so far in a size-K heap.",
    color: ["#f43f5e", "#a855f7"],
    signals: ["Kth largest or smallest", "Top K frequent", "Merge K sorted lists", "Running median", "Always process the cheapest next item"],
    idea: "A min-heap of size K holds the K largest seen so far; its top is the Kth largest. For merging, push the head of each list and repeatedly pop the smallest.",
    complexity: "O(n log k) time, O(k) space",
    template: {
      title: "K largest with a size-k min-heap",
      code: `import heapq

def k_largest(nums, k):
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)   # drop the smallest
    return sorted(heap, reverse=True)`,
      beats: [
        { hl: [3], note: "Python's heapq is a min-heap." },
        { hl: [5, 6, 7], note: "Push, then evict the smallest once we exceed k." },
        { hl: [8], note: "What remains are the k largest; heap[0] is the kth." },
      ],
    },
    worked: {
      problem: "Merge K Sorted Lists",
      prompt: "Merge k sorted linked lists into one sorted list.",
      approach: ["Push (value, list index, node) for each head; the index breaks ties.", "Pop the smallest, append it, push its next node."],
      code: `import heapq

def merge_k_lists(lists):
    heap = [(n.val, i, n) for i, n in enumerate(lists) if n]
    heapq.heapify(heap)
    dummy = tail = ListNode(0)
    while heap:
        _, i, node = heapq.heappop(heap)
        tail.next = tail = node
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))
    return dummy.next`,
      complexity: "O(N log k) time for N total nodes, O(k) space",
    },
    practice: [
      { name: "Kth Largest Element in an Array", level: "Medium", hint: "Size-k min-heap, answer is heap[0]." },
      { name: "Top K Frequent Elements", level: "Medium", hint: "Counter, then heapq.nlargest(k, counts, key=counts.get)." },
      { name: "Find Median from Data Stream", level: "Hard", hint: "Max-heap for the low half, min-heap for the high half." },
    ],
    pitfalls: ["Needing a max-heap: push negated values", "Comparing nodes on ties: add an index"],
  },
  {
    id: "intervals",
    name: "Intervals",
    tagline: "Sort by start, then sweep and merge.",
    color: ["#14b8a6", "#6366f1"],
    signals: ["Meetings, bookings, ranges", "Merge or insert overlapping ranges", "Minimum rooms or arrows", "Free time between schedules"],
    idea: "After sorting by start, an interval overlaps the last merged one only if its start ≤ that end. For 'how many at once', sweep start and end events in order.",
    complexity: "O(n log n) time for the sort",
    template: {
      title: "Merge overlapping intervals",
      code: `def merge(intervals):
    intervals.sort(key=lambda iv: iv[0])
    merged = []
    for start, end in intervals:
        if merged and start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged`,
      beats: [
        { hl: [1], note: "Sort by start time." },
        { hl: [4, 5], note: "Overlap with the last block: extend its end." },
        { hl: [6, 7], note: "No overlap: start a new block." },
      ],
    },
    worked: {
      problem: "Meeting Rooms II",
      prompt: "Minimum number of rooms needed for a list of meetings.",
      approach: ["Sort meetings by start.", "Keep a min-heap of end times of rooms in use.", "Reuse the room that frees up first if it is free by the new start."],
      code: `import heapq

def min_rooms(meetings):
    meetings.sort()
    ends = []
    for start, end in meetings:
        if ends and ends[0] <= start:
            heapq.heapreplace(ends, end)   # reuse a room
        else:
            heapq.heappush(ends, end)      # open a room
    return len(ends)`,
      complexity: "O(n log n) time, O(n) space",
    },
    practice: [
      { name: "Insert Interval", level: "Medium", hint: "Add the ones before, merge the overlaps, add the rest." },
      { name: "Non-overlapping Intervals", level: "Medium", hint: "Greedy by end time; count what you drop." },
      { name: "Employee Free Time", level: "Hard", hint: "Merge all schedules, the gaps are the answer." },
    ],
    pitfalls: ["Sorting by end when you need start (or vice versa)", "Touching intervals: is [1,2] and [2,3] an overlap? Ask."],
  },
  {
    id: "graphs",
    name: "BFS and DFS",
    tagline: "Explore grids and graphs; BFS gives shortest steps.",
    color: ["#0ea5e9", "#6c47ff"],
    signals: ["Grids of cells, islands, regions", "Shortest path with equal edge weights", "Connected components", "Spreading over time (rotting oranges)"],
    idea: "DFS goes deep and is easy for counting regions. BFS explores in layers, so the first time you reach a node is via the fewest steps. Always mark visited when you enqueue.",
    complexity: "O(V + E) time, O(V) space",
    template: {
      title: "BFS shortest steps in a grid",
      code: `from collections import deque

def shortest(grid, start, goal):
    q = deque([(start, 0)])
    seen = {start}
    while q:
        (r, c), d = q.popleft()
        if (r, c) == goal:
            return d
        for nr, nc in ((r+1,c),(r-1,c),(r,c+1),(r,c-1)):
            if (0 <= nr < len(grid) and 0 <= nc < len(grid[0])
                    and grid[nr][nc] != "#" and (nr, nc) not in seen):
                seen.add((nr, nc))
                q.append(((nr, nc), d + 1))
    return -1`,
      beats: [
        { hl: [3, 4], note: "Queue of (cell, distance); mark the start visited." },
        { hl: [6, 7, 8], note: "Pop in layer order; the first time we see the goal is shortest." },
        { hl: [9, 10, 11, 12, 13], note: "Enqueue valid neighbours and mark them visited immediately." },
      ],
    },
    worked: {
      problem: "Number of Islands",
      prompt: "Count groups of connected '1' cells in a grid.",
      approach: ["Scan every cell.", "On an unvisited land cell, count an island and flood-fill it.", "Flood-fill sinks cells so they are not counted again."],
      code: `def num_islands(grid):
    rows, cols = len(grid), len(grid[0])
    def sink(r, c):
        stack = [(r, c)]
        while stack:
            r, c = stack.pop()
            if 0 <= r < rows and 0 <= c < cols and grid[r][c] == "1":
                grid[r][c] = "0"
                stack += [(r+1, c), (r-1, c), (r, c+1), (r, c-1)]
    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                count += 1
                sink(r, c)
    return count`,
      complexity: "O(rows × cols) time and space",
    },
    practice: [
      { name: "Flood Fill", level: "Easy", hint: "DFS from the start pixel, change matching colours." },
      { name: "Rotting Oranges", level: "Medium", hint: "Multi-source BFS: start with every rotten orange in the queue." },
      { name: "Word Ladder", level: "Hard", hint: "BFS over words; neighbours differ by one letter (use wildcard buckets)." },
    ],
    pitfalls: ["Marking visited on pop instead of push (duplicates explode)", "Recursion depth on big grids: use an explicit stack"],
  },
  {
    id: "topo-sort",
    name: "Topological sort",
    tagline: "Order tasks so every dependency comes first.",
    color: ["#a855f7", "#f43f5e"],
    signals: ["Prerequisites, build order, dependencies", "Detect a cycle in a directed graph", "Alien dictionary ordering"],
    idea: "Count incoming edges. Start with nodes that have none, remove them and decrement their neighbours. If you cannot place every node, there is a cycle (Kahn's algorithm).",
    complexity: "O(V + E) time and space",
    template: {
      title: "Kahn's algorithm",
      code: `from collections import deque, defaultdict

def topo_order(n, edges):          # edge (a, b): a before b
    graph = defaultdict(list)
    indeg = [0] * n
    for a, b in edges:
        graph[a].append(b)
        indeg[b] += 1
    q = deque(i for i in range(n) if indeg[i] == 0)
    order = []
    while q:
        node = q.popleft()
        order.append(node)
        for nxt in graph[node]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                q.append(nxt)
    return order if len(order) == n else []   # [] = cycle`,
      beats: [
        { hl: [5, 6, 7], note: "Build the graph and count incoming edges." },
        { hl: [8], note: "Start with everything that has no prerequisites." },
        { hl: [13, 14, 15, 16], note: "Removing a node may free its neighbours." },
      ],
    },
    worked: {
      problem: "Course Schedule",
      prompt: "Can you finish all courses given prerequisite pairs [course, prereq]?",
      approach: ["Edges go prereq → course.", "Run Kahn's algorithm.", "Possible only if every course gets placed."],
      code: `from collections import deque

def can_finish(n, prereqs):
    graph = [[] for _ in range(n)]
    indeg = [0] * n
    for course, pre in prereqs:
        graph[pre].append(course)
        indeg[course] += 1
    q = deque(i for i in range(n) if indeg[i] == 0)
    taken = 0
    while q:
        c = q.popleft()
        taken += 1
        for nxt in graph[c]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                q.append(nxt)
    return taken == n`,
      complexity: "O(V + E) time and space",
    },
    practice: [
      { name: "Course Schedule II", level: "Medium", hint: "Return the order list instead of a boolean." },
      { name: "Parallel Courses", level: "Medium", hint: "BFS by layers: each layer is one semester." },
      { name: "Alien Dictionary", level: "Hard", hint: "Compare adjacent words to get letter edges; watch the prefix case." },
    ],
    pitfalls: ["Reversing edge direction", "Forgetting nodes with no edges at all"],
  },
  {
    id: "union-find",
    name: "Union-find",
    tagline: "Merge groups and ask 'same group?' almost instantly.",
    color: ["#22c55e", "#0ea5e9"],
    signals: ["Connected components that change as edges arrive", "Detect a redundant edge (cycle in undirected graph)", "Group accounts or equivalences", "Kruskal's minimum spanning tree"],
    idea: "Every element points to a parent; the root names the group. Union joins two roots. Path compression and union by size keep trees almost flat.",
    complexity: "≈ O(α(n)) per operation, effectively constant",
    template: {
      title: "Disjoint set union",
      code: `class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n
    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x
    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra
        self.size[ra] += self.size[rb]
        return True`,
      beats: [
        { hl: [2, 3], note: "Each element starts as its own group." },
        { hl: [4, 5, 6, 7, 8], note: "Find the root, halving the path as we go." },
        { hl: [9, 10, 11, 12, 13, 14, 15, 16, 17], note: "Attach the smaller tree under the bigger root." },
      ],
    },
    worked: {
      problem: "Redundant Connection",
      prompt: "A tree with one extra edge added. Return the edge that creates the cycle.",
      approach: ["Process edges in order.", "If both ends are already in the same group, this edge closes a cycle."],
      code: `def find_redundant_connection(edges):
    dsu = DSU(len(edges) + 1)
    for a, b in edges:
        if not dsu.union(a, b):
            return [a, b]
    return []`,
      complexity: "O(n α(n)) time, O(n) space",
    },
    practice: [
      { name: "Number of Provinces", level: "Medium", hint: "Union every connected pair, count distinct roots." },
      { name: "Accounts Merge", level: "Medium", hint: "Union emails within each account; group by root." },
      { name: "Swim in Rising Water", level: "Hard", hint: "Add cells in height order until start and end connect." },
    ],
    pitfalls: ["Comparing elements instead of roots", "Forgetting path compression on deep inputs"],
  },
  {
    id: "backtracking",
    name: "Backtracking",
    tagline: "Choose, explore, un-choose.",
    color: ["#f97316", "#facc15"],
    signals: ["All subsets, permutations or combinations", "Constraint puzzles (N-Queens, Sudoku)", "Word search in a grid", "n is small (≤ 20)"],
    idea: "Build a candidate one choice at a time. Recurse, then undo the choice so the next branch starts clean. Prune branches that cannot succeed as early as possible.",
    complexity: "Exponential: O(2ⁿ) subsets, O(n!) permutations",
    template: {
      title: "Subsets",
      code: `def subsets(nums):
    out, path = [], []
    def go(start):
        out.append(path[:])          # copy!
        for i in range(start, len(nums)):
            path.append(nums[i])     # choose
            go(i + 1)                # explore
            path.pop()               # un-choose
    go(0)
    return out`,
      beats: [
        { hl: [3], note: "Every node of the recursion tree is a subset; store a copy." },
        { hl: [5, 6], note: "Choose an element and recurse on the rest." },
        { hl: [7], note: "Undo the choice so the next branch is clean." },
      ],
    },
    worked: {
      problem: "Combination Sum",
      prompt: "Distinct candidates, reuse allowed. All combinations that sum to target.",
      approach: ["Sort so you can stop early when a candidate is too big.", "Recurse with i (not i + 1) because reuse is allowed."],
      code: `def combination_sum(cands, target):
    cands.sort()
    out, path = [], []
    def go(start, remain):
        if remain == 0:
            out.append(path[:])
            return
        for i in range(start, len(cands)):
            if cands[i] > remain:
                break                 # prune: sorted
            path.append(cands[i])
            go(i, remain - cands[i])  # reuse allowed
            path.pop()
    go(0, target)
    return out`,
      complexity: "Exponential in target / min(candidate)",
    },
    practice: [
      { name: "Permutations", level: "Medium", hint: "Track used[] instead of a start index." },
      { name: "Word Search", level: "Medium", hint: "DFS from each cell; mark visited, unmark on return." },
      { name: "N-Queens", level: "Hard", hint: "Sets for columns and both diagonals (r - c, r + c)." },
    ],
    pitfalls: ["Appending path instead of path[:]", "Forgetting to undo state", "No pruning, so it times out"],
  },
  {
    id: "dynamic-programming",
    name: "Dynamic programming",
    tagline: "Define the state, write the recurrence, fill the table.",
    color: ["#6366f1", "#14b8a6"],
    signals: ["Count the ways / min cost / max value", "Choices at each step that affect later steps", "Overlapping subproblems in a brute-force recursion", "Strings compared character by character (LCS, edit distance)"],
    idea: "Write the brute-force recursion, notice repeated calls, and cache them. Then, optionally, turn it into a bottom-up table. Always say the state and the recurrence out loud first.",
    complexity: "O(states × transitions)",
    template: {
      title: "Top-down with memo",
      code: `from functools import lru_cache

def min_cost_climb(cost):
    n = len(cost)
    @lru_cache(None)
    def dp(i):                      # min cost to reach the top from step i
        if i >= n:
            return 0
        return cost[i] + min(dp(i + 1), dp(i + 2))
    return min(dp(0), dp(1))`,
      beats: [
        { hl: [5], note: "State: the cheapest way to finish from step i." },
        { hl: [6, 7], note: "Base case: past the end costs nothing." },
        { hl: [8], note: "Recurrence: pay this step, then take the better next move." },
      ],
    },
    worked: {
      problem: "Coin Change",
      prompt: "Fewest coins to make amount; -1 if impossible.",
      approach: ["State: best[a] = fewest coins for amount a.", "Recurrence: best[a] = 1 + min(best[a − coin]).", "Fill amounts from 1 upwards."],
      code: `def coin_change(coins, amount):
    INF = float("inf")
    best = [0] + [INF] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and best[a - c] + 1 < best[a]:
                best[a] = best[a - c] + 1
    return best[amount] if best[amount] != INF else -1`,
      complexity: "O(amount × coins) time, O(amount) space",
    },
    practice: [
      { name: "Climbing Stairs", level: "Easy", hint: "ways(n) = ways(n-1) + ways(n-2)." },
      { name: "Longest Increasing Subsequence", level: "Medium", hint: "O(n log n): patience sorting with bisect." },
      { name: "Edit Distance", level: "Hard", hint: "dp[i][j] over prefixes; insert, delete or replace." },
    ],
    pitfalls: ["Starting to code before stating the state", "Mutable arguments in lru_cache (use tuples)", "Wrong iteration order in bottom-up tables"],
  },
  {
    id: "trie",
    name: "Trie",
    tagline: "A tree of characters for fast prefix lookups.",
    color: ["#d946ef", "#0ea5e9"],
    signals: ["Autocomplete or 'starts with'", "Many words searched in one grid", "Longest common prefix", "Replace words by roots"],
    idea: "Each node is a dict of next characters plus an end-of-word flag. Inserting or searching a word costs its length, independent of how many words are stored.",
    complexity: "O(L) per insert or lookup, O(total characters) space",
    template: {
      title: "Insert and prefix search",
      code: `class Trie:
    def __init__(self):
        self.root = {}
    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node["$"] = True             # end of word
    def starts_with(self, prefix):
        node = self.root
        for ch in prefix:
            if ch not in node:
                return False
            node = node[ch]
        return True`,
      beats: [
        { hl: [2], note: "The root is an empty map of first letters." },
        { hl: [4, 5, 6, 7], note: "Walk or create one node per character; mark the end." },
        { hl: [9, 10, 11, 12, 13, 14], note: "A prefix exists if every character has a node." },
      ],
    },
    worked: {
      problem: "Search Suggestions System",
      prompt: "After each typed character, return up to three products with that prefix, alphabetically.",
      approach: ["Sort products once.", "For each prefix, binary search the first match and take up to three that still match.", "A trie works too; sorting + bisect is shorter in an interview."],
      code: `from bisect import bisect_left

def suggested_products(products, word):
    products.sort()
    out, prefix = [], ""
    for ch in word:
        prefix += ch
        i = bisect_left(products, prefix)
        out.append([p for p in products[i:i + 3] if p.startswith(prefix)])
    return out`,
      complexity: "O(n log n + L log n) time",
    },
    practice: [
      { name: "Implement Trie", level: "Medium", hint: "Template plus search() that checks the end flag." },
      { name: "Replace Words", level: "Medium", hint: "Walk each word until you hit an end flag." },
      { name: "Word Search II", level: "Hard", hint: "Trie of words, DFS the grid, prune dead branches." },
    ],
    pitfalls: ["Forgetting the end-of-word marker", "Rebuilding the trie per query"],
  },
  {
    id: "greedy",
    name: "Greedy",
    tagline: "Take the locally best choice, and prove it is safe.",
    color: ["#eab308", "#ef4444"],
    signals: ["Scheduling by earliest end", "Reach / jump problems", "Assign or pair to minimise cost", "A sort followed by one pass"],
    idea: "Make the choice that looks best now and never revisit it. It works only when you can argue an exchange: swapping any optimal solution's choice for yours never makes it worse.",
    complexity: "Usually O(n) or O(n log n) with a sort",
    template: {
      title: "Jump game: can you reach the end?",
      code: `def can_jump(nums):
    reach = 0
    for i, step in enumerate(nums):
        if i > reach:
            return False          # stuck before i
        reach = max(reach, i + step)
    return True`,
      beats: [
        { hl: [1], note: "Track the furthest index reachable so far." },
        { hl: [3, 4], note: "If we are past it, we can never get here." },
        { hl: [5], note: "Greedily extend the reach." },
      ],
    },
    worked: {
      problem: "Gas Station",
      prompt: "Circular route; find the start station that lets you finish, or -1.",
      approach: ["If total gas < total cost, impossible.", "Otherwise, whenever the tank goes negative, the start must be after this station."],
      code: `def can_complete_circuit(gas, cost):
    if sum(gas) < sum(cost):
        return -1
    start = tank = 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:
            start, tank = i + 1, 0
    return start`,
      complexity: "O(n) time, O(1) space",
    },
    practice: [
      { name: "Assign Cookies", level: "Easy", hint: "Sort both; give the smallest cookie that fits." },
      { name: "Jump Game II", level: "Medium", hint: "BFS by ranges: count how many layers to reach the end." },
      { name: "Candy", level: "Hard", hint: "Two passes: left-to-right, then right-to-left." },
    ],
    pitfalls: ["Using greedy without an exchange argument", "Sorting by the wrong key"],
  },
];

export const METHOD: [string, string, string][] = [
  ["Clarify", "Restate the problem. Ask about input size, duplicates, negatives, empty input, and what to return.", "2 min"],
  ["Examples", "Work one normal and one edge example by hand. It catches misreads before they cost you.", "3 min"],
  ["Brute force", "Say the obvious solution and its complexity. It proves you understand the problem and gives a fallback.", "2 min"],
  ["Optimise", "Match the signals to a pattern. Name the bottleneck and the data structure that removes it.", "5 min"],
  ["Code", "Write clean code with good names. Talk while you type. Leave helper details for later if needed.", "15 min"],
  ["Test", "Run your examples line by line, then edge cases. Fix bugs calmly and state the final complexity.", "5 min"],
];

export const COMPLEXITY: [string, string, string][] = [
  ["n ≤ 10", "O(n!)", "Permutations, brute-force backtracking"],
  ["n ≤ 20", "O(2ⁿ)", "Subsets, bitmask DP"],
  ["n ≤ 500", "O(n³)", "Triple loops, interval DP, Floyd–Warshall"],
  ["n ≤ 5,000", "O(n²)", "Pairs, 2D DP"],
  ["n ≤ 10⁶", "O(n log n) or O(n)", "Sort, heap, two pointers, hashing, BFS"],
  ["n ≥ 10⁹", "O(log n) or O(1)", "Binary search, maths"],
];

export const SIGNAL_MAP: [string, string, string][] = [
  ["Sorted array, find a pair", "Two pointers", "two-pointers"],
  ["Contiguous subarray or substring", "Sliding window / prefix sums", "sliding-window"],
  ["Linked list cycle or middle", "Fast and slow pointers", "fast-slow"],
  ["'Minimum X such that…'", "Binary search on the answer", "binary-search"],
  ["Have I seen the complement?", "Hash map", "prefix-hash"],
  ["Next greater or smaller", "Monotonic stack", "monotonic-stack"],
  ["Top K, Kth, merge K", "Heap", "heap"],
  ["Meetings, ranges, overlaps", "Sort by start, sweep", "intervals"],
  ["Grid, islands, fewest steps", "BFS / DFS", "graphs"],
  ["Dependencies and order", "Topological sort", "topo-sort"],
  ["Groups that merge over time", "Union-find", "union-find"],
  ["All combinations, n small", "Backtracking", "backtracking"],
  ["Count ways, min cost, max value", "Dynamic programming", "dynamic-programming"],
  ["Prefixes, autocomplete", "Trie", "trie"],
  ["Pick the best now, one pass", "Greedy", "greedy"],
];

export const HACKS: { title: string; color: [string, string]; items: [string, string][] }[] = [
  {
    title: "Python power tools",
    color: ["#6c47ff", "#ec4899"],
    items: [
      ["collections.Counter", "Frequency maps in one line; most_common(k) gives top-k."],
      ["collections.defaultdict(list)", "Adjacency lists and grouping without key checks."],
      ["collections.deque", "O(1) pops from both ends: BFS queues and monotonic deques."],
      ["heapq with negatives", "Max-heap = push -x. Tuples (priority, tiebreak, item) avoid comparing objects."],
      ["bisect_left / bisect_right", "Binary search on sorted lists for insert positions and counts."],
      ["functools.lru_cache(None)", "Instant memoisation for top-down DP. Arguments must be hashable."],
      ["float('inf')", "Clean initial values for min and max comparisons."],
      ["sys.setrecursionlimit(10**6)", "Deep DFS on large inputs, or switch to an explicit stack."],
    ],
  },
  {
    title: "Edge cases to test every time",
    color: ["#0ea5e9", "#10b981"],
    items: [
      ["Empty input", "Empty list, empty string, n = 0."],
      ["One element", "Loops that assume two elements break here."],
      ["All the same", "Duplicates break uniqueness and pointer logic."],
      ["Negatives and zero", "Sliding windows on sums fail with negatives; use prefix sums instead."],
      ["Already sorted / reversed", "Worst cases for naive quicksort and some greedy choices."],
      ["Very large values", "Overflow in other languages; time limits in Python."],
    ],
  },
  {
    title: "Bugs that cost offers",
    color: ["#f43f5e", "#f59e0b"],
    items: [
      ["Off-by-one", "Decide inclusive or exclusive bounds once and write it as a comment."],
      ["path instead of path[:]", "Backtracking stores the same list object again and again."],
      ["Visited on pop", "Mark visited when you enqueue, or BFS revisits nodes many times."],
      ["Mutating while iterating", "Iterate over a copy or collect changes first."],
      ["Shared default lists", "def f(x, seen=[]) keeps state between calls; use None."],
      ["[[0]*m]*n", "Creates n references to the same row. Use a comprehension."],
    ],
  },
  {
    title: "How to talk through it",
    color: ["#14b8a6", "#6366f1"],
    items: [
      ["Narrate decisions", "Say why you chose the structure, not just what you are typing."],
      ["State complexity early", "Before coding, say the target: 'n is 10⁵ so I need n log n or better'."],
      ["Name things well", "left/right, seen, best: readable code is scored."],
      ["Stuck? Shrink it", "Solve a smaller case or a simpler version aloud; interviewers often hint."],
      ["Leave stubs", "If time is short, write the helper signature and finish the main logic first."],
      ["Own your bugs", "Find them by tracing an example. Calm debugging is a strong signal."],
    ],
  },
];

/** Step-by-step highlights for each worked solution (0-based line numbers), used by the code reels. */
export const WORKED_BEATS: Record<string, { hl: number[]; note: string }[]> = {
  "two-pointers": [
    { hl: [1], note: "Sort first, so two pointers can steer the sum." },
    { hl: [3, 4, 5], note: "Fix each anchor once and skip duplicate anchors." },
    { hl: [6, 7, 8, 9, 10, 11, 12], note: "Two pointers on the rest: move towards a zero sum." },
    { hl: [13, 14, 15, 16, 17], note: "Record the triplet, then skip duplicate seconds." },
  ],
  "sliding-window": [
    { hl: [3, 4], note: "need counts what t requires; missing is how many are still owed." },
    { hl: [7, 8, 9, 10], note: "Grow right and pay off a need when you can." },
    { hl: [11, 12, 13], note: "Window covers t: keep it if it is the smallest so far." },
    { hl: [14, 15, 16, 17], note: "Shrink left; giving back a needed character breaks the window." },
  ],
  "fast-slow": [
    { hl: [1, 2, 3], note: "Race: slow moves one step, fast moves two." },
    { hl: [4], note: "If they meet, there is a cycle." },
    { hl: [5, 6, 7, 8], note: "Restart one pointer at head; step together; they meet at the cycle start." },
  ],
  "binary-search": [
    { hl: [1, 2], note: "Feasibility: can we finish within h hours at speed k?" },
    { hl: [3], note: "The answer is between 1 and the largest pile." },
    { hl: [4, 5, 6, 7, 8, 9], note: "Find the first speed that works: keep mid if it works, else go right." },
  ],
  "prefix-hash": [
    { hl: [1], note: "A set gives O(1) membership checks." },
    { hl: [3, 4], note: "Only start counting where a run begins (x − 1 is missing)." },
    { hl: [5, 6, 7, 8], note: "Walk the run and keep the longest." },
  ],
  "monotonic-stack": [
    { hl: [1, 2], note: "Answers default to 0; the stack holds days still waiting." },
    { hl: [4, 5, 6], note: "A warmer day answers every colder day waiting on the stack." },
    { hl: [7], note: "Today waits for its own warmer day." },
  ],
  heap: [
    { hl: [3, 4], note: "Heap of each list's head; the index breaks ties." },
    { hl: [6, 7, 8], note: "Pop the smallest node and append it." },
    { hl: [9, 10], note: "Push the next node from the same list." },
  ],
  intervals: [
    { hl: [3], note: "Handle meetings in order of start time." },
    { hl: [4, 6, 7], note: "Heap of end times: reuse the room that frees up first." },
    { hl: [8, 9], note: "Nothing free yet: open a new room." },
    { hl: [10], note: "Rooms needed = heap size." },
  ],
  graphs: [
    { hl: [10, 11, 12, 13], note: "Scan the grid; unvisited land starts a new island." },
    { hl: [2, 3, 4, 5, 6, 7, 8], note: "Sink the whole island with an explicit stack." },
    { hl: [14, 15], note: "Sunk cells are never counted again." },
  ],
  "topo-sort": [
    { hl: [3, 4, 5, 6, 7], note: "Edges go prerequisite → course; count each course's prerequisites." },
    { hl: [8], note: "Start with courses that need nothing." },
    { hl: [10, 11, 12, 13, 14, 15, 16], note: "Take a course and unlock the courses waiting on it." },
    { hl: [17], note: "Everything taken means there is no cycle." },
  ],
  "union-find": [
    { hl: [1], note: "Every node starts in its own group." },
    { hl: [2, 3, 4], note: "Both ends already joined? This edge closes the cycle." },
  ],
  backtracking: [
    { hl: [1], note: "Sort so we can stop early." },
    { hl: [4, 5, 6], note: "Hit the target exactly: save a copy of the path." },
    { hl: [8, 9], note: "Prune: every later candidate is too big too." },
    { hl: [10, 11, 12], note: "Choose, recurse with reuse allowed, un-choose." },
  ],
  "dynamic-programming": [
    { hl: [2], note: "best[a] = fewest coins for amount a; best[0] = 0." },
    { hl: [3, 4, 5, 6], note: "Try every coin as the last coin used." },
    { hl: [7], note: "Still infinite means the amount is unreachable." },
  ],
  trie: [
    { hl: [3], note: "Sort once: words sharing a prefix sit together." },
    { hl: [5, 6, 7], note: "Binary search the first word ≥ the prefix." },
    { hl: [8], note: "Take up to three that still match." },
  ],
  greedy: [
    { hl: [1, 2], note: "Less gas than cost overall: impossible." },
    { hl: [4, 5], note: "Drive the loop, tracking the tank." },
    { hl: [6, 7], note: "Tank went negative: no start up to here works; restart after it." },
    { hl: [8], note: "The last restart point is the answer." },
  ],
};
