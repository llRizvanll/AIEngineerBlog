/** Every command carries a tag. "*" lines are data, and the final line repeats the tag. */
export function parseImapLine(line: string) {
  const [tag, status, ...rest] = line.trimEnd().split(" ");
  return tag === "*"
    ? { kind: "untagged" as const, tag, data: [status, ...rest].join(" ") }
    : { kind: "tagged" as const, tag, status, data: rest.join(" ") };
}

/** Lets many commands run at once: replies find their command by tag. */
export class Session {
  private next = 1;
  private waiting = new Map<string, { command: string; data: string[] }>();
  private untagged: string[] = [];

  send(command: string): string {
    const tag = "a" + String(this.next++).padStart(3, "0");
    this.waiting.set(tag, { command, data: [] });
    return `${tag} ${command}\r\n`;
  }

  receive(line: string): { tag: string; status: string; data: string[] } | null {
    const p = parseImapLine(line);
    if (p.kind === "untagged") {
      this.untagged.push(p.data);
      return null;
    }
    this.waiting.delete(p.tag);
    const data = this.untagged;
    this.untagged = [];
    return { tag: p.tag, status: p.status, data };
  }
}
