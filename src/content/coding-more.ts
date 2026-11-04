/* Two extra fully worked problems per pattern. Python 3, all tested.
   beats: 0-based line highlights used by the step-by-step code reels. */

export interface MoreProblem {
  problem: string;
  level: "Easy" | "Medium" | "Hard";
  prompt: string;
  approach: string[];
  code: string;
  complexity: string;
  beats: { hl: number[]; note: string }[];
}

export const MORE_PROBLEMS: Record<string, MoreProblem[]> = {
  "two-pointers": [
    {
      problem: "Container With Most Water",
      level: "Medium",
      prompt: "Pick two lines that, with the x-axis, hold the most water.",
      approach: ["Start with the widest container.", "The shorter wall limits the area, so moving the taller wall can never help.", "Always move the shorter wall inwards."],
      code: `def max_area(height):
    lo, hi = 0, len(height) - 1
    best = 0
    while lo < hi:
        h = min(height[lo], height[hi])
        best = max(best, h * (hi - lo))
        if height[lo] < height[hi]:
            lo += 1
        else:
            hi -= 1
    return best`,
      complexity: "O(n) time, O(1) space",
      beats: [
        { hl: [1], note: "Start with the widest possible container." },
        { hl: [4, 5], note: "Area is limited by the shorter wall." },
        { hl: [6, 7, 8, 9], note: "Move the shorter wall: it is the only move that can improve the area." },
      ],
    },
    {
      problem: "Trapping Rain Water",
      level: "Hard",
      prompt: "Given bar heights, how much rain water is trapped between them?",
      approach: ["Water above a bar = min(max left, max right) − height.", "Walk inwards from both ends.", "The side with the lower wall is already bounded, so settle it and move on."],
      code: `def trap(height):
    lo, hi = 0, len(height) - 1
    left_max = right_max = water = 0
    while lo < hi:
        if height[lo] < height[hi]:
            left_max = max(left_max, height[lo])
            water += left_max - height[lo]
            lo += 1
        else:
            right_max = max(right_max, height[hi])
            water += right_max - height[hi]
            hi -= 1
    return water`,
      complexity: "O(n) time, O(1) space",
      beats: [
        { hl: [1, 2], note: "Two pointers and the best wall seen on each side." },
        { hl: [4, 5, 6, 7], note: "Left is lower: its water is bounded by left_max alone." },
        { hl: [8, 9, 10, 11], note: "Otherwise settle the right side the same way." },
      ],
    },
  ],
  "sliding-window": [
    {
      problem: "Longest Repeating Character Replacement",
      level: "Medium",
      prompt: "Replace at most k characters to get the longest run of one letter.",
      approach: ["A window is valid if length − (count of its most common letter) ≤ k.", "Grow right; shrink left while invalid.", "The max count never needs to decrease for the answer to stay correct."],
      code: `def character_replacement(s, k):
    count = {}
    left = top = best = 0
    for right, ch in enumerate(s):
        count[ch] = count.get(ch, 0) + 1
        top = max(top, count[ch])
        while (right - left + 1) - top > k:
            count[s[left]] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best`,
      complexity: "O(n) time, O(1) space (26 letters)",
      beats: [
        { hl: [4, 5], note: "Track the most frequent letter in the window." },
        { hl: [6, 7, 8], note: "Replacements needed = length − top. Too many? Shrink." },
        { hl: [9], note: "Every valid window is a candidate." },
      ],
    },
    {
      problem: "Sliding Window Maximum",
      level: "Hard",
      prompt: "Return the maximum of every window of size k.",
      approach: ["Keep a deque of indices whose values are decreasing.", "A new value evicts smaller ones: they can never be a maximum again.", "The front is the maximum; drop it when it leaves the window."],
      code: `from collections import deque

def max_sliding_window(nums, k):
    dq = deque()
    out = []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out`,
      complexity: "O(n) time, O(k) space",
      beats: [
        { hl: [3], note: "Deque of indices, values decreasing from front to back." },
        { hl: [6, 7, 8], note: "Smaller values behind x can never be a window maximum: drop them." },
        { hl: [9, 10], note: "Evict the front once it slides out of the window." },
        { hl: [11, 12], note: "The front is always the current maximum." },
      ],
    },
  ],
  "fast-slow": [
    {
      problem: "Happy Number",
      level: "Easy",
      prompt: "Repeatedly replace n with the sum of squares of its digits. Does it reach 1?",
      approach: ["The sequence either reaches 1 or loops.", "Detect the loop with fast and slow pointers, without storing a set."],
      code: `def is_happy(n):
    def step(x):
        return sum(int(d) ** 2 for d in str(x))
    slow, fast = n, step(n)
    while fast != 1 and slow != fast:
        slow = step(slow)
        fast = step(step(fast))
    return fast == 1`,
      complexity: "O(log n) per step, O(1) space",
      beats: [
        { hl: [1, 2], note: "The next value in the sequence." },
        { hl: [3, 4, 5, 6], note: "Race two pointers along the sequence." },
        { hl: [7], note: "Reaching 1 means happy; meeting elsewhere means a loop." },
      ],
    },
    {
      problem: "Find the Duplicate Number",
      level: "Medium",
      prompt: "n + 1 numbers in [1, n], one repeated. Find it in O(1) extra space without changing the array.",
      approach: ["Treat i → nums[i] as a linked list; the duplicate value is where two arrows enter one node.", "That makes a cycle; its entrance is the duplicate.", "Use Floyd's algorithm."],
      code: `def find_duplicate(nums):
    slow = fast = nums[0]
    while True:
        slow = nums[slow]
        fast = nums[nums[fast]]
        if slow == fast:
            break
    slow = nums[0]
    while slow != fast:
        slow = nums[slow]
        fast = nums[fast]
    return slow`,
      complexity: "O(n) time, O(1) space",
      beats: [
        { hl: [1], note: "Index → value is a linked list with a cycle." },
        { hl: [2, 3, 4, 5, 6], note: "Phase 1: find a meeting point inside the cycle." },
        { hl: [7, 8, 9, 10, 11], note: "Phase 2: restart one pointer; they meet at the entrance, the duplicate." },
      ],
    },
  ],
  "binary-search": [
    {
      problem: "Search in Rotated Sorted Array",
      level: "Medium",
      prompt: "A sorted array was rotated. Find the target's index in O(log n).",
      approach: ["One half around mid is always sorted.", "If the target lies inside the sorted half, search there; otherwise search the other half."],
      code: `def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1`,
      complexity: "O(log n) time, O(1) space",
      beats: [
        { hl: [2, 3, 4, 5], note: "Classic inclusive binary search." },
        { hl: [6, 7, 8, 9, 10], note: "Left half sorted: is the target inside it?" },
        { hl: [11, 12, 13, 14, 15], note: "Otherwise the right half is sorted: same question." },
      ],
    },
    {
      problem: "Capacity To Ship Packages Within D Days",
      level: "Medium",
      prompt: "Packages ship in order. Find the smallest ship capacity that delivers everything within D days.",
      approach: ["Capacity is between the heaviest package and the total weight.", "A greedy pass tells you the days needed for a capacity; more capacity never needs more days.", "Binary search for the first capacity that fits."],
      code: `def ship_within_days(weights, days):
    def can(cap):
        need, load = 1, 0
        for w in weights:
            if load + w > cap:
                need += 1
                load = 0
            load += w
        return need <= days
    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = (lo + hi) // 2
        if can(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      complexity: "O(n log(sum)) time, O(1) space",
      beats: [
        { hl: [1, 2, 3, 4, 5, 6, 7, 8], note: "Greedy check: fill each day until the next package would overflow." },
        { hl: [9], note: "The answer lies between the heaviest package and the total." },
        { hl: [10, 11, 12, 13, 14, 15], note: "Binary search on the answer for the first capacity that works." },
      ],
    },
  ],
  "prefix-hash": [
    {
      problem: "Group Anagrams",
      level: "Medium",
      prompt: "Group words that are anagrams of each other.",
      approach: ["Anagrams share the same letter counts.", "Use the 26-count tuple as a dictionary key: O(L) per word, no sorting."],
      code: `from collections import defaultdict

def group_anagrams(words):
    groups = defaultdict(list)
    for w in words:
        key = [0] * 26
        for ch in w:
            key[ord(ch) - ord("a")] += 1
        groups[tuple(key)].append(w)
    return list(groups.values())`,
      complexity: "O(total characters) time and space",
      beats: [
        { hl: [3], note: "One bucket per letter signature." },
        { hl: [5, 6, 7], note: "Count letters: anagrams produce identical counts." },
        { hl: [8], note: "Tuples are hashable, so they work as keys." },
      ],
    },
    {
      problem: "Product of Array Except Self",
      level: "Medium",
      prompt: "out[i] = product of every element except nums[i], without division, in O(n).",
      approach: ["out[i] = (product of everything left of i) × (product of everything right of i).", "One pass left to right, one pass right to left, in the output array."],
      code: `def product_except_self(nums):
    n = len(nums)
    out = [1] * n
    left = 1
    for i in range(n):
        out[i] = left
        left *= nums[i]
    right = 1
    for i in range(n - 1, -1, -1):
        out[i] *= right
        right *= nums[i]
    return out`,
      complexity: "O(n) time, O(1) extra space besides the output",
      beats: [
        { hl: [3, 4, 5, 6], note: "Pass 1: out[i] holds the product of everything to the left." },
        { hl: [7, 8, 9, 10], note: "Pass 2: multiply in the product of everything to the right." },
      ],
    },
  ],
  "monotonic-stack": [
    {
      problem: "Largest Rectangle in Histogram",
      level: "Hard",
      prompt: "Find the area of the largest rectangle in a histogram.",
      approach: ["Keep bars in increasing height on a stack.", "When a shorter bar arrives, each popped bar's rectangle ends here and starts after the new stack top.", "A zero-height sentinel flushes the stack at the end."],
      code: `def largest_rectangle(heights):
    stack = []
    best = 0
    for i, h in enumerate(heights + [0]):
        while stack and heights[stack[-1]] >= h:
            height = heights[stack.pop()]
            left = stack[-1] + 1 if stack else 0
            best = max(best, height * (i - left))
        stack.append(i)
    return best`,
      complexity: "O(n) time, O(n) space",
      beats: [
        { hl: [1, 3], note: "Indices with increasing heights; a 0 sentinel flushes everything at the end." },
        { hl: [4, 5, 6, 7], note: "A shorter bar ends every taller rectangle: width runs from the new top + 1 to i." },
        { hl: [8], note: "The current bar may extend further right." },
      ],
    },
    {
      problem: "Remove K Digits",
      level: "Medium",
      prompt: "Remove k digits from a number string to make it as small as possible.",
      approach: ["A bigger digit before a smaller one should go: it makes the number larger.", "Keep a non-decreasing stack of digits.", "Trim leftover removals from the end and strip leading zeros."],
      code: `def remove_k_digits(num, k):
    stack = []
    for d in num:
        while k and stack and stack[-1] > d:
            stack.pop()
            k -= 1
        stack.append(d)
    stack = stack[:len(stack) - k]
    return "".join(stack).lstrip("0") or "0"`,
      complexity: "O(n) time, O(n) space",
      beats: [
        { hl: [2, 3, 4, 5, 6], note: "Pop bigger digits that precede a smaller one, while removals remain." },
        { hl: [7], note: "Still owe removals? The tail holds the largest digits: cut there." },
        { hl: [8], note: "Strip leading zeros; an empty result is \"0\"." },
      ],
    },
  ],
  heap: [
    {
      problem: "Top K Frequent Elements",
      level: "Medium",
      prompt: "Return the k most frequent values, faster than O(n log n).",
      approach: ["Count frequencies.", "Bucket values by frequency: index = count, at most n buckets.", "Read buckets from the highest frequency down."],
      code: `from collections import Counter

def top_k_frequent(nums, k):
    counts = Counter(nums)
    buckets = [[] for _ in range(len(nums) + 1)]
    for x, c in counts.items():
        buckets[c].append(x)
    out = []
    for c in range(len(buckets) - 1, 0, -1):
        for x in buckets[c]:
            out.append(x)
            if len(out) == k:
                return out
    return out`,
      complexity: "O(n) time and space (bucket sort beats the heap here)",
      beats: [
        { hl: [3], note: "Count every value." },
        { hl: [4, 5, 6], note: "Bucket by frequency: no comparison sort needed." },
        { hl: [8, 9, 10, 11, 12], note: "Walk from the highest frequency until we have k." },
      ],
    },
    {
      problem: "Find Median from Data Stream",
      level: "Hard",
      prompt: "Support add(x) and median() on a stream of numbers.",
      approach: ["A max-heap holds the smaller half, a min-heap the larger half.", "Route every number through the low heap so the halves stay ordered.", "Rebalance so the low half has the same size or one more."],
      code: `import heapq

class MedianFinder:
    def __init__(self):
        self.low = []
        self.high = []
    def add(self, x):
        heapq.heappush(self.low, -x)
        heapq.heappush(self.high, -heapq.heappop(self.low))
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))
    def median(self):
        if len(self.low) > len(self.high):
            return -self.low[0]
        return (-self.low[0] + self.high[0]) / 2`,
      complexity: "O(log n) add, O(1) median",
      beats: [
        { hl: [4, 5], note: "low is a max-heap (negated values); high is a min-heap." },
        { hl: [7, 8], note: "Pass every value through low, so low's max ≤ high's min." },
        { hl: [9, 10], note: "Keep low the same size or one bigger." },
        { hl: [11, 12, 13, 14], note: "Median is low's top, or the average of both tops." },
      ],
    },
  ],
  intervals: [
    {
      problem: "Insert Interval",
      level: "Medium",
      prompt: "Insert a new interval into a sorted, non-overlapping list and merge as needed.",
      approach: ["Copy intervals that end before the new one starts.", "Merge every interval that overlaps it.", "Copy the rest."],
      code: `def insert(intervals, new):
    out, i, n = [], 0, len(intervals)
    while i < n and intervals[i][1] < new[0]:
        out.append(intervals[i])
        i += 1
    start, end = new
    while i < n and intervals[i][0] <= end:
        start = min(start, intervals[i][0])
        end = max(end, intervals[i][1])
        i += 1
    out.append([start, end])
    out.extend(intervals[i:])
    return out`,
      complexity: "O(n) time",
      beats: [
        { hl: [2, 3, 4], note: "Everything that ends before the new interval starts." },
        { hl: [5, 6, 7, 8, 9], note: "Absorb every overlapping interval." },
        { hl: [10, 11], note: "Add the merged block, then the rest unchanged." },
      ],
    },
    {
      problem: "Non-overlapping Intervals",
      level: "Medium",
      prompt: "Remove the fewest intervals so the rest do not overlap.",
      approach: ["Sort by end time.", "Keep an interval if it starts after the last kept end; otherwise remove it.", "Earliest end leaves the most room: the classic exchange argument."],
      code: `def erase_overlap_intervals(intervals):
    intervals.sort(key=lambda iv: iv[1])
    removed, end = 0, float("-inf")
    for s, e in intervals:
        if s >= end:
            end = e
        else:
            removed += 1
    return removed`,
      complexity: "O(n log n) time",
      beats: [
        { hl: [1], note: "Sort by end: finishing early leaves the most room." },
        { hl: [3, 4, 5], note: "Starts after the last kept end? Keep it." },
        { hl: [6, 7], note: "Otherwise it overlaps: remove it." },
      ],
    },
  ],
  graphs: [
    {
      problem: "Rotting Oranges",
      level: "Medium",
      prompt: "Each minute, rotten oranges rot their neighbours. How many minutes until none are fresh?",
      approach: ["Multi-source BFS: every rotten orange starts in the queue.", "Each BFS layer is one minute.", "If fresh oranges remain at the end, return −1."],
      code: `from collections import deque

def oranges_rotting(grid):
    rows, cols = len(grid), len(grid[0])
    q = deque()
    fresh = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                q.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1
    minutes = 0
    while q and fresh:
        for _ in range(len(q)):
            r, c = q.popleft()
            for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    q.append((nr, nc))
        minutes += 1
    return minutes if fresh == 0 else -1`,
      complexity: "O(rows × cols) time and space",
      beats: [
        { hl: [4, 5, 6, 7, 8, 9, 10, 11], note: "All rotten oranges start together; count the fresh ones." },
        { hl: [13, 14, 21], note: "One BFS layer per minute." },
        { hl: [15, 16, 17, 18, 19, 20], note: "Rot fresh neighbours and queue them for the next minute." },
        { hl: [22], note: "Anything still fresh was unreachable." },
      ],
    },
    {
      problem: "Word Ladder",
      level: "Hard",
      prompt: "Shortest transformation from begin to end, changing one letter at a time through dictionary words.",
      approach: ["Words are nodes; one-letter differences are edges.", "Wildcard buckets (h*t) find neighbours without comparing every pair.", "BFS gives the shortest number of steps."],
      code: `from collections import defaultdict, deque

def ladder_length(begin, end, words):
    if end not in words:
        return 0
    buckets = defaultdict(list)
    for w in words:
        for i in range(len(w)):
            buckets[w[:i] + "*" + w[i + 1:]].append(w)
    q = deque([(begin, 1)])
    seen = {begin}
    while q:
        word, steps = q.popleft()
        if word == end:
            return steps
        for i in range(len(word)):
            for nxt in buckets[word[:i] + "*" + word[i + 1:]]:
                if nxt not in seen:
                    seen.add(nxt)
                    q.append((nxt, steps + 1))
    return 0`,
      complexity: "O(N · L²) time for N words of length L",
      beats: [
        { hl: [5, 6, 7, 8], note: "Wildcard buckets link words one letter apart." },
        { hl: [9, 10, 11, 12, 13, 14], note: "BFS: the first time we reach end is the shortest path." },
        { hl: [15, 16, 17, 18, 19], note: "Neighbours come straight from the buckets; mark visited on push." },
      ],
    },
  ],
  "topo-sort": [
    {
      problem: "Course Schedule II",
      level: "Medium",
      prompt: "Return an order to take all courses, or an empty list if impossible.",
      approach: ["Same Kahn's algorithm as Course Schedule.", "Record the order nodes leave the queue."],
      code: `from collections import deque

def find_order(n, prereqs):
    graph = [[] for _ in range(n)]
    indeg = [0] * n
    for course, pre in prereqs:
        graph[pre].append(course)
        indeg[course] += 1
    q = deque(i for i in range(n) if indeg[i] == 0)
    order = []
    while q:
        c = q.popleft()
        order.append(c)
        for nxt in graph[c]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                q.append(nxt)
    return order if len(order) == n else []`,
      complexity: "O(V + E) time and space",
      beats: [
        { hl: [3, 4, 5, 6, 7], note: "Edges prerequisite → course; count prerequisites." },
        { hl: [8, 9], note: "Start with courses that need nothing." },
        { hl: [10, 11, 12, 13, 14, 15, 16], note: "Take a course; unlock its dependants." },
        { hl: [17], note: "Missing courses mean a cycle." },
      ],
    },
    {
      problem: "Alien Dictionary",
      level: "Hard",
      prompt: "Words are sorted in an unknown alphabet. Recover a valid letter order.",
      approach: ["Adjacent words reveal one edge: the first letters that differ.", "If a word is followed by its own prefix, the input is invalid.", "Topologically sort the letters."],
      code: `from collections import deque

def alien_order(words):
    graph = {ch: set() for w in words for ch in w}
    indeg = {ch: 0 for ch in graph}
    for a, b in zip(words, words[1:]):
        for x, y in zip(a, b):
            if x != y:
                if y not in graph[x]:
                    graph[x].add(y)
                    indeg[y] += 1
                break
        else:
            if len(a) > len(b):
                return ""
    q = deque(ch for ch in graph if indeg[ch] == 0)
    order = []
    while q:
        ch = q.popleft()
        order.append(ch)
        for nxt in graph[ch]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                q.append(nxt)
    return "".join(order) if len(order) == len(graph) else ""`,
      complexity: "O(total characters) time",
      beats: [
        { hl: [5, 6, 7, 8, 9, 10, 11], note: "The first differing letters of neighbours give one ordering edge." },
        { hl: [12, 13, 14], note: "\"abc\" before \"ab\" is impossible: invalid input." },
        { hl: [15, 16, 17, 18, 19, 20, 21, 22, 23], note: "Kahn's algorithm over letters." },
        { hl: [24], note: "Leftover letters mean a cycle." },
      ],
    },
  ],
  "union-find": [
    {
      problem: "Number of Provinces",
      level: "Medium",
      prompt: "Given an adjacency matrix of cities, count connected groups.",
      approach: ["Start with n groups.", "Every successful union merges two groups into one."],
      code: `def find_circle_num(is_connected):
    n = len(is_connected)
    dsu = DSU(n)
    groups = n
    for i in range(n):
        for j in range(i + 1, n):
            if is_connected[i][j] and dsu.union(i, j):
                groups -= 1
    return groups`,
      complexity: "O(n² α(n)) time",
      beats: [
        { hl: [2, 3], note: "Every city starts as its own province." },
        { hl: [4, 5, 6, 7], note: "Each union that actually merges reduces the count." },
      ],
    },
    {
      problem: "Accounts Merge",
      level: "Medium",
      prompt: "Accounts sharing any email belong to one person. Merge them.",
      approach: ["Map each email to the first account that had it.", "When an email repeats, union the two accounts.", "Group emails by their account's root."],
      code: `from collections import defaultdict

def accounts_merge(accounts):
    dsu = DSU(len(accounts))
    owner = {}
    for i, (_, *emails) in enumerate(accounts):
        for e in emails:
            if e in owner:
                dsu.union(i, owner[e])
            else:
                owner[e] = i
    groups = defaultdict(list)
    for e, i in owner.items():
        groups[dsu.find(i)].append(e)
    return [[accounts[r][0]] + sorted(es) for r, es in groups.items()]`,
      complexity: "O(E log E) for E emails (sorting dominates)",
      beats: [
        { hl: [4, 5, 6, 7, 8, 9, 10], note: "A shared email joins two accounts." },
        { hl: [11, 12, 13], note: "Collect every email under its account's root." },
        { hl: [14], note: "Name plus sorted emails per person." },
      ],
    },
  ],
  backtracking: [
    {
      problem: "Permutations",
      level: "Medium",
      prompt: "Return every ordering of distinct numbers.",
      approach: ["Build the permutation one position at a time.", "Track which numbers are used.", "Undo the choice after exploring."],
      code: `def permute(nums):
    out, path = [], []
    used = [False] * len(nums)
    def go():
        if len(path) == len(nums):
            out.append(path[:])
            return
        for i, x in enumerate(nums):
            if used[i]:
                continue
            used[i] = True
            path.append(x)
            go()
            path.pop()
            used[i] = False
    go()
    return out`,
      complexity: "O(n · n!) time",
      beats: [
        { hl: [2], note: "used[] replaces the start index from subsets." },
        { hl: [4, 5, 6], note: "Full length: save a copy." },
        { hl: [7, 8, 9, 10, 11, 12, 13, 14], note: "Choose an unused number, recurse, undo both changes." },
      ],
    },
    {
      problem: "N-Queens",
      level: "Hard",
      prompt: "Place n queens so none attack each other. Return every board.",
      approach: ["Place one queen per row.", "Columns and both diagonals (r − c, r + c) go in sets for O(1) checks.", "Undo all three on the way back."],
      code: `def solve_n_queens(n):
    out, cols = [], []
    used_cols, diag, anti = set(), set(), set()
    def go(r):
        if r == n:
            out.append(["." * c + "Q" + "." * (n - c - 1) for c in cols])
            return
        for c in range(n):
            if c in used_cols or r - c in diag or r + c in anti:
                continue
            cols.append(c)
            used_cols.add(c)
            diag.add(r - c)
            anti.add(r + c)
            go(r + 1)
            cols.pop()
            used_cols.remove(c)
            diag.remove(r - c)
            anti.remove(r + c)
    go(0)
    return out`,
      complexity: "O(n!) time in the worst case",
      beats: [
        { hl: [2], note: "Sets for columns and both diagonals." },
        { hl: [4, 5, 6], note: "Every row filled: render the board." },
        { hl: [8, 9], note: "O(1) attack check." },
        { hl: [10, 11, 12, 13, 14, 15, 16, 17, 18], note: "Place, recurse to the next row, then remove." },
      ],
    },
  ],
  "dynamic-programming": [
    {
      problem: "Longest Increasing Subsequence",
      level: "Medium",
      prompt: "Length of the longest strictly increasing subsequence, in O(n log n).",
      approach: ["tails[k] = smallest possible tail of an increasing subsequence of length k + 1.", "For each value, binary search where it fits and replace that tail.", "The length of tails is the answer."],
      code: `from bisect import bisect_left

def length_of_lis(nums):
    tails = []
    for x in nums:
        i = bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x
    return len(tails)`,
      complexity: "O(n log n) time, O(n) space",
      beats: [
        { hl: [3], note: "tails stays sorted: the smallest tail for each length." },
        { hl: [5], note: "Binary search where x fits." },
        { hl: [6, 7, 8, 9], note: "Extend the longest, or lower an existing tail." },
      ],
    },
    {
      problem: "Edit Distance",
      level: "Hard",
      prompt: "Fewest inserts, deletes and replacements to turn word a into word b.",
      approach: ["dp[i][j] = edit distance between the first i letters of a and the first j of b.", "Matching letters cost nothing; otherwise 1 + the best of insert, delete or replace."],
      code: `def min_distance(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[m][n]`,
      complexity: "O(m · n) time and space",
      beats: [
        { hl: [2], note: "A table over prefixes of both words." },
        { hl: [3, 4, 5, 6], note: "Turning a prefix into empty costs its length." },
        { hl: [9, 10], note: "Same letter: no cost." },
        { hl: [11, 12], note: "Otherwise delete, insert or replace: take the cheapest." },
      ],
    },
  ],
  trie: [
    {
      problem: "Implement Trie",
      level: "Medium",
      prompt: "Support insert, search (whole word) and startsWith.",
      approach: ["Nested dicts, one level per character.", "A '$' key marks the end of a word.", "search and startsWith share one walk."],
      code: `class Trie:
    def __init__(self):
        self.root = {}
    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node["$"] = True
    def _walk(self, s):
        node = self.root
        for ch in s:
            node = node.get(ch)
            if node is None:
                return None
        return node
    def search(self, word):
        node = self._walk(word)
        return node is not None and "$" in node
    def starts_with(self, prefix):
        return self._walk(prefix) is not None`,
      complexity: "O(L) per operation",
      beats: [
        { hl: [3, 4, 5, 6, 7], note: "Create nodes as needed and mark the end of the word." },
        { hl: [8, 9, 10, 11, 12, 13, 14], note: "One shared walk: None as soon as a letter is missing." },
        { hl: [15, 16, 17], note: "search needs the end marker…" },
        { hl: [18, 19], note: "…startsWith only needs the path." },
      ],
    },
    {
      problem: "Word Search II",
      level: "Hard",
      prompt: "Find every dictionary word that can be traced in a letter grid.",
      approach: ["Build a trie of the words.", "DFS from every cell, following trie edges only.", "Remove found words and dead branches to prune later searches."],
      code: `def find_words(board, words):
    root = {}
    for w in words:
        node = root
        for ch in w:
            node = node.setdefault(ch, {})
        node["$"] = w
    rows, cols, found = len(board), len(board[0]), []
    def dfs(r, c, parent):
        ch = board[r][c]
        node = parent.get(ch)
        if node is None:
            return
        if "$" in node:
            found.append(node.pop("$"))
        board[r][c] = "#"
        for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
            if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] != "#":
                dfs(nr, nc, node)
        board[r][c] = ch
        if not node:
            parent.pop(ch)
    for r in range(rows):
        for c in range(cols):
            dfs(r, c, root)
    return found`,
      complexity: "O(cells · 4^L) worst case; pruning makes it fast in practice",
      beats: [
        { hl: [1, 2, 3, 4, 5, 6], note: "A trie of all words; the end node stores the word itself." },
        { hl: [9, 10, 11, 12, 13, 14], note: "Follow the trie as we walk; collect a word once." },
        { hl: [15, 16, 17, 18, 19], note: "Mark the cell, explore, unmark." },
        { hl: [20, 21], note: "Prune empty branches so later searches skip them." },
      ],
    },
  ],
  greedy: [
    {
      problem: "Jump Game II",
      level: "Medium",
      prompt: "Fewest jumps to reach the last index.",
      approach: ["Think in BFS layers: every index reachable with j jumps.", "Track the furthest reach of the current layer.", "When you hit the layer's end, jump."],
      code: `def jump(nums):
    jumps = end = far = 0
    for i in range(len(nums) - 1):
        far = max(far, i + nums[i])
        if i == end:
            jumps += 1
            end = far
    return jumps`,
      complexity: "O(n) time, O(1) space",
      beats: [
        { hl: [1], note: "end = edge of the current layer; far = furthest next layer." },
        { hl: [3], note: "Extend the next layer." },
        { hl: [4, 5, 6], note: "Reached the edge: one more jump, the next layer begins." },
      ],
    },
    {
      problem: "Partition Labels",
      level: "Medium",
      prompt: "Split a string into as many parts as possible so each letter appears in one part only.",
      approach: ["Record the last index of each letter.", "Extend the current part to the furthest last index seen.", "When i reaches that end, close the part."],
      code: `def partition_labels(s):
    last = {ch: i for i, ch in enumerate(s)}
    sizes, start, end = [], 0, 0
    for i, ch in enumerate(s):
        end = max(end, last[ch])
        if i == end:
            sizes.append(end - start + 1)
            start = i + 1
    return sizes`,
      complexity: "O(n) time, O(1) space",
      beats: [
        { hl: [1], note: "Where each letter appears for the last time." },
        { hl: [3, 4], note: "The part must reach every included letter's last index." },
        { hl: [5, 6, 7], note: "Caught up with the end: close the part." },
      ],
    },
  ],
};
