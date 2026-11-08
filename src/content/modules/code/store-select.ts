/* A tiny store with selector subscriptions, to count re-renders the way a UI library would. */
type Equal<T> = (a: T, b: T) => boolean;

export function createStore<S extends object>(initial: S) {
  let state = initial;
  const subs = new Set<{ run: () => void }>();
  return {
    get: () => state,
    /** Replace part of the state, then tell only the subscribers whose selected value changed. */
    set(patch: Partial<S>) {
      state = { ...state, ...patch };
      subs.forEach((s) => s.run());
    },
    subscribe<T>(selector: (s: S) => T, onChange: (value: T) => void, equal: Equal<T> = Object.is) {
      let last = selector(state);
      const sub = {
        run() {
          const next = selector(state);
          if (!equal(last, next)) {
            last = next;
            onChange(next);
          }
        },
      };
      subs.add(sub);
      return () => subs.delete(sub);
    },
  };
}

/** For selectors that build a new array each time, so the contents decide whether anything changed. */
export const shallowEqualArray = <T>(a: T[], b: T[]) => a.length === b.length && a.every((x, i) => Object.is(x, b[i]));
