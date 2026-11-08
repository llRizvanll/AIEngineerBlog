/* Compiles every Java template from coding-alt.ts and runs it on small cases. A template that does not compile, or
   gives a wrong answer, fails the build. Kotlin is not compiled here (no Kotlin compiler in CI); it mirrors the Java. */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PATTERNS } from "../../src/content/coding.ts";
import { TEMPLATE_ALT } from "../../src/content/coding-alt.ts";

for (const p of PATTERNS) assert.ok(TEMPLATE_ALT[p.id]?.java && TEMPLATE_ALT[p.id]?.kotlin, `${p.id} has Kotlin and Java`);

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
  for (const block of blocks(TEMPLATE_ALT[p.id].java)) (/^class /.test(block.trim()) ? top : methods).push(block);
}
const src = `import java.util.*;
import java.util.function.*;

public class T {
${methods.join("\n\n")}

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
console.log(`${PATTERNS.length} Java templates compiled and passed`);
