export interface Probe {
  category: string;
  prompt: string;
}

/** Runs each probe and its variants against the target; a judge scores every reply. */
export async function runSuite(
  probes: Probe[],
  mutate: (prompt: string) => string[],
  target: (prompt: string) => Promise<string>,
  judge: (category: string, reply: string) => Promise<boolean>
) {
  const perCategory = new Map<string, { attempts: number; successes: number }>();
  const failures: { category: string; prompt: string }[] = [];
  for (const probe of probes) {
    const stats = perCategory.get(probe.category) ?? { attempts: 0, successes: 0 };
    perCategory.set(probe.category, stats);
    for (const prompt of [probe.prompt, ...mutate(probe.prompt)]) {
      stats.attempts++;
      if (await judge(probe.category, await target(prompt))) {
        stats.successes++;
        failures.push({ category: probe.category, prompt }); // keep it: tomorrow's regression test
      }
    }
  }
  const attackSuccessRate = new Map([...perCategory].map(([c, s]) => [c, s.successes / s.attempts]));
  return { attackSuccessRate, failures };
}

/** The CI gate: no category may get worse than its baseline. */
export function passesGate(rates: Map<string, number>, baseline: Record<string, number>, margin = 0): boolean {
  return [...rates].every(([category, rate]) => rate <= (baseline[category] ?? 0) + margin);
}
