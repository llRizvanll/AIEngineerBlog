/* Cross-component UI events. A component that wants something (open search, open the appearance panel)
   dispatches an event; the component that owns that UI listens. Neither imports the other.
   Browser only: call these from event handlers or effects. */

export const UI_EVENTS = {
  search: "pae-search",
  appearance: "pae-appearance",
} as const;

export type UiEvent = (typeof UI_EVENTS)[keyof typeof UI_EVENTS];

const emit = (name: UiEvent) => window.dispatchEvent(new Event(name));

export const openSearch = () => emit(UI_EVENTS.search);
export const openAppearance = () => emit(UI_EVENTS.appearance);

/** Runs [handler] whenever [name] is dispatched. Returns the cleanup function for useEffect. */
export function onUiEvent(name: UiEvent, handler: () => void): () => void {
  window.addEventListener(name, handler);
  return () => window.removeEventListener(name, handler);
}
