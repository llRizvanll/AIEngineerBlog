export interface Example {
  input: string;
  output: string;
}

/** Assembles a few-shot prompt: rules first, examples next, the real input last. */
export function buildPrompt(opts: { task: string; examples?: Example[]; schema?: object; reason?: boolean; input: string }): string {
  const parts = [opts.task];
  if (opts.reason) parts.push("Work through the problem step by step, then give the final answer.");
  if (opts.schema) parts.push(`Reply with JSON matching this schema:\n${JSON.stringify(opts.schema)}`);
  for (const e of opts.examples ?? []) parts.push(`Input: ${e.input}\nOutput: ${e.output}`);
  parts.push(`Input: ${opts.input}\nOutput:`);
  return parts.join("\n\n");
}
