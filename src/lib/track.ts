/* One function for product events. It does nothing until an analytics provider is configured. */
type Props = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (command: "event", name: string, params?: Props) => void;
    plausible?: (name: string, options?: { props?: Props }) => void;
  }
}

export function track(name: string, props?: Props): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, props);
  window.plausible?.(name, props ? { props } : undefined);
}
