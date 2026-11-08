/* Compiles every Java template from coding-alt.ts and runs it on small cases. A template that does not compile, or
   gives a wrong answer, fails the build. Kotlin is not compiled here (no Kotlin compiler in CI); it mirrors the Java. */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PATTERNS } from "../../src/content/coding.ts";
import { TEMPLATE_ALT, WORKED_ALT } from "../../src/content/coding-alt.ts";

for (const p of PATTERNS) {
  assert.ok(TEMPLATE_ALT[p.id]?.java && TEMPLATE_ALT[p.id]?.kotlin, `${p.id} template has Kotlin and Java`);
  assert.ok(WORKED_ALT[p.id]?.java && WORKED_ALT[p.id]?.kotlin, `${p.id} worked solution has Kotlin and Java`);
}

const top: string[] = [];
const methods: string[] = [];
/** Splits a snippet into top-level blocks, only at blank lines outside braces, so a class stays whole. */
function blocks(code: string): string[] {
  const out: string[] = [];
  let cur: string[] = [];
  let depth = 0;
  for (const line of code.split("\n")) {
    if (line.trim() === "" && depth === 0) {
      if (cur.length) out.push(cur.join("\n"));
      cur = [];
      continue;
    }
    cur.push(line);
    depth += (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length;
  }
  if (cur.length) out.push(cur.join("\n"));
  return out;
}
for (const p of PATTERNS) {
  for (const block of [...blocks(TEMPLATE_ALT[p.id].java), ...blocks(WORKED_ALT[p.id].java)]) (/^class /.test(block.trim()) ? top : methods).push(block);
}
const src = `import java.util.*;
import java.util.function.*;

public class T {
${methods.join("\n\n")}

  static ListNode list(int... v) { ListNode d = new ListNode(0), t = d; for (int i : v) { t.next = new ListNode(i); t = t.next; } return d.next; }
  static String listStr(ListNode n) { List<Integer> o = new ArrayList<>(); for (; n != null; n = n.next) o.add(n.val); return o.toString(); }

  static void eq(Object a, Object b) { if (!Objects.deepEquals(a, b)) throw new AssertionError(Arrays.deepToString(new Object[] {a}) + " != " + Arrays.deepToString(new Object[] {b})); }

  public static void main(String[] args) {
    eq(pairSum(new int[] {1, 2, 4, 7, 11}, 9), new int[] {1, 3});
    eq(pairSum(new int[] {1, 2}, 9), null);
    eq(longestWindow("abcabcbb"), 3);
    eq(longestWindow("bbbb"), 1);
    ListNode a = new ListNode(1), b = new ListNode(2), c = new ListNode(3);
    a.next = b; b.next = c;
    eq(hasCycle(a), false);
    c.next = a;
    eq(hasCycle(a), true);
    eq(firstTrue(0, 100, x -> x * x >= 50), 8);
    eq(subarraySum(new int[] {1, 1, 1}, 2), 2);
    eq(subarraySum(new int[] {1, 2, 3}, 3), 2);
    eq(nextGreater(new int[] {2, 1, 2, 4, 3}), new int[] {4, 2, 4, -1, -1});
    eq(kLargest(new int[] {3, 1, 5, 12, 2, 11}, 3), new int[] {12, 11, 5});
    eq(merge(new int[][] {{1, 3}, {8, 10}, {2, 6}, {15, 18}}), new int[][] {{1, 6}, {8, 10}, {15, 18}});
    char[][] g = {"..#".toCharArray(), "...".toCharArray(), "#..".toCharArray()};
    eq(shortest(g, new int[] {0, 0}, new int[] {2, 2}), 4);
    eq(shortest(new char[][] {".#.".toCharArray()}, new int[] {0, 0}, new int[] {0, 2}), -1);
    eq(topoOrder(4, new int[][] {{0, 1}, {1, 2}, {0, 3}}), List.of(0, 1, 3, 2));
    eq(topoOrder(2, new int[][] {{0, 1}, {1, 0}}), List.of());
    DSU d = new DSU(5);
    eq(d.union(0, 1), true); eq(d.union(1, 0), false); eq(d.find(0) == d.find(1), true); eq(d.find(0) == d.find(2), false);
    eq(subsets(new int[] {1, 2, 3}).size(), 8);
    eq(minCostClimb(new int[] {10, 15, 20}), 15);
    eq(minCostClimb(new int[] {1, 100, 1, 1, 1, 100, 1, 1, 100, 1}), 6);
    Trie t = new Trie(); t.insert("apple");
    eq(t.startsWith("app"), true); eq(t.startsWith("apx"), false);
    eq(canJump(new int[] {2, 3, 1, 1, 4}), true);
    eq(canJump(new int[] {3, 2, 1, 0, 4}), false);
    eq(threeSum(new int[] {-1, 0, 1, 2, -1, -4}).toString(), "[[-1, -1, 2], [-1, 0, 1]]");
    eq(minWindow("ADOBECODEBANC", "ABC"), "BANC");
    eq(minWindow("a", "b"), "");
    ListNode x = new ListNode(3), y = new ListNode(2), z = new ListNode(0);
    x.next = y; y.next = z; z.next = y;
    eq(detectCycle(x) == y, true);
    eq(detectCycle(new ListNode(1)) == null, true);
    eq(minEatingSpeed(new int[] {3, 6, 7, 11}, 8), 4);
    eq(longestConsecutive(new int[] {100, 4, 200, 1, 3, 2}), 4);
    eq(dailyTemperatures(new int[] {73, 74, 75, 71, 69, 72, 76, 73}), new int[] {1, 1, 4, 2, 1, 1, 0, 0});
    eq(listStr(mergeKLists(new ListNode[] {list(1, 4, 5), list(1, 3, 4), list(2, 6)})), "[1, 1, 2, 3, 4, 4, 5, 6]");
    eq(minRooms(new int[][] {{0, 30}, {5, 10}, {15, 20}}), 2);
    eq(numIslands(new char[][] {"11110".toCharArray(), "11010".toCharArray(), "11000".toCharArray(), "00000".toCharArray()}), 1);
    eq(numIslands(new char[][] {"11000".toCharArray(), "11000".toCharArray(), "00100".toCharArray(), "00011".toCharArray()}), 3);
    eq(canFinish(2, new int[][] {{1, 0}}), true);
    eq(canFinish(2, new int[][] {{1, 0}, {0, 1}}), false);
    eq(findRedundantConnection(new int[][] {{1, 2}, {1, 3}, {2, 3}}), new int[] {2, 3});
    eq(combinationSum(new int[] {2, 3, 6, 7}, 7).toString(), "[[2, 2, 3], [7]]");
    eq(coinChange(new int[] {1, 2, 5}, 11), 3);
    eq(coinChange(new int[] {2}, 3), -1);
    eq(suggestedProducts(new String[] {"mobile", "mouse", "moneypot", "monitor", "mousepad"}, "mouse").toString(), "[[mobile, moneypot, monitor], [mobile, moneypot, monitor], [mouse, mousepad], [mouse, mousepad], [mouse, mousepad]]");
    eq(canCompleteCircuit(new int[] {1, 2, 3, 4, 5}, new int[] {3, 4, 5, 1, 2}), 3);
    eq(canCompleteCircuit(new int[] {2, 3, 4}, new int[] {3, 4, 3}), -1);
    System.out.println("ok");
  }
}

${top.join("\n\n")}
`;
const dir = mkdtempSync(join(tmpdir(), "alt-"));
writeFileSync(join(dir, "T.java"), src);
execFileSync("javac", ["-Xlint:all", "-d", dir, join(dir, "T.java")], { stdio: "pipe" });
const out = execFileSync("java", ["-cp", dir, "T"]).toString().trim();
assert.equal(out, "ok");
console.log(`${PATTERNS.length} templates and ${PATTERNS.length} worked solutions in Java compiled and passed`);
