import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;

/**
 * The changes a list needs to animate from old to new: deletions (old indices),
 * insertions (new indices), moves and in-place reloads.
 */
public record ListDiff(List<Integer> deletes, List<Integer> inserts, List<Move> moves, List<Integer> reloads) {
  public record Move(int from, int to) {}

  public boolean isEmpty() {
    return deletes.isEmpty() && inserts.isEmpty() && moves.isEmpty() && reloads.isEmpty();
  }

  /**
   * O(n log n) diff keyed by identity. Items that keep their relative order stay put
   * (the longest increasing subsequence); only the others are reported as moves.
   */
  public static <T, ID> ListDiff diff(List<T> old, List<T> next, Function<T, ID> idOf) {
    Map<ID, Integer> oldIndex = new HashMap<>();
    for (int i = 0; i < old.size(); i++) oldIndex.put(idOf.apply(old.get(i)), i);
    Set<ID> newIds = new HashSet<>();
    for (T item : next) newIds.add(idOf.apply(item));
    List<Integer> deletes = new ArrayList<>();
    for (int i = 0; i < old.size(); i++) if (!newIds.contains(idOf.apply(old.get(i)))) deletes.add(i);

    List<Integer> inserts = new ArrayList<>();
    List<Integer> reloads = new ArrayList<>();
    List<int[]> survivors = new ArrayList<>();         // {old index, new index} in new order
    for (int j = 0; j < next.size(); j++) {
      T item = next.get(j);
      Integer i = oldIndex.get(idOf.apply(item));
      if (i == null) {
        inserts.add(j);
      } else {
        survivors.add(new int[] {i, j});
        if (!old.get(i).equals(item)) reloads.add(j);
      }
    }

    List<Integer> oldIndices = new ArrayList<>();
    for (int[] s : survivors) oldIndices.add(s[0]);
    Set<Integer> stay = new HashSet<>(longestIncreasingSubsequence(oldIndices));
    List<Move> moves = new ArrayList<>();
    for (int k = 0; k < survivors.size(); k++) {
      if (!stay.contains(k)) moves.add(new Move(survivors.get(k)[0], survivors.get(k)[1]));
    }
    return new ListDiff(deletes, inserts, moves, reloads);
  }

  /** Indices (into [values]) of one longest strictly increasing subsequence. Patience sorting. */
  public static List<Integer> longestIncreasingSubsequence(List<Integer> values) {
    List<Integer> tails = new ArrayList<>();           // index of the smallest tail for each length
    int[] previous = new int[values.size()];
    java.util.Arrays.fill(previous, -1);
    for (int i = 0; i < values.size(); i++) {
      int v = values.get(i);
      int lo = 0, hi = tails.size();
      while (lo < hi) {                                // first tail >= v
        int mid = (lo + hi) >>> 1;
        if (values.get(tails.get(mid)) < v) lo = mid + 1;
        else hi = mid;
      }
      if (lo > 0) previous[i] = tails.get(lo - 1);
      if (lo == tails.size()) tails.add(i);
      else tails.set(lo, i);
    }
    Deque<Integer> out = new ArrayDeque<>();
    int k = tails.isEmpty() ? -1 : tails.get(tails.size() - 1);
    while (k >= 0) {
      out.addFirst(k);
      k = previous[k];
    }
    return new ArrayList<>(out);
  }
}
