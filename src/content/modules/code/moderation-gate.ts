export interface Verdict {
  allow: boolean;
  categories: string[];
  reason: "safe" | "unsafe" | "blocked-category" | "classifier-error";
}

/** Llama Guard replies "safe" or "unsafe" followed by category codes such as "S1,S10". */
export function parseGuardOutput(text: string): { safe: boolean; categories: string[] } {
  const [first, second = ""] = text.trim().split("\n");
  const safe = first.trim().toLowerCase() === "safe";
  return { safe, categories: safe ? [] : second.split(",").map((c) => c.trim()).filter(Boolean) };
}

/** Runs before the main model. allowed lists categories this product accepts despite the flag. */
export async function gate(input: string, classify: (text: string) => Promise<string>, allowed: string[] = [], failOpen = false): Promise<Verdict> {
  try {
    const { safe, categories } = parseGuardOutput(await classify(input));
    if (safe) return { allow: true, categories: [], reason: "safe" };
    const blocked = categories.filter((c) => !allowed.includes(c));
    if (categories.length > 0 && blocked.length === 0) return { allow: true, categories, reason: "safe" };
    return { allow: false, categories: blocked, reason: blocked.length ? "blocked-category" : "unsafe" };
  } catch {
    // Actions fail closed. A read-only product can choose to fail open.
    return { allow: failOpen, categories: [], reason: "classifier-error" };
  }
}
