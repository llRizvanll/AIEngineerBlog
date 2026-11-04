/* Two extra fully worked problems per pattern. TypeScript (strict), all type-checked and tested.
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
      code: `function maxArea(height: number[]): number {
  let lo = 0, hi = height.length - 1, best = 0;
  while (lo < hi) {
    const h = Math.min(height[lo], height[hi]);
    best = Math.max(best, h * (hi - lo));
    if (height[lo] < height[hi]) lo++;
    else hi--;
  }
  return best;
}`,
      complexity: "O(n) time, O(1) space",
      beats: [
        { hl: [1], note: "Start with the widest possible container." },
        { hl: [3, 4], note: "Area is limited by the shorter wall." },
        { hl: [5, 6], note: "Move the shorter wall: it is the only move that can improve the area." },
      ],
    },
    {
      problem: "Trapping Rain Water",
      level: "Hard",
      prompt: "Given bar heights, how much rain water is trapped between them?",
      approach: ["Water above a bar = min(max left, max right) − height.", "Walk inwards from both ends.", "The side with the lower wall is already bounded, so settle it and move on."],
      code: `function trap(height: number[]): number {
  let lo = 0, hi = height.length - 1;
  let leftMax = 0, rightMax = 0, water = 0;
  while (lo < hi) {
    if (height[lo] < height[hi]) {
      leftMax = Math.max(leftMax, height[lo]);
      water += leftMax - height[lo];
      lo++;
    } else {
      rightMax = Math.max(rightMax, height[hi]);
      water += rightMax - height[hi];
      hi--;
    }
  }
  return water;
}`,
      complexity: "O(n) time, O(1) space",
      beats: [
        { hl: [1, 2], note: "Two pointers and the best wall seen on each side." },
        { hl: [4, 5, 6, 7], note: "Left is lower: its water is bounded by leftMax alone." },
        { hl: [8, 9, 10, 11, 12], note: "Otherwise settle the right side the same way." },
      ],
    },
  ],
  "sliding-window": [
    {
      problem: "Longest Repeating Character Replacement",
      level: "Medium",
      prompt: "Replace at most k characters to get the longest run of one letter.",
      approach: ["A window is valid if length − (count of its most common letter) ≤ k.", "Grow right; shrink left while invalid.", "The max count never needs to decrease for the answer to stay correct."],
      code: `function characterReplacement(s: string, k: number): number {
  const count = new Map<string, number>();
  let left = 0, top = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const c = (count.get(s[right]) ?? 0) + 1;
    count.set(s[right], c);
    top = Math.max(top, c);
    while (right - left + 1 - top > k) {
      count.set(s[left], count.get(s[left])! - 1);
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
      complexity: "O(n) time, O(1) space (26 letters)",
      beats: [
        { hl: [4, 5, 6], note: "Track the most frequent letter in the window." },
        { hl: [7, 8, 9, 10], note: "Replacements needed = length − top. Too many? Shrink." },
        { hl: [11], note: "Every valid window is a candidate." },
      ],
    },
    {
      problem: "Sliding Window Maximum",
      level: "Hard",
      prompt: "Return the maximum of every window of size k.",
      approach: ["Keep a deque of indices whose values are decreasing.", "A new value evicts smaller ones: they can never be a maximum again.", "The front is the maximum; drop it when it leaves the window."],
      code: `function maxSlidingWindow(nums: number[], k: number): number[] {
  const dq: number[] = [];   // indices; values decrease from head to back
  let head = 0;
  const out: number[] = [];
  for (let i = 0; i < nums.length; i++) {
    while (dq.length > head && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();
    dq.push(i);
    if (dq[head] <= i - k) head++;
    if (i >= k - 1) out.push(nums[dq[head]]);
  }
  return out;
}`,
      complexity: "O(n) time, O(k) space",
      beats: [
        { hl: [1, 2], note: "A deque of indices: an array plus a head pointer, values decreasing from front to back." },
        { hl: [5, 6], note: "Smaller values behind nums[i] can never be a window maximum: drop them." },
        { hl: [7], note: "Evict the front once it slides out of the window (move head, O(1))." },
        { hl: [8], note: "The front is always the current maximum." },
      ],
    },
  ],
  "fast-slow": [
    {
      problem: "Happy Number",
      level: "Easy",
      prompt: "Repeatedly replace n with the sum of squares of its digits. Does it reach 1?",
      approach: ["The sequence either reaches 1 or loops.", "Detect the loop with fast and slow pointers, without storing a set."],
      code: `function isHappy(n: number): boolean {
  const step = (x: number) =>
    [...String(x)].reduce((sum, d) => sum + Number(d) ** 2, 0);
  let slow = n, fast = step(n);
  while (fast !== 1 && slow !== fast) {
    slow = step(slow);
    fast = step(step(fast));
  }
  return fast === 1;
}`,
      complexity: "O(log n) per step, O(1) space",
      beats: [
        { hl: [1, 2], note: "The next value in the sequence." },
        { hl: [3, 4, 5, 6, 7], note: "Race two pointers along the sequence." },
        { hl: [8], note: "Reaching 1 means happy; meeting elsewhere means a loop." },
      ],
    },
    {
      problem: "Find the Duplicate Number",
      level: "Medium",
      prompt: "n + 1 numbers in [1, n], one repeated. Find it in O(1) extra space without changing the array.",
      approach: ["Treat i → nums[i] as a linked list; the duplicate value is where two arrows enter one node.", "That makes a cycle; its entrance is the duplicate.", "Use Floyd's algorithm."],
      code: `function findDuplicate(nums: number[]): number {
  let slow = nums[0], fast = nums[0];
  do {
    slow = nums[slow];
    fast = nums[nums[fast]];
  } while (slow !== fast);
  slow = nums[0];
  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[fast];
  }
  return slow;
}`,
      complexity: "O(n) time, O(1) space",
      beats: [
        { hl: [1], note: "Index → value is a linked list with a cycle." },
        { hl: [2, 3, 4, 5], note: "Phase 1: find a meeting point inside the cycle." },
        { hl: [6, 7, 8, 9, 10, 11], note: "Phase 2: restart one pointer; they meet at the entrance, the duplicate." },
      ],
    },
  ],
  "binary-search": [
    {
      problem: "Search in Rotated Sorted Array",
      level: "Medium",
      prompt: "A sorted array was rotated. Find the target's index in O(log n).",
      approach: ["One half around mid is always sorted.", "If the target lies inside the sorted half, search there; otherwise search the other half."],
      code: `function search(nums: number[], target: number): number {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}`,
      complexity: "O(log n) time, O(1) space",
      beats: [
        { hl: [1, 2, 3, 4], note: "Classic inclusive binary search." },
        { hl: [5, 6, 7], note: "Left half sorted: is the target inside it?" },
        { hl: [8, 9, 10, 11], note: "Otherwise the right half is sorted: same question." },
      ],
    },
    {
      problem: "Capacity To Ship Packages Within D Days",
      level: "Medium",
      prompt: "Packages ship in order. Find the smallest ship capacity that delivers everything within D days.",
      approach: ["Capacity is between the heaviest package and the total weight.", "A greedy pass tells you the days needed for a capacity; more capacity never needs more days.", "Binary search for the first capacity that fits."],
      code: `function shipWithinDays(weights: number[], days: number): number {
  const can = (cap: number) => {
    let need = 1, load = 0;
    for (const w of weights) {
      if (load + w > cap) {
        need++;
        load = 0;
      }
      load += w;
    }
    return need <= days;
  };
  let lo = Math.max(...weights), hi = weights.reduce((a, b) => a + b, 0);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (can(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
      complexity: "O(n log(sum)) time, O(1) space",
      beats: [
        { hl: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], note: "Greedy check: fill each day until the next package would overflow." },
        { hl: [12], note: "The answer lies between the heaviest package and the total." },
        { hl: [13, 14, 15, 16, 17], note: "Binary search on the answer for the first capacity that works." },
      ],
    },
  ],
  "prefix-hash": [
    {
      problem: "Group Anagrams",
      level: "Medium",
      prompt: "Group words that are anagrams of each other.",
      approach: ["Anagrams share the same letter counts.", "Join the 26 letter counts into a string key: O(L) per word, no sorting."],
      code: `function groupAnagrams(words: string[]): string[][] {
  const groups = new Map<string, string[]>();
  for (const w of words) {
    const counts = new Array<number>(26).fill(0);
    for (const ch of w) counts[ch.charCodeAt(0) - 97]++;
    const key = counts.join("#");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(w);
  }
  return [...groups.values()];
}`,
      complexity: "O(total characters) time and space",
      beats: [
        { hl: [1], note: "One bucket per letter signature." },
        { hl: [3, 4], note: "Count letters: anagrams produce identical counts." },
        { hl: [5, 6, 7], note: "Join the counts into a string key: Map compares arrays by reference, strings by value." },
      ],
    },
    {
      problem: "Product of Array Except Self",
      level: "Medium",
      prompt: "out[i] = product of every element except nums[i], without division, in O(n).",
      approach: ["out[i] = (product of everything left of i) × (product of everything right of i).", "One pass left to right, one pass right to left, in the output array."],
      code: `function productExceptSelf(nums: number[]): number[] {
  const n = nums.length;
  const out = new Array<number>(n).fill(1);
  let left = 1;
  for (let i = 0; i < n; i++) {
    out[i] = left;
    left *= nums[i];
  }
  let right = 1;
  for (let i = n - 1; i >= 0; i--) {
    out[i] *= right;
    right *= nums[i];
  }
  return out;
}`,
      complexity: "O(n) time, O(1) extra space besides the output",
      beats: [
        { hl: [3, 4, 5, 6, 7], note: "Pass 1: out[i] holds the product of everything to the left." },
        { hl: [8, 9, 10, 11, 12], note: "Pass 2: multiply in the product of everything to the right." },
      ],
    },
  ],
  "monotonic-stack": [
    {
      problem: "Largest Rectangle in Histogram",
      level: "Hard",
      prompt: "Find the area of the largest rectangle in a histogram.",
      approach: ["Keep bars in increasing height on a stack.", "When a shorter bar arrives, each popped bar's rectangle ends here and starts after the new stack top.", "A zero-height sentinel flushes the stack at the end."],
      code: `function largestRectangle(heights: number[]): number {
  const stack: number[] = [];
  let best = 0;
  for (let i = 0; i <= heights.length; i++) {
    const h = i === heights.length ? 0 : heights[i];   // sentinel flushes the stack
    while (stack.length && heights[stack[stack.length - 1]] >= h) {
      const height = heights[stack.pop()!];
      const left = stack.length ? stack[stack.length - 1] + 1 : 0;
      best = Math.max(best, height * (i - left));
    }
    stack.push(i);
  }
  return best;
}`,
      complexity: "O(n) time, O(n) space",
      beats: [
        { hl: [1, 3, 4], note: "Indices with increasing heights; a 0 sentinel flushes everything at the end." },
        { hl: [5, 6, 7, 8, 9], note: "A shorter bar ends every taller rectangle: width runs from the new top + 1 to i." },
        { hl: [10], note: "The current bar may extend further right." },
      ],
    },
    {
      problem: "Remove K Digits",
      level: "Medium",
      prompt: "Remove k digits from a number string to make it as small as possible.",
      approach: ["A bigger digit before a smaller one should go: it makes the number larger.", "Keep a non-decreasing stack of digits.", "Trim leftover removals from the end and strip leading zeros."],
      code: `function removeKdigits(num: string, k: number): string {
  const stack: string[] = [];
  for (const d of num) {
    while (k > 0 && stack.length && stack[stack.length - 1] > d) {
      stack.pop();
      k--;
    }
    stack.push(d);
  }
  stack.length -= k;
  return stack.join("").replace(/^0+/, "") || "0";
}`,
      complexity: "O(n) time, O(n) space",
      beats: [
        { hl: [2, 3, 4, 5, 6, 7, 8], note: "Pop bigger digits that precede a smaller one, while removals remain." },
        { hl: [9], note: "Still owe removals? The tail holds the largest digits: truncate it." },
        { hl: [10], note: "Strip leading zeros; an empty result is \"0\"." },
      ],
    },
  ],
  heap: [
    {
      problem: "Top K Frequent Elements",
      level: "Medium",
      prompt: "Return the k most frequent values, faster than O(n log n).",
      approach: ["Count frequencies.", "Bucket values by frequency: index = count, at most n buckets.", "Read buckets from the highest frequency down."],
      code: `function topKFrequent(nums: number[], k: number): number[] {
  const counts = new Map<number, number>();
  for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1);
  const buckets: number[][] = Array.from({ length: nums.length + 1 }, () => []);
  for (const [x, c] of counts) buckets[c].push(x);
  const out: number[] = [];
  for (let c = buckets.length - 1; c > 0 && out.length < k; c--) {
    for (const x of buckets[c]) {
      out.push(x);
      if (out.length === k) break;
    }
  }
  return out;
}`,
      complexity: "O(n) time and space (bucket sort beats the heap here)",
      beats: [
        { hl: [1, 2], note: "Count every value." },
        { hl: [3, 4], note: "Bucket by frequency: no comparison sort needed." },
        { hl: [6, 7, 8, 9, 10, 11], note: "Walk from the highest frequency until we have k." },
      ],
    },
    {
      problem: "Find Median from Data Stream",
      level: "Hard",
      prompt: "Support add(x) and median() on a stream of numbers.",
      approach: ["A max-heap holds the smaller half, a min-heap the larger half.", "Route every number through the low heap so the halves stay ordered.", "Rebalance so the low half has the same size or one more."],
      code: `class MedianFinder {
  private low = new MinHeap<number>((x, y) => x > y);    // max-heap
  private high = new MinHeap<number>((x, y) => x < y);   // min-heap
  add(x: number): void {
    this.low.push(x);
    this.high.push(this.low.pop()!);
    if (this.high.size > this.low.size) this.low.push(this.high.pop()!);
  }
  median(): number {
    if (this.low.size > this.high.size) return this.low.peek()!;
    return (this.low.peek()! + this.high.peek()!) / 2;
  }
}`,
      complexity: "O(log n) add, O(1) median",
      beats: [
        { hl: [1, 2], note: "low is a max-heap (flip the comparator); high is a min-heap." },
        { hl: [4, 5], note: "Pass every value through low, so low's max ≤ high's min." },
        { hl: [6], note: "Keep low the same size or one bigger." },
        { hl: [9, 10], note: "Median is low's top, or the average of both tops." },
      ],
    },
  ],
  intervals: [
    {
      problem: "Insert Interval",
      level: "Medium",
      prompt: "Insert a new interval into a sorted, non-overlapping list and merge as needed.",
      approach: ["Copy intervals that end before the new one starts.", "Merge every interval that overlaps it.", "Copy the rest."],
      code: `function insert(intervals: number[][], add: number[]): number[][] {
  const out: number[][] = [];
  const n = intervals.length;
  let i = 0;
  while (i < n && intervals[i][1] < add[0]) out.push(intervals[i++]);
  let [start, end] = add;
  while (i < n && intervals[i][0] <= end) {
    start = Math.min(start, intervals[i][0]);
    end = Math.max(end, intervals[i][1]);
    i++;
  }
  out.push([start, end], ...intervals.slice(i));
  return out;
}`,
      complexity: "O(n) time",
      beats: [
        { hl: [4], note: "Everything that ends before the new interval starts." },
        { hl: [5, 6, 7, 8, 9, 10], note: "Absorb every overlapping interval." },
        { hl: [11], note: "Add the merged block, then the rest unchanged." },
      ],
    },
    {
      problem: "Non-overlapping Intervals",
      level: "Medium",
      prompt: "Remove the fewest intervals so the rest do not overlap.",
      approach: ["Sort by end time.", "Keep an interval if it starts after the last kept end; otherwise remove it.", "Earliest end leaves the most room: the classic exchange argument."],
      code: `function eraseOverlapIntervals(intervals: number[][]): number {
  intervals.sort((a, b) => a[1] - b[1]);
  let removed = 0, end = -Infinity;
  for (const [s, e] of intervals) {
    if (s >= end) end = e;
    else removed++;
  }
  return removed;
}`,
      complexity: "O(n log n) time",
      beats: [
        { hl: [1], note: "Sort by end: finishing early leaves the most room." },
        { hl: [4], note: "Starts after the last kept end? Keep it." },
        { hl: [5], note: "Otherwise it overlaps: remove it." },
      ],
    },
  ],
  graphs: [
    {
      problem: "Rotting Oranges",
      level: "Medium",
      prompt: "Each minute, rotten oranges rot their neighbours. How many minutes until none are fresh?",
      approach: ["Multi-source BFS: every rotten orange starts in the queue.", "Each BFS layer is one minute.", "If fresh oranges remain at the end, return −1."],
      code: `function orangesRotting(grid: number[][]): number {
  const rows = grid.length, cols = grid[0].length;
  let q: [number, number][] = [];
  let fresh = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) q.push([r, c]);
      else if (grid[r][c] === 1) fresh++;
    }
  }
  let minutes = 0;
  while (q.length && fresh > 0) {
    const next: [number, number][] = [];
    for (const [r, c] of q) {
      for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] !== 1) continue;
        grid[nr][nc] = 2;
        fresh--;
        next.push([nr, nc]);
      }
    }
    q = next;
    minutes++;
  }
  return fresh === 0 ? minutes : -1;
}`,
      complexity: "O(rows × cols) time and space",
      beats: [
        { hl: [2, 3, 4, 5, 6, 7, 8, 9], note: "All rotten oranges start together; count the fresh ones." },
        { hl: [11, 12, 21, 22], note: "One BFS layer per minute." },
        { hl: [13, 14, 15, 16, 17, 18, 19, 20], note: "Rot fresh neighbours and queue them for the next minute." },
        { hl: [24], note: "Anything still fresh was unreachable." },
      ],
    },
    {
      problem: "Word Ladder",
      level: "Hard",
      prompt: "Shortest transformation from begin to end, changing one letter at a time through dictionary words.",
      approach: ["Words are nodes; one-letter differences are edges.", "Wildcard buckets (h*t) find neighbours without comparing every pair.", "BFS gives the shortest number of steps."],
      code: `function ladderLength(begin: string, end: string, words: string[]): number {
  if (!words.includes(end)) return 0;
  const buckets = new Map<string, string[]>();
  const pattern = (w: string, i: number) => w.slice(0, i) + "*" + w.slice(i + 1);
  for (const w of words) {
    for (let i = 0; i < w.length; i++) {
      const key = pattern(w, i);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(w);
    }
  }
  const q: [string, number][] = [[begin, 1]];
  const seen = new Set([begin]);
  for (let head = 0; head < q.length; head++) {
    const [word, steps] = q[head];
    if (word === end) return steps;
    for (let i = 0; i < word.length; i++) {
      for (const next of buckets.get(pattern(word, i)) ?? []) {
        if (seen.has(next)) continue;
        seen.add(next);
        q.push([next, steps + 1]);
      }
    }
  }
  return 0;
}`,
      complexity: "O(N · L²) time for N words of length L",
      beats: [
        { hl: [2, 3, 4, 5, 6, 7, 8, 9, 10], note: "Wildcard buckets link words one letter apart." },
        { hl: [11, 12, 13, 14, 15], note: "BFS: the first time we reach end is the shortest path." },
        { hl: [16, 17, 18, 19, 20, 21, 22], note: "Neighbours come straight from the buckets; mark visited on push." },
      ],
    },
  ],
  "topo-sort": [
    {
      problem: "Course Schedule II",
      level: "Medium",
      prompt: "Return an order to take all courses, or an empty list if impossible.",
      approach: ["Same Kahn's algorithm as Course Schedule.", "Record the order nodes leave the queue."],
      code: `function findOrder(n: number, prereqs: [number, number][]): number[] {
  const graph: number[][] = Array.from({ length: n }, () => []);
  const indeg = new Array<number>(n).fill(0);
  for (const [course, pre] of prereqs) {
    graph[pre].push(course);
    indeg[course]++;
  }
  const order = [...indeg.keys()].filter((i) => indeg[i] === 0);
  for (let head = 0; head < order.length; head++) {
    for (const next of graph[order[head]]) {
      if (--indeg[next] === 0) order.push(next);
    }
  }
  return order.length === n ? order : [];
}`,
      complexity: "O(V + E) time and space",
      beats: [
        { hl: [1, 2, 3, 4, 5, 6], note: "Edges prerequisite → course; count prerequisites." },
        { hl: [7], note: "Start with courses that need nothing." },
        { hl: [8, 9, 10, 11, 12], note: "Take a course; unlock its dependants." },
        { hl: [13], note: "Missing courses mean a cycle." },
      ],
    },
    {
      problem: "Alien Dictionary",
      level: "Hard",
      prompt: "Words are sorted in an unknown alphabet. Recover a valid letter order.",
      approach: ["Adjacent words reveal one edge: the first letters that differ.", "If a word is followed by its own prefix, the input is invalid.", "Topologically sort the letters."],
      code: `function alienOrder(words: string[]): string {
  const graph = new Map<string, Set<string>>();
  const indeg = new Map<string, number>();
  for (const ch of words.join("")) {
    if (!graph.has(ch)) graph.set(ch, new Set());
    indeg.set(ch, 0);
  }
  for (let k = 0; k + 1 < words.length; k++) {
    const a = words[k], b = words[k + 1];
    let j = 0;
    while (j < a.length && j < b.length && a[j] === b[j]) j++;
    if (j === Math.min(a.length, b.length)) {
      if (a.length > b.length) return "";   // "abc" before "ab" is invalid
      continue;
    }
    if (!graph.get(a[j])!.has(b[j])) {
      graph.get(a[j])!.add(b[j]);
      indeg.set(b[j], indeg.get(b[j])! + 1);
    }
  }
  const order = [...graph.keys()].filter((ch) => indeg.get(ch) === 0);
  for (let head = 0; head < order.length; head++) {
    for (const next of graph.get(order[head])!) {
      indeg.set(next, indeg.get(next)! - 1);
      if (indeg.get(next) === 0) order.push(next);
    }
  }
  return order.length === graph.size ? order.join("") : "";
}`,
      complexity: "O(total characters) time",
      beats: [
        { hl: [7, 8, 9, 10, 15, 16, 17, 18], note: "The first differing letters of neighbours give one ordering edge." },
        { hl: [11, 12, 13, 14], note: "\"abc\" before \"ab\" is impossible: invalid input." },
        { hl: [20, 21, 22, 23, 24, 25, 26], note: "Kahn's algorithm over letters." },
        { hl: [27], note: "Leftover letters mean a cycle." },
      ],
    },
  ],
  "union-find": [
    {
      problem: "Number of Provinces",
      level: "Medium",
      prompt: "Given an adjacency matrix of cities, count connected groups.",
      approach: ["Start with n groups.", "Every successful union merges two groups into one."],
      code: `function findCircleNum(isConnected: number[][]): number {
  const n = isConnected.length;
  const dsu = new DSU(n);
  let groups = n;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (isConnected[i][j] && dsu.union(i, j)) groups--;
    }
  }
  return groups;
}`,
      complexity: "O(n² α(n)) time",
      beats: [
        { hl: [2, 3], note: "Every city starts as its own province." },
        { hl: [4, 5, 6, 7, 8], note: "Each union that actually merges reduces the count." },
      ],
    },
    {
      problem: "Accounts Merge",
      level: "Medium",
      prompt: "Accounts sharing any email belong to one person. Merge them.",
      approach: ["Map each email to the first account that had it.", "When an email repeats, union the two accounts.", "Group emails by their account's root."],
      code: `function accountsMerge(accounts: string[][]): string[][] {
  const dsu = new DSU(accounts.length);
  const owner = new Map<string, number>();
  accounts.forEach(([, ...emails], i) => {
    for (const e of emails) {
      const j = owner.get(e);
      if (j === undefined) owner.set(e, i);
      else dsu.union(i, j);
    }
  });
  const groups = new Map<number, string[]>();
  for (const [e, i] of owner) {
    const root = dsu.find(i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root)!.push(e);
  }
  return [...groups].map(([root, emails]) => [accounts[root][0], ...emails.sort()]);
}`,
      complexity: "O(E log E) for E emails (sorting dominates)",
      beats: [
        { hl: [2, 3, 4, 5, 6, 7, 8, 9], note: "A shared email joins two accounts." },
        { hl: [10, 11, 12, 13, 14, 15], note: "Collect every email under its account's root." },
        { hl: [16], note: "Name plus sorted emails per person." },
      ],
    },
  ],
  backtracking: [
    {
      problem: "Permutations",
      level: "Medium",
      prompt: "Return every ordering of distinct numbers.",
      approach: ["Build the permutation one position at a time.", "Track which numbers are used.", "Undo the choice after exploring."],
      code: `function permute(nums: number[]): number[][] {
  const out: number[][] = [], path: number[] = [];
  const used = new Array<boolean>(nums.length).fill(false);
  const go = (): void => {
    if (path.length === nums.length) {
      out.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      path.push(nums[i]);
      go();
      path.pop();
      used[i] = false;
    }
  };
  go();
  return out;
}`,
      complexity: "O(n · n!) time",
      beats: [
        { hl: [2], note: "used[] replaces the start index from subsets." },
        { hl: [4, 5, 6, 7], note: "Full length: save a copy." },
        { hl: [8, 9, 10, 11, 12, 13, 14, 15], note: "Choose an unused number, recurse, undo both changes." },
      ],
    },
    {
      problem: "N-Queens",
      level: "Hard",
      prompt: "Place n queens so none attack each other. Return every board.",
      approach: ["Place one queen per row.", "Columns and both diagonals (r − c, r + c) go in sets for O(1) checks.", "Undo all three on the way back."],
      code: `function solveNQueens(n: number): string[][] {
  const out: string[][] = [], cols: number[] = [];
  const usedCols = new Set<number>(), diag = new Set<number>(), anti = new Set<number>();
  const go = (r: number): void => {
    if (r === n) {
      out.push(cols.map((c) => ".".repeat(c) + "Q" + ".".repeat(n - c - 1)));
      return;
    }
    for (let c = 0; c < n; c++) {
      if (usedCols.has(c) || diag.has(r - c) || anti.has(r + c)) continue;
      cols.push(c);
      usedCols.add(c); diag.add(r - c); anti.add(r + c);
      go(r + 1);
      cols.pop();
      usedCols.delete(c); diag.delete(r - c); anti.delete(r + c);
    }
  };
  go(0);
  return out;
}`,
      complexity: "O(n!) time in the worst case",
      beats: [
        { hl: [2], note: "Sets for columns and both diagonals." },
        { hl: [4, 5, 6, 7], note: "Every row filled: render the board." },
        { hl: [9], note: "O(1) attack check." },
        { hl: [10, 11, 12, 13, 14], note: "Place, recurse to the next row, then remove." },
      ],
    },
  ],
  "dynamic-programming": [
    {
      problem: "Longest Increasing Subsequence",
      level: "Medium",
      prompt: "Length of the longest strictly increasing subsequence, in O(n log n).",
      approach: ["tails[k] = smallest possible tail of an increasing subsequence of length k + 1.", "For each value, binary search where it fits and replace that tail.", "The length of tails is the answer."],
      code: `function lengthOfLIS(nums: number[]): number {
  const tails: number[] = [];
  for (const x of nums) {
    let lo = 0, hi = tails.length;   // first tail >= x
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = x;   // lo === length extends; otherwise lowers a tail
  }
  return tails.length;
}`,
      complexity: "O(n log n) time, O(n) space",
      beats: [
        { hl: [1], note: "tails stays sorted: the smallest tail for each length." },
        { hl: [3, 4, 5, 6, 7, 8], note: "Binary search the first tail ≥ x (no bisect built in, so write the loop)." },
        { hl: [9], note: "Writing at index length appends; anywhere else it lowers an existing tail." },
      ],
    },
    {
      problem: "Edit Distance",
      level: "Hard",
      prompt: "Fewest inserts, deletes and replacements to turn word a into word b.",
      approach: ["dp[i][j] = edit distance between the first i letters of a and the first j of b.", "Matching letters cost nothing; otherwise 1 + the best of insert, delete or replace."],
      code: `function minDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}`,
      complexity: "O(m · n) time and space",
      beats: [
        { hl: [2], note: "A table over prefixes of both words." },
        { hl: [3, 4], note: "Turning a prefix into empty costs its length." },
        { hl: [7], note: "Same letter: no cost." },
        { hl: [8], note: "Otherwise delete, insert or replace: take the cheapest." },
      ],
    },
  ],
  trie: [
    {
      problem: "Implement Trie",
      level: "Medium",
      prompt: "Support insert, search (whole word) and startsWith.",
      approach: ["Nested dicts, one level per character.", "A '$' key marks the end of a word.", "search and startsWith share one walk."],
      code: `class TrieNode {
  children = new Map<string, TrieNode>();
  end = false;
}

class Trie {
  private root = new TrieNode();
  insert(word: string): void {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch)!;
    }
    node.end = true;
  }
  private walk(s: string): TrieNode | null {
    let node: TrieNode | undefined = this.root;
    for (const ch of s) {
      node = node.children.get(ch);
      if (!node) return null;
    }
    return node;
  }
  search(word: string): boolean {
    return this.walk(word)?.end === true;
  }
  startsWith(prefix: string): boolean {
    return this.walk(prefix) !== null;
  }
}`,
      complexity: "O(L) per operation",
      beats: [
        { hl: [7, 8, 9, 10, 11, 12, 13, 14], note: "Create nodes as needed and mark the end of the word." },
        { hl: [15, 16, 17, 18, 19, 20, 21, 22], note: "One shared walk: null as soon as a letter is missing." },
        { hl: [23, 24, 25], note: "search needs the end marker…" },
        { hl: [26, 27, 28], note: "…startsWith only needs the path." },
      ],
    },
    {
      problem: "Word Search II",
      level: "Hard",
      prompt: "Find every dictionary word that can be traced in a letter grid.",
      approach: ["Build a trie of the words.", "DFS from every cell, following trie edges only.", "Remove found words and dead branches to prune later searches."],
      code: `type WordNode = { kids: Map<string, WordNode>; word?: string };

function findWords(board: string[][], words: string[]): string[] {
  const root: WordNode = { kids: new Map() };
  for (const w of words) {
    let node = root;
    for (const ch of w) {
      if (!node.kids.has(ch)) node.kids.set(ch, { kids: new Map() });
      node = node.kids.get(ch)!;
    }
    node.word = w;
  }
  const rows = board.length, cols = board[0].length, found: string[] = [];
  const dfs = (r: number, c: number, parent: WordNode): void => {
    const ch = board[r][c];
    const node = parent.kids.get(ch);
    if (!node) return;
    if (node.word !== undefined) {
      found.push(node.word);
      node.word = undefined;   // collect each word once
    }
    board[r][c] = "#";
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] !== "#") dfs(nr, nc, node);
    }
    board[r][c] = ch;
    if (node.kids.size === 0 && node.word === undefined) parent.kids.delete(ch);
  };
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) dfs(r, c, root);
  }
  return found;
}`,
      complexity: "O(cells · 4^L) worst case; pruning makes it fast in practice",
      beats: [
        { hl: [3, 4, 5, 6, 7, 8, 9, 10, 11], note: "A trie of all words; the end node stores the word itself." },
        { hl: [14, 15, 16, 17, 18, 19, 20], note: "Follow the trie as we walk; collect a word once." },
        { hl: [21, 22, 23, 24, 25], note: "Mark the cell, explore, unmark." },
        { hl: [26], note: "Prune empty branches so later searches skip them." },
      ],
    },
  ],
  greedy: [
    {
      problem: "Jump Game II",
      level: "Medium",
      prompt: "Fewest jumps to reach the last index.",
      approach: ["Think in BFS layers: every index reachable with j jumps.", "Track the furthest reach of the current layer.", "When you hit the layer's end, jump."],
      code: `function jump(nums: number[]): number {
  let jumps = 0, end = 0, far = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    far = Math.max(far, i + nums[i]);
    if (i === end) {
      jumps++;
      end = far;
    }
  }
  return jumps;
}`,
      complexity: "O(n) time, O(1) space",
      beats: [
        { hl: [1], note: "end = edge of the current layer; far = furthest next layer." },
        { hl: [3], note: "Extend the next layer." },
        { hl: [4, 5, 6, 7], note: "Reached the edge: one more jump, the next layer begins." },
      ],
    },
    {
      problem: "Partition Labels",
      level: "Medium",
      prompt: "Split a string into as many parts as possible so each letter appears in one part only.",
      approach: ["Record the last index of each letter.", "Extend the current part to the furthest last index seen.", "When i reaches that end, close the part."],
      code: `function partitionLabels(s: string): number[] {
  const last = new Map<string, number>();
  for (let i = 0; i < s.length; i++) last.set(s[i], i);
  const sizes: number[] = [];
  let start = 0, end = 0;
  for (let i = 0; i < s.length; i++) {
    end = Math.max(end, last.get(s[i])!);
    if (i === end) {
      sizes.push(end - start + 1);
      start = i + 1;
    }
  }
  return sizes;
}`,
      complexity: "O(n) time, O(1) space",
      beats: [
        { hl: [1, 2], note: "Where each letter appears for the last time." },
        { hl: [6], note: "The part must reach every included letter's last index." },
        { hl: [7, 8, 9, 10], note: "Caught up with the end: close the part." },
      ],
    },
  ],
};
